import { CATEGORY_BY_ID, kindLabel } from '../lib/categories'
import { formatDistance } from '../lib/format'
import type { Landmark } from '../types'
import { CategoryIcon } from './icons'
import SidePanel, { CloseButton } from './SidePanel'

type Props = {
  landmarks: Landmark[]
  /** Distance to show for each place (from the user when known). */
  distanceOf: (l: Landmark) => number
  onSelect: (id: string) => void
  onClose: () => void
}

/** Every place found, nearest first. */
export default function PlaceList({ landmarks, distanceOf, onSelect, onClose }: Props) {
  const sorted = [...landmarks].sort((a, b) => distanceOf(a) - distanceOf(b))
  return (
    <SidePanel labelledBy="place-list-title" onEscape={onClose}>
      <div className="flex items-center gap-3">
        <h2 id="place-list-title" className="flex-1 text-[22px] font-bold tracking-tight">
          Nearby places
          <span className="ml-2 text-base font-medium text-slate-500 dark:text-neutral-400">{landmarks.length}</span>
        </h2>
        <CloseButton onClick={onClose} />
      </div>
      <ul className="mt-4 -mx-2">
        {sorted.map((l) => {
          const c = CATEGORY_BY_ID[l.category]
          return (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => onSelect(l.id)}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <span
                  className={`grid size-9 shrink-0 place-items-center text-white ${c.shape === 'square' ? 'rounded-lg' : 'rounded-full'}`}
                  style={{ backgroundColor: c.color }}
                  aria-hidden="true"
                >
                  <CategoryIcon id={l.category} className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{l.name}</span>
                  <span className="block text-sm text-slate-500 dark:text-neutral-400">
                    {kindLabel(l.kind)} · {formatDistance(distanceOf(l))}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </SidePanel>
  )
}
