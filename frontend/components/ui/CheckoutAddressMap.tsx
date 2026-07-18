'use client'

import React, { useEffect, useRef, useState } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

export interface CheckoutAddressMapProps {
  onAddressResolved: (addressDetails: {
    latitude: number
    longitude: number
    formattedAddress: string
    street?: string
    city?: string
    postalCode?: string
  }) => void
  onGeocodingStatusChange: (isGeocoding: boolean) => void
}

export function CheckoutAddressMap({ onAddressResolved, onGeocodingStatusChange }: CheckoutAddressMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  const defaultCenter = { lat: 30.0444, lng: 31.2357 }

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setMapError('Google Maps API key not configured')
      return
    }

    setOptions({ key: apiKey, v: 'weekly' })

    Promise.all([
      importLibrary('maps'),
      importLibrary('geocoding'),
      importLibrary('marker'),
    ])
      .then(() => {
        if (!mapContainerRef.current) return
        const map = new google.maps.Map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })

        const marker = new google.maps.Marker({
          position: defaultCenter,
          map,
          draggable: true,
          animation: google.maps.Animation.DROP,
        })

        const geocoder = new google.maps.Geocoder()

        const resolveAddress = (lat: number, lng: number) => {
          onGeocodingStatusChange(true)
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              const result = results[0]
              let street = ''
              let city = ''
              let postalCode = ''

              for (const component of result.address_components) {
                const types = component.types
                if (types.includes('street_number')) {
                  street = component.long_name + ' ' + street
                }
                if (types.includes('route')) {
                  street += component.long_name
                }
                if (types.includes('locality') || types.includes('postal_town')) {
                  city = component.long_name
                }
                if (types.includes('postal_code')) {
                  postalCode = component.long_name
                }
              }

              onAddressResolved({
                latitude: lat,
                longitude: lng,
                formattedAddress: result.formatted_address,
                street: street || undefined,
                city: city || undefined,
                postalCode: postalCode || undefined,
              })
            } else {
              onAddressResolved({
                latitude: lat,
                longitude: lng,
                formattedAddress: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
              })
            }
            onGeocodingStatusChange(false)
          })
        }

        marker.addListener('dragend', () => {
          const pos = marker.getPosition()
          if (pos) {
            resolveAddress(pos.lat(), pos.lng())
          }
        })

        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          const pos = e.latLng
          if (pos) {
            marker.setPosition(pos)
            map.panTo(pos)
            resolveAddress(pos.lat(), pos.lng())
          }
        })
      })
      .catch(() => {
        setMapError('Failed to load Google Maps')
      })
  }, [])

  if (mapError) {
    return (
      <div className="h-48 bg-neutral-light rounded-lg flex items-center justify-center text-error text-sm">
        {mapError}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-neutral-gray">
        Drop a pin on the map to auto-fill your shipping address
      </p>
      <div ref={mapContainerRef} className="h-48 bg-neutral-light rounded-lg z-0" />
    </div>
  )
}
