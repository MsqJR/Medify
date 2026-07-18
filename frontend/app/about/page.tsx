'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

const team = [
  {
    name: 'Ahmed Hassan',
    role: 'CEO & Co-Founder',
    bio: 'Former hospital administrator who saw firsthand how hard it is for medical facilities to build a modern web presence.',
    initials: 'AH',
  },
  {
    name: 'Sarah James',
    role: 'CTO & Co-Founder',
    bio: 'Built her first medical scheduling app at 19. Now she architects the platform that powers thousands of clinics.',
    initials: 'SJ',
  },
  {
    name: 'Omar Khaled',
    role: 'Head of Product',
    bio: 'Spent a decade designing SaaS products. Believes medical software should feel as calm as a well-run waiting room.',
    initials: 'OK',
  },
  {
    name: 'Lina Williams',
    role: 'Head of Design',
    bio: 'Designs interfaces that disappear into the task. Previously led design at two health-tech startups.',
    initials: 'LW',
  },
]

const values = [
  {
    heading: 'Speed is a feature, not a promise',
    body: 'Every interaction should feel fast. From the moment a medical professional signs up to the moment their site goes live — minutes, not days. We measure ourselves by how quickly we can get a facility online, because every day without a website is a day patients cannot find them. Our setup flow is minimal by design, our templates load instantly, and our AI assistant removes friction at every step.',
  },
  {
    heading: 'One platform, one voice',
    body: 'Hospital features, pharmacy tools, and AI capabilities should feel like intentional parts of a single product — not modules bolted together from different products. Whether you are managing doctors or products, the experience is coherent, the design language is consistent, and the platform adapts to your context without making you relearn the interface.',
  },
  {
    heading: 'Professional warmth',
    body: 'Medical websites carry trust. Every pixel should reflect that. Our typography is clear, our blue palette signals capability rather than temperature, and our layouts use generous whitespace that feels calm, not sparse. We reject the cold institutional aesthetic of traditional medical software. Authority without warmth is not authority — it is intimidation.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-dark overflow-x-hidden w-full">
      {/* Navigation */}
      <nav className="sticky top-0 z-20 border-b border-neutral-border bg-white/80 backdrop-blur overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between w-full">
          <Link href="/" className="flex items-center flex-shrink-0">
            <div className="relative w-28 h-8 sm:w-36 sm:h-10 flex-shrink-0">
              <Image
                src="/logo.svg"
                alt="Medify logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-neutral-gray hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="#story" className="text-sm font-medium text-neutral-gray hover:text-primary transition-colors">
              Story
            </Link>
            <Link href="#platform" className="text-sm font-medium text-neutral-gray hover:text-primary transition-colors">
              Platform
            </Link>
            <Link href="#values" className="text-sm font-medium text-neutral-gray hover:text-primary transition-colors">
              Values
            </Link>
            <Link href="#team" className="text-sm font-medium text-neutral-gray hover:text-primary transition-colors">
              Team
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/login" className="text-sm sm:text-base text-neutral-gray hover:text-primary transition-colors">
              Login
            </Link>
            <Link href="/signup">
              <Button className="text-sm sm:text-base px-4 sm:px-6 py-2">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-aurora py-20 sm:py-32 overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-tight text-neutral-dark mb-6 text-balance">
              We give every medical facility a real shot online
            </h1>
            <p className="text-lg sm:text-xl text-neutral-gray leading-relaxed max-w-2xl text-pretty">
              Medify was founded on a simple belief: running a clinic or pharmacy is hard enough without struggling to build a website. So we built a platform that makes it fast, affordable, and genuinely beautiful.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section id="story" className="py-16 sm:py-24 overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
            <div className="lg:col-span-3">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-neutral-dark mb-6 text-balance">
                Built by people who know the problem
              </h2>
              <div className="space-y-5 text-neutral-gray text-base sm:text-lg leading-relaxed text-pretty max-w-[65ch]">
                <p>
                  In 2023, our co-founders watched a friend — a talented pharmacist — spend six weeks and over three thousand dollars on a website that still felt slapped together. They kept hearing the same story from clinic owners, hospital administrators, and pharmacy managers: building an online presence meant navigating expensive agencies, confusing platforms, or both.
                </p>
                <p>
                  So they built Medify. The goal was not another website builder. It was a platform purpose-built for medical facilities — one that understands appointment booking, prescription refills, department pages, AI-powered patient support, and the trust that every medical brand carries.
                </p>
                <p className="text-neutral-dark font-semibold">
                  Today, Medify powers hundreds of clinics, hospitals, and pharmacies across the region. From a single-dermatologist practice to a multi-branch hospital group — the platform scales, and the setup still takes minutes.
                </p>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-primary-light rounded-3xl p-8 sm:p-10 h-full">
                <blockquote className="text-xl sm:text-2xl text-primary-dark font-semibold leading-relaxed">
                  &ldquo;A clinic&rsquo;s website should not be a project. It should be a page.&rdquo;
                </blockquote>
                <div className="mt-6 pt-6 border-t border-primary/20">
                  <p className="font-semibold text-neutral-dark">Ahmed Hassan</p>
                  <p className="text-sm text-neutral-gray">CEO &amp; Co-Founder, Medify</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Build */}
      <section id="platform" className="section-glow py-16 sm:py-24 overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-neutral-dark mb-4 text-balance">
            One platform, two worlds
          </h2>
          <p className="text-neutral-gray text-lg mb-12 sm:mb-16 max-w-2xl text-pretty">
            Hospitals and pharmacies have different needs. Medify treats them that way — each gets a tailored experience built from the same foundation.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Hospital */}
            <div className="bg-white rounded-3xl border border-neutral-border p-8 sm:p-10">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neutral-dark mb-3">For Hospitals &amp; Clinics</h3>
              <p className="text-neutral-gray mb-6 leading-relaxed">
                A complete hospital website with department pages, doctor profiles, appointment booking, and AI-assisted patient support. Your patients find you, book instantly, and get answers around the clock.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Department and doctor management',
                  'Online appointment booking',
                  'AI chatbot for patient questions',
                  'Review and rating system',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-neutral-dark">
                    <span className="w-5 h-5 rounded-full bg-success-light flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-success" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup?type=hospital">
                <Button variant="primary" className="w-full sm:w-auto">
                  Build a Hospital Website
                </Button>
              </Link>
            </div>

            {/* Pharmacy */}
            <div className="bg-gradient-to-br from-primary-light/40 to-white rounded-3xl border border-primary/20 p-8 sm:p-10">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neutral-dark mb-3">For Pharmacies</h3>
              <p className="text-neutral-gray mb-6 leading-relaxed">
                A full e-commerce pharmacy storefront with product catalog, order management, and Google Sheets sync. Your customers browse, order, and refill prescriptions — all from a site that takes hours rather than weeks to set up.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Product catalog and e-commerce',
                  'Prescription refill management',
                  'Bidirectional Google Sheets sync',
                  'AI chatbot for medication queries',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-neutral-dark">
                    <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-white" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup?type=pharmacy">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Build a Pharmacy Website
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section id="values" className="py-16 sm:py-24 overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-neutral-dark mb-4 text-balance">
            How we work
          </h2>
          <p className="text-neutral-gray text-lg mb-12 sm:mb-16 max-w-2xl text-pretty">
            Three principles shape every decision we make at Medify.
          </p>
          <div className="space-y-20">
            {values.map((value, i) => (
              <div
                key={value.heading}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="md:sticky md:top-32">
                  <span
                    className="block w-12 h-1 rounded-full mb-6"
                    style={{ backgroundColor: `hsla(216, 100%, ${60 - i * 10}%, 0.4)` }}
                  />
                  <h3 className="text-2xl sm:text-3xl font-bold text-neutral-dark text-balance">
                    {value.heading}
                  </h3>
                </div>
                <div>
                  <p className="text-neutral-gray text-lg leading-relaxed text-pretty max-w-[65ch]">
                    {value.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section id="team" className="section-glow py-16 sm:py-24 overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-neutral-dark mb-4 text-balance">
            The team behind Medify
          </h2>
          <p className="text-neutral-gray text-lg mb-12 sm:mb-16 max-w-2xl text-pretty">
            A small team with deep experience in healthcare, technology, and design.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.name} className="group">
                <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-primary/5 to-primary-light/40 mb-5 flex items-center justify-center overflow-hidden">
                  <span className="text-5xl sm:text-6xl font-display font-bold text-primary/20 select-none">
                    {member.initials}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-neutral-dark">{member.name}</h3>
                <p className="text-sm font-medium text-primary mb-2">{member.role}</p>
                <p className="text-sm text-neutral-gray leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="bg-primary-dark rounded-3xl p-10 sm:p-16 text-center">
            <h2 className="font-display text-3xl sm:text-4xl text-white font-semibold mb-4 text-balance">
              Start building your medical website
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto text-pretty">
              Join hundreds of medical facilities already using Medify. Go from signup to a live, fully functioning website in a single session.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup?type=hospital">
                <Button variant="ghost" className="bg-white text-primary-dark hover:bg-primary-light hover:text-primary-dark text-base px-8 py-4">
                  Create Hospital Website
                </Button>
              </Link>
              <Link href="/signup?type=pharmacy">
                <Button className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-base px-8 py-4">
                  Create Pharmacy Website
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-dark text-white py-8 sm:py-12 overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8 text-center sm:text-left">
            <div>
              <h3 className="text-xl font-bold mb-4 font-display">Medify</h3>
              <p className="text-white/70">
                Building medical websites made simple.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-white/70">
                <li>
                  <Link href="/#features" className="hover:text-amber-200 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="hover:text-amber-200 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/#templates" className="hover:text-amber-200 transition-colors">
                    Templates
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/70">
                <li>
                  <Link href="/about" className="hover:text-amber-200 transition-colors">
                    About
                  </Link>
                </li>
                <li>Blog</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-white/70">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>API</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-white/70">
            <p>&copy; 2026 Medify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
