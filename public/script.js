// ============================================================
// Splendid Moving — Online Booking Engine
// ============================================================

(function () {
    'use strict';

    // ── Config ────────────────────────────────────────────────
    // Keep in sync with MAX_ADVANCE_MONTHS in config.js
    const MAX_ADVANCE_MONTHS = 3;   // how far ahead customers can book

    // Mirrors the server-side TIME_SLOTS constant in api/slots.js
    const TIME_SLOTS = [
        { label: '7:00 AM – 9:00 AM',  start: '07:00', end: '09:00' },
        { label: '9:00 AM – 11:00 AM', start: '09:00', end: '11:00' },
        { label: '11:00 AM – 1:00 PM', start: '11:00', end: '13:00' },
        { label: '1:00 PM – 3:00 PM',  start: '13:00', end: '15:00' },
        { label: '3:00 PM – 5:00 PM',  start: '15:00', end: '17:00' },
        { label: '5:00 PM – 7:00 PM',  start: '17:00', end: '19:00' },
    ];

    // ── State ─────────────────────────────────────────────────
    const state = {
        year:         null,
        month:        null,   // 0-indexed (JS Date convention)
        selectedDate: null,   // 'YYYY-MM-DD'
        selectedSlot: null,   // { label, start, end }
        availability: {},     // { 'YYYY-MM-DD': { count, available } }
        maxJobs:      3,
        slots:        [],     // [{ label, start, end, available }]
        step:         1,
        submitting:   false,
        formData:     {},
        confirmedEventId: null,
    };

    // ── DOM References ────────────────────────────────────────
    const $ = id => document.getElementById(id);

    const els = {
        stepsBar:       $('steps-bar'),

        // Panels
        panelDate:      $('panel-date'),
        panelTime:      $('panel-time'),
        panelDetails:   $('panel-details'),
        panelConfirm:   $('panel-confirm'),
        panelSuccess:   $('panel-success'),

        // Calendar
        calGrid:        $('cal-grid'),
        calMonthLabel:  $('cal-month-label'),
        calLoading:     $('cal-loading'),
        prevMonth:      $('prev-month'),
        nextMonth:      $('next-month'),

        // Slots
        slotsGrid:      $('slots-grid'),
        slotsLoading:   $('slots-loading'),
        step2DateDisp:  $('step2-date-display'),

        // Details form
        bookingForm:    $('booking-form'),
        step3Summary:   $('step3-summary'),

        // Confirm
        bookingSummary: $('booking-summary'),
        apiError:       $('api-error'),
        confirmBtn:     $('confirm-btn'),
        confirmBtnText: $('confirm-btn-text'),
        confirmBtnSpinner: $('confirm-btn-spinner'),

        // Success
        successCard:    $('success-card'),
        addToGcal:      $('add-to-gcal'),

        // Nav buttons
        backToDate:     $('back-to-date'),
        backToTime:     $('back-to-time'),
        backToDetails:  $('back-to-details'),

        footerYear:     $('footer-year'),
    };

    // ── Utilities ─────────────────────────────────────────────

    function toDateStr(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    function todayStr() {
        return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
    }

    function tomorrowStr() {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
    }

    function formatDateLong(dateStr) {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });
    }

    function formatDateShort(dateStr) {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
        });
    }

    // Generate a Google Calendar "add event" link
    function buildGcalLink({ date, slotStart, slotEnd, firstName, lastName, fromAddress }) {
        const [y, mo, d] = date.split('-');
        const fmt = (h, mi) => `${y}${mo}${d}T${h}${mi}00`;
        const [startH, startM] = slotStart.split(':');
        const [endH, endM]     = slotEnd.split(':');
        const start = fmt(startH, startM);
        const end   = fmt(endH, endM);
        const title = encodeURIComponent(`Move with Splendid Moving`);
        const loc   = encodeURIComponent(fromAddress || '');
        const desc  = encodeURIComponent(`Your Splendid Moving crew will arrive during this window.\nPhone: (213) 724-0394`);
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${desc}&location=${loc}`;
    }

    // ── API Calls ─────────────────────────────────────────────

    // Simple in-memory cache so navigating back to a month doesn't re-fetch
    const _availCache = {};

    async function fetchAvailability(year, month) {
        const key = `${year}-${month}`;
        if (_availCache[key]) return _availCache[key];
        // month is 0-indexed; API expects 1-indexed
        const res = await fetch(`/api/availability?year=${year}&month=${month + 1}`);
        if (!res.ok) throw new Error('Failed to load availability');
        const data = await res.json();
        _availCache[key] = data;
        return data;
    }

    async function fetchSlots(date) {
        const res = await fetch(`/api/slots?date=${date}`);
        if (!res.ok) throw new Error('Failed to load time slots');
        return res.json();
    }

    async function postBooking(payload) {
        const res = await fetch('/api/book', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Booking failed');
        return data;
    }

    // ── Calendar ──────────────────────────────────────────────

    async function loadAndRenderCalendar(year, month) {
        // Show loading, reset grid
        els.calGrid.classList.remove('cal-grid--loaded');
        els.calGrid.innerHTML = '';
        els.calLoading.classList.add('visible');

        const today = todayStr();
        const now   = new Date();

        // Month label
        els.calMonthLabel.textContent = new Date(year, month, 1)
            .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        // Disable prev button if already at current month
        const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
        els.prevMonth.disabled = isCurrentMonth;

        // Disable next button if at max advance months
        const maxDate  = new Date(now.getFullYear(), now.getMonth() + MAX_ADVANCE_MONTHS, 1);
        const thisDate = new Date(year, month, 1);
        els.nextMonth.disabled = thisDate >= maxDate;

        try {
            const data = await fetchAvailability(year, month);
            state.availability = data.dates;
            state.maxJobs = data.maxJobs;
        } catch {
            state.availability = {};
        }

        els.calLoading.classList.remove('visible');
        renderCalendarGrid(year, month, today);
    }

    function renderCalendarGrid(year, month, today) {
        const tomorrow    = tomorrowStr();
        const firstDay    = new Date(year, month, 1).getDay(); // 0 = Sunday
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const fragment    = document.createDocumentFragment();

        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'cal-day cal-day--empty';
            empty.setAttribute('aria-hidden', 'true');
            fragment.appendChild(empty);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr    = toDateStr(year, month, d);
            const dayInfo    = state.availability[dateStr];
            const isPast     = dateStr < today;
            const isToday    = dateStr === today;
            const isTomorrow = dateStr === tomorrow;
            const isBlocked  = isToday || isTomorrow;   // today & tomorrow always unavailable
            const count      = dayInfo ? dayInfo.count : 0;
            const slotsLeft  = state.maxJobs - count;
            const isBooked   = slotsLeft <= 0;
            const isSelected = dateStr === state.selectedDate;

            const btn = document.createElement('button');
            btn.setAttribute('type', 'button');
            btn.setAttribute('aria-label', formatDateLong(dateStr));

            let cls   = 'cal-day';
            let badge = '';

            if (isPast) {
                cls += ' cal-day--past';
                btn.disabled = true;

            } else if (isBlocked) {
                cls += ' cal-day--blocked';
                if (isToday) cls += ' cal-day--today';
                btn.disabled = true;
                btn.setAttribute('aria-disabled', 'true');

            } else if (isBooked) {
                cls += ' cal-day--booked';
                btn.disabled = true;
                btn.setAttribute('aria-disabled', 'true');
                badge = `<span class="cal-day-slots cal-day-slots--full">Full</span>`;

            } else {
                // Available — classify by how many slots remain
                if (slotsLeft === 1) {
                    cls += ' cal-day--available cal-day--urgent';
                    badge = `<span class="cal-day-slots cal-day-slots--urgent">1 left</span>`;
                } else if (slotsLeft < state.maxJobs) {
                    cls += ' cal-day--available cal-day--limited';
                    badge = `<span class="cal-day-slots cal-day-slots--limited">${slotsLeft} left</span>`;
                } else {
                    cls += ' cal-day--available';
                    badge = `<span class="cal-day-slots cal-day-slots--open">${state.maxJobs} slots</span>`;
                }
                btn.addEventListener('click', () => handleDateSelect(dateStr));
            }

            if (isSelected) cls += ' cal-day--selected';

            btn.className = cls;
            btn.dataset.date = dateStr;
            btn.innerHTML = `<span class="cal-day-num">${d}</span>${badge}`;
            fragment.appendChild(btn);
        }

        els.calGrid.appendChild(fragment);
        // Trigger fade-in after grid is populated
        requestAnimationFrame(() => els.calGrid.classList.add('cal-grid--loaded'));
    }

    async function handleDateSelect(dateStr) {
        state.selectedDate = dateStr;

        // Toggle selected class without re-rendering the whole grid
        els.calGrid.querySelectorAll('.cal-day--selected').forEach(el => el.classList.remove('cal-day--selected'));
        const target = els.calGrid.querySelector(`[data-date="${dateStr}"]`);
        if (target) target.classList.add('cal-day--selected');

        // Load slots then advance
        goToStep(2);
        els.slotsGrid.innerHTML = '';
        els.slotsLoading.style.display = 'flex';
        els.step2DateDisp.textContent  = formatDateLong(dateStr);

        try {
            const data  = await fetchSlots(dateStr);
            state.slots = data.slots;
        } catch {
            state.slots = TIME_SLOTS.map(s => ({ ...s, available: false }));
        }

        els.slotsLoading.style.display = 'none';
        renderSlots();
    }

    // ── Slots ─────────────────────────────────────────────────

    function renderSlots() {
        els.slotsGrid.innerHTML = '';
        const anyAvailable = state.slots.some(s => s.available);

        if (!anyAvailable) {
            els.slotsGrid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--gray-500);">
                    <p style="font-size:1.1rem;font-weight:600;margin-bottom:0.5rem;">No slots available</p>
                    <p style="font-size:0.875rem;">All times are booked for this day. Please select a different date.</p>
                </div>`;
            return;
        }

        state.slots.forEach(slot => {
            const card = document.createElement('button');
            card.type = 'button';
            card.setAttribute('role', 'listitem');
            card.setAttribute('aria-label', `${slot.label} — ${slot.available ? 'available' : 'unavailable'}`);

            let cls = 'slot-card';
            if (!slot.available) cls += ' slot-card--unavailable';
            if (state.selectedSlot && state.selectedSlot.start === slot.start) cls += ' slot-card--selected';
            card.className = cls;

            card.innerHTML = `
                <span class="slot-time">${slot.label}</span>
                <span class="slot-status">${slot.available ? 'Available' : 'Booked'}</span>`;

            if (slot.available) {
                card.addEventListener('click', () => handleSlotSelect(slot));
            } else {
                card.disabled = true;
            }

            els.slotsGrid.appendChild(card);
        });
    }

    function handleSlotSelect(slot) {
        state.selectedSlot = slot;
        // Update selection highlight
        els.slotsGrid.querySelectorAll('.slot-card').forEach(c => {
            const t = c.querySelector('.slot-time').textContent;
            if (t === slot.label) {
                c.classList.add('slot-card--selected');
            } else {
                c.classList.remove('slot-card--selected');
            }
        });

        // Short delay then advance to details
        setTimeout(() => goToStep(3), 250);
    }

    // ── Form ──────────────────────────────────────────────────

    // Shared field definitions — used by validateForm and bindEvents
    const BOOKING_FIELDS = [
        { id: 'firstName',   msg: 'Please enter your first name.' },
        { id: 'lastName',    msg: 'Please enter your last name.' },
        { id: 'phone',       msg: 'Please enter your phone number.' },
        { id: 'email',       msg: 'Please enter a valid email address.' },
        { id: 'fromAddress', msg: 'Please enter your moving-from address.' },
        { id: 'toAddress',   msg: 'Please enter your moving-to address.' },
        { id: 'movers',      msg: 'Please select the number of movers.' },
        { id: 'moveSize',    msg: 'Please select your move size.' },
    ];

    function validateForm() {
        let valid = true;

        const fields = BOOKING_FIELDS;

        // Clear existing errors
        fields.forEach(f => {
            const el = document.getElementById(f.id);
            const err = document.getElementById('err-' + f.id);
            el.classList.remove('invalid');
            if (err) err.textContent = '';
        });

        fields.forEach(f => {
            const el  = document.getElementById(f.id);
            const err = document.getElementById('err-' + f.id);
            let fieldValid = true;

            if (!el.value.trim()) {
                fieldValid = false;
            } else if (f.id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())) {
                fieldValid = false;
            } else if (f.id === 'phone' && el.value.trim().replace(/\D/g, '').length < 10) {
                fieldValid = false;
            }

            if (!fieldValid) {
                valid = false;
                el.classList.add('invalid');
                if (err) err.textContent = f.msg;
            }
        });

        return valid;
    }

    function collectFormData() {
        return {
            firstName:   document.getElementById('firstName').value.trim(),
            lastName:    document.getElementById('lastName').value.trim(),
            phone:       document.getElementById('phone').value.trim(),
            email:       document.getElementById('email').value.trim(),
            fromAddress: document.getElementById('fromAddress').value.trim(),
            toAddress:   document.getElementById('toAddress').value.trim(),
            movers:      document.getElementById('movers').value,
            moveSize:    document.getElementById('moveSize').value,
            notes:       document.getElementById('notes').value.trim(),
        };
    }

    // ── Summary ───────────────────────────────────────────────

    function renderSummary(fd) {
        const { selectedDate, selectedSlot } = state;

        els.bookingSummary.innerHTML = `
            <div class="summary-section">
                <div class="summary-section-title">Schedule</div>
                <div class="summary-row">
                    <span class="summary-label">Date</span>
                    <span class="summary-value">${formatDateLong(selectedDate)}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Arrival</span>
                    <span class="summary-value">${selectedSlot.label}</span>
                </div>
            </div>
            <div class="summary-section">
                <div class="summary-section-title">Contact</div>
                <div class="summary-row">
                    <span class="summary-label">Name</span>
                    <span class="summary-value">${fd.firstName} ${fd.lastName}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Phone</span>
                    <span class="summary-value">${fd.phone}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Email</span>
                    <span class="summary-value">${fd.email}</span>
                </div>
            </div>
            <div class="summary-section">
                <div class="summary-section-title">Move Details</div>
                <div class="summary-row">
                    <span class="summary-label">From</span>
                    <span class="summary-value">${fd.fromAddress}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">To</span>
                    <span class="summary-value">${fd.toAddress}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Movers</span>
                    <span class="summary-value">${fd.movers} movers</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Size</span>
                    <span class="summary-value">${fd.moveSize}</span>
                </div>
                ${fd.notes ? `
                <div class="summary-row">
                    <span class="summary-label">Notes</span>
                    <span class="summary-value">${fd.notes}</span>
                </div>` : ''}
            </div>`;
    }

    // ── Booking Submission ────────────────────────────────────

    async function submitBooking() {
        if (state.submitting) return;
        state.submitting = true;

        // Show spinner
        els.confirmBtnText.style.display = 'none';
        els.confirmBtnSpinner.style.display = 'inline-block';
        els.confirmBtn.disabled = true;

        // Hide any prior error
        els.apiError.classList.remove('visible');
        els.apiError.textContent = '';

        const fd = state.formData;
        const payload = {
            date:        state.selectedDate,
            slotStart:   state.selectedSlot.start,
            slotEnd:     state.selectedSlot.end,
            slotLabel:   state.selectedSlot.label,
            ...fd,
        };

        try {
            const result = await postBooking(payload);
            state.confirmedEventId = result.eventId;
            showSuccess();
        } catch (err) {
            els.apiError.textContent = err.message || 'Something went wrong. Please try again.';
            els.apiError.classList.add('visible');

            // Reset button
            els.confirmBtnText.style.display = 'inline';
            els.confirmBtnSpinner.style.display = 'none';
            els.confirmBtn.disabled = false;
        } finally {
            state.submitting = false;
        }
    }

    // ── Success Screen ────────────────────────────────────────

    function showSuccess() {
        const fd = state.formData;
        const { selectedDate, selectedSlot } = state;

        // Build summary card
        els.successCard.innerHTML = `
            <div class="success-card-row">
                <span class="label">Date</span>
                <span class="value">${formatDateLong(selectedDate)}</span>
            </div>
            <div class="success-card-row">
                <span class="label">Arrival</span>
                <span class="value">${selectedSlot.label}</span>
            </div>
            <div class="success-card-row">
                <span class="label">Name</span>
                <span class="value">${fd.firstName} ${fd.lastName}</span>
            </div>
            <div class="success-card-row">
                <span class="label">Phone</span>
                <span class="value">${fd.phone}</span>
            </div>`;

        // Build Google Calendar link
        els.addToGcal.href = buildGcalLink({
            date:       selectedDate,
            slotStart:  selectedSlot.start,
            slotEnd:    selectedSlot.end,
            firstName:  fd.firstName,
            lastName:   fd.lastName,
            fromAddress: fd.fromAddress,
        });

        // Hide progress bar on success
        els.stepsBar.style.display = 'none';

        goToStep(5);
    }

    // ── Step Navigation ───────────────────────────────────────

    function goToStep(n) {
        state.step = n;

        const panels = [
            null,
            els.panelDate,
            els.panelTime,
            els.panelDetails,
            els.panelConfirm,
            els.panelSuccess,
        ];

        panels.forEach((p, i) => {
            if (!p) return;
            p.classList.toggle('active', i === n);
        });

        // Update steps bar
        if (n <= 4) {
            els.stepsBar.querySelectorAll('.step-item').forEach(item => {
                const s = parseInt(item.dataset.step, 10);
                item.classList.toggle('active', s === n);
                item.classList.toggle('done',   s < n);
            });
        }

        // Scroll to top of panel
        window.scrollTo({ top: els.stepsBar.offsetTop - 80, behavior: 'smooth' });
    }

    // ── Month Navigation ──────────────────────────────────────

    function prevMonth() {
        if (state.month === 0) {
            state.month = 11;
            state.year--;
        } else {
            state.month--;
        }
        loadAndRenderCalendar(state.year, state.month);
    }

    function nextMonth() {
        if (state.month === 11) {
            state.month = 0;
            state.year++;
        } else {
            state.month++;
        }
        loadAndRenderCalendar(state.year, state.month);
    }

    // ── Address Autocomplete (Google Places) ─────────────────
    // Called as a callback when the Google Maps script loads.
    // Add your Maps API key to the <script> tag in index.html.

    window.initAddressAutocomplete = function () {
        const addressFields = ['fromAddress', 'toAddress'];
        addressFields.forEach(fieldId => {
            const input = document.getElementById(fieldId);
            if (!input || !window.google?.maps?.places) return;
            const ac = new google.maps.places.Autocomplete(input, {
                componentRestrictions: { country: 'us' },
                fields: ['formatted_address'],
            });
            ac.addListener('place_changed', () => {
                const place = ac.getPlace();
                if (place.formatted_address) input.value = place.formatted_address;
            });
        });
    };

    // ── Event Listeners ───────────────────────────────────────

    function bindEvents() {
        // Month navigation
        els.prevMonth.addEventListener('click', prevMonth);
        els.nextMonth.addEventListener('click', nextMonth);

        // Back buttons
        els.backToDate.addEventListener('click', () => goToStep(1));
        els.backToTime.addEventListener('click', () => {
            goToStep(2);
            // Re-show the correct date & slots
            els.step2DateDisp.textContent = formatDateLong(state.selectedDate);
            els.slotsLoading.style.display = 'none';
            renderSlots();
        });
        els.backToDetails.addEventListener('click', () => goToStep(3));

        // Form submit → go to confirm
        els.bookingForm.addEventListener('submit', e => {
            e.preventDefault();
            if (!validateForm()) return;
            state.formData = collectFormData();
            renderSummary(state.formData);

            // Update step 3 context display
            els.step3Summary.textContent =
                `${formatDateShort(state.selectedDate)} · ${state.selectedSlot.label}`;

            goToStep(4);
        });

        // Final confirm button
        els.confirmBtn.addEventListener('click', submitBooking);

        // Dismiss field error on input
        BOOKING_FIELDS.forEach(({ id }) => {
            const el  = document.getElementById(id);
            const err = document.getElementById('err-' + id);
            if (!el) return;
            el.addEventListener('input', () => {
                el.classList.remove('invalid');
                if (err) err.textContent = '';
            });
        });
    }

    // ── Init ──────────────────────────────────────────────────

    function init() {
        // Footer year
        if (els.footerYear) els.footerYear.textContent = new Date().getFullYear();

        // Start at current month in LA time
        const now  = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
        state.year  = now.getFullYear();
        state.month = now.getMonth();

        bindEvents();
        goToStep(1);
        loadAndRenderCalendar(state.year, state.month);
    }

    // Works whether DOMContentLoaded has already fired (Next.js) or not
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
