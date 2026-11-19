import { Link, useLocation } from 'react-router'
import { signOut, useAuth } from '../hooks/useAuth'
import { GemIcon, SlidersIcon } from './icons'

const navButton =
  'flex items-center gap-2 rounded-xl px-3 py-2 text-[15px] font-medium transition hover:bg-black/5 dark:hover:bg-white/10'
const accentButton =
  'rounded-xl px-3 py-2 text-[15px] font-semibold text-blue-600 transition hover:bg-blue-600/10 dark:text-blue-400'

/** Full-width floating bar over the map. */
export default function Header() {
  const { pathname } = useLocation()
  const { ready, user } = useAuth()
  const onMap = pathname === '/'

  return (
    <header className="surface pointer-events-auto absolute inset-x-4 top-4 z-20 flex h-14 items-center justify-between gap-2 rounded-2xl pr-3 pl-4">
      <Link to="/" className="flex shrink-0 items-center gap-2.5 text-lg font-semibold tracking-tight">
        <span className="grid size-8 place-items-center rounded-lg bg-teal-700 text-white" aria-hidden="true">
          <GemIcon className="size-[18px]" />
        </span>
        <span className="hidden min-[400px]:inline">Nearby Gems</span>
      </Link>

      <nav className="flex min-w-0 items-center gap-1">
        {onMap && (
          <Link to="/questionnaire" className={navButton} aria-label="Edit interests">
            <SlidersIcon className="size-[18px]" />
            <span className="hidden sm:inline">Edit interests</span>
          </Link>
        )}
        {ready && user && (
          <>
            <span className="mx-2 hidden h-6 w-px bg-black/10 sm:block dark:bg-white/15" aria-hidden="true" />
            <span
              className="hidden max-w-[14rem] truncate text-sm text-slate-500 sm:inline dark:text-neutral-400"
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
            <button type="button" onClick={() => void signOut()} className={accentButton}>
              Sign out
            </button>
          </>
        )}
        {ready && !user && pathname !== '/auth' && (
          <Link to="/auth" className={accentButton}>
            Sign in
          </Link>
        )}
      </nav>
    </header>
  )
}
