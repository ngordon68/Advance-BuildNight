import '../lib/maplibre'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Map, { AttributionControl, Layer, Source, type MapRef } from 'react-map-gl/maplibre'
import DetailPanel from '../components/DetailPanel'
import LandmarkMarker from '../components/LandmarkMarker'
import Legend from '../components/Legend'
import LocationBanner from '../components/LocationBanner'
import MapControls from '../components/MapControls'
import PlaceList from '../components/PlaceList'
import StatusPill, { Spinner } from '../components/StatusPill'
import UserLocation from '../components/UserLocation'
import { useColorScheme } from '../hooks/useColorScheme'
import { useGeolocation } from '../hooks/useGeolocation'
import { useLandmarks } from '../hooks/useLandmarks'
import { usePreferencesState } from '../hooks/usePreferences'
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_STYLES } from '../lib/constants'
import { circlePolygon, distanceMeters } from '../lib/geo'
import { SEARCH_RADIUS_M } from '../lib/landmarks'
import type { Landmark, LatLon } from '../types'

/** Re-search only after the user has moved this far, so GPS jitter doesn't refetch. */
const RESEARCH_DISTANCE_M = 250

export default function MapPage() {
  const scheme = useColorScheme()
  const geo = useGeolocation()
  const { prefs, syncError } = usePreferencesState()
  const mapRef = useRef<MapRef>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const hasCentered = useRef(false)

  // Where we search: the user's position, Chicago if location is unavailable,
  // or nothing yet while we're still waiting for a location answer.
  // Updated during render (React's "adjust state when inputs change" pattern); it
  // converges because the new center is 0 m from itself.
  const [searchCenter, setSearchCenter] = useState<LatLon | null>(null)
  const candidate: LatLon | null =
    geo.status === 'ok'
      ? { latitude: geo.latitude, longitude: geo.longitude }
      : geo.status === 'unavailable'
        ? DEFAULT_CENTER
        : null
  if (candidate && (!searchCenter || distanceMeters(searchCenter, candidate) >= RESEARCH_DISTANCE_M)) {
    setSearchCenter(candidate)
  }

  const { state: places, retry } = useLandmarks(searchCenter, prefs)

  // Selected place (derived, so it clears itself if a new search drops it).
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = places.status === 'success' ? places.landmarks.find((l) => l.id === selectedId) : undefined
  const closePanel = useCallback(() => setSelectedId(null), [])
  const [listOpen, setListOpen] = useState(false)
  const closeAll = useCallback(() => {
    setSelectedId(null)
    setListOpen(false)
  }, [])
  const panelOpen = !!selected || listOpen

  const selectLandmark = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  // Pan so the selected pin isn't hidden behind the panel/sheet.
  useEffect(() => {
    const map = mapRef.current
    if (!selected || !map) return
    const desktop = window.matchMedia('(min-width: 640px)').matches
    const { clientHeight } = map.getContainer()
    map.easeTo({
      center: [selected.longitude, selected.latitude],
      // offset = where the point ends up relative to the map center, in px
      offset: desktop ? [190, 0] : [0, -clientHeight * 0.22],
      duration: 500,
    })
  }, [selected])

  const distanceOf = useCallback(
    (l: Landmark) => (geo.status === 'ok' ? distanceMeters(geo, l) : l.distance),
    [geo],
  )

  const radius = useMemo(
    () => searchCenter && circlePolygon(searchCenter.latitude, searchCenter.longitude, SEARCH_RADIUS_M),
    [searchCenter],
  )

  // Fly to the user's position the first time we get a fix.
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
        attributionControl={false}
        onLoad={() => setMapLoaded(true)}
        onClick={closePanel}
      >
        <AttributionControl position="top-right" compact />
        {radius && (
          <Source id="search-radius" type="geojson" data={radius}>
            <Layer id="search-radius-fill" type="fill" paint={{ 'fill-color': '#0d9488', 'fill-opacity': 0.04 }} />
            <Layer
              id="search-radius-line"
              type="line"
              paint={{ 'line-color': '#0d9488', 'line-width': 2, 'line-opacity': 0.6, 'line-dasharray': [2, 2] }}
            />
          </Source>
        )}
        {geo.status === 'ok' && (
          <UserLocation latitude={geo.latitude} longitude={geo.longitude} accuracy={geo.accuracy} />
        )}
        {places.status === 'success' &&
          places.landmarks.map((l) => (
            <LandmarkMarker key={l.id} landmark={l} selected={l.id === selectedId} onSelect={selectLandmark} />
          ))}
      </Map>

      {/* Status messages stack under the header */}
      <div
        className={`pointer-events-none absolute inset-x-4 top-20 z-10 mx-auto flex max-w-md flex-col items-center gap-2 *:pointer-events-auto ${
          panelOpen ? 'sm:left-[26rem]' : '' /* make room for the side panel */
        }`}
      >
        {geo.status === 'unavailable' && <LocationBanner reason={geo.reason} />}
        {geo.status === 'pending' && (
          <StatusPill>
            <Spinner /> Finding your location…
          </StatusPill>
        )}
        {syncError && <StatusPill tone="error">Couldn't sync your interests — using this device's copy.</StatusPill>}
        {places.status === 'loading' && (
          <StatusPill>
            <Spinner /> Finding places nearby…
          </StatusPill>
        )}
        {places.status === 'error' && (
          <StatusPill tone="error">
            Couldn't load places.
            <button
              type="button"
              onClick={retry}
              className="rounded-full bg-teal-600 px-3 py-0.5 font-medium text-white hover:bg-teal-700"
            >
              Retry
            </button>
          </StatusPill>
        )}
        {places.status === 'success' && places.landmarks.length === 0 && (
          <StatusPill>No places found within 2 km. Try different interests.</StatusPill>
        )}
        {places.status === 'success' && places.source === 'tiles' && places.landmarks.length > 0 && (
          <StatusPill>Live place data is busy — showing limited details.</StatusPill>
        )}
      </div>

      {selected ? (
        <DetailPanel
          key={selected.id}
          landmark={selected}
          distance={distanceOf(selected)}
          fromUser={geo.status === 'ok'}
          onClose={closeAll}
          onBack={listOpen ? closePanel : undefined}
        />
      ) : (
        listOpen &&
        places.status === 'success' && (
          <PlaceList
            landmarks={places.landmarks}
            distanceOf={distanceOf}
            onSelect={selectLandmark}
            onClose={() => setListOpen(false)}
          />
        )
      )}

      {/* On phones the bottom sheet covers this area, so hide the controls while it's open. */}
      <div className={panelOpen ? 'max-sm:hidden' : undefined}>
        <MapControls
          legend={
            places.status === 'success' &&
            prefs &&
            places.landmarks.length > 0 && (
              <Legend categories={prefs.categories} landmarks={places.landmarks} total={places.total} />
            )
          }
          placeCount={places.status === 'success' ? places.landmarks.length : null}
          onOpenList={() => {
            setSelectedId(null)
            setListOpen(true)
          }}
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
          onLocate={
            geo.status === 'ok'
              ? () => mapRef.current?.flyTo({ center: [geo.longitude, geo.latitude], zoom: 15, duration: 1000 })
              : null
          }
        />
      </div>
    </>
  )
}
