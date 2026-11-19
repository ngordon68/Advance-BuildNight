import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import Header from './components/Header'
import { useAuth } from './hooks/useAuth'
import { usePreferencesState } from './hooks/usePreferences'
import AuthPage from './pages/AuthPage'
import MapPage from './pages/MapPage'
import QuestionnairePage from './pages/QuestionnairePage'

/**
 * Sends first-time visitors to the questionnaire before showing the map. Waits while
 * a signed-in user's saved answers are loading, so they aren't asked again.
 */
function RequirePreferences({ children }: { children: ReactNode }) {
  const { prefs, syncing } = usePreferencesState()
  const { ready } = useAuth()
  if (prefs) return children
  if (!ready || syncing) {
    return (
      <div className="grid h-full place-items-center text-sm text-slate-500 dark:text-neutral-400" role="status">
        Loading your interests…
      </div>
    )
  }
  return <Navigate to="/questionnaire" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative h-full overflow-x-hidden">
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <RequirePreferences>
                <MapPage />
              </RequirePreferences>
            }
          />
          <Route path="/questionnaire" element={<QuestionnairePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
