import { memo } from 'react'
import { Marker } from 'react-map-gl/maplibre'
import { CATEGORY_BY_ID, kindLabel } from '../lib/categories'
import type { Landmark } from '../types'

type Props = { landmark: Landmark; selected: boolean; onSelect: (id: string) => void }

/** Apple-style round pin: category color, white ring, category emoji. */
function LandmarkMarker({ landmark, selected, onSelect }: Props) {
  const category = CATEGORY_BY_ID[landmark.category]
  return (
    <Marker
      latitude={landmark.latitude}
      longitude={landmark.longitude}
      anchor="center"
      style={selected ? { zIndex: 10 } : undefined}
      onClick={(e) => {
        e.originalEvent.stopPropagation() // don't let the map's "click empty space" close it
        onSelect(landmark.id)
      }}
    >
      <button
        type="button"
        className={`landmark-pin${selected ? ' landmark-pin--selected' : ''}`}
        style={{ backgroundColor: category.color }}
        title={`${landmark.name} · ${kindLabel(landmark.kind)}`}
        aria-label={`${landmark.name}, ${kindLabel(landmark.kind)}`}
        aria-pressed={selected}
      >
        <span aria-hidden="true">{category.emoji}</span>
      </button>
    </Marker>
  )
}

export default memo(LandmarkMarker)
