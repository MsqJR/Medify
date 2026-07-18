'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  syncSiteOwner,
  loadBrandInfo,
  loadTemplateProducts,
  readCart,
  writeCart,
  countCartItems,
  calculateSubtotal,
  buildTemplatePath,
  parsePriceToNumber,
  type TemplateBrand,
  type TemplateCartItem,
  type TemplateProduct,
  type TemplateDemoState,
} from './pharmacyTemplateRuntime'

export type SortValue = 'featured' | 'name' | 'price_low' | 'price_high' | 'recommended'

type UsePharmacyMedicationsParams = {
  demoState: TemplateDemoState
  cartKey: string
  demoBrand: TemplateBrand
  demoProducts: TemplateProduct[]
  initialCategory?: string
  initialSortBy?: SortValue
}

export function usePharmacyMedications({
  demoState,
  cartKey,
  demoBrand,
  demoProducts,
  initialCategory,
  initialSortBy = 'featured',
}: UsePharmacyMedicationsParams) {
  const [brand, setBrand] = useState<TemplateBrand>(demoBrand)
  const [products, setProducts] = useState<TemplateProduct[]>([])
  const [cart, setCart] = useState<TemplateCartItem[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(initialCategory || 'All')
  const [sortBy, setSortBy] = useState<SortValue>(initialSortBy)

  useEffect(() => {
    syncSiteOwner(demoState.ownerId)
  }, [demoState.ownerId])

  useEffect(() => {
    setBrand(loadBrandInfo(demoState.isDemo, demoBrand))

    const load = async () => {
      const loaded = await loadTemplateProducts(demoState.isDemo, demoProducts)
      setProducts(loaded)
    }

    void load()
  }, [demoState.isDemo])

  useEffect(() => {
    setCart(readCart(cartKey, demoState.isDemo))
  }, [cartKey, demoState.isDemo])

  useEffect(() => {
    writeCart(cartKey, demoState.isDemo, cart)
  }, [cart, cartKey, demoState.isDemo])

  const withDemo = useCallback(
    (path: string) => buildTemplatePath(path, demoState),
    [demoState],
  )

  const categories = useMemo(() => {
    const unique = new Set(products.map((item) => item.category).filter(Boolean))
    return ['All', ...Array.from(unique).sort()]
  }, [products])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()

    let next = products.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.description || '').toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })

    if (sortBy === 'featured' || sortBy === 'recommended') {
      next = [...next].sort((a, b) => (b.stock || 0) - (a.stock || 0))
    }
    if (sortBy === 'name') next = [...next].sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === 'price_low') next = [...next].sort((a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price))
    if (sortBy === 'price_high') next = [...next].sort((a, b) => parsePriceToNumber(b.price) - parsePriceToNumber(a.price))

    return next
  }, [category, products, search, sortBy])

  const cartCount = useMemo(() => countCartItems(cart), [cart])
  const subtotal = useMemo(() => calculateSubtotal(cart), [cart])

  const addToCart = (product: TemplateProduct) => {
    if (!product.inStock || (product.stock || 0) <= 0) return

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        if ((product.stock || 0) <= existing.quantity) return prev
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev.find((item) => item.product.id === productId)
      if (!current) return prev

      const nextQty = current.quantity + delta
      if (nextQty <= 0) return prev.filter((item) => item.product.id !== productId)
      if ((current.product.stock || 0) < nextQty) return prev

      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: nextQty } : item,
      )
    })
  }

  const clearFilters = () => {
    setSearch('')
    setCategory('All')
    setSortBy('featured')
  }

  return {
    brand,
    products,
    cart,
    search,
    setSearch,
    category,
    setCategory,
    sortBy,
    setSortBy,
    withDemo,
    categories,
    filteredProducts,
    cartCount,
    subtotal,
    addToCart,
    updateQty,
    clearFilters,
  }
}
