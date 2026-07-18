'use client'

import React from 'react'
import type { ThemeSettings } from './types'

export function ThemePreview({ theme, hospitalName }: { theme: ThemeSettings; hospitalName: string }) {
  const fontUrl = theme.fontFamily
    ? `https://fonts.googleapis.com/css2?family=${theme.fontFamily.replace(/ /g, '+')}:wght@400;600;700&display=swap`
    : null

  const safeRadius = theme.borderRadius || '0.5rem'
  const safeFontSize = theme.fontSize || '16px'
  const safeFontStyle = theme.fontStyle || 'normal'

  return (
    <div
      className="rounded-xl overflow-hidden border border-neutral-border shadow-lg text-sm"
      style={{
        backgroundColor: theme.backgroundColor || '#f8fafc',
        fontFamily: `'${theme.fontFamily || 'Inter'}', sans-serif`,
        fontSize: safeFontSize,
        fontStyle: safeFontStyle,
        color: theme.textColor || '#0f172a',
      }}
    >
      {fontUrl && <link href={fontUrl} rel="stylesheet" />}

      {/* Header bar */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: theme.surfaceColor || '#ffffff', borderBottom: `1px solid ${theme.borderColor || '#e2e8f0'}` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ backgroundColor: theme.buttonPrimaryColor || '#2563eb', color: theme.buttonPrimaryTextColor || '#ffffff', borderRadius: '9999px' }}
          >
            {(hospitalName || 'H')[0].toUpperCase()}
          </div>
          <span className="font-bold text-xs" style={{ color: theme.textColor }}>{hospitalName || 'My Hospital'}</span>
        </div>
        <nav className="flex items-center gap-3 text-[10px]">
          {['Home', 'Doctors', 'Contact'].map((item) => (
            <span key={item} className="cursor-pointer" style={{ color: theme.mutedTextColor }}>{item}</span>
          ))}
          <span
            className="px-2.5 py-1 text-[10px] font-semibold"
            style={{
              backgroundColor: theme.buttonPrimaryColor || '#2563eb',
              color: theme.buttonPrimaryTextColor || '#ffffff',
              borderRadius: safeRadius,
            }}
          >
            Book
          </span>
        </nav>
      </div>

      {/* Hero section */}
      <div
        className="px-4 py-5"
        style={{ backgroundColor: theme.surfaceAltColor || '#f1f5f9' }}
      >
        <div
          className="text-[11px] font-semibold uppercase tracking-widest mb-1"
          style={{ color: theme.linkColor || theme.primaryColor || '#2563eb' }}
        >
          Welcome
        </div>
        <h1
          className="text-base font-bold leading-snug mb-2"
          style={{ color: theme.textColor, fontFamily: `'${theme.fontFamily || 'Inter'}', sans-serif` }}
        >
          Expert Medical Care
        </h1>
        <p className="text-[11px] leading-relaxed mb-3" style={{ color: theme.mutedTextColor }}>
          Compassionate care with modern clinical excellence. Book your appointment today.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-1.5 text-[10px] font-semibold transition-colors"
            style={{
              backgroundColor: theme.buttonPrimaryColor || '#2563eb',
              color: theme.buttonPrimaryTextColor || '#ffffff',
              borderRadius: safeRadius,
            }}
          >
            Book Appointment
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-[10px] font-semibold border transition-colors"
            style={{
              backgroundColor: theme.buttonSecondaryColor || '#ffffff',
              color: theme.buttonSecondaryTextColor || '#1d4ed8',
              borderColor: theme.buttonSecondaryBorderColor || '#bfdbfe',
              borderRadius: safeRadius,
            }}
          >
            Our Doctors
          </button>
        </div>
      </div>

      {/* Cards row */}
      <div className="px-4 py-4 grid grid-cols-3 gap-2">
        {['Cardiology', 'Neurology', 'Orthopedics'].map((dept) => (
          <div
            key={dept}
            className="p-2.5 rounded text-center"
            style={{
              backgroundColor: theme.surfaceColor || '#ffffff',
              border: `1px solid ${theme.borderColor || '#e2e8f0'}`,
              borderRadius: safeRadius,
            }}
          >
            <div className="text-[10px] font-semibold mb-0.5" style={{ color: theme.textColor }}>{dept}</div>
            <div className="text-[9px]" style={{ color: theme.mutedTextColor }}>Specialists</div>
          </div>
        ))}
      </div>

      {/* Input preview */}
      <div className="px-4 pb-4">
        <input
          type="text"
          readOnly
          placeholder="Search for a doctor..."
          className="w-full text-[10px] px-3 py-2 outline-none"
          style={{
            backgroundColor: theme.inputBackgroundColor || '#f8fafc',
            border: `1px solid ${theme.inputBorderColor || '#cbd5e1'}`,
            color: theme.textColor,
            borderRadius: safeRadius,
          }}
        />
      </div>

      {/* Footer strip */}
      <div
        className="px-4 py-2 text-[9px] text-center"
        style={{ backgroundColor: '#0f172a', color: '#94a3b8' }}
      >
        &copy; {new Date().getFullYear()} {hospitalName || 'My Hospital'} &middot; All rights reserved
      </div>
    </div>
  )
}
