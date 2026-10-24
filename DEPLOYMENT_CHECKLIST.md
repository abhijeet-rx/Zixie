# Zixie deployment checklist

This repository is prepared for a two-project Vercel deployment: the Vite client in `packages/client` and the Fastify API in `packages/server`. Keep the original frontend handoff file unchanged.

## Preparation status

- [x] Confirm the monorepo layout and deployment split.
- [x] Confirm MongoDB schemas and indexes already exist in source.
- [x] Add reproducible client and API deployment build commands that build the shared engine first.
- [x] Add client-side API origin configuration and SPA route fallback.
- [x] Make production CORS require exact allowed frontend origins.
- [x] Add a latest-report API so a signed-in user can load saved analysis on a new browser session.
- [x] Return persisted report metadata from the upload API.
- [x] Bound uploaded source code to 4 MiB for Vercel Functions.
- [x] Document local and Vercel environment variables.
- [ ] Create a MongoDB Atlas cluster and database user; add the Atlas URI to the Vercel API project.
- [ ] Create the two Vercel projects and connect a Git repository.
- [ ] Choose frontend and API hostnames under the same custom domain (for example `zixie.example.com` and `api.example.com`) so secure SameSite cookies work consistently.
- [ ] Add the production environment variables, deploy, then verify `/api/health`, sign-up/login, upload, and report reload.

## MongoDB schema

No schema needs to be designed from scratch. The application already defines:

- `User` in `packages/server/src/models/user.ts`: name, unique email, password hash, and timestamps.
- `Report` in `packages/server/src/models/report.ts`: report ID, owner ID, candidate source files, analysis output, creation timestamp, and owner/date indexes.

Mongoose creates the collections and indexes as the API writes its first records. Create an Atlas cluster and a database user with read/write access to the chosen database; the API does not run a separate schema migration today.

## Local setup

1. Copy `.env.example` to `.env` and set `MONGODB_URI` to a reachable MongoDB instance.
2. Replace `JWT_SECRET` with a unique random secret of at least 32 characters.
3. Run `npm install`, then `npm run dev` from the repository root.
4. Keep `VITE_API_BASE_URL` unset locally; Vite proxies `/api` to `http://localhost:4000`.

## Vercel projects

Import the same repository twice, once for each application. For **both** projects, set Root Directory to the respective package directory and enable **Include source files outside of Root Directory in the Build Step**, because both apps import the shared workspace engine.

### Frontend project

- Root Directory: `packages/client`
- Framework: Vite
- Build Command: `npm --prefix ../.. run build:client:deploy`
- Output Directory: `dist`
- Environment variable for Production and Preview: `VITE_API_BASE_URL=https://api.example.com` (use the actual API hostname)
- `packages/client/vercel.json` provides the SPA fallback for routes such as `/similarity` and `/submissions`.

### API project

- Root Directory: `packages/server`
- Framework: Fastify (Vercel detects `src/index.ts`)
- Build Command: `npm --prefix ../.. run build:server:deploy`
- Environment variables for Production and Preview:
  - `MONGODB_URI`: Atlas connection string, including the database name.
  - `JWT_SECRET`: unique random secret, at least 32 characters.
  - `CLIENT_ORIGINS`: exact browser origin(s), comma-separated if needed, such as `https://zixie.example.com`.
  - Set `NODE_ENV=production` if it is not already supplied by the Vercel runtime.
- Do not set `PORT`; Vercel manages the function port.

Set the frontend and API hostnames under the same custom domain to keep the authentication cookie same-site. Configure the frontend's exact origin in `CLIENT_ORIGINS`; do not use `*` with credentials.

## MongoDB Atlas network access

Atlas only accepts connections from addresses on its project IP access list. Vercel function egress addresses may not be fixed on the deployment plan in use. Prefer a Vercel-supported static egress option when available. If using a broad Atlas IP rule as a temporary workaround, understand that `0.0.0.0/0` permits connection attempts from any address; compensate with a strong database user password, least-privilege database access, and TLS, then replace the broad rule when static egress is available.

## Upload limit

The analysis endpoint accepts a maximum of 4 MiB of extracted source per batch. Vercel Functions have a 4.5 MB request/response payload limit, so larger uploads should later move to direct object-storage uploads instead of increasing this function limit.

## Final verification after credentials and domains exist

1. Confirm `https://api.example.com/api/health` reports `healthy` and `connected`.
2. Register, log in, and confirm the browser receives the secure `zixie_token` cookie.
3. Upload two or more source files below the batch limit and inspect the analysis.
4. Refresh `/submissions` and confirm the latest saved report reloads.
5. Confirm an unrelated browser origin cannot call credentialed API routes.
