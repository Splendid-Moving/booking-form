# Splendid Moving — Online Booking Calendar

## What This Is

A self-serve booking engine for Splendid Moving customers. Instead of calling or texting to book a move, customers go directly to this page, complete a guided 7-step flow, and submit — all without any manual back-and-forth.

The system reads the company's existing Google Calendar in real time to determine daily capacity. When a booking is submitted, a GoHighLevel CRM contact is created (or updated) with all booking details.

---

## Booking Flow (7 Steps)

| Step | Screen | What happens |
|------|--------|--------------|
| 1 | **Move Size** | Customer selects move size (dropdown) and number of movers. Hourly rates shown per option (cash vs. card). |
| 2 | **Contact** | Customer enters first name, last name, phone, and email. |
| 3 | **Details** | Pickup and delivery addresses (Google Maps autocomplete), and optional notes. Distance check kicks off in the background. |
| 4 | **Date** | Color-coded calendar loads availability from Google Calendar. Distance check runs in parallel. |
| 5 | **Time** | Customer picks an arrival window. If pickup is 30+ miles from the depot (909 Beacon Ave, LA), the 8–9 AM window is automatically disabled. |
| 6 | **Terms** | T&C displayed in a scrollable box; customer must check acceptance to proceed. |
| 7 | **Confirm** | Full booking summary. Customer submits → GoHighLevel contact created/updated. |

A success screen confirms submission with the message: "One of our team members will reach out shortly to confirm your move."

---

## Core Goals

1. **Let customers book themselves in** — reduce inbound calls and texts for scheduling.
2. **Sync with existing Google Calendar** — used for availability checks only. Daily capacity is read in real time.
3. **Enforce daily capacity limits** — morning and afternoon pools are tracked separately (see below).
4. **Block out today and tomorrow automatically** — we need at least 2 days of lead time to prepare for a job.
5. **Show real remaining capacity** — customers see exactly how many job slots remain on each day.
6. **Distance-based slot restriction** — pickups 30+ miles from the depot cannot book the 8–9 AM arrival window.
7. **Create GoHighLevel CRM contact** — booking submission creates or updates a GHL contact with all booking details and the "Booking form" tag.

---

## Arrival Windows & Capacity Model

There are exactly **3 arrival windows**:

| Window | Period | GHL format |
|--------|--------|------------|
| 8:00 AM – 9:00 AM | Morning | `8-9am` |
| 9:00 AM – 10:00 AM | Morning | `9-10am` |
| 2:00 PM – 4:00 PM | Afternoon | `2-4pm` |

Morning windows **share a single pool** of 6 jobs (not 6 per window). The afternoon window holds up to 3 jobs. Maximum per day: **9 jobs**.

The calendar badge shows **remaining capacity** (how many more jobs can be accepted that day):

| Badge | Meaning |
|-------|---------|
| Green "X slots" | 6–9 remaining |
| Amber "X left" | 3–5 remaining |
| Red "X left" | 1–2 remaining |
| Gray "Full" | 0 remaining — day is fully booked |
| Grayed out | Today, tomorrow, or past — unavailable |

Events are classified by **start time**: before noon = morning job, noon or later = afternoon job.

---

## Distance Check (Google Maps)

When the customer enters their pickup address in step 3, the app calls the Google Maps **Distance Matrix API** to measure the driving distance to the Splendid Moving depot (909 Beacon Ave, Los Angeles, CA 90015). This runs in the background while the customer browses the calendar (step 4), so the result is ready by the time they reach the slots (step 5).

- Distance ≥ 30 miles → 8:00 AM – 9:00 AM window is marked unavailable with an explanation note.
- If the Maps API call fails or Maps hasn't loaded, the restriction is silently skipped (fails open).

---

## GoHighLevel CRM Integration

When a booking is submitted, a contact is **created or updated** in GoHighLevel (this is blocking — the success screen only shows after GHL confirms). Duplicate contacts (matched by phone/email) are automatically updated via a PUT request.

### Tag applied
`Booking form`

### Custom fields populated

| Field name | GHL Field ID | Value |
|------------|-------------|-------|
| Move size | `yS4Bj6LtQ3lLCuju7vl0` | e.g. `2 Bedrooms` |
| Moving From | `KyE8Eopo3MXg4aXjGnqS` | Pickup address |
| Moving To | `DjfpJEtJnBnDBP6nvJ1l` | Delivery address |
| Moving Date | `VuatzebiX5qPrzGjl4d4` | `YYYY-MM-DD` |
| Arrival Time | `BZMRDjwmqFl957qHlTO6` | e.g. `8-9am`, `9-10am`, `2-4pm` |
| Additional details | `HZgxySrqsR4IICCBWZr5` | Movers count + notes |

---

## Caching

To stay within Google API rate limits and keep the UI snappy:

- **Monthly availability** is cached in memory (`_availCache`). Navigating between months only re-fetches months not yet seen.
- **Per-date slots** are cached in memory (`_slotsCache`). Clicking the same calendar day a second time is instant — no additional API call.

Both caches live for the lifetime of the page session.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (Pages Router) |
| Frontend | Vanilla JS + CSS (no React on the client) |
| API routes | Next.js API routes (`/pages/api/`) |
| Calendar | Google Calendar API v3 via service account (read-only for availability) |
| Maps | Google Maps JS SDK — Places autocomplete + Distance Matrix |
| CRM | GoHighLevel REST API (required — contact creation on booking submit) |
| Deployment | Railway |

---

## Project Structure

```
calendar/
│
├── pages/
│   ├── _document.js          Global HTML shell (fonts, CSS links)
│   ├── _app.js               Next.js app wrapper
│   ├── index.js              Booking page — 7-step JSX structure
│   └── api/
│       ├── availability.js   GET /api/availability?year=&month=
│       │                     Returns remaining capacity for every day in the month
│       ├── slots.js          GET /api/slots?date=YYYY-MM-DD
│       │                     Returns the 3 arrival windows with availability flags
│       └── book.js           POST /api/book
│                             Creates/updates GoHighLevel contact on booking submit
│
├── public/
│   ├── styles.css            All UI styles
│   └── script.js             Client-side booking flow (vanilla JS, 7-step logic)
│
├── lib/
│   └── calendar.js           Google Calendar auth helper + shared utilities
│
├── config.js                 ★ Edit this to change capacity and calendar settings
├── service_account.json      Google service account credentials (keep secret, gitignored)
├── .env.local                Local environment variables (gitignored)
└── overview.md               This file
```

---

## Configuration

**[config.js](config.js)** — the single file to change for common settings:

```js
export const MORNING_CAPACITY   = 6;   // max jobs in morning windows (8–9 AM + 9–10 AM combined)
export const AFTERNOON_CAPACITY = 3;   // max jobs in afternoon window (2–4 PM)
export const MAX_ADVANCE_MONTHS = 3;   // how far ahead customers can book
export const CALENDAR_ID        = 'primary';   // overridden by env var
export const TIMEZONE           = 'America/Los_Angeles';
```

**Environment variables** (set in Railway dashboard or `.env.local` locally):

```
CALENDAR_ID=info@splendidmoving.com       # Google Calendar ID shared with the service account
GOOGLE_SERVICE_ACCOUNT_B64=<base64>       # Base64-encoded service_account.json (preferred for Railway)
GOOGLE_SERVICE_ACCOUNT=<json string>      # Alternative: raw JSON string (fallback)
GHL_ACCESS_TOKEN=...                      # GoHighLevel API token (required)
GHL_LOCATION_ID=...                       # GoHighLevel location ID (required)
```

The credential lookup order is: `GOOGLE_SERVICE_ACCOUNT_B64` → `GOOGLE_SERVICE_ACCOUNT` → `service_account.json` file.

To generate the base64 string from the service account file:
```bash
base64 -i service_account.json | tr -d '\n'
```

---

## Google Calendar Setup

The service account that reads the calendar is:
```
moving-tracker-server@ad-report-automation-484101.iam.gserviceaccount.com
```

That calendar must be **shared** with the service account at minimum "See all event details" permission.

To find your Calendar ID:
1. Open Google Calendar
2. Click the three dots next to your calendar → **Settings and sharing**
3. Scroll to **"Calendar ID"** — looks like `you@gmail.com` or `abc123@group.calendar.google.com`
4. Paste it into `CALENDAR_ID` in your environment variables

---

## Running Locally

```bash
cd calendar
npm install
npm run dev
# → http://localhost:3000
```

The dev server runs both the frontend and API routes. Google Calendar availability is live as soon as `CALENDAR_ID` points to the right calendar and credentials are configured.

---

## Deploying to Railway

1. Push the repo to GitHub
2. Create a new Railway project linked to the repo
3. Set the following environment variables in the Railway dashboard:
   - `CALENDAR_ID` — your Google Calendar ID
   - `GOOGLE_SERVICE_ACCOUNT_B64` — base64-encoded contents of `service_account.json`
   - `GHL_ACCESS_TOKEN` — GoHighLevel API token
   - `GHL_LOCATION_ID` — GoHighLevel location ID
4. Railway auto-detects Next.js and deploys on push
