import { useEffect, useRef, useState } from 'react'
import {
  typeLabel,
  amenityLabel,
  normalizeHotelMarker,
  FALLBACK_HOTEL_IMAGE,
  formatRupee,
} from '../services/hotelapi.js'
import { loadLeaflet } from '../services/leaflet.js'

const AMENITY_ICONS = {
  wifi: '📶',
  pool: '🏊',
  spa: '✨',
  gym: '🏋️',
  parking: '🅿️',
  breakfast: '☕',
  bar: '🍸',
  pet: '🐾',
  shuttle: '🚐',
}

function escapeHtml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function buildHotelPopupHtml(m) {
  const typeLabelText = typeLabel(m.type)
  const starsCount = Math.min(5, Math.max(1, Math.round(m.stars || 5)))
  const starsString = '★'.repeat(starsCount)
  const displayedAmenities = m.amenities.slice(0, 3)
  const remainingAmenitiesCount = m.amenities.length - displayedAmenities.length

  return `
    <div class="hotel-popup-card" data-hotel-id="${escapeHtml(m.id)}">
      <div class="popup-image-container">
        <img
          src="${escapeHtml(m.image)}"
          alt="${escapeHtml(m.name)}"
          class="popup-hero-img"
          loading="lazy"
          onerror="this.onerror=null;this.src='${FALLBACK_HOTEL_IMAGE}';"
        />
        ${m.badge ? `<span class="popup-badge">${escapeHtml(m.badge)}</span>` : ''}
        <span class="popup-type-tag">${escapeHtml(typeLabelText)}</span>
      </div>

      <div class="popup-content-body">
        <div class="popup-title-row">
          <h4 class="popup-hotel-title" title="${escapeHtml(m.name)}">${escapeHtml(m.name)}</h4>
        </div>

        <div class="popup-location-row">
          <svg class="popup-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span class="popup-location-text">${escapeHtml(m.location)}</span>
        </div>

        <div class="popup-rating-row">
          <div class="popup-rating-badge">
            <span class="popup-star-icon">★</span>
            <span class="popup-rating-score">${m.rating.toFixed(1)}</span>
          </div>
          <div class="popup-stars-stars" title="${starsCount} stars">
            ${starsString}
          </div>
          ${m.reviews ? `<span class="popup-reviews-count">(${Number(m.reviews).toLocaleString()} reviews)</span>` : ''}
        </div>

        ${m.desc ? `<p class="popup-hotel-desc">${escapeHtml(m.desc)}</p>` : ''}

        ${m.amenities.length > 0 ? `
          <div class="popup-amenities-row">
            ${displayedAmenities.map((a) => `
              <span class="popup-amenity-pill">
                <span class="popup-amenity-ico">${AMENITY_ICONS[a] || '✓'}</span>
                ${escapeHtml(amenityLabel(a))}
              </span>
            `).join('')}
            ${remainingAmenitiesCount > 0 ? `<span class="popup-amenity-more">+${remainingAmenitiesCount}</span>` : ''}
          </div>
        ` : ''}

        <div class="popup-footer">
          <div class="popup-price-block">
            ${m.oldPrice ? `<span class="popup-price-was">${formatRupee(m.oldPrice)}</span>` : ''}
            <div class="popup-price-now">
              <span class="popup-price-val">${m.price != null ? formatRupee(m.price) : 'Contact'}</span>
              ${m.price != null ? `<span class="popup-price-unit">/ night</span>` : ''}
            </div>
          </div>
          <button type="button" class="popup-view-details-btn" data-hotel-id="${escapeHtml(m.id)}">
            View Details
          </button>
        </div>
      </div>
    </div>
  `
}

export default function MapPicker({
  value = null,
  onChange,
  markers = [],
  selectable = false,
  height = 340,
  zoom = 5,
  center = [22.5, 79],
  activeId = null,
  onMarkerClick,
  onViewDetails,
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const pinRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const onMarkerClickRef = useRef(onMarkerClick)
  const onViewDetailsRef = useRef(onViewDetails)
  const markersRef = useRef(markers)
  const initialMapRef = useRef({ center, zoom })
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [openPopupId, setOpenPopupId] = useState(null)

  useEffect(() => { onChangeRef.current = onChange }, [onChange])
  useEffect(() => { onMarkerClickRef.current = onMarkerClick }, [onMarkerClick])
  useEffect(() => { onViewDetailsRef.current = onViewDetails }, [onViewDetails])
  useEffect(() => { markersRef.current = markers }, [markers])

  useEffect(() => {
    let cancelled = false

    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return

        const map = L.map(containerRef.current, {
          center: initialMapRef.current.center,
          zoom: initialMapRef.current.zoom,
          scrollWheelZoom: false,
          worldCopyJump: true,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map)

        layerRef.current = L.layerGroup().addTo(map)
        mapRef.current = map
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        layerRef.current = null
        pinRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!ready || !containerRef.current) return
    const ro = new ResizeObserver(() => mapRef.current?.invalidateSize())
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [ready])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const handleDetailsClick = (e) => {
      const btn = e.target.closest('.popup-view-details-btn')
      if (btn) {
        e.preventDefault()
        e.stopPropagation()
        const id = btn.getAttribute('data-hotel-id')
        const found = markersRef.current.find((m) => String(m.id) === String(id))
        if (found) {
          onViewDetailsRef.current?.(found)
        }
      }
    }
    container.addEventListener('click', handleDetailsClick)
    return () => container.removeEventListener('click', handleDetailsClick)
  }, [])

  useEffect(() => {
    if (!ready || !mapRef.current) return
    const map = mapRef.current

    const handlePopupOpen = (e) => {
      const el = e.popup?.getElement()
      const card = el?.querySelector('.hotel-popup-card')
      const id = card?.getAttribute('data-hotel-id')
      if (id) {
        setOpenPopupId(id)
        onMarkerClickRef.current?.(id)
      }
    }

    const handlePopupClose = () => {
      setOpenPopupId(null)
    }

    map.on('popupopen', handlePopupOpen)
    map.on('popupclose', handlePopupClose)

    return () => {
      map.off('popupopen', handlePopupOpen)
      map.off('popupclose', handlePopupClose)
    }
  }, [ready])

  useEffect(() => {
    if (!ready || !selectable || !mapRef.current) return
    const map = mapRef.current

    const handleClick = (e) => {
      onChangeRef.current?.({
        lat: Number(e.latlng.lat.toFixed(5)),
        lng: Number(e.latlng.lng.toFixed(5)),
      })
    }

    map.on('click', handleClick)
    return () => map.off('click', handleClick)
  }, [ready, selectable])

  useEffect(() => {
    if (!ready) return
    const L = window.L
    const map = mapRef.current

    if (!selectable) {
      if (pinRef.current) {
        map.removeLayer(pinRef.current)
        pinRef.current = null
      }
      return
    }

    if (!pinRef.current) {
      const start = value ? [value.lat, value.lng] : center

      pinRef.current = L.marker(start, {
        draggable: true,
        icon: L.divIcon({
          className: '',
          html: '<div class="map-pin">📍</div>',
          iconSize: [30, 30],
          iconAnchor: [15, 28],
        }),
      }).addTo(map)

      pinRef.current.on('dragend', () => {
        const ll = pinRef.current.getLatLng()
        onChangeRef.current?.({
          lat: Number(ll.lat.toFixed(5)),
          lng: Number(ll.lng.toFixed(5)),
        })
      })
    }

    if (value && Number.isFinite(value.lat) && Number.isFinite(value.lng)) {
      pinRef.current.setLatLng([value.lat, value.lng])
    }
  }, [ready, selectable, value, center])

  useEffect(() => {
    if (!ready || selectable || !layerRef.current) return

    const L = window.L
    const layer = layerRef.current
    layer.clearLayers()

    const valid = markers
      .map((m) => normalizeHotelMarker(m))
      .filter(Boolean)

    valid.forEach((m) => {
      const icon = L.divIcon({
        className: 'custom-hotel-marker-container',
        html: `
          <div class="hotel-img-marker" data-id="${escapeHtml(m.id)}" title="${escapeHtml(m.name)}">
            <div class="hotel-marker-thumb">
              <img
                src="${escapeHtml(m.image)}"
                alt="${escapeHtml(m.name)}"
                loading="lazy"
                onerror="this.onerror=null;this.src='${FALLBACK_HOTEL_IMAGE}';"
              />
            </div>
            <div class="hotel-marker-tip"></div>
          </div>
        `,
        iconSize: [52, 60],
        iconAnchor: [26, 60],
        popupAnchor: [0, -62],
      })

      const marker = L.marker([m.lat, m.lng], { icon, title: m.name })
        .addTo(layer)

      const popupHtml = buildHotelPopupHtml(m)
      marker.bindPopup(popupHtml, {
        className: 'luxury-hotel-popup',
        maxWidth: 290,
        minWidth: 260,
        autoPan: true,
        autoPanPadding: [20, 20],
        closeButton: true,
      })

      marker.on('click', () => {
        onMarkerClickRef.current?.(m.id)
      })
    })

    if (valid.length === 1) {
      mapRef.current.setView([valid[0].lat, valid[0].lng], 9, { animate: true })
    } else if (valid.length > 1) {
      mapRef.current.fitBounds(
        L.latLngBounds(valid.map((m) => [m.lat, m.lng])),
        { padding: [40, 40], maxZoom: 8 },
      )
    }
  }, [ready, selectable, markers])

  useEffect(() => {
    if (!ready) return
    containerRef.current
      ?.querySelectorAll('.hotel-img-marker')
      .forEach((el) => {
        const isHovered = el.dataset.id === String(activeId)
        const isPopupOpen = el.dataset.id === String(openPopupId)
        el.classList.toggle('is-active', isHovered || isPopupOpen)
      })
  }, [activeId, openPopupId, ready, markers])

  if (failed) {
    return (
      <div className="map-shell" style={{ height }}>
        <div className="empty-state map-fallback">
          <h3>Map unavailable</h3>
          <p>Leaflet map could not be loaded. Property list and filters continue working normally.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="map-shell" style={{ height }}>
      <div ref={containerRef} className="map-canvas" />
      {!ready && (
        <div className="map-loading">
          <span className="spinner" />
          <span>Loading map of India…</span>
        </div>
      )}
      {selectable && (
        <div className="map-hint">Click the map or drag the 📍 pin to set hotel location</div>
      )}
    </div>
  )
}