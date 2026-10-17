import RoyalCrownLogo from './RoyalCrownLogo.jsx'

const Icon = ({ children, size = 18 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
)

const ICONS = {
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  refresh: (
    <>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </>
  ),
  close: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
}

export default function Navbar({
  query = '',
  onQueryChange,
  theme = 'light',
  onToggleTheme,
  onCreate,
  onReset,
  total = 0,
}) {
  return (
    <header className="app-header">
      <a className="brand" href="/" onClick={(e) => e.preventDefault()} aria-label="LuxeRoyale Stays">
        <span className="brand-logo-icon" title="LuxeRoyale Stays">
          <RoyalCrownLogo size={32} />
        </span>
        <div className="brand-text-block">
          <span className="brand-text">
            <span className="brand-navy">LuxeRoyale</span> <span className="brand-teal">Stays</span>
          </span>
          <span className="brand-sub-tagline">LUXURY HOTEL MANAGEMENT</span>
        </div>
      </a>

      <nav className="nav">
        <a className="nav-link is-active" href="#" onClick={(e) => e.preventDefault()}>
          Hotels
        </a>
      </nav>

      <div className="nav-search">
        <Icon size={16}>{ICONS.search}</Icon>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange?.(e.target.value)}
          placeholder="Search Udaipur, Goa, Jaipur, palaces…"
          aria-label="Search hotels"
        />
        {query && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onQueryChange?.('')}
            aria-label="Clear search"
            title="Clear search"
          >
            <Icon size={14}>{ICONS.close}</Icon>
          </button>
        )}
      </div>

      <div className="header-actions">
        <span className="badge badge-primary">
          {total} {total === 1 ? 'property' : 'properties'}
        </span>

        {onReset && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onReset}
            title="Reset portfolio to default ₹ prices"
          >
            <Icon size={14}>{ICONS.refresh}</Icon>
            <span>Reset ₹ Defaults</span>
          </button>
        )}

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onCreate}
          title="Add a new luxury hotel"
        >
          <Icon size={16}>{ICONS.plus}</Icon>
          <span>Add hotel</span>
        </button>

        <button
          type="button"
          className="btn-icon btn-ghost theme-toggle-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <Icon size={18}>{theme === 'dark' ? ICONS.sun : ICONS.moon}</Icon>
        </button>
      </div>
    </header>
  )
}