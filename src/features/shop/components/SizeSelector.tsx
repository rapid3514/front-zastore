import { useState } from 'react'
import { Check, Edit3 } from 'lucide-react'
import { telegramHaptic } from '@/shared/telegram/telegram'

export const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const

interface SizeSelectorProps {
  value: string
  onChange: (size: string) => void
  label?: string
  className?: string
}

export function SizeSelector({
  value,
  onChange,
  label = 'O‘lcham (Razmer)',
  className = '',
}: SizeSelectorProps) {
  const isPreset = DEFAULT_SIZES.includes(value as typeof DEFAULT_SIZES[number])
  const [isCustom, setIsCustom] = useState(!isPreset && Boolean(value))

  function handleSelectPreset(size: string) {
    setIsCustom(false)
    onChange(size)
    telegramHaptic('light')
  }

  function handleToggleCustom() {
    setIsCustom(true)
    if (isPreset) onChange('')
    telegramHaptic('light')
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
        <span className="flex items-center gap-1.5">
          <span>{label}:</span>
          {value ? (
            <span className="rounded-md bg-pink-100 px-2 py-0.5 text-xs font-extrabold text-pink-700 dark:bg-pink-900/50 dark:text-pink-300">
              {value}
            </span>
          ) : (
            <span className="text-slate-400 font-normal">tanlanmagan</span>
          )}
        </span>
        <button
          type="button"
          onClick={handleToggleCustom}
          className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${
            isCustom
              ? 'text-pink-600 dark:text-pink-400 underline'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Edit3 className="size-3" />
          {isCustom ? 'Boshqa razmer' : 'Boshqa kiritish'}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={label}>
        {DEFAULT_SIZES.map((size) => {
          const selected = !isCustom && value === size
          return (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => handleSelectPreset(size)}
              className={`relative flex min-w-[2.75rem] items-center justify-center rounded-xl px-3 py-2 text-xs font-black transition-all ${
                selected
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25 scale-[1.03] ring-2 ring-pink-400/50'
                  : 'border border-[var(--app-border)] bg-white/60 text-slate-700 hover:border-pink-300 hover:bg-white dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {selected ? <Check className="mr-1 size-3 stroke-[3]" /> : null}
              {size}
            </button>
          )
        })}
      </div>

      {isCustom ? (
        <div className="mt-2">
          <input
            type="text"
            maxLength={30}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Razmerni yozing (masalan: 38, 42 yoki Standard)..."
            className="shop-input text-xs"
            autoFocus
          />
        </div>
      ) : null}
    </div>
  )
}
