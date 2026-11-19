import { useEffect, useRef, type ReactNode } from 'react'
import { CATEGORY_BY_ID, kindLabel } from '../lib/categories'
import { formatDistance, walkingMinutes } from '../lib/format'
import { directionsUrl, formatAddress, osmUrl, websiteUrl, wikipediaUrl } from '../lib/links'
import type { Landmark } from '../types'
import { BookIcon, ChevronLeftIcon, ExternalIcon, GlobeIcon, MapIcon, WalkIcon } from './icons'
import SidePanel, { CloseButton } from './SidePanel'

type Props = {
  landmark: Landmark
  /** Meters from the user (or from the fallback center). */
  distance: number
  /** True when the distance is measured from the user's real position. */
  fromUser: boolean
  onClose: () => void
  /** Shown when the place was opened from the list. */
  onBack?: () => void
}

function LinkRow({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3.5 text-[15px] transition hover:bg-black/[0.03] dark:hover:bg-white/5"
    >
      <span className="text-blue-600 dark:text-blue-400">{icon}</span>
      <span className="flex-1">{children}</span>
      <ExternalIcon className="size-4 text-slate-400" />
    </a>
  )
}

/** Place card shown when a marker is selected. */
export default function DetailPanel({ landmark, distance, fromUser, onClose, onBack }: Props) {
  const category = CATEGORY_BY_ID[landmark.category]
  const headingRef = useRef<HTMLHeadingElement>(null)
  const wiki = wikipediaUrl(landmark.tags)
  const website = websiteUrl(landmark.tags)
  const address = formatAddress(landmark.tags)
  const limited = Object.keys(landmark.tags).length === 0

  // Move focus to the new place's name so keyboard/screen-reader users land in the panel.
  useEffect(() => headingRef.current?.focus(), [landmark.id])

  return (
    <SidePanel labelledBy="place-name" onEscape={onBack ?? onClose}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="-ml-1 mb-2 flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          <ChevronLeftIcon className="size-4" /> All places
        </button>
      )}

      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: category.color }}>
            <span className="size-2 rounded-full" style={{ backgroundColor: category.color }} aria-hidden="true" />
            {category.label} · {kindLabel(landmark.kind)}
          </p>
          <h2
            id="place-name"
            ref={headingRef}
            tabIndex={-1}
            className="mt-1 text-[26px] leading-tight font-bold tracking-tight outline-none"
          >
            {landmark.name}
          </h2>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      <p className="mt-4 text-[15px] font-semibold">
        {formatDistance(distance)} {fromUser ? 'away' : 'from map center'} · {walkingMinutes(distance)} min walk
      </p>
      {address && <p className="mt-1 text-[15px] text-slate-600 dark:text-neutral-300">{address}</p>}

      <a
        href={directionsUrl(landmark)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
      >
        <WalkIcon className="size-4" /> Directions
      </a>

      <div className="mt-5 divide-y divide-black/5 overflow-hidden rounded-2xl bg-slate-100/80 dark:divide-white/10 dark:bg-white/5">
        {website && (
          <LinkRow href={website} icon={<GlobeIcon className="size-5" />}>
            Website
          </LinkRow>
        )}
        {wiki && (
          <LinkRow href={wiki} icon={<BookIcon className="size-5" />}>
            Wikipedia
          </LinkRow>
        )}
        <LinkRow href={osmUrl(landmark)} icon={<MapIcon className="size-5" />}>
          View on OpenStreetMap
        </LinkRow>
      </div>

      {limited && (
        <p className="mt-3 text-xs text-slate-500 dark:text-neutral-400">
          Limited details while live place data is busy.
        </p>
      )}
    </SidePanel>
  )
}
