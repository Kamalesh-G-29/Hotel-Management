import { typeLabel, amenityLabel, formatRupee } from '../services/hotelapi.js'

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
  pin: (
    <>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  star: (
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  ),
  edit: (
    <>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
    </>
  ),
  trash: (
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
  check: <polyline points="20 6 9 17 4 12" />,
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </>
  ),
  video: (
    <>
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </>
  ),
}

export default function HotelCard({
  hotel,
  active = false,
  onHover,
  onOpen,
  onEdit,
  onDelete,
}) {
  const h = hotel
  const scoreClass = h.rating >= 9 ? '' : h.rating >= 8 ? 'is-good' : 'is-average'

  return (
    <article
      className={`hotel-card ${active ? 'is-active' : ''}`}
      data-id={h.id}
      tabIndex={0}
      onMouseEnter={() => onHover?.(h.id)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(h.id)}
      onBlur={() => onHover?.(null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          onOpen?.(h)
        }
      }}
    >
      <div className="hotel-card-media">
        <img
          src={h.image}
          alt={h.name}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
          }}
        />
        <div className="media-overlay" />

        {h.badge && <span className="badge badge-float badge-accent">{h.badge}</span>}
        <div className="hotel-card-media-tags">
          {Array.isArray(h.images) && h.images.length > 1 && (
            <span className="media-tag" title={`${h.images.length} photos`}>
              <Icon size={12}>{I.image}</Icon>
              <span>{h.images.length}</span>
            </span>
          )}
          {Array.isArray(h.videos) && h.videos.length > 0 && (
            <span className="media-tag media-tag-video" title={`${h.videos.length} video tour${h.videos.length > 1 ? 's' : ''}`}>
              <Icon size={12}>{I.video}</Icon>
              <span>Video</span>
            </span>
          )}
        </div>

        <div className="media-actions">
          <button
            type="button"
            className="btn-icon"
            aria-label={`Edit ${h.name}`}
            title="Edit hotel details"
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.(h)
            }}
          >
            <Icon size={15}>{I.edit}</Icon>
          </button>
          <button
            type="button"
            className="btn-icon"
            aria-label={`Delete ${h.name}`}
            title="Delete this hotel"
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.(h)
            }}
          >
            <Icon size={15}>{I.trash}</Icon>
          </button>
        </div>
      </div>

      <div className="hotel-card-body">
        <div className="hotel-card-top">
          <div>
            <h3 className="hotel-name">{h.name}</h3>
            <p
              className="hotel-location"
              title="View property location"
              onClick={(e) => {
                e.stopPropagation()
                onOpen?.(h)
              }}
              style={{ cursor: 'pointer' }}
            >
              <Icon size={13}>{I.pin}</Icon>
              {h.city}{h.country ? `, ${h.country}` : ''}
            </p>
          </div>
          <span className={`rating-score ${scoreClass}`}>{Number(h.rating).toFixed(1)}</span>
        </div>

        <div className="stars">
          {[1, 2, 3, 4, 5].map((i) => (
            <Icon key={i} size={13} className={i <= h.stars ? 'is-filled' : ''}>
              {I.star}
            </Icon>
          ))}
          <span className="text-muted text-xs ms-1">({h.reviews || 0} reviews)</span>
        </div>

        <p className="hotel-desc">{h.desc}</p>

        <div className="amenities">
          <span className="badge badge-neutral">{typeLabel(h.type)}</span>
          {h.amenities?.slice(0, 2).map((a) => (
            <span key={a} className="amenity">
              <Icon size={12}>{I.check}</Icon>
              {amenityLabel(a)}
            </span>
          ))}
          {h.amenities?.length > 2 && (
            <span className="amenity">+{h.amenities.length - 2} more</span>
          )}
        </div>

        <div className="hotel-card-footer">
          <div className="price">
            {h.oldPrice ? <span className="was">{formatRupee(h.oldPrice)}</span> : null}
            <span className="amount">
              {formatRupee(h.price)} <small>/ night</small>
            </span>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation()
              onOpen?.(h)
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </article>
  )
}