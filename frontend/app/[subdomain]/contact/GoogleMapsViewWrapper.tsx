'use client'

import React from 'react'
import { GoogleMapsView } from '@/components/ui/GoogleMapsView'

interface GoogleMapsViewWrapperProps {
  latitude: number
  longitude: number
  businessName: string
}

export function GoogleMapsViewWrapper({ latitude, longitude, businessName }: GoogleMapsViewWrapperProps) {
  return <GoogleMapsView latitude={latitude} longitude={longitude} businessName={businessName} />
}
