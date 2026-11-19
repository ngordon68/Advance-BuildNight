import { Link, useLocation } from 'react-router'
import { signOut, useAuth } from '../hooks/useAuth'

const textButton =
  'rounded-xl px-2.5 py-1.5 text-sm font-medium text-teal-700 transition hover:bg-teal-600/10 dark:text-teal-400'

/** Floating frosted-glass bar that sits over the page, Apple Maps style. */
export default function Header() {
  const { pathname } = useLocation()
  const { ready, user } = useAuth()
  const onMap = pathname === '/'

  return (
    <header className="glass pointer-events-auto absolute inset-x-4 top-4 z-20 mx-auto flex h-12 max-w-xl items-center justify-between gap-2 rounded-2xl pr-2 pl-4">
      <Link to="/" className="flex shrink-0 items-center gap-2 text-[17px] font-semibold tracking-tight">
        <span className="grid size-7 place-items-center rounded-full bg-teal-600 text-white shadow-sm" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
            <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
          </svg>
        </span>
        <span className="hidden min-[400px]:inline">Nearby Gems</span>
      </Link>

      <nav className="flex min-w-0 items-center gap-1">
        {onMap && (
          <Link to="/questionnaire" className={textButton}>
            <span className="sm:hidden">Interests</span>
            <span className="hidden sm:inline">Edit interests</span>
          </Link>
        )}
        {ready && user && (
          <>
            <span
              className="hidden max-w-[11rem] truncate text-sm text-slate-500 sm:inline dark:text-neutral-400"
              title={user.email}
            >
              {user.email}
            </span>
            <span
              className="grid size-7 shrink-0 place-items-center rounded-full bg-slate-200 text-xs font-semibold uppercase sm:hidden dark:bg-neutral-700"
              title={user.email}
              aria-hidden="true"
            >
              {user.email?.[0]}
            </span>
            <button type="button" onClick={() => void signOut()} className={textButton}>
              Sign out
            </button>
          </>
        )}
        {ready && !user && pathname !== '/auth' && (
          <Link to="/auth" className={`${textButton} bg-teal-600/10`}>
            Sign in
          </Link>
        )}
      </nav>
    </header>
  )
}
