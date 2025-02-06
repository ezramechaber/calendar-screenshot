'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useState, useEffect } from 'react'
import { useCalendarContext } from '@/context/CalendarContext'
import { format } from 'date-fns'
import { Event } from '@/types'
import { Switch } from '@/components/ui/switch'
import { getEventColor } from '@/utils/colors'
import React from 'react'

interface EventDialogProps {
  isOpen: boolean
  onClose: () => void
  event?: Event | null
}

// At the top, add a default color
const DEFAULT_COLOR = '#4F46E5'

export default function EventDialog({ isOpen, onClose, event }: EventDialogProps) {
  const { selectedDate, addEvent, updateEvent, deleteEvent, calendarSettings } = useCalendarContext()
  
  // First, memoize eventColors to prevent unnecessary recalculations
  const eventColors = React.useMemo(
    () => getEventColor(calendarSettings.bgColor),
    [calendarSettings.bgColor]
  )
  
  const [title, setTitle] = useState<string>('')
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [selectedColor, setSelectedColor] = useState<string>(eventColors.colors[0] ?? DEFAULT_COLOR)
  const [isMultiDay, setIsMultiDay] = useState(false)

  // First, extract the color selection logic
  const getDefaultColor = React.useCallback(
    (eventColor?: string) => eventColor ?? eventColors.colors[0] ?? DEFAULT_COLOR,
    [eventColors.colors]
  )

  // Then update the useEffect
  useEffect(() => {
    if (!isOpen) return

    if (event) {
      setTitle(event.title)
      setStartDate(new Date(event.startDate))
      setEndDate(new Date(event.endDate))
      setSelectedColor(getDefaultColor(event.color))
      setIsMultiDay(event.startDate.toString() !== event.endDate.toString())
    } else {
      setTitle('')
      setStartDate(selectedDate ?? new Date())
      setEndDate(selectedDate ?? new Date())
      setSelectedColor(getDefaultColor())
      setIsMultiDay(false)
    }
  }, [event, selectedDate, isOpen, getDefaultColor])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate) return

    const eventData: Event = {
      title: title || '(No title)',
      startDate: startDate,
      endDate: isMultiDay ? endDate : startDate,
      color: selectedColor,
      id: event?.id || Date.now().toString(),
    }

    if (event) {
      updateEvent(event.id, eventData)
    } else {
      addEvent(eventData)
    }
    
    onClose()
  }

  const handleDelete = () => {
    if (event && window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(event.id)
      onClose()
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fadeIn" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl p-6 animate-contentShow">
          <Dialog.Title className="text-lg font-semibold mb-4">
            {event ? 'Edit Event' : 'Add Event'}
          </Dialog.Title>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title
                </label>
                <input
                  id="title"
                  className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="(No title)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    className="w-full p-2 border border-gray-200 rounded-md"
                    value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const date = new Date(e.target.value)
                      setStartDate(date)
                      if (!endDate || date > endDate) {
                        setEndDate(date)
                      }
                    }}
                    required
                    autoFocus={false}
                    tabIndex={-1}
                  />
                </div>

                {isMultiDay && (
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      id="endDate"
                      type="date"
                      className="w-full p-2 border border-gray-200 rounded-md"
                      value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setEndDate(new Date(e.target.value))}
                      min={startDate ? format(startDate, 'yyyy-MM-dd') : undefined}
                      required={isMultiDay}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={isMultiDay}
                  onChange={(checked) => {
                    setIsMultiDay(checked)
                    if (!checked) {
                      setEndDate(startDate)
                    }
                  }}
                />
                <span className="text-sm text-gray-600">Multi-day event</span>
              </div>

              <div className="mt-4 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  {eventColors.colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-5 h-5 rounded-full transition-all ring-offset-2 ${
                        selectedColor === color ? 'ring-2 ring-gray-900 scale-110' : ''
                      }`}
                      style={{
                        backgroundColor: color,
                        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)'
                      }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <div>
                {event && (
                  <button 
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md font-medium"
                >
                  {event ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
} 