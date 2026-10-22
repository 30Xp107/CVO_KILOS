# KILOS Profiling

A mobile-responsive MERN application for the DSWD Walang Gutom Program **KILOS Profiling Form**, with a secure admin portal for reviewing submissions, exporting the full dataset to Excel, and downloading an individual response as a six-page PDF that follows the original paper form.

The project is split into two independent deployable packages:

- `frontend/` - React 18 + Vite public form and admin portal
- `backend/` - Express 4 + MongoDB/Mongoose REST API, Excel and PDF generation

---

## Features

### Public form

- Five-step wizard covering the KILOS profiling sections:
  1. Personal information and household members
  2. Skills, training, livelihood, and employment background
  3. Opportunities and assistance interests, with priority ranking
  4. Needs, specialized support, constraints, and goals
  5. Review, consent, and signature
- Conditional sections for Skills Training, Employment, Livelihood, Education, and Specialized Support.
- Dynamic household member rows (up to 10).
- Required-field and format validation with inline errors.
- Autosaved draft in the browser, so a reload does not lose progress.
- Reference number shown after a successful submission.
- Responsive layout tested for phone, tablet, and desktop.

### Admin portal

- JWT-based sign-in with bcrypt password hashing.
- Overview dashboard with totals, status breakdown, monthly submissions, and common needs.
- Searchable and filterable response list:
  - text search
  - status
  - date range
  - newest/oldest sorting
  - pagination
- Detail view with the complete submitted profile.
- Staff-only update panel for referral pathway, partners, remarks, interview details, and status.
- Excel export of all matching records.
- PDF export of a single record.
- Password change and sign out.
- Deletion of a response with confirmation.

### Export formats

**Excel** (`.xlsx`) contains three sheets:

- `KILOS Responses` - one row per submission with flattened sections
- `Household Members` - one row per household member
- `Summary` - status counts, assistance interests, and export metadata

**PDF** (`.pdf`) recreates the paper form on A4 pages, including:

- filled checkboxes and text fields
- household member table
- priority rankings and conditional sections
- staff/referral section
- running header and page footer

---

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 18, Vite 6, React Router 7, lucide-react |
| Backend | Node.js, Express 4, Mongoose 8, Zod |
| Auth | JSON Web Tokens, bcryptjs |
| Exports | ExcelJS, PDFKit |
| Database | MongoDB (local or MongoDB Atlas) |
| Deployment | Vercel (two projects) |

---

## Requirements

- Node.js 20 or newer
- npm 9 or newer
- MongoDB 6+ locally, or a MongoDB Atlas connection string

---

## Local setup

From the project root:

```bash
npm run setup
```

`npm run setup` installs the root convenience dependency plus `backend/` and `frontend/` dependencies. A plain root `npm install` does **not** install the two child packages.

### 1. Configure the backend

Create `backend/.env` from the example file.

Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

macOS/Linux:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/kilos_profiling
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d

ADMIN_NAME=KILOS Administrator
ADMIN_EMAIL=admin@kilos.local
ADMIN_PASSWORD=Admin@Kilos2026

CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

Notes:

- The first administrator is created automatically the first time someone signs in, but only when the `admins` collection is empty.
- If an admin already exists, changing `ADMIN_EMAIL` or `ADMIN_PASSWORD` in `.env` does not overwrite it. Use the Settings page to change the password.
- `JWT_SECRET` has an insecure development fallback, but production requires a real secret.
- Dashboard dates, date filters, reference-number years, and exported timestamps are calculated in `Asia/Manila`, so they remain correct when Vercel runs in UTC.
- For Atlas, create a database user and allow access from your current IP (or `0.0.0.0/0` for Vercel).

### 2. Optional: seed demo data

```bash
npm run seed
```

This creates the admin account from `backend/.env` and ten realistic demo submissions. Demo records use reference numbers beginning with `KILOS-DEMO-`.

Replace demo records (only `KILOS-DEMO-*` records are removed):

```bash
npm run seed:force
```

The same commands can be run inside `backend/`:

```bash
npm run seed -- --force
```

To remove only `KILOS-DEMO-*` records without creating an administrator or demo data:

```bash
npm run seed:clear
```

### 3. Run both apps

```bash
npm run dev
```

This starts:

- Frontend: <http://localhost:5173>
- Backend API: <http://localhost:5001/api>
- Admin sign-in: <http://localhost:5173/admin/login>

The Vite dev server proxies `/api` to `localhost:5001`, so `frontend/.env` is not required for local development.

Default local credentials from `.env.example`:

```text
Email:    admin@kilos.local
Password: Admin@Kilos2026
```

Change these before any real deployment.

---

## Root scripts

| Script | Description |
| --- | --- |
| `npm run setup` | Install root, backend, and frontend dependencies |
| `npm run dev` | Run backend and frontend together |
| `npm run dev:backend` | Run only the API on port 5001 |
| `npm run dev:frontend` | Run only Vite on port 5173 |
| `npm run build` | Production build of the frontend into `frontend/dist` |
| `npm run seed` | Create the admin and demo records if none exist |
| `npm run seed:force` | Delete and recreate only `KILOS-DEMO-*` records |
| `npm run seed:clear` | Delete only `KILOS-DEMO-*` records without creating data |
| `npm start` | Start the backend API without the Vite dev server |

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Production | Secret used to sign admin tokens; use a long random value |
| `JWT_EXPIRES_IN` | No | Token lifetime, default `7d` |
| `ADMIN_NAME` | No | Name for the initial administrator |
| `ADMIN_EMAIL` | First login | Email for the initial administrator |
| `ADMIN_PASSWORD` | First login | Password for the initial administrator (minimum 8 characters) |
| `CORS_ORIGIN` | Production | Comma-separated allowed frontend origins. When omitted in production, browser API requests are blocked. |
| `PORT` | No | Local API port, default `5001` |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Production | Backend base URL ending in `/api`, e.g. `https://kilos-api.vercel.app/api` |

Vite reads `VITE_*` variables at build time. Rebuild or redeploy after changing them.

---

## API routes

All routes are prefixed with `/api`.

### Public

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/health` | Service health check |
| `POST` | `/submissions` | Submit a profiling form (rate limited, honeypot protected) |
| `POST` | `/auth/login` | Admin sign-in (rate limited) |

### Authenticated

Send `Authorization: Bearer <token>`.

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/auth/me` | Current admin profile |
| `PATCH` | `/auth/password` | Change password |
| `GET` | `/admin/stats` | Dashboard totals and breakdowns |
| `GET` | `/admin/submissions` | Paginated list; supports `page`, `limit`, `search`, `status`, `from`, `to`, `sort` |
| `GET` | `/admin/submissions/:id` | Single submission |
| `PATCH` | `/admin/submissions/:id` | Update status and staff/referral fields |
| `DELETE` | `/admin/submissions/:id` | Delete a submission |
| `GET` | `/admin/export/excel` | Excel workbook; accepts the same filters as the list |
| `GET` | `/admin/submissions/:id/pdf` | Six-page PDF for one submission |

Submission statuses are `new`, `in_review`, `referred`, and `completed`.

---

## Project structure

```text
.
├── backend/
│   ├── index.js                 # Vercel zero-config Express entry
│   ├── server/
│   │   ├── app.js               # Express app, CORS, security headers
│   │   ├── db.js                # Cached Mongoose connection
│   │   ├── dev.js               # Local server entry
│   │   ├── bootstrap.js         # First-admin creation
│   │   ├── models.js            # Submission and Admin schemas
│   │   ├── time.js              # Asia/Manila reporting helpers
│   │   ├── validation.js        # Zod request schemas
│   │   ├── seed.js              # Admin + demo data
│   │   ├── exports/
│   │   │   ├── excel.js         # Three-sheet workbook
│   │   │   └── pdf.js           # Six-page form-style PDF
│   │   ├── middleware/auth.js   # JWT verification and token signing
│   │   └── routes/index.js      # All API endpoints
│   ├── shared/labels.js         # Shared label map (copy)
│   ├── .env.example
│   └── vercel.json
├── frontend/
│   ├── src/
│   │   ├── components/          # UI, form steps, profile details
│   │   ├── context/             # Admin auth context
│   │   ├── lib/                 # API client, form config, helpers
│   │   ├── pages/               # Public wizard and admin pages
│   │   └── styles.css
│   ├── shared/labels.js         # Shared label map (copy)
│   ├── .env.example
│   └── vercel.json
├── form.txt                     # Original form reference text
├── Page1.png ... Page6.png      # Original form reference images
├── KILOS Profiling Form.pdf     # Original form reference PDF
└── package.json                 # Convenience scripts only
```

`shared/labels.js` is intentionally duplicated in both packages so each Vercel project is self-contained. Update both copies when labels change.

---

## Deploying to Vercel

Deploy **two separate Vercel projects** from the same repository: one for the API and one for the frontend.

### 1. Backend project

1. Import the repository in Vercel.
2. Set **Root Directory** to `backend`.
3. Vercel auto-detects the Express app from `backend/index.js`. Leave the detected framework as-is; no build command or output directory is needed. Vercel deploys the app as one function that receives every API path.
4. Add environment variables:

   ```text
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=<long random string>
   JWT_EXPIRES_IN=7d
   ADMIN_NAME=KILOS Administrator
   ADMIN_EMAIL=<your admin email>
   ADMIN_PASSWORD=<strong password>
   CORS_ORIGIN=https://<your-frontend>.vercel.app
   ```

5. Deploy.
6. Confirm the API at `https://<backend-project>.vercel.app/api/health`.
7. Use `https://<backend-project>.vercel.app/api` as the frontend API base.

In MongoDB Atlas, allow connections from Vercel. Vercel uses dynamic IP addresses, so the practical option is `0.0.0.0/0` with a strong database password and restricted database user.

### 2. Frontend project

1. Import the same repository again.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite** (build command `npm run build`, output `dist`).
4. Add environment variables:

   ```text
   VITE_API_URL=https://<backend-project>.vercel.app/api
   ```

5. Deploy.
6. Update the backend project's `CORS_ORIGIN` to the final frontend URL and redeploy the backend.

The included `frontend/vercel.json` rewrites unknown paths to `index.html` so React Router routes such as `/admin/login` and `/admin/submissions/:id` work on refresh.

### Deployment checklist

- [ ] MongoDB Atlas database and user created
- [ ] Network access configured for Vercel
- [ ] `JWT_SECRET` replaced with a long random value
- [ ] Default admin password changed after first sign-in
- [ ] Backend `CORS_ORIGIN` set to the exact frontend origin (browser requests are blocked if omitted in production)
- [ ] Frontend `VITE_API_URL` ends in `/api`
- [ ] `GET /api/health` returns `{ "ok": true }`
- [ ] Public submission, admin login, Excel export, and PDF export tested on the deployed URLs
- [ ] Demo records removed from production (`npm run seed` was not run against production, or `npm run seed:clear` was run afterward)

---

## Security and privacy notes

- Passwords are hashed with bcrypt; plaintext passwords are never stored.
- Admin routes require a valid JWT.
- Login is limited to 20 attempts per 15 minutes per IP.
- Public submissions are limited to 15 per 10 minutes per IP and include a hidden honeypot field.
- CORS is restricted to configured origins in production; an unset `CORS_ORIGIN` blocks browser API requests rather than allowing every origin.
- API responses are marked `Cache-Control: no-store` so personal information is not cached by browsers or intermediaries.
- Dashboard boundaries, date filters, reference numbers, and exports use Philippine time (`Asia/Manila`) explicitly.
- Responses contain personal information. Handle exports according to the Data Privacy Act of 2012 (RA 10173). Do not commit exported files or production `.env` files.
- The API returns generic 500 messages; detailed errors remain in server logs.

---

## Troubleshooting

**`MONGODB_URI is not configured`**
Add `MONGODB_URI` to `backend/.env` and restart the API.

**Admin login says there is no administrator**
Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the backend environment, then sign in again. The account is created only when no admin exists.

**Frontend calls the wrong API**
Set `VITE_API_URL` to the deployed backend base ending in `/api`, then rebuild. Local development should leave it blank to use the Vite proxy.

**CORS error after deployment**
Set `CORS_ORIGIN` on the backend to the exact frontend origin, including `https://` and without a trailing slash, then redeploy the backend. `http://localhost:5173` and `http://127.0.0.1:5173` are different origins. For phone testing over your LAN, add that origin too (for example `http://192.168.1.10:5173`). In production, browser requests are blocked when this variable is missing.

**PDF or Excel download returns 401**
The request needs a valid admin token. Sign in again; the frontend attaches the stored token automatically.

**Vercel function times out on export**
Vercel zero-config deploys the API as one Express function. If an export is large enough to hit your plan's function time limit, reduce the date range/filter scope or use a plan with a higher function duration and memory limit.
