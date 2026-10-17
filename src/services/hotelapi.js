export const STORAGE_KEY = 'luxestay:hotels:v5_inr'

export const TYPES = [
  { id: 'hotel', label: 'Hotel' },
  { id: 'resort', label: 'Resort' },
  { id: 'villa', label: 'Villa' },
  { id: 'boutique', label: 'Boutique Palace' },
  { id: 'apartment', label: 'Apartment' },
]

export const AMENITIES = [
  { id: 'wifi', label: 'Free High-speed Wi-Fi' },
  { id: 'pool', label: 'Infinity Pool' },
  { id: 'spa', label: 'Ayurvedic Spa' },
  { id: 'gym', label: 'Fitness Center' },
  { id: 'parking', label: 'Valet Parking' },
  { id: 'breakfast', label: 'Royal Buffet Breakfast' },
  { id: 'bar', label: 'Cocktail Lounge / Bar' },
  { id: 'pet', label: 'Pet Friendly' },
  { id: 'shuttle', label: 'Airport Shuttle' },
]

export const typeLabel = (id) => TYPES.find((t) => t.id === id)?.label || id
export const amenityLabel = (id) => AMENITIES.find((a) => a.id === id)?.label || id

export const formatRupee = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format

export const FALLBACK_HOTEL_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'

export function normalizeHotelMarker(h) {
  if (!h) return null
  const lat = Number(h.lat ?? h.latitude)
  const lng = Number(h.lng ?? h.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) {
    return null
  }

  const name = h.name || h.title || 'Luxury Hotel'
  let image = h.image
  if (!image && Array.isArray(h.images) && h.images.length > 0) {
    image = h.images[0]
  }
  if (!image || typeof image !== 'string' || !image.trim()) {
    image = FALLBACK_HOTEL_IMAGE
  }

  const city = h.city || ''
  const country = h.country || ''
  const location = h.location || [city, country].filter(Boolean).join(', ') || 'India'

  const price = h.price != null && h.price !== '' ? Number(h.price) : null
  const rawOldPrice = h.oldPrice ?? h.originalPrice
  const oldPrice = rawOldPrice != null && rawOldPrice !== '' ? Number(rawOldPrice) : null

  const rating = h.rating != null ? Number(h.rating) : 9.5
  const stars = h.stars != null ? Number(h.stars) : 5
  const reviews = h.reviews != null ? Number(h.reviews) : 0
  const type = h.type || 'hotel'
  const desc = h.desc || h.description || ''
  const amenities = Array.isArray(h.amenities) ? h.amenities : []
  const badge = h.badge || ''

  return {
    ...h,
    id: String(h.id),
    name,
    image,
    lat,
    lng,
    price,
    oldPrice,
    rating,
    stars,
    reviews,
    type,
    city,
    country,
    location,
    desc,
    amenities,
    badge,
  }
}

export const SEED = [
  {
    id: 'h1',
    name: 'The Taj Lake Palace',
    city: 'Udaipur',
    country: 'Rajasthan, India',
    lat: 24.5764,
    lng: 73.6801,
    price: 4500,
    oldPrice: 5500,
    rating: 9.8,
    reviews: 2841,
    stars: 5,
    type: 'boutique',
    badge: 'Guest Favourite',
    desc: 'An iconic floating white-marble palace on Lake Pichola with royal suites, candlelit courtyards, and Mewari dining.',
    amenities: ['wifi', 'pool', 'spa', 'breakfast', 'bar'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'h2',
    name: 'The Oberoi Udaivilas',
    city: 'Udaipur',
    country: 'Rajasthan, India',
    lat: 24.5724,
    lng: 73.674,
    price: 10000,
    oldPrice: 12000,
    rating: 9.9,
    reviews: 1912,
    stars: 5,
    type: 'resort',
    badge: 'Exceptional',
    desc: 'Palatial heritage resort on the banks of Lake Pichola with meandering pools, private pavilions, and peacocks.',
    amenities: ['wifi', 'pool', 'spa', 'breakfast', 'bar'],
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'h3',
    name: 'Rambagh Palace',
    city: 'Jaipur',
    country: 'Rajasthan, India',
    lat: 26.898,
    lng: 75.808,
    price: 5200,
    oldPrice: 6200,
    rating: 9.7,
    reviews: 1604,
    stars: 5,
    type: 'boutique',
    badge: 'Top Rated',
    desc: 'The former residence of the Maharaja of Jaipur, featuring hand-carved marble jaalis and 47 acres of lush gardens.',
    amenities: ['wifi', 'pool', 'spa', 'breakfast', 'parking'],
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'h4',
    name: 'Kumarakom Lake Resort',
    city: 'Kumarakom',
    country: 'Kerala, India',
    lat: 9.6177,
    lng: 76.4298,
    price: 3500,
    oldPrice: 4200,
    rating: 9.4,
    reviews: 1320,
    stars: 5,
    type: 'resort',
    badge: 'Backwater Bliss',
    desc: 'Traditional Kerala heritage villas nestled along Vembanad Lake with a meandering pool and authentic Ayurveda.',
    amenities: ['wifi', 'pool', 'spa', 'breakfast', 'pet'],
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'h5',
    name: 'The Himalayan Retreat',
    city: 'Manali',
    country: 'Himachal Pradesh, India',
    lat: 32.2396,
    lng: 77.1887,
    price: 2000,
    oldPrice: 2800,
    rating: 9.2,
    reviews: 876,
    stars: 4,
    type: 'hotel',
    badge: 'Mountain View',
    desc: 'A stone-castle retreat with panoramic snow-clad Himalayan mountain views, pine scents, and crackling fireplaces.',
    amenities: ['wifi', 'spa', 'breakfast', 'parking', 'bar'],
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'h6',
    name: 'Taj Falaknuma Palace',
    city: 'Hyderabad',
    country: 'Telangana, India',
    lat: 17.3312,
    lng: 78.4711,
    price: 6500,
    oldPrice: 7800,
    rating: 9.7,
    reviews: 2410,
    stars: 5,
    type: 'boutique',
    badge: 'Nizam Heritage',
    desc: 'A grand Nizam palace set 2,000 feet above the city of pearls with Venetian chandeliers and horse-drawn carriages.',
    amenities: ['wifi', 'pool', 'spa', 'breakfast', 'bar'],
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'h7',
    name: 'W Goa Beach Resort',
    city: 'Vagator',
    country: 'Goa, India',
    lat: 15.5959,
    lng: 73.7398,
    price: 4800,
    oldPrice: 5800,
    rating: 9.1,
    reviews: 1673,
    stars: 5,
    type: 'resort',
    badge: 'Beachfront',
    desc: 'Vibrant beachfront cliffside haven overlooking Vagator beach with rock pools, DJ sessions, and sunset views.',
    amenities: ['wifi', 'pool', 'gym', 'parking', 'bar'],
    image: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'h8',
    name: 'The Leela Palace',
    city: 'New Delhi',
    country: 'Delhi, India',
    lat: 28.5732,
    lng: 77.1961,
    price: 5500,
    oldPrice: 6800,
    rating: 9.5,
    reviews: 2087,
    stars: 5,
    type: 'hotel',
    badge: 'Capital Luxury',
    desc: 'Lutyens architecture-inspired grandeur with a temperature-controlled rooftop infinity pool and Michelin culinary art.',
    amenities: ['wifi', 'pool', 'spa', 'breakfast', 'shuttle'],
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'h9',
    name: 'The Grand Heritage Ladakh',
    city: 'Leh',
    country: 'Ladakh, India',
    lat: 34.1526,
    lng: 77.5771,
    price: 3800,
    oldPrice: 4600,
    rating: 9.5,
    reviews: 412,
    stars: 5,
    type: 'resort',
    badge: 'All-inclusive',
    desc: 'Luxury glamping and suites with panoramic views of Ladakh monasteries, Pangong lake excursions, and stargazing.',
    amenities: ['wifi', 'breakfast', 'bar', 'shuttle'],
    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'h10',
    name: 'Taj Exotica Resort & Spa',
    city: 'Benaulim',
    country: 'Goa, India',
    lat: 15.2601,
    lng: 73.925,
    price: 4200,
    oldPrice: 5000,
    rating: 9.3,
    reviews: 1455,
    stars: 5,
    type: 'resort',
    badge: null,
    desc: 'A Mediterranean-style 56-acre beachfront sanctuary with tropical gardens, golf pitch & putt, and sun-kissed beaches.',
    amenities: ['wifi', 'pool', 'spa', 'breakfast', 'parking'],
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'h11',
    name: 'Evolve Back Plantation Resort',
    city: 'Coorg',
    country: 'Karnataka, India',
    lat: 12.4244,
    lng: 75.7382,
    price: 3600,
    oldPrice: 4500,
    rating: 9.4,
    reviews: 934,
    stars: 5,
    type: 'villa',
    badge: 'Coffee Country',
    desc: 'Plantation-style private pool villas set amidst 300 acres of fragrant coffee and spice estates in misty Coorg.',
    amenities: ['wifi', 'pool', 'spa', 'breakfast', 'pet'],
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'h12',
    name: 'Alila Fort Bishangarh',
    city: 'Jaipur',
    country: 'Rajasthan, India',
    lat: 27.1045,
    lng: 75.9612,
    price: 2800,
    oldPrice: 3500,
    rating: 9.3,
    reviews: 721,
    stars: 5,
    type: 'boutique',
    badge: 'Warrior Fort',
    desc: 'A majestic 230-year-old warrior fort transformed into an all-suite luxury sanctuary atop a granite hill.',
    amenities: ['wifi', 'pool', 'spa', 'breakfast', 'bar'],
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
  },
]

export const DEFAULT_HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
]

export const EMPTY_HOTEL = {
  name: '',
  city: '',
  country: 'India',
  desc: 'Experience quintessential royal Indian luxury and heritage hospitality.',
  badge: '',
  image: DEFAULT_HOTEL_IMAGES[0],
  images: [...DEFAULT_HOTEL_IMAGES],
  videos: [],
  price: '',
  oldPrice: '',
  rating: 9.0,
  reviews: 100,
  stars: 5,
  type: 'hotel',
  amenities: ['wifi', 'breakfast', 'pool'],
  lat: 20.5937,
  lng: 78.9629,
}

export function getMaxPrice(hotels = [], fallback = 10000) {
  if (!hotels || !hotels.length) return fallback
  const valid = hotels.map((h) => Number(h.price)).filter((p) => Number.isFinite(p) && p > 0)
  return valid.length > 0 ? Math.max(...valid) : fallback
}

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))
export const uid = () => 'h_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

export async function uploadMedia(file, category = 'image', onProgress) {
  const isVideo = category === 'video'
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const allowedVideoTypes = ['video/mp4', 'video/webm']

  if (isVideo && !allowedVideoTypes.includes(file.type)) {
    throw new Error('Unsupported video type. Please upload MP4 or WEBM.')
  }
  if (!isVideo && !allowedImageTypes.includes(file.type)) {
    throw new Error('Unsupported image type. Please upload JPG, JPEG, PNG, or WEBP.')
  }

  const maxImageSize = 10 * 1024 * 1024
  const maxVideoSize = 50 * 1024 * 1024

  if (!isVideo && file.size > maxImageSize) {
    throw new Error(`Image "${file.name}" exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`)
  }
  if (isVideo && file.size > maxVideoSize) {
    throw new Error(`Video "${file.name}" exceeds 50MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`)
  }

  const base64Data = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsDataURL(file)
  })

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/upload', true)
    xhr.setRequestHeader('Content-Type', 'application/json')

    if (xhr.upload && typeof onProgress === 'function') {
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const percent = Math.round((evt.loaded / evt.total) * 100)
          onProgress(percent)
        }
      }
    }

    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText)
        if (xhr.status >= 200 && xhr.status < 300 && res.success) {
          resolve(res)
        } else {
          reject(new Error(res.error || 'Upload failed.'))
        }
      } catch {
        reject(new Error('Invalid response from upload server.'))
      }
    }

    xhr.onerror = () => reject(new Error('Network error during file upload.'))

    xhr.send(
      JSON.stringify({
        filename: file.name,
        type: file.type,
        size: file.size,
        data: base64Data,
        category,
      }),
    )
  })
}

export function sanitize(input = {}) {
  const price = Math.max(0, Number(input.price) || 0)
  const oldPriceRaw = input.oldPrice

  let images = Array.isArray(input.images)
    ? input.images
        .map((img) => (typeof img === 'string' ? img.trim() : img?.url || ''))
        .filter(Boolean)
    : []

  const primaryImage =
    String(input.image || '').trim() ||
    (images.length > 0 ? images[0] : FALLBACK_HOTEL_IMAGE)

  if (primaryImage && !images.includes(primaryImage)) {
    images = [primaryImage, ...images]
  }

  let videos = Array.isArray(input.videos)
    ? input.videos
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
    name: String(input.name || '').trim(),
    city: String(input.city || '').trim(),
    country: String(input.country || '').trim() || 'India',
    desc: String(input.desc || '').trim(),
    badge: input.badge ? String(input.badge).trim() : null,
    image: primaryImage,
    images,
    videos,
    price,
    oldPrice:
      oldPriceRaw === '' || oldPriceRaw == null
        ? null
        : Math.max(0, Number(oldPriceRaw) || 0),
    rating: Math.min(10, Math.max(0, Number(input.rating) || 8.0)),
    reviews: Math.max(0, Math.round(Number(input.reviews) || 0)),
    stars: Math.min(5, Math.max(1, Math.round(Number(input.stars) || 5))),
    type: TYPES.some((t) => t.id === input.type) ? input.type : 'hotel',
    amenities: Array.isArray(input.amenities) ? [...new Set(input.amenities)] : [],
    lat: Number(input.lat) || 20.5937,
    lng: Number(input.lng) || 78.9629,
  }
}

async function syncToServer(hotels) {
  try {
    await fetch('/api/hotels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hotels),
    })
  } catch {
  }
}

export async function listHotels() {
  await delay(60)
  try {
    const res = await fetch('/api/hotels')
    if (res.ok) {
      const serverHotels = await res.json()
      if (Array.isArray(serverHotels) && serverHotels.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serverHotels))
        return serverHotels
      }
    }
  } catch {
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED))
      syncToServer(SEED)
      return [...SEED]
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED))
      syncToServer(SEED)
      return [...SEED]
    }
    syncToServer(parsed)
    return parsed
  } catch {
    return [...SEED]
  }
}

export async function createHotel(payload) {
  await delay(80)
  const hotel = { ...sanitize(payload), id: uid(), createdAt: Date.now() }
  const current = await listHotels()
  const next = [hotel, ...current]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  await syncToServer(next)
  return hotel
}

export async function updateHotel(id, payload) {
  await delay(80)
  const current = await listHotels()
  const clean = sanitize(payload)
  let found = null
  const next = current.map((h) => {
    if (h.id === id) {
      found = { ...h, ...clean, id }
      return found
    }
    return h
  })
  if (!found) throw new Error(`Hotel with id ${id} not found`)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  await syncToServer(next)
  return found
}

export async function deleteMediaFile(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('/uploads/')) return
  try {
    await fetch(`/api/media?url=${encodeURIComponent(url)}`, { method: 'DELETE' })
  } catch {
  }
}

export async function deleteHotel(id) {
  await delay(80)
  const current = await listHotels()
  const target = current.find((h) => h.id === id)
  if (target) {
    const mediaUrls = [
      target.image,
      ...(Array.isArray(target.images) ? target.images : []),
      ...(Array.isArray(target.videos) ? target.videos.map((v) => (typeof v === 'string' ? v : v.url)) : []),
    ].filter(Boolean)
    for (const url of new Set(mediaUrls)) {
      if (url.startsWith('/uploads/')) {
        deleteMediaFile(url).catch(() => {})
      }
    }
  }
  const next = current.filter((h) => h.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  await syncToServer(next)
  return true
}

export async function resetHotels() {
  await delay(80)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED))
  await syncToServer(SEED)
  return [...SEED]
}