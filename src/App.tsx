import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import Header from './components/Header'
import { usePreferences } from './hooks/usePreferences'
import MapPage from './pages/MapPage'
import QuestionnairePage from './pages/QuestionnairePage'

/** Sends first-time visitors to the questionnaire before showing the map. */
function RequirePreferences({ children }: { children: ReactNode }) {
  const prefs = usePreferences()
  return prefs ? children : <Navigate to="/questionnaire" replace />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
