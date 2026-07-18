'use client'

import React, { useEffect, useRef, useState } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

export interface GoogleMapsPickerProps {
  initialLat?: number
  initialLng?: number
  onChange: (latitude: number, longitude: number, formattedAddress: string) => void
}

export function GoogleMapsPicker({ initialLat, initialLng, onChange }: GoogleMapsPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const defaultCenter = { lat: initialLat ?? 30.0444, lng: initialLng ?? 31.2357 }

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setMapError('Google Maps API key not configured')
      return
    }

    setOptions({ key: apiKey, v: 'weekly' })

    Promise.all([
      importLibrary('core'),
      importLibrary('maps'),
      importLibrary('places'),
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

        marker.addListener('dragend', () => {
          const pos = marker.getPosition()
          if (pos) {
            const geocoder = new google.maps.Geocoder()
            geocoder.geocode({ location: pos }, (results, status) => {
              if (status === 'OK' && results?.[0]) {
                onChange(pos.lat(), pos.lng(), results[0].formatted_address)
              } else {
                onChange(pos.lat(), pos.lng(), `${pos.lat()}, ${pos.lng()}`)
              }
            })
          }
        })

        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          const pos = e.latLng
          if (pos) {
            marker.setPosition(pos)
            map.panTo(pos)
            const geocoder = new google.maps.Geocoder()
            geocoder.geocode({ location: pos }, (results, status) => {
              if (status === 'OK' && results?.[0]) {
                onChange(pos.lat(), pos.lng(), results[0].formatted_address)
              } else {
                onChange(pos.lat(), pos.lng(), `${pos.lat()}, ${pos.lng()}`)
              }
            })
          }
        })

        if (searchInputRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
            types: ['geocode', 'establishment'],
          })
          autocomplete.bindTo('bounds', map)
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace()
            if (place.geometry?.location) {
              const pos = place.geometry.location
              map.setCenter(pos)
              map.setZoom(15)
              marker.setPosition(pos)
              onChange(pos.lat(), pos.lng(), place.formatted_address || place.name || `${pos.lat()}, ${pos.lng()}`)
              setSearchQuery('')
              if (searchInputRef.current) searchInputRef.current.value = ''
            }
          })
          autocompleteRef.current = autocomplete
        }

        mapRef.current = map
        markerRef.current = marker
        setMapLoaded(true)
      })
      .catch(() => {
        setMapError('Failed to load Google Maps')
      })
  }, [])

  if (mapError) {
    return (
      <div className="h-64 bg-neutral-light rounded-lg flex items-center justify-center text-error text-sm">
        {mapError}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <input
        ref={searchInputRef}
        type="text"
        placeholder="Search for an address or place..."
        className="w-full px-4 py-2 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div
        ref={mapContainerRef}
        className="h-64 bg-neutral-light rounded-lg z-0"
      />
      {!mapLoaded && (
        <div className="h-64 bg-neutral-light rounded-lg animate-pulse flex items-center justify-center text-neutral-gray text-sm">
          Loading map...
        </div>
      )}
    </div>
  )
}
