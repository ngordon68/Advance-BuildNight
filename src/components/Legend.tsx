import { CATEGORY_BY_ID } from '../lib/categories'
import type { CategoryId, Landmark } from '../types'

type Props = { categories: CategoryId[]; landmarks: Landmark[]; total: number }

/** Inline key: one swatch + count per chosen category. */
export default function Legend({ categories, landmarks, total }: Props) {
  return (
    <div
      className="surface flex h-11 items-center gap-4 rounded-2xl px-4 text-sm"
      title={total > landmarks.length ? `Nearest ${landmarks.length} of ${total} shown` : undefined}
    >
      {categories.map((id) => {
        const c = CATEGORY_BY_ID[id]
        const count = landmarks.filter((l) => l.category === id).length
        return (
          <span key={id} className="flex items-center gap-1.5">
            <span
              className={`size-3 ${c.shape === 'square' ? 'rounded-[3px]' : 'rounded-full'}`}
              style={{ backgroundColor: c.color }}
              aria-hidden="true"
            />
            {c.shortLabel}
            <span className="font-semibold tabular-nums">{count}</span>
          </span>
        )
      })}
    </div>
  )
}
