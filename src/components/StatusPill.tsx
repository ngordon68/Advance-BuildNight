import type { ReactNode } from 'react'

/** Small frosted pill for transient map status messages. */
export default function StatusPill({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'error' }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`glass flex items-center gap-2 rounded-full px-4 py-2 text-sm ${tone === 'error' ? 'text-red-700 dark:text-red-300' : ''}`}
    >
      {children}
    </div>
  )
}

export function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-60"
    />
  )
}
