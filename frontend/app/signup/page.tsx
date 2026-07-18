'use client'

import React, { useState, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { persistAuthSession } from '@/lib/auth'
import { FiHome, FiCheckCircle } from 'react-icons/fi'
import {
  AuthPageLayout,
  AuthIllustrationPanel,
  AuthCard,
  AuthCardHeader,
  AuthErrorAlert,
  AuthSubmitButton,
} from '@/components/auth'

function SignupForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const rawType = searchParams.get('type')
  const type = (rawType === 'hospital' || rawType === 'pharmacy') ? rawType : 'hospital'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessType: type,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setFormData((prev) => ({ ...prev, businessType: type }))
  }, [type])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 
        (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000/api` : 'http://localhost:8000/api')
      const response = await fetch(`${API_URL}/auth/signup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          password_confirm: formData.confirmPassword,
          name: formData.name.trim(),
          business_type: formData.businessType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.email) {
          setErrors({ email: data.email[0] })
        } else if (data.password) {
          setErrors({ password: data.password[0] })
        } else if (data.non_field_errors) {
          setErrors({ submit: data.non_field_errors[0] })
        } else {
          setErrors({ submit: 'Registration failed. Please try again.' })
        }
        return
      }

      persistAuthSession({
        user: data.user,
        tokens: data.tokens,
        websiteSetupId: data.website_setup_id,
      })

      setSuccess(true)
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } catch (error) {
      console.error('Signup error:', error)
      setErrors({ submit: 'Network error. Please check if the backend server is running.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthPageLayout>
      <AuthIllustrationPanel
        icon={<FiHome className="text-white" size={80} />}
        title="Get Started Today"
        description="Join thousands of medical professionals building their online presence"
      />

      <AuthCard>
        <AuthCardHeader
          title="Create Your Account"
          description="Already have an account?"
          linkHref="/login"
          linkText="Sign in"
        />

        {success ? (
          <div className="text-center py-8">
            <FiCheckCircle className="mx-auto text-success mb-4" size={64} />
            <h3 className="text-xl font-semibold text-neutral-dark mb-2">
              Account Created Successfully!
            </h3>
            <p className="text-neutral-gray">
              Redirecting to your dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && <AuthErrorAlert message={errors.submit} />}

            <Select
              label="Business Type"
              options={[
                { value: 'hospital', label: 'Hospital/Clinic' },
                { value: 'pharmacy', label: 'Pharmacy' },
              ]}
              value={formData.businessType}
              onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              required
            />

            <Input
              type="text"
              label="Full Name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                if (errors.name) setErrors({ ...errors, name: '' })
              }}
              error={errors.name}
              required
            />

            <Input
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                if (errors.email) setErrors({ ...errors, email: '' })
              }}
              error={errors.email}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value })
                if (errors.password) setErrors({ ...errors, password: '' })
              }}
              error={errors.password}
              showPasswordToggle
              required
            />

            <Input
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value })
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
              }}
              error={errors.confirmPassword}
              showPasswordToggle
              required
            />

            <AuthSubmitButton isLoading={isLoading} loadingText="Creating Account..." text="Create Account" />
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-gray">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthPageLayout>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupForm />
    </Suspense>
  )
}

