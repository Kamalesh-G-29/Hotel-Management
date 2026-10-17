import { useState } from 'react'
import RoyalCrownLogo from './RoyalCrownLogo.jsx'

const FooterIcon = ({ children, size = 16, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
)

const FOOTER_ICONS = {
  mail: (
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  pin: (
    <>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>
  ),
  close: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
}

const MODAL_DATA = {
  privacy: {
    title: 'Privacy Policy',
    badge: 'Guest Trust & Data Privacy',
    content: (
      <>
        <p>
          At <strong>LuxeRoyale Stays India</strong>, your privacy and personal discretion are paramount.
          We process minimal reservation details solely to facilitate concierge bookings,
          guarantee royal hospitality reservations, and process secure INR (₹) transactions.
        </p>
        <p>
          We adhere strictly to India’s Digital Personal Data Protection (DPDP) Act. Your booking details
          and preferences are never sold or shared with unauthorized third parties.
        </p>
        <p>
          For inquiries or data assistance, please reach out to our privacy desk at <em>concierge@luxeroyalestays.in</em>.
        </p>
      </>
    ),
  },
  terms: {
    title: 'Terms & Conditions',
    badge: 'Booking & Platform Usage Agreement',
    content: (
      <>
        <p>
          By exploring or reserving properties through LuxeRoyale Stays India, you agree to our Terms of Service.
        </p>
        <ul className="footer-modal-list">
          <li><strong>ID Verification:</strong> Government-approved photo ID (Passport, Aadhaar) is required upon arrival at all partner palaces.</li>
          <li><strong>Pricing & Taxes:</strong> All rates are quoted in Indian Rupees (₹ INR) inclusive of transparent luxury hospitality GST brackets.</li>
          <li><strong>Heritage Sanctity:</strong> Guests are respectfully requested to preserve the architectural antiquities of our palatial suites.</li>
        </ul>
      </>
    ),
  },
  cancellation: {
    title: 'Cancellation & Refund Policy',
    badge: 'Flexible Heritage Protection',
    content: (
      <>
        <p>Standardized royal cancellation terms across LuxeRoyale Stays India:</p>
        <ul className="footer-modal-list">
          <li><strong>Free Cancellation:</strong> 100% refund on cancellations initiated up to 48 hours prior to check-in (2:00 PM IST).</li>
          <li><strong>Late Cancellation:</strong> 50% reservation fee for cancellations between 24 and 48 hours prior to arrival.</li>
          <li><strong>Refund Processing:</strong> Refunds are credited to the original payment instrument within 5 to 7 business banking days.</li>
        </ul>
      </>
    ),
  },
  cookies: {
    title: 'Cookie Policy',
    badge: 'Personalized Royal Experience',
    content: (
      <>
        <p>
          LuxeRoyale Stays India uses essential cookies to remember your viewing theme (Light/Dark Mode),
          search filters, and currency preferences. No invasive tracking cookies are used.
        </p>
      </>
    ),
  },
}

const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  const [activeModalKey, setActiveModalKey] = useState(null)

  const handleHomeClick = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenModal = (key, e) => {
    e?.preventDefault()
    if (MODAL_DATA[key]) {
      setActiveModalKey(key)
    }
  }

  const handleCloseModal = () => {
    setActiveModalKey(null)
  }

  const modalInfo = activeModalKey ? MODAL_DATA[activeModalKey] : null

  return (
    <>
      <footer className="app-footer luxury-palace-footer" role="contentinfo" aria-label="LuxeRoyale Stays Footer">
        <div className="footer-top-accent" aria-hidden="true" />

        <div className="footer-container">
          <div className="footer-luxury-content">
            <div className="footer-section-brand">
              <div className="footer-brand-wrap">
                <a
                  className="footer-brand"
                  href="/"
                  onClick={handleHomeClick}
                  aria-label="LuxeRoyale Stays - Return to Home"
                  title="LuxeRoyale Stays"
                >
                  <span className="footer-brand-home-icon" aria-hidden="true">
                    <RoyalCrownLogo size={24} />
                  </span>
                  <div className="footer-brand-text-block">
                    <span className="footer-brand-name">
                      LuxeRoyale <span className="brand-accent">Stays</span>
                    </span>
                    <span className="footer-brand-country-tag">LUXURY HOTEL MANAGEMENT</span>
                  </div>
                </a>
              </div>

              <p className="footer-brand-description">
                Curating India’s celebrated royal palace hotels, heritage havelis, and luxury sanctuaries.
              </p>
            </div>

            <div className="footer-section-contact">
              <div className="footer-contact-two-by-two">
                <div className="contact-box">
                  <span className="contact-icon-mint" aria-hidden="true">
                    <FooterIcon size={16}>{FOOTER_ICONS.mail}</FooterIcon>
                  </span>
                  <div className="contact-details">
                    <span className="contact-title">Email Concierge</span>
                    <a
                      href="mailto:concierge@luxeroyalestays.in"
                      className="contact-primary-text"
                    >
                      concierge@luxeroyalestays.in
                    </a>
                    <span className="contact-supporting-text">
                      For bookings, assistance and special requests
                    </span>
                  </div>
                </div>

                <div className="contact-box">
                  <span className="contact-icon-mint" aria-hidden="true">
                    <FooterIcon size={16}>{FOOTER_ICONS.phone}</FooterIcon>
                  </span>
                  <div className="contact-details">
                    <span className="contact-title">Reservations</span>
                    <a
                      href="tel:+911149827000"
                      className="contact-primary-text"
                    >
                      +91 (0) 11 4982 7000
                    </a>
                    <span className="contact-supporting-text">
                      Speak to our travel experts
                    </span>
                  </div>
                </div>

                <div className="contact-box">
                  <span className="contact-icon-mint" aria-hidden="true">
                    <FooterIcon size={16}>{FOOTER_ICONS.pin}</FooterIcon>
                  </span>
                  <div className="contact-details">
                    <span className="contact-title">Headquarters</span>
                    <span className="contact-primary-text no-link">
                      Connaught Place, New Delhi, India
                    </span>
                    <span className="contact-supporting-text">
                      Our registered office
                    </span>
                  </div>
                </div>

                <div className="contact-box">
                  <span className="contact-icon-mint" aria-hidden="true">
                    <FooterIcon size={16}>{FOOTER_ICONS.clock}</FooterIcon>
                  </span>
                  <div className="contact-details">
                    <span className="contact-title">Support Hours</span>
                    <span className="contact-primary-text no-link">
                      24/7 Royal Guest Concierge
                    </span>
                    <span className="contact-supporting-text">
                      Always here for your next journey
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-clean-separator" aria-hidden="true" />

        <div className="footer-bottom-bar">
          <div className="footer-container footer-bottom-flex">
            <div className="footer-copyright-text">
              © {CURRENT_YEAR} LuxeRoyale Stays. All rights reserved.
            </div>

            <nav className="footer-legal-links" aria-label="Legal & Policies">
              <a
                href="#privacy"
                className="footer-legal-link"
                onClick={(e) => handleOpenModal('privacy', e)}
              >
                Privacy Policy
              </a>
              <span className="footer-legal-dot" aria-hidden="true">·</span>
              <a
                href="#terms"
                className="footer-legal-link"
                onClick={(e) => handleOpenModal('terms', e)}
              >
                Terms &amp; Conditions
              </a>
              <span className="footer-legal-dot" aria-hidden="true">·</span>
              <a
                href="#cancellation"
                className="footer-legal-link"
                onClick={(e) => handleOpenModal('cancellation', e)}
              >
                Cancellation Policy
              </a>
              <span className="footer-legal-dot" aria-hidden="true">·</span>
              <a
                href="#cookies"
                className="footer-legal-link"
                onClick={(e) => handleOpenModal('cookies', e)}
              >
                Cookie Policy
              </a>
            </nav>
          </div>
        </div>
      </footer>

      {modalInfo && (
        <div
          className="overlay footer-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal()
          }}
          role="presentation"
        >
          <div
            className="modal modal-md footer-info-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="footer-modal-title"
          >
            <div className="modal-header">
              <div>
                <span className="badge badge-primary">{modalInfo.badge}</span>
                <h3 id="footer-modal-title" className="mt-1">{modalInfo.title}</h3>
              </div>
              <button
                type="button"
                className="btn-icon btn-ghost"
                onClick={handleCloseModal}
                aria-label="Close dialog"
                title="Close"
              >
                <FooterIcon size={18}>{FOOTER_ICONS.close}</FooterIcon>
              </button>
            </div>
            <div className="modal-body footer-modal-body">
              {modalInfo.content}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCloseModal}
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
