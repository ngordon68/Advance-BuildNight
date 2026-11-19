/** Map center used when the user's location is unavailable (downtown Chicago). */
export const DEFAULT_CENTER = { latitude: 41.8781, longitude: -87.6298 }
export const DEFAULT_ZOOM = 14

/** Free OpenFreeMap vector styles (no API key). */
export const MAP_STYLES = {
  light: 'https://tiles.openfreemap.org/styles/liberty',
  dark: 'https://tiles.openfreemap.org/styles/fiord',
} as const
