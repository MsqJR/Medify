'use client'

import Link from 'next/link'
import React, { Suspense, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  FiFilter,
  FiMinus,
  FiPlus,
  FiSearch,
  FiShoppingCart,
  FiX,
  FiZap,
} from 'react-icons/fi'

import {
  getDemoState,
  type TemplateProduct,
} from '@/lib/pharmacyTemplateRuntime'
import { usePharmacyMedications, type SortValue } from '@/lib/usePharmacyMedications'
import { ProductImage } from '@/components/pharmacy/ProductImage'
import { BrandLogo } from '@/components/pharmacy/BrandLogo'
import {
  getTemplate6StockPillClasses,
  getTemplate6StockLabel,
  getTemplate6StockStatus,
  getTemplate6StockTone,
  TEMPLATE6_DEMO_BRAND,
  TEMPLATE6_DEMO_PRODUCTS,
} from '@/app/templates/pharmacy/6/data/demo'

function TemplateSixMedicationsContent() {
  const searchParams = useSearchParams()
  const demoState = useMemo(() => getDemoState(searchParams), [searchParams])
  const cartKey = demoState.isDemo ? 'pharmacy6_cart_demo' : 'pharmacy6_cart'
  const requestedCategory = (searchParams?.get('category') || '').trim()

  const {
    brand,
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
  } = usePharmacyMedications({
    demoState,
    cartKey,
    demoBrand: TEMPLATE6_DEMO_BRAND,
    demoProducts: TEMPLATE6_DEMO_PRODUCTS,
    initialCategory: requestedCategory || undefined,
  })

  useEffect(() => {
    if (!requestedCategory) {
      if (!categories.includes(category)) setCategory('All')
      return
    }

    if (categories.includes(requestedCategory) && category !== requestedCategory) {
      setCategory(requestedCategory)
    }
  }, [categories, category, requestedCategory])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (search.trim()) count += 1
    if (category !== 'All') count += 1
    if (sortBy !== 'featured') count += 1
    return count
  }, [category, search, sortBy])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href={withDemo('/templates/pharmacy/6')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-100">
            <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-xl bg-lime-500 text-slate-950 flex items-center justify-center p-0.5 shadow-sm">
              {!demoState.isDemo && brand.logo ? (
                <BrandLogo
                  src={brand.logo}
                  alt={`${brand.name || 'Pharmacy'} logo`}
                  fallbackText={brand.name || 'P'}
                  imageClassName="h-full w-full object-contain"
                  fallbackClassName="h-full w-full bg-lime-500 flex items-center justify-center text-slate-950 font-bold rounded-lg text-xs"
                />
              ) : (
                <FiZap className="w-4 h-4" />
              )}
            </div>
            {brand.name || 'NeoMeds Studio'}
          </Link>
          <Link href={withDemo('/templates/pharmacy/6/checkout')} className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-lime-400">
            <FiShoppingCart /> Cart {cartCount > 0 ? `(${cartCount})` : ''}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6">
        <section className="animate-soft-rise rounded-3xl border border-slate-800 bg-slate-900 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_200px_180px]">
            <label className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search cognitive, hydration, sleep..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 pl-10 text-sm text-slate-100 outline-none transition focus:border-lime-400"
              />
            </label>

            <label className="relative">
              <FiFilter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 pl-10 text-sm text-slate-100 outline-none transition focus:border-lime-400">
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>

            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortValue)} className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-lime-400">
              <option value="featured">Featured</option>
              <option value="name">Name A-Z</option>
              <option value="price_low">Price low</option>
              <option value="price_high">Price high</option>
            </select>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    category === item
                      ? 'bg-lime-500 text-slate-950'
                      : 'border border-slate-700 bg-slate-950 text-slate-300 hover:border-lime-400 hover:text-lime-300'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{filteredProducts.length} results</span>
              {activeFilterCount > 0 ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2.5 py-1 font-semibold text-slate-300 transition hover:border-lime-400 hover:text-lime-300"
                >
                  <FiX size={12} /> Clear filters
                </button>
              ) : null}
            </div>
          </div>
        </section>

        {filteredProducts.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-12 text-center text-slate-400">
            <p>No products found for this filter.</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-lime-400 hover:text-lime-300"
              >
                Reset filters
              </button>
              <Link href={withDemo('/templates/pharmacy/6')} className="rounded-xl bg-lime-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-lime-400">
                Back to home
              </Link>
            </div>
          </div>
        ) : (
          <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product, index) => {
              const inCart = cart.find((item) => item.product.id === product.id)
              const quantity = inCart?.quantity || 0
              const stockStatus = getTemplate6StockStatus(product)
              const outOfStock = stockStatus === 'out'

              return (
                <article key={product.id} className="animate-soft-rise group rounded-3xl border border-slate-800 bg-slate-900 p-4 transition duration-300 hover:-translate-y-1 hover:border-lime-500/30 hover:shadow-xl hover:shadow-lime-500/10" style={{ animationDelay: `${index * 70}ms` }}>
                  <div className="h-44 overflow-hidden rounded-2xl bg-slate-800">
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      fallbackClassName="grid h-full place-items-center bg-slate-800 text-slate-300"
                      fallbackLabel={product.category || 'No product image'}
                    />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.15em] text-lime-300">{product.category}</p>
                  <h3 className="mt-1 text-base font-semibold text-white">{product.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-400">{product.description || 'No description available.'}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Link href={withDemo(`/templates/pharmacy/6/product/${product.id}`)} className="text-xs font-semibold text-slate-300 hover:text-lime-300">
                      Open details
                    </Link>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getTemplate6StockPillClasses(stockStatus)}`}>
                      {getTemplate6StockLabel(stockStatus)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-lime-300">{product.price}</span>
                    <p className={`text-xs font-semibold ${getTemplate6StockTone(stockStatus)}`}>
                      {outOfStock ? 'Unavailable' : 'Available'}
                    </p>
                  </div>

                  {quantity > 0 ? (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 px-3 py-2">
                      <button type="button" onClick={() => updateQty(product.id, -1)} className="grid h-7 w-7 place-items-center rounded-full border border-slate-700 text-slate-200 transition hover:border-lime-400 hover:text-lime-300"><FiMinus size={13} /></button>
                      <span className="text-sm font-semibold text-white">{quantity} in cart</span>
                      <button type="button" onClick={() => updateQty(product.id, 1)} disabled={(product.stock || 0) <= quantity} className="grid h-7 w-7 place-items-center rounded-full border border-slate-700 text-slate-200 transition hover:border-lime-400 hover:text-lime-300 disabled:opacity-50"><FiPlus size={13} /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => addToCart(product)} disabled={outOfStock} className="mt-3 w-full rounded-xl bg-lime-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-lime-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300">
                      Add to cart
                    </button>
                  )}
                </article>
              )
            })}
          </section>
        )}
      </main>

      {cartCount > 0 ? (
        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 rounded-2xl border border-slate-700 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">{cartCount} items queued</p>
              <p className="text-xs text-slate-400">Subtotal ${subtotal.toFixed(2)}</p>
            </div>
            <Link href={withDemo('/templates/pharmacy/6/checkout')} className="rounded-xl bg-lime-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-lime-400">
              Checkout
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function TemplateSixMedicationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100">Loading...</div>}>
      <TemplateSixMedicationsContent />
    </Suspense>
  )
}
