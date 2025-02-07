'use client'

import React from 'react'
import { createContext, useContext, useState, ReactNode } from 'react'
import { Event } from '@/types'
import { startOfDay } from 'date-fns'
import { getEventColor } from '@/utils/colors'

interface CalendarSettings {
  showToday?: boolean
  isTransparent?: boolean
  bgColor?: string | null
  bgGradient?: string | null
  showShadow?: boolean
}

export const ItemTypes = {
  EVENT: 'event',
  RESIZE_HANDLE: 'resize_handle'
}

interface CalendarContextType {
  currentDate: Date
  setCurrentDate: (date: Date) => void
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
  events: Event[]
  addEvent: (event: Event) => void
  updateEvent: (id: string, eventData: Partial<Event>) => void
  deleteEvent: (id: string) => void
  calendarSettings: CalendarSettings
  setCalendarSettings: (settings: Partial<CalendarSettings>) => void
  isQuickCreating: boolean
  setIsQuickCreating: (value: boolean) => void
  quickCreateDate: Date | null
  setQuickCreateDate: (date: Date | null) => void
  handleQuickCreate: (title: string, date: Date) => void
  moveEvent: (id: string, date: Date) => void
  resizeEvent: (id: string, endDate: Date) => void
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export function CalendarProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettings>({
    showToday: true,
    isTransparent: true,
    bgColor: '#ffffff',
    showShadow: true
  })
  const [isQuickCreating, setIsQuickCreating] = useState(false)
  const [quickCreateDate, setQuickCreateDate] = useState<Date | null>(null)

  const addEvent = (event: Event) => {
    const newEvent: Event = {
      ...event,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      color: event.color ?? null  // Handle undefined case
    }
    setEvents(prev => [...prev, newEvent])
  }

  const updateEvent = (id: string, eventData: Partial<Event>) => {
    setEvents(prev => prev.map(event => 
      event.id === id 
        ? { 
            ...event, 
            ...eventData,
            startDate: new Date(eventData.startDate || event.startDate),
            endDate: new Date(eventData.endDate || event.endDate),
            color: (eventData.color ?? event.color) ?? null  // Handle undefined cases
          } 
        : event
    ))
  }

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id))
  }

  const updateSettings = (newSettings: Partial<CalendarSettings>) => {
    setCalendarSettings(prev => ({ ...prev, ...newSettings }))
  }

  const handleQuickCreate = (title: string, date: Date) => {
    const eventColors = getEventColor(calendarSettings.bgColor)
    const eventData: Event = {
      id: Date.now().toString(),
      title: title || '(No title)',
      startDate: date,
      endDate: date,
      color: eventColors.colors[0] ?? null
    }
    addEvent(eventData)
    setIsQuickCreating(false)
    setQuickCreateDate(null)
  }

  const moveEvent = (id: string, toDate: Date) => {
    setEvents(prev => prev.map(event => {
      if (event.id !== id) return event
      
      const daysDiff = Math.floor(
        (startOfDay(toDate).getTime() - startOfDay(event.startDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      
      const newEvent: Event = {  // Add explicit typing
        ...event,
        startDate: new Date(event.startDate.getTime() + daysDiff * 24 * 60 * 60 * 1000),
        endDate: new Date(event.endDate.getTime() + daysDiff * 24 * 60 * 60 * 1000),
        color: event.color ?? null  // Handle undefined case
      }
      return newEvent
    }))
  }

  const resizeEvent = (id: string, newEndDate: Date) => {
    setEvents(prev => {
      return prev.map(event => {
        if (event.id !== id) return event
        
        const startOfStartDate = startOfDay(event.startDate)
        const startOfNewEndDate = startOfDay(newEndDate)
        
        if (startOfNewEndDate.getTime() <= startOfStartDate.getTime()) {
          return {
            ...event,
            endDate: new Date(startOfStartDate)
          }
        }
        
        return {
          ...event,
          endDate: startOfNewEndDate
        }
      })
    })
  }

  return (
    <CalendarContext.Provider 
      value={{
        currentDate,
        setCurrentDate,
        selectedDate,
        setSelectedDate,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        calendarSettings,
        setCalendarSettings: updateSettings,
        isQuickCreating,
        setIsQuickCreating,
        quickCreateDate,
        setQuickCreateDate,
        handleQuickCreate,
        moveEvent,
        resizeEvent,
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendarContext(): CalendarContextType {
  const context = useContext(CalendarContext)
  if (context === undefined) {
    throw new Error('useCalendarContext must be used within a CalendarProvider')
  }
  return context
} 