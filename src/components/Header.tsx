import { Link, useLocation } from 'react-router'

/** Floating frosted-glass bar that sits over the page, Apple Maps style. */
export default function Header() {
  const { pathname } = useLocation()
  const onMap = pathname === '/'

  return (
    <header className="glass pointer-events-auto absolute inset-x-4 top-4 z-20 mx-auto flex h-12 max-w-md items-center justify-between rounded-2xl pr-2 pl-4">
      <Link to="/" className="flex items-center gap-2 text-[17px] font-semibold tracking-tight">
        <span className="grid size-7 place-items-center rounded-full bg-teal-600 text-white shadow-sm" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
            <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
          </svg>
        </span>
        Nearby Gems
      </Link>
      {onMap && (
        <Link
          to="/questionnaire"
          className="rounded-xl px-3 py-1.5 text-sm font-medium text-teal-700 transition hover:bg-teal-600/10 dark:text-teal-400"
        >
          Edit interests
        </Link>
      )}
    </header>
  )
}
