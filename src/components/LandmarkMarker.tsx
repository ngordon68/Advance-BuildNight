import { memo } from 'react'
import { Marker } from 'react-map-gl/maplibre'
import { CATEGORY_BY_ID, kindLabel } from '../lib/categories'
import type { Landmark } from '../types'

/** Apple-style round pin: category color, white ring, category emoji. */
function LandmarkMarker({ landmark }: { landmark: Landmark }) {
  const category = CATEGORY_BY_ID[landmark.category]
  return (
    <Marker latitude={landmark.latitude} longitude={landmark.longitude} anchor="center">
      <button
        type="button"
        className="landmark-pin"
        style={{ backgroundColor: category.color }}
        title={`${landmark.name} · ${kindLabel(landmark.kind)}`}
        aria-label={`${landmark.name}, ${kindLabel(landmark.kind)}`}
      >
        <span aria-hidden="true">{category.emoji}</span>
      </button>
    </Marker>
  )
}

export default memo(LandmarkMarker)
