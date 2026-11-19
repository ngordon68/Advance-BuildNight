import type { ReactNode } from 'react'
import { ListIcon, LocateIcon, MinusIcon, PlusIcon } from './icons'

type Props = {
  legend: ReactNode
  placeCount: number | null
  onOpenList: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  /** Null when the user's position is unknown. */
  onLocate: (() => void) | null
}

const squareButton =
  'surface grid size-11 place-items-center rounded-2xl transition hover:bg-slate-50 disabled:opacity-40 dark:hover:bg-neutral-700'

/** Bottom-right cluster: zoom stack above; legend, list and locate in a row. */
export default function MapControls({ legend, placeCount, onOpenList, onZoomIn, onZoomOut, onLocate }: Props) {
  return (
    <div className="pointer-events-none absolute right-4 bottom-4 left-4 z-10 flex flex-col items-end gap-3 *:pointer-events-auto">
      <div className="surface flex flex-col overflow-hidden rounded-2xl">
        <button type="button" onClick={onZoomIn} aria-label="Zoom in" className="grid size-11 place-items-center hover:bg-black/5 dark:hover:bg-white/10">
          <PlusIcon className="size-5" />
        </button>
        <span className="mx-2 h-px bg-black/10 dark:bg-white/10" aria-hidden="true" />
        <button type="button" onClick={onZoomOut} aria-label="Zoom out" className="grid size-11 place-items-center hover:bg-black/5 dark:hover:bg-white/10">
          <MinusIcon className="size-5" />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {legend}
        {placeCount !== null && placeCount > 0 && (
          <button
            type="button"
            onClick={onOpenList}
            className="surface flex h-11 items-center gap-2 rounded-2xl px-4 text-[15px] font-semibold transition hover:bg-slate-50 dark:hover:bg-neutral-700"
          >
            <ListIcon className="size-[18px]" /> List · {placeCount} {placeCount === 1 ? 'place' : 'places'}
          </button>
        )}
        <button
          type="button"
          onClick={onLocate ?? undefined}
          disabled={!onLocate}
          aria-label="Center on my location"
          title={onLocate ? 'Center on my location' : 'Location unavailable'}
          className={`${squareButton} text-blue-600 dark:text-blue-400`}
        >
          <LocateIcon className="size-5" />
        </button>
      </div>
    </div>
  )
}
