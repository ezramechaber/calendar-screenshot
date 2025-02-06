'use client'

import React, { useState, useEffect } from 'react'
import { getDaysInMonth, startOfMonth, format, addDays, isToday, startOfDay } from 'date-fns'
import EventDialog from './EventDialog'
import { Event } from '@/types'
import { useCalendarContext, ItemTypes } from '@/context/CalendarContext'
import { getEventColor } from '@/utils/colors'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useDrag, useDrop } from 'react-dnd'

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface EventDisplayInfo {
  event: Event
  columnSpan: number
  columnStart: number
  isLastOfWeek: boolean
  isEnd: boolean
  isStart: boolean
  isMiddle: boolean
}

interface DraggableEventProps {
  event: Event
  columnStart: number
  columnSpan: number
  isStart: boolean
  isEnd: boolean
  isMiddle: boolean
  onEventClick: (e: React.MouseEvent, event: Event) => void
}

function DraggableEvent({ 
  event, 
  columnStart, 
  columnSpan, 
  isStart,
  isEnd,
  isMiddle,
  onEventClick 
}: DraggableEventProps) {
  const { handleEventDelete, calendarSettings, resizeEvent } = useCalendarContext()
  const eventColors = getEventColor(calendarSettings.bgColor)
  const eventColor = event.color || eventColors.colors[0]

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.EVENT,
    item: { id: event.id, type: ItemTypes.EVENT },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }))

  const [{ isResizing }, resizeHandle] = useDrag(() => ({
    type: ItemTypes.RESIZE_HANDLE,
    item: { id: event.id, type: ItemTypes.RESIZE_HANDLE },
    collect: (monitor) => ({
      isResizing: monitor.isDragging()
    })
  }))

  // Add drop handling for resize
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.RESIZE_HANDLE,
    drop: (item: { id: string, type: string }) => {
      if (item.type === ItemTypes.RESIZE_HANDLE && item.id === event.id) {
        resizeEvent(item.id, event.startDate)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }))

  return (
    <div
      ref={(node) => {
        drag(node)
        drop(node)
      }}
      className={`relative text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis 
        group transition-all hover:brightness-95 pointer-events-auto select-none 
        cursor-grab active:cursor-grabbing h-6 ${isDragging ? 'opacity-50' : ''} 
        ${isOver ? 'brightness-90' : ''} ${isStart && isEnd ? 'rounded-[4px]' : 
        isStart ? 'rounded-l-[4px]' : 
        isEnd ? 'rounded-r-[4px]' : ''}`}
      style={{
        backgroundColor: eventColor,
        color: isLightColor(eventColor) ? '#000000' : '#ffffff',
        padding: '3px 8px',
        paddingRight: '20px',
        gridColumn: `${columnStart} / span ${columnSpan}`,
        zIndex: 10,
        boxShadow: eventColors.boxShadow,
        marginLeft: isStart ? '0' : '-1px',
        marginRight: isEnd ? '0' : '-1px'
      }}
      onClick={(e) => onEventClick(e, event)}
    >
      <span className="block truncate">
        {event.title || '(No title)'}
      </span>
      
      {/* Delete button */}
      <div className="opacity-0 group-hover:opacity-100 absolute right-1 top-1/2 -translate-y-1/2 transition-opacity">
        <button
          onClick={(e) => handleEventDelete(e, event.id)}
          className="p-0.5 rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors"
          title="Delete event"
        >
          <svg className="w-2.5 h-2.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Resize handle */}
      <div
        ref={resizeHandle}
        className={`absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 
          group-hover:opacity-100 hover:opacity-100 ${isResizing ? 'opacity-100' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-white/50" />
      </div>
    </div>
  )
}

interface DroppableProps {
  date: Date
  children: React.ReactNode
  onClick: () => void
}

function DroppableDay({ date, children, onClick }: DroppableProps) {
  const { moveEvent, resizeEvent, events } = useCalendarContext()
  
  // Count events on this day
  const eventCount = events.filter(event => {
    const eventDate = new Date(event.startDate)
    eventDate.setHours(0, 0, 0, 0)
    const currentDate = new Date(date)
    currentDate.setHours(0, 0, 0, 0)
    return eventDate.getTime() === currentDate.getTime()
  }).length

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: [ItemTypes.EVENT, ItemTypes.RESIZE_HANDLE],
    canDrop: (item: { id: string, type: string }) => {
      if (item.type === ItemTypes.EVENT) {
        // Allow drop if moving an existing event or if under limit
        const isExistingEvent = events.some(e => e.id === item.id && 
          startOfDay(e.startDate).getTime() === startOfDay(date).getTime())
        return isExistingEvent || eventCount < 2
      }
      return true // Always allow resize drops
    },
    drop: (item: { id: string, type: string }) => {
      const dropDate = startOfDay(date)
      
      if (item.type === ItemTypes.EVENT) {
        moveEvent(item.id, dropDate)
      } else if (item.type === ItemTypes.RESIZE_HANDLE) {
        resizeEvent(item.id, dropDate)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }))

  return (
    <div 
      ref={drop}
      className={`min-h-[100px] relative cursor-pointer transition-colors 
        ${isOver && canDrop ? 'bg-gray-50' : ''}
        ${isOver && !canDrop ? 'bg-red-50' : ''}
        ${!isOver ? 'hover:bg-gray-50/80' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default function CalendarGrid(): React.ReactElement {
  const { 
    currentDate, 
    setSelectedDate, 
    events, 
    deleteEvent, 
    calendarSettings,
    isQuickCreating,
    setIsQuickCreating,
    quickCreateDate,
    setQuickCreateDate,
    handleQuickCreate,
    moveEvent
  } = useCalendarContext()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  
  const monthStart = startOfMonth(currentDate)
  const daysInMonth = getDaysInMonth(currentDate)
  const startDay = monthStart.getDay()
  
  // At the top level, calculate the first day to show in the calendar
  const firstDayOfGrid = addDays(monthStart, -startDay)
  
  const handleCellClick = (date: Date) => {
    setQuickCreateDate(date)
    setIsQuickCreating(true)
  }

  const handleEventClick = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation()
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

  const getEventsForDate = (date: Date): EventDisplayInfo[] => {
    const dateEvents = events.filter(event => {
      const startDate = startOfDay(new Date(event.startDate))
      const endDate = startOfDay(new Date(event.endDate))
      const currentDate = startOfDay(new Date(date))
      
      // Only show events that either:
      // 1. Start on this date, or
      // 2. Continue from previous week and start at beginning of week
      return startDate.getTime() === currentDate.getTime() || 
             (currentDate.getDay() === 0 && // Beginning of week
              currentDate >= startDate && 
              currentDate <= endDate)
    })

    // Sort events by duration and start date
    dateEvents.sort((a, b) => {
      const aDuration = new Date(a.endDate).getTime() - new Date(a.startDate).getTime()
      const bDuration = new Date(b.endDate).getTime() - new Date(b.startDate).getTime()
      if (aDuration !== bDuration) return bDuration - aDuration
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    })

    // Limit to 2 events per day
    const limitedEvents = dateEvents.slice(0, 2)

    return limitedEvents.map(event => {
      const startDate = startOfDay(new Date(event.startDate))
      const endDate = startOfDay(new Date(event.endDate))
      const currentDate = startOfDay(new Date(date))
      
      const dayOfWeek = date.getDay()
      const daysUntilWeekEnd = 6 - dayOfWeek
      const daysUntilEventEnd = Math.floor((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      
      // Calculate span for this week segment
      const span = Math.min(daysUntilWeekEnd + 1, daysUntilEventEnd + 1)
      
      // Determine if this is start, middle, or end of event
      const isStart = startDate.getTime() === currentDate.getTime()
      // Check if this is either the actual end date OR the last visible day of a continuing event
      const isEnd = endDate.getTime() === currentDate.getTime() || 
                   (currentDate.getTime() + (span - 1) * 24 * 60 * 60 * 1000 === endDate.getTime())
      const isMiddle = !isStart && !isEnd
      
      return {
        event,
        columnSpan: span,
        columnStart: dayOfWeek + 1,
        isLastOfWeek: dayOfWeek + span - 1 === 6,
        isEnd,
        isStart,
        isMiddle
      }
    })
  }

  const weeks = Math.ceil((startDay + daysInMonth) / 7)
  const needsSixRows = weeks > 5

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`
        grid grid-cols-7 gap-[1px] bg-gray-100 rounded-lg p-[1px] w-full h-full
        ${needsSixRows 
          ? 'grid-rows-[auto_repeat(6,1fr)]' 
          : 'grid-rows-[auto_repeat(5,1fr)]'
        }
      `}>
        {/* Days of week header */}
        {DAYS_OF_WEEK.map(day => (
          <div 
            key={day}
            className="p-2 text-center bg-white text-xs font-semibold text-gray-500 tracking-wider uppercase"
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
              const isQuickCreateCell = isQuickCreating && 
                quickCreateDate?.toDateString() === date.toDateString()
              
              return (
                <DroppableDay
                  key={dayIndex}
                  date={date}
                  onClick={() => handleCellClick(date)}
                >
                  <span className={`
                    absolute top-2 left-2 w-6 h-6 flex items-center justify-center
                    text-sm font-medium ${calendarSettings.showToday && isToday(date) 
                      ? 'bg-gray-900 text-white rounded-full' 
                      : 'text-gray-600'
                    }
                  `}>
                    {isCurrentMonth ? format(date, 'd') : ''}
                  </span>
                  
                  {isQuickCreateCell && (
                    <QuickCreateEvent 
                      date={date}
                      onSave={handleQuickCreate}
                      onCancel={() => {
                        setIsQuickCreating(false)
                        setQuickCreateDate(null)
                      }}
                    />
                  )}
                </DroppableDay>
              )
            })}

            {/* Events for this week */}
            <div className="absolute top-10 left-0 right-0 grid grid-cols-7 gap-px pointer-events-none">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const dayNumber = weekIndex * 7 + dayIndex
                const date = addDays(firstDayOfGrid, dayNumber)
                const dateEvents = getEventsForDate(date)
                
                return dateEvents.slice(0, 3).map(({ event, columnSpan, columnStart, isStart, isEnd, isMiddle }) => (
                  <DraggableEvent
                    key={event.id}
                    event={event}
                    columnStart={columnStart}
                    columnSpan={columnSpan}
                    isStart={isStart}
                    isEnd={isEnd}
                    isMiddle={isMiddle}
                    onEventClick={handleEventClick}
                  />
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
    </DndProvider>
  )
}

// Utility function to determine text color based on background
function isLightColor(color: string | undefined): boolean {
  if (!color) return true
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128
}

// New QuickCreateEvent component
function QuickCreateEvent({ 
  date, 
  onSave, 
  onCancel 
}: { 
  date: Date
  onSave: (title: string, date: Date) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState('')
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave(title, date)
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const input = document.getElementById('quick-create-input')
      input?.focus()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div 
      className="absolute left-0 right-0 top-6 mx-2 z-20"
      onClick={e => e.stopPropagation()}
    >
      <input
        id="quick-create-input"
        className="w-full p-2 text-sm border border-gray-200 rounded shadow-sm bg-white"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onSave(title, date)}
        placeholder="Event title"
      />
    </div>
  )
} 