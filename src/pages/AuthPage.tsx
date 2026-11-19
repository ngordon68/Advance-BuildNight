import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { signIn, signUp, useAuth } from '../hooks/useAuth'

type Mode = 'signin' | 'signup'
const MIN_PASSWORD = 8

const inputClass =
  'mt-1 w-full rounded-xl border border-black/10 bg-white/80 px-3.5 py-2.5 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30 dark:border-white/15 dark:bg-white/5'

export default function AuthPage() {
  const { user, configured } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  // Already signed in (or just signed in) → back to the map.
  if (user) return <Navigate to="/" replace />

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
    setNotice(null)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotice(null)
    if (mode === 'signup' && password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`)
      return
    }
    setBusy(true)
    if (mode === 'signin') {
      const { error } = await signIn(email.trim(), password)
      setBusy(false)
      if (error) setError(error)
      else navigate('/')
    } else {
      const { error, needsConfirmation } = await signUp(email.trim(), password)
      setBusy(false)
      if (error) setError(error)
      else if (needsConfirmation) {
        setNotice('Check your email to confirm your account, then sign in.')
        setMode('signin')
        setPassword('')
      } else navigate('/')
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-teal-50 to-slate-100 px-4 pt-24 pb-10 dark:from-neutral-900 dark:to-neutral-950">
      <div className="glass mx-auto max-w-sm rounded-3xl p-6">
        <div role="tablist" aria-label="Account" className="grid grid-cols-2 rounded-xl bg-black/5 p-1 dark:bg-white/10">
          {(['signin', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={`rounded-lg py-1.5 text-sm font-medium transition ${
                mode === m ? 'bg-white shadow-sm dark:bg-neutral-700' : 'text-slate-600 dark:text-neutral-400'
              }`}
            >
              {m === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        <h2 className="mt-5 text-2xl font-semibold tracking-tight">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">
          {mode === 'signin'
            ? 'Sign in to sync your interests and favorites.'
            : 'Save your interests and favorite places across devices.'}
        </p>

        {!configured && (
          <p className="mt-4 rounded-xl bg-amber-500/15 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
            Sign-in isn’t set up yet. Add your Supabase URL and anon key to <code>.env.local</code> and restart the
            dev server.
          </p>
        )}

        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              type="password"
              required
              minLength={mode === 'signup' ? MIN_PASSWORD : undefined}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            {mode === 'signup' && (
              <span className="mt-1 block text-xs font-normal text-slate-500 dark:text-neutral-400">
                At least {MIN_PASSWORD} characters.
              </span>
            )}
          </label>

          {error && (
            <p role="alert" className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="rounded-xl bg-teal-500/10 px-3 py-2 text-sm text-teal-800 dark:text-teal-300">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !configured}
            className="w-full rounded-xl bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
