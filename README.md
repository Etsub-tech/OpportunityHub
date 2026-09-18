# OpportunityHub

**Find opportunities you can actually apply for.**

OpportunityHub is an Africa-first platform that centralizes international internships,
scholarships, fellowships, research programs, hackathons, summer schools, and remote
opportunities — then tells students, in plain and explainable terms, whether they're
actually eligible based on their country, degree, study level, graduation year, and
skills. It's built for students who currently have to check a dozen websites manually
and track deadlines in a spreadsheet.

## Table of contents
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Folder structure](#folder-structure)
- [Eligibility matching, explained](#eligibility-matching-explained)
- [Data collection architecture](#data-collection-architecture)
- [Setup](#setup)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [Testing](#testing)
- [Deployment](#deployment)
- [Data sources actually implemented](#data-sources-actually-implemented)
- [Limitations & future work](#limitations--future-work)

## Features
- JWT authentication (register/login/profile/change password)
- Opportunity discovery: keyword search, filters (type/country/remote/field/funding/
  study level), sorting, server-side pagination
- Explainable eligibility matching (never a fake AI percentage)
- Save opportunities + a full application tracker (Saved → Preparing → Applied →
  Interview → Accepted/Rejected) with notes
- Deadline awareness ("12 days left", expired opportunities visually distinguished)
- User submissions with admin approve/reject
- Admin dashboard: manage opportunities, review submissions, platform stats, trigger
  data collection manually
- Modular data ingestion pipeline with one real, verified, credential-free source
  (Greenhouse's public jobs API) and a scheduled 6-hour refresh job

## Tech stack
React + Vite (JS, plain CSS) · Node.js + Express · MongoDB + Mongoose · JWT + bcryptjs

Deliberately excluded: TypeScript, Redux, Tailwind, GraphQL, Redis, Docker,
microservices — see [Limitations & future work](#limitations--future-work) for when
these would actually become necessary.

## Architecture

```
React (Vite SPA)  --HTTP/JSON-->  Express API  --Mongoose-->  MongoDB Atlas
                                        |
                                  scheduled job
                                        |
                              opportunitySources/*.js
                              (Greenhouse public API)
```

Request flow for a typical read, e.g. Discover:
```
Browser -> opportunityService.getOpportunities()
        -> GET /api/opportunities?...
        -> routes/opportunityRoutes.js
        -> controllers/opportunityController.js: getOpportunities()
        -> Opportunity.find(filter).sort().skip().limit().lean()
        -> MongoDB
        -> JSON response -> React state -> OpportunityCard components
```

Request flow for a protected write, e.g. saving an opportunity:
```
Browser -> applicationService.saveOpportunity()
        -> POST /api/applications  (Authorization: Bearer <token>)
        -> middleware/authMiddleware.js: protect()  [verifies JWT, loads req.user]
        -> controllers/applicationController.js: createApplication()
        -> Application.create(...)
        -> MongoDB
```

## Folder structure
```
opportunity-hub/
  client/              React + Vite frontend
    src/
      components/      Navbar, OpportunityCard, MatchResult, ProtectedRoute, ...
      pages/            One file per route, plus pages/admin/ for admin-only pages
      services/         One file per backend resource - the ONLY place fetch() is called
      context/          AuthContext - global "who's logged in" state
      utils/            Pure helpers (deadline formatting)
  server/              Express backend
    models/            Mongoose schemas: User, Opportunity, Application, Submission
    controllers/        Request handlers - read the request, call the model/service, respond
    routes/             URL -> controller wiring only
    middleware/         protect/requireAdmin (auth), errorHandler/notFound (errors)
    services/           Logic bigger than one request: matching, ingestion, duplicate detection
      opportunitySources/   One file per external data source
    jobs/                The scheduled ingestion job
    seed/                Demo data seeding script
    tests/               Unit tests (no DB) + integration tests (real DB, see Testing)
```

## Eligibility matching, explained

`server/services/matchingService.js` exports one function:
`checkEligibility(user, opportunity)`. It runs a fixed series of independent checks
(country, degree, study level, graduation year window, skills, remote preference) and
returns `{ verdict, checks: [{ status, message }] }` where `status` is one of:

- **match** — the opportunity states a requirement and the user meets it
- **mismatch** — the opportunity states a requirement and the user does NOT meet it
- **unknown** — the opportunity simply doesn't state anything for this criterion

The overall `verdict` is **"Not a Match"** if there's any mismatch, **"Potential
Match"** if there's at least one confirmed match and no mismatches, or **"Check
Eligibility Details"** if every criterion is unknown. This is deliberately NOT a
percentage or an AI-generated score — every line is traceable to a specific rule you
can read in the source file.

## Data collection architecture

```
Source config  ->  Fetcher  ->  (source already returns normalized shape)  ->
Duplicate detection  ->  Insert or Update  ->  MongoDB
```

- **Sources** live in `server/services/opportunitySources/` — one file per source,
  each exporting a function that returns opportunities already shaped like the
  `Opportunity` model. Adding a new source means writing one new file and adding one
  line to `SOURCES` in `ingestionService.js` — nothing else changes.
- **Duplicate detection** (`duplicateDetectionService.js`) checks, in order: same
  source + sourceId, then same applicationUrl, then a normalized
  title+organization+location match. It's a heuristic, not a guarantee — see the
  comments in that file for the tradeoffs.
- **Scheduling** (`jobs/ingestionJob.js`) uses plain `setInterval`, not a job queue
  library — appropriate for one recurring job on one server. A production
  multi-server deployment would instead use an external cron trigger hitting
  `POST /api/admin/ingest/run`, to avoid two servers running the job at once.
- A failed source or a bad individual item is logged and skipped — it never crashes
  ingestion for other sources, and never crashes the server.

## Setup

### 1. MongoDB Atlas
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Database Access → add a database user + password
3. Network Access → allow your IP (or `0.0.0.0/0` while developing)
4. Connect → Drivers → copy the connection string, fill in your credentials, add a
   database name before the `?` (e.g. `/opportunityhub?`)

### 2. Backend
```
cd server
npm install
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET (see below)
npm run dev
npm run seed:demo         # optional - inserts 4 clearly-labeled demo opportunities
```

### 3. Frontend
```
cd client
npm install
cp .env.example .env      # defaults to http://localhost:5000/api, fine for local dev
npm run dev
```
Visit http://localhost:5173.

## Environment variables

**server/.env**
| Variable | Required | Notes |
|---|---|---|
| `MONGO_URI` | Yes | Your Atlas connection string |
| `JWT_SECRET` | Yes | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `PORT` | No | Defaults to 5000 |
| `CLIENT_URL` | Yes | For CORS — your frontend's URL |
| `GREENHOUSE_BOARD_TOKENS` | No | Comma-separated company slugs, e.g. `gitlab,discord` — see `.env.example` for how to find one |
| `ENABLE_INGESTION_JOB` | No | Set `false` to disable the automatic 6-hour job locally |
| `TEST_MONGO_URI` | No | A separate, disposable database for integration tests only |

**client/.env**
| Variable | Notes |
|---|---|
| `VITE_API_URL` | Backend base URL, e.g. `http://localhost:5000/api` |

Never commit real values — both `.env` files are already in `.gitignore`.

## API overview

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me                    (protected)
PATCH  /api/auth/profile               (protected)
PATCH  /api/auth/password              (protected)

GET    /api/opportunities              (search/filter/sort/paginate)
GET    /api/opportunities/:id
GET    /api/opportunities/:id/match    (protected)

POST   /api/applications               (protected - save/track)
GET    /api/applications               (protected - full tracker + counts)
PATCH  /api/applications/:id           (protected)
DELETE /api/applications/:id           (protected)

POST   /api/submissions                (protected)
GET    /api/submissions/mine           (protected)

POST   /api/admin/opportunities        (admin)
PATCH  /api/admin/opportunities/:id    (admin)
DELETE /api/admin/opportunities/:id    (admin)
GET    /api/admin/submissions          (admin)
PATCH  /api/admin/submissions/:id      (admin - approve/reject)
GET    /api/admin/stats                (admin)
POST   /api/admin/ingest/run           (admin)
```

## Testing

```
cd server
npm test                  # unit tests: bcrypt/JWT logic + eligibility matching (no DB needed)
npm run test:integration  # full request-flow tests against a REAL database (set TEST_MONGO_URI first)
```

Unit tests never touch a database — they test pure functions directly. Integration
tests spin up real Mongoose models against `TEST_MONGO_URI` (a disposable database you
configure) to prove things like the unique `{user, opportunity}` index actually
rejects duplicate saves, and that pagination math is correct against real documents.

Manual test checklist (Postman or the running frontend):
- [ ] Register → login → GET /api/auth/me returns your user
- [ ] Update profile → GET /api/auth/me reflects the change
- [ ] GET /api/opportunities with no params returns paginated results
- [ ] Adding `?opportunityType=Internship` narrows results correctly
- [ ] GET /api/opportunities/:id/match without a token → 401
- [ ] GET /api/opportunities/:id/match with a token → explainable checks
- [ ] Save an opportunity → saving it again → 400 "already saved"
- [ ] PATCH an application's status → tracker reflects it
- [ ] Submit an opportunity as a normal user → visible in /admin/submissions
- [ ] Approve a submission as admin → it appears in /api/opportunities
- [ ] A non-admin hitting any `/api/admin/*` route → 403

## Deployment

Recommended simple setup: **Frontend → Vercel, Backend → Render, Database → MongoDB
Atlas** (all free-tier friendly).

**Backend (Render)**: New Web Service → point at `server/` → build command
`npm install` → start command `npm start` → add the same environment variables as
your local `.env` (`MONGO_URI`, `JWT_SECRET`, `PORT`, `CLIENT_URL` set to your deployed
frontend's URL, plus `GREENHOUSE_BOARD_TOKENS` if you're using it).

**Frontend (Vercel)**: Import the repo, set root directory to `client/`, add
`VITE_API_URL` pointing at your deployed backend's URL (e.g.
`https://your-app.onrender.com/api`).

**MongoDB Atlas**: In Network Access, allow Render's outbound IPs (or `0.0.0.0/0` if
you accept the tradeoff for a student project).

## Data sources actually implemented

Only **Greenhouse's public jobs API** is wired up (`GET
https://boards-api.greenhouse.io/v1/boards/{token}/jobs`) — real, public, no API key.
It returns general job postings (heuristically tagged "Internship" if the title
contains "intern"), not scholarship/fellowship-specific listings — those currently rely
on admin entry and user submissions. Adding Adzuna, Lever, or an RSS-based source is
straightforward (one new file in `opportunitySources/`) but not implemented here, to
avoid claiming a source works before it's actually been verified end-to-end.

## Limitations & future work
- No email notifications yet (deadline reminders) — the architecture supports adding
  this without restructuring anything.
- Country eligibility is checked against an explicit `eligibleCountries` list an
  opportunity states — it can never verify actual visa/work authorization, and the UI
  is intentionally worded ("appears eligible", not "you ARE eligible") to reflect that.
- The Discover admin list (`/admin/opportunities`) loads up to 50 items without its own
  pagination — fine at current scale, would need pagination controls with thousands of
  listings.
- At real scale (10,000+ users), the next real bottleneck would be the `$text` search
  index and repeated external-API calls during ingestion — solvable with MongoDB Atlas
  Search and response caching respectively, without needing Elasticsearch or Redis
  immediately.
