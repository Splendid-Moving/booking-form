# Splendid Moving — Online Booking Calendar

## What This Is

A self-serve booking engine for Splendid Moving customers. Instead of calling or texting to book a move, customers go directly to this page, complete a guided 6-step flow, and submit — all without any manual back-and-forth.

The system reads the company's existing Google Calendar in real time to determine daily capacity, creates new events in that same calendar when a booking is confirmed, and optionally syncs contacts to GoHighLevel CRM.

---

## Booking Flow (6 Steps)

| Step | Screen | What happens |
|------|--------|--------------|
| 1 | **Contact** | Customer enters first name, last name, phone, and email |
| 2 | **Move Info** | Pickup and delivery addresses (Google Maps autocomplete), number of movers, move size, notes. Distance check kicks off in the background. |
| 3 | **Date** | Color-coded calendar loads availability from Google Calendar. Distance check runs in parallel. |
| 4 | **Time** | Customer picks an arrival window. If pickup is 30+ miles from the depot (909 Beacon Ave, LA), the 8–9 AM window is automatically disabled. |
| 5 | **Terms** | Sample T&C displayed in a scrollable box; customer must check acceptance to proceed. |
| 6 | **Confirm** | Full booking summary. Customer submits → Google Calendar event created + GHL contact synced. |

A success screen confirms submission and offers an "Add to Google Calendar" link.

---

## Core Goals

1. **Let customers book themselves in** — reduce inbound calls and texts for scheduling.
2. **Sync with existing Google Calendar** — no second system to maintain. Every online booking creates a real calendar event the team already sees.
3. **Enforce daily capacity limits** — morning and afternoon pools are tracked separately (see below).
4. **Block out today and tomorrow automatically** — we need at least 2 days of lead time to prepare for a job.
5. **Show real remaining capacity** — customers see exactly how many job slots remain on each day.
6. **Distance-based slot restriction** — pickups 30+ miles from the depot cannot book the 8–9 AM arrival window.
7. **Sync to GoHighLevel CRM** — booking confirmation auto-creates/updates a GHL contact record.

---

## Arrival Windows & Capacity Model

There are exactly **3 arrival windows**:

| Window | Period |
|--------|--------|
| 8:00 AM – 9:00 AM | Morning |
| 9:00 AM – 10:00 AM | Morning |
| 2:00 PM – 4:00 PM | Afternoon |

Morning windows **share a single pool** of 6 jobs (not 6 per window). The afternoon window holds up to 3 jobs. Maximum per day: **9 jobs**.

The calendar badge shows **remaining capacity** (how many more jobs can be accepted that day):

| Badge | Meaning |
|-------|---------|
| Green "X slots" | 6–9 remaining |
| Amber "X left" | 3–5 remaining |
| Red "X left" | 1–2 remaining |
| Gray "Full" | 0 remaining — day is fully booked |
| Grayed out | Today, tomorrow, or past — unavailable |

Events are classified by **start time**: before noon = morning job, noon or later = afternoon job. This correctly counts any manually-created calendar event regardless of its exact start time.

---

## Distance Check (Google Maps)

When the customer selects their pickup address in step 2, the app calls the Google Maps **Distance Matrix API** to measure the driving distance to the Splendid Moving depot (909 Beacon Ave, Los Angeles, CA 90015). This runs in the background while the customer browses the calendar (step 3), so the result is ready by the time they reach the slots (step 4).

- Distance ≥ 30 miles → 8:00 AM – 9:00 AM window is marked unavailable with an explanation note.
- If the Maps API call fails or Maps hasn't loaded, the restriction is silently skipped (fails open).

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
| Calendar | Google Calendar API v3 via service account |
| Maps | Google Maps JS SDK — Places autocomplete + Distance Matrix |
| CRM sync | GoHighLevel REST API (optional, fire-and-forget) |
| Deployment | Vercel |

---

## Project Structure

```
calendar/
│
├── pages/
│   ├── _document.js          Global HTML shell (fonts, CSS links)
│   ├── _app.js               Next.js app wrapper
│   ├── index.js              Booking page — 6-step JSX structure
│   └── api/
│       ├── availability.js   GET /api/availability?year=&month=
│       │                     Returns remaining capacity for every day in the month
│       ├── slots.js          GET /api/slots?date=YYYY-MM-DD
│       │                     Returns the 3 arrival windows with availability flags
│       └── book.js           POST /api/book
│                             Creates calendar event + syncs GHL contact
│
├── public/
│   ├── styles.css            All UI styles
│   └── script.js             Client-side booking flow (vanilla JS, 6-step logic)
│
├── lib/
│   └── calendar.js           Google Calendar auth helper + shared utilities (toHHMM, toLocalDate)
│
├── config.js                 ★ Edit this to change capacity and calendar settings
├── service_account.json      Google service account credentials (keep secret, gitignored)
├── .env.local                Local environment variables (gitignored)
├── .env.example              Template for env vars
├── next.config.js            Next.js configuration
└── overview.md               This file
```

---

## Configuration

**[config.js](config.js)** — the single file to change for common settings:

```js
export const MORNING_CAPACITY   = 6;   // max jobs in morning windows (8–9 AM + 9–10 AM combined)
export const AFTERNOON_CAPACITY = 3;   // max jobs in afternoon window (2–4 PM)
export const MAX_ADVANCE_MONTHS = 3;   // how far ahead customers can book
export const CALENDAR_ID        = 'primary';   // overridden by .env.local
export const TIMEZONE           = 'America/Los_Angeles';
```

**[.env.local](.env.local)** — for sensitive or environment-specific values:

```
CALENDAR_ID=info@splendidmoving.com   # must be shared with the service account
GHL_ACCESS_TOKEN=...                  # optional — enables CRM sync
GHL_LOCATION_ID=...                   # optional — enables CRM sync
```

> **Important:** `CALENDAR_ID` in `.env.local` overrides `config.js`. Set it to the actual Google Calendar ID shared with the service account, not `"primary"`.

---

## Google Calendar Setup

The service account that reads/writes the calendar is:
```
moving-tracker-server@ad-report-automation-484101.iam.gserviceaccount.com
```

That calendar must be **shared** with the service account (at minimum "See all event details"; "Make changes to events" for bookings to work).

To find your Calendar ID:
1. Open Google Calendar
2. Click the three dots next to your calendar → **Settings and sharing**
3. Scroll to **"Calendar ID"** — looks like `you@gmail.com` or `abc123@group.calendar.google.com`
4. Paste it into `CALENDAR_ID` in `.env.local`

---

## Running Locally

```bash
cd calendar
npm install
npm run dev
# → http://localhost:3000
```

The dev server runs both the frontend and API routes. Google Calendar data is live as soon as `CALENDAR_ID` points to the right calendar.

---

## Deploying to Vercel

```bash
vercel --prod
```

Set the following environment variables in the Vercel dashboard:
- `CALENDAR_ID` — your Google Calendar ID (e.g. `info@splendidmoving.com`)
- `GOOGLE_SERVICE_ACCOUNT` — full contents of `service_account.json` as a single-line JSON string
- `GHL_ACCESS_TOKEN` + `GHL_LOCATION_ID` — optional, enables CRM sync
