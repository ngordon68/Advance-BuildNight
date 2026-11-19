import { useEffect, useState } from 'react'
import AllergenPicker from './components/AllergenPicker.jsx'
import IngredientInput from './components/IngredientInput.jsx'
import ResultView from './components/ResultView.jsx'
import RecentChecks from './components/RecentChecks.jsx'
import { findMatches } from './lib/highlight.js'
import { getDeviceId, loadSelectedAllergens, saveSelectedAllergens } from './lib/storage.js'
import { fetchRecentChecks } from './lib/supabase.js'

const deviceId = getDeviceId()

function runCheck(text, allergens) {
  if (allergens.length === 0) return { error: 'Select at least one allergen' }
  if (text.trim() === '') return { error: 'Enter some ingredients to check' }
  return findMatches(text, allergens)
}

export default function App() {
  const [selected, setSelected] = useState(loadSelectedAllergens)
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [recent, setRecent] = useState({ status: 'loading', checks: [], error: null })

  useEffect(() => saveSelectedAllergens(selected), [selected])

  useEffect(() => {
    let cancelled = false
    fetchRecentChecks(deviceId)
      .then((checks) => !cancelled && setRecent({ status: 'ready', checks, error: null }))
      .catch((err) => {
        console.error('Failed to load recent checks', err)
        if (!cancelled) setRecent({ status: 'error', checks: [], error: err.message })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleCheck = () => setResult(runCheck(text, selected))

  const handleSelectRecent = (check) => {
    setText(check.food_text)
    setSelected(check.allergens)
    setResult(runCheck(check.food_text, check.allergens))
  }

  return (
    <main className="app">
      <header>
        <h1>Allergy Checker</h1>
        <p className="disclaimer">
          This is a keyword helper, not medical advice. Always read the full label.
        </p>
      </header>

      <AllergenPicker selected={selected} onChange={setSelected} />
      <IngredientInput value={text} onChange={setText} onCheck={handleCheck} />
      <ResultView result={result} />
      <RecentChecks
        status={recent.status}
        checks={recent.checks}
        error={recent.error}
        onSelect={handleSelectRecent}
      />
    </main>
  )
}
