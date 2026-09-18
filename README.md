# OpportunityHub

Helps African university students discover and track international opportunities (internships, scholarships, fellowships, research programs, hackathons, exchange programs, and more) they are actually eligible for.

## Status
Stage 1 of the roadmap: project scaffolding + working JWT auth backend.
See the full architecture, roadmap, and API design in the conversation where this was built - this README will be expanded stage by stage.

## Tech stack
React + Vite (client) · Node.js + Express (server) · MongoDB + Mongoose · JWT + bcryptjs

## Setup (Stage 1 - backend only so far)

1. `cd server && npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `MONGO_URI` - from your MongoDB Atlas cluster (see below)
   - `JWT_SECRET` - run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` and paste the result
3. `npm run dev` - starts the server with auto-restart on file changes
4. `npm test` - runs the auth logic tests

### Getting a MongoDB Atlas connection string
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Database Access -> add a database user with a password
3. Network Access -> allow your current IP (or 0.0.0.0/0 for early development)
4. Connect -> "Drivers" -> copy the connection string, replace `<username>`/`<password>`, and add a database name before the `?` (e.g. `/opportunityhub?`)
5. Paste it as `MONGO_URI` in your `.env`

## API so far

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Create an account |
| POST | /api/auth/login | Public | Get a JWT |
| GET | /api/auth/me | Required | Get current user |
| PATCH | /api/auth/profile | Required | Update profile fields |
| PATCH | /api/auth/password | Required | Change password |

There's no `/logout` endpoint - with JWT, "logging out" just means the frontend deletes the stored token. The server has nothing to invalidate.
