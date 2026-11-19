import { memo } from 'react'
import { Marker } from 'react-map-gl/maplibre'
import { CATEGORY_BY_ID, kindLabel } from '../lib/categories'
import type { Landmark } from '../types'
import { CategoryIcon } from './icons'

type Props = { landmark: Landmark; selected: boolean; onSelect: (id: string) => void }

/** Category-shaped pin (square / circle / teardrop) with a white line icon. */
function LandmarkMarker({ landmark, selected, onSelect }: Props) {
  const category = CATEGORY_BY_ID[landmark.category]
  const isPin = category.shape === 'pin'
  return (
    <Marker
      latitude={landmark.latitude}
      longitude={landmark.longitude}
      anchor={isPin ? 'bottom' : 'center'}
      style={selected ? { zIndex: 10 } : undefined}
      onClick={(e) => {
        e.originalEvent.stopPropagation() // don't let the map's "click empty space" close it
        onSelect(landmark.id)
      }}
    >
      <button
        type="button"
        className={`landmark-pin landmark-pin--${category.shape}${selected ? ' landmark-pin--selected' : ''}`}
        style={{ backgroundColor: category.color, ['--pin-color' as string]: category.color }}
        title={`${landmark.name} · ${kindLabel(landmark.kind)}`}
        aria-label={`${landmark.name}, ${kindLabel(landmark.kind)}`}
        aria-pressed={selected}
      >
        <CategoryIcon id={landmark.category} className="landmark-pin__icon" />
      </button>
    </Marker>
  )
}

export default memo(LandmarkMarker)
