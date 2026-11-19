import { useMemo } from 'react'
import { Layer, Marker, Source } from 'react-map-gl/maplibre'
import { circlePolygon } from '../lib/geo'

type Props = { latitude: number; longitude: number; accuracy: number }

/** Apple-style blue "you are here" dot with a translucent accuracy circle. */
export default function UserLocation({ latitude, longitude, accuracy }: Props) {
  const circle = useMemo(() => circlePolygon(latitude, longitude, accuracy), [latitude, longitude, accuracy])

  return (
    <>
      <Source id="user-accuracy" type="geojson" data={circle}>
        <Layer id="user-accuracy-fill" type="fill" paint={{ 'fill-color': '#0a84ff', 'fill-opacity': 0.12 }} />
        <Layer
          id="user-accuracy-line"
          type="line"
          paint={{ 'line-color': '#0a84ff', 'line-opacity': 0.35, 'line-width': 1 }}
        />
      </Source>
      <Marker latitude={latitude} longitude={longitude} anchor="center">
        <div className="user-dot" role="img" aria-label="Your location" />
      </Marker>
    </>
  )
}
