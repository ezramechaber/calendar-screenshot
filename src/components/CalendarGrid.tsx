'use client'

import React, { useState } from 'react'
import { getDaysInMonth, startOfMonth, format, addDays, isToday } from 'date-fns'
import EventDialog from './EventDialog'
import { Event } from '@/types'
import { useCalendarContext } from '@/context/CalendarContext'

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface EventDisplayInfo {
  event: Event
  isStart: boolean
  isEnd: boolean
  isFirstOfWeek: boolean
  isLastOfWeek: boolean
}

const COLORS = [
  '#E5E7EB', // Light gray
  '#D1D5DB', // Medium gray
  '#9CA3AF', // Dark gray
  '#4B5563', // Darker gray
  '#374151', // Almost black
]

export default function CalendarGrid() {
  const { currentDate, setSelectedDate, events, deleteEvent, calendarSettings } = useCalendarContext()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  
  const monthStart = startOfMonth(currentDate)
  const daysInMonth = getDaysInMonth(currentDate)
  const startDay = monthStart.getDay()
  
  const handleCellClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedEvent(null)
    setIsDialogOpen(true)
  }

  const handleEventClick = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation() // Prevent cell click
    setSelectedEvent(event)
    setSelectedDate(new Date(event.startDate))
    setIsDialogOpen(true)
  }

  const handleEventDelete = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation() // Prevent event click
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(eventId)
    }
  }

  const getEventsForDate = (date: Date, weekStart: number, weekEnd: number) => {
    const dateEvents = events.filter(event => {
      const startDate = new Date(event.startDate)
      const endDate = new Date(event.endDate)
      const currentDate = new Date(date)
      
      // Reset time portion for accurate date comparison
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(0, 0, 0, 0)
      currentDate.setHours(0, 0, 0, 0)
      
      return currentDate >= startDate && currentDate <= endDate
    })

    return dateEvents.map(event => {
      const startDate = new Date(event.startDate)
      const endDate = new Date(event.endDate)
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(0, 0, 0, 0)

      return {
        event,
        isStart: startDate.getTime() === date.getTime(),
        isEnd: endDate.getTime() === date.getTime(),
        isFirstOfWeek: date.getDay() === weekStart,
        isLastOfWeek: date.getDay() === weekEnd
      }
    })
  }

  const weeks = Math.ceil((startDay + daysInMonth) / 7)

  return (
    <>
      <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg p-px aspect-[6/4] w-full max-w-[1000px] mx-auto overflow-hidden">
        {/* Days of week header */}
        {DAYS_OF_WEEK.map(day => (
          <div 
            key={day}
            className="p-2 text-center bg-white text-sm font-medium text-gray-600"
          >
            {day}
          </div>
        ))}
        
        {/* Calendar grid */}
        {Array.from({ length: weeks }).map((_, weekIndex) => (
          <div key={weekIndex} className="contents">
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const dayNumber = weekIndex * 7 + dayIndex - startDay
              const date = addDays(monthStart, dayNumber)
              const isCurrentMonth = date.getMonth() === currentDate.getMonth()
              
              if (!isCurrentMonth) {
                return (
                  <div 
                    key={dayIndex}
                    className="p-2 bg-white min-h-[100px]"
                  />
                )
              }

              const dateEvents = getEventsForDate(date, 0, 6)
              
              return (
                <div 
                  key={dayIndex}
                  className="p-2 bg-white min-h-[100px] relative cursor-pointer transition-colors hover:bg-gray-50"
                  onClick={() => handleCellClick(date)}
                >
                  <span className={`
                    absolute top-2 left-2 w-6 h-6 flex items-center justify-center
                    text-sm ${calendarSettings.showToday && isToday(date) 
                      ? 'bg-gray-900 text-white rounded-full' 
                      : 'text-gray-600'
                    }
                  `}>
                    {format(date, 'd')}
                  </span>
                  
                  <div className="mt-8 flex flex-col gap-1">
                    {dateEvents.slice(0, 3).map(({ event, isStart, isEnd, isFirstOfWeek, isLastOfWeek }) => (
                      <div
                        key={event.id}
                        className={`
                          relative text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis group
                          ${isStart || isFirstOfWeek ? 'ml-2' : '-ml-2'}
                          ${isEnd || isLastOfWeek ? 'mr-2' : '-mr-2'}
                        `}
                        style={{
                          backgroundColor: event.color,
                          color: isLightColor(event.color) ? 'black' : 'white',
                          padding: '3px 8px',
                          borderRadius: `${isStart || isFirstOfWeek ? '4px' : '0'} ${isEnd || isLastOfWeek ? '4px' : '0'} ${isEnd || isLastOfWeek ? '4px' : '0'} ${isStart || isFirstOfWeek ? '4px' : '0'}`,
                          zIndex: 10
                        }}
                        onClick={(e) => handleEventClick(e, event)}
                      >
                        {(isStart || isFirstOfWeek) && (
                          <span className="block truncate">
                            {event.title || '(No title)'}
                          </span>
                        )}
                        <div className="hidden group-hover:flex absolute right-1 top-1/2 -translate-y-1/2 bg-white rounded shadow-sm">
                          <button
                            onClick={(e) => handleEventDelete(e, event.id)}
                            className="p-0.5 min-w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100"
                            title="Delete event"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <EventDialog 
        isOpen={isDialogOpen} 
        onClose={() => {
          setIsDialogOpen(false)
          setSelectedEvent(null)
        }}
        event={selectedEvent}
      />
    </>
  )
}

// Utility function to determine text color based on background
function isLightColor(color: string): boolean {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128
} 