'use client'

import React, { useEffect, useState } from 'react'
import { SubdomainPublicInfo } from '@/lib/subdomainApi'
import { WhatsAppButton } from '@/components/pharmacy/WhatsAppButton'
import { getSiteItem } from '@/lib/storage'
import { safeJsonParse } from '@/lib/pharmacyTemplateRuntime'

interface PharmacySubdomainLayoutProps {
  children: React.ReactNode
  subdomainInfo: SubdomainPublicInfo
}

export default function PharmacySubdomainLayout({
  children,
  subdomainInfo,
}: PharmacySubdomainLayoutProps) {
  const [whatsAppPhone, setWhatsAppPhone] = useState('')
  const [isAIChatActive, setIsAIChatActive] = useState(false)

  const showWhatsApp =
    subdomainInfo.template_id === 1 ||
    subdomainInfo.template_id === 2 ||
    subdomainInfo.template_id === 4

  useEffect(() => {
    const updatePhone = () => {
      const businessInfo = safeJsonParse<{ contactPhone?: string; contact_phone?: string; phone?: string }>(
        getSiteItem('businessInfo')
      )
      const setup = safeJsonParse<{ phone?: string }>(getSiteItem('pharmacySetup'))
      const phone =
        businessInfo?.contactPhone ||
        businessInfo?.contact_phone ||
        businessInfo?.phone ||
        setup?.phone ||
        ''
      setWhatsAppPhone(phone)
    }

    updatePhone()
    window.addEventListener('storage', updatePhone)
    const interval = setInterval(updatePhone, 1000)

    return () => {
      window.removeEventListener('storage', updatePhone)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const handleAIChatState = (e: Event) => {
      const customEvent = e as CustomEvent<{ active: boolean }>
      setIsAIChatActive(customEvent?.detail?.active || false)
    }
    window.addEventListener('ai-chatbot-state-change', handleAIChatState)
    return () => {
      window.removeEventListener('ai-chatbot-state-change', handleAIChatState)
    }
  }, [])

  return (
    <>
      {children}
      {showWhatsApp && whatsAppPhone && !isAIChatActive && (
        <WhatsAppButton phone={whatsAppPhone} />
      )}
    </>
  )
}
