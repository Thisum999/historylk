# Supabase එකට මාරු වීම — සම්පූර්ණ පියවරෙන් පියවර

මෙම අඩවිය දැන් **Supabase** මත ක්‍රියා කරයි. Cloudflare අවශ්‍ය නැත, credit card අවශ්‍ය නැත.

| කොටස | පෙර (Cloudflare) | දැන් (Supabase) |
| --- | --- | --- |
| Database | D1 | Postgres (`papers`, `admins` වගු) |
| PDF ගොනු | R2 | Storage bucket `papers` |
| API | Cloudflare Worker | Edge Function `api` |
| Login | Worker cookie | Token (localStorage) — cookie block ගැටලුව ඉවරයි |
| Frontend | Vercel | Vercel (එලෙසම) |

කේතයේ වෙනස් වූ ගොනු: `src/lib/api.ts`, `supabase/functions/api/index.ts`, `schema.sql`, `package.json`, `.env.example`, `README.md`. `wrangler.toml` සහ `worker/` ඉවත් කර ඇත.

---

# මුලින්ම දැනගන්න වචන

මම දෙන කළු පැහැති කොටු තුළ ඇත්තේ terminal එකට ලියන විධාන ය. Terminal යනු folder එකක් තුළ වැඩ කරන කවුළුවකි.

| දේ | අර්ථය |
| --- | --- |
| `cd hithata-wadina-history` | "මේ folder එක ඇතුළට යන්න". දැනටමත් එහි සිටී නම් මඟ හරින්න. |
| `npm install` | project එකට අවශ්‍ය packages බාගන්නවා (එක් වරක් පමණි). |
| `npx supabase ...` | `npx` = "මේ මෙවලම භාවිතා කරන්න". `supabase` යනු database/backend deploy කරන මෙවලමයි. |
| `YOUR-PROJECT-REF` | ඔබේ Supabase project එකේ අද්විතීය නම (උදා: `abcdefghijklmnop`). එලෙසම copy කළොත් වැඩ නොකරයි. |
| `YOUR-USERNAME`, `YOUR-REPO` | ඔබේ GitHub ලිපිනයේ කොටස්. |
| `#` | "මෙය ක්‍රියාත්මක නොවන සටහනකි". |

**වැදගත්:** විධාන කොටුවක් එකවර copy කර Enter කිරීම සාමාන්‍යයෙන් හරි. නමුත් `npx supabase login` වැනි විධාන බ්‍රව්සරයක් විවෘත කර ඔබෙන් අවසර ඉල්ලා නතර වේ — එවිට browser එකේ **Authorize** ඔබන්න.

---

# 0. අවශ්‍ය දේ (එක් වරක් පමණි)

- **Node.js (LTS)** — https://nodejs.org → Download → ඊළඟට ඊළඟට. (npm, npx ද එනවා)
- **Git** — https://git-scm.com (Windows නම් Git Bash ද එනවා)
- **VS Code** — https://code.visualstudio.com
- **Supabase ගිණුමක්** — https://supabase.com (නොමිලේ, කාඩ්පතක් ඉල්ලන්නේ නැත)

Terminal එක විවෘත කරන ආකාරය (Windows):

1. Zip එක extract කරන්න (right-click → Extract All).
2. VS Code විවෘත කර **File → Open Folder** → extract කළ `hithata-wadina-history` folder එක තෝරන්න.
3. **Terminal → New Terminal** (හෝ `Ctrl + ``).
4. පහළින් විවෘත වන කොටුවේ දකුණු පස dropdown එකේ **Git Bash** තෝරන්න.
   Git Bash අවශ්‍ය ඇයි? මම දෙන විධාන (`rm`, `cp` වැනි) Git Bash එකට ලියා ඇත. PowerShell එකේ `rm -f` වැඩ නොකරයි.

පළමුව project folder එකට යන්න:

```bash
cd hithata-wadina-history
```

→ ඔබ දැනටමත් එම folder එකේ සිටී නම් "No such file or directory" එනු ඇත; එය ගැටලුවක් නොවේ.

---

# පියවර 1 — Supabase project එකක් සාදන්න

1. https://supabase.com/dashboard → **Sign in** (GitHub ගිණුමෙන් පිවිසිය හැක — ලේසිම ක්‍රමය).
2. **New project** ඔබන්න. පිරවිය යුතු දේ:
   - **Organization** — දැනට ඇති එක තෝරන්න (අලුතින් සෑදීම අවශ්‍ය නැත).
   - **Project name** — `history-papers`
   - **Database Password** — ශක්තිමත් මුරපදයක්. **Generate a password** ඔබා ලැබෙන එක copy කර ආරක්ෂිත තැනක තබා ගන්න. මෙය අඩවියේ admin මුරපදය **නොවේ** — database එකට පමණි.
   - **Region** — `Southeast Asia (Singapore)` (ශ්‍රී ලංකාවට ලඟම).
3. **Create new project** ඔබා මිනිත්තු 1–2 රැඳී සිටින්න ("Setting up project…" පෙනේ).

## ඔබේ PROJECT REF එක සොයා ගන්න

එය **Project Settings → General** හෝ **Project Settings → Data API** තුළ ඇත. URL එකේ `https://xxxx.supabase.co` ලෙස පෙනේ.

උදාහරණය:
- URL: `https://abcdefghijklmnop.supabase.co`
- PROJECT REF: `abcdefghijklmnop` (දැන් `https://` සහ `.supabase.co` ඉවත් කර ඇත)

මෙය ලියා ගන්න — ඊළඟ පියවර කිහිපයට අවශ්‍යයි.

---

# පියවර 2 — Database වගු සාදන්න

1. පැත්තේ මෙනුවේ **SQL Editor** ඔබන්න.
2. ඉහළින් **New query** ඔබන්න (හිස් කවුළුවක් විවෘත වේ).
3. VS Code එකේ වම් පස ගොනු ලැයිස්තුවේ **`schema.sql`** ඔබා විවෘත කරන්න.
4. එහි ඇති **සියලු අන්තර්ගතය** (`Ctrl + A`, `Ctrl + C`) copy කර SQL Editor කවුළුවේ paste කරන්න (`Ctrl + V`).
5. පහළ දකුණේ **Run** ඔබන්න (හෝ `Ctrl + Enter`).

පෙනිය යුතු දේ: `Success. No rows returned` (හෝ `Success`). රතු පැහැති error එකක් නම්, මුල් පේළිය (උදා: `ERROR: 42P07`) මට එවන්න.

මෙයින් සිදුවන්නේ:

- `papers` වගුව — පත්‍රිකා ලැයිස්තුව (title, grade, year, term, type, link…)
- `admins` වගුව — පරිපාලක ගිණුම් (hashed මුරපද)
- `idx_papers_grade`, `idx_papers_year`, `idx_admins_username_lower` — සෙවුම් වේගවත් කරන indices
- නිදර්ශන පත්‍රිකා 6ක්
- **RLS (Row Level Security) සක්‍රීය කිරීම** — එනම් browser එකේ සිට කෙලින්ම database එකට කියවීමට/ලිවීමට නොහැක. සියල්ල යන්නේ අපගේ API හරහාය.

පරීක්ෂාව: පැත්තේ මෙනුවේ **Table Editor** → **papers** → පේළි 6ක් පෙනේ නම් සාර්ථකයි.

---

# පියවර 3 — PDF ගබඩාව (Storage bucket)

PDF ගොනු තබන්නේ database එකේ නොවේ, Storage එකේය.

1. පැත්තේ මෙනුවේ **Storage** ඔබන්න.
2. **New bucket** ඔබන්න.
3. **Bucket name** — `papers` (හරියටම මෙලෙස, කුඩා අකුරින්).
4. **Public bucket** — සලකුණු කරන්න. (මෙය අවශ්‍යයි: පත්‍රිකා පිටුවේ "බාගන්න" බොත්තම PDF එක කෙලින්ම ලංකා කරවයි.)
5. **Save** ඔබන්න.

> මෙය අමතක වුණොත් පත්‍රිකා ලැයිස්තුව පෙනුනත් PDF එක විවෘත නොවේ.

---

# පියවර 4 — `.env` ගොනුව (frontend එකට API ලිපිනය)

Frontend එකට "මගේ API එක තියෙන්නේ මෙතන" කියා කියන්න ඕන.

Terminal එකේ:

```bash
cp .env.example .env
```

→ කිසිවක් නොපෙන්වයි (නිශ්ශබ්දතාව = සාර්ථකත්වය). මෙයින් `.env.example` ගොනුවේ පිටපතක් `.env` නමින් සාදයි.

දැන් VS Code එකේ වම් පස ගොනු ලැයිස්තුවේ **`.env`** ඔබා විවෘත කරන්න. එහි ඇති පේළිය මෙසේ වෙනස් කරන්න:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
```

උදා: `VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co`

- `https://` තබා ගන්න, අගට `/` නොදමන්න.
- Save කරන්න (`Ctrl + S`).

`.env` GitHub එකට යන්නේ නැත (`.gitignore` තුළ ඇත). එහි රහස් අගයක් නැත — URL එක පමණි.

---

# පියවර 5 — Backend (Edge Function) deploy කිරීම

## 5.1 Dependencies

```bash
npm install
```

→ මිනිත්තු 1–3ක් ගත වේ, බොහෝ පේළි ගලා යයි. අවසානයේ `added 200 packages` වැනි පේළියක් පෙනේ. රතු `npm ERR!` පේළි තිබේ නම් පමණක් ගැටලුවකි.

## 5.2 Supabase CLI එකට log වන්න (එක් වරක් පමණි)

```bash
npx supabase login
```

→ browser කවුළුවක් විවෘත වේ → ඔබේ Supabase ගිණුමට log වී **Authorize** ඔබන්න.

→ Terminal එකේ `You are now logged in` වැනි පණිවිඩයක් පෙනේ.

> පළමු වරට මෙය ධාවනය කරන විට `npx` එක Supabase CLI එක බාගනී (`Need to install the following packages... Ok to proceed? (y)`) — `y` ලියා Enter කරන්න.

## 5.3 Project එක සම්බන්ධ කරන්න

```bash
npx supabase link --project-ref YOUR-PROJECT-REF
```

→ `YOUR-PROJECT-REF` වෙනස් කරන්න (උදා: `abcdefghijklmnop`).

Database password එක ඉල්ලා තිබේ නම් (`Enter your database password:`), පියවර 1 හි දුන් මුරපදය ලියා Enter කරන්න (ලියන අකුරු නොපෙනේ — එය සාමාන්‍යයි).

→ අවසානයේ `Finished supabase link.` පෙනේ.

## 5.4 Function එක deploy කරන්න

```bash
npx supabase functions deploy api --no-verify-jwt
```

→ ගොනු upload වී අවසානයේ `Deployed Functions on project ...: api` වැනි පේළියක් පෙනේ.

මෙයින් සිදුවන්නේ: `supabase/functions/api/index.ts` ගොනුව Supabase හි server එකකට upload වී, ඔබේ API එක ලෙස ක්‍රියා කිරීම.

- `api` = function එකේ නම (URL එකේ පෙනේ).
- `--no-verify-jwt` = "Supabase ගිණුම් JWT නැතිව කැඳවීමට ඉඩ දෙන්න". අපගේම `x-admin-token` ක්‍රමයෙන් පරිපාලක ක්‍රියා ආරක්ෂා වේ.

Function එකේ ලිපිනය:

```
https://YOUR-PROJECT-REF.supabase.co/functions/v1/api
```

---

# පියවර 6 — Secrets (පරිපාලක පිවිසුම හා ආරක්ෂාව)

Secrets = server එකේ පමණක් තබන රහස් අගයන්. මේවා කේතයේ හෝ GitHub එකේ නොතැබේ.

Dashboard එකේ: **Edge Functions** (පැත්තේ මෙනුව) → **Secrets** (හෝ **Manage secrets**) → **Add new secret**.

| Name | Value |
| --- | --- |
| `ADMIN_USERNAME` | `history` |
| `ADMIN_PASSWORD` | ඔබේම ශක්තිමත් මුරපදයක් (අකුරු 10+; `HN` වැනි දෙයක් නොදමන්න) |
| `SESSION_SECRET` | දිගු අහඹු අකුරු පේළියක් — https://www.random.org/strings/ විවෘත කර (Length 64, 1 string) ජනනය කර copy කරන්න |

එකින් එක **Add new secret** ඔබා අගය දමන්න. අවසානයේ තුනම ලැයිස්තුවේ පෙනිය යුතුය.

> **කිසි විටෙකත්** `ADMIN_PASSWORD`, `SESSION_SECRET` අගයන් chat එකේ, screenshot එකක, හෝ GitHub එකේ නොදමන්න. Secrets එකතු කළ පසු function එක නැවත deploy කිරීම අවශ්‍ය නැත — ඊළඟ request එකේදී අලුත් අගයන් භාවිත වේ.

**අමතර (අවශ්‍ය නැත):** `ALLOWED_ORIGINS` — ඔබේ අඩවියේ ලිපිනය පමණක් අවසර දීමට (උදා: `https://history.vercel.app`). නොදැමුවොත් සියලු ලිපින වලින් API එක කැඳවිය හැක (පත්‍රිකා කියවීම සියලු දෙනාටම ඕන නිසා එය ගැටලුවක් නොවේ).

---

# පියවර 7 — API එක පරීක්ෂා කරන්න

Browser එකේ මෙය විවෘත කරන්න (ඔබේ ref එක දමා):

```
https://YOUR-PROJECT-REF.supabase.co/functions/v1/api/papers
```

පෙනිය යුතු දේ:

```json
{"papers":[{"id":"sample-11-first-2025","title":"11 ශ්‍රේණිය …","grade":11,…}]}
```

- JSON පෙනේ නම් → backend එක සාර්ථකයි. 🎉
- `{"error":"server_error"}` → පියවර 2 (schema) හෝ 6 (secrets) නැවත බලන්න.
- `{"error":"missing_supabase_credentials"}` → function එක නැවත deploy කරන්න (`npx supabase functions deploy api --no-verify-jwt`).
- `404` / "Function not found" → function නම `api` ද, deploy සාර්ථක වුණාද බලන්න (Dashboard → Edge Functions ලැයිස්තුවේ `api` පෙනේද).

---

# පියවර 8 — ඔබේ පරිගණකයේ ධාවනය කර බලන්න

```bash
npm run dev
```

→ Terminal එකේ `Local: http://localhost:3000/` පෙනේ. Browser එකේ **http://localhost:3000** විවෘත කරන්න.

## පරිපාලක පැනලය

ලිපිනය: **http://localhost:3000/admin**

- **පරිශීලක නාමය**: `history` (ඔබ `ADMIN_USERNAME` වෙනස් කළේ නම් එය)
- **මුරපදය**: ඔබ `ADMIN_PASSWORD` ලෙස දැමූ අගය

පරීක්ෂා කරන්න:

1. **පත්‍රිකා** ටැබයේ නිදර්ශන පත්‍රිකා 6 පෙනේද.
2. **නව පත්‍රිකාවක්** → PDF එකක් තෝරා **පත්‍රිකාව එකතු කරන්න** → "සාර්ථකව එකතු කරන ලදී" පෙනේද.
3. **පත්‍රිකා පිටුව** (`/papers`) → අලුත් පත්‍රිකාව පෙනේද, බාගත කළ හැකිද.

PDF ගොනුව Storage එකේ **`papers` bucket** තුළ `<uuid>.pdf` ලෙස පෙනේ (Dashboard → Storage → papers).

---

# පියවර 9 — GitHub එකට යැවීම

කලින් විදිහටම, line by line:

```bash
rm -f .git
```
→ කලින් `.git` ගොනුවක් තිබේ නම් එය මකයි. නැත්නම් නිශ්ශබ්දව අවසන් වේ (සාර්ථකයි).

```bash
git init
```
→ `Initialized empty Git repository in ...` පෙනේ.

```bash
git add .
```
→ කිසිවක් නොපෙන්වයි (නිශ්ශබ්දතාව = සාර්ථකත්වය).

```bash
git commit -m "Supabase backend: Edge Function, Postgres schema, Storage uploads"
```
→ `files changed ...` සාරාංශයක් පෙනේ.

```bash
git branch -M main
```
→ නිශ්ශබ්දයි.

```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
```
→ `YOUR-USERNAME` සහ `YOUR-REPO` ඔබේ GitHub ලිපිනයෙන් වෙනස් කරන්න. නිශ්ශබ්දයි.

```bash
git push -u origin main --force
```
→ පළමු වරට browser කවුළුවක් විවෘත වී GitHub ගිණුමට log වී අවසර දෙන්න කියා ඉල්ලයි. අවසර දුන් පසු ගොනු upload වේ.

GitHub එකේ repo එක refresh කර ගොනු පෙනේද බලන්න. `node_modules`, `dist`, `.env` පෙනෙන්නේ නැති එක හරි.

---

# පියවර 10 — Vercel එකේ අඩවිය online කිරීම

1. https://vercel.com/new → **Import Git Repository** → ඔබේ repo එක → **Import**.
2. පිටුවේ **Environment Variables** කොටසේ:

   | Name | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | `https://YOUR-PROJECT-REF.supabase.co` |

   → **Add** ඔබන්න.
3. **Deploy** ඔබන්න → මිනිත්තු 1–2කින් ලිපිනයක් ලැබේ.
4. එම ලිපිනය විවෘත කර `/papers` හා `/admin` පරීක්ෂා කරන්න.

> කලින් Vercel එකේ `VITE_API_BASE` (Cloudflare ලිපිනය) තිබේ නම් එය **delete** කරන්න — දැන් අවශ්‍ය නැත.
> `VITE_SUPABASE_URL` පසුව වෙනස් කළොත් **Deployments → ⋯ → Redeploy** කළ යුතුය (build වේලාවේදී එය bundle එකට ලියැවෙන නිසා).

---

# පියවර 11 — පසුව code එක වෙනස් කළොත්

| වෙනස් කළේ | නැවත කළ යුතු දේ |
| --- | --- |
| `supabase/functions/api/index.ts` | `npx supabase functions deploy api --no-verify-jwt` |
| `schema.sql` | SQL Editor එකේ නැවත Run |
| `src/` (frontend) | `git add . && git commit -m "..." && git push` → Vercel ස්වයංක්‍රීයව build වේ |
| Secrets (මුරපදය) | Dashboard → Edge Functions → Secrets → අගය වෙනස් කරන්න |

---

# බහුලව සිදුවන ආදිය-මට්ටමේ දෝෂ

| දකින දේ | අර්ථය | කරන්නේ කුමක්ද |
| --- | --- | --- |
| `command not found: npm` හෝ `node` | Node.js නැත | https://nodejs.org (LTS) ස්ථාපනය කර VS Code නැවත විවෘත කරන්න |
| `rm: command not found` / `cp: command not found` | PowerShell භාවිතා කරයි | Terminal dropdown එකේ **Git Bash** තෝරන්න |
| `{"error":"missing_supabase_credentials"}` | Function එකට service key ලැබුණේ නැත | `npx supabase functions deploy api --no-verify-jwt` නැවත ධාවනය කරන්න |
| `{"error":"server_error"}` (PDF upload) | `papers` bucket නැත / public නොවේ | පියවර 3 නැවත කරන්න |
| පත්‍රිකා පිටුවේ කිසිවක් නැත (`{"papers":[]}`) | `schema.sql` ධාවනය නොවී | පියවර 2 නැවත කරන්න |
| Browser console එකේ `CORS` error | `ALLOWED_ORIGINS` වැරදි | Secrets වලින් `ALLOWED_ORIGINS` මකන්න (හෝ ඔබේ Vercel ලිපිනය නිවැරදි කරන්න) |
| login වේ නමුත් refresh කළ විට නැවත login | Browser එකේ site data block | Browser එකේ third-party/site data block ඉවත් කරන්න (දැන් cookie භාවිත නොවේ) |
| `unauthorized` / නැවත login | Token කල් ඉකුත් (පැය 12) | නැවත පිවිසෙන්න — සාමාන්‍යයි |
| `invalid_credentials` (නිවැරදි මුරපදයකින්) | Secrets වල `ADMIN_USERNAME`/`ADMIN_PASSWORD` වෙනස් | Dashboard Secrets බලන්න; වෙනස් කළ පසු නැවත login කරන්න |
| `npx supabase login` browser එක විවෘත නොවේ | Terminal එකේ දිස්වන ලිපිනය copy කර browser එකේ දමන්න | හෝ `npx supabase login --no-browser` |
| `Cannot find project ref` | link කර නැත | `npx supabase link --project-ref YOUR-PROJECT-REF` |
| Vercel අඩවියේ API වැඩ නැත | `VITE_SUPABASE_URL` නැත/වැරදිය | Vercel Environment Variables නිවැරදි කර **Redeploy** |
| PDF එක විවෘත නොවේ (403) | bucket එක public නොවේ | Storage → `papers` → **Edit bucket** → Public සලකුණු කරන්න |

---

# ආරක්ෂාව ගැන

- Database වගු දෙකේ **RLS සක්‍රීය** කර ඇති අතර කිසිම policy එකක් නැත. එනම් `anon` (browser) key එකෙන් කෙලින්ම දත්ත කියවීමට/ලිවීමට නොහැක — සියල්ල යන්නේ Edge Function හරහාය.
- පරිපාලක ක්‍රියා සියල්ලට `x-admin-token` අවශ්‍යයි; එය `SESSION_SECRET` එකෙන් HMAC-SHA256 sign වේ. Token පැය 12කින් කල් ඉකුත් වේ.
- මුරපද PBKDF2-SHA256 (120,000 වාර) ලෙස hash වේ — සැබෑ මුරපදය කිසිවිටෙක database එකේ තබන්නේ නැත.
- `service_role` key එක කිසිවිටෙක browser එකට හෝ GitHub එකට නොයයි — එය ඇත්තේ Supabase Edge Function තුළ පමණි.

# නොමිලේ plan එක ගැන

- Edge Functions, Postgres (500MB), Storage (1GB) — නොමිලේ ප්‍රමාණවත්.
- Project එක **දින 7ක් භාවිත නොකළොත් pause වේ**. Dashboard එකේ **Resume project** ඔබා තත්පර කිහිපයකින් නැවත ක්‍රියාත්මක කළ හැක. දත්ත නැති නොවේ.
