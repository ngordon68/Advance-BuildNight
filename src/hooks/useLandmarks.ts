import { useCallback, useEffect, useState } from 'react'
import { findLandmarks, type LandmarkResult } from '../lib/landmarks'
import type { LatLon, Preferences } from '../types'

export type LandmarksState =
  | { status: 'idle' }
  | { status: 'loading' }
  | ({ status: 'success' } & LandmarkResult)
  | { status: 'error' }

type Request = { center: LatLon; prefs: Preferences; attempt: number }
type Settled = { request: Request; state: Extract<LandmarksState, { status: 'success' | 'error' }> }

const sameRequest = (a: Request, b: Request) => a.center === b.center && a.prefs === b.prefs && a.attempt === b.attempt

/** Loads landmarks whenever the search center or preferences change. */
export function useLandmarks(center: LatLon | null, prefs: Preferences | null) {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled | null>(null)

  useEffect(() => {
    if (!center || !prefs) return
    const request: Request = { center, prefs, attempt }
    const ctrl = new AbortController()
    findLandmarks(prefs, center, ctrl.signal).then(
      (result) => setSettled({ request, state: { status: 'success', ...result } }),
      (err) => {
        if (ctrl.signal.aborted) return
        console.error('Could not load landmarks:', err)
        setSettled({ request, state: { status: 'error' } })
      },
    )
    return () => ctrl.abort()
  }, [center, prefs, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  // "Loading" is derived: we have inputs but no settled result for exactly these inputs yet.
  let state: LandmarksState
  if (!center || !prefs) state = { status: 'idle' }
  else if (settled && sameRequest(settled.request, { center, prefs, attempt })) state = settled.state
  else state = { status: 'loading' }

  return { state, retry }
}
