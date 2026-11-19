import { useEffect, type ReactNode } from 'react'
import { CloseIcon } from './icons'

type Props = { labelledBy: string; onEscape: () => void; children: ReactNode }

/** Shared shell: bottom sheet on phones, full-height card on the left on wider screens. */
export default function SidePanel({ labelledBy, onEscape, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onEscape()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onEscape])

  return (
    <aside
      role="dialog"
      aria-labelledby={labelledBy}
      className="detail-panel surface fixed inset-x-0 bottom-0 z-30 max-h-[60%] overflow-y-auto rounded-t-3xl px-6 pt-2 pb-6 sm:absolute sm:inset-x-auto sm:top-22 sm:bottom-4 sm:left-4 sm:max-h-none sm:w-[24rem] sm:rounded-3xl sm:pt-6"
    >
      {/* Grab handle (decorative) on phones */}
      <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-black/15 sm:hidden dark:bg-white/20" aria-hidden="true" />
      {children}
    </aside>
  )
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-neutral-200 dark:hover:bg-white/20"
    >
      <CloseIcon className="size-4" strokeWidth={2.5} />
    </button>
  )
}
