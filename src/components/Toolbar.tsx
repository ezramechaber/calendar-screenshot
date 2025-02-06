'use client'

import { useState } from 'react'
import { Switch } from '@headlessui/react'
import { useCalendarContext } from '@/context/CalendarContext'

interface ToolbarProps {
  onDownload: () => void
}

function adjustColor(color: string, amount: number): string {
  // Remove the # if present
  const hex = color.replace('#', '')
  
  // Convert to RGB - fix the substring indices
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  // Adjust each component with a percentage instead of flat amount
  const factor = 1 + (amount / 100)
  const newR = Math.min(255, Math.max(0, Math.round(r * factor)))
  const newG = Math.min(255, Math.max(0, Math.round(g * factor)))
  const newB = Math.min(255, Math.max(0, Math.round(b * factor)))
  
  const rHex = newR.toString(16).padStart(2, '0')
  const gHex = newG.toString(16).padStart(2, '0')
  const bHex = newB.toString(16).padStart(2, '0')
  
  return `#${rHex}${gHex}${bHex}`
}

function generateGradient(baseColor: string): string {
  // Generate more dramatic shades
  const lighterColor = adjustColor(baseColor, 30)    // 30% lighter
  const darkerColor = adjustColor(baseColor, -30)    // 30% darker
  const evenLighter = adjustColor(baseColor, 45)     // 45% lighter
  const evenDarker = adjustColor(baseColor, -45)     // 45% darker
  const angle = Math.floor(Math.random() * 360)
  
  return `linear-gradient(${angle}deg, 
    ${evenDarker}, 
    ${darkerColor} 25%, 
    ${baseColor} 50%, 
    ${lighterColor} 75%, 
    ${evenLighter}
  )`
}

export default function Toolbar({ onDownload }: ToolbarProps) {
  const { calendarSettings, setCalendarSettings } = useCalendarContext()
  const [showToday, setShowToday] = useState(calendarSettings.showToday ?? true)
  const [isTransparent, setIsTransparent] = useState(calendarSettings.isTransparent ?? true)
  const [bgColor, setBgColor] = useState(calendarSettings.bgColor ?? '#ffffff')
  const [showShadow, setShowShadow] = useState(calendarSettings.showShadow ?? true)

  const handleSettingChange = (
    key: 'showToday' | 'isTransparent' | 'bgColor' | 'showShadow',
    value: boolean | string
  ) => {
    switch (key) {
      case 'showToday':
        setShowToday(value as boolean)
        setCalendarSettings({ [key]: value })
        break
      case 'isTransparent':
        setIsTransparent(value as boolean)
        setCalendarSettings({ [key]: value })
        break
      case 'bgColor':
        setBgColor(value as string)
        setIsTransparent(false)
        setCalendarSettings({ 
          bgColor: value,
          bgGradient: generateGradient(value as string),
          isTransparent: false
        })
        break
      case 'showShadow':
        setShowShadow(value as boolean)
        setCalendarSettings({ [key]: value })
        break
    }
  }

  const handleColorClick = () => {
    // If transparent is on, turn it off first
    if (isTransparent) {
      setIsTransparent(false)
      setCalendarSettings({ isTransparent: false })
    }
  }

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[min(90%,600px)] bg-white shadow-lg border border-gray-200 rounded-t-lg">
      <div className="px-6 py-4 flex items-center gap-8">
        <div className="flex items-center gap-3 min-w-[100px] whitespace-nowrap">
          <Switch
            checked={showToday}
            onChange={(checked) => handleSettingChange('showToday', checked)}
            className={`${
              showToday ? 'bg-gray-900' : 'bg-gray-200'
            } relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0`}
          >
            <span className="sr-only">Show today's date</span>
            <span
              className={`${
                showToday ? 'translate-x-5' : 'translate-x-1'
              } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="text-sm text-gray-600 whitespace-nowrap">Show today</span>
        </div>

        <div className="flex items-center gap-3 min-w-[100px] whitespace-nowrap">
          <Switch
            checked={isTransparent}
            onChange={(checked) => handleSettingChange('isTransparent', checked)}
            className={`${
              isTransparent ? 'bg-gray-900' : 'bg-gray-200'
            } relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0`}
          >
            <span className="sr-only">Make background transparent</span>
            <span
              className={`${
                isTransparent ? 'translate-x-5' : 'translate-x-1'
              } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="text-sm text-gray-600 whitespace-nowrap">Transparent</span>
        </div>

        <div className="flex items-center gap-3 min-w-[100px] whitespace-nowrap">
          <input
            type="color"
            value={bgColor}
            onChange={(e) => handleSettingChange('bgColor', e.target.value)}
            onClick={handleColorClick}
            className={`w-8 h-8 rounded border border-gray-200 cursor-pointer flex-shrink-0 ${
              isTransparent ? 'opacity-50' : ''
            }`}
          />
          <span className="text-sm text-gray-600 whitespace-nowrap">Background</span>
        </div>

        <div className="flex items-center gap-3 min-w-[100px] whitespace-nowrap">
          <Switch
            checked={showShadow}
            onChange={(checked) => handleSettingChange('showShadow', checked)}
            className={`${
              showShadow ? 'bg-gray-900' : 'bg-gray-200'
            } relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0`}
          >
            <span className="sr-only">Show drop shadow</span>
            <span
              className={`${
                showShadow ? 'translate-x-5' : 'translate-x-1'
              } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="text-sm text-gray-600 whitespace-nowrap">Shadow</span>
        </div>

        <div className="ml-auto">
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            Download PNG
          </button>
        </div>
      </div>
    </div>
  )
}