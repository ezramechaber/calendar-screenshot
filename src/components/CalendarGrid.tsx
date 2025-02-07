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
  rowIndex: number
}

// Add new interface for resize state
interface ResizeState {
  eventId: string | null
  startDate: Date | null
  endDate: Date | null
  color: string | null
}

interface DraggableEventProps {
  event: Event
  columnStart: number
  columnSpan: number
  isStart: boolean
  isEnd: boolean
  isMiddle: boolean
  date: Date
  onEventClick: (e: React.MouseEvent, event: Event) => void
  onResizeStart: (eventId: string, startDate: Date, color: string) => void
  onResizeUpdate: (endDate: Date) => void
  onResizeEnd: () => void
  style?: React.CSSProperties
}

function DraggableEvent({ 
  event, 
  columnStart, 
  columnSpan, 
  isStart,
  isEnd,
  isMiddle,
  date,
  onEventClick,
  onResizeStart,
  onResizeUpdate,
  onResizeEnd,
  style
}: DraggableEventProps) {
  const { deleteEvent, calendarSettings, resizeEvent } = useCalendarContext()
  const eventColors = getEventColor(calendarSettings.bgColor)
  const eventColor = event.color || eventColors.colors[0]
  const [previewSpan, setPreviewSpan] = useState<number | null>(null)
  const [ghostEndDate, setGhostEndDate] = useState<Date | null>(null)

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.EVENT,
    item: { id: event.id, type: ItemTypes.EVENT },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }))

  const [{ isResizing }, resizeHandle] = useDrag(() => ({
    type: ItemTypes.RESIZE_HANDLE,
    item: () => {
      console.log('Resize start:', {
        eventId: event.id,
        startDate: event.startDate,
        color: eventColor
      })
      onResizeStart(event.id, new Date(event.startDate), eventColor)
      return { 
        id: event.id, 
        type: ItemTypes.RESIZE_HANDLE,
        startDate: event.startDate
      }
    },
    collect: (monitor) => ({
      isResizing: monitor.isDragging()
    }),
    hover: (item: { id: string, startDate: Date }, monitor) => {
      const clientOffset = monitor.getClientOffset()
      if (!clientOffset) return

      // Get the DOM element we're hovering over
      const element = document.elementFromPoint(clientOffset.x, clientOffset.y)
      if (!element) return

      // Find the closest date cell
      const cellElement = element.closest('[data-date]')
      if (!cellElement) return
      
      const hoverDate = new Date(cellElement.getAttribute('data-date') || '')
      console.log('Resize hover:', { 
        hoverDate,
        clientOffset,
        element: cellElement.getAttribute('data-date')
      })
      onResizeUpdate(hoverDate)
    },
    canDrag: () => true,  // Keep this
    end: () => {
      console.log('Resize end')
      onResizeEnd()
    }
  }))

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.RESIZE_HANDLE,
    drop: (item: { id: string, type: string }, monitor) => {
      if (item.type === ItemTypes.RESIZE_HANDLE) {
        const clientOffset = monitor.getClientOffset()
        if (!clientOffset) return

        const elements = document.elementsFromPoint(clientOffset.x, clientOffset.y)
        const cellElement = elements.find(el => el.hasAttribute('data-date'))
        
        if (cellElement) {
          const cellDate = new Date(cellElement.getAttribute('data-date') || '')
          resizeEvent(item.id, cellDate)
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }))

  const handleEventDelete = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event click
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(event.id)
    }
  }

  return (
    <div
      ref={(node) => {
        drag(node)
        drop(node)
      }}
      className={`relative text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis 
        group/event transition-colors duration-100 pointer-events-auto select-none 
        cursor-grab active:cursor-grabbing h-6 ${isDragging ? 'opacity-50' : ''} 
        ${isOver ? 'opacity-80' : ''}`}
      style={{
        backgroundColor: eventColor,
        color: isLightColor(eventColor) ? '#000000' : '#ffffff',
        padding: '3px',
        paddingLeft: isStart ? '5px' : '0',
        paddingRight: isEnd ? '5px' : '0',
        zIndex: 10,
        boxShadow: isStart || isEnd ? eventColors.boxShadow : 'none',
        marginLeft: isStart ? '8px' : '-1px',
        marginRight: isEnd ? '8px' : '-1px',
        marginTop: '1px',
        marginBottom: '1px',
        borderTop: '1px solid rgba(0,0,0,0.1)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        borderLeft: isStart ? '1px solid rgba(0,0,0,0.1)' : 'none',
        borderRight: isEnd ? '1px solid rgba(0,0,0,0.1)' : 'none',
        borderRadius: isStart && isEnd ? '4px' : 
                     isStart ? '4px 0 0 4px' : 
                     isEnd ? '0 4px 4px 0' : '0',
        filter: 'brightness(var(--event-brightness, 1))',
        ...style
      }}
      onMouseEnter={() => {
        // Find all segments of this event and update their brightness
        const segments = document.querySelectorAll(`[data-event-id="${event.id}"]`)
        segments.forEach(segment => {
          (segment as HTMLElement).style.setProperty('--event-brightness', '0.9')
        })
      }}
      onMouseLeave={() => {
        const segments = document.querySelectorAll(`[data-event-id="${event.id}"]`)
        segments.forEach(segment => {
          (segment as HTMLElement).style.setProperty('--event-brightness', '1')
        })
      }}
      data-event-id={event.id}
      onClick={(e) => onEventClick(e, event)}
    >
      {/* Only show title on first day */}
      {isStart && (
        <span className="block truncate">
          {event.title || '(No title)'}
        </span>
      )}
      {!isStart && (
        <span className="block truncate opacity-0">
          {event.title || '(No title)'}
        </span>
      )}
      
      {/* Show delete button on last day */}
      {isEnd && (
        <div className="opacity-0 group-hover/event:opacity-100 absolute right-[5px] top-1/2 -translate-y-1/2 transition-opacity">
          <button
            onClick={handleEventDelete}
            className="p-0.5 rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors"
            title="Delete event"
          >
            <svg className="w-2.5 h-2.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Only show resize handle on last day */}
      {isEnd && (
        <div
          ref={resizeHandle}
          className={`absolute -right-2 top-0 bottom-0 w-4 cursor-ew-resize 
            opacity-0 group-hover/event:opacity-100 hover:opacity-100 
            ${isResizing ? 'opacity-0 !important' : ''}`}
          onClick={e => e.stopPropagation()}
        >
          <div 
            className={`absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2 
              w-1 h-4 rounded-full bg-black/20 hover:bg-black/30 transition-colors
              ${isResizing ? 'opacity-0' : ''}`}
          />
        </div>
      )}
    </div>
  )
}

interface DroppableProps {
  date: Date
  children: React.ReactNode
  onClick: () => void
  onResizeHover?: (date: Date) => void
}

function DroppableDay({ date, children, onClick, onResizeHover }: DroppableProps) {
  const { moveEvent, resizeEvent, events, calendarSettings, currentDate } = useCalendarContext()
  
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
        const isExistingEvent = events.some(e => e.id === item.id && 
          startOfDay(e.startDate).getTime() === startOfDay(date).getTime())
        return isExistingEvent || eventCount < 2
      }
      return true
    },
    hover: (item: { id: string, type: string }, monitor) => {
      if (item.type === ItemTypes.RESIZE_HANDLE) {
        console.log('Drop target hover:', { date: date.toISOString() })
        onResizeHover?.(date)
      }
    },
    drop: (item: { id: string, type: string }) => {
      if (item.type === ItemTypes.EVENT) {
        moveEvent(item.id, startOfDay(date))
      } else if (item.type === ItemTypes.RESIZE_HANDLE) {
        resizeEvent(item.id, startOfDay(date))
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }), [date, events, eventCount, moveEvent, resizeEvent, onResizeHover])

  const isCurrentMonth = date.getMonth() === currentDate.getMonth()

  return (
    <div 
      ref={drop}
      data-date={date.toISOString()}
      className={`min-h-[100px] relative cursor-pointer transition-colors border-r border-gray-100
        ${isOver && canDrop ? 'bg-gray-50' : ''}
        ${isOver && !canDrop ? 'bg-red-50' : ''}
        ${!isOver ? 'hover:bg-gray-50/80' : ''}`}
      onClick={onClick}
    >
      <div className="bg-white min-h-[100px] relative">
        <span className={`
          absolute top-2 right-2 w-6 h-6 flex items-center justify-center
          text-sm font-medium ${calendarSettings.showToday && isToday(date) 
            ? 'bg-gray-900 text-white rounded-full' 
            : 'text-gray-600'
          }
        `}>
          {isCurrentMonth ? format(date, 'd') : ''}
        </span>
        
        {/* Remove gap and handle spacing with event margins instead */}
        <div className="absolute top-10 left-0 right-0 grid grid-rows-3 pointer-events-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

// Update the ResizeGhost component to handle week positioning
function ResizeGhost({
  startDate,
  endDate,
  color,
  firstDayOfGrid
}: {
  startDate: Date
  endDate: Date
  color: string
  firstDayOfGrid: Date
}): React.ReactElement | null {
  const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return null

  // Calculate position based on firstDayOfGrid, just like in showGhostInThisWeek
  const startOfEventDate = startOfDay(startDate)
  const startOfFirstDay = startOfDay(firstDayOfGrid)
  const dayNumber = Math.floor(
    (startOfEventDate.getTime() - startOfFirstDay.getTime()) / 
    (1000 * 60 * 60 * 24)
  )
  const weekIndex = Math.floor(dayNumber / 7)
  const dayOfWeek = startDate.getDay()

  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ 
        gridColumnStart: `${dayOfWeek + 1}`,
        gridColumnEnd: `span ${days + 1}`,
        gridRow: `${weekIndex + 1}`,
        zIndex: 20
      }}
    >
      <div
        className="absolute h-6"
        style={{
          backgroundColor: color,
          opacity: 0.4,
          top: '40px',
          left: '8px',
          right: '8px',
          borderRadius: '4px',
        }}
      />
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
  const [resizeState, setResizeState] = useState<ResizeState>({
    eventId: null,
    startDate: null,
    endDate: null,
    color: null
  })
  
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

  const getEventsForDate = (date: Date, rowCache: Map<string, number> = new Map()): EventDisplayInfo[] => {
    const dateKey = date.toISOString().split('T')[0]
    
    // First get any events that continue from previous days
    const continuingEvents = events.filter(event => {
      const startDate = startOfDay(new Date(event.startDate))
      const endDate = startOfDay(new Date(event.endDate))
      const currentDate = startOfDay(new Date(date))
      return currentDate > startDate && currentDate <= endDate
    })

    // Then get events that start on this date
    const newEvents = events.filter(event => {
      const startDate = startOfDay(new Date(event.startDate))
      const currentDate = startOfDay(new Date(date))
      return startDate.getTime() === currentDate.getTime()
    })

    // Sort events
    const sortEvents = (a: Event, b: Event) => {
      const aDuration = new Date(a.endDate).getTime() - new Date(a.startDate).getTime()
      const bDuration = new Date(b.endDate).getTime() - new Date(b.startDate).getTime()
      if (bDuration !== aDuration) {
        return bDuration - aDuration
      }
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    }

    continuingEvents.sort(sortEvents)
    newEvents.sort(sortEvents)

    const result: EventDisplayInfo[] = []
    const usedRows: { [key: number]: boolean } = {}

    // Helper to find first available row
    const findFirstAvailableRow = () => {
      let rowIndex = 0
      while (usedRows[rowIndex]) {
        rowIndex++
      }
      return rowIndex
    }

    // Place all events, prioritizing cached positions
    [...continuingEvents, ...newEvents].forEach(event => {
      if (result.length < 2) {
        let rowIndex: number
        
        // If this event has a cached position AND that row is available, use it
        if (rowCache.has(event.id) && !usedRows[rowCache.get(event.id)!]) {
          rowIndex = rowCache.get(event.id)!
        } else {
          // Otherwise, find the first available row
          rowIndex = findFirstAvailableRow()
          rowCache.set(event.id, rowIndex)
        }

        usedRows[rowIndex] = true
        result.push(createEventDisplayInfo(event, date, rowIndex))
      }
    })

    return result
  }

  // Helper function to create EventDisplayInfo
  const createEventDisplayInfo = (event: Event, date: Date, rowIndex: number): EventDisplayInfo => {
    const startDate = startOfDay(new Date(event.startDate))
    const endDate = startOfDay(new Date(event.endDate))
    const currentDate = startOfDay(new Date(date))

      const dayOfWeek = date.getDay()
      const daysUntilWeekEnd = 6 - dayOfWeek
    const daysUntilEventEnd = Math.floor((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      
      const span = Math.min(daysUntilWeekEnd + 1, daysUntilEventEnd + 1)
    
    const isStart = startDate.getTime() === currentDate.getTime()
    const isEnd = endDate.getTime() === currentDate.getTime()
    const isMiddle = !isStart && !isEnd

      return {
        event,
      columnSpan: 1,
      columnStart: 1,
      isLastOfWeek: dayOfWeek === 6,
      isEnd,
      isStart,
      isMiddle,
      rowIndex
    }
  }

  const weeks = Math.ceil((startDay + daysInMonth) / 7)
  const needsSixRows = weeks > 5

  const handleResizeStart = (eventId: string, startDate: Date, color: string) => {
    console.log('Setting resize state:', { eventId, startDate, color })
    setResizeState({
      eventId,
      startDate,
      endDate: startDate,
      color
    })
  }

  const handleResizeUpdate = (endDate: Date) => {
    console.log('Updating resize state:', { endDate })
    setResizeState(prev => ({
      ...prev,
      endDate
    }))
  }

  const handleResizeEnd = () => {
    console.log('Clearing resize state')
    setResizeState({
      eventId: null,
      startDate: null,
      endDate: null,
      color: null
    })
  }

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
        
        {/* Calendar cells */}
        {Array.from({ length: weeks }).map((_, weekIndex) => {
          const weekStart = addDays(firstDayOfGrid, weekIndex * 7)
          
          // Calculate if the resize ghost belongs in this week
          const showGhostInThisWeek = resizeState.startDate && (() => {
            const startOfEventDate = startOfDay(resizeState.startDate)
            const startOfFirstDay = startOfDay(firstDayOfGrid)
            const dayNumber = Math.floor(
              (startOfEventDate.getTime() - startOfFirstDay.getTime()) / 
              (1000 * 60 * 60 * 24)
            )
            return Math.floor(dayNumber / 7) === weekIndex
          })()
          
          return (
          <div key={weekIndex} className="col-span-7 grid grid-cols-7 relative">
              {/* Only show ghost preview in the correct week */}
              {resizeState.eventId && resizeState.startDate && 
               resizeState.endDate && showGhostInThisWeek && (
                <ResizeGhost
                  startDate={resizeState.startDate}
                  endDate={resizeState.endDate}
                  color={resizeState.color || '#000000'}
                  firstDayOfGrid={firstDayOfGrid}
                />
              )}
              
              {/* Regular calendar cells */}
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const dayNumber = weekIndex * 7 + dayIndex
                const date = addDays(firstDayOfGrid, dayNumber)
                const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                const isQuickCreateCell = isQuickCreating && 
                  quickCreateDate?.toDateString() === date.toDateString()
                
                // Get events for this specific day
                const dateEvents = getEventsForDate(date)

                  return (
                  <DroppableDay
                    key={dayIndex}
                    date={date}
                    onClick={() => handleCellClick(date)}
                    onResizeHover={handleResizeUpdate}
                  >
                    {dateEvents.map(({ event, isStart, isEnd, isMiddle, rowIndex }) => (
                      <DraggableEvent
                      key={event.id}
                        event={event}
                        columnStart={1}
                        columnSpan={1}
                        isStart={isStart}
                        isEnd={isEnd}
                        isMiddle={isMiddle}
                        date={date}
                        onEventClick={handleEventClick}
                        onResizeStart={handleResizeStart}
                        onResizeUpdate={handleResizeUpdate}
                        onResizeEnd={handleResizeEnd}
                        style={{
                          gridRow: rowIndex + 1
                        }}
                      />
                    ))}
                    {isQuickCreateCell && (
                      <QuickCreateEvent 
                        date={date}
                        onSave={handleQuickCreate}
                        onCancel={() => {
                          setIsQuickCreating(false)
                          setQuickCreateDate(null)
                        }}
                      style={{
                          gridRow: dateEvents.length + 1 // Place after existing events
                        }}
                      />
                    )}
                  </DroppableDay>
                )
              })}
            </div>
          )
        })}
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
  onCancel,
  style
}: { 
  date: Date
  onSave: (title: string, date: Date) => void
  onCancel: () => void
  style?: React.CSSProperties
}): React.ReactElement {
  const [title, setTitle] = useState('')
  const { calendarSettings } = useCalendarContext()
  const eventColors = getEventColor(calendarSettings.bgColor)
  const eventColor = eventColors.colors[0]
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave(title, date)
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const input = document.getElementById('quick-create-input')
      input?.focus()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div 
      className="h-6"
      style={style}
      onClick={e => e.stopPropagation()}
    >
      <div 
        className="h-6 rounded-[4px] relative"
        style={{
          backgroundColor: eventColor,
          boxShadow: eventColors.boxShadow,
          marginLeft: '8px',
          marginRight: '8px'
        }}
      >
        <input
          id="quick-create-input"
          className="w-full h-full bg-transparent focus:outline-none
            text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis"
          style={{
            padding: '3px',
            paddingLeft: '5px',
            paddingRight: '5px',
            color: isLightColor(eventColor) ? '#000000' : '#ffffff',
            '::placeholder': {
              color: isLightColor(eventColor) ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'
            }
          }}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => onSave(title, date)}
          placeholder="Event title"
        />
      </div>
    </div>
  )
} 