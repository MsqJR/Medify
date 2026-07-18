'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { FiMail } from 'react-icons/fi'

import { Input } from '@/components/ui/Input'
import { authApi } from '@/lib/api'
import {
  AuthPageLayout,
  AuthIllustrationPanel,
  AuthCard,
  AuthCardHeader,
  AuthErrorAlert,
  AuthSubmitButton,
  AuthSuccessAlert,
} from '@/components/auth'

const GENERIC_SUCCESS_MESSAGE = 'If an account exists for this email, a password reset link has been sent.'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    const normalizedEmail = email.trim()

    if (!normalizedEmail) {
      setError('Email is required.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)
    const response = await authApi.forgotPassword(normalizedEmail)

    if (response.error) {
      setError(response.error)
      setIsSubmitting(false)
      return
    }

    setSuccessMessage(response.data?.message || GENERIC_SUCCESS_MESSAGE)
    setIsSubmitting(false)
  }

  return (
    <AuthPageLayout>
      <AuthIllustrationPanel
        icon={<FiMail className="text-white" size={80} />}
        title="Reset your password"
        description="We will send a secure reset link to your account email."
      />

      <AuthCard>
        <AuthCardHeader
          title="Forgot Password"
          description="Enter your account email to receive a password reset link."
        />

        {successMessage ? (
          <AuthSuccessAlert message={successMessage} linkHref="/login" linkText="Return to login" />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <AuthErrorAlert message={error} />}

            <Input
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (error) setError('')
              }}
              required
            />

            <AuthSubmitButton isLoading={isSubmitting} loadingText="Sending Reset Link..." text="Send Reset Link" />
          </form>
        )}

        <div className="mt-6 text-center text-sm text-neutral-gray">
          Remembered your password?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </AuthCard>
    </AuthPageLayout>
  )
}
