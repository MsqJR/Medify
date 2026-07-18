'use client'

import React, { useEffect, useRef, useState } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

export interface GoogleMapsViewProps {
  latitude: number
  longitude: number
  businessName: string
  zoomLevel?: number
}

export function GoogleMapsView({ latitude, longitude, businessName, zoomLevel = 14 }: GoogleMapsViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setMapError('Google Maps API key not configured')
      return
    }

    setOptions({ key: apiKey, v: 'weekly' })

    importLibrary('maps')
      .then(() => {
        if (!mapContainerRef.current) return
        const position = { lat: latitude, lng: longitude }
        const map = new google.maps.Map(mapContainerRef.current, {
          center: position,
          zoom: zoomLevel,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
        })
        new google.maps.Marker({
          position,
          map,
          title: businessName,
          animation: google.maps.Animation.DROP,
        })
      })
      .catch(() => {
        setMapError('Failed to load Google Maps')
      })
  }, [latitude, longitude, businessName, zoomLevel])

  if (mapError) {
    return (
      <div className="h-64 bg-neutral-light rounded-lg flex items-center justify-center text-center p-6">
        <div>
          <p className="text-neutral-gray font-medium mb-1">{businessName}</p>
          <p className="text-neutral-gray text-sm">
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={mapContainerRef}
      className="h-64 bg-neutral-light rounded-lg z-0"
    />
  )
}
