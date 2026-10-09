# আমার বিয়ের বায়োডাটা

Funny Bangladeshi marriage-biodata poster maker. User tap kore answer dey, AI bou/bor, shoshur ar shashuri-r mojar motamot likhe, tarpor Facebook-e share-joggo poster ar 1200x630 share card toiri hoy.

**Stack:** Next.js 14 (App Router) on Vercel, Supabase (database + image storage), OpenRouter (AI-written reactions, any model).

## Kivabe kaj kore

1. User prothome pattro ba pattri bachay (alada question set), naam ar chobi (optional) dey, tarpor 14 ta question-er uttor tap kore.
2. Browser `/api/generate`-e shudhu **option-er index** pathay. Server nijer question bank theke prompt banay, OpenRouter API call kore, tinjon judge-er rayo ar motamot ferot dey. API key kokhono browser-e jay na.
3. Poster (540px, save-e 1080px) ar share card (600x315, save-e 1200x630) browser-e `html-to-image` diye JPEG hoy. Bangla font app-er nijer bundle-er (`@fontsource`), tai export-e font thik thake.
4. "শেয়ার লিংক বানাও" chaple `/api/share` duto image Supabase Storage-e rakhe ar `biodatas` table-e row banay. Link: `https://YOUR-DOMAIN/b/<id>`.
5. `/b/<id>` page-e `og:image` hishebe share card (1200x630) boshano thake. Facebook-e link post korle oi card preview hishebe dekha jay, click korle purno poster khole.

## Setup (ekbar)

### 1. Supabase
1. https://supabase.com e notun project banao.
2. **SQL Editor -> New query**, `supabase/schema.sql`-er shob kichu paste kore **Run** koro. Eta table ar public bucket `biodata-images` banabe.
3. **Project Settings -> API** theke `Project URL` ar `service_role` key nao. (service_role key shudhu server-e, kokhono public kora jabe na.)

### 2. OpenRouter
1. https://openrouter.ai/keys theke API key banao, account-e credit rakho.
2. Default model: `nvidia/nemotron-3-ultra-550b-a55b:free` (free). `OPENROUTER_MODEL` na dile eta-i cholbe. Onno model-e jete https://openrouter.ai/models theke model-er **id** copy kore `OPENROUTER_MODEL`-e boshao ar redeploy koro, code bodlate hobe na.
3. Free model-er limit ache (OpenRouter-er rate limit), ar free endpoint-e pathano lekha provider log kore. App shudhu naam ar tap kora option pathay, chobi pathay na.

### 3. GitHub
```bash
cd biye-biodata
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USER/YOUR-REPO.git
git push -u origin main
```
`.env` file `.gitignore`-e ache, tai key push hobe na.

### 4. Vercel
1. https://vercel.com/new -> GitHub repo import koro (Framework: Next.js, auto detect).
2. **Environment Variables** e ei gulo dao (`.env.example` dekho):

| Name | Value |
|---|---|
| `OPENROUTER_API_KEY` | OpenRouter key |
| `OPENROUTER_MODEL` | optional, default `nvidia/nemotron-3-ultra-550b-a55b:free` |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
| `SUPABASE_BUCKET` | optional, default `biodata-images` |
| `NEXT_PUBLIC_SITE_URL` | final domain, jemon `https://amar-biyer-biodata.vercel.app` |

3. **Deploy** chapo. Custom domain jodi lage, Vercel-e domain add kore `NEXT_PUBLIC_SITE_URL` bodle redeploy koro.

### Local-e chalate
```bash
cp .env.example .env.local   # tarpor value gulo boshao
npm install
npm run dev                  # http://localhost:3000
```

## Deploy-er por test checklist

1. Home page khule, pattro/pattri bachho, shob question-er uttor dao. Poster-e 3 ta shilmohor ar AI-r lekha dekha jabe.
2. "নতুন মতামত লেখাও" chaple notun lekha ashbe.
3. "🔗 শেয়ার লিংক বানাও" chaple `/b/<id>` link toiri hobe.
4. Oi link Facebook Sharing Debugger-e dao: https://developers.facebook.com/tools/debug/ -> **Scrape Again**. Preview-te share card (1200x630), title ar description dekha jabe. (Facebook purono preview cache kore, notun link-e ekbar Debugger-e scrape korle bhalo.)
5. `/api/health` khule dekho `ai`, `supabaseBucket`, `supabaseTable` shob `ok` kina.
6. Facebook, WhatsApp, Telegram button, link copy, caption copy, mobile-e "ছবিসহ শেয়ার" shob try koro.

## Facebook-e share korle ki jay

- **Link share (Facebook button):** post-e share card image (1200x630), title "`<naam>`-এর বিয়ের বায়োডাটা: শ্বশুর-শাশুড়ি কী বললেন?", description hishebe AI-r punchline headline. Click korle `/b/<id>`-e purno poster khole, nichei "তুমিও বানাও" button.
- **Image post (poster save kore post):** poster-er prothom 4:5 ongsho (title, photo, naam, 3 shilmohor, headline, "লিংকে ক্লিক করুন" ribbon) feed-e dekha jay.
- Facebook link-er shathe caption auto bosay na. Tai "ক্যাপশনসহ কপি" button ache, caption paste kore nite hoy.

## Limit ar shotorkota

- **Image size:** Vercel function request body max **4.5 MB**. Poster ar card duto-i JPEG, shadharonoto 1 MB-er niche. Server-e prottek image max 2 MB.
- **Rate limit:** `lib/rate.js` memory-based, shudhu abuse kom kore. Boro traffic-e Upstash Redis ba Vercel KV diye poriborton koro.
- **AI khoroch:** prottek poster-e ekta OpenRouter call (prai 1,500-2,500 token). Khoroch niyontron-e `OPENROUTER_MODEL` choto model-e bodle dekho, tobe lekha-r moja kome jete pare. Bangla comedy-te boro model bhalo kore.
- **Privacy:** user-er chobi poster-er bhitor-e public link-e thake. Delete korte hole Supabase Storage theke `<id>/` folder ar `biodatas` table-er row muche dao.
- **Content safety:** AI prompt-e rong, ojon, dharmo, jat, dena-paona niye joke nishiddho. Option-gulo shudhu obhyash, shokh, jibonjatra niye.

## Folder

```
app/
  page.js                  home (wizard)
  layout.js                fonts, default meta
  globals.css              shob CSS (poster, card, UI)
  b/[id]/page.js           public share page + og tags
  api/generate/route.js    AI call (server-only key)
  api/share/route.js       image upload + save row
components/
  Wizard.jsx               question flow, result, export, share
  Poster.jsx               Poster, Card, Scaled
  ShareBox.jsx             Facebook / WhatsApp / Telegram / Messenger / copy
lib/
  questions.js             pattro ar pattri-r question bank
  prompt.js                AI prompt + reply validation
  validate.js              input validation
  rate.js                  simple rate limit
  store.js                 Supabase helpers
supabase/schema.sql        table + bucket
```
