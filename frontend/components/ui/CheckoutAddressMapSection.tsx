'use client'

import React, { useState } from 'react'
import { CheckoutAddressMap } from '@/components/ui/CheckoutAddressMap'

export interface CheckoutAddressMapSectionProps {
  onAddressResolved: (details: {
    latitude: number
    longitude: number
    formattedAddress: string
    street?: string
    city?: string
    postalCode?: string
  }) => void
  isGeocoding: boolean
  onGeocodingStatusChange: (v: boolean) => void
}

export function CheckoutAddressMapSection({
  onAddressResolved,
  isGeocoding,
  onGeocodingStatusChange,
}: CheckoutAddressMapSectionProps) {
  return (
    <div className="space-y-2">
      <CheckoutAddressMap
        onAddressResolved={onAddressResolved}
        onGeocodingStatusChange={onGeocodingStatusChange}
      />
      {isGeocoding && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
          Resolving address...
        </div>
      )}
    </div>
  )
}
