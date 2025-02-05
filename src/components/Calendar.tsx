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
  const { currentDate, calendarSettings } = useCalendarContext()
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const updateScale = () => {
      const totalPadding = 112 // 32 + 32 + 24 + 24
      setScale(Math.min(1, (window.innerWidth - totalPadding) / 1024))
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  const handleDownload = async () => {
    if (!calendarRef.current) return

    try {
      const dataUrl = await toPng(calendarRef.current, {
        quality: 1.0,
        pixelRatio: 2,
      })
      
      const link = document.createElement('a')
      link.download = 'calendar.png'
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Error generating image:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-start justify-center p-4 md:p-8 pb-28">
      <div 
        className="relative"
        style={{ 
          width: 1024,
          height: Math.max(600, 1024 * scale),
          transform: `scale(${scale})`,
          transformOrigin: 'top center'
        }}
      >
        <div 
          ref={calendarRef} 
          className={`w-full bg-white rounded-xl border border-gray-200 p-6 ${
            calendarSettings.showShadow ? 'shadow-xl' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-8">
            <h1 className="text-2xl font-medium tracking-tight">
              {format(currentDate, 'MMMM yyyy')}
            </h1>
            <MonthSelector />
          </div>
          <CalendarGrid />
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