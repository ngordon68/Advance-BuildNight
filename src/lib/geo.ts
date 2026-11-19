import type { Feature, Polygon } from 'geojson'
import type { LatLon } from '../types'

const EARTH_RADIUS_M = 6_371_008.8
const rad = (deg: number) => (deg * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI

/** Great-circle (haversine) distance in meters. */
export function distanceMeters(a: LatLon, b: LatLon): number {
  const dLat = rad(b.latitude - a.latitude)
  const dLon = rad(b.longitude - a.longitude)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

/** Approximate a circle of `radiusM` meters around a point as a GeoJSON polygon. */
export function circlePolygon(latitude: number, longitude: number, radiusM: number, steps = 64): Feature<Polygon> {
  const lat = rad(latitude)
  const lon = rad(longitude)
  const d = radiusM / EARTH_RADIUS_M
  const ring: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const bearing = (i / steps) * 2 * Math.PI
    const lat2 = Math.asin(Math.sin(lat) * Math.cos(d) + Math.cos(lat) * Math.sin(d) * Math.cos(bearing))
    const lon2 =
      lon + Math.atan2(Math.sin(bearing) * Math.sin(d) * Math.cos(lat), Math.cos(d) - Math.sin(lat) * Math.sin(lat2))
    ring.push([deg(lon2), deg(lat2)])
  }
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } }
}

/** Web-Mercator tile containing a point at zoom `z`. */
export function tileFor(latitude: number, longitude: number, z: number): { x: number; y: number } {
  const n = 2 ** z
  const x = Math.floor(((longitude + 180) / 360) * n)
  const latR = rad(latitude)
  const y = Math.floor(((1 - Math.log(Math.tan(latR) + 1 / Math.cos(latR)) / Math.PI) / 2) * n)
  return { x, y }
}

/** All tiles at zoom `z` overlapping the bounding box of a circle. */
export function tilesCoveringCircle(center: LatLon, radiusM: number, z: number) {
  const dLat = deg(radiusM / EARTH_RADIUS_M)
  const dLon = dLat / Math.cos(rad(center.latitude))
  const nw = tileFor(center.latitude + dLat, center.longitude - dLon, z)
  const se = tileFor(center.latitude - dLat, center.longitude + dLon, z)
  const tiles: { x: number; y: number; z: number }[] = []
  for (let x = nw.x; x <= se.x; x++) for (let y = nw.y; y <= se.y; y++) tiles.push({ x, y, z })
  return tiles
}
