import { useState } from 'react'
import { useNavigate } from 'react-router'
import StepIndicator from '../components/StepIndicator'
import { setPreferences, usePreferences } from '../hooks/usePreferences'
import { CATEGORIES, CATEGORY_IDS, VIBES } from '../lib/categories'
import type { CategoryId, Vibe } from '../types'

const optionBase =
  'flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600'
const optionOff =
  'border-black/10 bg-white/60 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
const optionOn = 'border-teal-600 bg-teal-50 ring-1 ring-teal-600 dark:bg-teal-500/15'

function Check({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-6 shrink-0 place-items-center rounded-full border text-xs text-white transition ${
        on ? 'border-teal-600 bg-teal-600' : 'border-black/20 dark:border-white/25'
      }`}
    >
      {on && '✓'}
    </span>
  )
}

export default function QuestionnairePage() {
  const saved = usePreferences()
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [categories, setCategories] = useState<CategoryId[]>(saved?.categories ?? [])
  const [vibe, setVibe] = useState<Vibe | null>(saved?.vibe ?? null)

  const toggle = (id: CategoryId) =>
    setCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))

  const finish = () => {
    if (!vibe || categories.length === 0) return
    // Keep a stable order regardless of click order.
    setPreferences({ categories: CATEGORY_IDS.filter((id) => categories.includes(id)), vibe })
    navigate('/')
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-teal-50 to-slate-100 px-4 pt-24 pb-10 dark:from-neutral-900 dark:to-neutral-950">
      <div className="glass mx-auto max-w-md rounded-3xl p-6">
        <StepIndicator step={step} total={2} />

        {step === 1 ? (
          <section aria-labelledby="q1">
            <h2 id="q1" className="mt-4 text-2xl font-semibold tracking-tight">
              What do you enjoy exploring?
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">Pick as many as you like.</p>

            <div className="mt-5 space-y-3" role="group" aria-labelledby="q1">
              {CATEGORIES.map((c) => {
                const on = categories.includes(c.id)
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(c.id)}
                    className={`${optionBase} ${on ? optionOn : optionOff}`}
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {c.emoji}
                    </span>
                    <span className="flex-1">
                      <span className="block font-medium">{c.label}</span>
                      <span className="block text-sm text-slate-500 dark:text-neutral-400">{c.description}</span>
                    </span>
                    <Check on={on} />
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              disabled={categories.length === 0}
              onClick={() => setStep(2)}
              className="mt-6 w-full rounded-xl bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/40 dark:disabled:bg-white/10 dark:disabled:text-white/40"
            >
              Next
            </button>
            {categories.length === 0 && (
              <p className="mt-2 text-center text-xs text-slate-500 dark:text-neutral-400">Pick at least one</p>
            )}
          </section>
        ) : (
          <section aria-labelledby="q2">
            <h2 id="q2" className="mt-4 text-2xl font-semibold tracking-tight">
              What's the vibe today?
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">We'll tune your places to match.</p>

            <div className="mt-5 space-y-3" role="radiogroup" aria-labelledby="q2">
              {VIBES.map((v) => {
                const on = vibe === v.id
                return (
                  <button
                    key={v.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setVibe(v.id)}
                    className={`${optionBase} ${on ? optionOn : optionOff}`}
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {v.emoji}
                    </span>
                    <span className="flex-1">
                      <span className="block font-medium">{v.label}</span>
                      <span className="block text-sm text-slate-500 dark:text-neutral-400">{v.description}</span>
                    </span>
                    <Check on={on} />
                  </button>
                )
              })}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl px-5 py-3 font-semibold text-teal-700 transition hover:bg-teal-600/10 dark:text-teal-400"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!vibe}
                onClick={finish}
                className="flex-1 rounded-xl bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/40 dark:disabled:bg-white/10 dark:disabled:text-white/40"
              >
                Show my map
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
