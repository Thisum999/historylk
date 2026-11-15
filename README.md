# හිතට වදින HISTORY — හර්ෂණ නල්ලපෙරුම

6 – 11 ශ්‍රේණි ඉතිහාස පන්ති වෙබ් අඩවිය.
Frontend: React + Vite · Backend: Supabase (Edge Function API + Postgres database + Storage)

Supabase project එක සකස් කර deploy කරන සම්පූර්ණ පියවර → **SUPABASE.md**

---

## 1. අවශ්‍ය දේ

- **Node.js 18 හෝ ඊට ඉහළ** — https://nodejs.org (LTS)
- **VS Code** — https://code.visualstudio.com
- Windows / macOS / Linux

## 2. VS Code තුළ විවෘත කරන්න

1. Zip ගොනුව extract කරන්න.
2. VS Code → **File → Open Folder** → extract කරපු folder එක තෝරන්න.
3. VS Code තුළ **Terminal → New Terminal** (Ctrl + `).

## 3. පළමු වරට (setup)

```bash
npm install
cp .env.example .env
```

`.env` ගොනුවේ `VITE_SUPABASE_URL` සඳහා ඔබේ Supabase project URL එක දමන්න.
Database, storage bucket, admin secrets හා API deploy කරන ආකාරය **SUPABASE.md** ගොනුවේ ඇත.

## 4. ධාවනය

```bash
npm run dev
```

API එක Supabase Edge Function එකක් ලෙස ක්‍රියා කරයි — එය ඔබේ පරිගණකයේ ධාවනය නොවේ.

ඉන්පසු බ්‍රව්සරයේ විවෘත කරන්න: **http://localhost:3000**

## 5. පරිපාලක පැනලය

- ලිපිනය: **http://localhost:3000/admin**
- **මුල් (default) පරිපාලක** — පරිශීලක නාමය හා මුරපදය පැමිණෙන්නේ Supabase secrets වල `ADMIN_USERNAME` / `ADMIN_PASSWORD` වලිනි (නොදැමුවොත් `history` / `HN`).

පැනලයේ ප්‍රධාන කොටස්: **සාරාංශය** (KPI, ශ්‍රේණි සටහන, අලුත්ම පත්‍රිකා, ඉල්ලුම්), **පත්‍රිකා** (සෙවුම, පෙරහන, පිළිවෙළ, CSV), **නව පත්‍රිකාවක්**, **පරිපාලකයන්**, **මගේ ගිණුම**.

### නව පරිපාලකයන්

1. `/admin` පිටුවේ **"ලියාපදිංචි ඉල්ලුම"** ටැබයෙන් නම, පරිශීලක නාමය හා මුරපදය ඇතුළත් කර ඉල්ලුම යවන්න.
2. මුල් පරිපාලක (`history`) පිවිසී **පරිපාලකයන්** කොටසින් එය **අනුමත** හෝ **ප්‍රතික්ෂේප** කරන්න.
3. අනුමත වූ පසු එම පරිශීලකයාට පිවිසිය හැක. මුල් පරිපාලකට පමණක් පරිපාලකයන් සංස්කරණය (නම, පරිශීලක නාමය, මුරපදය, තත්ත්වය) හා ඉවත් කිරීම කළ හැක.

මුරපද PBKDF2 (SHA-256, 120,000 වාර) හරහා hash වී Supabase Postgres තුළ ගබඩා වේ.

### මුරපදය වෙනස් කිරීම

Supabase Dashboard → **Edge Functions → Secrets** තුළ අගයන් වෙනස් කරන්න:

```
ADMIN_USERNAME=history
ADMIN_PASSWORD=ඔබේ-අලුත්-මුරපදය
SESSION_SECRET=දිගු-අහඹු-අකුරු-පේළියක්
```

## 6. ඡායාරූප හා පෝස්ටර

සියලු පින්තූර `public/media/` තුළ ඇත:

| ගොනුව | භාවිතය |
| --- | --- |
| `teacher.jpg` | මුල් පිටුවේ ප්‍රධාන ඡායාරූපය (අලුත් ඡායාරූපය) |
| `teacher-about.jpg` | "ගුරුවරයා" පිටුව හා මුල් පිටුවේ හැඳින්වීම |
| `history-emblem.jpg` | "හිතට වදින HISTORY" ප්‍රධාන ලාංඡනය — මුල් පිටුවේ තේමා තීරුව හා admin පිවිසුම |
| `logo.jpg` | Footer ලාංඡනය හා admin පිවිසුම |
| `seal.png` | උපුටනය අසල මුද්‍රාව |
| `poster-schedule.jpg` | 2027 සම්පූර්ණ කාලසටහන |
| `poster-siras.jpg`, `poster-brightway.jpg`, `poster-sunray.jpg` | මධ්‍යස්ථාන පෝස්ටර |

ඡායාරූපයක් මාරු කිරීමට එම ගොනුවම එකම නමින් ප්‍රතිස්ථාපනය කරන්න (හොඳම ප්‍රමාණය: සිරස් ඡායාරූප 1000×1500 පමණ).

## 7. WhatsApp සමූහය හා Facebook පිටුව

අඩවියේ ඇති සියලු සමාජ ජාල සබැඳි (header, footer, සමූහ අංශය, ජංගම තීරුව) පාලනය වන්නේ එකම තැනකිනි:

```
src/data/site.ts → SOCIAL
```

```ts
export const SOCIAL = {
  whatsappGroup: 'https://chat.whatsapp.com/ඔබේ-සමූහ-සබැඳිය',
  facebookPage: 'https://www.facebook.com/ඔබේ-පිටුව',
};
```

දැනට ඇත්තේ **ආදේශක සබැඳි (REPLACE_WITH_...)** ය. ඔබේ සැබෑ සබැඳි දෙක එහි යොදන්න — සියලු බොත්තම් වහාම යාවත්කාලීන වේ.

## 8. පන්ති වේලාවන්, දුරකථන හා පාඨ

සියලු පන්ති කාලසටහන්, මධ්‍යස්ථාන, දුරකථන අංක, ප්‍රශ්නෝත්තර හා ශ්‍රේණි විස්තර ඇත්තේ:

```
src/data/site.ts
```

එකම ගොනුවක් සංස්කරණය කර සියලු පිටු යාවත්කාලීන කළ හැක.

## 9. නව විශේෂාංග

- **සමූහ අංශය** (`src/components/Community.tsx`) — WhatsApp සමූහය හා Facebook පිටුව සඳහා වෙන් වූ කොටසක්. මුල් පිටුවේ හා සම්බන්ධ වන්න පිටුවේ දිස්වේ.
- **ලාංඡන තීරුව** (`SignatureBand.tsx`) — මුල් පිටුවේ "හිතට වදින HISTORY" ලාංඡනය ප්‍රදර්ශනය කරයි.
- **ජංගම තීරුව** (`MobileDock.tsx`) — දුරකථනයේ පහළින් ඇමතුම් / WhatsApp / සමූහ බොත්තම්. admin පිටුවේ දිස් නොවේ.
- **පරිපාලක පැනලය** — සෙවුම, ශ්‍රේණි පෙරහන, පිළිවෙළ, CSV බාගැනීම, සබැඳි පිටපත් කිරීම, ශ්‍රේණි ගණනය සටහන.
- **නව admin dashboard** — පැත්තේ මෙනුවක් සහිත තිර, පරිපාලක ගිණුම් කළමනාකරණය හා අනුමැතිය.
- නව විලාසිතා (දීප්තිමත් වර්ණ, gold/rose/emerald/azure) සියල්ල `src/premium.css` තුළය. මූලික `src/styles.css` වෙනස් නොකෙරේ.

## 10. Production build

```bash
npm run build
```

`dist/` තුළ නිමි ගොනු සෑදේ.

## 9. සටහන්

- පත්‍රිකා දත්ත ගබඩා වන්නේ Supabase Postgres හි `papers` වගුවේය; PDF ගොනු `papers` storage bucket එකේය.
- API කේතය: `supabase/functions/api/index.ts` (deploy: `npx supabase functions deploy api --no-verify-jwt`).
- අන්තර්ජාලයට publish කිරීමට පෙර `ADMIN_PASSWORD` හා `SESSION_SECRET` නිසැකවම වෙනස් කරන්න.
- Supabase free plan එකේ project එක සතියක් භාවිත නොකළොත් pause වේ — Dashboard එකෙන් එක click එකකින් resume කළ හැක.
