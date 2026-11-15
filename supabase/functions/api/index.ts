/**
 * HISTORY – Harshana Nallaperuma
 * Supabase Edge Function: the admin dashboard API (replaces the Cloudflare Worker).
 *
 * Uses (auto-provided by Supabase):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEYS)
 *
 * Secrets you set yourself (Dashboard → Edge Functions → Secrets):
 *   ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_SECRET
 * Optional:
 *   ALLOWED_ORIGINS  e.g. "https://your-site.vercel.app,https://yourdomain.com"
 *                    (leave unset to allow any origin)
 *
 * Storage: bucket "papers" (public) holds the uploaded PDFs.
 *
 * Deploy:  npx supabase functions deploy api --no-verify-jwt
 */

import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const OWNER_ID = 'owner';
const BUCKET = 'papers';

const VALID_TERMS = new Set(['first', 'second', 'third', 'annual', 'other']);
const VALID_TYPES = new Set(['paper', 'answers', 'notes', 'model']);
const VALID_STATUS = new Set(['pending', 'approved', 'rejected']);

const te = new TextEncoder();

/* ------------------------------- helpers --------------------------------- */

const envGet = (key: string): string => {
  try {
    return Deno.env.get(key) || '';
  } catch {
    return '';
  }
};

function serviceKey(): string {
  const direct = envGet('SUPABASE_SERVICE_ROLE_KEY') || envGet('SUPABASE_SECRET_KEY');
  if (direct) return direct;
  const bag = envGet('SUPABASE_SECRET_KEYS') || envGet('SUPABASE_SECRET_KEY_JSON');
  if (bag) {
    try {
      const parsed = JSON.parse(bag) as Record<string, string>;
      return parsed.default || Object.values(parsed)[0] || '';
    } catch {
      return '';
    }
  }
  return '';
}

let cachedClient: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (!cachedClient) {
    const url = envGet('SUPABASE_URL');
    const key = serviceKey();
    if (!url || !key) throw new Error('missing_supabase_credentials');
    cachedClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedClient;
}

type Cors = Record<string, string>;

function corsHeaders(request: Request): Cors {
  const configured = envGet('ALLOWED_ORIGINS')
    .split(',')
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const origin = request.headers.get('origin') || '';
  const headers: Cors = {
    vary: 'Origin',
    'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'access-control-allow-headers': 'content-type, x-admin-token',
    'access-control-max-age': '86400',
  };

  if (configured.length === 0 || configured.includes('*')) {
    headers['access-control-allow-origin'] = '*';
  } else if (origin && configured.includes(origin.replace(/\/$/, ''))) {
    headers['access-control-allow-origin'] = origin;
  }

  return headers;
}

const json = (cors: Cors, data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...cors,
    },
  });

function b64url(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) out += String.fromCharCode(bytes[i]);
  return btoa(out).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function toB64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) out += String.fromCharCode(bytes[i]);
  return btoa(out);
}

function fromB64(value: string): Uint8Array {
  const raw = atob(value);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function safeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function sign(value: string): Promise<string> {
  const secret = envGet('SESSION_SECRET') || 'hn-history-session-secret';
  const key = await crypto.subtle.importKey(
    'raw',
    te.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, te.encode(value))));
}

async function derive(
  password: string,
  saltB64?: string | null,
): Promise<{ hash: string; salt: string }> {
  const salt = saltB64 ? fromB64(saltB64) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', te.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' },
    key,
    256,
  );
  return { hash: toB64(new Uint8Array(bits)), salt: toB64(new Uint8Array(salt)) };
}

const ownerUsername = () => envGet('ADMIN_USERNAME') || 'history';
const ownerPassword = () => envGet('ADMIN_PASSWORD') || 'HN';

function ownerAccount() {
  return {
    id: OWNER_ID,
    name: 'Default Admin',
    username: ownerUsername(),
    status: 'approved',
    role: 'owner',
    createdAt: 0,
    approvedAt: 0,
    approvedBy: '',
  };
}

function mapAdmin(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    status: row.status,
    role: 'admin',
    createdAt: row.created_at,
    approvedAt: row.approved_at || null,
    approvedBy: row.approved_by || '',
  };
}

function mapPaper(row: Record<string, unknown>) {
  const fileKey = (row.file_key as string | null) || null;
  const publicUrl = fileKey
    ? `${envGet('SUPABASE_URL')}/storage/v1/object/public/${BUCKET}/${fileKey}`
    : '';
  return {
    id: row.id,
    title: row.title,
    grade: row.grade,
    year: row.year,
    term: row.term,
    type: row.type,
    school: row.school || '',
    medium: row.medium || 'Sinhala',
    link: fileKey ? publicUrl : row.drive_url || '',
    hasFile: Boolean(fileKey),
    isSample: Boolean(row.is_sample),
    createdAt: Number(row.created_at),
  };
}

/* --------------------------------- data ---------------------------------- */

async function selectOne(table: string, column: string, value: string) {
  const { data, error } = await db().from(table).select('*').eq(column, value).limit(1);
  if (error) throw error;
  return (data && data[0]) || null;
}

async function listPapers() {
  const { data, error } = await db()
    .from('papers')
    .select('*')
    .order('year', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapPaper);
}

/* -------------------------------- sessions -------------------------------- */

async function issueToken(adminId: string): Promise<string> {
  const payload = `${adminId}.${Date.now() + SESSION_TTL_MS}`;
  return `${payload}.${await sign(payload)}`;
}

async function currentAdmin(request: Request) {
  const raw = (request.headers.get('x-admin-token') || '').trim();
  if (!raw) return null;

  const lastDot = raw.lastIndexOf('.');
  if (lastDot < 0) return null;
  const signature = raw.slice(lastDot + 1);
  const payload = raw.slice(0, lastDot);
  const sep = payload.lastIndexOf('.');
  if (sep < 0) return null;

  const id = payload.slice(0, sep);
  const expires = Number(payload.slice(sep + 1));
  if (!id || !Number.isFinite(expires) || expires < Date.now()) return null;

  const expected = await sign(payload);
  if (!safeEqual(expected, signature)) return null;

  if (id === OWNER_ID) {
    return { id: OWNER_ID, role: 'owner', name: ownerAccount().name, username: ownerUsername() };
  }

  const row = await selectOne('admins', 'id', id);
  if (!row || row.status !== 'approved') return null;
  return { id: String(row.id), role: 'admin', name: row.name, username: row.username };
}

/* --------------------------------- papers -------------------------------- */

async function createPaper(request: Request, cors: Cors) {
  const contentType = request.headers.get('content-type') || '';
  let fields: Record<string, string> = {};
  let file: File | null = null;

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    for (const [key, value] of form.entries()) {
      if (typeof value === 'string') fields[key] = value;
    }
    const candidate = form.get('file');
    if (candidate && typeof candidate !== 'string' && candidate.size > 0) {
      file = candidate as File;
    }
  } else {
    fields = (await request.json().catch(() => ({}))) as Record<string, string>;
  }

  const title = String(fields.title || '').trim().slice(0, 200);
  const grade = Number(fields.grade);
  const year = Number(fields.year);
  const term = String(fields.term || 'other');
  const type = String(fields.type || 'paper');
  const school = String(fields.school || '').trim().slice(0, 120);
  const medium = String(fields.medium || 'Sinhala').trim().slice(0, 40);
  const driveUrl = String(fields.driveUrl || '').trim();

  if (title.length < 3) return json(cors, { error: 'title_required' }, 400);
  if (!Number.isInteger(grade) || grade < 6 || grade > 11) {
    return json(cors, { error: 'invalid_grade' }, 400);
  }
  if (!Number.isInteger(year) || year < 2010 || year > 2100) {
    return json(cors, { error: 'invalid_year' }, 400);
  }

  const id = crypto.randomUUID();

  if (file) {
    if (file.size > MAX_UPLOAD_BYTES) return json(cors, { error: 'file_too_large' }, 413);
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(String(file.name || ''));
    if (!isPdf) return json(cors, { error: 'invalid_file_type' }, 400);

    const fileKey = `${id}.pdf`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: uploadError } = await db()
      .storage.from(BUCKET)
      .upload(fileKey, bytes, { contentType: 'application/pdf', upsert: false });
    if (uploadError) throw new Error(`upload_failed: ${uploadError.message}`);

    const { error } = await db().from('papers').insert({
      id,
      title,
      grade,
      year,
      term: VALID_TERMS.has(term) ? term : 'other',
      type: VALID_TYPES.has(type) ? type : 'paper',
      school,
      medium,
      drive_url: '',
      file_key: fileKey,
      is_sample: false,
      created_at: Date.now(),
    });
    if (error) {
      await db().storage.from(BUCKET).remove([fileKey]).catch(() => {});
      throw error;
    }

    return json(cors, { ok: true, id }, 201);
  }

  if (!/^https?:\/\//i.test(driveUrl)) return json(cors, { error: 'link_required' }, 400);

  const { error } = await db().from('papers').insert({
    id,
    title,
    grade,
    year,
    term: VALID_TERMS.has(term) ? term : 'other',
    type: VALID_TYPES.has(type) ? type : 'paper',
    school,
    medium,
    drive_url: driveUrl,
    file_key: null,
    is_sample: false,
    created_at: Date.now(),
  });
  if (error) throw error;

  return json(cors, { ok: true, id }, 201);
}

async function deletePaper(id: string, cors: Cors) {
  const row = await selectOne('papers', 'id', id);
  if (!row) return json(cors, { error: 'not_found' }, 404);
  if (row.file_key) {
    await db()
      .storage.from(BUCKET)
      .remove([row.file_key as string])
      .catch(() => {});
  }
  const { error } = await db().from('papers').delete().eq('id', id);
  if (error) throw error;
  return json(cors, { ok: true });
}

async function serveFile(url: URL, id: string) {
  const row = await selectOne('papers', 'id', id);
  if (!row || !row.file_key) return new Response('Not found', { status: 404 });

  const { data, error } = await db().storage.from(BUCKET).download(row.file_key as string);
  if (error || !data) return new Response('Not found', { status: 404 });

  const download = url.searchParams.get('download') === '1';
  return new Response(data, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `${download ? 'attachment' : 'inline'}; filename="history-paper-${id}.pdf"`,
      'cache-control': 'public, max-age=3600',
    },
  });
}

/* --------------------------------- admins -------------------------------- */

const USERNAME_PATTERN = /^[a-zA-Z0-9._]{3,24}$/;
const usernameLower = (value: string) => value.trim().toLowerCase();

async function listAdmins() {
  const { data, error } = await db()
    .from('admins')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return [ownerAccount(), ...(data || []).map(mapAdmin)];
}

async function usernameTaken(username: string, ignoreId?: string) {
  if (safeEqual(usernameLower(username), ownerUsername().toLowerCase())) return true;
  const { data, error } = await db()
    .from('admins')
    .select('id')
    .eq('username_lower', usernameLower(username))
    .limit(1);
  if (error) throw error;
  const row = (data && data[0]) || null;
  return Boolean(row && row.id !== ignoreId);
}

async function registerAdmin(request: Request, cors: Cors) {
  const body = (await request.json().catch(() => ({}))) as Record<string, string>;
  const name = String(body.name || '').trim().slice(0, 80);
  const username = String(body.username || '').trim();
  const password = String(body.password || '');

  if (name.length < 2) return json(cors, { error: 'name_required' }, 400);
  if (!USERNAME_PATTERN.test(username)) return json(cors, { error: 'invalid_username' }, 400);
  if (password.length < 6) return json(cors, { error: 'weak_password' }, 400);
  if (await usernameTaken(username)) return json(cors, { error: 'username_taken' }, 409);

  const { hash, salt } = await derive(password);
  const { error } = await db().from('admins').insert({
    id: crypto.randomUUID(),
    name,
    username,
    password_hash: hash,
    salt,
    status: 'pending',
    created_at: Date.now(),
  });
  if (error) throw error;

  return json(cors, { ok: true, status: 'pending' }, 201);
}

async function createAdmin(request: Request, cors: Cors) {
  const body = (await request.json().catch(() => ({}))) as Record<string, string>;
  const name = String(body.name || '').trim().slice(0, 80);
  const username = String(body.username || '').trim();
  const password = String(body.password || '');

  if (name.length < 2) return json(cors, { error: 'name_required' }, 400);
  if (!USERNAME_PATTERN.test(username)) return json(cors, { error: 'invalid_username' }, 400);
  if (password.length < 6) return json(cors, { error: 'weak_password' }, 400);
  if (await usernameTaken(username)) return json(cors, { error: 'username_taken' }, 409);

  const { hash, salt } = await derive(password);
  const id = crypto.randomUUID();
  const now = Date.now();
  const { error } = await db().from('admins').insert({
    id,
    name,
    username,
    password_hash: hash,
    salt,
    status: 'approved',
    created_at: now,
    approved_at: now,
    approved_by: 'owner',
  });
  if (error) throw error;

  return json(cors, { ok: true, id }, 201);
}

async function updateAdmin(request: Request, id: string, cors: Cors) {
  if (id === OWNER_ID) return json(cors, { error: 'owner_protected' }, 400);
  const row = await selectOne('admins', 'id', id);
  if (!row) return json(cors, { error: 'not_found' }, 404);

  const body = (await request.json().catch(() => ({}))) as Record<string, string>;
  const name =
    body.name === undefined ? String(row.name) : String(body.name || '').trim().slice(0, 80);
  const username = body.username === undefined ? String(row.username) : String(body.username).trim();
  const status = body.status === undefined ? String(row.status) : String(body.status);
  const password = body.password ? String(body.password) : '';

  if (name.length < 2) return json(cors, { error: 'name_required' }, 400);
  if (!USERNAME_PATTERN.test(username)) return json(cors, { error: 'invalid_username' }, 400);
  if (!VALID_STATUS.has(status)) return json(cors, { error: 'invalid_status' }, 400);
  if (password && password.length < 6) return json(cors, { error: 'weak_password' }, 400);
  if (
    usernameLower(username) !== usernameLower(String(row.username)) &&
    (await usernameTaken(username, id))
  ) {
    return json(cors, { error: 'username_taken' }, 409);
  }

  const patch: Record<string, unknown> = { name, username, status };

  if (password) {
    const derived = await derive(password);
    patch.password_hash = derived.hash;
    patch.salt = derived.salt;
  }

  patch.approved_at = status === 'approved' ? row.approved_at || Date.now() : row.approved_at;
  patch.approved_by = status === 'approved' ? row.approved_by || 'owner' : row.approved_by;

  const { error } = await db().from('admins').update(patch).eq('id', id);
  if (error) throw error;

  return json(cors, { ok: true });
}

async function deleteAdmin(id: string, cors: Cors) {
  if (id === OWNER_ID) return json(cors, { error: 'owner_protected' }, 400);
  const row = await selectOne('admins', 'id', id);
  if (!row) return json(cors, { error: 'not_found' }, 404);
  const { error } = await db().from('admins').delete().eq('id', id);
  if (error) throw error;
  return json(cors, { ok: true });
}

async function changeOwnPassword(
  request: Request,
  admin: { id: string; role: string },
  cors: Cors,
) {
  if (admin.role === 'owner') return json(cors, { error: 'owner_protected' }, 400);
  const body = (await request.json().catch(() => ({}))) as Record<string, string>;
  const currentPassword = String(body.currentPassword || '');
  const newPassword = String(body.newPassword || '');

  if (newPassword.length < 6) return json(cors, { error: 'weak_password' }, 400);

  const row = await selectOne('admins', 'id', admin.id);
  if (!row) return json(cors, { error: 'unauthorized' }, 401);

  const { hash } = await derive(currentPassword, String(row.salt));
  if (!safeEqual(hash, String(row.password_hash))) {
    return json(cors, { error: 'invalid_current_password' }, 400);
  }

  const derived = await derive(newPassword);
  const { error } = await db()
    .from('admins')
    .update({ password_hash: derived.hash, salt: derived.salt })
    .eq('id', admin.id);
  if (error) throw error;

  return json(cors, { ok: true });
}

/* -------------------------------- routing -------------------------------- */

/**
 * Turn whatever the gateway hands us into a clean API path, no matter how
 * many slashes or prefixes it adds:
 *   /papers                          -> /papers
 *   /papers/  ·  //papers            -> /papers
 *   /api/papers                      -> /papers
 *   /functions/v1/api/papers         -> /papers
 *   /functions/v1/api/papers/        -> /papers
 *   /functions/v1/api   ·  /         -> /
 */
function routePath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);

  const v1 = segments.indexOf('v1');
  if (v1 > 0 && segments[v1 - 1] === 'functions') {
    // drop "functions/v1/<function-name>"
    segments.splice(0, Math.min(segments.length, v1 + 2));
  }

  // drop a leftover function-name segment (e.g. /api/papers)
  if (segments[0] === 'api') segments.shift();

  return `/${segments.join('/')}`;
}

async function handleApi(request: Request, url: URL, cors: Cors): Promise<Response> {
  const pathname = routePath(url.pathname);
  const method = request.method.toUpperCase();

  if (method === 'GET' && pathname === '/') {
    return json(cors, {
      ok: true,
      api: 'history-harshana',
      version: 'v3',
      routes: ['/papers', '/files/:id', '/admin/session', '/admin/login'],
      receivedPath: url.pathname,
    });
  }

  if (method === 'GET' && pathname === '/papers') {
    return json(cors, { papers: await listPapers() });
  }

  if (method === 'GET' && pathname === '/admin/session') {
    const admin = await currentAdmin(request);
    return json(cors, { authenticated: Boolean(admin), admin: admin || null });
  }

  if (method === 'POST' && pathname === '/admin/login') {
    const body = (await request.json().catch(() => ({}))) as Record<string, string>;
    const username = String(body.username || '').trim();
    const password = String(body.password || '');

    if (safeEqual(username, ownerUsername()) && safeEqual(password, ownerPassword())) {
      return json(cors, { ok: true, admin: ownerAccount(), token: await issueToken(OWNER_ID) });
    }

    const { data, error } = await db()
      .from('admins')
      .select('*')
      .eq('username_lower', usernameLower(username))
      .limit(1);
    if (error) throw error;

    const row = (data && data[0]) || null;
    if (!row) {
      await sleep(400);
      return json(cors, { error: 'invalid_credentials' }, 401);
    }

    const { hash } = await derive(password, String(row.salt));
    if (!safeEqual(hash, String(row.password_hash))) {
      await sleep(400);
      return json(cors, { error: 'invalid_credentials' }, 401);
    }

    if (row.status === 'pending') return json(cors, { error: 'pending_approval' }, 403);
    if (row.status !== 'approved') return json(cors, { error: 'account_rejected' }, 403);

    return json(cors, {
      ok: true,
      admin: mapAdmin(row),
      token: await issueToken(String(row.id)),
    });
  }

  if (method === 'POST' && pathname === '/admin/register') {
    return registerAdmin(request, cors);
  }

  if (method === 'POST' && pathname === '/admin/logout') {
    return json(cors, { ok: true });
  }

  const admin = await currentAdmin(request);
  const unauthorized = () => json(cors, { error: 'unauthorized' }, 401);
  const forbidden = () => json(cors, { error: 'forbidden' }, 403);

  if (method === 'GET' && pathname === '/admin/papers') {
    if (!admin) return unauthorized();
    return json(cors, { papers: await listPapers() });
  }

  if (method === 'POST' && pathname === '/admin/papers') {
    if (!admin) return unauthorized();
    return createPaper(request, cors);
  }

  const paperItem = pathname.match(/^\/admin\/papers\/([\w-]+)$/);
  if (paperItem && method === 'DELETE') {
    if (!admin) return unauthorized();
    return deletePaper(paperItem[1], cors);
  }

  if (method === 'GET' && pathname === '/admin/admins') {
    if (!admin) return unauthorized();
    if (admin.role !== 'owner') return forbidden();
    return json(cors, { admins: await listAdmins() });
  }

  if (method === 'POST' && pathname === '/admin/admins') {
    if (!admin) return unauthorized();
    if (admin.role !== 'owner') return forbidden();
    return createAdmin(request, cors);
  }

  const adminItem = pathname.match(/^\/admin\/admins\/([\w-]+)$/);
  if (adminItem && method === 'PATCH') {
    if (!admin) return unauthorized();
    if (admin.role !== 'owner') return forbidden();
    return updateAdmin(request, adminItem[1], cors);
  }
  if (adminItem && method === 'DELETE') {
    if (!admin) return unauthorized();
    if (admin.role !== 'owner') return forbidden();
    return deleteAdmin(adminItem[1], cors);
  }

  if (method === 'POST' && pathname === '/admin/account/password') {
    if (!admin) return unauthorized();
    return changeOwnPassword(request, admin, cors);
  }

  const fileRoute = pathname.match(/^\/files\/([\w-]+)$/);
  if (fileRoute && method === 'GET') {
    return serveFile(url, fileRoute[1]);
  }

  return json(cors, { error: 'not_found', path: pathname, receivedPath: url.pathname }, 404);
}

Deno.serve(async (request: Request) => {
  const cors = corsHeaders(request);

  if (request.method.toUpperCase() === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    return await handleApi(request, new URL(request.url), cors);
  } catch (error) {
    console.error('function_error', error instanceof Error ? error.message : error);
    return json(cors, { error: 'server_error' }, 500);
  }
});
