// POST /api/book
// Creates a GoHighLevel contact for the booking.

const GHL_API = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';

// "8:00 AM – 9:00 AM" → "8-9am" | "2:00 PM – 4:00 PM" → "2-4pm"
function formatArrivalTime(slotLabel) {
    const m = slotLabel?.match(/(\d+):\d+\s*(AM|PM)\s*[–-]\s*(\d+):\d+\s*(AM|PM)/i);
    if (!m) return slotLabel || '';
    return `${m[1]}-${m[3]}${m[4].toLowerCase()}`;
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

    const token      = process.env.GHL_ACCESS_TOKEN;
    const locationId = process.env.GHL_LOCATION_ID;

    if (!token || !locationId) {
        console.error('[book] Missing GHL environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const detailsValue = [
        `Movers: ${movers}`,
        notes ? `Notes: ${notes.trim()}` : null,
    ].filter(Boolean).join(' | ');

    const contactData = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        phone,
        email,
        locationId,
        tags: ['Booking form'],
        customFields: [
            { id: 'yS4Bj6LtQ3lLCuju7vl0', value: moveSize },
            { id: 'KyE8Eopo3MXg4aXjGnqS', value: fromAddress },
            { id: 'DjfpJEtJnBnDBP6nvJ1l', value: toAddress },
            { id: 'VuatzebiX5qPrzGjl4d4', value: date },
            { id: 'BZMRDjwmqFl957qHlTO6', value: formatArrivalTime(slotLabel) },
            { id: 'HZgxySrqsR4IICCBWZr5', value: detailsValue },
        ],
    };

    try {
        const ghlRes  = await fetch(`${GHL_API}/contacts/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type':  'application/json',
                'Version':        GHL_VERSION,
            },
            body: JSON.stringify(contactData),
        });

        const ghlData = await ghlRes.json();

        // Duplicate contact — update instead of failing
        if (!ghlRes.ok && ghlData.message?.includes('duplicated contacts')) {
            const existingId = ghlData.meta?.contactId;

            if (!existingId) {
                console.error('[book] Duplicate contact but no ID returned:', ghlData);
                return res.status(400).json({ error: 'Failed to create contact in CRM' });
            }

            const updateRes  = await fetch(`${GHL_API}/contacts/${existingId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type':  'application/json',
                    'Version':        GHL_VERSION,
                },
                body: JSON.stringify(contactData),
            });

            const updateData = await updateRes.json();

            if (!updateRes.ok) {
                console.error('[book] Failed to update existing contact:', updateData);
                return res.status(updateRes.status).json({ error: 'Failed to confirm booking. Please try again or call (323) 645-2636.' });
            }

            return res.status(200).json({ success: true, eventId: existingId });
        }

        if (!ghlRes.ok) {
            console.error('[book] GHL API error:', ghlData);
            return res.status(ghlRes.status).json({ error: 'Failed to confirm booking. Please try again or call (323) 645-2636.' });
        }

        const contactId = ghlData.contact?.id || ghlData.id;
        return res.status(200).json({ success: true, eventId: contactId });

    } catch (err) {
        console.error('[book]', err.message);
        return res.status(500).json({ error: 'Failed to confirm booking. Please try again or call (323) 645-2636.' });
    }
}
