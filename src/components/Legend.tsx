import { CATEGORY_BY_ID } from '../lib/categories'
import type { CategoryId, Landmark } from '../types'

type Props = { categories: CategoryId[]; landmarks: Landmark[]; total: number }

/** Bottom-left key: one row per chosen category with its color and count. */
export default function Legend({ categories, landmarks, total }: Props) {
  return (
    <div className="glass absolute bottom-6 left-4 z-10 rounded-2xl px-3 py-2.5 text-sm">
      <ul className="space-y-1">
        {categories.map((id) => {
          const c = CATEGORY_BY_ID[id]
          const count = landmarks.filter((l) => l.category === id).length
          return (
            <li key={id} className="flex items-center gap-2">
              <span className="size-3 rounded-full ring-2 ring-white dark:ring-neutral-800" style={{ backgroundColor: c.color }} />
              <span className="flex-1">{c.label}</span>
              <span className="ml-3 tabular-nums text-slate-500 dark:text-neutral-400">{count}</span>
            </li>
          )
        })}
      </ul>
      {total > landmarks.length && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-neutral-400">Nearest {landmarks.length} of {total} shown</p>
      )}
    </div>
  )
}
