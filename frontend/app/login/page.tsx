'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { persistAuthSession } from '@/lib/auth'
import { FiMail, FiLock } from 'react-icons/fi'
import {
  AuthPageLayout,
  AuthIllustrationPanel,
  AuthCard,
  AuthCardHeader,
  AuthErrorAlert,
  AuthSubmitButton,
} from '@/components/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      return
    }

    setIsLoading(true)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 
        (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000/api` : 'http://localhost:8000/api')
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          setErrors({ submit: 'Invalid email or password. Please check your credentials.' })
        } else {
          setErrors({ submit: data.error || 'Something went wrong. Please try again.' })
        }
        return
      }

      persistAuthSession({
        user: data.user,
        tokens: data.tokens,
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ submit: 'Network error. Please check if the backend server is running.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthPageLayout>
      <AuthIllustrationPanel
        icon={<FiMail className="text-white" size={80} />}
        title="Welcome Back"
        description="Sign in to continue building your medical website"
      />

      <AuthCard>
        <AuthCardHeader
          title="Login to Your Account"
          description="Don't have an account?"
          linkHref="/signup"
          linkText="Sign up"
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && <AuthErrorAlert message={errors.submit} />}

          <Input
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors({ ...errors, email: '' })
            }}
            error={errors.email}
            required
          />

          <div>
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors({ ...errors, password: '' })
              }}
              error={errors.password}
              showPasswordToggle
              required
            />
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 text-sm text-neutral-gray">
                <input type="checkbox" className="rounded" />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <AuthSubmitButton isLoading={isLoading} loadingText="Signing In..." text="Sign In" />
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-gray">
            By signing in, you agree to our{' '}
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

