'use client'

import { useState, useEffect } from 'react'

export function MobileAlert() {
  const [isVisible, setIsVisible] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768) // Show for screens smaller than 768px
    }

    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  if (!isVisible || !isMobile) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-amber-50 border-t border-amber-200">
      <div className="max-w-3xl mx-auto flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-amber-800 text-sm">
            👋 Hey there! Calshots works best on larger screens. For the best experience, please visit us on your desktop or tablet.
          </p>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="shrink-0 text-amber-700 hover:text-amber-900"
          aria-label="Dismiss message"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
    </div>
  )
} 