// POST /api/book
// Creates a Google Calendar event for the booking.
// Optionally syncs a contact to GoHighLevel if GHL env vars are present.

import { CALENDAR_ID as CFG_CALENDAR_ID, TIMEZONE } from '../../config.js';
import { getCalendar } from '../../lib/calendar.js';

const CALENDAR_ID = process.env.CALENDAR_ID || CFG_CALENDAR_ID;
const TZ          = TIMEZONE;

function buildDescription({ firstName, lastName, phone, email, fromAddress, toAddress, movers, moveSize, slotLabel, notes }) {
    const lines = [
        '📋 BOOKING DETAILS',
        '──────────────────────────────',
        `👤 Name:      ${firstName} ${lastName}`,
        `📞 Phone:     ${phone}`,
        `📧 Email:     ${email}`,
        '',
        `📍 From:      ${fromAddress}`,
        `📍 To:        ${toAddress}`,
        '',
        `👷 Movers:    ${movers} movers`,
        `🏠 Move Size: ${moveSize}`,
        `⏰ Window:    ${slotLabel}`,
    ];
    if (notes && notes.trim()) {
        lines.push('', `📝 Notes:     ${notes.trim()}`);
    }
    lines.push('', '──────────────────────────────', 'Booked via: splendidmoving.com/calendar');
    return lines.join('\n');
}

// Optional: sync to GoHighLevel CRM (fire-and-forget, non-blocking)
async function syncToGHL({ firstName, lastName, phone, email, fromAddress, toAddress, moveSize, moveDate, movers, slotLabel, notes }) {
    const token      = process.env.GHL_ACCESS_TOKEN;
    const locationId = process.env.GHL_LOCATION_ID;
    if (!token || !locationId) return;

    const contactData = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        phone,
        email,
        locationId,
        tags: ['online-booking', `${movers}-movers`],
        customFields: [
            { id: 'yS4Bj6LtQ3lLCuju7vl0', value: moveSize },
            { id: 'KyE8Eopo3MXg4aXjGnqS', value: fromAddress },
            { id: 'DjfpJEtJnBnDBP6nvJ1l', value: toAddress },
            { id: 'VuatzebiX5qPrzGjl4d4', value: moveDate },
            { id: 'HZgxySrqsR4IICCBWZr5', value: `Arrival: ${slotLabel}${notes ? ' | Notes: ' + notes : ''}` },
            { id: 'i71w1J9MFtRcyAQYqElg', value: 'Online Booking' },
        ],
    };

    try {
        const res = await fetch('https://services.leadconnectorhq.com/contacts/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Version': '2021-07-28',
            },
            body: JSON.stringify(contactData),
        });

        if (!res.ok) {
            const body = await res.json();
            const existingId = body?.meta?.contactId;
            if (existingId) {
                await fetch(`https://services.leadconnectorhq.com/contacts/${existingId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Version': '2021-07-28',
                    },
                    body: JSON.stringify(contactData),
                });
            }
        }
    } catch (err) {
        console.error('[book] GHL sync failed (non-fatal):', err.message);
    }
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

    const {
        date, slotStart, slotEnd, slotLabel,
        firstName, lastName, phone, email,
        fromAddress, toAddress, movers, moveSize, notes,
    } = req.body || {};

    const required = { date, slotStart, slotEnd, firstName, lastName, phone, email, fromAddress, toAddress, movers, moveSize };
    const missing  = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) {
        return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    try {
        const calendar = await getCalendar(true);

        const event = await calendar.events.insert({
            calendarId: CALENDAR_ID,
            resource: {
                summary:     `${firstName} ${lastName}`,
                description: buildDescription({ firstName, lastName, phone, email, fromAddress, toAddress, movers, moveSize, slotLabel, notes }),
                start: { dateTime: `${date}T${slotStart}:00`, timeZone: TZ },
                end:   { dateTime: `${date}T${slotEnd}:00`,   timeZone: TZ },
                colorId: '2',
                extendedProperties: {
                    private: { source: 'online_booking', phone, email },
                },
            },
        });

        syncToGHL({ firstName, lastName, phone, email, fromAddress, toAddress, moveSize, moveDate: date, movers, slotLabel, notes });

        return res.status(200).json({ success: true, eventId: event.data.id });
    } catch (err) {
        console.error('[book]', err.message);
        return res.status(500).json({ error: 'Failed to confirm booking. Please try again or call (213) 724-0394.' });
    }
}
