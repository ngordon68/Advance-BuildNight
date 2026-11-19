import { setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'

// MapLibre v6 locates its tile-parsing Web Worker relative to its own module file.
// Vite's dependency pre-bundling (dev) and bundling (build) move that file, so the
// worker fails to load and the map renders only its background color. Point MapLibre
// at the worker file explicitly; Vite serves/emits it via the `?url` import.
setWorkerUrl(workerUrl)
