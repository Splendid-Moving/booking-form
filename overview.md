# Splendid Moving — Online Booking Calendar

## What This Is

A self-serve booking engine for Splendid Moving customers. Instead of calling or texting to book a move, customers can go directly to this page, pick a date, choose an arrival window, fill in their details, and confirm — all without any manual back-and-forth.

The system is tightly integrated with the company's existing Google Calendar workflow. Every job is already stored as a Google Calendar event (customer name as title, arrival window as the event times, job details in the description). This booking engine reads that same calendar in real time to figure out how many slots are left on each day, then blocks out days that are already at capacity.

---

## Core Goals

1. **Let customers book themselves in** — reduce inbound calls and texts for scheduling.
2. **Sync with existing Google Calendar** — no second system to maintain. Every online booking creates a real calendar event the team already sees.
3. **Enforce daily capacity limits** — if we're already running 3 jobs on a given day, that day shows as "Fully Booked" and can't be selected.
4. **Block out today and tomorrow automatically** — we need at least 2 days of lead time to prepare for a job.
5. **Show real availability** — customers see exactly how many slots are left on each day (not just available/unavailable).
6. **Sync to GoHighLevel CRM** — when a booking is confirmed, a contact record is automatically created/updated in GHL with all the job details.

---

## How It Works

### Step 1 — Pick a Date
When the page loads, it makes an API call to Google Calendar to fetch all events for the current month. It counts how many jobs are already scheduled on each day and displays a color-coded calendar:

| Indicator | Meaning |
|-----------|---------|
| Green "X slots" | Day is open, shows total available slots |
| Amber "X left" | Partially booked, limited slots remain |
| Red "1 left" | Only one slot remaining |
| Gray "Full" | Day is at max capacity — can't be booked |
| Grayed out (no badge) | Today, tomorrow, or past — unavailable |

When the customer navigates to the next/previous month, a fresh API call is made for that month.

### Step 2 — Choose an Arrival Window
After selecting a date, the customer picks a 2-hour arrival window. The available windows are:
- 7:00 AM – 9:00 AM
- 9:00 AM – 11:00 AM
- 11:00 AM – 1:00 PM
- 1:00 PM – 3:00 PM
- 3:00 PM – 5:00 PM
- 5:00 PM – 7:00 PM

The API checks the exact event times on that day and marks any overlapping windows as unavailable.

### Step 3 — Enter Move Details
Customer fills in their contact info, pickup/dropoff addresses, number of movers, move size, and optional notes.

### Step 4 — Confirm & Submit
Customer reviews everything, then confirms. This creates a Google Calendar event in the exact format the team already uses:
- **Title:** `First Last` (customer name)
- **Time:** Selected arrival window
- **Description:** All job details formatted neatly

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (Pages Router) |
| Frontend | Vanilla JS + CSS (no React on the client) |
| API routes | Next.js API routes (`/pages/api/`) |
| Calendar | Google Calendar API v3 via service account |
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
│   ├── index.js              Booking page (JSX)
│   └── api/
│       ├── availability.js   GET /api/availability?year=&month=
│       │                     Returns job counts + availability for every day
│       ├── slots.js          GET /api/slots?date=YYYY-MM-DD
│       │                     Returns available arrival windows for a specific day
│       └── book.js           POST /api/book
│                             Creates calendar event + GHL contact
│
├── public/
│   ├── styles.css            All UI styles
│   └── script.js             Client-side booking flow (vanilla JS)
│
├── config.js                 ★ Edit this to change settings
├── service_account.json      Google service account credentials (keep secret)
├── .env.local                Local environment variables (gitignored)
├── .env.example              Template for env vars
├── next.config.js            Next.js configuration
└── overview.md               This file
```

---

## Configuration

**[config.js](config.js)** — the single file to change for common settings:

```js
export const MAX_JOBS_PER_DAY   = 3;   // how many jobs per day before "Fully Booked"
export const MAX_ADVANCE_MONTHS = 3;   // how far ahead customers can book
export const CALENDAR_ID        = 'primary';   // which Google Calendar to use
export const TIMEZONE           = 'America/Los_Angeles';
```

**[.env.local](.env.local)** — for sensitive or environment-specific values:

```
CALENDAR_ID=your_calendar_id@group.calendar.google.com
MAX_JOBS_PER_DAY=3          (optional — overrides config.js)
GHL_ACCESS_TOKEN=...        (optional — enables CRM sync)
GHL_LOCATION_ID=...         (optional — enables CRM sync)
```

> **Important:** `CALENDAR_ID` in `.env.local` overrides `config.js`. Set it to the actual Google Calendar ID that's shared with the service account, not "primary".

---

## Google Calendar Setup

The service account that reads/writes the calendar is:
```
moving-tracker-server@ad-report-automation-484101.iam.gserviceaccount.com
```

For the booking engine to read your actual jobs calendar, that calendar must be **shared** with the service account email above (with at minimum "See all event details" permission, and "Make changes to events" for bookings to create events).

To find your Calendar ID:
1. Open Google Calendar
2. Click the three dots next to your calendar → **Settings and sharing**
3. Scroll down to **"Calendar ID"** — it looks like `abc123@group.calendar.google.com` or just `youremail@gmail.com`
4. Paste that into `CALENDAR_ID` in `.env.local`

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
- `CALENDAR_ID` — your Google Calendar ID
- `GOOGLE_SERVICE_ACCOUNT` — the full contents of `service_account.json` as a single-line JSON string (so the file doesn't need to be committed)
- `MAX_JOBS_PER_DAY` — optional capacity override
- `GHL_ACCESS_TOKEN` + `GHL_LOCATION_ID` — optional CRM sync
