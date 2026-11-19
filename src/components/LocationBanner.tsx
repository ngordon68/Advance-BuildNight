import { useState } from 'react'

type Props = { reason: 'denied' | 'unsupported' | 'error' }

const MESSAGES: Record<Props['reason'], string> = {
  denied: 'Location unavailable — showing Chicago. Enable location in your browser settings to see your area.',
  unsupported: "Your browser doesn't support location — showing Chicago.",
  error: "We couldn't find your location — showing Chicago. Check that location services are on and reload.",
}

/** Dismissible notice shown when the map falls back to the default city. */
export default function LocationBanner({ reason }: Props) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div
      role="status"
      className="glass absolute inset-x-4 top-20 z-10 mx-auto flex max-w-md items-start gap-3 rounded-2xl px-4 py-3 text-sm"
    >
      <span aria-hidden="true" className="mt-0.5 text-amber-500">
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z" />
        </svg>
      </span>
      <p className="flex-1 leading-snug">{MESSAGES[reason]}</p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="-mr-1 grid size-6 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-black/5 dark:text-neutral-400 dark:hover:bg-white/10"
      >
        ✕
      </button>
    </div>
  )
}
