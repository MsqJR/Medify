import React from 'react'

export function SettingsCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-xl border border-neutral-border bg-white p-5 shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  )
}
