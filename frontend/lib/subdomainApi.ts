import { API_BASE_URL } from '@/lib/api'

export interface BusinessInfoData {
  id: string
  name?: string
  logo?: string | null
  logo_url?: string | null
  about?: string
  address?: string
  contact_phone?: string
  contact_email?: string
  website?: string
  [key: string]: unknown
}

export interface SubdomainPublicInfo {
  business_type: 'hospital' | 'pharmacy'
  owner_id: string
  template_id?: number | null
  is_published: boolean
  business_info?: BusinessInfoData | null
}

export async function getSubdomainPublicInfo(subdomain: string): Promise<SubdomainPublicInfo | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/business-info/public_info/?subdomain=${encodeURIComponent(subdomain)}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    })
    
    if (!res.ok) {
      return null
    }
    
    return res.json()
  } catch (error) {
    console.error('Error fetching subdomain info:', error)
    return null
  }
}
