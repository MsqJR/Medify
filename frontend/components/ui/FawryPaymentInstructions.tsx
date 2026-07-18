'use client'

import React, { useState, useEffect } from 'react'
import { FiCopy, FiCheck } from 'react-icons/fi'

export interface FawryPaymentInstructionsProps {
  referenceCode: string
  expireAt: number
  paymentInstructions: string
  amount: number
}

export function FawryPaymentInstructions({
  referenceCode,
  expireAt,
  paymentInstructions,
  amount,
}: FawryPaymentInstructionsProps) {
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(Math.max(0, expireAt - Date.now()))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, expireAt - Date.now()))
    }, 1000)
    return () => clearInterval(interval)
  }, [expireAt])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referenceCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
    }
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const isExpired = timeLeft <= 0

  return (
    <div className="border border-neutral-border rounded-lg p-6 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-neutral-dark mb-1">Fawry Payment</h3>
        <p className="text-sm text-neutral-gray">Pay using Fawry stores or online banking</p>
      </div>

      <div className="bg-primary-light/50 rounded-lg p-4 text-center space-y-2">
        <p className="text-sm text-neutral-gray">Reference Code</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl font-bold text-primary tracking-widest font-mono">
            {referenceCode}
          </span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-primary/10 transition"
            title="Copy reference code"
          >
            {copied ? <FiCheck className="text-success" /> : <FiCopy className="text-primary" />}
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-neutral-gray text-sm">Amount</span>
        <span className="text-lg font-semibold text-neutral-dark">
          EGP {amount.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-neutral-gray text-sm">Code expires in</span>
        <span className={`font-mono text-sm font-medium ${isExpired ? 'text-error' : 'text-neutral-dark'}`}>
          {isExpired ? 'Expired' : formatTime(timeLeft)}
        </span>
      </div>

      <div className="border-t border-neutral-border pt-4">
        <h4 className="text-sm font-medium text-neutral-dark mb-2">Payment Instructions</h4>
        <p className="text-sm text-neutral-gray whitespace-pre-line">{paymentInstructions}</p>
      </div>

      {isExpired && (
        <div className="bg-error/5 border border-error/20 rounded-lg p-3 text-error text-sm text-center">
          This payment code has expired. Please generate a new one.
        </div>
      )}
    </div>
  )
}
