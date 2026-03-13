// Shared Google Calendar auth utilities used by all API routes.

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';

// Credentials loaded once per process — no repeated disk reads or JSON parses.
let _credentials = null;
function getCredentials() {
    if (!_credentials) {
        if (process.env.GOOGLE_SERVICE_ACCOUNT) {
            _credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
        } else {
            _credentials = JSON.parse(readFileSync(join(process.cwd(), 'service_account.json'), 'utf8'));
        }
    }
    return _credentials;
}

/**
 * Returns an authenticated Google Calendar API client.
 * @param {boolean} writeAccess - true for calendar.events scope, false for readonly
 */
export async function getCalendar(writeAccess = false) {
    const auth = new google.auth.GoogleAuth({
        credentials: getCredentials(),
        scopes: writeAccess
            ? ['https://www.googleapis.com/auth/calendar.events']
            : ['https://www.googleapis.com/auth/calendar.readonly'],
    });
    const client = await auth.getClient();
    return google.calendar({ version: 'v3', auth: client });
}

/**
 * Returns the UTC offset string for America/Los_Angeles at a given Date.
 * Correctly accounts for Daylight Saving Time (PDT = -07:00, PST = -08:00).
 * @param {Date} date
 * @returns {string} e.g. '-07:00' or '-08:00'
 */
export function getLAOffset(date) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        timeZoneName: 'shortOffset',
    }).formatToParts(date);
    const tz = parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT-8';
    const m  = tz.match(/GMT([+-])(\d+)/);
    if (!m) return '-08:00';
    return `${m[1] === '+' ? '+' : '-'}${m[2].padStart(2, '0')}:00`;
}
