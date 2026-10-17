import React from 'react'

export function TealHotelIcon({ size = 32, className = '' }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`teal-hotel-icon ${className}`}
      aria-hidden="true"
    >

      <path
        d="M16 2.5L2 13.5H6.2L16 5.8L25.8 13.5H30L16 2.5Z"
        fill="#008075"
      />

      <rect x="4.5" y="15" width="23" height="2.8" rx="1.4" fill="#008075" />
      {/* 3 Vertical Pillars */}
      <rect x="6.8" y="19.5" width="3.8" height="10" rx="1.5" fill="#008075" />
      <rect x="14.1" y="19.5" width="3.8" height="10" rx="1.5" fill="#008075" />
      <rect x="21.4" y="19.5" width="3.8" height="10" rx="1.5" fill="#008075" />
    </svg>
  )
}


export default function LuxeRoyaleLogo({
  size = 32,
  showTagline = true,
  taglineText = 'LUXURY HOTEL MANAGEMENT',
  className = '',
  inline = false,
}) {
  return (
    <div className={`luxeroyale-logo-lockup ${inline ? 'is-inline' : ''} ${className}`}>
      <span className="luxeroyale-logo-mark" aria-hidden="true">
        <TealHotelIcon size={size} />
      </span>
      <div className="luxeroyale-logo-text">
        <span className="luxeroyale-brand-title">
          <span className="brand-navy">LuxeRoyale</span>{' '}
          <span className="brand-teal">Stays</span>
        </span>
        {showTagline && (
          <span className="luxeroyale-brand-tagline">{taglineText}</span>
        )}
      </div>
    </div>
  )
}
