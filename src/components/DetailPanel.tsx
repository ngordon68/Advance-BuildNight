import { useEffect, useRef } from 'react'
import { CATEGORY_BY_ID, kindLabel } from '../lib/categories'
import { formatDistance, walkingMinutes } from '../lib/format'
import { directionsUrl, formatAddress, osmUrl, websiteUrl, wikipediaUrl } from '../lib/links'
import type { Landmark } from '../types'

type Props = {
  landmark: Landmark
  /** Meters from the user (or from the fallback center). */
  distance: number
  /** True when the distance is measured from the user's real position. */
  fromUser: boolean
  onClose: () => void
}

const linkClass =
  'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-black/5 dark:hover:bg-white/10'

function ExternalIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4 opacity-50" fill="currentColor" aria-hidden="true">
      <path d="M11 3a1 1 0 1 0 0 2h2.59l-6.3 6.3a1 1 0 1 0 1.42 1.4L15 6.42V9a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-5Z" />
      <path d="M5 5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a1 1 0 1 0-2 0v3H5V7h3a1 1 0 0 0 0-2H5Z" />
    </svg>
  )
}

/** Place card: bottom sheet on phones, floating side panel on wider screens. */
export default function DetailPanel({ landmark, distance, fromUser, onClose }: Props) {
  const category = CATEGORY_BY_ID[landmark.category]
  const headingRef = useRef<HTMLHeadingElement>(null)
  const wiki = wikipediaUrl(landmark.tags)
  const website = websiteUrl(landmark.tags)
  const address = formatAddress(landmark.tags)
  const limited = Object.keys(landmark.tags).length === 0

  // Esc closes the panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Move focus to the new place's name so keyboard/screen-reader users land in the panel.
  useEffect(() => headingRef.current?.focus(), [landmark.id])

  return (
    <aside
      role="dialog"
      aria-labelledby="place-name"
      className="detail-panel glass fixed inset-x-0 bottom-0 z-30 max-h-[55%] overflow-y-auto rounded-t-3xl px-5 pt-2 pb-6 sm:absolute sm:inset-x-auto sm:top-20 sm:bottom-auto sm:left-4 sm:max-h-[calc(100%-7rem)] sm:w-[22rem] sm:rounded-3xl sm:pt-5"
    >
      {/* Grab handle (decorative) on phones */}
      <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-black/15 sm:hidden dark:bg-white/20" aria-hidden="true" />

      <div className="flex items-start gap-3">
        <span
          className="grid size-11 shrink-0 place-items-center rounded-full text-xl ring-2 ring-white dark:ring-neutral-800"
          style={{ backgroundColor: category.color }}
          aria-hidden="true"
        >
          {category.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="place-name" ref={headingRef} tabIndex={-1} className="text-xl leading-tight font-semibold outline-none">
            {landmark.name}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-neutral-400">
            {kindLabel(landmark.kind)} · {category.label}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-black/5 text-slate-600 hover:bg-black/10 dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/20"
        >
          ✕
        </button>
      </div>

      <p className="mt-4 text-sm">
        <span className="font-semibold">{formatDistance(distance)}</span>{' '}
        {fromUser ? 'away' : 'from map center'}
        <span className="text-slate-500 dark:text-neutral-400"> · {walkingMinutes(distance)} min walk</span>
      </p>
      {address && <p className="mt-1 text-sm text-slate-600 dark:text-neutral-300">{address}</p>}

      <a
        href={directionsUrl(landmark)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 font-semibold text-white transition hover:bg-teal-700"
      >
        Directions
      </a>

      <div className="mt-3 divide-y divide-black/5 rounded-2xl bg-black/[0.03] dark:divide-white/10 dark:bg-white/5">
        {wiki && (
          <a href={wiki} target="_blank" rel="noopener noreferrer" className={linkClass}>
            Wikipedia <ExternalIcon />
          </a>
        )}
        {website && (
          <a href={website} target="_blank" rel="noopener noreferrer" className={linkClass}>
            Website <ExternalIcon />
          </a>
        )}
        <a href={osmUrl(landmark)} target="_blank" rel="noopener noreferrer" className={linkClass}>
          View on OpenStreetMap <ExternalIcon />
        </a>
      </div>

      {limited && (
        <p className="mt-3 text-xs text-slate-500 dark:text-neutral-400">
          Limited details while live place data is busy.
        </p>
      )}
    </aside>
  )
}
