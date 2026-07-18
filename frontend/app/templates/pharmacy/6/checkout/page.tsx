'use client'

import Link from 'next/link'
import React, { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiMinus,
  FiPlus,
  FiShield,
  FiTruck,
  FiZap,
} from 'react-icons/fi'

import {
  buildTemplatePath,
  calculateSubtotal,
  formatPrice,
  getDemoState,
} from '@/lib/pharmacyTemplateRuntime'
import { usePharmacyCheckout } from '@/lib/usePharmacyCheckout'
import { BrandLogo } from '@/components/pharmacy/BrandLogo'
import { TEMPLATE6_DEMO_BRAND } from '@/app/templates/pharmacy/6/data/demo'

function TemplateSixCheckoutContent() {
  const searchParams = useSearchParams()
  const demoState = useMemo(() => getDemoState(searchParams), [searchParams])
  const cartKey = demoState.isDemo ? 'pharmacy6_cart_demo' : 'pharmacy6_cart'

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
    orderNamespace: 'pharmacy6_order',
    demoBrand: TEMPLATE6_DEMO_BRAND,
    deliveryFeeValue: 6.25,
  })

  if (orderPlaced) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 px-4">
        <div className="w-full max-w-xl animate-soft-rise rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-100">
          <FiCheckCircle className="mx-auto text-lime-400" size={56} />
          <h1 className="mt-4 text-3xl font-bold text-white">Order confirmed</h1>
          <p className="mt-2 text-slate-300">{brand.name || 'NeoMeds Studio'} will contact you shortly.</p>
          <p className="mt-4 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-200">
            Order number: <span className="text-lime-300">{orderNumber}</span>
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={withDemo('/templates/pharmacy/6/medications')} className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-lime-400 hover:text-lime-300">
              Continue shopping
            </Link>
            <Link href={withDemo('/templates/pharmacy/6')} className="rounded-xl bg-lime-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-lime-400">
              Back home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href={withDemo('/templates/pharmacy/6/medications')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-lime-300">
            <FiArrowLeft /> Back to catalog
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-lime-500/40 bg-lime-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-lime-300">
            <FiZap /> Neo checkout
          </span>
        </div>
      </header>

      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
          <div className="grid gap-2 text-xs sm:grid-cols-3">
            {[
              { label: '1. Delivery Details', active: true },
              { label: '2. Payment Method', active: true },
              { label: '3. Confirmation', active: false },
            ].map((step) => (
              <p
                key={step.label}
                className={`rounded-lg border px-3 py-2 text-center font-semibold ${
                  step.active
                    ? 'border-lime-500/40 bg-lime-500/10 text-lime-300'
                    : 'border-slate-700 bg-slate-900 text-slate-400'
                }`}
              >
                {step.label}
              </p>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={handleSubmit} className="animate-soft-rise space-y-5 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-bold text-white">Delivery details</h1>
          <p className="text-sm text-slate-400">Fast form optimized for rapid reorder flows.</p>

          <div className="grid gap-2 text-xs sm:grid-cols-3">
            <p className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-300"><FiShield className="text-lime-300" /> Secure checkout</p>
            <p className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-300"><FiTruck className="text-lime-300" /> Dispatch-ready flow</p>
            <p className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-300"><FiClock className="text-lime-300" /> Live total updates</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-300">Full name
              <input required value={form.fullName} onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-lime-400" />
            </label>
            <label className="text-sm font-medium text-slate-300">Email
              <input required type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-lime-400" />
            </label>
            <label className="text-sm font-medium text-slate-300 sm:col-span-2">Phone
              <input required value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-lime-400" />
            </label>
            <label className="text-sm font-medium text-slate-300 sm:col-span-2">Address
              <input required value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-lime-400" />
            </label>
            <label className="text-sm font-medium text-slate-300">City
              <input required value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-lime-400" />
            </label>
            <label className="text-sm font-medium text-slate-300">State
              <input required value={form.state} onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-lime-400" />
            </label>
            <label className="text-sm font-medium text-slate-300">ZIP code
              <input value={form.zipCode} onChange={(event) => setForm((prev) => ({ ...prev, zipCode: event.target.value }))} placeholder="Optional" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-lime-400" />
            </label>
          </div>

          <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:grid-cols-2">
            <button type="button" onClick={() => setForm((prev) => ({ ...prev, deliveryMethod: 'delivery' }))} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${form.deliveryMethod === 'delivery' ? 'border-lime-400 bg-lime-500/10 text-lime-300' : 'border-slate-700 text-slate-300 hover:border-slate-500'}`}>
              Express delivery (+$6.25)
            </button>
            <button type="button" onClick={() => setForm((prev) => ({ ...prev, deliveryMethod: 'pickup' }))} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${form.deliveryMethod === 'pickup' ? 'border-lime-400 bg-lime-500/10 text-lime-300' : 'border-slate-700 text-slate-300 hover:border-slate-500'}`}>
              Pickup
            </button>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setForm((prev) => ({ ...prev, paymentMethod: 'cash' }))} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${form.paymentMethod === 'cash' ? 'border-lime-400 bg-lime-500/10 text-lime-300' : 'border-slate-700 text-slate-300 hover:border-slate-500'}`}>
                Cash payment
              </button>
              <button type="button" onClick={() => setForm((prev) => ({ ...prev, paymentMethod: 'card' }))} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${form.paymentMethod === 'card' ? 'border-lime-400 bg-lime-500/10 text-lime-300' : 'border-slate-700 text-slate-300 hover:border-slate-500'}`}>
                Card payment
              </button>
            </div>

            {form.paymentMethod === 'card' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-300 sm:col-span-2">Cardholder
                  <input required value={card.holder} onChange={(event) => setCard((prev) => ({ ...prev, holder: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-lime-400" />
                </label>
                <label className="text-sm font-medium text-slate-300 sm:col-span-2">Card number
                  <input required value={card.number} onChange={(event) => setCard((prev) => ({ ...prev, number: formatCardNumber(event.target.value) }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-lime-400" placeholder="1234 5678 9012 3456" />
                </label>
                <label className="text-sm font-medium text-slate-300">Expiry
                  <input required value={card.expiry} onChange={(event) => setCard((prev) => ({ ...prev, expiry: formatExpiry(event.target.value) }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-lime-400" placeholder="MM/YY" />
                </label>
                <label className="text-sm font-medium text-slate-300">CVC
                  <div className="relative mt-1">
                    <FiCreditCard className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input required value={card.cvc} onChange={(event) => setCard((prev) => ({ ...prev, cvc: digitsOnly(event.target.value).slice(0, 4) }))} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 pl-10 text-sm text-slate-100 outline-none transition focus:border-lime-400" placeholder="123" />
                  </div>
                </label>
              </div>
            ) : null}
          </div>

          <label className="text-sm font-medium text-slate-300">Notes
            <textarea rows={3} value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-lime-400" placeholder="Any delivery instructions" />
          </label>

          {error ? <p className="text-sm font-medium text-rose-400">{error}</p> : null}

          <button type="submit" disabled={isSubmitting || cart.length === 0} className="w-full rounded-xl bg-lime-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-lime-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300">
            {isSubmitting ? 'Placing order...' : `Place order · ${formatPrice(total)}`}
          </button>
        </form>

        <aside className="animate-soft-rise [animation-delay:120ms] rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-bold text-white">Order summary</h2>
          <p className="mt-1 text-sm text-slate-400">{brand.name || 'NeoMeds Studio'}</p>

          <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
            <p className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-300"><FiClock className="text-lime-300" /> ETA 30-45 min</p>
            <p className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-300"><FiShield className="text-lime-300" /> Protected payment</p>
          </div>

          {cart.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">Cart is empty.</div>
          ) : (
            <div className="mt-4 space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="rounded-2xl border border-slate-700 bg-slate-950 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.product.name}</p>
                      <p className="text-xs text-slate-400">{item.product.category}</p>
                    </div>
                    <p className="text-sm font-semibold text-lime-300">
                      {formatPrice(calculateSubtotal([{ ...item }]))}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button type="button" onClick={() => updateQty(item.product.id, -1)} className="grid h-7 w-7 place-items-center rounded-full border border-slate-700 text-slate-200 transition hover:border-lime-400 hover:text-lime-300"><FiMinus size={13} /></button>
                    <span className="min-w-[2rem] text-center text-sm font-semibold text-white">{item.quantity}</span>
                    <button type="button" onClick={() => updateQty(item.product.id, 1)} disabled={(item.product.stock || 0) <= item.quantity} className="grid h-7 w-7 place-items-center rounded-full border border-slate-700 text-slate-200 transition hover:border-lime-400 hover:text-lime-300 disabled:opacity-50"><FiPlus size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 space-y-2 border-t border-slate-700 pt-4 text-sm">
            <div className="flex items-center justify-between text-slate-300"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex items-center justify-between text-slate-300"><span>Delivery</span><span>{formatPrice(deliveryFee)}</span></div>
            <div className="flex items-center justify-between text-base font-bold text-white"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default function TemplateSixCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100">Loading...</div>}>
      <TemplateSixCheckoutContent />
    </Suspense>
  )
}
