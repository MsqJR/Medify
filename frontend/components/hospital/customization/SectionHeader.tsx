'use client'

import React from 'react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

export function SectionHeader({
  icon,
  title,
  subtitle,
  expanded,
  onToggle,
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-3 text-left group"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-lg transition-colors group-hover:bg-primary/20">
          {icon}
        </span>
        <div>
          <p className="font-semibold text-neutral-dark text-sm">{title}</p>
          {subtitle && <p className="text-xs text-neutral-gray">{subtitle}</p>}
        </div>
      </div>
      <span className="text-neutral-gray transition-transform">
        {expanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
      </span>
    </button>
  )
}
