// GET /api/availability?year=2024&month=1
// Returns per-day slot availability for every day in the requested month.
// Morning period (8–10 AM): up to MORNING_CAPACITY bookings → 2 available windows.
// Afternoon period (2–4 PM): up to AFTERNOON_CAPACITY bookings → 1 available window.
// availableSlots (0–3) is how many of the 3 windows are still bookable that day.

import { CALENDAR_ID as CFG_CALENDAR_ID, MORNING_CAPACITY, AFTERNOON_CAPACITY, TIMEZONE } from '../../config.js';
import { getCalendar, getLAOffset, toHHMM } from '../../lib/calendar.js';

const CALENDAR_ID = process.env.CALENDAR_ID || CFG_CALENDAR_ID;
const TZ          = TIMEZONE;

function toLocalDate(dateTimeStr) {
    return new Date(dateTimeStr).toLocaleDateString('en-CA', { timeZone: TZ });
}


export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate');

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const year  = parseInt(req.query.year,  10);
    const month = parseInt(req.query.month, 10); // 1-indexed

    if (!year || !month || month < 1 || month > 12) {
        return res.status(400).json({ error: 'Valid year and month (1-12) required' });
    }

    const mm      = String(month).padStart(2, '0');
    const lastDay = new Date(year, month, 0).getDate();

    // Use the actual LA UTC offset for this month (PDT = -07:00, PST = -08:00)
    const offset  = getLAOffset(new Date(Date.UTC(year, month - 1, 15, 20)));
    const timeMin = new Date(`${year}-${mm}-01T00:00:00${offset}`).toISOString();
    const timeMax = new Date(`${year}-${mm}-${String(lastDay).padStart(2, '0')}T23:59:59${offset}`).toISOString();

    try {
        const calendar = await getCalendar();
        console.log('[availability] using calendarId:', CALENDAR_ID);

        const { data } = await calendar.events.list({
            calendarId: CALENDAR_ID,
            timeMin,
            timeMax,
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 500,
        });

        // Count morning/afternoon bookings per local date by start time.
        // Any timed event starting before noon = morning, noon+ = afternoon.
        // This captures manually-created events at any time, not just the 3 booking windows.
        const counts = {};
        for (const event of data.items || []) {
            if (!event.start.dateTime) continue;   // skip all-day events
            const dateStr = toLocalDate(event.start.dateTime);
            if (!counts[dateStr]) counts[dateStr] = { morning: 0, afternoon: 0 };
            if (toHHMM(event.start.dateTime) < '12:00') counts[dateStr].morning++;
            else                                         counts[dateStr].afternoon++;
        }

        // Build full month map
        // availableSlots = how many of the 3 windows are still bookable
        const dates = {};
        for (let d = 1; d <= lastDay; d++) {
            const dateStr = `${year}-${mm}-${String(d).padStart(2, '0')}`;
            const c = counts[dateStr] || { morning: 0, afternoon: 0 };
            const remaining = Math.max(0, MORNING_CAPACITY - c.morning) + Math.max(0, AFTERNOON_CAPACITY - c.afternoon);
            dates[dateStr] = { remaining, available: remaining > 0 };
        }

        return res.status(200).json({ dates });
    } catch (err) {
        console.error('[availability]', err.message);
        return res.status(500).json({ error: 'Failed to fetch availability. Please try again.' });
    }
}
