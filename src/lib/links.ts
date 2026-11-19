import type { Landmark } from '../types'

export function osmUrl(l: Landmark): string {
  return `https://www.openstreetmap.org/${l.osmType}/${l.osmId}`
}

export function directionsUrl(l: Landmark): string {
  const params = new URLSearchParams({
    api: '1',
    destination: `${l.latitude},${l.longitude}`,
    travelmode: 'walking',
  })
  return `https://www.google.com/maps/dir/?${params}`
}

/** OSM `wikipedia` tags look like "en:Art Institute of Chicago". */
export function wikipediaUrl(tags: Record<string, string>): string | null {
  const value = tags.wikipedia
  if (!value) return null
  const match = /^([a-z-]{2,12}):(.+)$/i.exec(value)
  const [lang, title] = match ? [match[1], match[2]] : ['en', value]
  return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.trim().replace(/ /g, '_'))}`
}

/** Website from OSM tags; only http(s) URLs are allowed through. */
export function websiteUrl(tags: Record<string, string>): string | null {
  const raw = (tags.website ?? tags['contact:website'])?.trim()
  if (!raw) return null
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`
  try {
    const url = new URL(withScheme)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

/** "123 N Michigan Ave, Chicago" from addr:* tags, or null. */
export function formatAddress(tags: Record<string, string>): string | null {
  const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ')
  const parts = [street, tags['addr:city']].filter(Boolean)
  return parts.length ? parts.join(', ') : null
}
