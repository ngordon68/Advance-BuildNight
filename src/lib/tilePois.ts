import { VectorTile } from '@mapbox/vector-tile'
import { PbfReader } from 'pbf'
import type { Landmark, LatLon, OsmType } from '../types'
import type { SearchTag } from './categories'
import { distanceMeters, tilesCoveringCircle } from './geo'

/** TileJSON for the OpenFreeMap planet tiles (the same data the map draws). */
const TILEJSON_URL = 'https://tiles.openfreemap.org/planet'
/** POI layer is complete at the source's max zoom. */
const TILE_ZOOM = 14

let tileTemplate: Promise<string> | null = null
function getTileTemplate(signal: AbortSignal): Promise<string> {
  tileTemplate ??= fetch(TILEJSON_URL, { signal })
    .then((r) => {
      if (!r.ok) throw new Error(`TileJSON ${r.status}`)
      return r.json() as Promise<{ tiles: string[] }>
    })
    .then((j) => j.tiles[0])
    .catch((err) => {
      tileTemplate = null // allow a later retry
      throw err
    })
  return tileTemplate
}

// Planetiler encodes feature ids as osmId * 10 + (1 node | 2 way | 3 relation).
const OSM_TYPES: Record<number, OsmType> = { 1: 'node', 2: 'way', 3: 'relation' }

/**
 * Backup data source: reads named POIs from the OpenFreeMap vector tiles covering
 * the search circle. Has name and type only (no Wikipedia/website tags), and a few
 * kinds (memorials, nature reserves) aren't in the tile POI layer.
 */
export async function fetchFromTiles(
  tags: SearchTag[],
  center: LatLon,
  radiusM: number,
  signal: AbortSignal,
): Promise<Landmark[]> {
  const template = await getTileTemplate(signal)
  const byValue = new Map(tags.map((t) => [t.value, t]))
  const seen = new Set<string>()
  const out: Landmark[] = []

  await Promise.all(
    tilesCoveringCircle(center, radiusM, TILE_ZOOM).map(async ({ x, y, z }) => {
      const url = template.replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y))
      const res = await fetch(url, { signal })
      if (res.status === 204) return // empty tile
      if (!res.ok) throw new Error(`Tile ${res.status}`)
      const poi = new VectorTile(new PbfReader(new Uint8Array(await res.arrayBuffer()))).layers.poi
      if (!poi) return
      for (let i = 0; i < poi.length; i++) {
        const f = poi.feature(i)
        const name = f.properties.name
        const match = byValue.get(String(f.properties.subclass))
        if (!match || typeof name !== 'string' || !name || f.type !== 1) continue
        const geom = f.toGeoJSON(x, y, z).geometry
        if (geom.type !== 'Point') continue
        const [longitude, latitude] = geom.coordinates
        const distance = distanceMeters(center, { latitude, longitude })
        if (distance > radiusM) continue

        const rawId = Number(f.id ?? 0)
        const osmType = OSM_TYPES[rawId % 10] ?? 'node'
        const osmId = Math.floor(rawId / 10)
        const id = `${osmType}/${osmId}`
        if (seen.has(id)) continue // features near tile edges can repeat
        seen.add(id)
        out.push({ id, osmType, osmId, name, latitude, longitude, category: match.category, kind: match.value, tags: {}, distance })
      }
    }),
  )
  return out
}
