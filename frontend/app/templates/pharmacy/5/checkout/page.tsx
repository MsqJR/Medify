'use client'

import Link from 'next/link'
import React, { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCreditCard,
  FiMinus,
  FiPlus,
  FiShoppingBag,
} from 'react-icons/fi'

import {
  buildTemplatePath,
  calculateSubtotal,
  formatPrice,
  getDemoState,
  type TemplateBrand,
} from '@/lib/pharmacyTemplateRuntime'
import { usePharmacyCheckout } from '@/lib/usePharmacyCheckout'

const DEMO_BRAND: TemplateBrand = {
  name: 'HarborLine Pharmacy',
  logo: '/template-2.jpg',
  about: 'Editorial storefront for concierge pharmacy commerce.',
  phone: '+1 (555) 278-3092',
  address: '11 Harbor Street, Boston',
  openHours: 'Mon-Sat 09:00-20:00',
}

function TemplateFiveCheckoutContent() {
  const searchParams = useSearchParams()
  const demoState = useMemo(() => getDemoState(searchParams), [searchParams])
  const cartKey = demoState.isDemo ? 'pharmacy5_cart_demo' : 'pharmacy5_cart'

  const withDemo = (path: string) => buildTemplatePath(path, demoState)

  const {
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
    updateQty,
    handleSubmit,
    formatCardNumber,
    formatExpiry,
    digitsOnly,
  } = usePharmacyCheckout({
    demoState,
    cartKey,
    orderNamespace: 'pharmacy5_order',
    demoBrand: DEMO_BRAND,
    deliveryFeeValue: 5.25,
  })

  if (orderPlaced) {
    return (
      <div className="min-h-screen grid place-items-center bg-[linear-gradient(180deg,#fffaf6_0%,#fff_30%,#f8f5ff_100%)] px-4">
        <div className="w-full max-w-xl animate-soft-rise rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-2xl shadow-rose-100/40">
          <FiCheckCircle className="mx-auto text-emerald-500" size={56} />
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Order sent</h1>
          <p className="mt-2 text-slate-600">Our team at {brand.name || 'HarborLine Pharmacy'} will confirm shortly.</p>
          <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-slate-700">Order number: <span className="text-rose-600">{orderNumber}</span></p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={withDemo('/templates/pharmacy/5/medications')} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Continue shopping</Link>
            <Link href={withDemo('/templates/pharmacy/5')} className="rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600">Back home</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fff_30%,#f8f5ff_100%)] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-rose-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href={withDemo('/templates/pharmacy/5/medications')} className="text-sm font-semibold text-slate-700 hover:text-rose-600">← Back to catalog</Link>
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600"><FiShoppingBag /> Harbor checkout</span>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="animate-soft-rise space-y-5 rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Delivery details</h1>
          <p className="text-sm text-slate-500">Fill out your information and choose payment method.</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">Full name
              <input required value={form.fullName} onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100" />
            </label>
            <label className="text-sm font-medium text-slate-700">Email
              <input required type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100" />
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">Phone
              <input required value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100" />
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">Address
              <input required value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100" />
            </label>
            <label className="text-sm font-medium text-slate-700">City
              <input required value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100" />
            </label>
            <label className="text-sm font-medium text-slate-700">State
              <input required value={form.state} onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100" />
            </label>
            <label className="text-sm font-medium text-slate-700">ZIP code
              <input value={form.zipCode} onChange={(event) => setForm((prev) => ({ ...prev, zipCode: event.target.value }))} placeholder="Optional" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100" />
            </label>
          </div>

          <div className="grid gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 sm:grid-cols-2">
            <button type="button" onClick={() => setForm((prev) => ({ ...prev, deliveryMethod: 'delivery' }))} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${form.deliveryMethod === 'delivery' ? 'border-rose-300 bg-white text-rose-600' : 'border-slate-200 text-slate-600 hover:border-rose-200'}`}>
              Home delivery (+$5.25)
            </button>
            <button type="button" onClick={() => setForm((prev) => ({ ...prev, deliveryMethod: 'pickup' }))} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${form.deliveryMethod === 'pickup' ? 'border-rose-300 bg-white text-rose-600' : 'border-slate-200 text-slate-600 hover:border-rose-200'}`}>
              Pickup
            </button>
          </div>

          <div className="space-y-3 rounded-2xl border border-rose-100 bg-rose-50 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setForm((prev) => ({ ...prev, paymentMethod: 'cash' }))} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${form.paymentMethod === 'cash' ? 'border-rose-300 bg-white text-rose-600' : 'border-slate-200 text-slate-600 hover:border-rose-200'}`}>
                Cash payment
              </button>
              <button type="button" onClick={() => setForm((prev) => ({ ...prev, paymentMethod: 'card' }))} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${form.paymentMethod === 'card' ? 'border-rose-300 bg-white text-rose-600' : 'border-slate-200 text-slate-600 hover:border-rose-200'}`}>
                Card payment
              </button>
            </div>

            {form.paymentMethod === 'card' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">Cardholder
                  <input required value={card.holder} onChange={(event) => setCard((prev) => ({ ...prev, holder: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100" />
                </label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">Card number
                  <input required value={card.number} onChange={(event) => setCard((prev) => ({ ...prev, number: formatCardNumber(event.target.value) }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100" placeholder="1234 5678 9012 3456" />
                </label>
                <label className="text-sm font-medium text-slate-700">Expiry
                  <input required value={card.expiry} onChange={(event) => setCard((prev) => ({ ...prev, expiry: formatExpiry(event.target.value) }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100" placeholder="MM/YY" />
                </label>
                <label className="text-sm font-medium text-slate-700">CVC
                  <div className="relative mt-1">
                    <FiCreditCard className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input required value={card.cvc} onChange={(event) => setCard((prev) => ({ ...prev, cvc: digitsOnly(event.target.value).slice(0, 4) }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pl-10 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100" placeholder="123" />
                  </div>
                </label>
              </div>
            ) : null}
          </div>

          <label className="text-sm font-medium text-slate-700">Notes
            <textarea rows={3} value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100" placeholder="Any delivery instructions" />
          </label>

          {error ? <p className="text-sm font-medium text-rose-500">{error}</p> : null}

          <button type="submit" disabled={isSubmitting || cart.length === 0} className="w-full rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-slate-300">
            {isSubmitting ? 'Placing order...' : `Place order · ${formatPrice(total)}`}
          </button>
        </form>

        <aside className="animate-soft-rise [animation-delay:120ms] rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Order summary</h2>
          <p className="mt-1 text-sm text-slate-500">{brand.name || 'HarborLine Pharmacy'}</p>

          {cart.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Cart is empty.</div>
          ) : (
            <div className="mt-4 space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.product.name}</p>
                      <p className="text-xs text-slate-500">{item.product.category}</p>
                    </div>
                    <p className="text-sm font-semibold text-rose-600">{formatPrice(calculateSubtotal([{ ...item }]))}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button type="button" onClick={() => updateQty(item.product.id, -1)} className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-rose-300 hover:text-rose-600"><FiMinus size={13} /></button>
                    <span className="min-w-[2rem] text-center text-sm font-semibold text-slate-800">{item.quantity}</span>
                    <button type="button" onClick={() => updateQty(item.product.id, 1)} disabled={(item.product.stock || 0) <= item.quantity} className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-50"><FiPlus size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-sm">
            <div className="flex items-center justify-between text-slate-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex items-center justify-between text-slate-600"><span>Delivery</span><span>{formatPrice(deliveryFee)}</span></div>
            <div className="flex items-center justify-between text-base font-bold text-slate-900"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default function TemplateFiveCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center">Loading...</div>}>
      <TemplateFiveCheckoutContent />
    </Suspense>
  )
}
