'use client'

import React, { useRef } from 'react'
import { Switch } from '@headlessui/react'
import { useCalendarContext } from '@/context/CalendarContext'
import { ClipboardCopy, Download} from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import { useToolbarPosition } from '@/hooks/useToolbarPosition'

// First, define the type for our background options
type BackgroundOption = {
  id: string;
  name: string;
  color: string | null;
  angle?: number;
}

// Then define our constant with the type
const BACKGROUND_OPTIONS: BackgroundOption[] = [
  { id: 'transparent', name: 'Transparent', color: null },
  { id: 'blue', name: 'Blue', color: '#3B82F6', angle: 45 },
  { id: 'purple', name: 'Purple', color: '#8B5CF6', angle: 135 },
  { id: 'red', name: 'Red', color: '#EF4444', angle: 225 },
  { id: 'green', name: 'Green', color: '#10B981', angle: 315 },
  { id: 'orange', name: 'Orange', color: '#F59E0B', angle: 180 },
] as const;

interface ToolbarProps {
  onDownload: () => void
  onCopy: () => Promise<void>
  calendarRef: React.RefObject<HTMLDivElement>
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

function generateGradient(baseColor: string, angle: number): string {
  // Generate more dramatic shades
  const lighterColor = adjustColor(baseColor, 30)    // 30% lighter
  const darkerColor = adjustColor(baseColor, -30)    // 30% darker
  const evenLighter = adjustColor(baseColor, 45)     // 45% lighter
  const evenDarker = adjustColor(baseColor, -45)     // 45% darker
  
  return `linear-gradient(${angle}deg, 
    ${evenDarker}, 
    ${darkerColor} 25%, 
    ${baseColor} 50%, 
    ${lighterColor} 75%, 
    ${evenLighter}
  )`
}

export default function Toolbar({ onDownload, onCopy, calendarRef }: ToolbarProps): React.ReactElement {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const isSticky = useToolbarPosition(calendarRef, toolbarRef)
  const { calendarSettings, setCalendarSettings } = useCalendarContext()

  const handleBackgroundChange = (option: typeof BACKGROUND_OPTIONS[number]) => {
    if (option.id === 'transparent') {
      setCalendarSettings({ 
        isTransparent: true,
        bgColor: '',
        bgGradient: ''
      })
    } else {
      setCalendarSettings({ 
        isTransparent: false,
        bgColor: option.color,
        bgGradient: generateGradient(option.color!, option.angle!)
      })
    }
  }

  const getCurrentBackground = (): BackgroundOption => {
    if (calendarSettings.isTransparent) {
      return BACKGROUND_OPTIONS[0]!  // Assert non-null with !
    }
    const found = BACKGROUND_OPTIONS.find(opt => opt.color === calendarSettings.bgColor)
    return found ?? BACKGROUND_OPTIONS[0]!  // Assert non-null with !
  }

  return (
    <div 
      ref={toolbarRef}
      className={`
        transition-[margin,border-radius] duration-300 ease-in-out
        w-[min(95%,600px)] bg-white shadow-lg
        ${isSticky 
          ? 'fixed bottom-0 left-1/2 -translate-x-1/2 rounded-t-lg border-t border-x border-gray-200' 
          : 'relative mx-auto mt-8 rounded-lg border border-gray-200'
        }
      `}
    >
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Background Selector - Fixed width */}
          <div className="w-[150px]">
            <Popover.Root>
              <Popover.Trigger asChild>
                <button 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg 
                    hover:bg-gray-50 transition-colors
                    border border-gray-200 shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <div 
                    className="w-4 h-4 rounded border border-gray-200"
                    style={{
                      background: getCurrentBackground().id === 'transparent' 
                        ? 'transparent' 
                        : generateGradient(
                            getCurrentBackground().color!, 
                            getCurrentBackground().angle!
                          )
                    }}
                  />
                  <span className="text-sm text-gray-600 truncate">
                    {getCurrentBackground().name}
                  </span>
                </button>
              </Popover.Trigger>

              <Popover.Portal>
                <Popover.Content 
                  className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-48"
                  sideOffset={5}
                  align="start"
                >
                  {BACKGROUND_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-gray-50 transition-colors"
                      onClick={() => handleBackgroundChange(option)}
                    >
                      <div 
                        className="w-4 h-4 rounded border border-gray-200"
                        style={{
                          background: option.id === 'transparent' 
                            ? 'transparent' 
                            : generateGradient(option.color!, option.angle!)
                        }}
                      />
                      <span className="text-sm text-gray-600">
                        {option.name}
                      </span>
                    </button>
                  ))}
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>

          {/* Switches - Fixed width */}
          <div className="w-[120px]">
            <Switch
              checked={calendarSettings.showShadow ?? false}
              onChange={(checked) => setCalendarSettings({ showShadow: checked })}
              className={`${calendarSettings.showShadow ? 'bg-gray-900' : 'bg-gray-200'} relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0`}
            >
              <span className="sr-only">Show drop shadow</span>
              <span className={`${calendarSettings.showShadow ? 'translate-x-5' : 'translate-x-1'} inline-block h-3 w-3 transform rounded-full bg-white transition-transform`} />
            </Switch>
            <span className="text-sm text-gray-600 ml-2">Shadow</span>
          </div>

          <div className="w-[120px]">
            <Switch
              checked={calendarSettings.showToday ?? false}
              onChange={(checked) => setCalendarSettings({ showToday: checked })}
              className={`${calendarSettings.showToday ? 'bg-gray-900' : 'bg-gray-200'} relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0`}
            >
              <span className="sr-only">Show today&apos;s date</span>
              <span className={`${calendarSettings.showToday ? 'translate-x-5' : 'translate-x-1'} inline-block h-3 w-3 transform rounded-full bg-white transition-transform`} />
            </Switch>
            <span className="text-sm text-gray-600 ml-2">Today</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="p-2.5 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-all"
            aria-label="Copy to clipboard"
          >
            <ClipboardCopy className="w-4 h-4" />
          </button>

          <button
            onClick={onDownload}
            className="p-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
            aria-label="Download image"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}