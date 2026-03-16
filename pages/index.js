import Head from 'next/head';
import Script from 'next/script';

export default function BookingPage() {
    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="description" content="Book your move online with Splendid Moving — 5-star rated movers in Los Angeles. Select your date, pick a time, and we'll handle the rest." />
                <title>Book Your Move | Splendid Moving</title>
                <link rel="icon" type="image/png" href="https://splendidmoving.com/assets/images/favicon.png" />
                <meta property="og:type"        content="website" />
                <meta property="og:title"       content="Book Your Move | Splendid Moving" />
                <meta property="og:description" content="Schedule your Los Angeles move online in minutes." />
                <meta property="og:image"       content="https://splendidmoving.com/assets/images/Brand Logo.png" />
            </Head>

            {/* ── Header ──────────────────────────────────── */}
            <header className="site-header">
                <div className="header-inner container">
                    <a href="https://splendidmoving.com" className="header-logo" aria-label="Splendid Moving — back to main site">
                        <img src="https://splendidmoving.com/assets/images/Brand Logo.png" alt="Splendid Moving" height="36" />
                    </a>
                    <a href="tel:2137240394" className="header-phone">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.29h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        (213) 724-0394
                    </a>
                </div>
            </header>

            {/* ── Hero ────────────────────────────────────── */}
            <section className="booking-hero">
                <div className="hero-inner container">
                    <div className="hero-badge">Online Booking</div>
                    <h1>Schedule Your Move</h1>
                    <p>Fill in your details, pick a date and time, and you&apos;re all set.<br />We&apos;ll take care of the rest.</p>
                    <div className="hero-trust">
                        <div className="trust-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            4.9-star rated
                        </div>
                        <div className="trust-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            Licensed &amp; insured
                        </div>
                        <div className="trust-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                            Available 7 days a week
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Booking Widget ───────────────────────────── */}
            <main className="booking-main">
                <div className="booking-container container">

                    {/* Progress Bar — 7 steps */}
                    <div className="steps-bar" id="steps-bar" aria-label="Booking steps">
                        <div className="step-item active" data-step="1">
                            <span className="step-num">1</span>
                            <span className="step-label">Move Size</span>
                        </div>
                        <div className="step-divider" aria-hidden="true"></div>
                        <div className="step-item" data-step="2">
                            <span className="step-num">2</span>
                            <span className="step-label">Contact</span>
                        </div>
                        <div className="step-divider" aria-hidden="true"></div>
                        <div className="step-item" data-step="3">
                            <span className="step-num">3</span>
                            <span className="step-label">Details</span>
                        </div>
                        <div className="step-divider" aria-hidden="true"></div>
                        <div className="step-item" data-step="4">
                            <span className="step-num">4</span>
                            <span className="step-label">Date</span>
                        </div>
                        <div className="step-divider" aria-hidden="true"></div>
                        <div className="step-item" data-step="5">
                            <span className="step-num">5</span>
                            <span className="step-label">Time</span>
                        </div>
                        <div className="step-divider" aria-hidden="true"></div>
                        <div className="step-item" data-step="6">
                            <span className="step-num">6</span>
                            <span className="step-label">Terms</span>
                        </div>
                        <div className="step-divider" aria-hidden="true"></div>
                        <div className="step-item" data-step="7">
                            <span className="step-num">7</span>
                            <span className="step-label">Confirm</span>
                        </div>
                    </div>

                    {/* ── Step 1: Move Size & Team ───────────── */}
                    <div className="booking-panel active" id="panel-move-size" role="region" aria-label="Select your move size and team">
                        <div className="panel-header">
                            <h2>How Big Is Your Move?</h2>
                            <p>Select your move size and we&apos;ll recommend the right team for you.</p>
                        </div>

                        <div className="form-section">
                            <h3 className="form-section-title">Move Size</h3>
                            <div className="form-group">
                                <label htmlFor="move-size-select">What size is your move? <span className="req" aria-hidden="true">*</span></label>
                                <select id="move-size-select" name="moveSize" required>
                                    <option value="">Select your move size…</option>
                                    <option value="Few Items">Few Items</option>
                                    <option value="Studio">Studio</option>
                                    <option value="1 Bedroom">1 Bedroom</option>
                                    <option value="2 Bedrooms">2 Bedrooms</option>
                                    <option value="3 Bedrooms">3 Bedrooms</option>
                                    <option value="4+ Bedrooms">4+ Bedrooms</option>
                                    <option value="Small Office">Small Office</option>
                                    <option value="Medium Office">Medium Office</option>
                                    <option value="Large Office">Large Office</option>
                                </select>
                                <span className="field-error" id="err-move-size-select"></span>
                            </div>
                        </div>

                        <div className="movers-section" id="movers-section">
                            <h3 className="form-section-title">Select Your Team</h3>
                            <div className="movers-list" id="movers-grid" role="listbox" aria-label="Select number of movers">

                                <button type="button" className="mover-btn" data-movers="2" role="option" aria-selected="false">
                                    <div className="mover-btn__info">
                                        <span className="mover-btn__team">2 Movers + 26ft Truck</span>
                                        <span className="mover-btn__desc">Perfect for studios &amp; 1-bedrooms</span>
                                        <span className="mover-badge">Recommended</span>
                                    </div>
                                    <div className="mover-btn__pricing">
                                        <div className="mover-btn__rate-col">
                                            <span className="mover-btn__rate-amount">$110<span className="mover-btn__rate-unit">/hr</span></span>
                                            <span className="mover-btn__rate-label">Cash</span>
                                        </div>
                                        <span className="mover-btn__rate-sep">or</span>
                                        <div className="mover-btn__rate-col">
                                            <span className="mover-btn__rate-amount">$120<span className="mover-btn__rate-unit">/hr</span></span>
                                            <span className="mover-btn__rate-label">Card</span>
                                        </div>
                                    </div>
                                </button>

                                <button type="button" className="mover-btn" data-movers="3" role="option" aria-selected="false">
                                    <div className="mover-btn__info">
                                        <span className="mover-btn__team">3 Movers + 26ft Truck</span>
                                        <span className="mover-btn__desc">Ideal for 2-bedrooms &amp; small offices</span>
                                        <span className="mover-badge">Recommended</span>
                                    </div>
                                    <div className="mover-btn__pricing">
                                        <div className="mover-btn__rate-col">
                                            <span className="mover-btn__rate-amount">$135<span className="mover-btn__rate-unit">/hr</span></span>
                                            <span className="mover-btn__rate-label">Cash</span>
                                        </div>
                                        <span className="mover-btn__rate-sep">or</span>
                                        <div className="mover-btn__rate-col">
                                            <span className="mover-btn__rate-amount">$145<span className="mover-btn__rate-unit">/hr</span></span>
                                            <span className="mover-btn__rate-label">Card</span>
                                        </div>
                                    </div>
                                </button>

                                <button type="button" className="mover-btn" data-movers="4" role="option" aria-selected="false">
                                    <div className="mover-btn__info">
                                        <span className="mover-btn__team">4 Movers + 26ft Truck</span>
                                        <span className="mover-btn__desc">Best for 3+ bedrooms &amp; larger offices</span>
                                        <span className="mover-badge">Recommended</span>
                                    </div>
                                    <div className="mover-btn__pricing">
                                        <div className="mover-btn__rate-col">
                                            <span className="mover-btn__rate-amount">$170<span className="mover-btn__rate-unit">/hr</span></span>
                                            <span className="mover-btn__rate-label">Cash</span>
                                        </div>
                                        <span className="mover-btn__rate-sep">or</span>
                                        <div className="mover-btn__rate-col">
                                            <span className="mover-btn__rate-amount">$180<span className="mover-btn__rate-unit">/hr</span></span>
                                            <span className="mover-btn__rate-label">Card</span>
                                        </div>
                                    </div>
                                </button>

                            </div>

                            <div className="rate-includes">
                                <div className="rate-includes__title">Every move includes:</div>
                                <ul className="rate-includes__list">
                                    <li>26ft moving truck</li>
                                    <li>Free shrink wrap &amp; tape</li>
                                    <li>Furniture protection blankets</li>
                                    <li>Packing &amp; unpacking</li>
                                    <li>Furniture disassembly &amp; reassembly</li>
                                </ul>
                            </div>

                            <div className="min-charge-box">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="min-charge-icon" style={{flexShrink:0, marginTop:'2px'}}>
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                <p><strong>3-hour minimum applies to all moves.</strong> You&apos;re billed per hour and the clock starts when our team arrives. Need more than 4 movers or a second truck? Call us at <a href="tel:3236452636">(323) 645-2636</a>.</p>
                            </div>

                            <div className="mover-warning" id="mover-warning" role="alert" aria-live="polite"></div>
                            <span className="field-error" id="err-movers-step1"></span>
                        </div>

                        <div className="panel-actions panel-actions--end">
                            <button type="button" className="btn btn--primary" id="move-size-continue">
                                Continue
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* ── Step 2: Contact Info ───────────────── */}
                    <div className="booking-panel" id="panel-contact" role="region" aria-label="Your contact information">
                        <div className="panel-header">
                            <h2>Let&apos;s Book Your Move</h2>
                            <p>You&apos;ve received your quote — now let&apos;s lock in your date.</p>
                        </div>
                        <form id="contact-form" noValidate>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name <span className="req" aria-hidden="true">*</span></label>
                                    <input type="text" id="firstName" name="firstName" required autoComplete="given-name" />
                                    <span className="field-error" id="err-firstName"></span>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name <span className="req" aria-hidden="true">*</span></label>
                                    <input type="text" id="lastName" name="lastName" required autoComplete="family-name" />
                                    <span className="field-error" id="err-lastName"></span>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number <span className="req" aria-hidden="true">*</span></label>
                                    <input type="tel" id="phone" name="phone" required autoComplete="tel" placeholder="(213) 555-0123" />
                                    <span className="field-error" id="err-phone"></span>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email Address <span className="req" aria-hidden="true">*</span></label>
                                    <input type="email" id="email" name="email" required autoComplete="email" />
                                    <span className="field-error" id="err-email"></span>
                                </div>
                            </div>
                            <div className="panel-actions">
                                <button type="button" className="btn btn--back" id="back-to-move-size">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                    Back
                                </button>
                                <button type="submit" className="btn btn--primary">
                                    Continue
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ── Step 3: Move Details + Addresses ──── */}
                    <div className="booking-panel" id="panel-address" role="region" aria-label="Your move addresses and details">
                        <div className="panel-header">
                            <h2>Move Details</h2>
                            <p id="step2-contact-display" className="step-context"></p>
                        </div>
                        <form id="address-form" noValidate>
                            <div className="form-section">
                                <h3 className="form-section-title">Addresses</h3>
                                <div className="form-group">
                                    <label htmlFor="fromAddress">Moving From <span className="req" aria-hidden="true">*</span></label>
                                    <input type="text" id="fromAddress" name="fromAddress" required autoComplete="off" placeholder="Full address including city, state" />
                                    <span className="field-error" id="err-fromAddress"></span>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="toAddress">Moving To <span className="req" aria-hidden="true">*</span></label>
                                    <input type="text" id="toAddress" name="toAddress" required autoComplete="off" placeholder="Full address including city, state" />
                                    <span className="field-error" id="err-toAddress"></span>
                                </div>
                            </div>
                            <div className="form-section">
                                <h3 className="form-section-title">Additional Notes</h3>
                                <div className="form-group">
                                    <label htmlFor="notes">Notes <span className="optional">(optional)</span></label>
                                    <textarea id="notes" name="notes" rows="3" placeholder="Special items, parking info, floor level, elevator access, etc."></textarea>
                                </div>
                            </div>
                            <div className="panel-actions">
                                <button type="button" className="btn btn--back" id="back-to-contact">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                    Back
                                </button>
                                <button type="submit" className="btn btn--primary">
                                    Continue to Calendar
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ── Step 3: Date ───────────────────────── */}
                    <div className="booking-panel" id="panel-date" role="region" aria-label="Select a date">
                        <div className="panel-header">
                            <h2>Select a Date</h2>
                            <p>Available dates are highlighted below</p>
                        </div>
                        <div className="calendar-wrapper">
                            <div className="cal-nav">
                                <button className="cal-nav-btn" id="prev-month" aria-label="Previous month">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </button>
                                <span className="cal-month-label" id="cal-month-label" aria-live="polite"></span>
                                <button className="cal-nav-btn" id="next-month" aria-label="Next month">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            </div>
                            <div className="cal-weekdays" aria-hidden="true">
                                <span>Sun</span><span>Mon</span><span>Tue</span>
                                <span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                            </div>
                            <div className="cal-grid" id="cal-grid" role="grid" aria-label="Calendar"></div>
                            <div className="cal-loading" id="cal-loading" aria-live="polite">
                                <div className="spinner" aria-hidden="true"></div>
                                <span>Loading availability…</span>
                            </div>
                            <div className="cal-legend" aria-hidden="true">
                                <div className="legend-item"><span className="legend-dot legend-dot--available"></span>Available</div>
                                <div className="legend-item"><span className="legend-dot legend-dot--limited"></span>Limited</div>
                                <div className="legend-item"><span className="legend-dot legend-dot--booked"></span>Fully booked</div>
                            </div>
                        </div>
                        <div className="office-notice">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="office-notice-icon">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <p><strong>Don&apos;t see your preferred date?</strong> We can often accommodate requests not shown here — including today and tomorrow. Call or text <a href="tel:2137240394">(213) 724-0394</a> or email <a href="mailto:info@splendidmoving.com">info@splendidmoving.com</a>.</p>
                        </div>
                        <div className="panel-actions panel-actions--left">
                            <button className="btn btn--back" id="back-to-address">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                                Back
                            </button>
                        </div>
                    </div>

                    {/* ── Step 4: Time Slot ─────────────────── */}
                    <div className="booking-panel" id="panel-time" role="region" aria-label="Select an arrival window">
                        <div className="panel-header">
                            <h2>Select Arrival Window</h2>
                            <p id="step4-date-display" className="step-context"></p>
                        </div>
                        <div className="slots-loading" id="slots-loading" aria-live="polite">
                            <div className="spinner" aria-hidden="true"></div>
                            <span>Checking availability…</span>
                        </div>
                        <div className="slots-grid" id="slots-grid" role="list" aria-label="Available time slots"></div>
                        <div className="office-notice" id="slots-office-notice">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="office-notice-icon">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <p><strong>Need a different time?</strong> Contact our office directly — we may have additional availability not shown here. Call or text <a href="tel:2137240394">(213) 724-0394</a> or email <a href="mailto:info@splendidmoving.com">info@splendidmoving.com</a>.</p>
                        </div>
                        <div className="panel-actions panel-actions--left">
                            <button className="btn btn--back" id="back-to-date">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                                Back
                            </button>
                        </div>
                    </div>

                    {/* ── Step 5: Terms & Conditions ────────── */}
                    <div className="booking-panel" id="panel-terms" role="region" aria-label="Terms and conditions">
                        <div className="panel-header">
                            <h2>Terms &amp; Conditions</h2>
                            <p id="step5-summary" className="step-context"></p>
                        </div>
                        <div className="terms-box" tabIndex="0" aria-label="Terms and conditions text">
                            <h3>1. Booking Confirmation</h3>
                            <p>Submitting this form constitutes a booking request. Your move is confirmed only after you receive a confirmation text or email from Splendid Moving. We will contact you within one hour to verify all details.</p>

                            <h3>2. Deposit &amp; Payment</h3>
                            <p>A $50 deposit is required to secure your moving date. Full payment is due upon completion of the move. We accept physical cash and card payments only. Final pricing is based on your original quote and may be adjusted if the scope of the move changes.</p>

                            <h3>3. Cancellation &amp; Rescheduling</h3>
                            <p>A minimum 72-hour notice is required to cancel or reschedule your move. Cancellations made within this window will forfeit the deposit.</p>

                            <h3>4. Minimum &amp; Transportation Charges</h3>
                            <p>All moves are subject to a 3-hour minimum. If the distance between your pick-up and delivery address exceeds 15 miles, drive time is charged as Double Drive Time (DDT) and added on top of the minimum. A gas fee may apply if your pick-up location is more than 30 miles from our depot.</p>

                            <h3>5. Access &amp; Parking</h3>
                            <p>You are responsible for ensuring adequate parking and elevator or stairwell access at both locations. Any parking fees or fines incurred by our crew will be added to your final invoice.</p>
                        </div>
                        <div className="terms-accept">
                            <label className="checkbox-label" htmlFor="terms-checkbox">
                                <input type="checkbox" id="terms-checkbox" />
                                <span>I have read and agree to the terms and conditions above</span>
                            </label>
                            <span className="field-error" id="err-terms"></span>
                        </div>
                        <div className="panel-actions">
                            <button type="button" className="btn btn--back" id="back-to-time">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                                Back
                            </button>
                            <button type="button" className="btn btn--primary" id="terms-accept-btn">
                                Review My Booking
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* ── Step 6: Review & Confirm ──────────── */}
                    <div className="booking-panel" id="panel-confirm" role="region" aria-label="Review and confirm your booking">
                        <div className="panel-header">
                            <h2>Review Your Booking</h2>
                            <p>Please confirm everything looks correct before submitting.</p>
                        </div>
                        <div className="booking-summary" id="booking-summary"></div>
                        <div className="api-error" id="api-error" role="alert"></div>
                        <div className="panel-actions">
                            <button className="btn btn--back" id="back-to-terms">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                                Edit
                            </button>
                            <button className="btn btn--primary" id="confirm-btn">
                                <span id="confirm-btn-text">Submit Booking</span>
                                <span id="confirm-btn-spinner" className="btn-spinner" style={{display: 'none'}} aria-hidden="true"></span>
                            </button>
                        </div>
                    </div>

                    {/* ── Success ───────────────────────────── */}
                    <div className="booking-panel" id="panel-success" role="region" aria-label="Booking confirmed">
                        <div className="success-screen">
                            <div className="success-icon" aria-hidden="true">✓</div>
                            <h2>Booking Submitted!</h2>
                            <p className="success-msg">Your request is in! One of our team members will reach out shortly to confirm your move.</p>
                            <div className="success-card" id="success-card"></div>
                            <div className="success-actions">
                                <a href="#" id="add-to-gcal" className="btn btn--outline" target="_blank" rel="noopener">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    Add to Google Calendar
                                </a>
                                <a href="https://splendidmoving.com" className="btn btn--primary">Back to Main Site</a>
                            </div>
                            <p className="success-contact">Questions? Call us at <a href="tel:2137240394">(213) 724-0394</a></p>
                        </div>
                    </div>

                </div>
            </main>

            {/* ── Footer ──────────────────────────────────── */}
            <footer className="site-footer">
                <div className="footer-inner container">
                    <p>© <span id="footer-year"></span> Splendid Moving &nbsp;·&nbsp; Los Angeles, CA &nbsp;·&nbsp;
                        <a href="tel:2137240394">(213) 724-0394</a> &nbsp;·&nbsp;
                        <a href="https://splendidmoving.com">splendidmoving.com</a>
                    </p>
                </div>
            </footer>

            <Script src="/script.js" strategy="afterInteractive" />
            {/* No callback= in URL — onLoad fires after Maps is ready, by which point script.js has already executed */}
            <Script
                src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB8m3zbP2Eknf1agTJPLpHc4U6ACh8HpME&libraries=places"
                strategy="afterInteractive"
                onLoad={() => { if (window.initAddressAutocomplete) window.initAddressAutocomplete(); }}
            />
        </>
    );
}
