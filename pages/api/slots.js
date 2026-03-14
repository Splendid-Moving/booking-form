// GET /api/slots?date=2024-01-15
// Returns the three predefined arrival-window slots and whether each is available.
// Morning slots (8–9 AM, 9–10 AM) share a pool of MORNING_CAPACITY bookings.
// The afternoon slot (2–4 PM) has its own AFTERNOON_CAPACITY.
// A slot is also unavailable if it is already in the past (for today's date).

import { CALENDAR_ID as CFG_CALENDAR_ID, TIMEZONE, MORNING_CAPACITY, AFTERNOON_CAPACITY } from '../../config.js';
import { getCalendar, getLAOffset, toHHMM } from '../../lib/calendar.js';

const CALENDAR_ID = process.env.CALENDAR_ID || CFG_CALENDAR_ID;
const TZ          = TIMEZONE;

// Three arrival windows: two 1-hour morning slots sharing a pool, one 2-hour afternoon slot
export const TIME_SLOTS = [
    { label: '8:00 AM – 9:00 AM',  start: '08:00', end: '09:00', period: 'morning'   },
    { label: '9:00 AM – 10:00 AM', start: '09:00', end: '10:00', period: 'morning'   },
    { label: '2:00 PM – 4:00 PM',  start: '14:00', end: '16:00', period: 'afternoon' },
];


export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { date } = req.query;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'Valid date required (YYYY-MM-DD)' });
    }

    // Use the actual LA UTC offset for this date (PDT = -07:00, PST = -08:00)
    const [dy, dm] = date.split('-').map(Number);
    const offset   = getLAOffset(new Date(Date.UTC(dy, dm - 1, 15, 20)));
    const timeMin  = new Date(`${date}T00:00:00${offset}`).toISOString();
    const timeMax  = new Date(`${date}T23:59:59${offset}`).toISOString();

    try {
        const calendar = await getCalendar();

        const { data } = await calendar.events.list({
            calendarId: CALENDAR_ID,
            timeMin,
            timeMax,
            singleEvents: true,
        });

        // Only timed events count against capacity
        const bookedRanges = (data.items || [])
            .filter(e => e.start.dateTime)
            .map(e => ({
                start: toHHMM(e.start.dateTime),
                end:   toHHMM(e.end.dateTime),
            }));

        // Count bookings by start time: before noon = morning, noon+ = afternoon.
        // This captures manually-created events at any time, not just the 3 booking windows.
        const morningCount   = bookedRanges.filter(r => r.start < '12:00').length;
        const afternoonCount = bookedRanges.filter(r => r.start >= '12:00').length;

        const nowLA    = new Date(new Date().toLocaleString('en-US', { timeZone: TZ }));
        const todayStr = nowLA.toLocaleDateString('en-CA');
        const nowHHMM  = `${String(nowLA.getHours()).padStart(2, '0')}:${String(nowLA.getMinutes()).padStart(2, '0')}`;
        const isToday  = date === todayStr;

        const slots = TIME_SLOTS.map(slot => {
            const past = isToday && slot.start <= nowHHMM;
            const full = slot.period === 'morning'
                ? morningCount >= MORNING_CAPACITY
                : afternoonCount >= AFTERNOON_CAPACITY;
            return { ...slot, available: !past && !full };
        });

        return res.status(200).json({ slots, date });
    } catch (err) {
        console.error('[slots]', err.message);
        return res.status(500).json({ error: 'Failed to fetch time slots. Please try again.' });
    }
}
