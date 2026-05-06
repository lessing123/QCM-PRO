export function resolveMediaUrl(url?: string | null) {
  if (!url) return undefined
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }

  const apiBase = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || window.location.origin
  const normalized = url.startsWith('/') ? url : `/${url}`
  return `${apiBase}${normalized}`
}
