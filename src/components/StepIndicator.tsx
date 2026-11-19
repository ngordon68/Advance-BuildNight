type Props = { step: number; total: number }

export default function StepIndicator({ step, total }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i + 1 === step ? 'w-6 bg-teal-600' : i + 1 < step ? 'w-1.5 bg-teal-600' : 'w-1.5 bg-black/15 dark:bg-white/20'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-slate-500 dark:text-neutral-400">
        Step {step} of {total}
      </span>
    </div>
  )
}
