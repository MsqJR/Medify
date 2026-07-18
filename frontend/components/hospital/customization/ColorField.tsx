'use client'

import React, { useState, useEffect } from 'react'

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

function isValidHex(val: string) {
  return HEX_RE.test(val)
}

export function ColorField({
  label,
  value = '#000000',
  onChange,
  disabled,
  hint,
}: {
  label: string
  value?: string
  onChange: (v: string) => void
  disabled?: boolean
  hint?: string
}) {
  const [text, setText] = useState(value)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setText(value)
    setHasError(false)
  }, [value])

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setText(v)
    if (isValidHex(v)) {
      setHasError(false)
      onChange(v)
    } else {
      setHasError(true)
    }
  }

  const handleColorPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setText(v)
    setHasError(false)
    onChange(v)
  }

  const safeValue = isValidHex(value) ? value : '#000000'

  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-gray uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {hint && <p className="text-xs text-neutral-gray mb-1.5 -mt-1">{hint}</p>}
      <div className="flex items-center gap-2">
        <div className="relative shrink-0">
          <input
            type="color"
            value={safeValue}
            onChange={handleColorPick}
            disabled={disabled}
            className="h-10 w-10 cursor-pointer rounded-lg border-2 border-neutral-border p-0.5 bg-white disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-primary"
            style={{ appearance: 'none' }}
          />
        </div>
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          disabled={disabled}
          placeholder="#000000"
          maxLength={7}
          className={`min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm font-mono transition-all outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${
            hasError
              ? 'border-error bg-red-50 focus:ring-error'
              : 'border-neutral-border bg-white focus:border-primary'
          }`}
        />
        <div
          className="h-10 w-10 rounded-lg border border-neutral-border shrink-0 shadow-inner"
          style={{ backgroundColor: safeValue }}
        />
      </div>
      {hasError && (
        <p className="mt-1 text-xs text-error">Enter a valid hex color (e.g. #2563eb)</p>
      )}
    </div>
  )
}
