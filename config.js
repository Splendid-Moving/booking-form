// ============================================================
// Splendid Moving — Booking Engine Configuration
// ============================================================
// Edit these values to control how the booking calendar works.
// All API files import from here; no need to touch anything else.

// Max jobs in the morning period (8–9 AM + 9–10 AM combined).
export const MORNING_CAPACITY = 6;

// Max jobs in the afternoon period (2–4 PM).
export const AFTERNOON_CAPACITY = 3;

// How many months ahead customers can browse and book.
export const MAX_ADVANCE_MONTHS = 3;

// Google Calendar ID.
// "primary" uses the calendar shared with the service account.
// Replace with a specific ID (e.g. "abc123@group.calendar.google.com") if needed.
export const CALENDAR_ID = 'primary';

// Timezone used for all date/time calculations.
export const TIMEZONE = 'America/Los_Angeles';
