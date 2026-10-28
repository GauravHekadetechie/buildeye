# Buildeye — AI Construction Management Platform

Buildeye helps builders, contractors and homeowners turn a blueprint into a
working plan: upload a photo of a plan (printed, architect-drawn, or
hand-sketched), and Buildeye identifies the rooms, estimates cost and
timeline, tells you what tools and materials you'll need, gives Vastu-wise
room-placement guidance and ventilation/window advice based on a North
direction you set yourself, and shows an interactive 3D model you can click
through to see a concept illustration of how each part of the finished
building could look. From there, it tracks real construction progress via
site photos you upload over time, and tracks actual spend against the AI
cost estimate.

The app has **three role-based interfaces**: an **admin** view (platform
owner — sees every user and project), a **builder/contractor** view (uploads
and manages their own projects, assigns clients, logs expenses and progress),
and a **client/homeowner** view (read-only access to whichever project their
builder assigns them, plus the interactive 3D explorer).

This repo contains a **fully working frontend + backend**. The Blueprint
Analyzer works completely out of the box using a built-in deterministic
demo analyzer — no API keys, no setup. If you add your own Anthropic API
key, it upgrades to real AI vision analysis and richer AI-written
descriptions in the 3D explorer instead.

---

## 1. What's real vs. mocked

| Piece | Status |
|---|---|
| React frontend (landing, auth, dashboard) | ✅ Fully working |
| Express API, JWT auth, password hashing, change password, remember me | ✅ Fully working |
| **Role-based access (admin / builder / client)** | ✅ Fully working — enforced on the backend for every project/expense route, not just hidden in the UI |
| User storage | ✅ Fully working — a dependency-free JSON file (`backend/data/users.json`), no native modules to compile |
| **Blueprint upload & analysis** | ✅ Fully working — real file upload, real direction math (Vastu/ventilation computed from the North angle you set), real execution plan / cost / materials logic |
| Room detection in the uploaded image | 🟡 Deterministic demo detector by default — the same image always produces the same analysis (seeded from the file's actual bytes, and weakly grounded in its real pixel dimensions); becomes real AI vision if you connect a key — see section 6 |
| **Location-aware cost estimates** | ✅ Fully working — pick a city when uploading and the construction rate, total cost, and an illustrative land-value figure all adjust to that city's real relative cost of building (`backend/data/locationRates.js`) |
| **Interactive 3D model & future-look illustrations** | ✅ Fully working — the model is built from each project's actual detected room positions (not a generic guessed shape), so it lines up with the 2D room overlay; click a front/middle/rear marker to see which real rooms are there and a generated concept illustration + description in your choice of style |
| **Project deletion** | ✅ Fully working — builder/admin can permanently delete a project (with a confirmation step) from the project list or its detail page; this also removes its progress photos and expense records |
| **In-app AI key management** | ✅ Fully working — an admin can paste their own Anthropic API key into Admin → AI Settings and test the connection live, with no `.env` editing required (see section 6 for why it has to be *your* key) |
| **Progress photo tracking** | ✅ Fully working uploads/storage; the "% complete" estimate is illustrative (see `routes/blueprint.js`) |
| **Budget & expense tracker** | ✅ Fully working — add/list/delete real expenses (builder/admin only), checked against the AI cost estimate; clients get read-only visibility |
| Overview/Roadmap/Alerts/Resources/Analytics dashboard pages | 🟡 Separate demo section with realistic mock company-wide data, shown to admin/builder only — see `backend/data/mockData.js` |
| Google OAuth button | 🟡 UI only — shows a message, not a live OAuth flow |

Every illustrative number in the codebase is commented as such.

---

## 2. Folder structure

```
buildeye/
├── backend/
│   ├── data/
│   │   ├── mockData.js            # illustrative dashboard sample data
│   │   ├── vastuGuidelines.js     # traditional Vastu Shastra reference data
│   │   ├── ventilationGuidelines.js
│   │   └── locationRates.js       # Indian city construction-rate multipliers + illustrative land rates
│   ├── services/
│   │   ├── compass.js             # direction math (room position + North angle → bearing)
│   │   ├── seededRandom.js        # deterministic PRNG for the demo detector
│   │   ├── imageMeta.js           # zero-dependency JPEG/PNG dimension reader
│   │   ├── analysisEngine.js      # shared logic: execution plan, cost (location-aware), Vastu, ventilation
│   │   ├── mockAnalyzer.js        # demo room detector (zero setup, content-hash seeded)
│   │   ├── aiAnalyzer.js          # real AI vision detector
│   │   ├── aiConfig.js            # resolves admin-configured key vs. .env — single source of truth
│   │   └── futureLook.js          # 3D-explorer section/room split + concept description generator
│   ├── store/
│   │   ├── userStore.js           # JSON-file user storage (incl. role)
│   │   ├── blueprintStore.js      # JSON-file projects + role-based access checks
│   │   ├── expenseStore.js        # JSON-file expense records
│   │   └── settingsStore.js       # JSON-file admin settings (the AI key, if set via the UI)
│   ├── middleware/auth.js         # requireAuth + requireRole
│   ├── routes/
│   │   ├── auth.js                # signup / login / me / change-password
│   │   ├── dashboard.js           # demo dashboard + predict endpoints
│   │   ├── blueprint.js           # upload, analyze, assign-client, progress photos, future-look, locations
│   │   ├── expenses.js            # expense CRUD
│   │   └── admin.js               # admin-only: user list, platform overview, AI key settings + test
│   ├── uploads/                   # uploaded images land here (gitignored)
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/            # landing sections + shared UI
    │   ├── components/blueprint/  # compass picker, interactive 3D model, future-look panel,
    │   │                          # section illustration generator, room overlay, Vastu/ventilation cards, etc.
    │   ├── context/AuthContext.jsx
    │   ├── pages/                 # Landing, Login, Signup
    │   └── pages/dashboard/       # DashboardHome (role router), AdminOverview, AdminAISettings,
    │                              # BlueprintAnalyzer, BlueprintDetail, and the rest of the demo dashboard pages
    ├── index.html
    └── tailwind.config.js
```

---

## 3. The three roles

| Role | How you get it | What they can do |
|---|---|---|
| **Admin** | Automatic for any identifier listed in `ADMIN_IDENTIFIERS` in `backend/.env` — set this to your own email before you sign up | See and manage every user and every project; platform-wide overview (`/dashboard`) |
| **Builder / Contractor** | Chosen at signup | Upload and analyze blueprints, assign a client to a project, log progress photos and expenses, full edit access to their own projects |
| **Client / Homeowner** | Chosen at signup | View whichever project a builder assigns to them: full read access to the analysis, 3D explorer, execution plan, progress photos and budget — but can't create projects, upload progress photos, or add/delete expenses |

**Admin is never selectable in the signup form.** The backend checks the
identifier against `ADMIN_IDENTIFIERS` on every signup *and* every login —
so if you add your email to that list after you already have an account,
you're promoted to admin automatically the next time you log in, no need to
delete and recreate your account.

**Connecting a builder and a client to the same project**: a builder
uploads a blueprint (it starts unassigned), then uses the "Client
Assignment" box on the project's Overview tab to link a client by their
email or phone number. That client must already have signed up with the
"Homeowner / Client" role — Buildeye looks them up, it doesn't create
accounts on their behalf.

All of this is enforced on the **backend**, not just hidden in the UI: a
client hitting the API directly gets a real 403/404, not just a missing
button.

---

## 4. Running it locally in VS Code

You need **Node.js 18+** installed (the AI path uses the built-in `fetch`,
which needs Node 18+). Open the `buildeye` folder in VS Code, then open two
terminals (Terminal → Split Terminal).

### Terminal 1 — backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The API starts on **http://localhost:5000**. JSON data files and an
`uploads/` folder are created automatically — no database server and no
native modules to compile, so `npm install` should never fail here even on
a fresh Windows machine.

> **If login doesn't seem to work:** the #1 cause is the frontend running
> without the backend. Make sure this terminal shows
> `Buildeye API running on http://localhost:5000` before trying to log in
> in the browser. If you skipped `cp .env.example .env`, the server will
> still start and logins will still work, but it will print a warning and
> your session will be forgotten every time you restart the server —
> run that copy command to fix it permanently.

> **Before you sign up**: open `backend/.env` and set `ADMIN_IDENTIFIERS`
> to your own email address, so your first account becomes an admin.

### Terminal 2 — frontend

```bash
cd frontend
npm install
npm run dev
```

The app opens on **http://localhost:5173**. Vite's dev server proxies
`/api/...` and `/uploads/...` requests to the backend on port 5000 (see
`vite.config.js`), so the two run together with no extra configuration.

### Using the Blueprint Analyzer

1. Log in, then open **Blueprint Analyzer** in the sidebar.
2. Upload a photo of a blueprint, architect's plan, or a hand-drawn sketch
   (JPG/PNG, under 8MB).
3. Pick a **project location** from the dropdown (e.g. Mumbai, Jaipur,
   "Other city / town"). This adjusts the construction rate per sq.ft and
   the illustrative land-value figure to that city — land and labour costs
   in Mumbai are nothing like a Tier-3 town, and the estimate now reflects
   that instead of using one flat national number. Leave it on "national
   average" if you'd rather not specify.
4. Drag the compass needle to indicate which way is North on your image —
   this is what makes the Vastu and ventilation guidance meaningful, since
   a photo alone can't reveal true north.
5. Click **Analyze blueprint**. You'll land on the project's detail page
   with tabs for Overview (room boxes + compass overlay), 3D View (drag to
   rotate), Execution & Cost (timeline, materials, labour, cost chart, land
   value), Vastu & Ventilation, Progress Photos, and Budget.
6. Under **Progress Photos**, upload a new site photo any time during
   construction to build a timeline with an estimated completion %.
7. Under **Budget**, log real expenses against the AI-estimated cost to
   track overspend as the project proceeds.

Changing the location only affects new uploads — it isn't something you can
edit on an existing project, since the plan's room layout was already
analyzed. Delete and re-upload if you picked the wrong city.

### Using the interactive 3D explorer

Open the **3D View** tab on any project. Drag anywhere on the model to
rotate it. The model is built directly from your project's actual detected
room layout — each room is its own block, sized and positioned to match its
real position in the 2D room overlay, not a generic guessed box — so
rotating it and comparing against the Overview tab's image should visibly
line up.

Three small markers float above the model — **Front**, **Middle**, and
**Rear** — corresponding to that third of the building along the depth of
your uploaded plan (the same bands used to decide which rooms show up in
each future-look panel). Click one to open it:

- It shows which rooms Buildeye detected in that section.
- It generates a stylized concept illustration and a description of how
  that section could look once finished, in your choice of **Modern
  Minimalist**, **Warm Contemporary**, or **Classic Traditional** style.
- Click **"Show another idea in this style"** to cycle through different
  furniture/layout variations without leaving the style.

The illustration is a procedurally generated SVG (`SectionIllustration.jsx`)
— always available, no image-generation API needed. The description text
is written by a template generator by default, or by Claude if you've set
`ANTHROPIC_API_KEY` (see section 6) — it will factor in the actual detected
rooms and chosen style either way.

### Deleting a project

Builders and admins can delete a project two ways: hover a project card in
the list view and click the trash icon, or open the project and use
**"Delete project"** near the top of the page (this one asks for
confirmation first, since it also removes progress photos and expense
records). Clients don't see a delete option — they have read-only access.

### Using the rest of the app

- **Settings** → change your password (verifies your current one first).
- **Remember me** on login: checked, your session survives closing the
  browser (`localStorage`) and your email/phone is pre-filled next time;
  unchecked, the session clears when you close the tab (`sessionStorage`).
- Every password field has a show/hide eye icon.
- **Overview / Roadmap / Demo: Progress Zones / Alerts / Resources / Model
  Insights** are a separate section (admin/builder only) showing what a
  multi-project company dashboard looks like, using realistic mock data —
  independent from your real Blueprint Analyzer projects.

---

## 5. Swapping in real data

- **Users**: `backend/store/userStore.js` uses a JSON file for zero-setup
  local development with no native dependencies to install. For
  production, swap it for PostgreSQL or MongoDB — only this file needs to
  change; every route only calls its exported functions, so nothing else
  in the codebase needs to know storage changed. `blueprintStore.js` and
  `expenseStore.js` follow the same pattern.
- **Company dashboard data** (Overview/Roadmap/Alerts/Resources): replace
  the arrays in `backend/data/mockData.js`.
- **Google OAuth**: replace the mock button handler in
  `frontend/src/pages/Login.jsx` / `Signup.jsx` with a real
  `@react-oauth/google` (or Firebase Auth) integration, and add a
  corresponding `/api/auth/google` route on the backend.

---

## 6. Connecting real AI vision analysis

By default, `backend/services/mockAnalyzer.js` invents a plausible room
list and plot size — it isn't real computer vision, so it can't actually
read what's drawn in your blueprint. It is, however, **deterministic and
grounded**: it's seeded from the uploaded image's actual byte content (a
SHA-256 hash), so re-uploading the exact same file always produces the
exact same analysis, and it uses the image's real pixel dimensions
(`backend/services/imageMeta.js`, a small zero-dependency JPEG/PNG parser)
to shape the room grid's aspect ratio and nudge the plot-size estimate,
rather than being pure unrelated randomness. This lets the whole feature —
including the 3D model, which is built from these same room positions —
work immediately with no setup.

**Important — you need your own API key.** Buildeye itself has no AI key to
give you: real AI vision analysis means Buildeye's backend calling
Anthropic's API on your behalf, and that call has to be billed to
somebody's Anthropic account — yours, since this is your deployment. There
is no way around getting your own key if you want real room detection
instead of the demo analyzer.

The good news is connecting it takes under a minute, no file editing:

1. Get an API key at [console.anthropic.com](https://console.anthropic.com)
   (Anthropic bills you directly for usage — typically a few cents per
   blueprint analyzed; check their current pricing).
2. Log into Buildeye as an admin and open **AI Settings** in the sidebar.
3. Paste the key in, optionally set a model name, and click **Save key**.
4. Click **Test connection** — this makes one real, minimal call to the
   Anthropic API and tells you immediately whether the key actually works,
   rather than you finding out on your next blueprint upload.

From that point on, every *new* blueprint upload is analyzed by Claude's
vision instead of the demo detector. (Already-existing projects keep
whichever analysis they were created with.) If you'd rather configure it
the traditional way, `backend/.env` still works too:

```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
```

A key saved through **AI Settings** takes priority over `.env` if both are
set (see `backend/services/aiConfig.js`, which is the one place that
decides which key wins). If the AI call fails for any reason (bad key,
network issue, unparseable response), the app automatically falls back to
the demo analyzer for that upload and shows a small note explaining why —
it never breaks the feature.

Everything downstream of room detection — execution plan, cost, Vastu,
ventilation, and the 3D model — is shared logic in
`backend/services/analysisEngine.js` and the room-position data itself, and
works identically regardless of which detector supplied the room list.

The same `ANTHROPIC_API_KEY` also upgrades the 3D explorer's concept
descriptions (`backend/services/futureLook.js`) from templated text to
real Claude-written descriptions — no extra configuration needed.

---

## 7. Notes on content

- All statistics and cost/material/labour figures are illustrative planning
  estimates, clearly commented as such in the source — not a substitute for
  a quantity surveyor's estimate or a structural engineer's plan.
- City construction-rate multipliers and land rates
  (`backend/data/locationRates.js`) are broad illustrative planning
  figures for comparing roughly how much more a metro costs than a
  smaller town — not real-estate valuations. Actual land prices vary
  enormously by exact locality, road access and approvals, and change
  constantly; always get a local valuation before making a financial
  decision based on them.
- Vastu Shastra guidance (`backend/data/vastuGuidelines.js`) is presented
  as traditional/cultural design guidance that many Indian homeowners
  choose to follow — not a structural, safety or legal requirement.
- Ventilation guidance is based on general passive-design conventions, not
  a site-specific climate study.
- Team member names and the problem-statement code in the landing page
  footer are placeholders (`[Team Member 1]`, `[PS Code]`, etc.) — fill
  these in before presenting, or remove that section if not relevant to
  your use case.
- The 3D explorer's illustrations are stylized concept art generated
  procedurally from the detected room type and chosen style — not a
  photorealistic render of your actual design. They're meant to convey
  mood and layout ideas, not an architectural rendering.

---

## 8. Tech stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, React Router, Recharts, lucide-react, axios
- **Backend**: Node.js, Express, bcryptjs, jsonwebtoken, multer (JSON-file storage, no native modules)
- **AI vision** (optional): Anthropic API — falls back to a deterministic demo analyzer if not configured

