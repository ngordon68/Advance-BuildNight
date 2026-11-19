import type { Feature, Polygon } from 'geojson'

const EARTH_RADIUS_M = 6_371_008.8

/** Approximate a circle of `radiusM` meters around a point as a GeoJSON polygon. */
export function circlePolygon(latitude: number, longitude: number, radiusM: number, steps = 64): Feature<Polygon> {
  const lat = (latitude * Math.PI) / 180
  const lon = (longitude * Math.PI) / 180
  const d = radiusM / EARTH_RADIUS_M
  const ring: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const bearing = (i / steps) * 2 * Math.PI
    const lat2 = Math.asin(Math.sin(lat) * Math.cos(d) + Math.cos(lat) * Math.sin(d) * Math.cos(bearing))
    const lon2 =
      lon + Math.atan2(Math.sin(bearing) * Math.sin(d) * Math.cos(lat), Math.cos(d) - Math.sin(lat) * Math.sin(lat2))
    ring.push([(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI])
  }
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } }
}
