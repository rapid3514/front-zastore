import { useState } from 'react'
import { Edit3, Ruler } from 'lucide-react'
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
  const isPreset = DEFAULT_SIZES.includes(value as (typeof DEFAULT_SIZES)[number])
  const [isCustom, setIsCustom] = useState(!isPreset && Boolean(value))

  function handleSelectPreset(size: string) {
    setIsCustom(false)
    onChange(size)
    telegramHaptic('light')
  }

  function handleToggleCustom() {
    setIsCustom((prev) => {
      const next = !prev
      if (next && isPreset) onChange('')
      if (!next && !value) onChange('M')
      return next
    })
    telegramHaptic('light')
  }

  return (
    <div className={`shop-size-selector ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
          <Ruler className="size-3.5 text-[var(--shop-accent-strong)]" />
          <span>{label}:</span>
          {value ? (
            <span className="inline-flex items-center rounded-md bg-pink-100 px-2 py-0.5 text-xs font-black text-pink-700 dark:bg-pink-900/50 dark:text-pink-200">
              {value}
            </span>
          ) : (
            <span className="font-normal text-slate-400">tanlanmagan</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleToggleCustom}
          className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition-colors ${
            isCustom
              ? 'bg-pink-100/80 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300'
              : 'text-slate-500 hover:bg-white/50 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-white/10'
          }`}
        >
          <Edit3 className="size-3" />
          {isCustom ? 'Standart o‘lchamlar' : 'Boshqa kiritish'}
        </button>
      </div>

      <div
        className="mt-2.5 grid grid-cols-7 gap-1.5 sm:gap-2"
        role="radiogroup"
        aria-label={label}
      >
        {DEFAULT_SIZES.map((size) => {
          const selected = !isCustom && value === size
          return (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => handleSelectPreset(size)}
              className={`shop-size-pill ${selected ? 'shop-size-pill-active' : ''}`}
            >
              {size}
            </button>
          )
        })}
      </div>

      {isCustom ? (
        <div className="shop-field mt-2.5">
          <input
            type="text"
            maxLength={30}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Razmerni yozing (masalan: 38, 42 yoki Standart)..."
            className="shop-input text-xs"
            autoFocus
          />
        </div>
      ) : null}
    </div>
  )
}
