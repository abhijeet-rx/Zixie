# Zixie frontend handoff

Use this document as the product and implementation brief for redesigning Zixie's frontend. It describes the current codebase and the product it is meant to support. You can replace the visual design from scratch, but keep the product accurate: clearly distinguish live server-backed behavior from demo or local-only screens.

## Product summary

Zixie is a code-submission review workspace for instructors and academic integrity teams. It analyzes a cohort of programming submissions, finds pairs of code with similar structure, surfaces possible AI-writing signals, and helps a reviewer inspect the evidence. The product is a triage and review aid. Similarity and heuristic AI signals are not proof of misconduct and should never be presented as a final accusation.

The main user journey is:

1. Sign in or create an account.
2. Upload source files or a ZIP of submissions.
3. Review cohort-level counts and items needing attention.
4. Open a candidate dossier, a suspicious pair, or an AI-signal record.
5. Inspect matched code and the scoring evidence.
6. Export the current report as CSV or JSON.

## Product and visual direction

Build a focused, professional review console for educators. Make it feel considered and calm, with clear hierarchy, readable code, compact but comfortable data tables, restrained color, and strong empty/loading/error states. Avoid generic AI product styling: no glowing gradients, oversized marketing headlines, decorative blobs, arbitrary badges, or unnecessary card grids. Use color to communicate state and risk, always with text or an icon as a second cue. Keep evidence and reviewer judgment central.

The existing app uses React, TypeScript, Vite, React Router, and a left navigation rail with a global header. The current interface includes light and dark themes. A redesign may revise the layout and component system while preserving the product routes and workflows below.

## Roles and terminology

- **Reviewer**: authenticated instructor or administrator using the app.
- **Assessment / cohort**: a set of submissions being reviewed together. The current Assessments page is a mock/local-only concept; the backend currently processes uploaded batches as reports rather than persisted assessment entities.
- **Candidate / submission**: a student's submitted source file. The engine calls each record a `CandidateSubmission` and stores a candidate name, filename, language, source code, and optional submission time.
- **Pair comparison**: analysis of two candidates' source code, including a combined similarity score, Winnowing score, Greedy String Tiling score, matched token tiles, and a verdict.
- **Collusion cluster**: a connected group of candidates whose pair scores pass the clustering rules. A cluster is a lead for human review, not a conclusion.
- **AI signal**: a heuristic score and reason list. It is not produced by a trained AI classifier and should not be labeled as a certainty.

## Routes and navigation

The current client routes are:

| Route | Screen | Purpose |
| --- | --- | --- |
| `/auth` | Sign in / create account | Account access |
| `/` | Overview | Cohort/report summary and review queue |
| `/assessments` | Assessments | Assessment list and local assessment form; currently mock/local-only |
| `/submissions` | Submissions | Candidate list, filters, and selected-candidate dossier |
| `/similarity` | Similarity | Pairwise score matrix, pair detail, and cluster summary |
| `/ai-detection` | AI signals | Heuristic AI signal scores, reasons, and flags |
| `/reports` | Reports | Current report summary and CSV/JSON export |
| `/team` | Team | Mock team list and local invite interactions |
| `/integrations` | Integrations | Mock integrations and local toggles |
| `/settings` | Settings | Local-only thresholds/preferences form |

The app has a shared workspace shell with navigation, global search, theme, language, and utility controls. Global search can route to a matching page or search submissions. The current header also has dark/light theme, English/Hindi selection (navigation text is only partially translated), share-page, text-size, searchable FAQ, keyboard-shortcut help, back-to-top, and reading-progress utilities. Preserve these only if they fit the new design; implement each as a real interaction and do not imply unsupported behavior.

There is no distinct backend API for assessment CRUD, team management, integrations, or settings at present. These pages should either be presented honestly as prototypes/local preferences or left out of a first production-ready redesign.

## Screen requirements

### Authentication

Login and registration use name (registration only), email, and password. Include password visibility, loading, validation, and useful API error states. The session is cookie-based in the browser; the JWT itself is not meant to be read or stored by frontend JavaScript.

### Overview

Show a compact report/cohort summary and a review queue. The current summary has four clickable KPI cards:

- Submissions analyzed → `/submissions`
- Candidates needing attention → `/submissions?filter=attention`
- Collusion clusters → `/similarity`
- AI signals → `/ai-detection`

The current demo data has six candidates, fifteen pair comparisons, one cluster, and one likely-AI heuristic signal. These numbers are sample data, not guaranteed live values. Do not hard-code them as production facts. Make metric cards navigable, as requested by the user. The review queue should link to the relevant pair/candidate and state that flags require human review.

### Submissions

The page supports uploading `.zip`, `.py`, `.java`, `.cpp`, `.c`, `.ts`, `.js`, and `.go` from the client UI. The server's ZIP extraction currently accepts `.js`, `.ts`, `.jsx`, `.tsx`, `.cpp`, `.cc`, `.c`, `.java`, and `.py`; keep frontend validation aligned with actual support before adding formats. The backend analyzes a batch and returns a report. Show progress, invalid-file feedback, upload errors, and success with navigation to the resulting report.

The current page has candidate search by name or filename, filters for all / attention / clean, and sorting by risk / similarity / name. `?filter=attention` is supported. Its split view shows the selected candidate's file and code, most similar partner, score details, AI signal, cluster, and a code comparison entry point. Preserve a responsive way to move between the list and candidate detail on small screens.

### Similarity

Show an interactive N×N pairwise heatmap/matrix. Selecting a pair should open a detail view with both candidates, the combined score, individual Winnowing and tiling scores, verdict, matched regions, and a side-by-side code diff. Include an accessible alternative to color-only matrix interpretation (labels/tooltips/table/list). Show cluster membership as a review lead. Do not call this AST analysis: the current engine tokenizes source and uses fingerprinting plus Greedy String Tiling; it does not parse syntax trees.

### AI signals

Show candidate-level heuristic AI probability, verdict, reasons, and indicator flags. Sort/filter records by score or status. Explain in plain language that this is a heuristic review signal, not proof and not a trained ML verdict. Avoid accusatory language.

### Reports

Export the currently loaded report as CSV or JSON in the browser. Show report metadata, candidate and pair counts, flagged pairs, and clear export feedback. There is currently no report history/list API; persisted reports are retrieved only by ID through the server API.

### Assessments, team, integrations, settings

These screens are currently prototypes. Assessments are seeded from static mock data, with a local form and localStorage draft title/language. Due dates and submission counts are hard-coded. Settings thresholds and preferences are local state and a fake success toast; values are not stored or applied to the analysis engine. Integrations and API-key display are mock/local-only. Team members and invite behavior are hard-coded/local-only. Do not represent these as saved server data. A polished initial redesign can label them as demo features or simplify their availability.

## Analysis behavior and limits

The analysis engine lives in `packages/engine` and is language-agnostic token analysis, not semantic understanding:

1. It removes comments and Python triple-quoted documentation strings, maps string literals to `$STR`, numeric literals to `$NUM`, and many custom identifiers to `$ID`, while retaining keywords, operators, punctuation, and source line information.
2. Winnowing hashes token k-grams (default `k=8`) and selects minimum fingerprints across windows (default `w=6`). Its score compares fingerprint sets using Dice similarity.
3. Greedy String Tiling finds maximal non-overlapping matching token runs (default minimum run length 5).
4. The combined score is `0.35 × Winnowing + 0.65 × Tiling`, rounded to three decimals.
5. Pair verdict defaults: suspicious at `0.55`, collusion detected at `0.80`; below that is clear.
6. A batch compares all pairs, so there are `N × (N − 1) / 2` comparisons.
7. AI signals use simple heuristics: comment/documentation patterns, canonical identifier names, formatting regularity, comment density, and common boilerplate indicators. They are not a model inference.
8. Cluster construction currently has separate thresholds: candidate graph edges start at `0.4`, clusters join at `0.70`. This differs from the pair verdict's `0.80` collusion threshold. Risk is then assigned from cluster membership and AI heuristic verdict.

Scores depend on source length and tokenizer behavior. Avoid displaying them as calibrated probabilities except for the explicitly named heuristic AI probability. Show component scores and evidence so reviewers can interpret a result.

## API and data contract

The Fastify server listens on port `4000`. Vite serves the client on port `3000` and proxies `/api` to the server. Current API endpoints:

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Server and database health (`healthy` or `degraded`) |
| `POST` | `/api/auth/register` | Public | Create account and establish session |
| `POST` | `/api/auth/login` | Public | Login and establish session |
| `GET` | `/api/auth/me` | Cookie session | Return current user/session state |
| `POST` | `/api/auth/logout` | Cookie session | Clear the session cookie |
| `GET` | `/api/demo` | Required | Return demo candidates and report |
| `POST` | `/api/analyze` | Required | Analyze an uploaded batch and save report |
| `GET` | `/api/reports/:id` | Required | Fetch a report owned by the current user |
| `GET` | `/api/reports/:id/compare?candidateA=…&candidateB=…` | Required | Compare two candidates from an owned report |

The analyze and demo responses have the shape:

```ts
{
  reportId: string;
  candidates: CandidateSubmission[];
  report: AnalysisReport;
}
```

Candidate shape:

```ts
{
  id: string;
  candidateName: string;
  filename: string;
  language: string;
  sourceCode: string;
  submittedAt?: string;
}
```

Pair similarity result:

```ts
{
  candidateAId: string;
  candidateBId: string;
  similarityScore: number;
  winnowingScore: number;
  tilingScore: number;
  matchedTiles: Array<{
    sourceStartLine: number;
    sourceEndLine: number;
    targetStartLine: number;
    targetEndLine: number;
    tokenCount: number;
  }>;
  verdict: "CLEAR" | "SUSPICIOUS" | "COLLUSION_DETECTED";
}
```

AI result includes `candidateId`, `aiProbability` from 0 to 1, `reasons`, flags (`verboseDocstrings`, `uniformCommentDensity`, `canonicalNamingPattern`, `lowEntropyFormatting`, `standardAiBoilerplate`), and verdict `HUMAN_LIKELY`, `SUSPICIOUS`, or `AI_GENERATED_LIKELY`.

Use `fetch` with `credentials: "include"` for API requests. Handle `401` by routing to `/auth`. Do not put JWTs in localStorage/sessionStorage. Upload as multipart form data with the field name expected by the current server (inspect the API implementation before finalizing a client integration). The report is owned by the authenticated user; never allow the client to imply another user's report can be fetched.

## Authentication, persistence, and runtime setup

The server uses Fastify, Mongoose/MongoDB, `@fastify/jwt`, `@fastify/cookie`, and rate limiting. User passwords are hashed with Node's `scrypt`. The JWT is delivered in an HttpOnly, SameSite=Strict cookie with a 12-hour expiry and `secure` enabled in production. Email addresses are normalized to lowercase and unique. Report reads are scoped to the owner.

Required root environment values (use `.env.example` as the template):

```env
MONGODB_URI=mongodb://127.0.0.1:27017/zixie
JWT_SECRET=replace-with-a-unique-secret-at-least-32-characters
NODE_ENV=development
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
```

Important current setup limitation: MongoDB/JWT support has been added in the code, but this workspace did not have a configured `MONGODB_URI`, `JWT_SECRET`, or running MongoDB instance when it was last inspected. The app therefore cannot establish a live database-backed session until those are configured. Keep setup errors visible and actionable; do not claim the integration is live just because the code exists.

## Existing frontend behavior to preserve or deliberately redesign

- React + TypeScript client under `packages/client`.
- Fastify server under `packages/server` and analysis engine under `packages/engine`.
- App route handling is in `packages/client/src/App.tsx`; shared workspace layout is in the workspace components.
- Authentication state is in `packages/client/src/store/auth.ts` and calls the server API.
- The user asked for navigation buttons on the overview metric blocks and asked to remove the “2 min read” and related reading-meta line. Those changes are already reflected in the current source; preserve them in any rewrite.
- Keep keyboard access, focus visibility, accessible labels, and responsive layouts. Tables, score matrix, and code diff need usable mobile alternatives.
- Do not add fake charts, fake activity, fake people, fake save states, fake backend calls, or generated-looking filler copy.

## Suggested build order

1. Inspect the existing route tree and API handlers, then make the frontend compile and route consistently.
2. Establish shared typography, spacing, colors, layout, buttons, fields, dialogs, toasts, and status styles.
3. Build auth and the shared authenticated shell.
4. Build overview, submissions, similarity/diff, AI signals, and report export from the real API response shape.
5. Add deliberate loading, empty, error, unauthorized, and database-unavailable states.
6. Decide whether mock-only areas are clearly marked or hidden until they have real persistence.
7. Verify the responsive experience and main navigation/upload/review/export flow in the running app.

## Prompt to give another frontend AI

```text
Redesign Zixie's frontend using ZIXIE_FRONTEND_HANDOFF.md as the source of truth. Start by inspecting the current repository and preserve its working React/TypeScript/Vite/Fastify integration. Replace the visual system with a distinctive, restrained educator-facing code review console. Make it polished and human-designed: clear hierarchy, careful spacing, useful density, crisp typography, meaningful states, and no generic AI gradients, filler content, or decorative noise.

Implement the authenticated workflow: sign in/register, overview with clickable metrics, upload and search/filter submissions, candidate dossier, pairwise similarity matrix and evidence/diff, heuristic AI signal review, and CSV/JSON report export. Keep language honest: similarity and AI results are review signals, the AI detector is heuristic, and Assessments/Team/Integrations/Settings are local mock screens unless you actually connect them. Respect the documented API, cookie session behavior, and MongoDB setup limitation. Do not hard-code demo metrics as live results or claim a database connection when health reports degraded.

Retain the user's requested metric-card navigation and remove the old “2 min read” and related reading-meta line. Make keyboard/focus states and responsive behavior deliberate. Inspect actual server upload field names and response types before wiring requests. After implementing, report the files changed, actual API integrations, any remaining mock behavior, and how to run the client and server.
```
