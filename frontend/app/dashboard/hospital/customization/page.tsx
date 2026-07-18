'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { PageHeader } from '@/components/dashboard'
import {
  FiSave,
  FiSettings,
  FiLayout,
  FiMessageSquare,
  FiCheckCircle,
  FiRefreshCw,
  FiEye,
  FiType,
  FiDroplet,
  FiSquare,
  FiSliders,
} from 'react-icons/fi'
import { Lock } from 'lucide-react'
import { hospitalAdminApi } from '@/lib/hospitalAdminApi'
import { normalizeLogoUrl } from '@/lib/storage'
import { SubscriptionProvider, useSubscription } from '@/contexts/SubscriptionContext'
import { LockedFeature } from '@/components/subscription/LockedFeature'
import { PLAN_LABELS, PLAN_BADGE_CLASSES } from '@/lib/subscriptionApi'
import type { HospitalProfile } from '@/types/hospital'
import type { ThemeSettings } from '@/components/hospital/customization/types'
import { SectionHeader } from '@/components/hospital/customization/SectionHeader'
import { SettingsCard } from '@/components/hospital/customization/SettingsCard'
import { ColorField } from '@/components/hospital/customization/ColorField'
import { ThemePreview } from '@/components/hospital/customization/ThemePreview'

import {
  DEFAULT_THEME,
  AVAILABLE_FONTS,
  FONT_SIZES,
  BORDER_RADIUS_OPTIONS,
  PRESET_THEMES,
} from '@/lib/hospital/customizationConstants'



// ── Main inner component ──────────────────────────────────────────────────────

function CustomizationContent() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [profile, setProfile] = useState<HospitalProfile | null>(null)
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME)

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Section expand/collapse
  const [expandedSections, setExpandedSections] = useState({
    brand: true,
    typography: true,
    colors: true,
    buttons: false,
    inputs: false,
    corners: false,
    chatbot: false,
  })

  const [showPreview, setShowPreview] = useState(true)

  // Trial chatbot preview states
  const [previewMessages, setPreviewMessages] = useState<Array<{ id: number; type: 'ai' | 'user'; content: string }>>([])
  const [previewInput, setPreviewInput] = useState('')
  const [previewTyping, setPreviewTyping] = useState(false)

  useEffect(() => {
    setPreviewMessages([
      {
        id: 1,
        type: 'ai',
        content: `Hello! I'm ${theme.chatbotName || 'Hospital Medical AI'}. I'm here to help patients with questions about our medical services, appointments, or specialties. How can I assist you today?`,
      },
    ])
  }, [theme.chatbotName])

  const handleSendPreview = () => {
    if (!previewInput.trim() || previewTyping) return

    const userMsg = {
      id: Date.now(),
      type: 'user' as const,
      content: previewInput.trim(),
    }

    setPreviewMessages((prev) => [...prev, userMsg])
    const messageText = previewInput.trim()
    setPreviewInput('')
    setPreviewTyping(true)

    setTimeout(() => {
      let aiContent = 'Thank you for your question. I can help you with information about appointments, departments, and finding the right specialist for your needs.'
      const lowerMessage = messageText.toLowerCase()

      if (lowerMessage.includes('pain') || lowerMessage.includes('hurt') || lowerMessage.includes('ache')) {
        if (lowerMessage.includes('chest') || lowerMessage.includes('heart')) {
          aiContent = 'Based on your chest pain symptoms, I recommend seeing a Cardiologist immediately. They specialize in heart and cardiovascular conditions. Would you like me to help you schedule an appointment?'
        } else if (lowerMessage.includes('head') || lowerMessage.includes('migraine')) {
          aiContent = 'For headaches and migraines, I suggest consulting with a Neurologist. They can properly diagnose and treat various types of headaches. Shall I check available appointments?'
        } else if (lowerMessage.includes('stomach') || lowerMessage.includes('abdomen')) {
          aiContent = 'Stomach pain could require a Gastroenterologist consultation. They specialize in digestive system issues. Would you like to book an appointment?'
        }
      } else if (lowerMessage.includes('skin') || lowerMessage.includes('rash') || lowerMessage.includes('acne')) {
        aiContent = 'For skin concerns, I recommend seeing a Dermatologist. They can help with various skin conditions. Would you like me to check their availability?'
      } else if (lowerMessage.includes('eye') || lowerMessage.includes('vision')) {
        aiContent = 'For eye or vision problems, an Ophthalmologist would be the right specialist to see. They can examine and treat eye conditions. Shall I help you schedule?'
      } else if (lowerMessage.includes('appointment') || lowerMessage.includes('book') || lowerMessage.includes('schedule')) {
        aiContent = 'I can help you book an appointment! We have specialists in Cardiology, Neurology, Gastroenterology, Dermatology, and Ophthalmology. Which department do you need?'
      } else if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('time')) {
        aiContent = 'Our hospital is open 24/7 for emergency care. Regular outpatient department clinics operate Monday through Saturday from 9:00 AM to 8:00 PM.'
      }

      setPreviewMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'ai' as const,
          content: aiContent,
        },
      ])
      setPreviewTyping(false)
    }, 1000)
  }

  const { planType, isActive, loading: subLoading } = useSubscription()

  // "Premium Plan" in the UI maps to backend key 'STANDARD'
  const canCustomize = isActive && planType === 'STANDARD'

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    const res = await hospitalAdminApi.getProfile()
    if (res.data) {
      setProfile(res.data)
      if (res.data.theme_settings && Object.keys(res.data.theme_settings).length > 0) {
        setTheme({ ...DEFAULT_THEME, ...res.data.theme_settings })
      }
      if (res.data.logo) {
        setLogoPreview(normalizeLogoUrl(res.data.logo))
      }
    } else {
      setError('Failed to load profile')
    }
    setLoading(false)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setLogoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleThemeChange = useCallback((key: keyof ThemeSettings, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handlePresetApply = (preset: Partial<ThemeSettings>) => {
    setTheme((prev) => ({ ...prev, ...preset }))
  }

  const handleReset = () => {
    setTheme(DEFAULT_THEME)
  }

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const formData = new FormData()
      formData.append('theme_settings', JSON.stringify(theme))
      if (logoFile) formData.append('logo', logoFile)
      const res = await hospitalAdminApi.updateProfile(formData)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess('Website customization saved successfully!')
        if (res.data) {
          setProfile(res.data)
          if (res.data.logo) setLogoPreview(normalizeLogoUrl(res.data.logo))
        }
      }
    } catch {
      setError('An unexpected error occurred while saving.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const hospitalName = profile?.name || 'My Hospital'

  return (
    <div className="pb-12">
      <PageHeader
        title="Website Customization"
        description="Design your hospital's public website and AI chatbot."
        badge={!subLoading && (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PLAN_BADGE_CLASSES[planType]}`}>
            {PLAN_LABELS[planType]}{isActive ? ' · Active' : ' · Inactive'}
          </span>
        )}
        actions={<div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowPreview((p) => !p)}
            className="flex items-center gap-2 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm text-neutral-gray hover:text-neutral-dark hover:border-neutral-gray transition-colors"
          >
            <FiEye size={14} />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm text-neutral-gray hover:text-neutral-dark hover:border-neutral-gray transition-colors"
          >
            <FiRefreshCw size={14} />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving
              ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              : <FiSave size={14} />
            }
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>}
      />

      {/* ── Alerts ── */}
      {error && (
        <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">{error}</div>
      )}
      {success && (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-200">
          <FiCheckCircle className="shrink-0" />
          {success}
        </div>
      )}

      {/* ── Plan access banner ── */}
      {!subLoading && !canCustomize && !isActive && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
          <Lock className="text-amber-500 w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Premium Plan Required</p>
            <p className="text-xs text-amber-700 mt-0.5">
              You don&apos;t have an active subscription. Purchase the <strong>Premium Plan</strong> to unlock full customization of your hospital&apos;s public website and AI chatbot.
            </p>
          </div>
        </div>
      )}
      {!subLoading && !canCustomize && isActive && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
          <Lock className="text-amber-500 w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Premium Plan Required</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Your current plan doesn&apos;t include website customization. Upgrade to the <strong>Premium Plan</strong> to unlock full customization of your hospital&apos;s public website and AI chatbot.
            </p>
          </div>
        </div>
      )}
      {!subLoading && canCustomize && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-3 flex items-center gap-2">
          <span className="text-green-600">✓</span>
          <p className="text-xs font-semibold text-green-700">All customization features are unlocked with your active Premium plan.</p>
        </div>
      )}

      {/* ── Two-column layout: editor + preview ── */}
      <div className={`flex gap-6 items-start ${showPreview ? 'flex-col lg:flex-row' : ''}`}>
        {/* Editor column */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* ── PRESET THEMES ── */}
          <LockedFeature locked={!canCustomize} featureName="Website Customization">
            <SettingsCard>
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FiDroplet size={16} />
                </span>
                <div>
                  <p className="font-semibold text-neutral-dark text-sm">Quick Presets</p>
                  <p className="text-xs text-neutral-gray">Apply a ready-made color scheme</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_THEMES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handlePresetApply(preset.theme)}
                    disabled={!canCustomize}
                    className="group flex items-center gap-2.5 rounded-lg border border-neutral-border px-3 py-2.5 text-left hover:border-primary hover:bg-primary/5 transition-all disabled:cursor-not-allowed"
                  >
                    <div className="flex -space-x-1 shrink-0">
                      {[preset.theme.buttonPrimaryColor, preset.theme.backgroundColor, preset.theme.surfaceAltColor].map((c, i) => (
                        <div
                          key={i}
                          className="h-5 w-5 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: c || '#ccc', zIndex: 3 - i }}
                        />
                      ))}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-neutral-dark group-hover:text-primary transition-colors">
                        <preset.icon className="inline-block w-4 h-4" /> {preset.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </SettingsCard>
          </LockedFeature>



          {/* ── TYPOGRAPHY ── */}
          <LockedFeature locked={!canCustomize} featureName="Website Customization">
            <SettingsCard>
              <SectionHeader
                icon={<FiType size={16} />}
                title="Typography"
                subtitle="Font family, size, and style"
                expanded={expandedSections.typography}
                onToggle={() => toggleSection('typography')}
              />
              {expandedSections.typography && (
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Font Family */}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-xs font-semibold text-neutral-gray uppercase tracking-wide mb-2">
                      Font Family
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {AVAILABLE_FONTS.map((font) => (
                        <button
                          key={font.value}
                          type="button"
                          onClick={() => handleThemeChange('fontFamily', font.value)}
                          disabled={!canCustomize}
                          className={`rounded-lg border-2 px-3 py-2.5 text-left transition-all disabled:cursor-not-allowed ${
                            theme.fontFamily === font.value
                              ? 'border-primary bg-primary/5'
                              : 'border-neutral-border hover:border-primary/50'
                          }`}
                          style={{ fontFamily: `'${font.value}', sans-serif` }}
                        >
                          <div className={`text-sm font-semibold ${theme.fontFamily === font.value ? 'text-primary' : 'text-neutral-dark'}`}>
                            {font.label}
                          </div>
                          <div className="text-xs text-neutral-gray">{font.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-gray uppercase tracking-wide mb-2">
                      Base Font Size
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FONT_SIZES.map((size) => (
                        <button
                          key={size.value}
                          type="button"
                          onClick={() => handleThemeChange('fontSize', size.value)}
                          disabled={!canCustomize}
                          className={`rounded-lg border-2 px-3 py-2 text-xs font-medium transition-all disabled:cursor-not-allowed ${
                            theme.fontSize === size.value
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-neutral-border text-neutral-gray hover:border-primary/50'
                          }`}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Style */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-gray uppercase tracking-wide mb-2">
                      Font Style
                    </label>
                    <div className="flex gap-2">
                      {(['normal', 'italic'] as const).map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => handleThemeChange('fontStyle', style)}
                          disabled={!canCustomize}
                          className={`flex-1 rounded-lg border-2 px-3 py-2 text-xs font-medium transition-all disabled:cursor-not-allowed capitalize ${
                            theme.fontStyle === style
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-neutral-border text-neutral-gray hover:border-primary/50'
                          }`}
                          style={style === 'italic' ? { fontStyle: 'italic' } : {}}
                        >
                          {style === 'normal' ? 'Normal' : 'Italic'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </SettingsCard>
          </LockedFeature>

          {/* ── COLORS ── */}
          <LockedFeature locked={!canCustomize} featureName="Website Customization">
            <SettingsCard>
              <SectionHeader
                icon={<FiDroplet size={16} />}
                title="Colors"
                subtitle="Background, text, and brand colors"
                expanded={expandedSections.colors}
                onToggle={() => toggleSection('colors')}
              />
              {expandedSections.colors && (
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <ColorField
                    label="Primary (Brand) Color"
                    value={theme.primaryColor}
                    onChange={(v) => handleThemeChange('primaryColor', v)}
                    disabled={!canCustomize}
                    hint="Main accent color used across the site"
                  />
                  <ColorField
                    label="Page Background Color"
                    value={theme.backgroundColor}
                    onChange={(v) => handleThemeChange('backgroundColor', v)}
                    disabled={!canCustomize}
                    hint="Overall page background"
                  />
                  <ColorField
                    label="Card / Surface Color"
                    value={theme.surfaceColor}
                    onChange={(v) => handleThemeChange('surfaceColor', v)}
                    disabled={!canCustomize}
                    hint="Background of cards and panels"
                  />
                  <ColorField
                    label="Section Background Color"
                    value={theme.surfaceAltColor}
                    onChange={(v) => handleThemeChange('surfaceAltColor', v)}
                    disabled={!canCustomize}
                    hint="Alternate section backgrounds"
                  />
                  <ColorField
                    label="Primary Text Color"
                    value={theme.textColor}
                    onChange={(v) => handleThemeChange('textColor', v)}
                    disabled={!canCustomize}
                    hint="Main body and heading text"
                  />
                  <ColorField
                    label="Muted / Secondary Text Color"
                    value={theme.mutedTextColor}
                    onChange={(v) => handleThemeChange('mutedTextColor', v)}
                    disabled={!canCustomize}
                    hint="Descriptions and helper text"
                  />
                  <ColorField
                    label="Link Color"
                    value={theme.linkColor}
                    onChange={(v) => handleThemeChange('linkColor', v)}
                    disabled={!canCustomize}
                    hint="Hyperlinks and interactive text"
                  />
                  <ColorField
                    label="Border / Divider Color"
                    value={theme.borderColor}
                    onChange={(v) => handleThemeChange('borderColor', v)}
                    disabled={!canCustomize}
                    hint="Card borders and dividers"
                  />
                </div>
              )}
            </SettingsCard>
          </LockedFeature>

          {/* ── BUTTON COLORS ── */}
          <LockedFeature locked={!canCustomize} featureName="Website Customization">
            <SettingsCard>
              <SectionHeader
                icon={<FiSquare size={16} />}
                title="Button Colors"
                subtitle="Primary and secondary button styles"
                expanded={expandedSections.buttons}
                onToggle={() => toggleSection('buttons')}
              />
              {expandedSections.buttons && (
                <div className="mt-5">
                  {/* Live preview of buttons */}
                  <div className="mb-5 flex flex-wrap items-center gap-3 p-4 rounded-lg border border-neutral-border"
                    style={{ backgroundColor: theme.backgroundColor || '#f8fafc' }}
                  >
                    <span className="text-xs text-neutral-gray font-medium">Preview:</span>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-semibold transition-colors rounded-lg"
                      style={{
                        backgroundColor: theme.buttonPrimaryColor,
                        color: theme.buttonPrimaryTextColor,
                        borderRadius: theme.borderRadius,
                      }}
                    >
                      Primary Button
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-semibold border transition-colors rounded-lg"
                      style={{
                        backgroundColor: theme.buttonSecondaryColor,
                        color: theme.buttonSecondaryTextColor,
                        borderColor: theme.buttonSecondaryBorderColor,
                        borderRadius: theme.borderRadius,
                      }}
                    >
                      Secondary Button
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-5">
                      <h3 className="text-xs font-bold text-neutral-dark uppercase tracking-wider">Primary Button</h3>
                      <ColorField
                        label="Background Color"
                        value={theme.buttonPrimaryColor}
                        onChange={(v) => handleThemeChange('buttonPrimaryColor', v)}
                        disabled={!canCustomize}
                      />
                      <ColorField
                        label="Text Color"
                        value={theme.buttonPrimaryTextColor}
                        onChange={(v) => handleThemeChange('buttonPrimaryTextColor', v)}
                        disabled={!canCustomize}
                      />
                      <ColorField
                        label="Hover Background Color"
                        value={theme.buttonPrimaryHoverColor}
                        onChange={(v) => handleThemeChange('buttonPrimaryHoverColor', v)}
                        disabled={!canCustomize}
                        hint="Color when mouse hovers over button"
                      />
                    </div>
                    <div className="space-y-5">
                      <h3 className="text-xs font-bold text-neutral-dark uppercase tracking-wider">Secondary Button</h3>
                      <ColorField
                        label="Background Color"
                        value={theme.buttonSecondaryColor}
                        onChange={(v) => handleThemeChange('buttonSecondaryColor', v)}
                        disabled={!canCustomize}
                      />
                      <ColorField
                        label="Text Color"
                        value={theme.buttonSecondaryTextColor}
                        onChange={(v) => handleThemeChange('buttonSecondaryTextColor', v)}
                        disabled={!canCustomize}
                      />
                      <ColorField
                        label="Border Color"
                        value={theme.buttonSecondaryBorderColor}
                        onChange={(v) => handleThemeChange('buttonSecondaryBorderColor', v)}
                        disabled={!canCustomize}
                      />
                      <ColorField
                        label="Hover Background Color"
                        value={theme.buttonSecondaryHoverColor}
                        onChange={(v) => handleThemeChange('buttonSecondaryHoverColor', v)}
                        disabled={!canCustomize}
                        hint="Color when mouse hovers over button"
                      />
                    </div>
                  </div>
                </div>
              )}
            </SettingsCard>
          </LockedFeature>

          {/* ── INPUT COLORS ── */}
          <LockedFeature locked={!canCustomize} featureName="Website Customization">
            <SettingsCard>
              <SectionHeader
                icon={<FiSliders size={16} />}
                title="Form Input Colors"
                subtitle="Text fields and form element styling"
                expanded={expandedSections.inputs}
                onToggle={() => toggleSection('inputs')}
              />
              {expandedSections.inputs && (
                <div className="mt-5">
                  {/* Input preview */}
                  <div className="mb-5 p-4 rounded-lg border border-neutral-border"
                    style={{ backgroundColor: theme.backgroundColor }}
                  >
                    <span className="text-xs text-neutral-gray font-medium block mb-2">Preview:</span>
                    <input
                      type="text"
                      readOnly
                      placeholder="Example input field..."
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none border transition-all"
                      style={{
                        backgroundColor: theme.inputBackgroundColor,
                        borderColor: theme.inputBorderColor,
                        color: theme.textColor,
                        borderRadius: theme.borderRadius,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <ColorField
                      label="Input Background Color"
                      value={theme.inputBackgroundColor}
                      onChange={(v) => handleThemeChange('inputBackgroundColor', v)}
                      disabled={!canCustomize}
                    />
                    <ColorField
                      label="Input Border Color"
                      value={theme.inputBorderColor}
                      onChange={(v) => handleThemeChange('inputBorderColor', v)}
                      disabled={!canCustomize}
                    />
                    <ColorField
                      label="Input Focus / Active Color"
                      value={theme.inputFocusColor}
                      onChange={(v) => handleThemeChange('inputFocusColor', v)}
                      disabled={!canCustomize}
                      hint="Border color when a field is focused"
                    />
                  </div>
                </div>
              )}
            </SettingsCard>
          </LockedFeature>

          {/* ── CORNER STYLE ── */}
          <LockedFeature locked={!canCustomize} featureName="Website Customization">
            <SettingsCard>
              <SectionHeader
                icon={<FiLayout size={16} />}
                title="Corner Style"
                subtitle="Border radius for cards, buttons, and inputs"
                expanded={expandedSections.corners}
                onToggle={() => toggleSection('corners')}
              />
              {expandedSections.corners && (
                <div className="mt-5">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {BORDER_RADIUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleThemeChange('borderRadius', opt.value)}
                        disabled={!canCustomize}
                        className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all disabled:cursor-not-allowed ${
                          theme.borderRadius === opt.value
                            ? 'border-primary bg-primary/5'
                            : 'border-neutral-border hover:border-primary/50'
                        }`}
                      >
                        <div
                          className="h-10 w-full border-2 transition-all"
                          style={{
                            borderRadius: opt.value,
                            borderColor: theme.borderRadius === opt.value
                              ? theme.buttonPrimaryColor || '#2563eb'
                              : '#cbd5e1',
                            backgroundColor: theme.borderRadius === opt.value
                              ? `${theme.buttonPrimaryColor || '#2563eb'}18`
                              : '#f8fafc',
                          }}
                        />
                        <div>
                          <div className={`text-xs font-semibold text-center ${theme.borderRadius === opt.value ? 'text-primary' : 'text-neutral-dark'}`}>
                            {opt.label}
                          </div>
                          <div className="text-[10px] text-neutral-gray text-center">{opt.description.split('–')[0].trim()}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </SettingsCard>
          </LockedFeature>

          {/* ── AI CHATBOT ── */}
          <LockedFeature locked={!canCustomize} featureName="Website Customization">
            <SettingsCard>
              <SectionHeader
                icon={<FiMessageSquare size={16} />}
                title="AI Chatbot Settings"
                subtitle="Customize your embedded chatbot"
                expanded={expandedSections.chatbot}
                onToggle={() => toggleSection('chatbot')}
              />
              {expandedSections.chatbot && (
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-gray uppercase tracking-wide mb-1.5">
                      Chatbot Display Name
                    </label>
                    <input
                      type="text"
                      value={theme.chatbotName}
                      onChange={(e) => handleThemeChange('chatbotName', e.target.value)}
                      placeholder="e.g. St. Jude Assistant"
                      className="w-full rounded-lg border border-neutral-border px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50"
                      disabled={!canCustomize}
                    />
                    <p className="mt-1 text-xs text-neutral-gray">Name shown in the chat widget header</p>
                  </div>
                  <ColorField
                    label="Chatbot Accent Color"
                    value={theme.chatbotColor}
                    onChange={(v) => handleThemeChange('chatbotColor', v)}
                    disabled={!canCustomize}
                    hint="Color of the chatbot bubble and header"
                  />
                  <div className="sm:col-span-2 border-t border-neutral-border pt-5 mt-2">
                    <label className="block text-xs font-semibold text-neutral-gray uppercase tracking-wide mb-1.5">
                      Try the AI Chatbot
                    </label>
                    <p className="text-xs text-neutral-gray mb-3 -mt-1">
                      Test how the chatbot behaves using the display name and accent color configured above.
                    </p>
                    <div className="rounded-xl border border-neutral-border bg-neutral-light/50 overflow-hidden shadow-inner">
                      {/* Chat header */}
                      <div
                        className="px-4 py-3 flex items-center justify-between text-white text-xs font-semibold"
                        style={{ backgroundColor: theme.chatbotColor || '#2563eb' }}
                      >
                        <span>{theme.chatbotName || 'Hospital Medical AI'}</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">Test Mode</span>
                      </div>
                      
                      {/* Messages list */}
                      <div className="h-64 p-4 overflow-y-auto space-y-3 bg-white text-xs">
                        {previewMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                                msg.type === 'user'
                                  ? 'text-white shadow-sm'
                                  : 'bg-neutral-light border border-neutral-border text-neutral-dark'
                              }`}
                              style={msg.type === 'user' ? { backgroundColor: theme.chatbotColor || '#2563eb' } : {}}
                            >
                              <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                            </div>
                          </div>
                        ))}
                        {previewTyping && (
                          <div className="flex justify-start">
                            <div className="bg-neutral-light border border-neutral-border rounded-xl px-4 py-2.5 text-neutral-gray flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-neutral-gray animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="h-1.5 w-1.5 rounded-full bg-neutral-gray animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="h-1.5 w-1.5 rounded-full bg-neutral-gray animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Input area */}
                      <div className="p-3 border-t border-neutral-border bg-white flex gap-2">
                        <input
                          type="text"
                          value={previewInput}
                          onChange={(e) => setPreviewInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleSendPreview()
                            }
                          }}
                          placeholder="Ask a medical question (e.g. 'I have chest pain')..."
                          className="min-w-0 flex-1 rounded-lg border border-neutral-border px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                        />
                        <button
                          type="button"
                          onClick={handleSendPreview}
                          className="px-4 py-2 rounded-lg text-white text-xs font-semibold transition-colors shrink-0"
                          style={{ backgroundColor: theme.chatbotColor || '#2563eb' }}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </SettingsCard>
          </LockedFeature>

          {/* Save button bottom */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors shadow-sm"
            >
              {saving
                ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : <FiSave size={14} />
              }
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* ── Live Preview column ── */}
        {showPreview && (
          <div className="lg:w-80 lg:shrink-0 space-y-3 lg:sticky lg:top-20 lg:z-10 self-start h-fit">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-neutral-dark">Live Preview</p>
                <p className="text-xs text-neutral-gray">Updates as you change settings</p>
              </div>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <ThemePreview theme={theme} hospitalName={hospitalName} />
            <p className="mt-2 text-center text-xs text-neutral-gray">
              Simplified preview — actual site may vary slightly
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page wrapper ──────────────────────────────────────────────────────────────

export default function CustomizationPage() {
  return (
    <SubscriptionProvider>
      <CustomizationContent />
    </SubscriptionProvider>
  )
}
