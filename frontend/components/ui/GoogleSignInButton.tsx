'use client'

import React, { useRef, useEffect, useState } from 'react'
import { loadGoogleIdentityServices } from '@/lib/google-auth-loader'

export interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void
  onError: (errorMsg: string) => void
  isLoading?: boolean
}

export function GoogleSignInButton({ onSuccess, onError, isLoading }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [gisLoaded, setGisLoaded] = useState(false)
  const [gisError, setGisError] = useState<string | null>(null)

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      setGisError('Google Client ID not configured')
      onError('Google Client ID not configured')
      return
    }

    loadGoogleIdentityServices()
      .then((gis) => {
        setGisLoaded(true)
        gis.initialize({
          client_id: clientId,
          callback: (response: { credential?: string }) => {
            if (response.credential) {
              onSuccess(response.credential)
            } else {
              onError('No credential returned from Google')
            }
          },
        })
        if (containerRef.current) {
          gis.renderButton(containerRef.current, {
            type: 'standard',
            shape: 'rectangular',
            theme: 'outline',
            text: 'signin_with',
            size: 'large',
            width: containerRef.current.offsetWidth || 300,
          })
        }
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Failed to load Google Sign-In'
        setGisError(msg)
        onError(msg)
      })
  }, [onSuccess, onError])

  if (gisError) {
    return (
      <div className="text-error text-sm text-center p-3 border border-error/20 rounded-lg bg-error/5">
        {gisError}
      </div>
    )
  }

  return (
    <div className="w-full flex justify-center min-h-[40px]">
      {!gisLoaded && !gisError && (
        <div className="text-neutral-gray text-sm py-2">
          {isLoading ? 'Signing in...' : 'Loading Google Sign-In...'}
        </div>
      )}
      <div ref={containerRef} id="google-signin-btn" className={gisLoaded ? '' : 'hidden'} />
    </div>
  )
}
