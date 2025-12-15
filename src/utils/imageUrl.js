import { API_BASE_URL } from './apiClient'

// strip trailing /api or /api/
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

export function getImageUrl(path) {
  if (!path) return ''

  // already absolute URL
  if (/^https?:\/\//i.test(path)) return path

  // path that already starts with /
  if (path.startsWith('/')) return `${API_ORIGIN}${path}`

  // default: relative path like "posters/skyfall.png"
  return `${API_ORIGIN}/${path}`
}