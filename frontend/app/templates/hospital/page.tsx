'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { FiX, FiSettings, FiZap } from 'react-icons/fi'
import { Heart, Users, Activity, Shield, Stethoscope } from 'lucide-react'
import type { Doctor, HospitalPhoto } from '@/types/hospital'

// Import official Medify components
import BookingFormBlock from '@/components/hospital/blocks/BookingFormBlock'
import DoctorsListClient from '@/components/hospital/blocks/DoctorsListClient'
import DepartmentsCarousel from '@/components/hospital/blocks/DepartmentsCarousel'
import { HospitalGalleryBlock } from '@/components/hospital/blocks/HospitalGalleryBlock'
import ContactBlock from '@/components/hospital/blocks/ContactBlock'
import HospitalChatWidget from '@/components/hospital/HospitalChatWidget'
import TestimonialsCarousel from '@/components/hospital/TestimonialsCarousel'
import HeroBackgroundSlideshow from '@/components/hospital/blocks/HeroBackgroundSlideshow'

// Color theme definitions
const THEMES = [
  { name: 'Trust Blue', primary: '#1B76FF', secondary: '#0C4EB7', light: '#E7F2FF' },
  { name: 'Emergency Red', primary: '#FF4C4C', secondary: '#C82333', light: '#FEF2F2' },
  { name: 'Forest Green', primary: '#0D9488', secondary: '#0F766E', light: '#F0FDFA' },
  { name: 'Classic Slate', primary: '#4F46E5', secondary: '#3730A3', light: '#EEF2FF' },
]

// Radii definitions
const RADII = [
  { name: 'Sharp', value: '0px' },
  { name: 'Curved', value: '12px' },
  { name: 'Rounded', value: '24px' },
]

// Font definitions
const FONTS = [
  { name: 'Fraunces + Manrope', font: 'Manrope', displayFont: 'Fraunces' },
  { name: 'Clean Sans', font: 'Inter', displayFont: 'Inter' },
]

// Mock Data matching types/hospital.ts
const MOCK_DOCTORS: Doctor[] = [
  { 
    id: '1', 
    name: 'Dr. Sarah Johnson', 
    title: 'Lead Pediatric Specialist',
    specialty: 'Pediatrics', 
    experience: '15 years',
    bio: 'Lead pediatric specialist with over 15 years experience. Dedicated to family care.', 
    image: '/first_templete.png',
    image_url: '/first_templete.png', 
    image_url_resolved: '/first_templete.png',
    is_active: true,
    department: '2',
    department_name: 'Pediatrics',
    website_setup: 'demo-setup',
    created_at: '2026-07-18T12:00:00Z',
    updated_at: '2026-07-18T12:00:00Z',
    schedules: []
  },
  { 
    id: '2', 
    name: 'Dr. Ahmed Hassan', 
    title: 'Chief Cardiologist',
    specialty: 'Cardiology', 
    experience: '12 years',
    bio: 'Board-certified cardiologist focusing on clinical care and diagnostics.', 
    image: '/mod logo.png',
    image_url: '/mod logo.png', 
    image_url_resolved: '/mod logo.png',
    is_active: true,
    department: '1',
    department_name: 'Cardiology',
    website_setup: 'demo-setup',
    created_at: '2026-07-18T12:00:00Z',
    updated_at: '2026-07-18T12:00:00Z',
    schedules: []
  },
  { 
    id: '3', 
    name: 'Dr. Emily Brooks', 
    title: 'Emergency Physician',
    specialty: 'Emergency Medicine', 
    experience: '8 years',
    bio: 'Specialist in emergency medicine and trauma care. 24/7 responsiveness.', 
    image: '/logo.png',
    image_url: '/logo.png', 
    image_url_resolved: '/logo.png',
    is_active: true,
    department: '5',
    department_name: 'Emergency Medicine',
    website_setup: 'demo-setup',
    created_at: '2026-07-18T12:00:00Z',
    updated_at: '2026-07-18T12:00:00Z',
    schedules: []
  },
  { 
    id: '4', 
    name: 'Dr. David Kim', 
    title: 'Orthopedic Surgeon',
    specialty: 'Orthopedics', 
    experience: '14 years',
    bio: 'Consultant orthopedic surgeon with pediatric and adult reconstructive focus.', 
    image: '/mod logo.png',
    image_url: '/mod logo.png', 
    image_url_resolved: '/mod logo.png',
    is_active: true,
    department: '3',
    department_name: 'Orthopedics',
    website_setup: 'demo-setup',
    created_at: '2026-07-18T12:00:00Z',
    updated_at: '2026-07-18T12:00:00Z',
    schedules: []
  }
]

const MOCK_DEPARTMENTS = [
  { id: '1', name: 'Cardiology', description: 'Comprehensive cardiac diagnostics and treatment.', icon: Heart },
  { id: '2', name: 'Pediatrics', description: 'Primary healthcare for infants, toddlers, and teenagers.', icon: Users },
  { id: '3', name: 'Orthopedics', description: 'Advanced surgical and non-surgical musculoskeletal care.', icon: Activity },
  { id: '4', name: 'Neurology', description: 'Nervous system and brain disorder therapy.', icon: Shield },
  { id: '5', name: 'Emergency Medicine', description: 'Immediate critical care support around the clock.', icon: Stethoscope },
]

const MOCK_PHOTOS: HospitalPhoto[] = [
  {
    id: '1',
    image: null,
    image_url: '/logo.png',
    alt_text: 'State of the art ICU facility',
    caption: 'State of the art ICU facility',
    display_order: 1,
    is_active: true,
    created_at: '2026-07-18T12:00:00Z',
    updated_at: '2026-07-18T12:00:00Z'
  },
  {
    id: '2',
    image: null,
    image_url: '/first_templete.png',
    alt_text: 'Modern patient treatment room',
    caption: 'Modern patient treatment room',
    display_order: 2,
    is_active: true,
    created_at: '2026-07-18T12:00:00Z',
    updated_at: '2026-07-18T12:00:00Z'
  }
]

const MOCK_TESTIMONIALS = [
  {
    quote: 'The appointment flow is simple, and the doctors are always on time and incredibly supportive. I felt genuinely cared for from the moment I walked in.',
    name: 'Elena Richards',
    role: 'Patient since 2021',
    rating: 5,
  },
  {
    quote: 'From emergency care to follow-up consultations, the staff handled everything with exceptional professionalism and genuine compassion.',
    name: 'David Chen',
    role: 'Patient since 2022',
    rating: 5,
  },
  {
    quote: 'Professional team, modern facilities, and a clear communication style. They explained every step of my treatment in simple terms.',
    name: 'Sarah Mitchell',
    role: 'Patient since 2020',
    rating: 4,
  },
]

export default function HospitalPreviewPage() {
  // Customizer state
  const [activeTheme, setActiveTheme] = useState(THEMES[0])
  const [activeRadius, setActiveRadius] = useState(RADII[1])
  const [activeFont, setActiveFont] = useState(FONTS[0])
  const [panelOpen, setPanelOpen] = useState(true)

  // Intercept window.fetch to mock API endpoints locally on this preview page
  useEffect(() => {
    if (typeof window === 'undefined') return
    const originalFetch = window.fetch

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()

      // 1. Doctors list
      if (url.includes('/hospital/public/doctors/')) {
        return new Response(JSON.stringify(MOCK_DOCTORS), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // 2. Departments list
      if (url.includes('/hospital/public/departments/')) {
        return new Response(JSON.stringify(MOCK_DEPARTMENTS), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // 3. Available booking slots
      if (url.includes('/hospital/booking/available_slots/')) {
        const fakeSlots = {
          slots: [
            { id: 'slot-1', start_datetime: '2026-07-20T08:00:00Z', end_datetime: '2026-07-20T08:30:00Z' },
            { id: 'slot-2', start_datetime: '2026-07-20T10:30:00Z', end_datetime: '2026-07-20T11:00:00Z' },
            { id: 'slot-3', start_datetime: '2026-07-20T14:00:00Z', end_datetime: '2026-07-20T14:30:00Z' },
            { id: 'slot-4', start_datetime: '2026-07-20T16:30:00Z', end_datetime: '2026-07-20T17:00:00Z' }
          ]
        }
        return new Response(JSON.stringify(fakeSlots), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // 4. Create appointment
      if (url.includes('/hospital/booking/create_appointment/')) {
        const fakeAppointment = { id: 'fake-appointment-id', patient_name: 'Patient Name' }
        return new Response(JSON.stringify(fakeAppointment), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // 5. Chatbot query
      if (url.includes('/chatbot/')) {
        let reply = "Hello! I am your AI Health Assistant. How can I help you today?"
        if (init?.body) {
          try {
            const bodyObj = JSON.parse(init.body as string)
            const query = (bodyObj.message || '').toLowerCase()
            
            if (query.includes('hour') || query.includes('time') || query.includes('open')) {
              reply = "St. Jude Hospital outpatient services are open Mon-Fri from 8:00 AM to 8:00 PM, and Saturday from 9:00 AM to 5:00 PM. Our emergency department is open 24/7."
            } else if (query.includes('location') || query.includes('address') || query.includes('where')) {
              reply = "We are located at 450 Medical Center Parkway, Suite 100. Valet parking is available at the main clinic entrance."
            } else if (query.includes('doctor') || query.includes('pediatrician') || query.includes('specialist')) {
              reply = "We have highly experienced specialists including Dr. Sarah Johnson (Pediatrics) and Dr. Ahmed Hassan (Cardiology). You can select them inside our booking form."
            } else if (query.includes('book') || query.includes('appointment')) {
              reply = "You can schedule your appointment directly using our online Booking Form on this page."
            }
          } catch {}
        }
        const chatbotResponse = {
          response: reply,
          suggestions: ["What are your hours?", "Where are you located?", "Book an appointment"]
        }
        return new Response(JSON.stringify(chatbotResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Default fallback
      return originalFetch(input, init)
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  return (
    <div 
      className="hospital-theme-root min-h-screen relative flex flex-col bg-slate-50 text-slate-800 transition-all duration-300"
      style={{
        '--hospital-font': activeFont.font
      } as React.CSSProperties}
    >
      {/* Dynamic Font Links */}
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Manrope:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Published Design Variable Overrides */}
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --hospital-primary: ${activeTheme.primary};
          --hospital-bg: #f8fafc;
          --hospital-surface: #ffffff;
          --hospital-surface-alt: #f1f5f9;
          --hospital-text: #0f172a;
          --hospital-text-muted: #475569;
          --hospital-border: #e2e8f0;
          --hospital-link: ${activeTheme.primary};
          --hospital-btn-primary: ${activeTheme.primary};
          --hospital-btn-primary-text: #ffffff;
          --hospital-btn-primary-hover: ${activeTheme.secondary};
          --hospital-btn-secondary: #ffffff;
          --hospital-btn-secondary-text: ${activeTheme.primary};
          --hospital-btn-secondary-border: color-mix(in srgb, ${activeTheme.primary} 30%, white);
          --hospital-btn-secondary-hover: color-mix(in srgb, ${activeTheme.primary} 10%, white);
          --hospital-input-bg: #f8fafc;
          --hospital-input-border: #cbd5e1;
          --hospital-input-focus: ${activeTheme.primary};
          --hospital-radius: ${activeRadius.value};
          --hospital-font-family: ${activeFont.font};
          --hospital-font-size: 16px;
          --hospital-primary-soft: ${activeTheme.light};
          --hospital-primary-strong: ${activeTheme.secondary};
        }
        .hospital-theme-root {
          font-family: var(--hospital-font-family), sans-serif !important;
        }
        h1, h2, h3, .font-display {
          font-family: ${activeFont.displayFont}, serif !important;
        }
      `}} />

      {/* Customizer Panel */}
      <div 
        className={`fixed top-4 left-4 z-50 bg-white border border-slate-200 shadow-2xl p-5 w-80 transition-all duration-300 ${
          panelOpen ? 'translate-x-0 opacity-100' : '-translate-x-[90%] opacity-40 hover:opacity-100'
        }`}
        style={{ borderRadius: '16px' }}
      >
        <button 
          onClick={() => setPanelOpen(!panelOpen)}
          className="absolute -right-3 top-6 bg-slate-800 text-white p-2 rounded-full shadow-lg hover:scale-105 transition-transform"
          style={{ backgroundColor: activeTheme.primary }}
          aria-label="Toggle customizer panel"
        >
          {panelOpen ? <FiX size={16} /> : <FiSettings size={16} />}
        </button>

        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <FiSettings className="text-slate-500 animate-spin-slow" />
          <h2 className="font-semibold text-slate-900 text-sm tracking-wide uppercase">Template Customizer</h2>
        </div>

        {/* Theme select */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Color Palette</label>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map(t => (
              <button
                key={t.name}
                onClick={() => setActiveTheme(t)}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium border transition-all text-left ${
                  activeTheme.name === t.name 
                    ? 'border-slate-800 bg-slate-50 text-slate-900' 
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.primary }} />
                <span>{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Radius select */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Border Radii</label>
          <div className="grid grid-cols-3 gap-2">
            {RADII.map(r => (
              <button
                key={r.name}
                onClick={() => setActiveRadius(r)}
                className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
                  activeRadius.name === r.name 
                    ? 'border-slate-800 bg-slate-50 text-slate-900' 
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        {/* Font select */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Typography Setup</label>
          <div className="flex flex-col gap-2">
            {FONTS.map(f => (
              <button
                key={f.name}
                onClick={() => setActiveFont(f)}
                className={`p-2 rounded-lg text-xs font-medium border text-left transition-all ${
                  activeFont.name === f.name 
                    ? 'border-slate-800 bg-slate-50 text-slate-900' 
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TOP ANNOUNCEMENT BAR (From layouts.tsx) */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 text-slate-100 w-full">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ background: '#dc2626', color: '#ffffff' }}>
              <FiZap size={14} className="inline animate-pulse" /> 24/7 Emergency
            </span>
            <span className="font-bold text-white">Call 911</span>
          </div>
          <div className="hidden items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200 sm:flex">
            <a href="#booking" className="hover:text-white">Book Online</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </div>
        </div>
      </div>

      {/* STICKY HEADER (From layouts.tsx) */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur w-full">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white font-bold" style={{ backgroundColor: 'var(--hospital-primary)' }}>
              +
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold tracking-tight">St. Jude General Hospital</span>
              <span className="text-xs text-slate-500">Your trusted neighborhood partner</span>
            </div>
          </div>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#hero" className="hover:text-slate-900">Home</a>
            <a href="#departments" className="hover:text-slate-900">Departments</a>
            <a href="#doctors" className="hover:text-slate-900">Doctors</a>
            <a href="#contact" className="hover:text-slate-900">Contact</a>
          </nav>

          <a
            href="#booking"
            className="px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ backgroundColor: 'var(--hospital-btn-primary)', borderRadius: 'var(--hospital-radius)' }}
          >
            Book Appointment
          </a>
        </div>
      </header>

      {/* Simulating published sections layout */}
      <main className="flex-1">
        {/* HERO BLOCK (Exact design parity with HeroBlock.tsx) */}
        <section
          id="hero"
          className="relative w-full min-h-[92vh] flex flex-col justify-center overflow-hidden"
          style={{ background: 'var(--hospital-bg)' }}
        >
          {/* Slideshow background */}
          <HeroBackgroundSlideshow photos={MOCK_PHOTOS} fallbackImage="/chatbot.webp" />

          {/* Animated floating shapes */}
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="animate-float absolute rounded-full w-[420px] h-[420px] -top-[100px] right-[5%] opacity-[0.05]" style={{ background: 'var(--hospital-btn-primary-text)', animationDuration: '7s' }} />
            <div className="animate-float absolute rounded-full w-[280px] h-[280px] bottom-[60px] right-[20%] opacity-[0.05]" style={{ background: 'var(--hospital-btn-primary-text)', animationDuration: '9s', animationDelay: '2s' }} />
          </div>

          {/* Hero Content Container */}
          <div className="relative z-30 container mx-auto px-6 sm:px-10 lg:px-16 py-24 sm:py-32 flex flex-col items-start max-w-5xl">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 tracking-wide"
              style={{ background: 'var(--hospital-primary-soft)', color: 'var(--hospital-primary-strong)' }}
            >
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--hospital-primary-strong)' }} />
              Trusted Healthcare Provider
            </span>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6 max-w-3xl"
              style={{ textShadow: '0 2px 24px rgba(0,0,0,0.18)' }}
            >
              Compassionate Care,<br />Exceptional Medicine
            </h1>

            <p className="text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed text-white/80">
              We combine world-class medical expertise with heartfelt compassion to deliver the best possible outcomes for every patient.
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              <a
                href="#booking"
                className="inline-flex items-center gap-2 px-7 py-3.5 font-bold text-base transition-all duration-200 hover:scale-105 active:scale-100"
                style={{
                  background: '#ffffff',
                  color: 'var(--hospital-btn-primary)',
                  borderRadius: 'var(--hospital-radius)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.22)'
                }}
              >
                Book Appointment
              </a>
              <a
                href="#departments"
                className="inline-flex items-center gap-2 px-7 py-3.5 font-bold text-base text-white transition-all duration-200 hover:scale-105 active:scale-100 hover:bg-white/20"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '2px solid rgba(255,255,255,0.85)',
                  borderRadius: 'var(--hospital-radius)',
                  backdropFilter: 'blur(6px)'
                }}
              >
                Explore Specialties
              </a>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap gap-3 mt-14">
              <span
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold border"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  borderColor: 'rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <Stethoscope className="w-4 h-4" />
                4+ Board-Certified Doctors
              </span>
              <span
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold border"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  borderColor: 'rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <Heart className="w-4 h-4" />
                5+ Specialties
              </span>
            </div>
          </div>
        </section>

        {/* DEPARTMENTS BLOCK */}
        <section id="departments" className="relative w-full overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
          <div aria-hidden="true" className="pointer-events-none absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full blur-3xl opacity-30" style={{ background: 'var(--hospital-primary-soft)' }} />
          
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
              <div className="max-w-2xl">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border mb-4"
                  style={{ background: 'var(--hospital-surface)', borderColor: 'var(--hospital-border)', color: 'var(--hospital-text-muted)' }}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  5 Specialties Available
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: 'var(--hospital-text)' }}>Our Departments & Specialties</h2>
              </div>
            </div>

            {/* Official Departments Carousel */}
            <DepartmentsCarousel departments={MOCK_DEPARTMENTS} />
          </div>
        </section>

        {/* GALLERY BLOCK */}
        <div className="bg-slate-50 border-t border-b border-slate-100">
          <HospitalGalleryBlock subdomain="demo-subdomain" photos={MOCK_PHOTOS} />
        </div>

        {/* BOOKING FORM BLOCK (Official interactive multi-step component) */}
        <section id="booking" className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <BookingFormBlock 
              settings={{ title: 'Book Your Appointment', success_message: 'Your appointment is registered.' }} 
              subdomain="demo-subdomain" 
            />
          </div>
        </section>

        {/* DOCTORS LIST CLIENT (Official doctors showcase) */}
        <section id="doctors" className="py-20 bg-slate-50 border-t border-b border-slate-200/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <DoctorsListClient 
              title="Meet Our Doctors" 
              subtitle="Highly experienced board-certified specialists ready to care for you." 
              doctors={MOCK_DOCTORS} 
            />
          </div>
        </section>

        {/* TESTIMONIALS (Using real TestimonialsCarousel component) */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Patient Testimonials</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-12">Read reviews from individuals and families in our care program.</p>
            <TestimonialsCarousel testimonials={MOCK_TESTIMONIALS} />
          </div>
        </section>

        {/* CONTACT BLOCK (Official contact card component) */}
        <section id="contact" className="py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <ContactBlock 
              businessPhone="+1 (555) 765-4321"
              businessEmail="contact@stjudehospital.org"
              businessAddress="450 Medical Center Parkway, Suite 100"
              businessHours="Mon–Fri: 8:00 AM - 8:00 PM, Sat: 9:00 AM - 5:00 PM, Sun: Closed (Outpatients)"
            />
          </div>
        </section>
      </main>

      {/* FOOTER (Exact copy of subdomain footer layout) */}
      <footer className="border-t border-slate-200 bg-slate-900 text-slate-200 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold" style={{ backgroundColor: activeTheme.primary }}>
              +
            </span>
            <span className="font-bold text-white">St. Jude General Hospital</span>
          </div>
          <p className="text-xs text-slate-400">&copy; 2026 Medify Preview Environment. All rights reserved.</p>
        </div>
      </footer>

      {/* OFFICIAL INTERACTIVE AI CHATBOT WIDGET */}
      <HospitalChatWidget 
        hospitalName="St. Jude General Hospital"
        hospitalPhone="+1 (555) 765-4321"
        subdomain="demo-subdomain"
        enabled={true}
      />
    </div>
  )
}
