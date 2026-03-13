// GET /api/availability?year=2024&month=1
// Returns job counts and availability for every day in the requested month.
// A day is "available" when its event count is below MAX_JOBS_PER_DAY.

import { CALENDAR_ID as CFG_CALENDAR_ID, MAX_JOBS_PER_DAY, TIMEZONE } from '../../config.js';
import { getCalendar, getLAOffset } from '../../lib/calendar.js';

const CALENDAR_ID = process.env.CALENDAR_ID || CFG_CALENDAR_ID;
const MAX_JOBS    = parseInt(process.env.MAX_JOBS_PER_DAY || '', 10) || MAX_JOBS_PER_DAY;
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

        const { data } = await calendar.events.list({
            calendarId: CALENDAR_ID,
            timeMin,
            timeMax,
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 500,
        });

        // Count events per local date
        const counts = {};
        for (const event of data.items || []) {
            const dt = event.start.dateTime || event.start.date;
            if (!dt) continue;
            const dateStr = event.start.date ?? toLocalDate(dt);
            counts[dateStr] = (counts[dateStr] || 0) + 1;
        }

        // Build full month map
        const dates = {};
        for (let d = 1; d <= lastDay; d++) {
            const dateStr = `${year}-${mm}-${String(d).padStart(2, '0')}`;
            const count   = counts[dateStr] || 0;
            dates[dateStr] = { count, available: count < MAX_JOBS };
        }

        return res.status(200).json({ dates, maxJobs: MAX_JOBS });
    } catch (err) {
        console.error('[availability]', err.message);
        return res.status(500).json({ error: 'Failed to fetch availability. Please try again.' });
    }
}
