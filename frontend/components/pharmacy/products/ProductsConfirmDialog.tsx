'use client'

import React from 'react'
import { FiAlertTriangle } from 'react-icons/fi'
import type { ConfirmDialog } from '@/lib/pharmacy/productsUtils'

type ProductsConfirmDialogProps = {
  dialog: ConfirmDialog
  onClose: () => void
}

export function ProductsConfirmDialog({ dialog, onClose }: ProductsConfirmDialogProps) {
  if (!dialog.open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-neutral-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className={`h-1 w-full ${dialog.danger ? 'bg-gradient-to-r from-red-400 to-rose-500' : 'bg-gradient-to-r from-primary to-primary/70'}`} />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-full ${
              dialog.danger ? 'bg-red-50 text-red-500' : 'bg-primary-light text-primary'
            }`}>
              <FiAlertTriangle size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-neutral-dark leading-tight">{dialog.title}</h3>
              <p className="mt-1.5 text-sm text-neutral-gray leading-relaxed">{dialog.message}</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { onClose(); dialog.onConfirm() }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all ${
                dialog.danger
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-sm shadow-red-200'
                  : 'bg-gradient-to-r from-primary to-primary/80 hover:opacity-90'
              }`}
            >
              {dialog.confirmLabel || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
