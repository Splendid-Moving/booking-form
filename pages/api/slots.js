// GET /api/slots?date=2024-01-15
// Returns the six predefined arrival-window slots and whether each is available.
// A slot is unavailable if an existing calendar event overlaps it,
// or if it is already in the past (for today's date).

import { CALENDAR_ID as CFG_CALENDAR_ID, TIMEZONE } from '../../config.js';
import { getCalendar, getLAOffset } from '../../lib/calendar.js';

const CALENDAR_ID = process.env.CALENDAR_ID || CFG_CALENDAR_ID;
const TZ          = TIMEZONE;

// Six 2-hour arrival windows covering business hours
export const TIME_SLOTS = [
    { label: '7:00 AM – 9:00 AM',  start: '07:00', end: '09:00' },
    { label: '9:00 AM – 11:00 AM', start: '09:00', end: '11:00' },
    { label: '11:00 AM – 1:00 PM', start: '11:00', end: '13:00' },
    { label: '1:00 PM – 3:00 PM',  start: '13:00', end: '15:00' },
    { label: '3:00 PM – 5:00 PM',  start: '15:00', end: '17:00' },
    { label: '5:00 PM – 7:00 PM',  start: '17:00', end: '19:00' },
];

// Returns 'HH:MM' string in LA time from an ISO dateTime string
function toHHMM(dateTimeStr) {
    const parts = new Date(dateTimeStr)
        .toLocaleTimeString('en-US', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false })
        .split(':');
    return `${parts[0].padStart(2, '0')}:${parts[1]}`;
}

// True when [aStart, aEnd) and [bStart, bEnd) overlap
function overlaps(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd;
}

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

        // Only timed events can conflict with arrival windows
        const bookedRanges = (data.items || [])
            .filter(e => e.start.dateTime)
            .map(e => ({
                start: toHHMM(e.start.dateTime),
                end:   toHHMM(e.end.dateTime),
            }));

        const nowLA    = new Date(new Date().toLocaleString('en-US', { timeZone: TZ }));
        const todayStr = nowLA.toLocaleDateString('en-CA');
        const nowHHMM  = `${String(nowLA.getHours()).padStart(2, '0')}:${String(nowLA.getMinutes()).padStart(2, '0')}`;
        const isToday  = date === todayStr;

        const slots = TIME_SLOTS.map(slot => {
            const taken = bookedRanges.some(r => overlaps(r.start, r.end, slot.start, slot.end));
            const past  = isToday && slot.start <= nowHHMM;
            return { ...slot, available: !taken && !past };
        });

        return res.status(200).json({ slots, date });
    } catch (err) {
        console.error('[slots]', err.message);
        return res.status(500).json({ error: 'Failed to fetch time slots. Please try again.' });
    }
}
