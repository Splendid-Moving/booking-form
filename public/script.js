// ============================================================
// Splendid Moving — Online Booking Engine
// ============================================================

(function () {
    'use strict';

    // ── Config ────────────────────────────────────────────────
    const MAX_ADVANCE_MONTHS = 3;

    // Mirrors TIME_SLOTS in api/slots.js
    const TIME_SLOTS = [
        { label: '8:00 AM – 9:00 AM',  start: '08:00', end: '09:00', period: 'morning'   },
        { label: '9:00 AM – 10:00 AM', start: '09:00', end: '10:00', period: 'morning'   },
        { label: '2:00 PM – 4:00 PM',  start: '14:00', end: '16:00', period: 'afternoon' },
    ];

    // Distance restriction: if pickup is ≥ FAR_MILES from depot, disable 8-9 AM slot
    const DEPOT_ADDRESS = '909 Beacon Ave, Los Angeles, CA 90015';
    const FAR_MILES     = 30;

    // ── State ─────────────────────────────────────────────────
    const state = {
        year:             null,
        month:            null,
        selectedDate:     null,   // 'YYYY-MM-DD'
        selectedSlot:     null,   // { label, start, end, period }
        availability:     {},     // { 'YYYY-MM-DD': { remaining, available } }
        slots:            [],     // raw slots from API
        step:             1,
        submitting:       false,
        formData:         {},
        confirmedEventId: null,
        distanceMiles:    null,   // null = unknown; number after check
        _distancePromise: null,   // in-flight Distance Matrix promise
        selectedMoveSize: null,   // move size chosen in step 1
        selectedMovers:   null,   // mover count chosen in step 1
    };

    // Recommended movers per move size
    const MOVER_RECOMMENDATIONS = {
        'Few Items':    2,
        'Studio':       2,
        '1 Bedroom':    2,
        '2 Bedrooms':   3,
        '3 Bedrooms':   4,
        '4+ Bedrooms':  4,
        'Small Office': 3,
        'Medium Office': 4,
        'Large Office': 4,
    };

    // ── DOM References ────────────────────────────────────────
    const $ = id => document.getElementById(id);

    const els = {
        stepsBar:            $('steps-bar'),

        // Panels
        panelMoveSize:       $('panel-move-size'),
        panelContact:        $('panel-contact'),
        panelAddress:        $('panel-address'),
        panelDate:           $('panel-date'),
        panelTime:           $('panel-time'),
        panelTerms:          $('panel-terms'),
        panelConfirm:        $('panel-confirm'),
        panelSuccess:        $('panel-success'),

        // Move size step (step 1)
        moveSizeSelect:      $('move-size-select'),
        errMoveSizeSelect:   $('err-move-size-select'),
        moversSection:       $('movers-section'),
        moversGrid:          $('movers-grid'),
        moverWarning:        $('mover-warning'),
        errMoversStep1:      $('err-movers-step1'),
        moveSizeContinue:    $('move-size-continue'),

        // Contact form (step 2)
        contactForm:         $('contact-form'),

        // Address form (step 3)
        addressForm:         $('address-form'),
        step2ContactDisplay: $('step2-contact-display'),

        // Calendar (step 3)
        calGrid:             $('cal-grid'),
        calMonthLabel:       $('cal-month-label'),
        calLoading:          $('cal-loading'),
        prevMonth:           $('prev-month'),
        nextMonth:           $('next-month'),

        // Slots (step 4)
        slotsGrid:           $('slots-grid'),
        slotsLoading:        $('slots-loading'),
        step4DateDisplay:    $('step4-date-display'),
        slotsOfficeNotice:   $('slots-office-notice'),

        // Terms (step 5)
        termsCheckbox:       $('terms-checkbox'),
        termsAcceptBtn:      $('terms-accept-btn'),
        step5Summary:        $('step5-summary'),
        errTerms:            $('err-terms'),

        // Confirm (step 6)
        bookingSummary:      $('booking-summary'),
        apiError:            $('api-error'),
        confirmBtn:          $('confirm-btn'),
        confirmBtnText:      $('confirm-btn-text'),
        confirmBtnSpinner:   $('confirm-btn-spinner'),

        // Success
        successCard:         $('success-card'),
        addToGcal:           $('add-to-gcal'),

        // Nav buttons
        backToMoveSize:      $('back-to-move-size'),
        backToContact:       $('back-to-contact'),
        backToAddress:       $('back-to-address'),
        backToDate:          $('back-to-date'),
        backToTime:          $('back-to-time'),
        backToTerms:         $('back-to-terms'),

        footerYear:          $('footer-year'),
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

    function buildGcalLink({ date, slotStart, slotEnd, firstName, lastName, fromAddress }) {
        const [y, mo, d] = date.split('-');
        const fmt = (h, mi) => `${y}${mo}${d}T${h}${mi}00`;
        const [startH, startM] = slotStart.split(':');
        const [endH, endM]     = slotEnd.split(':');
        const start = fmt(startH, startM);
        const end   = fmt(endH, endM);
        const title = encodeURIComponent('Move with Splendid Moving');
        const loc   = encodeURIComponent(fromAddress || '');
        const desc  = encodeURIComponent('Your Splendid Moving crew will arrive during this window.\nPhone: (323) 645-2636');
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${desc}&location=${loc}`;
    }

    // ── Caches ────────────────────────────────────────────────

    // Monthly availability cache: { 'year-month': apiResponse }
    const _availCache = {};

    // Per-date slots cache: { 'YYYY-MM-DD': apiResponse }
    const _slotsCache = {};

    // ── API Calls ─────────────────────────────────────────────

    async function fetchAvailability(year, month) {
        const key = `${year}-${month}`;
        if (_availCache[key]) return _availCache[key];
        const res = await fetch(`/api/availability?year=${year}&month=${month + 1}`);
        if (!res.ok) throw new Error('Failed to load availability');
        const data = await res.json();
        _availCache[key] = data;
        return data;
    }

    async function fetchSlots(date) {
        if (_slotsCache[date]) return _slotsCache[date];
        const res = await fetch(`/api/slots?date=${date}`);
        if (!res.ok) throw new Error('Failed to load time slots');
        const data = await res.json();
        _slotsCache[date] = data;
        return data;
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

    // ── Distance Check (Google Maps Distance Matrix) ──────────

    function startDistanceCheck(fromAddress) {
        state.distanceMiles    = null;
        state._distancePromise = null;

        if (!fromAddress) return;

        state._distancePromise = new Promise(resolve => {
            // Retry once Maps SDK finishes loading (it loads async with calendar)
            function attemptCheck() {
                if (!window.google?.maps?.DistanceMatrixService) {
                    resolve(null);
                    return;
                }
                const svc = new window.google.maps.DistanceMatrixService();
                svc.getDistanceMatrix({
                    origins:      [fromAddress],
                    destinations: [DEPOT_ADDRESS],
                    travelMode:   window.google.maps.TravelMode.DRIVING,
                }, (response, status) => {
                    if (status === 'OK') {
                        const el = response.rows[0]?.elements[0];
                        if (el?.status === 'OK') {
                            // distance.value is in metres
                            state.distanceMiles = el.distance.value / 1609.344;
                        }
                    }
                    state._distancePromise = null;
                    resolve(state.distanceMiles);
                });
            }
            attemptCheck();
        });
    }

    // ── Calendar ──────────────────────────────────────────────

    async function loadAndRenderCalendar(year, month) {
        els.calGrid.classList.remove('cal-grid--loaded');
        els.calGrid.innerHTML = '';
        els.calLoading.classList.add('visible');

        const today = todayStr();
        const now   = new Date();

        els.calMonthLabel.textContent = new Date(year, month, 1)
            .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
        els.prevMonth.disabled = isCurrentMonth;

        const maxDate  = new Date(now.getFullYear(), now.getMonth() + MAX_ADVANCE_MONTHS, 1);
        const thisDate = new Date(year, month, 1);
        els.nextMonth.disabled = thisDate >= maxDate;

        try {
            const data = await fetchAvailability(year, month);
            state.availability = data.dates;
        } catch {
            state.availability = {};
        }

        els.calLoading.classList.remove('visible');
        renderCalendarGrid(year, month, today);
    }

    function renderCalendarGrid(year, month, today) {
        const tomorrow    = tomorrowStr();
        const firstDay    = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const fragment    = document.createDocumentFragment();

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
            const isBlocked  = isToday || isTomorrow;
            const slotsLeft  = dayInfo ? dayInfo.remaining : 9;
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
                if (slotsLeft <= 2) {
                    cls += ' cal-day--available cal-day--urgent';
                    badge = `<span class="cal-day-slots cal-day-slots--urgent">${slotsLeft} left</span>`;
                } else if (slotsLeft <= 5) {
                    cls += ' cal-day--available cal-day--limited';
                    badge = `<span class="cal-day-slots cal-day-slots--limited">${slotsLeft} left</span>`;
                } else {
                    cls += ' cal-day--available';
                    badge = `<span class="cal-day-slots cal-day-slots--open">${slotsLeft} slots</span>`;
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
        requestAnimationFrame(() => els.calGrid.classList.add('cal-grid--loaded'));
    }

    async function handleDateSelect(dateStr) {
        state.selectedDate = dateStr;
        state.selectedSlot = null;

        els.calGrid.querySelectorAll('.cal-day--selected').forEach(el => el.classList.remove('cal-day--selected'));
        const target = els.calGrid.querySelector(`[data-date="${dateStr}"]`);
        if (target) target.classList.add('cal-day--selected');

        goToStep(5);
        els.slotsGrid.innerHTML = '';
        els.slotsLoading.style.display = 'flex';
        els.step4DateDisplay.textContent = formatDateLong(dateStr);

        // Await any in-flight distance check before rendering slots
        if (state._distancePromise) await state._distancePromise;

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

    function applyDistanceRestriction(slots) {
        if (state.distanceMiles === null || state.distanceMiles < FAR_MILES) return slots;
        return slots.map(slot => {
            if (slot.start === '08:00') return { ...slot, available: false, _farPickup: true };
            return slot;
        });
    }

    function renderSlots() {
        els.slotsGrid.innerHTML = '';

        const slots       = applyDistanceRestriction(state.slots);
        const anyAvail    = slots.some(s => s.available);
        const hasFarNote  = state.distanceMiles !== null && state.distanceMiles >= FAR_MILES;

        // Far-pickup notice (above cards, inside grid)
        if (hasFarNote) {
            const note = document.createElement('div');
            note.className = 'far-pickup-note';
            note.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span>The <strong>8:00–9:00 AM</strong> window is unavailable for your pickup location (${Math.round(state.distanceMiles)} miles from our depot). If you need that slot, please call our office.</span>`;
            els.slotsGrid.appendChild(note);
        }

        if (!anyAvail) {
            const msg = document.createElement('div');
            msg.style.cssText = 'grid-column:1/-1;text-align:center;padding:2rem;color:var(--gray-500)';
            msg.innerHTML = `
                <p style="font-size:1.1rem;font-weight:600;margin-bottom:0.5rem;">No slots available</p>
                <p style="font-size:0.875rem;">All times are booked for this day. Please select a different date or contact our office.</p>`;
            els.slotsGrid.appendChild(msg);
            return;
        }

        slots.forEach(slot => {
            const card = document.createElement('button');
            card.type = 'button';
            card.setAttribute('role', 'listitem');
            card.setAttribute('aria-label', `${slot.label} — ${slot.available ? 'available' : 'unavailable'}`);

            let cls = 'slot-card';
            if (!slot.available) cls += ' slot-card--unavailable';
            if (state.selectedSlot && state.selectedSlot.start === slot.start) cls += ' slot-card--selected';
            card.className = cls;

            const statusText = slot._farPickup ? 'Distance limit' : (slot.available ? 'Available' : 'Booked');
            card.innerHTML = `
                <span class="slot-time">${slot.label}</span>
                <span class="slot-status">${statusText}</span>`;

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
        els.slotsGrid.querySelectorAll('.slot-card').forEach(c => {
            const t = c.querySelector('.slot-time').textContent;
            c.classList.toggle('slot-card--selected', t === slot.label);
        });
        setTimeout(() => goToStep(6), 250);
    }

    // ── Form Validation ───────────────────────────────────────

    function validateFields(fields) {
        let valid = true;

        fields.forEach(f => {
            const el  = document.getElementById(f.id);
            const err = document.getElementById('err-' + f.id);
            if (el)  el.classList.remove('invalid');
            if (err) err.textContent = '';
        });

        fields.forEach(f => {
            const el  = document.getElementById(f.id);
            const err = document.getElementById('err-' + f.id);
            let ok = true;

            if (!el || !el.value.trim()) {
                ok = false;
            } else if (f.id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())) {
                ok = false;
            } else if (f.id === 'phone' && el.value.trim().replace(/\D/g, '').length < 10) {
                ok = false;
            }

            if (!ok) {
                valid = false;
                if (el)  el.classList.add('invalid');
                if (err) err.textContent = f.msg;
            }
        });

        return valid;
    }

    const CONTACT_FIELDS = [
        { id: 'firstName', msg: 'Please enter your first name.' },
        { id: 'lastName',  msg: 'Please enter your last name.' },
        { id: 'phone',     msg: 'Please enter your phone number.' },
        { id: 'email',     msg: 'Please enter a valid email address.' },
    ];

    const ADDRESS_FIELDS = [
        { id: 'fromAddress', msg: 'Please enter your pickup address.' },
        { id: 'toAddress',   msg: 'Please enter your delivery address.' },
    ];

    // ── Summary ───────────────────────────────────────────────

    function collectFormData() {
        return {
            firstName:   $('firstName').value.trim(),
            lastName:    $('lastName').value.trim(),
            phone:       $('phone').value.trim(),
            email:       $('email').value.trim(),
            fromAddress: $('fromAddress').value.trim(),
            toAddress:   $('toAddress').value.trim(),
            movers:      state.selectedMovers,
            moveSize:    state.selectedMoveSize,
            notes:       $('notes').value.trim(),
        };
    }

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

        els.confirmBtnText.style.display    = 'none';
        els.confirmBtnSpinner.style.display = 'inline-block';
        els.confirmBtn.disabled             = true;

        els.apiError.classList.remove('visible');
        els.apiError.textContent = '';

        const fd      = state.formData;
        const payload = {
            date:      state.selectedDate,
            slotStart: state.selectedSlot.start,
            slotEnd:   state.selectedSlot.end,
            slotLabel: state.selectedSlot.label,
            ...fd,
        };

        try {
            const result = await postBooking(payload);
            state.confirmedEventId = result.eventId;
            showSuccess();
        } catch (err) {
            els.apiError.textContent = err.message || 'Something went wrong. Please try again.';
            els.apiError.classList.add('visible');

            els.confirmBtnText.style.display    = 'inline';
            els.confirmBtnSpinner.style.display = 'none';
            els.confirmBtn.disabled             = false;
        } finally {
            state.submitting = false;
        }
    }

    // ── Success Screen ────────────────────────────────────────

    function showSuccess() {
        const fd = state.formData;
        const { selectedDate, selectedSlot } = state;

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

        els.addToGcal.href = buildGcalLink({
            date:        selectedDate,
            slotStart:   selectedSlot.start,
            slotEnd:     selectedSlot.end,
            firstName:   fd.firstName,
            lastName:    fd.lastName,
            fromAddress: fd.fromAddress,
        });

        els.stepsBar.style.display = 'none';
        goToStep(8);
    }

    // ── Step Navigation ───────────────────────────────────────

    function goToStep(n) {
        state.step = n;

        const panels = [
            null,
            els.panelMoveSize, // 1
            els.panelContact,  // 2
            els.panelAddress,  // 3
            els.panelDate,     // 4
            els.panelTime,     // 5
            els.panelTerms,    // 6
            els.panelConfirm,  // 7
            els.panelSuccess,  // 8
        ];

        panels.forEach((p, i) => {
            if (!p) return;
            p.classList.toggle('active', i === n);
        });

        // Update steps bar (steps 1-7; step 8 = success, bar is hidden)
        if (n <= 7) {
            els.stepsBar.querySelectorAll('.step-item').forEach(item => {
                const s = parseInt(item.dataset.step, 10);
                item.classList.toggle('active', s === n);
                item.classList.toggle('done',   s < n);
            });
        }

        window.scrollTo({ top: els.stepsBar.offsetTop - 80, behavior: 'smooth' });
    }

    // ── Month Navigation ──────────────────────────────────────

    function prevMonth() {
        if (state.month === 0) { state.month = 11; state.year--; }
        else                   { state.month--; }
        loadAndRenderCalendar(state.year, state.month);
    }

    function nextMonth() {
        if (state.month === 11) { state.month = 0; state.year++; }
        else                    { state.month++; }
        loadAndRenderCalendar(state.year, state.month);
    }

    // ── Address Autocomplete (Google Places) ─────────────────
    // Registered as a global callback for the Maps script tag.

    window.initAddressAutocomplete = function () {
        // Guard: if Maps Places library isn't ready yet, bail — the onLoad handler will retry
        if (!window.google?.maps?.places) return;

        const fields = [
            {
                id:      'fromAddress',
                onPlace: (place) => {
                    // Kick off distance check as soon as pickup is confirmed
                    if (place.formatted_address) {
                        startDistanceCheck(place.formatted_address);
                    }
                },
            },
            { id: 'toAddress', onPlace: null },
        ];

        fields.forEach(({ id, onPlace }) => {
            const input = document.getElementById(id);
            if (!input || !window.google?.maps?.places) return;

            const ac = new window.google.maps.places.Autocomplete(input, {
                componentRestrictions: { country: 'us' },
                fields: ['formatted_address'],
            });

            // Clear distance state if user edits the from-address manually
            if (id === 'fromAddress') {
                input.addEventListener('input', () => {
                    state.distanceMiles    = null;
                    state._distancePromise = null;
                });
            }

            ac.addListener('place_changed', () => {
                const place = ac.getPlace();
                if (place.formatted_address) {
                    input.value = place.formatted_address.replace(/, USA$/, '');
                    input.classList.remove('invalid');
                    const err = document.getElementById('err-' + id);
                    if (err) err.textContent = '';
                    if (onPlace) onPlace(place);
                }
            });
        });
    };

    // If Maps already finished loading before this script ran, init immediately
    if (window.google?.maps?.places) window.initAddressAutocomplete();

    // ── Event Listeners ───────────────────────────────────────

    // ── Move Size Step Logic ──────────────────────────────────

    function updateMoverWarning() {
        const recommended = MOVER_RECOMMENDATIONS[state.selectedMoveSize];
        const selected    = state.selectedMovers;
        if (!recommended || !selected || selected >= recommended) {
            els.moverWarning.classList.remove('visible');
            els.moverWarning.innerHTML = '';
            return;
        }
        els.moverWarning.innerHTML = `
            <svg class="mover-warning-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span><strong>Our recommendation for a ${state.selectedMoveSize} is ${recommended} movers.</strong> Going with ${selected} mover${selected === 1 ? '' : 's'} may result in your move taking longer to complete.</span>`;
        els.moverWarning.classList.add('visible');
    }

    function selectMoveSize(size) {
        state.selectedMoveSize = size;
        state.selectedMovers   = null;

        // Clear error
        if (els.errMoveSizeSelect) els.errMoveSizeSelect.textContent = '';
        if (els.moveSizeSelect) els.moveSizeSelect.classList.remove('invalid');

        // Update mover buttons: highlight recommended, clear previous selection
        const recommended = MOVER_RECOMMENDATIONS[size];
        els.moversGrid.querySelectorAll('.mover-btn').forEach(btn => {
            const count = parseInt(btn.dataset.movers, 10);
            btn.classList.toggle('mover-btn--recommended', count === recommended);
            btn.classList.remove('mover-btn--selected');
            btn.setAttribute('aria-selected', 'false');
        });

        // Clear warning, error, and pricing
        els.moverWarning.classList.remove('visible');
        els.moverWarning.innerHTML = '';
        if (els.errMoversStep1) els.errMoversStep1.textContent = '';

        // Show movers section
        els.moversSection.classList.add('visible');
    }

    function selectMovers(count) {
        state.selectedMovers = count;

        els.moversGrid.querySelectorAll('.mover-btn').forEach(btn => {
            const isSelected = parseInt(btn.dataset.movers, 10) === count;
            btn.classList.toggle('mover-btn--selected', isSelected);
            btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        });

        if (els.errMoversStep1) els.errMoversStep1.textContent = '';
        updateMoverWarning();
    }

    function bindEvents() {
        // Month nav
        els.prevMonth.addEventListener('click', prevMonth);
        els.nextMonth.addEventListener('click', nextMonth);

        // ── Step 1: Move size dropdown
        els.moveSizeSelect.addEventListener('change', () => {
            const size = els.moveSizeSelect.value;
            if (size) selectMoveSize(size);
        });

        // ── Step 1: Mover buttons
        els.moversGrid.querySelectorAll('.mover-btn').forEach(btn => {
            btn.addEventListener('click', () => selectMovers(parseInt(btn.dataset.movers, 10)));
        });

        // ── Step 1: Continue button
        els.moveSizeContinue.addEventListener('click', () => {
            if (!state.selectedMoveSize) {
                els.moveSizeSelect.classList.add('invalid');
                if (els.errMoveSizeSelect) els.errMoveSizeSelect.textContent = 'Please select your move size.';
                els.moveSizeSelect.focus();
                return;
            }
            if (!state.selectedMovers) {
                if (els.errMoversStep1) els.errMoversStep1.textContent = 'Please select the number of movers.';
                els.moversSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                return;
            }
            goToStep(2);
        });

        // ── Step 2: Contact form submit
        els.contactForm.addEventListener('submit', e => {
            e.preventDefault();
            if (!validateFields(CONTACT_FIELDS)) return;

            const fd = collectFormData();
            // Pre-fill context display for step 3
            els.step2ContactDisplay.textContent = `${fd.firstName} ${fd.lastName}`;
            goToStep(3);
        });

        // ── Step 3: Address form submit
        els.addressForm.addEventListener('submit', e => {
            e.preventDefault();
            if (!validateFields(ADDRESS_FIELDS)) return;

            // Go to calendar; fetch availability + distance check run in parallel
            goToStep(4);

            // Load calendar for current month (fetches from Google Calendar)
            loadAndRenderCalendar(state.year, state.month);

            // If Maps has loaded and fromAddress has a value, kick off distance check
            // (may already be running if user selected from autocomplete)
            const fromVal = $('fromAddress').value.trim();
            if (fromVal && state.distanceMiles === null && !state._distancePromise) {
                startDistanceCheck(fromVal);
            }
        });

        // ── Back buttons
        els.backToMoveSize.addEventListener('click', () => goToStep(1));

        els.backToContact.addEventListener('click', () => goToStep(2));

        els.backToAddress.addEventListener('click', () => goToStep(3));

        els.backToDate.addEventListener('click', () => {
            // Clear selection so calendar resets
            els.calGrid.querySelectorAll('.cal-day--selected').forEach(el => el.classList.remove('cal-day--selected'));
            state.selectedDate = null;
            goToStep(4);
        });

        els.backToTime.addEventListener('click', () => {
            goToStep(5);
            els.step4DateDisplay.textContent = formatDateLong(state.selectedDate);
            els.slotsLoading.style.display   = 'none';
            renderSlots();
        });

        els.backToTerms.addEventListener('click', () => goToStep(6));

        // ── Step 6: Terms accept
        els.termsAcceptBtn.addEventListener('click', () => {
            if (!els.termsCheckbox.checked) {
                els.errTerms.textContent = 'Please accept the terms and conditions to continue.';
                els.termsCheckbox.focus();
                return;
            }
            els.errTerms.textContent = '';

            // Collect all form data and render summary
            state.formData = collectFormData();
            renderSummary(state.formData);

            els.step5Summary.textContent =
                `${formatDateShort(state.selectedDate)} · ${state.selectedSlot.label}`;

            goToStep(7);
        });

        // Clear terms error when checkbox is clicked
        els.termsCheckbox.addEventListener('change', () => {
            if (els.termsCheckbox.checked) els.errTerms.textContent = '';
        });

        // ── Step 7: Final confirm / submit
        els.confirmBtn.addEventListener('click', submitBooking);

        // ── Dismiss field errors on input (contact fields)
        CONTACT_FIELDS.forEach(({ id }) => {
            const el  = document.getElementById(id);
            const err = document.getElementById('err-' + id);
            if (!el) return;
            el.addEventListener('input', () => {
                el.classList.remove('invalid');
                if (err) err.textContent = '';
            });
        });

        // Dismiss field errors on input (address fields)
        ADDRESS_FIELDS.forEach(({ id }) => {
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
        if (els.footerYear) els.footerYear.textContent = new Date().getFullYear();

        // Current month in LA time
        const now   = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
        state.year  = now.getFullYear();
        state.month = now.getMonth();

        bindEvents();
        goToStep(1);
        // Don't load the calendar yet — wait until the user reaches step 3
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
