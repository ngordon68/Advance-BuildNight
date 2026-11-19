import '../lib/maplibre'
import { useEffect, useRef, useState } from 'react'
import Map, { NavigationControl, type MapRef } from 'react-map-gl/maplibre'
import LocationBanner from '../components/LocationBanner'
import UserLocation from '../components/UserLocation'
import { useColorScheme } from '../hooks/useColorScheme'
import { useGeolocation } from '../hooks/useGeolocation'
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_STYLES } from '../lib/constants'

export default function MapPage() {
  const scheme = useColorScheme()
  const geo = useGeolocation()
  const mapRef = useRef<MapRef>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const hasCentered = useRef(false)

  // Fly to the user's position the first time we get a fix (not on every update,
  // so we don't fight the user while they pan around).
  useEffect(() => {
    if (!mapLoaded || geo.status !== 'ok' || hasCentered.current) return
    hasCentered.current = true
    mapRef.current?.flyTo({ center: [geo.longitude, geo.latitude], zoom: 15, duration: 1500 })
  }, [mapLoaded, geo])

  return (
    <>
      <Map
        ref={mapRef}
        initialViewState={{ ...DEFAULT_CENTER, zoom: DEFAULT_ZOOM }}
        mapStyle={MAP_STYLES[scheme]}
        style={{ position: 'absolute', inset: 0 }}
        attributionControl={{ compact: true }}
        onLoad={() => setMapLoaded(true)}
      >
        <NavigationControl position="bottom-right" visualizePitch />
        {geo.status === 'ok' && (
          <UserLocation latitude={geo.latitude} longitude={geo.longitude} accuracy={geo.accuracy} />
        )}
      </Map>

      {geo.status === 'unavailable' && <LocationBanner reason={geo.reason} />}
      {geo.status === 'pending' && (
        <div className="glass absolute top-20 left-1/2 z-10 -translate-x-1/2 rounded-full px-4 py-2 text-sm">
          Finding your location…
        </div>
      )}
    </>
  )
}
