const LEAFLET_VERSION = '1.9.4'
const CSS_HREF = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`
const JS_SRC = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`

let leafletPromise = null

export function loadLeaflet() {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'))
  if (window.L) return Promise.resolve(window.L)
  if (leafletPromise) return leafletPromise

  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${CSS_HREF}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = CSS_HREF
      document.head.appendChild(link)
    }

    if (document.querySelector(`script[src="${JS_SRC}"]`)) {
      const wait = setInterval(() => {
        if (window.L) {
          clearInterval(wait)
          resolve(window.L)
        }
      }, 40)
      setTimeout(() => {
        clearInterval(wait)
        if (!window.L) reject(new Error('Leaflet timeout'))
      }, 8000)
      return
    }

    const script = document.createElement('script')
    script.src = JS_SRC
    script.async = true
    script.onload = () => resolve(window.L)
    script.onerror = () => reject(new Error('Leaflet failed to load'))
    document.head.appendChild(script)
  })

  return leafletPromise
}
