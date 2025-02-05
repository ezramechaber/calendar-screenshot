'use client'

import { useState } from 'react'
import { Switch } from '@headlessui/react'
import { useCalendarContext } from '@/context/CalendarContext'

interface ToolbarProps {
  onDownload: () => void
}

export default function Toolbar({ onDownload }: ToolbarProps) {
  const [showToday, setShowToday] = useState(true)
  const [isTransparent, setIsTransparent] = useState(false)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [showShadow, setShowShadow] = useState(true)
  const { setCalendarSettings } = useCalendarContext()

  const handleSettingChange = (
    key: 'showToday' | 'isTransparent' | 'bgColor' | 'showShadow',
    value: boolean | string
  ) => {
    switch (key) {
      case 'showToday':
        setShowToday(value as boolean)
        break
      case 'isTransparent':
        setIsTransparent(value as boolean)
        break
      case 'bgColor':
        setBgColor(value as string)
        break
      case 'showShadow':
        setShowShadow(value as boolean)
        break
    }
    setCalendarSettings({ [key]: value })
  }

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[min(90%,600px)] bg-white shadow-lg border border-gray-200 rounded-t-lg">
      <div className="px-4 py-3 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch
            checked={showToday}
            onChange={(checked) => handleSettingChange('showToday', checked)}
            className={`${
              showToday ? 'bg-gray-900' : 'bg-gray-200'
            } relative inline-flex h-5 w-9 items-center rounded-full transition-colors`}
          >
            <span className="sr-only">Show today's date</span>
            <span
              className={`${
                showToday ? 'translate-x-5' : 'translate-x-1'
              } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="text-sm text-gray-600">Show today</span>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={isTransparent}
            onChange={(checked) => handleSettingChange('isTransparent', checked)}
            className={`${
              isTransparent ? 'bg-gray-900' : 'bg-gray-200'
            } relative inline-flex h-5 w-9 items-center rounded-full transition-colors`}
          >
            <span className="sr-only">Make background transparent</span>
            <span
              className={`${
                isTransparent ? 'translate-x-5' : 'translate-x-1'
              } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="text-sm text-gray-600">Transparent</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="color"
            value={bgColor}
            onChange={(e) => handleSettingChange('bgColor', e.target.value)}
            className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
            disabled={isTransparent}
          />
          <span className="text-sm text-gray-600">Background</span>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={showShadow}
            onChange={(checked) => handleSettingChange('showShadow', checked)}
            className={`${
              showShadow ? 'bg-gray-900' : 'bg-gray-200'
            } relative inline-flex h-5 w-9 items-center rounded-full transition-colors`}
          >
            <span className="sr-only">Show drop shadow</span>
            <span
              className={`${
                showShadow ? 'translate-x-5' : 'translate-x-1'
              } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="text-sm text-gray-600">Shadow</span>
        </div>

        <div className="ml-auto">
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Download PNG
          </button>
        </div>
      </div>
    </div>
  )
} 