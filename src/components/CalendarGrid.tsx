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
  
  // At the top level, calculate the first day to show in the calendar
  const firstDayOfGrid = addDays(monthStart, -startDay)
  
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
      
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(0, 0, 0, 0)
      currentDate.setHours(0, 0, 0, 0)
      
      // Only return events that start on this date
      return startDate.getTime() === currentDate.getTime()
    })

    return dateEvents.map(event => {
      const startDate = new Date(event.startDate)
      const endDate = new Date(event.endDate)
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(0, 0, 0, 0)

      const dayOfWeek = date.getDay()
      const daysUntilWeekEnd = 6 - dayOfWeek
      const daysUntilEventEnd = Math.floor((endDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      
      // Calculate how many days this event should span (limited by week boundary)
      const span = Math.min(daysUntilWeekEnd + 1, daysUntilEventEnd + 1)

      return {
        event,
        columnSpan: span,
        columnStart: dayOfWeek + 1, // Add 1 because grid columns start at 1
        isLastOfWeek: dayOfWeek + span - 1 === 6,
        isEnd: endDate.getTime() === date.getTime()
      }
    })
  }

  const weeks = Math.ceil((startDay + daysInMonth) / 7)

  return (
    <>
      <div className="grid grid-cols-7 grid-rows-[auto_repeat(5,1fr)] gap-px bg-gray-100 rounded-lg p-px w-full h-full">
        {/* Days of week header */}
        {DAYS_OF_WEEK.map(day => (
          <div 
            key={day}
            className="p-2 text-center bg-white text-sm font-medium text-gray-600"
          >
            {day}
          </div>
        ))}
        
        {/* Weeks */}
        {Array.from({ length: weeks }).map((_, weekIndex) => (
          <div key={weekIndex} className="col-span-7 grid grid-cols-7 relative">
            {/* Days in week */}
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const dayNumber = weekIndex * 7 + dayIndex
              const date = addDays(firstDayOfGrid, dayNumber)
              const isCurrentMonth = date.getMonth() === currentDate.getMonth()
              
              return (
                <div 
                  key={dayIndex}
                  className="p-2 bg-white relative cursor-pointer transition-colors hover:bg-gray-50"
                  onClick={() => handleCellClick(date)}
                >
                  <span className={`
                    absolute top-2 left-2 w-6 h-6 flex items-center justify-center
                    text-sm ${calendarSettings.showToday && isToday(date) 
                      ? 'bg-gray-900 text-white rounded-full' 
                      : 'text-gray-600'
                    }
                  `}>
                    {isCurrentMonth ? format(date, 'd') : ''}
                  </span>
                </div>
              )
            })}

            {/* Events for this week */}
            <div className="absolute top-8 left-0 right-0 grid grid-cols-7 gap-px">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const dayNumber = weekIndex * 7 + dayIndex
                const date = addDays(firstDayOfGrid, dayNumber)
                const dateEvents = getEventsForDate(date, 0, 6)
                
                return dateEvents.slice(0, 3).map(({ event, columnSpan, columnStart }) => (
                  <div
                    key={event.id}
                    className="relative text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis group rounded-[4px]"
                    style={{
                      backgroundColor: event.color,
                      color: isLightColor(event.color) ? 'black' : 'white',
                      padding: '3px 8px',
                      gridColumn: `${columnStart} / span ${columnSpan}`,
                      zIndex: 10
                    }}
                    onClick={(e) => handleEventClick(e, event)}
                  >
                    <span className="block truncate">
                      {event.title || '(No title)'}
                    </span>
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
                ))
              })}
            </div>
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