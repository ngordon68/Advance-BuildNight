import '../lib/maplibre'
import Map, { NavigationControl } from 'react-map-gl/maplibre'
import { useColorScheme } from '../hooks/useColorScheme'
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_STYLES } from '../lib/constants'

export default function MapPage() {
  const scheme = useColorScheme()

  return (
    <Map
      initialViewState={{ ...DEFAULT_CENTER, zoom: DEFAULT_ZOOM }}
      mapStyle={MAP_STYLES[scheme]}
      style={{ position: 'absolute', inset: 0 }}
      attributionControl={{ compact: true }}
    >
      <NavigationControl position="bottom-right" visualizePitch />
    </Map>
  )
}
