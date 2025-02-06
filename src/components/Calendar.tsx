'use client'

import { useRef, useState, useEffect } from 'react'
import { toPng } from 'html-to-image'
import CalendarGrid from './CalendarGrid'
import MonthSelector from './MonthSelector'
import Toolbar from './Toolbar'
import { CalendarProvider, useCalendarContext } from '@/context/CalendarContext'
import { format } from 'date-fns'

function CalendarContent() {
  const calendarRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)
  const { currentDate, calendarSettings } = useCalendarContext()
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const updateScale = () => {
      // Use a more gradual scaling approach
      const containerPadding = 64  // 32px on each side
      const minScale = 0.7        // Don't let it get smaller than 70%
      
      // Calculate scale based on available width
      const availableWidth = window.innerWidth - containerPadding
      // Make the scaling more gradual by adjusting the base width
      const scale = Math.min(1, Math.max(minScale, availableWidth / 1200))
      
      setScale(scale)
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  const handleDownload = async () => {
    if (!exportRef.current) return

    try {
      const exportWrapper = exportRef.current
      
      // Temporarily move the element on screen for capture
      exportWrapper.style.left = '0'
      exportWrapper.style.top = '0'
      exportWrapper.style.zIndex = '9999'
      
      const dataUrl = await toPng(exportWrapper, {
        quality: 1.0,
        pixelRatio: 2,
        width: 1124,
        height: 724,
        style: {
          transform: 'none',
          transformOrigin: 'center',
        },
        backgroundColor: calendarSettings.isTransparent ? null : '#ffffff'
      })
      
      // Move it back off screen
      exportWrapper.style.left = '-9999px'
      exportWrapper.style.top = '0'
      exportWrapper.style.zIndex = 'auto'
      
      const link = document.createElement('a')
      link.download = `calendar-${format(currentDate, 'yyyy-MM')}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Error generating image:', error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 pb-28">
      {/* Visible calendar with scaling */}
      <div 
        className="relative"
        style={{ 
          width: 1024,
          height: 624,
          transform: `scale(${scale})`,
          transformOrigin: 'top center'
        }}
      >
        <div 
          ref={calendarRef} 
          className={`w-full bg-white rounded-xl border border-gray-200 p-6 ${
            calendarSettings.showShadow ? 'shadow-xl' : ''
          }`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '624px'
          }}
        >
          <div className="relative flex items-center justify-center mb-8">
            <h1 className="text-2xl font-medium tracking-tight absolute">
              {format(currentDate, 'MMMM yyyy')}
            </h1>
            <div className="ml-auto">
              <MonthSelector />
            </div>
          </div>
          <div className="flex-1">
            <CalendarGrid />
          </div>
        </div>
      </div>

      {/* Hidden export version */}
      <div 
        ref={exportRef}
        className="fixed"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: 1124,
          height: 724,
          padding: '50px',
          backgroundColor: calendarSettings.isTransparent ? 'transparent' : '#ffffff',
          overflow: 'hidden'
        }}
      >
        <div 
          className={`w-full bg-white rounded-xl border border-gray-200 p-6 ${
            calendarSettings.showShadow ? 'shadow-xl' : ''
          }`}
          style={{
            width: '1024px',
            height: '624px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div className="relative flex items-center justify-center mb-8">
            <h1 className="text-2xl font-medium tracking-tight absolute">
              {format(currentDate, 'MMMM yyyy')}
            </h1>
            <div className="ml-auto">
              <MonthSelector />
            </div>
          </div>
          <div className="flex-1">
            <CalendarGrid />
          </div>
        </div>
      </div>

      <Toolbar onDownload={handleDownload} />
    </div>
  )
}

export default function Calendar() {
  return (
    <CalendarProvider>
      <CalendarContent />
    </CalendarProvider>
  )
} 