import { useEffect, useState } from 'react'
import AllergenPicker from './components/AllergenPicker.jsx'
import IngredientInput from './components/IngredientInput.jsx'
import ResultView from './components/ResultView.jsx'
import RecentChecks from './components/RecentChecks.jsx'
import { findMatches } from './lib/highlight.js'
import { loadSelectedAllergens, saveSelectedAllergens } from './lib/storage.js'

// Phase 2 placeholder data, shaped like rows of the `checks` table.
// Replaced by a Supabase fetch in Phase 3.
const FAKE_CHECKS = [
  {
    id: 'fake-1',
    created_at: '2026-11-19T12:30:00Z',
    food_text: 'Whey protein, sugar, peanut oil, soy lecithin',
    allergens: ['milk', 'peanuts'],
    flagged_terms: ['whey', 'peanut oil'],
  },
  {
    id: 'fake-2',
    created_at: '2026-11-18T18:05:00Z',
    food_text: 'Eggplant, olive oil, garlic, salt',
    allergens: ['eggs'],
    flagged_terms: [],
  },
  {
    id: 'fake-3',
    created_at: '2026-11-17T09:15:00Z',
    food_text: 'Enriched wheat flour, sesame seeds, butter, sodium caseinate',
    allergens: ['wheat', 'sesame', 'milk'],
    flagged_terms: ['caseinate', 'butter', 'wheat', 'flour', 'sesame'],
  },
]

function runCheck(text, allergens) {
  if (allergens.length === 0) return { error: 'Select at least one allergen' }
  if (text.trim() === '') return { error: 'Enter some ingredients to check' }
  return findMatches(text, allergens)
}

export default function App() {
  const [selected, setSelected] = useState(loadSelectedAllergens)
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => saveSelectedAllergens(selected), [selected])

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
      <RecentChecks checks={FAKE_CHECKS} onSelect={handleSelectRecent} />
    </main>
  )
}
