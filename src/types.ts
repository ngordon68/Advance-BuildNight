export type CategoryId = 'history' | 'art' | 'nature'
export type Vibe = 'quiet' | 'lively' | 'any'

export type Preferences = {
  categories: CategoryId[]
  vibe: Vibe
}

export type LatLon = { latitude: number; longitude: number }

export type OsmType = 'node' | 'way' | 'relation'

export type Landmark = {
  /** Stable id, e.g. "way/73687739". */
  id: string
  osmType: OsmType
  osmId: number
  name: string
  latitude: number
  longitude: number
  category: CategoryId
  /** OSM tag value, e.g. "museum". */
  kind: string
  /** Raw OSM tags (only populated for Overpass results). */
  tags: Record<string, string>
  /** Meters from the search center. */
  distance: number
}

/** Where landmark data came from: live Overpass, or the map's vector tiles (limited). */
export type LandmarkSource = 'overpass' | 'tiles'
