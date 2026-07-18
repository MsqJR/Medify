'use client'

import { useEffect, useRef, createElement, type ReactNode, type ElementType } from 'react'

export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.05 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}

export function Reveal({
  children,
  delay = 1,
  className = '',
  as,
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: ElementType
}) {
  const ref = useReveal<HTMLDivElement>()
  const Tag = as || 'div'

  return createElement(
    Tag,
    { ref, className: `reveal delay-${Math.min(delay, 8)} ${className}` },
    children
  )
}
