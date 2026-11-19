import type { Landmark, LandmarkSource, LatLon, Preferences } from '../types'
import { tagsFor } from './categories'
import { fetchFromOverpass } from './overpass'
import { fetchFromTiles } from './tilePois'

export const SEARCH_RADIUS_M = 2_000
/** Cap markers so dense downtowns stay readable and fast. */
export const MAX_LANDMARKS = 200

export type LandmarkResult = { landmarks: Landmark[]; source: LandmarkSource; total: number }

const cacheKey = (prefs: Preferences, c: LatLon) =>
  `nearbygems.landmarks:${c.latitude.toFixed(3)},${c.longitude.toFixed(3)}:${prefs.categories.join(',')}:${prefs.vibe}`

function readCache(key: string): LandmarkResult | null {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as LandmarkResult) : null
  } catch {
    return null
  }
}

function writeCache(key: string, value: LandmarkResult) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota or storage blocked — skip caching */
  }
}

/**
 * Finds landmarks matching the user's preferences around `center`.
 * Tries live Overpass data first; if every Overpass server fails, falls back to the
 * map's vector tiles. Only Overpass results are cached, so later searches retry it.
 */
export async function findLandmarks(prefs: Preferences, center: LatLon, signal: AbortSignal): Promise<LandmarkResult> {
  const key = cacheKey(prefs, center)
  const cached = readCache(key)
  if (cached) return cached

  const tags = tagsFor(prefs.categories, prefs.vibe)
  let source: LandmarkSource = 'overpass'
  let all: Landmark[]
  try {
    all = await fetchFromOverpass(tags, center, SEARCH_RADIUS_M, signal)
  } catch (err) {
    if (signal.aborted) throw err
    console.warn('Overpass unavailable, using map tile data instead:', err)
    source = 'tiles'
    all = await fetchFromTiles(tags, center, SEARCH_RADIUS_M, signal)
  }

  const landmarks = all.sort((a, b) => a.distance - b.distance).slice(0, MAX_LANDMARKS)
  const result: LandmarkResult = { landmarks, source, total: all.length }
  if (source === 'overpass') writeCache(key, result)
  return result
}
