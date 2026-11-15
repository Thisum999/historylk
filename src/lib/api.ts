export type Paper = {
  id: string;
  title: string;
  grade: number;
  year: number;
  term: string;
  type: string;
  school: string;
  medium: string;
  link: string;
  hasFile: boolean;
  isSample: boolean;
  createdAt: number;
};

export type AdminRole = 'owner' | 'admin';
export type AdminStatus = 'approved' | 'pending' | 'rejected';

export type AdminUser = {
  id: string;
  name: string;
  username: string;
  status: AdminStatus;
  role: AdminRole;
  createdAt: number;
  approvedAt: number | null;
  approvedBy: string;
};

export type SessionInfo = {
  authenticated: boolean;
  admin: AdminUser | null;
};

export const TERMS: Record<string, string> = {
  first: 'පළමු වාරය',
  second: 'දෙවන වාරය',
  third: 'තෙවන වාරය',
  annual: 'වාර්ෂික පරීක්ෂණය',
  other: 'වෙනත්',
};

export const TYPES: Record<string, string> = {
  paper: 'ප්‍රශ්න පත්‍රය',
  answers: 'පිළිතුරු පත්‍රය',
  notes: 'සටහන්',
  model: 'ආදර්ශ පත්‍රය',
};

export const STATUS_LABELS: Record<AdminStatus, string> = {
  approved: 'අනුමත',
  pending: 'අනුමැතිය බලාපොරොත්තුවෙන්',
  rejected: 'ප්‍රතික්ෂේප',
};

const env = import.meta.env as unknown as Record<string, string | undefined>;

/**
 * The backend is a Supabase Edge Function called "api":
 *   https://<project-ref>.supabase.co/functions/v1/api
 * VITE_SUPABASE_URL comes from .env (or Vercel environment variables).
 * VITE_API_BASE overrides it if you ever move the API elsewhere.
 */
const supabaseUrl = (env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
export const API_BASE =
  (env.VITE_API_BASE || '').replace(/\/+$/, '') ||
  (supabaseUrl ? `${supabaseUrl}/functions/v1/api` : '/api');

const TOKEN_KEY = 'hn_admin_token';

function readToken(): string {
  try {
    return window.localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

function saveToken(token: string | null) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage blocked – session simply won't survive a refresh */
  }
}

export class ApiError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = readToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'content-type': 'application/json' }),
      ...(token ? { 'x-admin-token': token } : {}),
      ...(init?.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError((data && (data as { error?: string }).error) || 'request_failed');
  }
  return data as T;
}

export async function getPapers(): Promise<Paper[]> {
  const data = await request<{ papers: Paper[] }>('/papers');
  return data.papers || [];
}

export async function getSession(): Promise<SessionInfo> {
  if (!readToken()) return { authenticated: false, admin: null };
  try {
    const data = await request<SessionInfo>('/admin/session');
    if (!data.authenticated) saveToken(null);
    return { authenticated: Boolean(data.authenticated), admin: data.admin || null };
  } catch {
    return { authenticated: false, admin: null };
  }
}

export async function login(username: string, password: string): Promise<AdminUser | null> {
  const data = await request<{ admin?: AdminUser; token?: string }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (data.token) saveToken(data.token);
  return data.admin || null;
}

export async function logout(): Promise<void> {
  try {
    await request('/admin/logout', { method: 'POST' });
  } finally {
    saveToken(null);
  }
}

export async function registerAdmin(payload: {
  name: string;
  username: string;
  password: string;
}): Promise<void> {
  await request('/admin/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAdmins(): Promise<AdminUser[]> {
  const data = await request<{ admins: AdminUser[] }>('/admin/admins');
  return data.admins || [];
}

export async function createAdmin(payload: {
  name: string;
  username: string;
  password: string;
}): Promise<void> {
  await request('/admin/admins', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateAdmin(
  id: string,
  payload: { name?: string; username?: string; password?: string; status?: AdminStatus },
): Promise<void> {
  await request(`/admin/admins/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteAdmin(id: string): Promise<void> {
  await request(`/admin/admins/${id}`, { method: 'DELETE' });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await request('/admin/account/password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function createPaper(form: FormData): Promise<void> {
  await request('/admin/papers', { method: 'POST', body: form });
}

export async function removePaper(id: string): Promise<void> {
  await request(`/admin/papers/${id}`, { method: 'DELETE' });
}

export function downloadHref(paper: Paper): string {
  return paper.hasFile ? `${API_BASE}/files/${paper.id}?download=1` : paper.link;
}

export function errorMessage(code: string): string {
  switch (code) {
    case 'invalid_credentials':
      return 'පරිශීලක නාමය හෝ මුරපදය වැරදිය. නැවත උත්සාහ කරන්න.';
    case 'pending_approval':
      return 'ඔබේ ගිණුම තවම අනුමත වී නැත. ප්‍රධාන පරිපාලක අනුමත කළ පසු පිවිසිය හැක.';
    case 'account_rejected':
      return 'ඔබේ ගිණුම් ඉල්ලුම ප්‍රතික්ෂේප වී ඇත. ප්‍රධාන පරිපාලක අමතන්න.';
    case 'forbidden':
      return 'මෙම ක්‍රියාව සඳහා අවසර නැත. ප්‍රධාන පරිපාලකට පමණි.';
    case 'owner_protected':
      return 'ප්‍රධාන පරිපාලක ගිණුම වෙනස් කළ නොහැක.';
    case 'name_required':
      return 'නම ඇතුළත් කරන්න.';
    case 'invalid_username':
      return 'පරිශීලක නාමය අකුරු 3–24ක් විය යුතුය (ඉංග්‍රීසි අකුරු, ඉලක්කම්, . හෝ _ පමණි).';
    case 'username_taken':
      return 'මෙම පරිශීලක නාමය දැනටමත් භාවිතයේ ඇත.';
    case 'weak_password':
      return 'මුරපදය අකුරු 6ක් හෝ වැඩි ගණනක් විය යුතුය.';
    case 'invalid_current_password':
      return 'වත්මන් මුරපදය වැරදිය.';
    case 'invalid_status':
      return 'වලංගු නොවන තත්ත්වයකි.';
    case 'title_required':
      return 'පත්‍රිකාවේ ශීර්ෂය ඇතුළත් කරන්න.';
    case 'invalid_grade':
      return '6 සිට 11 දක්වා ශ්‍රේණියක් තෝරන්න.';
    case 'invalid_year':
      return 'වර්ෂය නිවැරදිව ඇතුළත් කරන්න.';
    case 'link_required':
      return 'Google Drive සබැඳියක් (https://) ඇතුළත් කරන්න.';
    case 'file_too_large':
      return 'ගොනුව 15MB ට වඩා විශාලය. කුඩා PDF එකක් උඩුගත කරන්න.';
    case 'invalid_file_type':
      return 'PDF ගොනු පමණක් උඩුගත කළ හැක.';
    case 'unauthorized':
      return 'නැවත පිවිසෙන්න. ඔබේ සැසිය අවසන් වී ඇත.';
    default:
      return 'යම් දෝෂයක් සිදු විය. නැවත උත්සාහ කරන්න.';
  }
}
