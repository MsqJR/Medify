'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  calculateSubtotal,
  formatPrice,
  loadBrandInfo,
  readCart,
  submitTemplateOrder,
  syncSiteOwner,
  writeCart,
  type TemplateBrand,
  type TemplateCartItem,
  type TemplateDemoState,
} from './pharmacyTemplateRuntime'

export type CheckoutForm = {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  deliveryMethod: 'delivery' | 'pickup'
  paymentMethod: 'cash' | 'card'
  notes: string
}

export type CardForm = {
  holder: string
  number: string
  expiry: string
  cvc: string
}

const INITIAL_FORM: CheckoutForm = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  deliveryMethod: 'delivery',
  paymentMethod: 'cash',
  notes: '',
}

const INITIAL_CARD: CardForm = {
  holder: '',
  number: '',
  expiry: '',
  cvc: '',
}

function digitsOnly(value: string): string {
  return value.replace(/\D+/g, '')
}

function formatCardNumber(value: string): string {
  const compact = digitsOnly(value).slice(0, 19)
  return compact.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value: string): string {
  const compact = digitsOnly(value).slice(0, 4)
  if (compact.length <= 2) return compact
  return `${compact.slice(0, 2)}/${compact.slice(2)}`
}

function isValidCard(card: CardForm): boolean {
  const numberLength = digitsOnly(card.number).length
  const cvcLength = digitsOnly(card.cvc).length
  const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(card.expiry)
  if (!expiryMatch) return false
  const month = Number(expiryMatch[1])

  return (
    card.holder.trim().length >= 2 &&
    numberLength >= 13 &&
    numberLength <= 19 &&
    cvcLength >= 3 &&
    cvcLength <= 4 &&
    month >= 1 &&
    month <= 12
  )
}

type UsePharmacyCheckoutParams = {
  demoState: TemplateDemoState
  cartKey: string
  orderNamespace: string
  demoBrand: TemplateBrand
  deliveryFeeValue: number
}

type UsePharmacyCheckoutReturn = {
  brand: TemplateBrand
  cart: TemplateCartItem[]
  form: CheckoutForm
  card: CardForm
  isSubmitting: boolean
  orderPlaced: boolean
  orderNumber: string
  error: string
  subtotal: number
  deliveryFee: number
  total: number
  setForm: React.Dispatch<React.SetStateAction<CheckoutForm>>
  setCard: React.Dispatch<React.SetStateAction<CardForm>>
  setCart: React.Dispatch<React.SetStateAction<TemplateCartItem[]>>
  updateQty: (productId: string, delta: number) => void
  handleSubmit: (event: React.FormEvent) => Promise<void>
  formatCardNumber: (value: string) => string
  formatExpiry: (value: string) => string
  digitsOnly: (value: string) => string
}

export function usePharmacyCheckout({
  demoState,
  cartKey,
  orderNamespace,
  demoBrand,
  deliveryFeeValue,
}: UsePharmacyCheckoutParams): UsePharmacyCheckoutReturn {
  const [brand, setBrand] = useState<TemplateBrand>(demoBrand)
  const [cart, setCart] = useState<TemplateCartItem[]>([])
  const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM)
  const [card, setCard] = useState<CardForm>(INITIAL_CARD)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    syncSiteOwner(demoState.ownerId)
  }, [demoState.ownerId])

  useEffect(() => {
    setBrand(loadBrandInfo(demoState.isDemo, demoBrand))
  }, [demoState.isDemo])

  useEffect(() => {
    setCart(readCart(cartKey, demoState.isDemo))
  }, [cartKey, demoState.isDemo])

  useEffect(() => {
    writeCart(cartKey, demoState.isDemo, cart)
  }, [cart, cartKey, demoState.isDemo])

  const subtotal = useMemo(() => calculateSubtotal(cart), [cart])
  const deliveryFee = form.deliveryMethod === 'delivery' ? deliveryFeeValue : 0
  const total = subtotal + deliveryFee

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev.find((item) => item.product.id === productId)
      if (!current) return prev

      const nextQty = current.quantity + delta
      if (nextQty <= 0) return prev.filter((item) => item.product.id !== productId)
      if (delta > 0 && current.product.stock !== undefined && nextQty > current.product.stock) {
        alert(`Sorry, only ${current.product.stock} units of ${current.product.name} are available in stock.`)
        return prev
      }

      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: nextQty } : item,
      )
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (cart.length === 0) {
      setError('Your cart is empty.')
      return
    }

    if (form.paymentMethod === 'card' && !isValidCard(card)) {
      setError('Please enter valid card details.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitTemplateOrder({
        isDemo: demoState.isDemo,
        orderNamespace,
        cart,
        total,
        deliveryFee,
        deliveryInfo: form,
        payment:
          form.paymentMethod === 'card'
            ? { method: 'card', last4: digitsOnly(card.number).slice(-4) }
            : { method: 'cash' },
      })

      setOrderNumber(result.orderNumber)
      setOrderPlaced(true)
      setCart([])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not place order. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    brand,
    cart,
    form,
    card,
    isSubmitting,
    orderPlaced,
    orderNumber,
    error,
    subtotal,
    deliveryFee,
    total,
    setForm,
    setCard,
    setCart,
    updateQty,
    handleSubmit,
    formatCardNumber,
    formatExpiry,
    digitsOnly,
  }
}
