import { useState, useEffect, useCallback, useMemo } from 'react'
import { amenityLabel, typeLabel, formatRupee } from '../services/hotelapi.js'
import HotelLocationMap from './HotelLocationMap.jsx'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'

const CURATED_GALLERIES = {
  h1: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
  ],
  h2: [
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  ],
  h3: [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
  ],
  h4: [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  ],
}

function getHotelGallery(hotel) {
  if (!hotel) return []
  const customImages = Array.isArray(hotel.images)
    ? hotel.images
        .map((img) => (typeof img === 'string' ? img.trim() : img?.url || ''))
        .filter(Boolean)
    : []
  const primary = hotel.image ? [hotel.image] : []
  const userImages = Array.from(new Set([...primary, ...customImages]))

  if (userImages.length >= 4) {
    return userImages
  }

  const curated = CURATED_GALLERIES[hotel.id] || []
  const fallbacks = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  ]
  const combined = Array.from(new Set([...userImages, ...curated, ...fallbacks]))
  return combined.slice(0, Math.max(5, combined.length))
}

export default function HotelDetailModal({
  hotel,
  onClose,
  onEdit,
  onDelete,
}) {
  const [activeImgIdx, setActiveImgIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)

  const gallery = useMemo(() => getHotelGallery(hotel), [hotel])

  const [prevHotelId, setPrevHotelId] = useState(hotel?.id)
  if (hotel?.id !== prevHotelId) {
    setPrevHotelId(hotel?.id)
    setActiveImgIdx(0)
    setLightboxIdx(0)
  }

  const handleKeyDown = useCallback(
    (e) => {
      if (lightboxOpen) {
        if (e.key === 'Escape') {
          e.stopPropagation()
          setLightboxOpen(false)
        } else if (e.key === 'ArrowRight') {
          e.stopPropagation()
          setLightboxIdx((prev) => (prev + 1) % gallery.length)
        } else if (e.key === 'ArrowLeft') {
          e.stopPropagation()
          setLightboxIdx((prev) => (prev - 1 + gallery.length) % gallery.length)
        }
      } else if (e.key === 'Escape') {
        onClose?.()
      }
    },
    [lightboxOpen, gallery.length, onClose],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!hotel) return null

  const openLightbox = (index = activeImgIdx) => {
    setLightboxIdx(index)
    setLightboxOpen(true)
  }

  const nextLightboxImage = (e) => {
    e?.stopPropagation()
    setLightboxIdx((prev) => (prev + 1) % gallery.length)
  }

  const prevLightboxImage = (e) => {
    e?.stopPropagation()
    setLightboxIdx((prev) => (prev - 1 + gallery.length) % gallery.length)
  }

  const currentMainImage = gallery[activeImgIdx] || hotel.image || FALLBACK_IMAGE
  const moreCount = gallery.length > 4 ? gallery.length - 4 : 0

  return (
    <>
      <div
        className="overlay hotel-detail-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget && !lightboxOpen) onClose?.()
        }}
        role="presentation"
      >
        <div
          className="modal modal-xl hotel-detail-modal"
          role="dialog"
          aria-modal="true"
          aria-label={hotel.name}
        >
          <div className="modal-header hotel-detail-header">
            <div>
              <div className="hotel-detail-header-tags">
                <span className="badge badge-primary">{typeLabel(hotel.type)}</span>
                {hotel.badge && <span className="badge badge-accent">{hotel.badge}</span>}
                <span className="badge badge-neutral">{hotel.stars || 5} Star Heritage</span>
              </div>
              <h2 className="hotel-detail-title">{hotel.name}</h2>
              <p className="hotel-location hotel-detail-location">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{hotel.city}{hotel.country ? `, ${hotel.country}` : ''}</span>
              </p>
            </div>
            <button
              type="button"
              className="btn-icon btn-ghost hotel-detail-close-btn"
              onClick={onClose}
              aria-label="Close hotel details"
              title="Close (Esc)"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="modal-body hotel-detail-body">
            <div className="hotel-gallery-wrapper">
              <div
                className="hotel-gallery-main"
                onClick={() => openLightbox(activeImgIdx)}
                role="button"
                tabIndex={0}
                aria-label="Click to open full-screen image viewer"
                title="Click to view full-screen photo"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') openLightbox(activeImgIdx)
                }}
              >
                <img
                  src={currentMainImage}
                  alt={`${hotel.name} - Photo ${activeImgIdx + 1}`}
                  className="hotel-gallery-main-img"
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE
                  }}
                />
                <div className="gallery-main-overlay" />
                <div className="gallery-counter-badge">
                  <span>Photo {activeImgIdx + 1} of {gallery.length}</span>
                </div>
                <div className="gallery-expand-hint">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                  <span>Click to Expand</span>
                </div>
              </div>

              <div className="hotel-gallery-thumbnails">
                {gallery.slice(0, 4).map((imgUrl, idx) => {
                  const isFourthWithMore = idx === 3 && moreCount > 0
                  const isCurrentActive = activeImgIdx === idx

                  return (
                    <div
                      key={idx}
                      className={`hotel-gallery-thumb-wrap ${isCurrentActive ? 'is-active' : ''}`}
                    >
                      <button
                        type="button"
                        className={`hotel-gallery-thumb-btn ${isCurrentActive ? 'is-active' : ''}`}
                        onClick={() => {
                          if (isFourthWithMore) {
                            openLightbox(3)
                          } else {
                            setActiveImgIdx(idx)
                          }
                        }}
                        aria-label={`View photo ${idx + 1}`}
                      >
                        <img
                          src={imgUrl}
                          alt={`${hotel.name} thumbnail ${idx + 1}`}
                          className="hotel-gallery-thumb-img"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_IMAGE
                          }}
                        />
                        {isFourthWithMore && (
                          <div className="hotel-gallery-thumb-more" title="View all photos">
                            <span>View All Photos</span>
                            <strong>+{moreCount}</strong>
                          </div>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="hotel-detail-content-grid">
              <div className="hotel-detail-left">
                <div className="hotel-detail-section">
                  <h3 className="hotel-detail-section-title">About this Property</h3>
                  <p className="hotel-detail-desc">{hotel.desc}</p>
                </div>

                {Array.isArray(hotel.amenities) && hotel.amenities.length > 0 && (
                  <div className="hotel-detail-section">
                    <h3 className="hotel-detail-section-title">Featured Amenities &amp; Inclusions</h3>
                    <div className="hotel-detail-amenities">
                      {hotel.amenities.map((item) => (
                        <span key={item} className="hotel-detail-amenity-pill">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{amenityLabel(item)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(hotel.videos) && hotel.videos.length > 0 && (
                  <div className="hotel-detail-section hotel-videos-section">
                    <h3 className="hotel-detail-section-title">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                      </svg>
                      <span>Palace Video Tours &amp; Walkthroughs ({hotel.videos.length})</span>
                    </h3>
                    <div className="hotel-videos-grid">
                      {hotel.videos.map((vid, idx) => (
                        <div key={vid.id || idx} className="hotel-video-card">
                          <div className="hotel-video-player-wrap">
                            <video
                              controls
                              playsInline
                              preload="metadata"
                              poster={vid.thumbnail || hotel.image}
                              src={vid.url}
                              className="hotel-embedded-player"
                            >
                              Your browser does not support HTML5 video.
                            </video>
                          </div>
                          <div className="hotel-video-info">
                            <h4 className="hotel-video-title">{vid.title || vid.name || `Palace Tour ${idx + 1}`}</h4>
                            <div className="hotel-video-meta">
                              <span className="badge badge-neutral">Embedded HD Player</span>
                              {vid.size ? <span className="video-size-tag">{(vid.size / (1024 * 1024)).toFixed(1)} MB</span> : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="hotel-detail-section hotel-location-map-section">
                  <h3 className="hotel-detail-section-title">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>Property Location &amp; Map</span>
                  </h3>
                  <HotelLocationMap hotel={hotel} height={300} />
                </div>
              </div>

              <div className="hotel-detail-right">
                <div className="hotel-detail-price-card">
                  <span className="price-card-label">Royal Suite Tariff</span>
                  <div className="hotel-detail-price-row">
                    {hotel.oldPrice ? (
                      <span className="hotel-detail-was-price">
                        {formatRupee(hotel.oldPrice)}
                      </span>
                    ) : null}
                    <div className="hotel-detail-main-price">
                      <span className="price-currency">{formatRupee(hotel.price)}</span>
                      <small className="price-unit">/ night</small>
                    </div>
                  </div>

                  <p className="price-subnote">
                    Transparent pricing in Indian Rupees (₹ INR) · Includes daily heritage breakfast &amp; butler service.
                  </p>

                  <hr className="price-card-divider" />

                  <div className="hotel-detail-rating-box">
                    <div className="rating-badge-large">
                      <span>{Number(hotel.rating || 9.0).toFixed(1)}</span>
                      <small>★</small>
                    </div>
                    <div>
                      <div className="stars-row">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <svg
                            key={i}
                            viewBox="0 0 24 24"
                            width="14"
                            height="14"
                            fill={i <= (hotel.stars || 5) ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="2"
                            className={i <= (hotel.stars || 5) ? 'star-filled' : 'star-empty'}
                            aria-hidden="true"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                      <span className="reviews-count-text">
                        {(hotel.reviews || 0).toLocaleString()} verified guest reviews
                      </span>
                    </div>
                  </div>

                  <div className="price-card-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-block"
                      onClick={() => openLightbox(0)}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span>View All Photos ({gallery.length})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer hotel-detail-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
            >
              Back to Portfolio
            </button>
            <div className="hotel-detail-footer-actions">
              {onEdit && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    onClose?.()
                    onEdit?.(hotel)
                  }}
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
                  </svg>
                  <span>Edit Hotel</span>
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    onClose?.()
                    onDelete?.(hotel)
                  }}
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>Delete Property</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <div
          className="hotel-lightbox-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxOpen(false)
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`${hotel.name} - Fullscreen photo gallery`}
        >
          <div className="hotel-lightbox-topbar">
            <div className="hotel-lightbox-title-box">
              <span className="hotel-lightbox-hotel-name">{hotel.name}</span>
              <span className="hotel-lightbox-counter">
                Photo {lightboxIdx + 1} of {gallery.length}
              </span>
            </div>
            <button
              type="button"
              className="hotel-lightbox-close"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close full-screen viewer"
              title="Close (Esc)"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="hotel-lightbox-stage">
            <button
              type="button"
              className="hotel-lightbox-nav prev"
              onClick={prevLightboxImage}
              aria-label="Previous photo"
              title="Previous photo (Left Arrow)"
            >
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="hotel-lightbox-img-wrapper">
              <img
                src={gallery[lightboxIdx] || FALLBACK_IMAGE}
                alt={`${hotel.name} - Photo ${lightboxIdx + 1}`}
                className="hotel-lightbox-image"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE
                }}
              />
            </div>

            <button
              type="button"
              className="hotel-lightbox-nav next"
              onClick={nextLightboxImage}
              aria-label="Next photo"
              title="Next photo (Right Arrow)"
            >
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="hotel-lightbox-bottom-strip">
            <div className="hotel-lightbox-thumbs-track">
              {gallery.map((imgUrl, i) => (
                <button
                  key={i}
                  type="button"
                  className={`hotel-lightbox-strip-thumb ${lightboxIdx === i ? 'is-active' : ''}`}
                  onClick={() => setLightboxIdx(i)}
                  aria-label={`Jump to photo ${i + 1}`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumb ${i + 1}`}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
