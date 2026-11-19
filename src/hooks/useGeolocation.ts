import { useEffect, useState } from 'react'

export type GeoState =
  | { status: 'pending' }
  | { status: 'ok'; latitude: number; longitude: number; accuracy: number }
  | { status: 'unavailable'; reason: 'denied' | 'unsupported' | 'error' }

/**
 * Watches the browser's position. Once a fix is obtained, later errors
 * (e.g. a transient timeout) are ignored so the last known position is kept.
 */
export function useGeolocation(): GeoState {
  const [state, setState] = useState<GeoState>(() =>
    'geolocation' in navigator ? { status: 'pending' } : { status: 'unavailable', reason: 'unsupported' },
  )

  useEffect(() => {
    if (!('geolocation' in navigator)) return

    const id = navigator.geolocation.watchPosition(
      ({ coords }) =>
        setState({
          status: 'ok',
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        }),
      (err) =>
        setState((prev) =>
          prev.status === 'ok'
            ? prev
            : { status: 'unavailable', reason: err.code === err.PERMISSION_DENIED ? 'denied' : 'error' },
        ),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  return state
}
