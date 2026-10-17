import { useEffect, useMemo, useRef, useState } from 'react'
import MapPicker from './mappicker.jsx'
import {
  AMENITIES,
  TYPES,
  EMPTY_HOTEL,
  DEFAULT_HOTEL_IMAGES,
  uploadMedia,
  deleteMediaFile,
  uid,
} from '../services/hotelapi.js'

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
  uploadCloud: (
    <>
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
      <polyline points="16 16 12 12 8 16" />
    </>
  ),
  trash: (
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
  star: (
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  ),
  check: <polyline points="20 6 9 17 4 12" />,
  alertCircle: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
}

const EMPTY_ERRORS = {}
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_VIDEO_SIZE = 50 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']

function formatFileSize(bytes = 0) {
  if (!bytes || bytes <= 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function validate(draft) {
  const errors = {}

  if (!draft.name?.trim()) errors.name = 'Please provide a hotel name.'
  if (!draft.city?.trim()) errors.city = 'City is required.'
  if (!draft.country?.trim()) errors.country = 'State / Country is required.'

  const price = Number(draft.price)
  if (!Number.isFinite(price) || price < 0) errors.price = 'Enter a valid price.'

  if (draft.oldPrice !== '' && draft.oldPrice != null) {
    const old = Number(draft.oldPrice)
    if (!Number.isFinite(old) || old < 0) errors.oldPrice = 'Enter a valid regular price.'
  }

  const rating = Number(draft.rating)
  if (Number.isFinite(rating) && (rating < 0 || rating > 10)) {
    errors.rating = 'Rating must be between 0 and 10.'
  }

  const reviews = Number(draft.reviews)
  if (reviews && (!Number.isFinite(reviews) || reviews < 0)) {
    errors.reviews = 'Reviews must be a positive number.'
  }

  if (!draft.desc?.trim()) errors.desc = 'Add a short description.'

  const imageCount = (Array.isArray(draft.images) ? draft.images : []).length
  if (imageCount === 0 && !draft.image) {
    errors.images = 'Please provide at least 1 hotel image.'
  }

  return errors
}

function getInitialDraft(initial) {
  if (initial) {
    let initialImages = Array.isArray(initial.images)
      ? initial.images.map((img) => (typeof img === 'string' ? img : img?.url || '')).filter(Boolean)
      : []
    if (initial.image && !initialImages.includes(initial.image)) {
      initialImages = [initial.image, ...initialImages]
    }

    const initialVideos = Array.isArray(initial.videos)
      ? initial.videos
          .map((v) => {
            if (typeof v === 'string') {
              return { id: uid(), url: v, title: 'Hotel Video Tour', type: 'video/mp4' }
            }
            if (v && v.url) {
              return {
                id: v.id || uid(),
                url: v.url,
                title: v.title || v.name || 'Hotel Video Tour',
                name: v.name || 'video.mp4',
                size: v.size || 0,
                type: v.type || 'video/mp4',
                uploadedAt: v.uploadedAt || Date.now(),
              }
            }
            return null
          })
          .filter(Boolean)
      : []

    return {
      ...EMPTY_HOTEL,
      ...initial,
      image: initial.image || (initialImages.length > 0 ? initialImages[0] : ''),
      images: initialImages,
      videos: initialVideos,
      oldPrice: initial.oldPrice ?? '',
      badge: initial.badge ?? '',
    }
  }

  return {
    ...EMPTY_HOTEL,
    images: [...(EMPTY_HOTEL.images || DEFAULT_HOTEL_IMAGES || [])],
    videos: [],
  }
}

export default function HotelForm({
  open,
  initial = null,
  onSubmit,
  onClose,
  submitting = false,
}) {
  const [draft, setDraft] = useState(() => getInitialDraft(initial))
  const [errors, setErrors] = useState(EMPTY_ERRORS)
  const [touched, setTouched] = useState(false)
  const [activeUploads, setActiveUploads] = useState({})
  const [imageDragging, setImageDragging] = useState(false)
  const [videoDragging, setVideoDragging] = useState(false)
  const [mediaAlert, setMediaAlert] = useState(null)
  const [manualImageUrl, setManualImageUrl] = useState('')

  const [prevInitial, setPrevInitial] = useState(initial)
  const [prevOpen, setPrevOpen] = useState(open)

  if (open !== prevOpen || initial !== prevInitial) {
    setPrevOpen(open)
    setPrevInitial(initial)
    if (open) {
      setDraft(getInitialDraft(initial))
      setErrors(EMPTY_ERRORS)
      setTouched(false)
      setActiveUploads({})
      setMediaAlert(null)
      setManualImageUrl('')
    }
  }

  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !submitting && Object.keys(activeUploads).length === 0) {
        onClose?.()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, submitting, onClose, activeUploads])

  const coords = useMemo(
    () => ({ lat: Number(draft.lat) || 20.5937, lng: Number(draft.lng) || 78.9629 }),
    [draft.lat, draft.lng],
  )

  const isUploading = Object.keys(activeUploads).length > 0

  if (!open) return null

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  const setNumber = (field) => (e) => {
    const raw = e.target.value
    setDraft((prev) => ({ ...prev, [field]: raw === '' ? '' : raw }))
  }

  const toggleAmenity = (id) =>
    setDraft((prev) => ({
      ...prev,
      amenities: prev.amenities?.includes(id)
        ? prev.amenities.filter((a) => a !== id)
        : [...(prev.amenities || []), id],
    }))

  const handleUploadImages = async (fileList) => {
    if (!fileList || fileList.length === 0) return
    setMediaAlert(null)
    const files = Array.from(fileList)

    for (const file of files) {
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
      const isAllowedExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)
      const isAllowedType = ALLOWED_IMAGE_TYPES.includes(file.type) || isAllowedExt

      if (!isAllowedType) {
        setMediaAlert({
          type: 'error',
          message: `"${file.name}" is not supported. Only JPG, JPEG, PNG, and WEBP images are allowed.`,
        })
        continue
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setMediaAlert({
          type: 'error',
          message: `"${file.name}" exceeds the 10MB limit (${formatFileSize(file.size)}).`,
        })
        continue
      }

      const uploadId = uid()
      setActiveUploads((prev) => ({
        ...prev,
        [uploadId]: {
          name: file.name,
          size: file.size,
          progress: 10,
          category: 'image',
        },
      }))

      try {
        const result = await uploadMedia(file, 'image', (pct) => {
          setActiveUploads((prev) =>
            prev[uploadId] ? { ...prev, [uploadId]: { ...prev[uploadId], progress: pct } } : prev,
          )
        })

        if (result?.url) {
          setDraft((prev) => {
            const nextImages = [...(prev.images || []), result.url]
            const primary = prev.image ? prev.image : result.url
            return {
              ...prev,
              image: primary,
              images: nextImages,
            }
          })
          setErrors((prev) => {
            const next = { ...prev }
            delete next.images
            return next
          })
        }
      } catch (err) {
        setMediaAlert({
          type: 'error',
          message: err.message || `Failed to upload "${file.name}".`,
        })
      } finally {
        setActiveUploads((prev) => {
          const next = { ...prev }
          delete next[uploadId]
          return next
        })
      }
    }
  }

  const handleUploadVideos = async (fileList) => {
    if (!fileList || fileList.length === 0) return
    setMediaAlert(null)
    const files = Array.from(fileList)

    for (const file of files) {
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
      const isAllowedExt = ['.mp4', '.webm'].includes(ext)
      const isAllowedType = ALLOWED_VIDEO_TYPES.includes(file.type) || isAllowedExt

      if (!isAllowedType) {
        setMediaAlert({
          type: 'error',
          message: `"${file.name}" is not supported. Only MP4 and WEBM videos are allowed.`,
        })
        continue
      }

      if (file.size > MAX_VIDEO_SIZE) {
        setMediaAlert({
          type: 'error',
          message: `"${file.name}" exceeds the 50MB limit (${formatFileSize(file.size)}).`,
        })
        continue
      }

      const uploadId = uid()
      setActiveUploads((prev) => ({
        ...prev,
        [uploadId]: {
          name: file.name,
          size: file.size,
          progress: 10,
          category: 'video',
        },
      }))

      try {
        const result = await uploadMedia(file, 'video', (pct) => {
          setActiveUploads((prev) =>
            prev[uploadId] ? { ...prev, [uploadId]: { ...prev[uploadId], progress: pct } } : prev,
          )
        })

        if (result?.url) {
          const newVideo = {
            id: uid(),
            url: result.url,
            title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Palace Walkthrough',
            name: file.name,
            size: result.size || file.size,
            type: result.type || file.type || 'video/mp4',
            uploadedAt: Date.now(),
          }
          setDraft((prev) => ({
            ...prev,
            videos: [...(prev.videos || []), newVideo],
          }))
        }
      } catch (err) {
        setMediaAlert({
          type: 'error',
          message: err.message || `Failed to upload "${file.name}".`,
        })
      } finally {
        setActiveUploads((prev) => {
          const next = { ...prev }
          delete next[uploadId]
          return next
        })
      }
    }
  }

  const handleSetCover = (imgUrl) => {
    setDraft((prev) => ({ ...prev, image: imgUrl }))
  }

  const handleRemoveImage = (imgUrl) => {
    setDraft((prev) => {
      const nextImages = (prev.images || []).filter((url) => url !== imgUrl)
      let nextPrimary = prev.image
      if (prev.image === imgUrl) {
        nextPrimary = nextImages.length > 0 ? nextImages[0] : ''
      }
      return {
        ...prev,
        image: nextPrimary,
        images: nextImages,
      }
    })
    if (imgUrl.startsWith('/uploads/')) {
      deleteMediaFile(imgUrl).catch(() => {})
    }
  }

  const handleRemoveVideo = (videoId, videoUrl) => {
    setDraft((prev) => ({
      ...prev,
      videos: (prev.videos || []).filter((v) => v.id !== videoId && v.url !== videoUrl),
    }))
    if (videoUrl?.startsWith('/uploads/')) {
      deleteMediaFile(videoUrl).catch(() => {})
    }
  }

  const handleUpdateVideoTitle = (videoId, newTitle) => {
    setDraft((prev) => ({
      ...prev,
      videos: (prev.videos || []).map((v) => (v.id === videoId ? { ...v, title: newTitle } : v)),
    }))
  }

  const handleAddManualImage = () => {
    const url = manualImageUrl.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) {
      setMediaAlert({ type: 'error', message: 'Please enter a valid URL starting with http:// or https://' })
      return
    }
    setDraft((prev) => {
      const current = prev.images || []
      if (current.includes(url)) return prev
      const next = [...current, url]
      return {
        ...prev,
        image: prev.image || url,
        images: next,
      }
    })
    setManualImageUrl('')
    setErrors((prev) => {
      const next = { ...prev }
      delete next.images
      return next
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isUploading) {
      setMediaAlert({ type: 'error', message: 'Please wait until all media uploads have finished.' })
      return
    }

    setTouched(true)
    const found = validate(draft)
    setErrors(found)

    if (Object.keys(found).length) {
      const firstError = document.querySelector('.field-error, .media-error-alert')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const primaryImage =
      draft.image ||
      (draft.images?.length > 0 ? draft.images[0] : (DEFAULT_HOTEL_IMAGES?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'))

    const cleanImages = Array.isArray(draft.images) && draft.images.length > 0
      ? draft.images
      : (DEFAULT_HOTEL_IMAGES || [primaryImage])

    onSubmit?.({
      ...draft,
      image: primaryImage,
      images: cleanImages,
      videos: Array.isArray(draft.videos) ? draft.videos : [],
      price: Number(draft.price),
      oldPrice: draft.oldPrice === '' ? null : Number(draft.oldPrice),
      rating: Number(draft.rating),
      reviews: Number(draft.reviews),
      stars: Number(draft.stars),
      lat: Number(draft.lat) || 20.5937,
      lng: Number(draft.lng) || 78.9629,
    })
  }

  const fieldError = (key) => (touched || errors[key] ? errors[key] : '')
  const imageCount = (draft.images || []).length
  const videoCount = (draft.videos || []).length

  return (
    <div
      className="overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting && !isUploading) onClose?.()
      }}
    >
      <div
        className="modal modal-xl hotel-form-modal"
        role="dialog"
        aria-modal="true"
        aria-label={initial ? 'Edit hotel property' : 'Add new hotel property'}
      >
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-header">
            <div>
              <h3>{initial ? `Edit Property: ${initial.name}` : 'Add a New Luxury Property'}</h3>
              <p className="modal-subtitle">
                Enter palace details, upload high-resolution photos and video tours to showcase the property.
              </p>
            </div>
            <button
              type="button"
              className="btn-icon btn-ghost"
              onClick={onClose}
              disabled={submitting || isUploading}
              aria-label="Close"
              title="Close modal (Esc)"
            >
              <Icon size={20}>{I.close}</Icon>
            </button>
          </div>

          <div className="modal-body form-body">
            {mediaAlert && (
              <div className={`media-alert media-alert-${mediaAlert.type} mb-4`}>
                <Icon size={18}>{I.alertCircle}</Icon>
                <span>{mediaAlert.message}</span>
                <button
                  type="button"
                  className="btn-icon btn-ghost alert-close-btn"
                  onClick={() => setMediaAlert(null)}
                  aria-label="Dismiss alert"
                >
                  <Icon size={14}>{I.close}</Icon>
                </button>
              </div>
            )}

            <h4 className="form-section">General Information</h4>
            <div className="form-grid">
              <div className="field span-2">
                <label className="label" htmlFor="f-name">
                  Hotel / Palace Name *
                </label>
                <input
                  id="f-name"
                  className={`input ${fieldError('name') ? 'is-invalid' : ''}`}
                  value={draft.name}
                  onChange={set('name')}
                  placeholder="e.g. The Taj Lake Palace"
                />
                {fieldError('name') && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="field">
                <label className="label" htmlFor="f-city">
                  City / Destination *
                </label>
                <input
                  id="f-city"
                  className={`input ${fieldError('city') ? 'is-invalid' : ''}`}
                  value={draft.city}
                  onChange={set('city')}
                  placeholder="e.g. Udaipur"
                />
                {fieldError('city') && <span className="field-error">{errors.city}</span>}
              </div>

              <div className="field">
                <label className="label" htmlFor="f-country">
                  State / Country *
                </label>
                <input
                  id="f-country"
                  className={`input ${fieldError('country') ? 'is-invalid' : ''}`}
                  value={draft.country}
                  onChange={set('country')}
                  placeholder="e.g. Rajasthan, India"
                />
                {fieldError('country') && <span className="field-error">{errors.country}</span>}
              </div>

              <div className="field">
                <label className="label" htmlFor="f-type">
                  Property Category
                </label>
                <select id="f-type" className="select" value={draft.type} onChange={set('type')}>
                  {TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label" htmlFor="f-stars">
                  Heritage Star Rating
                </label>
                <select
                  id="f-stars"
                  className="select"
                  value={draft.stars}
                  onChange={setNumber('stars')}
                >
                  {[1, 2, 3, 4, 5].map((s) => (
                    <option key={s} value={s}>
                      {s} Star{s > 1 ? 's' : ''} Heritage
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h4 className="form-section">Tariff (₹ INR) &amp; Guest Rating</h4>
            <div className="form-grid">
              <div className="field">
                <label className="label" htmlFor="f-price">
                  Tariff / Night (₹ INR) *
                </label>
                <input
                  id="f-price"
                  type="number"
                  min="0"
                  step="100"
                  className={`input ${fieldError('price') ? 'is-invalid' : ''}`}
                  value={draft.price}
                  onChange={setNumber('price')}
                  placeholder="e.g. 4500"
                />
                {fieldError('price') && <span className="field-error">{errors.price}</span>}
              </div>

              <div className="field">
                <label className="label" htmlFor="f-old">
                  Regular Tariff (₹ INR) <span className="text-muted">(for discount display)</span>
                </label>
                <input
                  id="f-old"
                  type="number"
                  min="0"
                  step="100"
                  className={`input ${fieldError('oldPrice') ? 'is-invalid' : ''}`}
                  value={draft.oldPrice}
                  onChange={setNumber('oldPrice')}
                  placeholder="e.g. 5500"
                />
                {fieldError('oldPrice') && <span className="field-error">{errors.oldPrice}</span>}
              </div>

              <div className="field">
                <label className="label" htmlFor="f-rating">
                  Guest Score (0.0 to 10.0)
                </label>
                <input
                  id="f-rating"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  className={`input ${fieldError('rating') ? 'is-invalid' : ''}`}
                  value={draft.rating}
                  onChange={setNumber('rating')}
                  placeholder="9.5"
                />
                {fieldError('rating') && <span className="field-error">{errors.rating}</span>}
              </div>

              <div className="field">
                <label className="label" htmlFor="f-reviews">
                  Verified Reviews Count
                </label>
                <input
                  id="f-reviews"
                  type="number"
                  min="0"
                  step="1"
                  className={`input ${fieldError('reviews') ? 'is-invalid' : ''}`}
                  value={draft.reviews}
                  onChange={setNumber('reviews')}
                  placeholder="1200"
                />
                {fieldError('reviews') && <span className="field-error">{errors.reviews}</span>}
              </div>
            </div>

            <div className="media-section-header">
              <div className="media-section-title-wrap">
                <span className="media-section-icon">
                  <Icon size={18}>{I.image}</Icon>
                </span>
                <h4 className="form-section-title">Hotel Image Gallery</h4>
              </div>
              <div className="media-count-badge">
                <span className={imageCount >= 4 ? 'count-ok' : 'count-warning'}>
                  {imageCount} photo{imageCount !== 1 ? 's' : ''} uploaded (minimum 4 required)
                </span>
              </div>
            </div>

            <p className="media-section-desc">
              Upload at least 4 high-resolution architectural and suite photos. Choose one image as the primary cover photo for listing cards and header banners.
            </p>

            {fieldError('images') && (
              <div className="media-error-alert mb-3">
                <Icon size={16}>{I.alertCircle}</Icon>
                <span>{errors.images}</span>
              </div>
            )}

            <div
              className={`media-dropzone ${imageDragging ? 'is-dragging' : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                setImageDragging(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setImageDragging(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                setImageDragging(false)
                if (e.dataTransfer?.files) handleUploadImages(e.dataTransfer.files)
              }}
              onClick={() => imageInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  imageInputRef.current?.click()
                }
              }}
            >
              <input
                ref={imageInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files) handleUploadImages(e.target.files)
                  e.target.value = ''
                }}
              />
              <div className="dropzone-inner">
                <div className="dropzone-icon">
                  <Icon size={32}>{I.uploadCloud}</Icon>
                </div>
                <div className="dropzone-text">
                  <span className="dropzone-prompt">
                    <strong>Click to browse</strong> or drag &amp; drop palace photos here
                  </span>
                  <span className="dropzone-formats">
                    Supports JPG, JPEG, PNG, and WEBP · Up to 10MB each · Multiple uploads supported
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline dropzone-browse-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    imageInputRef.current?.click()
                  }}
                >
                  Browse Files
                </button>
              </div>
            </div>

            {Object.keys(activeUploads).some((k) => activeUploads[k].category === 'image') && (
              <div className="upload-progress-list mt-3">
                {Object.entries(activeUploads)
                  .filter(([, u]) => u.category === 'image')
                  .map(([key, upload]) => (
                    <div key={key} className="upload-progress-card">
                      <div className="upload-progress-info">
                        <span className="upload-file-name">{upload.name}</span>
                        <span className="upload-file-meta">
                          {formatFileSize(upload.size)} · {upload.progress}%
                        </span>
                      </div>
                      <div className="upload-progress-bar-wrap">
                        <div
                          className="upload-progress-bar-fill"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="manual-url-row mt-3">
              <input
                type="url"
                className="input input-sm"
                placeholder="Or paste external image URL (e.g. Unsplash or CDN)..."
                value={manualImageUrl}
                onChange={(e) => setManualImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddManualImage()
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={handleAddManualImage}
                disabled={!manualImageUrl.trim()}
              >
                <Icon size={14}>{I.plus}</Icon>
                <span>Add Image</span>
              </button>
            </div>

            {imageCount > 0 && (
              <div className="image-preview-grid mt-4">
                {draft.images.map((imgUrl, idx) => {
                  const isPrimary = draft.image === imgUrl || (!draft.image && idx === 0)
                  return (
                    <div
                      key={imgUrl + idx}
                      className={`image-preview-card ${isPrimary ? 'is-primary' : ''}`}
                    >
                      <div className="image-preview-thumb-wrap">
                        <img
                          src={imgUrl}
                          alt={`Uploaded preview ${idx + 1}`}
                          className="image-preview-thumb"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'
                          }}
                        />
                        {isPrimary && (
                          <div className="primary-cover-badge">
                            <Icon size={12}>{I.star}</Icon>
                            <span>Primary Cover</span>
                          </div>
                        )}
                        <button
                          type="button"
                          className="btn-icon btn-danger-ghost image-remove-btn"
                          title="Remove image"
                          aria-label={`Remove photo ${idx + 1}`}
                          onClick={() => handleRemoveImage(imgUrl)}
                        >
                          <Icon size={14}>{I.trash}</Icon>
                        </button>
                      </div>

                      <div className="image-preview-footer">
                        <span className="image-index-label">Photo #{idx + 1}</span>
                        {!isPrimary ? (
                          <button
                            type="button"
                            className="btn-set-cover"
                            onClick={() => handleSetCover(imgUrl)}
                          >
                            Set as Cover
                          </button>
                        ) : (
                          <span className="cover-selected-text">Cover Active</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="media-section-header mt-6">
              <div className="media-section-title-wrap">
                <span className="media-section-icon">
                  <Icon size={18}>{I.video}</Icon>
                </span>
                <h4 className="form-section-title">Palace Video Tours &amp; Walkthroughs</h4>
              </div>
              <div className="media-count-badge">
                <span>{videoCount} video{videoCount !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <p className="media-section-desc">
              Upload hotel tour videos, royal suite walkthroughs, or aerial drone footage. Videos will play in an embedded player on the property details page.
            </p>

            <div
              className={`media-dropzone ${videoDragging ? 'is-dragging' : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                setVideoDragging(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setVideoDragging(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                setVideoDragging(false)
                if (e.dataTransfer?.files) handleUploadVideos(e.dataTransfer.files)
              }}
              onClick={() => videoInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  videoInputRef.current?.click()
                }
              }}
            >
              <input
                ref={videoInputRef}
                type="file"
                multiple
                accept=".mp4,.webm,video/mp4,video/webm"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files) handleUploadVideos(e.target.files)
                  e.target.value = ''
                }}
              />
              <div className="dropzone-inner">
                <div className="dropzone-icon">
                  <Icon size={32}>{I.video}</Icon>
                </div>
                <div className="dropzone-text">
                  <span className="dropzone-prompt">
                    <strong>Click to browse</strong> or drag &amp; drop hotel videos here
                  </span>
                  <span className="dropzone-formats">
                    Supports MP4 and WEBM · Up to 50MB per video · Embedded playback included
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline dropzone-browse-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    videoInputRef.current?.click()
                  }}
                >
                  Browse Videos
                </button>
              </div>
            </div>

            {Object.keys(activeUploads).some((k) => activeUploads[k].category === 'video') && (
              <div className="upload-progress-list mt-3">
                {Object.entries(activeUploads)
                  .filter(([, u]) => u.category === 'video')
                  .map(([key, upload]) => (
                    <div key={key} className="upload-progress-card">
                      <div className="upload-progress-info">
                        <span className="upload-file-name">{upload.name}</span>
                        <span className="upload-file-meta">
                          {formatFileSize(upload.size)} · {upload.progress}%
                        </span>
                      </div>
                      <div className="upload-progress-bar-wrap">
                        <div
                          className="upload-progress-bar-fill upload-progress-video"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {videoCount > 0 && (
              <div className="video-preview-grid mt-4">
                {draft.videos.map((vid, idx) => (
                  <div key={vid.id || idx} className="video-preview-card">
                    <div className="video-player-container">
                      <video
                        controls
                        playsInline
                        preload="metadata"
                        src={vid.url}
                        className="form-video-player"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>

                    <div className="video-card-body">
                      <div className="video-title-input-row">
                        <label className="text-xs text-muted" htmlFor={`vid-title-${idx}`}>
                          Video Title:
                        </label>
                        <input
                          id={`vid-title-${idx}`}
                          type="text"
                          className="input input-sm video-title-input"
                          value={vid.title || ''}
                          onChange={(e) => handleUpdateVideoTitle(vid.id, e.target.value)}
                          placeholder="e.g. Royal Suite Walkthrough"
                        />
                      </div>

                      <div className="video-meta-row">
                        <span className="video-size-badge">
                          {vid.size ? formatFileSize(vid.size) : 'HD Video'}
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost text-danger"
                          onClick={() => handleRemoveVideo(vid.id, vid.url)}
                          title="Remove video"
                        >
                          <Icon size={14}>{I.trash}</Icon>
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h4 className="form-section mt-6">Property Map Coordinates</h4>
            <MapPicker
              selectable
              height={260}
              value={coords}
              center={[coords.lat, coords.lng]}
              zoom={6}
              onChange={({ lat, lng }) => setDraft((prev) => ({ ...prev, lat, lng }))}
            />

            <div className="form-grid mt-4">
              <div className="field">
                <label className="label" htmlFor="f-lat">
                  Latitude
                </label>
                <input
                  id="f-lat"
                  type="number"
                  step="0.0001"
                  className="input"
                  value={draft.lat}
                  onChange={setNumber('lat')}
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="f-lng">
                  Longitude
                </label>
                <input
                  id="f-lng"
                  type="number"
                  step="0.0001"
                  className="input"
                  value={draft.lng}
                  onChange={setNumber('lng')}
                />
              </div>
            </div>

            <h4 className="form-section">Description &amp; Highlights</h4>
            <div className="form-grid">
              <div className="field span-2">
                <label className="label" htmlFor="f-badge">
                  Highlight Ribbon <span className="text-muted">(e.g. "Guest Favourite", "Heritage Sanctuary")</span>
                </label>
                <input
                  id="f-badge"
                  className="input"
                  value={draft.badge}
                  onChange={set('badge')}
                  placeholder="e.g. Guest Favourite"
                />
              </div>

              <div className="field span-2">
                <label className="label" htmlFor="f-desc">
                  Curated Description *
                </label>
                <textarea
                  id="f-desc"
                  rows="3"
                  className={`textarea ${fieldError('desc') ? 'is-invalid' : ''}`}
                  value={draft.desc}
                  onChange={set('desc')}
                  placeholder="Describe the rooms, marble architecture, royal heritage, lake views, or luxury amenities..."
                />
                {fieldError('desc') && <span className="field-error">{errors.desc}</span>}
              </div>
            </div>

            <h4 className="form-section">Featured Amenities</h4>
            <div className="chips">
              {AMENITIES.map((a) => {
                const on = draft.amenities?.includes(a.id)
                return (
                  <button
                    key={a.id}
                    type="button"
                    className={`chip ${on ? 'is-active' : ''}`}
                    aria-pressed={on}
                    onClick={() => toggleAmenity(a.id)}
                  >
                    <Icon size={12}>{I.check}</Icon>
                    <span>{a.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={submitting || isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || isUploading}
            >
              {submitting ? (
                <>
                  <span className="spinner spinner-sm" />
                  <span>Saving Property…</span>
                </>
              ) : isUploading ? (
                <>
                  <span className="spinner spinner-sm" />
                  <span>Uploading Media…</span>
                </>
              ) : initial ? (
                'Save Changes'
              ) : (
                'Add Property to Portfolio'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}