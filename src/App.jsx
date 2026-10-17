import { useCallback, useEffect, useMemo, useState } from 'react'
import Navbar from './components/navbar.jsx'
import HotelList from './components/hotellist.jsx'
import MapPicker from './components/mappicker.jsx'
import Footer from './components/Footer.jsx'
import HotelDetailModal from './components/HotelDetailModal.jsx'
import HotelForm from './components/hotelform.jsx'
import {
  listHotels,
  createHotel,
  updateHotel,
  deleteHotel,
  resetHotels,
  TYPES,
  formatRupee,
  normalizeHotelMarker,
} from './services/hotelapi.js'

const THEME_KEY = 'luxestay:theme'
const PRICE_FLOOR = 1000
const DEFAULT_PRICE_CEIL = 10000

const Icon = ({ children, size = 16, className = '' }) => (
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

const I = {
  close: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  refresh: (
    <>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </>
  ),
  check: <polyline points="20 6 9 17 4 12" />,
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark' || saved === 'light') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', theme === 'dark')
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [minStars, setMinStars] = useState(0)
  const [userPriceMax, setUserPriceMax] = useState(null)
  const [sort, setSort] = useState('recommended')

  const dynamicMaxPrice = useMemo(() => {
    if (!hotels || hotels.length === 0) return DEFAULT_PRICE_CEIL
    const validPrices = hotels
      .map((h) => Number(h.price))
      .filter((p) => Number.isFinite(p) && p > 0)
    return validPrices.length > 0 ? Math.max(...validPrices) : DEFAULT_PRICE_CEIL
  }, [hotels])

  const sliderMin = PRICE_FLOOR
  const sliderMax = Math.max(sliderMin, dynamicMaxPrice)

  const priceMax = useMemo(() => {
    if (userPriceMax == null) return sliderMax
    return Math.min(sliderMax, Math.max(sliderMin, userPriceMax))
  }, [userPriceMax, sliderMax, sliderMin])

  const setPriceMax = useCallback((val) => {
    setUserPriceMax((prev) => (typeof val === 'function' ? val(prev) : val))
  }, [])

  const sliderStep = useMemo(() => {
    const range = sliderMax - sliderMin
    if (range <= 0) return '1'
    if (range % 250 === 0) return '250'
    if (range % 100 === 0) return '100'
    if (range % 50 === 0) return '50'
    return '1'
  }, [sliderMax, sliderMin])

  const [activeId, setActiveId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [detail, setDetail] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [toast, setToast] = useState(null)

  const notify = useCallback((message, tone = 'success') => {
    setToast({ message, tone, id: Date.now() })
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    let cancelled = false
    async function init() {
      const fetched = await listHotels()
      if (!cancelled) {
        setHotels(fetched)
        setLoading(false)
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = hotels.filter((h) => {
      const price = Number(h.price) || 0
      if (type !== 'all' && h.type !== type) return false
      if (h.stars < minStars) return false
      if (price > priceMax) return false
      if (q) {
        const hay = `${h.name || ''} ${h.city || ''} ${h.country || ''} ${h.desc || ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    const sorters = {
      recommended: (a, b) => ((b.rating || 0) * (b.reviews || 0)) - ((a.rating || 0) * (a.reviews || 0)),
      'price-asc': (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0),
      'price-desc': (a, b) => (Number(b.price) || 0) - (Number(a.price) || 0),
      rating: (a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0),
      name: (a, b) => (a.name || '').localeCompare(b.name || ''),
      newest: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
    }
    return [...filtered].sort(sorters[sort] || sorters.recommended)
  }, [hotels, query, type, minStars, priceMax, sort])

  const stats = useMemo(() => {
    if (!hotels.length) return { total: 0, avg: '—', cities: 0, cheapest: null }
    const avg = hotels.reduce((s, h) => s + (Number(h.rating) || 0), 0) / hotels.length
    const cities = new Set(hotels.map((h) => (h.city || '').trim()).filter(Boolean)).size
    const cheapest = hotels.reduce((m, h) => {
      const p = Number(h.price)
      if (!Number.isFinite(p) || p <= 0) return m
      return m === null || p < Number(m.price) ? h : m
    }, null)
    return { total: hotels.length, avg: avg > 0 ? avg.toFixed(1) : '—', cities, cheapest }
  }, [hotels])

  const markers = useMemo(
    () => visible
      .map((h) => normalizeHotelMarker(h))
      .filter(Boolean),
    [visible],
  )

  const activeFilters = useMemo(() => {
    const out = []
    if (query.trim()) out.push({ key: 'q', label: `“${query.trim()}”`, clear: () => setQuery('') })
    if (type !== 'all') {
      const label = TYPES.find((t) => t.id === type)?.label || type
      out.push({ key: 't', label, clear: () => setType('all') })
    }
    if (minStars) out.push({ key: 's', label: `${minStars}+ stars`, clear: () => setMinStars(0) })
    if (priceMax < sliderMax) {
      out.push({
        key: 'p', label: `≤ ${formatRupee(priceMax)}`, clear: () => setPriceMax(sliderMax),
      })
    }
    return out
  }, [query, type, minStars, priceMax, sliderMax, setPriceMax])

  const clearFilters = useCallback(() => {
    setQuery('')
    setType('all')
    setMinStars(0)
    setPriceMax(sliderMax)
    setSort('recommended')
  }, [sliderMax, setPriceMax])

  const handleCreate = useCallback(() => {
    setEditing(null)
    setFormOpen(true)
  }, [])

  const handleEdit = useCallback((hotel) => {
    setEditing(hotel)
    setFormOpen(true)
  }, [])

  const handleSubmit = useCallback(async (payload) => {
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateHotel(editing.id, payload)
        setHotels((prev) => prev.map((h) => (h.id === updated.id ? updated : h)))
        notify(`${updated.name} updated`)
      } else {
        const created = await createHotel(payload)
        setHotels((prev) => [created, ...prev])
        notify(`${created.name} added`)
      }
      setFormOpen(false)
      setEditing(null)
    } catch (err) {
      notify(err.message || 'Could not save the hotel.', 'error')
    } finally {
      setSaving(false)
    }
  }, [editing, notify])

  const handleDelete = useCallback(async () => {
    if (!confirm) return
    const target = confirm
    setConfirm(null)
    try {
      await deleteHotel(target.id)
      setHotels((prev) => prev.filter((h) => h.id !== target.id))
      if (detail?.id === target.id) setDetail(null)
      notify(`${target.name} deleted`)
    } catch (err) {
      notify(err.message || 'Could not delete hotel.', 'error')
    }
  }, [confirm, detail, notify])

  const handleReset = useCallback(async () => {
    setLoading(true)
    try {
      const resetList = await resetHotels()
      setHotels(resetList)
      const newMax = Math.max(PRICE_FLOOR, ...resetList.map((h) => Number(h.price) || 0))
      setPriceMax(newMax)
      notify('Demo data restored')
    } finally {
      setLoading(false)
    }
  }, [notify, setPriceMax])

  const focusHotel = useCallback((id) => {
    setActiveId(id)
    if (id) {
      document.querySelector(`.hotel-card[data-id="${id}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  return (
    <div className="app">
      <div className="hero-zone">
        <Navbar
          query={query}
          onQueryChange={setQuery}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          onCreate={handleCreate}
          onReset={handleReset}
          total={hotels.length}
        />

        <section className="hero">
          <div className="hero-inner">
            <div className="hero-content">
              <h1>India’s Royal Portfolio</h1>
              <p className="hero-description">
                Create, edit and map royal palaces, heritage havelis, and luxury wellness
                resorts across India.
              </p>
              <div className="stat-row">
                <div className="stat-card">
                  <span className="stat-icon-wrap stat-icon-mint" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="2" width="16" height="20" rx="2" />
                      <path d="M9 22v-4h6v4" />
                      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
                    </svg>
                  </span>
                  <div className="stat-info">
                    <span className="stat-label">PROPERTIES</span>
                    <span className="stat-value">{stats.total}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon-wrap stat-icon-orange" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </span>
                  <div className="stat-info">
                    <span className="stat-label">AVG. RATING</span>
                    <span className="stat-value">{stats.avg} ★</span>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon-wrap stat-icon-mint" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <div className="stat-info">
                    <span className="stat-label">CITIES</span>
                    <span className="stat-value">{stats.cities} Cities</span>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon-wrap stat-icon-orange" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                  </span>
                  <div className="stat-info">
                    <span className="stat-label">FROM</span>
                    <span className="stat-value stat-value-from">
                      {stats.cheapest ? formatRupee(stats.cheapest.price) : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="filter-bar">
              <div className="field">
                <label className="label" htmlFor="f-type">Type</label>
                <select
                  id="f-type"
                  className="select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="all">All types</option>
                  {TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label" htmlFor="f-stars">Minimum stars</label>
                <select
                  id="f-stars"
                  className="select"
                  value={minStars}
                  onChange={(e) => setMinStars(Number(e.target.value))}
                >
                  <option value={0}>Any</option>
                  <option value={3}>3+</option>
                  <option value={4}>4+</option>
                  <option value={5}>5</option>
                </select>
              </div>

              <div className="field price-slider-field">
                <div className="slider-label-row">
                  <label className="label" htmlFor="f-price">Max price</label>
                  <span
                    className="price-tag-value"
                    data-testid="price-badge"
                    aria-label={`Max price ${formatRupee(priceMax)}`}
                  >
                    {formatRupee(priceMax)}
                  </span>
                </div>
                <input
                  id="f-price"
                  type="range"
                  className="range"
                  aria-label="Max price range slider"
                  min={sliderMin}
                  max={sliderMax}
                  step={sliderStep}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                />
                <div className="slider-bounds">
                  <span>{formatRupee(sliderMin)}</span>
                  <span className="slider-endpoint" data-testid="slider-endpoint">
                    {formatRupee(sliderMax)}
                  </span>
                </div>
              </div>

              <div className="field">
                <label className="label" htmlFor="f-sort">Sort by</label>
                <select
                  id="f-sort"
                  className="select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="recommended">Recommended</option>
                  <option value="newest">Newest first</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="rating">Guest rating</option>
                  <option value="name">Name (A–Z)</option>
                </select>
              </div>

              <div className="filter-bar-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={clearFilters}
                  disabled={!activeFilters.length}
                >
                  Clear filters
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleReset}
                >
                  <Icon size={14}>{I.refresh}</Icon>
                  <span>Reset data</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <main className="app-main">
        {activeFilters.length > 0 && (
          <div className="active-filters">
            {activeFilters.map((f) => (
              <span key={f.key} className="filter-tag">
                {f.label}
                <button type="button" onClick={f.clear} aria-label={`Remove ${f.label}`}>
                  <Icon size={11}>{I.close}</Icon>
                </button>
              </span>
            ))}
          </div>
        )}

        <p className="results-count">
          Showing <strong>{visible.length}</strong> of {hotels.length} properties
        </p>

        <div className="layout-split">
          <div>
            <HotelList
              hotels={visible}
              loading={loading}
              activeId={activeId}
              onHover={setActiveId}
              onOpen={setDetail}
              onEdit={handleEdit}
              onDelete={setConfirm}
              onCreate={handleCreate}
            />
          </div>
          <aside className="map-panel">
            <MapPicker
              markers={markers}
              activeId={activeId}
              onMarkerClick={focusHotel}
              onViewDetails={setDetail}
              height="100%"
            />
          </aside>
        </div>
      </main>

      <Footer />

      <HotelForm
        open={formOpen}
        initial={editing}
        submitting={saving}
        onSubmit={handleSubmit}
        onClose={() => {
          if (!saving) {
            setFormOpen(false)
            setEditing(null)
          }
        }}
      />

      {detail && (
        <HotelDetailModal
          hotel={detail}
          onClose={() => setDetail(null)}
          onEdit={(h) => {
            setDetail(null)
            handleEdit(h)
          }}
          onDelete={(h) => {
            setDetail(null)
            setConfirm(h)
          }}
        />
      )}

      {confirm && (
        <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) setConfirm(null) }}>
          <div className="modal modal-sm" role="alertdialog" aria-modal="true">
            <div className="modal-header">
              <h3>Delete property?</h3>
            </div>
            <div className="modal-body">
              <p>
                <strong>{confirm.name}</strong> will be permanently removed from your
                portfolio. This cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.tone === 'error' ? 'toast-error' : ''}`} role="status">
          <Icon size={15}>{I.check}</Icon>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}