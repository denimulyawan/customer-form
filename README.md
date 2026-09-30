# customer-form

Internal web app for recording the **customer accounts** an IT team manages.

> 📖 **Panduan pemasangan langkah demi langkah (Bahasa Indonesia):
> [docs/PANDUAN.md](docs/PANDUAN.md)**

## What it records

| Field | Notes |
|---|---|
| Customer Company Name | |
| CID | Customer ID |
| Account Username | duplicates are allowed, no uniqueness check |
| PIC name / phone / email | the contact person at the customer |
| Account Manager | picked from User Management — an app user |
| Date recorded | filled in automatically, never shown in tables |

The Account Manager is **not** free text: it points at a user in User Management,
so that person's name, phone and email stay in one place and the dashboard can
group accounts by manager.

## How it fits together

```
Team fills the form  ->  Vercel (app)  ->  Apps Script (scribe)  ->  Google Spreadsheet
```

| Part | Role |
|---|---|
| Google Spreadsheet | The database — two tabs: `customers` and `users` |
| Google Apps Script | The scribe inside the sheet (`apps-script/Code.gs`) |
| GitHub | Holds the code |
| Vercel | Runs the app and stores the three secrets |

## Screens

| Screen | What it does |
|---|---|
| **Dashboard** | Stat cards plus two charts: accounts per Account Manager (donut) and accounts added per month (columns) |
| **Customer List** | Search, filter by Account Manager, paging, edit, delete, export to Excel |
| **User Management** | Admin only: create users, reset passwords, activate/deactivate |
| **My Account** | Everyone: own name/phone/email, and change password |

Charts are hand-drawn SVG — there is no charting library to go stale.

## Tech

| Part | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Hand-written CSS, no framework |
| Session | JWT HS256 in an httpOnly cookie, 8 hours |
| Password | scrypt (Node built-in), stored as a one-way hash |
| Spreadsheet | Google Sheets via an Apps Script Web App |
| Excel export | ExcelJS |

## Stored values

The spreadsheet stores a few values that stay language-neutral, because the UI
language may change while the data must not:

| Column | Values |
|---|---|
| `role` | `admin` \| `operator` |
| `status` | `aktif` \| `nonaktif` |
| `must_change_password` | `ya` \| `tidak` |

The app renders English labels (`Active`, `Inactive`, …) for them.

## Folder layout

```
app/                      pages and the export endpoint
  (app)/                  signed-in pages (with the sidebar)
    page.tsx              dashboard
    customers/            list, new, edit
    users/                user management
    account/              my account
  login/  setup/  set-password/
  api/export/             Excel download
actions/                  server actions (sign-in, customers, users)
components/               UI pieces, including the SVG charts
lib/                      spreadsheet bridge, data, session, password, formatting
apps-script/Code.gs       the script to paste into Google Apps Script
docs/PANDUAN.md           installation guide
```

## Running locally

```bash
npm install
cp .env.example .env.local     # then fill in the three values
npm run dev                    # http://localhost:3000
```

## Security notes

- Passwords are hashed with scrypt. Nobody — not even an admin — can read them.
  A forgotten password can only be reset, never recovered.
- Every write re-checks the user's status in the spreadsheet, so deactivating an
  account blocks saving immediately.
- Repeated failed sign-ins are throttled.
- The Web App must be deployed as **Anyone**, because Vercel calls it from a
  server. The `BRIDGE_TOKEN` is what actually guards the data — treat it as a
  password and never commit it.

## Cost

Zero. GitHub, Vercel, Google Sheets and Apps Script are all free.
