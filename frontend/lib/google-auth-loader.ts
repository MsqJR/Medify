declare global {
  interface Window {
    google?: {
      accounts?: {
        id: {
          initialize: (config: Record<string, unknown>) => void
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
  }
}

export function loadGoogleIdentityServices(): Promise<NonNullable<NonNullable<Window['google']>['accounts']>['id']> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Cannot load GIS on server side'))
      return
    }
    if (window.google?.accounts?.id) {
      resolve(window.google.accounts.id)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google.accounts.id)
      } else {
        reject(new Error('GIS script loaded but google.accounts.id not found'))
      }
    }
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script'))
    document.head.appendChild(script)
  })
}
