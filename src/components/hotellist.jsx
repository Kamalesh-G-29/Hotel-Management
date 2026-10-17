import HotelCard from './hotelcard.jsx'

function SkeletonCard() {
  return (
    <article className="hotel-card" aria-hidden="true">
      <div className="skeleton skeleton-media" />
      <div className="hotel-card-body">
        <div className="skeleton skeleton-line w-60" />
        <div className="skeleton skeleton-line w-40" />
        <div className="skeleton skeleton-line w-80" />
        <div className="skeleton skeleton-line w-60" />
      </div>
    </article>
  )
}

const Icon = ({ children, size = 44 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
)

export default function HotelList({
  hotels = [],
  loading = false,
  activeId = null,
  onHover,
  onOpen,
  onEdit,
  onDelete,
  onCreate,
}) {
  if (loading) {
    return (
      <div className="hotel-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (!hotels.length) {
    return (
      <div className="empty-state">
        <Icon>
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </Icon>
        <h3>No properties found</h3>
        <p>Try adjusting your search query, price filter (₹), or star rating, or add a new property!</p>
        <button type="button" className="btn btn-primary" onClick={onCreate}>
          + Add a New Property
        </button>
      </div>
    )
  }

  return (
    <div className="hotel-grid">
      {hotels.map((h) => (
        <HotelCard
          key={h.id}
          hotel={h}
          active={activeId === h.id}
          onHover={onHover}
          onOpen={onOpen}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}