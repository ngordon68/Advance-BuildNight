import { ALLERGEN_IDS } from './allergens.js'

const ALLERGENS_KEY = 'allergy-checker:allergens'

export function loadSelectedAllergens() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ALLERGENS_KEY))
    return Array.isArray(parsed) ? parsed.filter((id) => ALLERGEN_IDS.includes(id)) : []
  } catch {
    return []
  }
}

export function saveSelectedAllergens(ids) {
  try {
    localStorage.setItem(ALLERGENS_KEY, JSON.stringify(ids))
  } catch {
    // Storage can be unavailable (private mode, blocked site data). The app still works.
  }
}
