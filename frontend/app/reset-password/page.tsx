'use client'

import Link from 'next/link'
import React, { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiAlertCircle, FiLock } from 'react-icons/fi'

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

type ValidationState = 'loading' | 'valid' | 'invalid'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const uid = searchParams.get('uid') || ''
  const token = searchParams.get('token') || ''

  const [validationState, setValidationState] = useState<ValidationState>('loading')
  const [validationError, setValidationError] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    let isMounted = true

    const validateToken = async () => {
      if (!uid || !token) {
        if (!isMounted) return
        setValidationState('invalid')
        setValidationError('Reset link is missing required parameters.')
        return
      }

      const response = await authApi.validatePasswordResetToken(uid, token)
      if (!isMounted) return

      if (response.error || !response.data?.valid) {
        setValidationState('invalid')
        setValidationError(response.error || 'Reset link is invalid or has expired.')
        return
      }

      setValidationState('valid')
    }

    validateToken()

    return () => {
      isMounted = false
    }
  }, [uid, token])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError('')

    if (!password) {
      setFormError('Password is required.')
      return
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.')
      return
    }

    if (password !== passwordConfirm) {
      setFormError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    const response = await authApi.resetPassword({
      uid,
      token,
      password,
      password_confirm: passwordConfirm,
    })

    if (response.error) {
      setFormError(response.error)
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
    setIsSuccess(true)

    window.setTimeout(() => {
      router.push('/login')
    }, 1200)
  }

  return (
    <AuthPageLayout>
      <AuthIllustrationPanel
        icon={<FiLock className="text-white" size={80} />}
        title="Create a new password"
        description="Use a strong password you have not used before."
      />

      <AuthCard>
        <AuthCardHeader
          title="Reset Password"
          description="Set your new password to access your account."
        />

        {validationState === 'loading' ? (
          <p className="text-sm text-neutral-gray">Validating your reset link...</p>
        ) : null}

        {validationState === 'invalid' ? (
          <div className="bg-error/10 border border-error rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-error mt-0.5 shrink-0" size={20} />
              <div>
                <p className="text-sm text-error">{validationError}</p>
                <Link href="/forgot-password" className="mt-3 inline-block text-sm text-primary hover:underline">
                  Request a new reset link
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {validationState === 'valid' ? (
          isSuccess ? (
            <AuthSuccessAlert
              message="Password reset successful. Redirecting to login..."
              linkHref="/login"
              linkText="Continue to login"
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && <AuthErrorAlert message={formError} />}

              <Input
                type="password"
                label="New password"
                placeholder="Enter your new password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  if (formError) setFormError('')
                }}
                required
              />

              <Input
                type="password"
                label="Confirm new password"
                placeholder="Confirm your new password"
                value={passwordConfirm}
                onChange={(event) => {
                  setPasswordConfirm(event.target.value)
                  if (formError) setFormError('')
                }}
                required
              />

              <AuthSubmitButton isLoading={isSubmitting} loadingText="Resetting Password..." text="Reset Password" />
            </form>
          )
        ) : null}

        <div className="mt-6 text-center text-sm text-neutral-gray">
          Back to{' '}
          <Link href="/login" className="text-primary hover:underline">
            login
          </Link>
        </div>
      </AuthCard>
    </AuthPageLayout>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
