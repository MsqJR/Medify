'use client'

import React from 'react'
import { FiPackage } from 'react-icons/fi'
import type { PharmacyProduct } from '@/lib/pharmacy'
import { ProductImage } from '@/components/pharmacy/ProductImage'
import { getProductImage } from '@/lib/pharmacy/productsUtils'

type ProductsProductAvatarProps = {
  product: PharmacyProduct
}

export function ProductsProductAvatar({ product }: ProductsProductAvatarProps) {
  const imageUrl = getProductImage(product)

  return imageUrl ? (
    <ProductImage
      src={imageUrl}
      alt={product.name}
      className="h-12 w-12 rounded-xl object-cover"
      fallbackClassName="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"
      fallbackLabel={product.name}
    />
  ) : (
    <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
      <FiPackage className="text-lg" />
    </div>
  )
}
