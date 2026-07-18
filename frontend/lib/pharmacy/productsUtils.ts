export type ConfirmDialog = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
}

export type SheetPreviewRow = {
  name: string
  price: number
  category: string
  description: string
  stock?: number
}

export type ProductForm = {
  id?: string
  name: string
  price: string
  category: string
  description: string
  stock: string
  image: File | null
  imagePreview: string
  image_url: string
}

export const emptyForm: ProductForm = {
  name: '',
  price: '',
  category: '',
  description: '',
  stock: '0',
  image: null,
  imagePreview: '',
  image_url: '',
}

export const priceLabel = (value: string) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return value
  return numeric.toFixed(2)
}

export const normalizeKeyToken = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '')

export const getFailureCell = (data: Record<string, string>, aliases: string[]) => {
  for (const alias of aliases) {
    const direct = data[alias]
    if (typeof direct === 'string' && direct.trim()) {
      return direct.trim()
    }
  }

  const normalizedAliases = aliases.map((alias) => normalizeKeyToken(alias))
  for (const [key, value] of Object.entries(data || {})) {
    if (normalizedAliases.includes(normalizeKeyToken(key)) && value?.trim()) {
      return value.trim()
    }
  }

  return '-'
}

import type { PharmacyProduct } from '@/lib/pharmacy'

export const getProductImage = (product: PharmacyProduct) => {
  const nextImage = product.image_url || product.image || ''
  return nextImage.trim()
}
