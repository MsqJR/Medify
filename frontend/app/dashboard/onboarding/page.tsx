'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { persistAuthSession } from '@/lib/auth'
import { authApi } from '@/lib/api'
import { FiCheckCircle } from 'react-icons/fi'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [businessType, setBusinessType] = useState<'hospital' | 'pharmacy' | null>(null)
  const [subdomain, setSubdomain] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    const userRaw = localStorage.getItem('user')
    if (!userRaw) {
      router.push('/login')
      return
    }
    try {
      const user = JSON.parse(userRaw)
      if (user.is_onboarding_completed !== false) {
        router.push('/dashboard')
      }
    } catch {
      router.push('/login')
    }
  }, [router])

  const handleTypeSelect = (type: 'hospital' | 'pharmacy') => {
    setBusinessType(type)
    setStep(1)
  }

  const handleComplete = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ||
        (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000/api` : 'http://localhost:8000/api')
      const token = localStorage.getItem('access_token')

      const res = await fetch(`${API_URL}/business-info/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          business_type: businessType,
          subdomain: subdomain || undefined,
          name: businessName || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError((data as Record<string, unknown>).error as string || 'Failed to save onboarding info')
        return
      }

      const userRaw = localStorage.getItem('user')
      if (userRaw) {
        const user = JSON.parse(userRaw)
        user.is_onboarding_completed = true
        user.business_type = businessType
        localStorage.setItem('user', JSON.stringify(user))
      }

      setCompleted(true)
      setTimeout(() => router.push('/dashboard/business-info'), 2000)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <FiCheckCircle className="mx-auto text-success mb-4" size={64} />
          <h1 className="text-2xl font-bold text-neutral-dark mb-2">Onboarding Complete!</h1>
          <p className="text-neutral-gray">Redirecting you to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-dark mb-2">Welcome to Medify</h1>
          <p className="text-neutral-gray">Let&apos;s get your medical website set up</p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error rounded-lg p-4 mb-6 text-error text-sm">
            {error}
          </div>
        )}

        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-neutral-dark text-center mb-4">
              What type of business do you have?
            </h2>
            <button
              onClick={() => handleTypeSelect('hospital')}
              className="w-full p-6 border-2 border-neutral-border rounded-lg hover:border-primary hover:bg-primary/5 transition text-left"
            >
              <h3 className="text-xl font-semibold text-neutral-dark">Hospital / Clinic</h3>
              <p className="text-neutral-gray text-sm mt-1">Patient management, doctor scheduling, and more</p>
            </button>
            <button
              onClick={() => handleTypeSelect('pharmacy')}
              className="w-full p-6 border-2 border-neutral-border rounded-lg hover:border-primary hover:bg-primary/5 transition text-left"
            >
              <h3 className="text-xl font-semibold text-neutral-dark">Pharmacy</h3>
              <p className="text-neutral-gray text-sm mt-1">Product catalog, online orders, and delivery</p>
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-neutral-dark">Set up your profile</h2>
            <Input
              label="Business Name"
              placeholder="Your business name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
            <Input
              label="Subdomain"
              placeholder="your-business"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value.replace(/[^a-z0-9-]/g, '').toLowerCase())}
            />
            <p className="text-xs text-neutral-gray mt-1">
              Your URL will be: {subdomain || 'your-business'}.localhost:3000
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(0)} disabled={isSubmitting}>
                Back
              </Button>
              <Button variant="primary" onClick={handleComplete} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
