/** "850 m" under a kilometer (rounded to 10 m), otherwise "1.2 km". */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.max(10, Math.round(meters / 10) * 10)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

/** Walking time at ~80 m/min (≈4.8 km/h), at least 1 minute. */
export function walkingMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / 80))
}
