// ============================================================
// Splendid Moving — Booking Engine Configuration
// ============================================================
// Edit these values to control how the booking calendar works.
// All API files import from here; no need to touch anything else.

// Maximum number of jobs that can be booked on any single day.
// Once this limit is reached, the day shows as "Fully Booked".
export const MAX_JOBS_PER_DAY = 3;

// How many months ahead customers can browse and book.
export const MAX_ADVANCE_MONTHS = 3;

// Google Calendar ID.
// "primary" uses the calendar shared with the service account.
// Replace with a specific ID (e.g. "abc123@group.calendar.google.com") if needed.
export const CALENDAR_ID = 'primary';

// Timezone used for all date/time calculations.
export const TIMEZONE = 'America/Los_Angeles';
