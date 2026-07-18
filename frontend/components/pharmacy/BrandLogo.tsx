'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { normalizeLogoUrl } from '@/lib/storage'

type BrandLogoProps = {
  src?: string | null
  alt: string
  fallbackText?: string
  imageClassName?: string
  fallbackClassName?: string
}

const isNextImageCompatible = (url: string) =>
  url.startsWith('/') || url.startsWith('http:') || url.startsWith('https:')

export function BrandLogo({
  src,
  alt,
  fallbackText = 'P',
  imageClassName = 'w-full h-full object-cover',
  fallbackClassName = 'w-full h-full bg-neutral-dark text-white flex items-center justify-center font-bold',
}: BrandLogoProps) {
  const normalizedSrc = normalizeLogoUrl(src)
  const [hasImageError, setHasImageError] = useState(false)

  const fallbackLetter = (fallbackText || 'P').charAt(0).toUpperCase() || 'P'

  if (!normalizedSrc || hasImageError) {
    return <div className={fallbackClassName}>{fallbackLetter}</div>
  }

  const isContain = imageClassName.includes('object-contain')
  const objectFitClass = isContain ? 'object-contain' : 'object-cover'

  if (isNextImageCompatible(normalizedSrc)) {
    return (
      <div className={`relative overflow-hidden ${imageClassName}`}>
        <Image
          key={normalizedSrc}
          src={normalizedSrc}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100px, 200px"
          className={objectFitClass}
          onError={() => setHasImageError(true)}
          priority
        />
      </div>
    )
  }

  // data: and blob: URIs — must use native <img>
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={normalizedSrc}
      src={normalizedSrc}
      alt={alt}
      className={imageClassName}
      onError={() => setHasImageError(true)}
    />
  )
}
