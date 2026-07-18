'use client'

import React, { useState } from 'react'
import { StripeElementsWrapper } from '@/components/ui/StripeElementsWrapper'
import { FawryPaymentInstructions } from '@/components/ui/FawryPaymentInstructions'

export interface CheckoutPaymentSectionProps {
  total: number
  onPaymentComplete: (method: string, paymentRef?: string) => Promise<void>
  isSubmitting: boolean
  setIsSubmitting: (v: boolean) => void
}

export function CheckoutPaymentSection({
  total,
  onPaymentComplete,
  isSubmitting,
  setIsSubmitting,
}: CheckoutPaymentSectionProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'stripe' | 'fawry'>('cash')
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null)
  const [fawryReceipt, setFawryReceipt] = useState<{
    referenceCode: string
    expireAt: number
    paymentInstructions: string
    amount: number
  } | null>(null)
  const [paymentError, setPaymentError] = useState('')

  const handleStripeSuccess = (paymentIntentId: string) => {
    onPaymentComplete('stripe', paymentIntentId)
  }

  const handleStripeFailure = (errorMessage: string) => {
    setPaymentError(errorMessage)
  }

  const handleFawryPayment = async () => {
    setIsSubmitting(true)
    setPaymentError('')
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      const token = localStorage.getItem('access_token')
      const res = await fetch(`${API_URL}/payments/fawry/create-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ amount: total }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as Record<string, unknown>).error as string || 'Failed to create Fawry payment code')
      }
      const data = await res.json()
      setFawryReceipt({
        referenceCode: data.reference_code,
        expireAt: new Date(data.expire_at).getTime(),
        paymentInstructions: data.payment_instructions || 'Pay at any Fawry machine or Fawry outlet using the reference code above.',
        amount: data.amount || total,
      })
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => { setPaymentError(''); setPaymentMethod('cash') }}
          className={`p-4 rounded-lg border-2 transition-colors ${
            paymentMethod === 'cash' ? 'border-primary bg-primary-light' : 'border-neutral-border hover:bg-neutral-light'
          }`}
        >
          <div className="font-medium text-neutral-dark">Cash on Delivery</div>
        </button>
        <button
          type="button"
          onClick={() => { setPaymentError(''); setPaymentMethod('card') }}
          className={`p-4 rounded-lg border-2 transition-colors ${
            paymentMethod === 'card' ? 'border-primary bg-primary-light' : 'border-neutral-border hover:bg-neutral-light'
          }`}
        >
          <div className="font-medium text-neutral-dark">Credit/Debit Card</div>
        </button>
        <button
          type="button"
          onClick={() => { setPaymentError(''); setPaymentMethod('stripe') }}
          className={`p-4 rounded-lg border-2 transition-colors ${
            paymentMethod === 'stripe' ? 'border-primary bg-primary-light' : 'border-neutral-border hover:bg-neutral-light'
          }`}
        >
          <div className="font-medium text-neutral-dark">Stripe</div>
          <div className="text-xs text-neutral-gray mt-1">Pay with card online</div>
        </button>
        <button
          type="button"
          onClick={() => { setPaymentError(''); setPaymentMethod('fawry') }}
          className={`p-4 rounded-lg border-2 transition-colors ${
            paymentMethod === 'fawry' ? 'border-primary bg-primary-light' : 'border-neutral-border hover:bg-neutral-light'
          }`}
        >
          <div className="font-medium text-neutral-dark">Fawry</div>
          <div className="text-xs text-neutral-gray mt-1">Pay via Fawry stores</div>
        </button>
      </div>

      <div className="text-center">
        <span className="text-lg font-semibold text-neutral-dark">
          Total: ${total.toFixed(2)}
        </span>
      </div>

      {paymentMethod === 'cash' && (
        <button
          type="button"
          onClick={() => onPaymentComplete('cash')}
          disabled={isSubmitting}
          className="w-full px-6 py-4 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Placing Order...' : `Place Order - $${total.toFixed(2)}`}
        </button>
      )}

      {paymentMethod === 'card' && (
        <p className="text-sm text-neutral-gray text-center">
          Card details are handled by the parent form.
        </p>
      )}

      {paymentMethod === 'stripe' && stripeClientSecret && (
        <StripeElementsWrapper
          clientSecret={stripeClientSecret}
          amount={total}
          onSuccess={handleStripeSuccess}
          onFailure={handleStripeFailure}
        />
      )}

      {paymentMethod === 'stripe' && !stripeClientSecret && (
        <button
          type="button"
          onClick={async () => {
            setIsSubmitting(true)
            setPaymentError('')
            try {
              const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
              const token = localStorage.getItem('access_token')
              const res = await fetch(`${API_URL}/payments/stripe/create-payment-intent/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ amount: Math.round(total * 100) }),
              })
              if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error((data as Record<string, unknown>).error as string || 'Failed to initialize payment')
              }
              const data = await res.json()
              setStripeClientSecret(data.client_secret)
            } catch (err) {
              setPaymentError(err instanceof Error ? err.message : 'Failed to initialize Stripe')
            } finally {
              setIsSubmitting(false)
            }
          }}
          disabled={isSubmitting}
          className="w-full px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Initializing...' : 'Pay with Stripe'}
        </button>
      )}

      {paymentMethod === 'fawry' && fawryReceipt && (
        <FawryPaymentInstructions
          referenceCode={fawryReceipt.referenceCode}
          expireAt={fawryReceipt.expireAt}
          paymentInstructions={fawryReceipt.paymentInstructions}
          amount={fawryReceipt.amount}
        />
      )}

      {paymentMethod === 'fawry' && !fawryReceipt && (
        <button
          type="button"
          onClick={handleFawryPayment}
          disabled={isSubmitting}
          className="w-full px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Generating Code...' : 'Generate Fawry Code'}
        </button>
      )}

      {paymentError && (
        <p className="text-sm text-error text-center">{paymentError}</p>
      )}
    </div>
  )
}
