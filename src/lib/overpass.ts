import type { Landmark, LatLon, OsmType } from '../types'
import type { SearchTag } from './categories'
import { distanceMeters } from './geo'

/** Public Overpass servers, tried in order. Each gets its own time budget. */
const ENDPOINTS = [
  { url: 'https://overpass-api.de/api/interpreter', timeoutMs: 6_000 },
  { url: 'https://overpass.private.coffee/api/interpreter', timeoutMs: 5_000 },
]

type OverpassElement = {
  type: OsmType
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

/** Overpass QL: every named node/way/relation matching any tag within the radius. */
export function buildQuery(tags: SearchTag[], center: LatLon, radiusM: number): string {
  const around = `(around:${radiusM},${center.latitude.toFixed(6)},${center.longitude.toFixed(6)})`
  const parts = tags.map((t) => `nwr["${t.key}"="${t.value}"]["name"]${around};`).join('')
  return `[out:json][timeout:20];(${parts});out center tags;`
}

export function parseElements(elements: OverpassElement[], tags: SearchTag[], center: LatLon): Landmark[] {
  const out: Landmark[] = []
  for (const el of elements) {
    const lat = el.lat ?? el.center?.lat
    const lon = el.lon ?? el.center?.lon
    const name = el.tags?.name
    if (lat === undefined || lon === undefined || !name || !el.tags) continue
    const match = tags.find((t) => el.tags![t.key] === t.value)
    if (!match) continue
    out.push({
      id: `${el.type}/${el.id}`,
      osmType: el.type,
      osmId: el.id,
      name,
      latitude: lat,
      longitude: lon,
      category: match.category,
      kind: match.value,
      tags: el.tags,
      distance: distanceMeters(center, { latitude: lat, longitude: lon }),
    })
  }
  return out
}

/** Queries Overpass, falling through the endpoint list. Throws if every server fails. */
export async function fetchFromOverpass(
  tags: SearchTag[],
  center: LatLon,
  radiusM: number,
  signal: AbortSignal,
): Promise<Landmark[]> {
  const body = new URLSearchParams({ data: buildQuery(tags, center, radiusM) })
  let lastError: unknown
  for (const { url, timeoutMs } of ENDPOINTS) {
    signal.throwIfAborted()
    try {
      const res = await fetch(url, {
        method: 'POST',
        body,
        signal: AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]),
      })
      if (!res.ok) throw new Error(`Overpass ${res.status}`)
      const json = (await res.json()) as { elements: OverpassElement[] }
      return parseElements(json.elements, tags, center)
    } catch (err) {
      if (signal.aborted) throw err
      lastError = err
    }
  }
  throw lastError ?? new Error('Overpass unavailable')
}
