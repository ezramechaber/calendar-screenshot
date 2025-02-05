'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useState, useEffect } from 'react'
import { useCalendarContext } from '@/context/CalendarContext'
import { format, addDays } from 'date-fns'
import { Event } from '@/types'
import { Switch } from '@/components/ui/switch'

const COLORS = ['#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#FFB533']

interface EventDialogProps {
  isOpen: boolean
  onClose: () => void
  event?: Event | null
}

export default function EventDialog({ isOpen, onClose, event }: EventDialogProps) {
  const { selectedDate, addEvent, updateEvent } = useCalendarContext()
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [color, setColor] = useState(COLORS[0])
  const [isMultiDay, setIsMultiDay] = useState(false)

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setStartDate(new Date(event.startDate))
      setEndDate(new Date(event.endDate))
      setColor(event.color)
      setIsMultiDay(event.startDate.toString() !== event.endDate.toString())
    } else if (selectedDate) {
      setTitle('')
      setStartDate(selectedDate)
      setEndDate(selectedDate)
      setColor(COLORS[0])
      setIsMultiDay(false)
    }
  }, [event, selectedDate, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate) return

    const eventData = {
      title,
      startDate,
      endDate: isMultiDay ? endDate : startDate,
      color,
    }

    if (event) {
      updateEvent(event.id, eventData)
    } else {
      addEvent({
        id: Date.now().toString(),
        ...eventData,
      })
    }
    
    onClose()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fadeIn" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white rounded-md p-6 animate-contentShow">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`w-6 h-6 rounded-full ${c === color ? 'ring-2 ring-black ring-offset-2' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
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
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
} 