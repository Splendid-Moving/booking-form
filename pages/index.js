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
                    <p>Pick a date, choose an arrival window, and you&apos;re all set.<br />We&apos;ll take care of the rest.</p>
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

                    {/* Progress Bar */}
                    <div className="steps-bar" id="steps-bar" aria-label="Booking steps">
                        <div className="step-item active" data-step="1">
                            <span className="step-num">1</span>
                            <span className="step-label">Date</span>
                        </div>
                        <div className="step-divider" aria-hidden="true"></div>
                        <div className="step-item" data-step="2">
                            <span className="step-num">2</span>
                            <span className="step-label">Time</span>
                        </div>
                        <div className="step-divider" aria-hidden="true"></div>
                        <div className="step-item" data-step="3">
                            <span className="step-num">3</span>
                            <span className="step-label">Details</span>
                        </div>
                        <div className="step-divider" aria-hidden="true"></div>
                        <div className="step-item" data-step="4">
                            <span className="step-num">4</span>
                            <span className="step-label">Confirm</span>
                        </div>
                    </div>

                    {/* ── Step 1: Date ──────────────────────── */}
                    <div className="booking-panel active" id="panel-date" role="region" aria-label="Select a date">
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
                    </div>

                    {/* ── Step 2: Time Slot ─────────────────── */}
                    <div className="booking-panel" id="panel-time" role="region" aria-label="Select an arrival window">
                        <div className="panel-header">
                            <h2>Select Arrival Window</h2>
                            <p id="step2-date-display" className="step-context"></p>
                        </div>
                        <div className="slots-loading" id="slots-loading" aria-live="polite">
                            <div className="spinner" aria-hidden="true"></div>
                            <span>Checking availability…</span>
                        </div>
                        <div className="slots-grid" id="slots-grid" role="list" aria-label="Available time slots"></div>
                        <div className="panel-actions panel-actions--left">
                            <button className="btn btn--back" id="back-to-date">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                                Back
                            </button>
                        </div>
                    </div>

                    {/* ── Step 3: Details Form ──────────────── */}
                    <div className="booking-panel" id="panel-details" role="region" aria-label="Enter your move details">
                        <div className="panel-header">
                            <h2>Move Details</h2>
                            <p id="step3-summary" className="step-context"></p>
                        </div>
                        <form id="booking-form" noValidate>
                            <div className="form-section">
                                <h3 className="form-section-title">Contact Information</h3>
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
                            </div>
                            <div className="form-section">
                                <h3 className="form-section-title">Move Information</h3>
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
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="movers">Number of Movers <span className="req" aria-hidden="true">*</span></label>
                                        <select id="movers" name="movers" required>
                                            <option value="">Select…</option>
                                            <option value="2">2 Movers</option>
                                            <option value="3">3 Movers</option>
                                            <option value="4">4 Movers</option>
                                        </select>
                                        <span className="field-error" id="err-movers"></span>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="moveSize">Move Size <span className="req" aria-hidden="true">*</span></label>
                                        <select id="moveSize" name="moveSize" required>
                                            <option value="">Select…</option>
                                            <option value="Studio">Studio</option>
                                            <option value="1 Bedroom">1 Bedroom</option>
                                            <option value="2 Bedrooms">2 Bedrooms</option>
                                            <option value="3 Bedrooms">3 Bedrooms</option>
                                            <option value="4+ Bedrooms">4+ Bedrooms</option>
                                            <option value="Office / Commercial">Office / Commercial</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <span className="field-error" id="err-moveSize"></span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="notes">Additional Notes <span className="optional">(optional)</span></label>
                                    <textarea id="notes" name="notes" rows="3" placeholder="Special items, parking info, floor level, elevator access, etc."></textarea>
                                </div>
                            </div>
                            <div className="panel-actions">
                                <button type="button" className="btn btn--back" id="back-to-time">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                    Back
                                </button>
                                <button type="submit" className="btn btn--primary">
                                    Review Booking
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ── Step 4: Confirm ───────────────────── */}
                    <div className="booking-panel" id="panel-confirm" role="region" aria-label="Confirm your booking">
                        <div className="panel-header">
                            <h2>Review Your Booking</h2>
                            <p>Please confirm everything looks correct before submitting.</p>
                        </div>
                        <div className="booking-summary" id="booking-summary"></div>
                        <div className="api-error" id="api-error" role="alert"></div>
                        <div className="panel-actions">
                            <button className="btn btn--back" id="back-to-details">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                                Edit Details
                            </button>
                            <button className="btn btn--primary" id="confirm-btn">
                                <span id="confirm-btn-text">Confirm Booking</span>
                                <span id="confirm-btn-spinner" className="btn-spinner" aria-hidden="true"></span>
                            </button>
                        </div>
                    </div>

                    {/* ── Success ───────────────────────────── */}
                    <div className="booking-panel" id="panel-success" role="region" aria-label="Booking confirmed">
                        <div className="success-screen">
                            <div className="success-icon" aria-hidden="true">✓</div>
                            <h2>Booking Confirmed!</h2>
                            <p className="success-msg">Your move is scheduled. We&apos;ll reach out to confirm the details.</p>
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
        </>
    );
}
