'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/hooks/useReveal'
import { FiCheck, FiZap } from 'react-icons/fi'

export default function AltLandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-dark overflow-x-hidden w-full">
      {/* Minimal nav */}
      <nav className="sticky top-0 z-20 border-b border-neutral-border/50 bg-white/90 backdrop-blur-md overflow-x-hidden w-full">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center flex-shrink-0">
            <div className="relative w-32 h-10 sm:w-44 sm:h-14 flex-shrink-0">
              <Image
                src="/logo.svg"
                alt="Medify logo"
                fill
                className="object-contain filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.12)]"
                priority
              />
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <Link 
              href="/login" 
              className="text-[11px] sm:text-sm text-neutral-gray hover:text-primary transition-colors whitespace-nowrap inline-flex items-center justify-center font-medium min-h-[36px] sm:min-h-[40px] px-2.5"
            >
              <span className="hidden sm:inline mr-1">Already have a site? </span><span className="font-semibold">Log in</span>
            </Link>
            <Link 
              href="/signup" 
              className="px-3 sm:px-5 py-2 sm:py-2 text-[11px] sm:text-sm bg-primary text-white hover:bg-primary-dark inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-safe:hover:-translate-y-0.5 h-9 sm:h-10"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — one headline, one CTA, no clutter */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_50%_-20%,rgba(27,118,255,0.15),transparent_60%),radial-gradient(600px_300px_at_80%_80%,rgba(27,118,255,0.08),transparent_50%),linear-gradient(180deg,#f6fbfb_0%,#ffffff_60%)]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-3xl" />
        <div className="max-w-6xl mx-auto px-6 w-full relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <Reveal delay={1} className="w-full">
              <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[1.05] text-neutral-dark tracking-[-0.03em] text-balance">
                Your medical website.
                <br />
                <span className="text-primary">Online in seconds.</span>
              </h1>
            </Reveal>
            <Reveal delay={2} className="w-full">
              <p className="text-base sm:text-lg text-neutral-gray mt-6 mb-10 max-w-lg mx-auto leading-relaxed text-pretty">
                No builders. No agencies. No waiting. Just your facility, your domain, your patients&mdash;in the time it takes to finish your coffee.
              </p>
            </Reveal>
            <Reveal delay={3} className="w-full">
              <div className="flex justify-center">
                <Link 
                  href="/signup" 
                  className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white bg-primary text-white hover:bg-primary-dark motion-safe:hover:-translate-y-0.5 px-10 py-4 text-base sm:text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                  <FiZap className="inline-block mr-1" size={20} />
                  Build Your Site
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Speed visual — proof, not promise */}
      <section className="py-24 sm:py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <Reveal delay={1} className="w-full">
              <div className="text-center mb-16">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-[0.12em]">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  From zero to live
                </span>
              </div>
            </Reveal>
            <div className="grid grid-cols-3 gap-0 relative">
              {[
                { label: 'Sign up', time: '15s', desc: 'Create your account' },
                { label: 'Customize', time: '30s', desc: 'Pick a template, add your details' },
                { label: 'Publish', time: '15s', desc: 'Go live with one click' },
              ].map((step, i) => (
                <Reveal key={step.label} delay={i + 1} className="w-full">
                  <div className="text-center px-4 relative">
                    <div className="text-4xl sm:text-5xl font-bold text-primary font-display mb-2">{step.time}</div>
                    <div className="text-xs sm:text-sm font-semibold text-neutral-dark uppercase tracking-[0.08em] mb-1">{step.label}</div>
                    <p className="text-xs sm:text-sm text-neutral-gray">{step.desc}</p>
                    {i < 2 && (
                      <div className="hidden sm:block absolute top-6 -right-0 text-neutral-border text-2xl font-light">/</div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={4} className="w-full">
              <div className="text-center mt-12 pt-12 border-t border-neutral-border">
                <p className="text-2xl sm:text-3xl font-semibold text-neutral-dark font-display text-balance">
                  One minute. Two clicks. Done.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Simplicity ladder — 3 universal steps */}
      <section className="py-24 sm:py-32 bg-[radial-gradient(600px_250px_at_50%_0%,rgba(27,118,255,0.06),transparent_60%)] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal delay={1} className="w-full">
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-center text-neutral-dark mb-4 text-balance">
              Three clicks. No complexity.
            </h2>
          </Reveal>
          <Reveal delay={2} className="w-full">
            <p className="text-center text-neutral-gray mb-16 max-w-lg mx-auto leading-relaxed text-pretty">
              We stripped away every unnecessary choice. Just the decisions that matter.
            </p>
          </Reveal>
          <div className="max-w-2xl mx-auto space-y-6">
            {[
              { number: '01', title: 'Tell us what you need', desc: 'Hospital or pharmacy? We tailor everything — dashboard, features, templates — to your facility type.' },
              { number: '02', title: 'Pick your look and go', desc: 'Choose from professionally designed templates, add your logo and colors, and preview your live site in real time.' },
              { number: '03', title: 'Publish. That\u2019s it.', desc: 'One click and your site is live. No hosting setup, no domain config, no deployment pipeline.' },
            ].map((step, i) => (
              <Reveal key={step.number} delay={i + 1} className="w-full">
                <div className="flex items-start gap-6 bg-white border border-neutral-border rounded-2xl p-6 sm:p-8 shadow-sm">
                  <div className="hidden sm:flex w-14 h-14 bg-primary/10 text-primary rounded-xl items-center justify-center text-lg font-bold font-display flex-shrink-0">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-dark mb-2">{step.title}</h3>
                    <p className="text-neutral-gray leading-relaxed" dangerouslySetInnerHTML={{ __html: step.desc }} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant — key feature alt was missing */}
      <section className="py-24 sm:py-32 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <Reveal delay={1} className="w-full">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-[0.12em] mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                AI-powered
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold text-neutral-dark mt-4 mb-6 text-balance">
                A 24/7 assistant for every patient
              </h2>
              <p className="text-neutral-gray mb-8 leading-relaxed text-pretty">
                Medify&rsquo;s AI understands medical terminology and gives patients instant, accurate answers &mdash; about services, medications, appointments, and more. It works around the clock, never gets tired, and frees your staff for the work that matters.
              </p>
              <ul className="space-y-3">
                {[
                  'Answers common patient questions instantly',
                  'Guides patients to the right doctor or department',
                  'Handles appointment booking and follow-ups',
                  'Explains medications and services in plain language',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-neutral-dark">
                    <FiCheck className="text-success shrink-0" size={18} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={2} className="w-full">
              <div className="bg-neutral-light border border-neutral-border rounded-3xl p-0 h-72 sm:h-96 overflow-hidden relative">
                <Image
                  src="/chatbot.webp"
                  alt="AI assistant chatbot helping build a medical website"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Social proof — floating testimonials */}
      <section className="py-24 sm:py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal delay={1} className="w-full">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-center text-neutral-dark mb-4 text-balance">
              Trusted by medical professionals
            </h2>
          </Reveal>
          <Reveal delay={2} className="w-full">
            <p className="text-center text-neutral-gray mb-14 max-w-md mx-auto leading-relaxed text-pretty">
              From independent clinics to multi-location hospitals.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Dr. Sarah Johnson',
                role: 'CMO, City Hospital',
                content: 'We launched our hospital website in under an hour. The guided setup walked us through everything we needed.',
              },
              {
                name: 'Michael Chen',
                role: 'Owner, HealthPlus Pharmacy',
                content: 'I had my pharmacy storefront live in one sitting. The templates are gorgeous and the AI chatbot is incredible.',
              },
              {
                name: 'Dr. Ahmed Hassan',
                role: 'Director, Nile Medical Center',
                content: 'A professional hospital website without any technical team. The interface is clear and the results speak for themselves.',
              },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i + 1} className="w-full">
                <div className="bg-white border border-neutral-border rounded-2xl p-6 sm:p-8 shadow-sm h-full flex flex-col">
                  <p className="text-neutral-gray leading-relaxed mb-6 flex-1">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="pt-4 border-t border-neutral-border">
                    <p className="font-semibold text-neutral-dark">{t.name}</p>
                    <p className="text-sm text-neutral-gray">{t.role}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* What you can build — hospital & pharmacy showcase */}
      <section className="py-24 sm:py-32 bg-[radial-gradient(600px_250px_at_50%_0%,rgba(27,118,255,0.06),transparent_60%)] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal delay={1} className="w-full">
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-center text-neutral-dark mb-4 text-balance">
              See what you can build
            </h2>
          </Reveal>
          <Reveal delay={2} className="w-full">
            <p className="text-center text-neutral-gray mb-14 max-w-lg mx-auto leading-relaxed text-pretty">
              Every Medify site starts with a professionally designed template. Customize colors, content, and features &mdash; no coding required.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                type: 'Hospital',
                tag: 'For Hospitals &amp; Clinics',
                desc: 'Department pages, doctor profiles, appointment booking, and AI chatbot &mdash; everything a modern medical practice needs to serve patients online.',
                features: ['Doctor profiles & departments', 'Appointment booking system', 'Patient portal', 'AI chatbot'],
                href: '/templates/hospital',
                img: '/logo.png',
              },
              {
                type: 'Pharmacy',
                tag: 'For Pharmacies',
                desc: 'Product catalog, e-commerce checkout, prescription refills, and Google Sheets sync &mdash; a full online storefront built in one session.',
                features: ['Product catalog & inventory', 'Online ordering & checkout', 'Prescription management', 'Google Sheets sync'],
                href: '/templates/pharmacy/1?demo=1',
                img: '/first_templete.png',
              },
            ].map((p, i) => (
              <Reveal key={p.type} delay={i + 2} className="w-full">
                <div className="bg-white border border-neutral-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-48 sm:h-56 bg-neutral-light relative overflow-hidden">
                    <Image
                      src={p.img}
                      alt={`${p.type} website preview`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary mb-4">
                      {p.tag}
                    </div>
                    <p className="text-neutral-gray text-sm leading-relaxed mb-5">{p.desc}</p>
                    <ul className="space-y-2 mb-6">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm text-neutral-dark">
                          <FiCheck size={15} className="text-primary shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link 
                      href={p.href}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white px-6 py-3 text-sm bg-white text-primary border-2 border-primary hover:bg-primary-light hover:text-primary-dark"
                    >
                      Preview {p.type} Template
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — one line */}
      <section className="py-20 sm:py-28 bg-primary-dark overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal delay={1} className="w-full">
            <p className="text-center text-primary-light font-semibold text-sm uppercase tracking-[0.12em] mb-4">Simple pricing</p>
          </Reveal>
          <Reveal delay={2} className="w-full">
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-center text-white mb-4 text-balance">
              From $9/month. No setup fees.
            </h2>
          </Reveal>
          <Reveal delay={3} className="w-full">
            <p className="text-center text-primary-light mb-12 max-w-lg mx-auto leading-relaxed text-pretty">
              Every plan includes AI chatbot, booking, and everything you need. Pick the path that fits your facility.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Reveal delay={3} className="w-full">
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-3xl p-7 sm:p-8 h-full flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-1 font-display">Hospital</h3>
                <p className="text-primary-light/80 text-sm mb-4">Websites &amp; patient portal</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white font-display">$9</span>
                  <span className="text-primary-light/80 text-sm font-medium ml-1">/month</span>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {[
                    'Basic: $9/mo \u2014 essential site & booking',
                    'Premium: $29/mo \u2014 AI, reviews, WhatsApp',
                    'Guided setup & department manager',
                    'No setup fees, cancel anytime',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white">
                      <FiCheck size={15} className="text-primary-light/60 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/signup?type=hospital" 
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 bg-white text-primary px-6 py-3 text-sm hover:bg-white/90 shadow-lg shadow-black/10"
                >
                  Choose Hospital Plan
                </Link>
              </div>
            </Reveal>
            <Reveal delay={4} className="w-full">
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-3xl p-7 sm:p-8 h-full flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-1 font-display">Pharmacy</h3>
                <p className="text-primary-light/80 text-sm mb-4">E-commerce storefront</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white font-display">$15</span>
                  <span className="text-primary-light/80 text-sm font-medium ml-1">&ndash;$28 one-time</span>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {[
                    'Minimal $15 / Classic $20',
                    'Premium: Modern, Bento, Glass, Concierge $24-28',
                    'AI chatbot, WhatsApp & Sheets sync',
                    'One-time payment, no subscriptions',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white">
                      <FiCheck size={15} className="text-primary-light/60 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/signup?type=pharmacy" 
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 bg-white/10 text-white border border-white/20 px-6 py-3 text-sm hover:bg-white/20 hover:border-white/30"
                >
                  Choose Pharmacy Plan
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-dark text-white/70 py-12 sm:py-16 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center flex-shrink-0 brightness-0 invert">
              <div className="relative w-28 h-9 sm:w-36 sm:h-11 flex-shrink-0">
                <Image
                  src="/logo.svg"
                  alt="Medify logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-sm text-center sm:text-left">&copy; 2026 Medify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
