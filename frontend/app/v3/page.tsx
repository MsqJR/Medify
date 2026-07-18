'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/hooks/useReveal'
import { FiCheck, FiMonitor, FiShoppingCart, FiCalendar, FiMessageSquare, FiArrowRight } from 'react-icons/fi'

function BrowserMockup() {
  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-black/25 border border-white/10">
      <div className="bg-[#1e2a3a] px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-[#2a3a4e] rounded-md px-3 py-1 text-[10px] text-white/50 font-mono max-w-[200px] truncate">
            myclinic.medify.io
          </div>
        </div>
      </div>
      <div className="bg-white p-5 sm:p-7 space-y-4">
        <div className="h-2.5 w-24 rounded-full bg-primary" />
        <div className="h-7 w-3/4 rounded bg-neutral-border/60" />
        <div className="h-3 w-full rounded bg-neutral-border/30" />
        <div className="h-3 w-5/6 rounded bg-neutral-border/30" />
        <div className="flex gap-3 pt-2">
          <div className="h-20 w-1/3 rounded-lg bg-primary/10" />
          <div className="h-20 w-1/3 rounded-lg bg-primary/10" />
          <div className="h-20 w-1/3 rounded-lg bg-primary/10" />
        </div>
      </div>
    </div>
  )
}

export default function V3LandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-dark overflow-x-hidden w-full">
      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-30 bg-[#0B1423]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center flex-shrink-0 brightness-0 invert">
            <div className="relative w-28 h-8 sm:w-32 sm:h-9 flex-shrink-0">
              <Image
                src="/logo.svg"
                alt="Medify logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/signup">
              <Button className="px-5 py-2 text-sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center bg-[#0B1423] overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_60%_50%,rgba(27,118,255,0.12),transparent_60%),radial-gradient(700px_400px_at_10%_80%,rgba(245,166,35,0.06),transparent_50%)]" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[120px]" />
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 py-20 sm:py-28">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 xl:col-span-5">
              <Reveal delay={1}>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#F5A623] uppercase tracking-[0.14em] mb-6">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F5A623]" />
                  Medical website builder
                </span>
              </Reveal>
              <Reveal delay={2}>
                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-white tracking-[-0.03em] text-balance">
                  Your practice.
                  <br />
                  <span className="text-primary">Online. Professionally.</span>
                </h1>
              </Reveal>
              <Reveal delay={3}>
                <p className="text-base sm:text-lg text-white/55 mt-6 mb-10 max-w-lg leading-relaxed text-pretty">
                  A website that reflects the quality of your care. No templates, no agencies, no compromises. Just your brand, your patients, your way.
                </p>
              </Reveal>
              <Reveal delay={4}>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Link href="/signup">
                    <Button className="px-8 py-3.5 text-base shadow-lg shadow-primary/25">
                      Build Your Site
                    </Button>
                  </Link>
                  <Link href="#how-it-works" className="group inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors py-3.5">
                    See how it works
                    <FiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </Reveal>
            </div>
            <div className="lg:col-span-6 xl:col-span-6 xl:col-start-7">
              <Reveal delay={3} className="w-full">
                <BrowserMockup />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="py-14 bg-white border-b border-neutral-border/50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Reveal delay={1}>
            <p className="text-sm font-semibold text-neutral-gray uppercase tracking-[0.1em] mb-8">
              Trusted by 500+ medical facilities nationwide
            </p>
          </Reveal>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {['City Medical Center', 'HealthPlus Pharmacy', 'Nile Hospital', 'Coastal Clinic', 'MedFirst'].map((name) => (
              <span key={name} className="text-sm font-semibold text-neutral-muted/40 uppercase tracking-[0.08em]">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 sm:py-32 bg-[#0B1423] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal delay={1} className="w-full">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#F5A623] uppercase tracking-[0.14em]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F5A623]" />
                Simple process
              </span>
            </div>
          </Reveal>
          <Reveal delay={2} className="w-full">
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-center text-white mb-4 text-balance">
              Three steps to your new website
            </h2>
          </Reveal>
          <Reveal delay={3} className="w-full">
            <p className="text-center text-white/45 mb-16 max-w-lg mx-auto leading-relaxed text-pretty">
              No technical skills required. Just your expertise and a few minutes.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Tell us about your facility', desc: 'Hospital or pharmacy? We tailor everything — templates, features, and dashboard — to your specific needs.', icon: FiMonitor },
              { step: '02', title: 'Customize your look', desc: 'Choose a professionally designed template, add your logo and colors, and see your live site in real time.', icon: FiCalendar },
              { step: '03', title: 'Publish and grow', desc: 'Go live with one click. Manage bookings, products, and patient engagement from one dashboard.', icon: FiMessageSquare },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i + 2} className="w-full">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <s.icon size={24} className="text-primary" />
                  </div>
                  <span className="text-[#F5A623]/60 text-sm font-mono font-semibold">{s.step}</span>
                  <h3 className="text-xl font-semibold text-white mt-3 mb-3">{s.title}</h3>
                  <p className="text-white/45 leading-relaxed text-sm">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dual Product ── */}
      <section className="py-24 sm:py-32 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal delay={1} className="w-full">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-[0.14em]">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Two platforms, one dashboard
              </span>
            </div>
          </Reveal>
          <Reveal delay={2} className="w-full">
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-center text-neutral-dark mb-16 text-balance">
              Built for hospitals &amp; pharmacies
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                type: 'Hospital',
                features: ['Doctor profiles & departments', 'Appointment booking system', 'Patient portal & forms', 'AI chatbot for FAQs'],
                cta: '/signup?type=hospital',
                gradient: 'from-primary/5 to-primary/10',
              },
              {
                type: 'Pharmacy',
                features: ['Product catalog & inventory', 'Online ordering & checkout', 'Prescription management', 'Google Sheets sync'],
                cta: '/signup?type=pharmacy',
                gradient: 'from-primary/5 to-primary/10',
              },
            ].map((p) => (
              <Reveal key={p.type} delay={2} className="w-full">
                <div className="bg-white border border-neutral-border rounded-3xl p-8 sm:p-10 h-full flex flex-col shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  <div className={`h-2 w-12 rounded-full bg-gradient-to-r ${p.gradient} mb-6`} />
                  <h3 className="text-2xl font-semibold text-neutral-dark mb-6 font-display">{p.type}</h3>
                  <ul className="space-y-3 mb-8 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-neutral-gray">
                        <FiCheck size={18} className="text-primary mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={p.cta}>
                    <Button className="w-full" variant="secondary">
                      Build a {p.type} Site
                    </Button>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 sm:py-32 bg-[#0B1423] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal delay={1} className="w-full">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#F5A623] uppercase tracking-[0.14em]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F5A623]" />
                Testimonials
              </span>
            </div>
          </Reveal>
          <Reveal delay={2} className="w-full">
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-center text-white mb-16 text-balance">
              Trusted by medical professionals
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Dr. Sarah Johnson',
                role: 'CMO, City Medical Center',
                quote: 'We launched our hospital website in under an hour. The guided setup walked us through everything we needed.',
              },
              {
                name: 'Michael Chen',
                role: 'Owner, HealthPlus Pharmacy',
                quote: 'I had my pharmacy storefront live in one sitting. The templates are gorgeous and the AI chatbot is incredible.',
              },
              {
                name: 'Dr. Ahmed Hassan',
                role: 'Director, Nile Medical Center',
                quote: 'A professional hospital website without any technical team. The interface is clear and the results speak for themselves.',
              },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i + 2} className="w-full">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 h-full flex flex-col backdrop-blur-sm">
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-4 h-4 text-[#F5A623]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-white/70 leading-relaxed mb-6 flex-1 text-sm">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="pt-4 border-t border-white/10">
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-white/40 text-xs">{t.role}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24 sm:py-32 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal delay={1} className="w-full">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-[0.14em]">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Simple pricing
              </span>
            </div>
          </Reveal>
          <Reveal delay={2} className="w-full">
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-center text-neutral-dark mb-4 text-balance">
              No surprise fees. No hidden costs.
            </h2>
          </Reveal>
          <Reveal delay={3} className="w-full">
            <p className="text-center text-neutral-gray mb-14 max-w-lg mx-auto leading-relaxed text-pretty">
              Everything you need to build and manage your medical website.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              {
                name: 'Hospital',
                price: '$9',
                period: '/month',
                features: ['Full website builder', 'Appointment booking', 'Doctor profiles', 'AI chatbot', 'Patient portal', 'Custom domain'],
              },
              {
                name: 'Pharmacy',
                price: '$15',
                period: ' one-time',
                features: ['E-commerce storefront', 'Product catalog', 'Order management', 'Prescription tools', 'Google Sheets sync', 'Custom domain'],
              },
            ].map((p) => (
              <Reveal key={p.name} delay={3} className="w-full">
                <div className="bg-white border border-neutral-border rounded-3xl p-8 sm:p-10 h-full flex flex-col shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-neutral-dark mb-1">{p.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-neutral-dark font-display">{p.price}</span>
                      <span className="text-neutral-gray text-sm">{p.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-neutral-gray">
                        <FiCheck size={16} className="text-primary mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/signup?type=${p.name.toLowerCase()}`}>
                    <Button className="w-full" variant={p.name === 'Hospital' ? 'primary' : 'secondary'}>
                      Build a {p.name} Site
                    </Button>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 sm:py-28 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_50%_120%,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <Reveal delay={1} className="w-full">
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-white mb-4 text-balance">
              Ready to build your medical website?
            </h2>
          </Reveal>
          <Reveal delay={2} className="w-full">
            <p className="text-white/70 mb-10 max-w-lg mx-auto leading-relaxed text-pretty">
              Join 500+ medical facilities already online. Start free, no credit card required.
            </p>
          </Reveal>
          <Reveal delay={3} className="w-full">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <button className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-primary px-8 py-3.5 text-base hover:bg-white/90 shadow-lg shadow-black/10">
                  Build Your Site Free
                </button>
              </Link>
              <Link href="#how-it-works">
                <button className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed bg-white/10 text-white border border-white/20 px-8 py-3.5 text-base hover:bg-white/20 hover:border-white/30">
                  How It Works
                </button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0B1423] text-white/50 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center flex-shrink-0 brightness-0 invert">
              <div className="relative w-24 h-7 sm:w-28 sm:h-8 flex-shrink-0">
                <Image
                  src="/logo.svg"
                  alt="Medify logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/login" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/signup" className="hover:text-white transition-colors">Get Started</Link>
            </div>
            <p className="text-sm text-center sm:text-left">&copy; 2026 Medify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
