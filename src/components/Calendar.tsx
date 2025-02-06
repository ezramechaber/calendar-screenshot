'use client'

import { useRef, useState, useEffect } from 'react'
import { toPng } from 'html-to-image'
import CalendarGrid from './CalendarGrid'
import MonthSelector from './MonthSelector'
import Toolbar from './Toolbar'
import { CalendarProvider, useCalendarContext } from '@/context/CalendarContext'
import { format, getDaysInMonth, startOfMonth } from 'date-fns'

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
      const actualHeight = exportWrapper.offsetHeight
      
      // Temporarily move the element on screen for capture
      exportWrapper.style.left = '0'
      exportWrapper.style.top = '0'
      exportWrapper.style.zIndex = '9999'
      
      const dataUrl = await toPng(exportWrapper, {
        quality: 1.0,
        pixelRatio: 2,
        width: 1124,
        height: actualHeight,
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

  // Calculate if we need 6 rows
  const monthStart = startOfMonth(currentDate)
  const startDay = monthStart.getDay()
  const daysInMonth = getDaysInMonth(currentDate)
  const needsSixRows = Math.ceil((startDay + daysInMonth) / 7) > 5

  // Base and extended heights
  const baseHeight = 624
  const sixRowHeight = 720  // Increased height for 6 rows

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 pb-28">
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900">Calendar Shots</h1>

      {/* Visible calendar with scaling */}
      <div 
        className="relative p-12 rounded-2xl"
        style={{ 
          width: 1124,
          background: calendarSettings.isTransparent 
            ? 'transparent' 
            : (calendarSettings.bgGradient || calendarSettings.bgColor || '#ffffff')
        }}
      >
        <div 
          className="relative"
          style={{ 
            width: 1024,
            height: needsSixRows ? sixRowHeight : baseHeight,
            transform: `scale(${scale})`,
            transformOrigin: 'top center'
          }}
        >
          <div 
            ref={calendarRef} 
            className={`w-full rounded-xl border border-gray-100 p-6 bg-white/95 backdrop-blur-sm ${
              calendarSettings.showShadow ? 'shadow-xl' : ''
            }`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              aspectRatio: '1.64',
              height: 'auto'
            }}
          >
            <div className="relative flex items-center justify-center mb-8">
              <h1 className="text-2xl font-medium tracking-tight absolute text-gray-800">
                {format(currentDate, 'MMMM yyyy').toUpperCase()}
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
      </div>

      {/* Footer */}
      <div className="mt-8 text-sm text-gray-500">
        Made by Ezra Mechaber
      </div>

      {/* Hidden export version */}
      <div 
        ref={exportRef}
        className="fixed"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: 1124,  // 1024 + (50px * 2) padding
          minHeight: 724,  // Minimum height
          background: calendarSettings.isTransparent 
            ? 'transparent' 
            : (calendarSettings.bgGradient || calendarSettings.bgColor || '#ffffff'),
          overflow: 'hidden'
        }}
      >
        <div className="p-[50px] flex">
          <div 
            className={`w-full rounded-xl border border-gray-200 p-6 bg-white ${
              calendarSettings.showShadow ? 'shadow-xl' : ''
            }`}
            style={{
              width: '1024px',
              display: 'flex',
              flexDirection: 'column',
              aspectRatio: '1.64',
              height: 'auto'
            }}
          >
            <div className="relative flex items-center justify-center mb-8">
              <h1 className="text-2xl font-medium tracking-tight absolute text-gray-800">
                {format(currentDate, 'MMMM yyyy').toUpperCase()}
              </h1>
              <div className="ml-auto">
                <MonthSelector hideControls={true} />
              </div>
            </div>
            <div className="flex-1">
              <CalendarGrid />
            </div>
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