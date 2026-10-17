import { useEffect, useRef, useState, useCallback } from 'react'
import { loadLeaflet } from '../services/leaflet.js'

function escapeHtml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default function HotelLocationMap({ hotel, height = 320 }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  const rawLat = Number(hotel?.lat ?? hotel?.latitude)
  const rawLng = Number(hotel?.lng ?? hotel?.longitude)
  const hasCoords = Number.isFinite(rawLat) && Number.isFinite(rawLng) && !(rawLat === 0 && rawLng === 0)
  const lat = hasCoords ? rawLat : 28.5732
  const lng = hasCoords ? rawLng : 77.1961

  const latFormatted = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`
  const lngFormatted = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`
  const destinationRegion = [hotel?.city, hotel?.country || 'India'].filter(Boolean).join(', ') || 'New Delhi, Delhi, India'

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`

  const handleRecenter = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 14, { animate: true })
      if (markerRef.current) {
        markerRef.current.openPopup()
      }
    }
  }, [lat, lng])

  useEffect(() => {
    let cancelled = false

    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current) return

        if (mapRef.current) {
          mapRef.current.remove()
          mapRef.current = null
        }

        const map = L.map(containerRef.current, {
          center: [lat, lng],
          zoom: 14,
          scrollWheelZoom: false,
          worldCopyJump: true,
          zoomControl: true,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
        }).addTo(map)

        const customPin = L.divIcon({
          className: 'hotel-detail-map-pin-container',
          html: `
            <div class="hotel-detail-map-pin" title="${escapeHtml(hotel?.name || 'Hotel Location')}">
              <div class="hotel-detail-map-pulse"></div>
              <div class="hotel-detail-map-pin-head">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div class="hotel-detail-map-pin-tip"></div>
            </div>
          `,
          iconSize: [40, 48],
          iconAnchor: [20, 48],
          popupAnchor: [0, -48],
        })

        const marker = L.marker([lat, lng], {
          icon: customPin,
          title: hotel?.name || 'Luxury Property',
          alt: hotel?.name || 'Hotel Location',
        }).addTo(map)

        markerRef.current = marker

        const starsCount = Math.min(5, Math.max(1, Math.round(hotel?.stars || 5)))
        const popupContent = `
          <div class="hotel-detail-map-popup">
            <h4 class="popup-title">${escapeHtml(hotel?.name || 'Hotel Property')}</h4>
            <div class="popup-meta">
              <span class="popup-stars">${'★'.repeat(starsCount)}</span>
              ${hotel?.rating ? `<span class="popup-score">${Number(hotel.rating).toFixed(1)} / 10</span>` : ''}
            </div>
            <p class="popup-address">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              ${escapeHtml(destinationRegion)}
            </p>
            <div class="popup-coords-row">
              <code>${latFormatted}, ${lngFormatted}</code>
            </div>
            <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="popup-directions-btn">
              Open in Google Maps ↗
            </a>
          </div>
        `

        marker.bindPopup(popupContent, {
          className: 'hotel-detail-leaflet-popup',
          maxWidth: 280,
          minWidth: 220,
          autoPan: true,
          autoPanPadding: [16, 16],
          closeButton: true,
        })

        marker.openPopup()

        mapRef.current = map
        setReady(true)

        setTimeout(() => map.invalidateSize(), 100)
        setTimeout(() => map.invalidateSize(), 350)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, [lat, lng, hotel?.name, hotel?.stars, hotel?.rating, destinationRegion, googleMapsUrl, latFormatted, lngFormatted])

  useEffect(() => {
    if (!ready || !containerRef.current) return
    const ro = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
      }
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [ready])

  return (
    <div className="hotel-location-map-wrap">
      <div className="hotel-location-map-shell" style={{ height }}>
        {failed ? (
          <div className="map-fallback hotel-map-fallback">
            <div className="hotel-fallback-content">
              <h4>Interactive Map Offline</h4>
              <p>Geographic coordinates: <strong>{latFormatted}, {lngFormatted}</strong></p>
              <p>Region: <strong>{destinationRegion}</strong></p>
              <div className="hotel-fallback-actions">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-primary"
                >
                  View on Google Maps ↗
                </a>
                <a
                  href={osmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline"
                >
                  View on OpenStreetMap ↗
                </a>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div ref={containerRef} className="hotel-location-map-canvas" />

            {!ready && (
              <div className="map-loading hotel-map-loading">
                <span className="spinner" />
                <span>Loading property map…</span>
              </div>
            )}

            {ready && (
              <div className="hotel-map-floating-actions">
                <button
                  type="button"
                  className="hotel-map-pill-btn"
                  onClick={handleRecenter}
                  title="Recenter map on hotel pin"
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="22" y1="12" x2="18" y2="12" />
                    <line x1="6" y1="12" x2="2" y2="12" />
                    <line x1="12" y1="6" x2="12" y2="2" />
                    <line x1="12" y1="22" x2="12" y2="18" />
                  </svg>
                  <span>Recenter Pin</span>
                </button>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hotel-map-pill-btn hotel-map-pill-primary"
                  title="Open live navigation in Google Maps"
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  <span>Google Maps ↗</span>
                </a>
              </div>
            )}
          </>
        )}
      </div>

      <div className="hotel-location-meta-bar">
        <div className="location-meta-col">
          <span className="meta-col-label">Destination Region</span>
          <span className="meta-col-val location-city-val">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="meta-pin-ico">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <strong>{destinationRegion}</strong>
          </span>
        </div>

        <div className="location-meta-col">
          <span className="meta-col-label">Geographic Coordinates</span>
          <span className="meta-col-val coords-pill-group">
            <span className="coords-badge" title="Latitude">
              <small>LAT</small> {latFormatted}
            </span>
            <span className="coords-badge" title="Longitude">
              <small>LNG</small> {lngFormatted}
            </span>
          </span>
        </div>

        <div className="location-meta-col location-meta-action">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline get-directions-btn"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            <span>Get Directions</span>
          </a>
        </div>
      </div>
    </div>
  )
}
