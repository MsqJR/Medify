'use client'

import React, { useState, useEffect } from 'react'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

export interface StripeElementsWrapperProps {
  clientSecret: string
  amount: number
  onSuccess: (paymentIntentId: string) => void
  onFailure: (errorMessage: string) => void
}

function StripePaymentForm({ onSuccess, onFailure }: Pick<StripeElementsWrapperProps, 'onSuccess' | 'onFailure'>) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    setErrorMessage(null)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required',
    })

    if (error) {
      const msg = error.message || 'Payment failed'
      setErrorMessage(msg)
      onFailure(msg)
      setIsProcessing(false)
      return
    }

    if (paymentIntent?.id) {
      onSuccess(paymentIntent.id)
    }
    setIsProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {errorMessage && (
        <p className="text-error text-sm">{errorMessage}</p>
      )}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-primary text-white rounded-lg py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            Processing...
          </span>
        ) : (
          'Pay Now'
        )}
      </button>
    </form>
  )
}

function StripeLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-neutral-light rounded-lg" />
      <div className="h-10 bg-neutral-light rounded-lg" />
      <div className="h-12 bg-neutral-light rounded-lg" />
    </div>
  )
}

export function StripeElementsWrapper({ clientSecret, amount, onSuccess, onFailure }: StripeElementsWrapperProps) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <StripeLoadingSkeleton />

  if (!stripePromise) {
    return (
      <div className="p-4 border border-error/20 rounded-lg bg-error/5 text-error text-sm text-center">
        Stripe is not configured. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment.
      </div>
    )
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3b82f6',
        colorBackground: '#ffffff',
        colorText: '#1e293b',
        borderRadius: '8px',
      },
    },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-neutral-dark">
        </span>
        <span className="text-neutral-gray text-sm">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)}
        </span>
      </div>
      <Elements stripe={stripePromise} options={options}>
        <StripePaymentForm onSuccess={onSuccess} onFailure={onFailure} />
      </Elements>
    </div>
  )
}
