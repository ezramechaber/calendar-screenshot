'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Event } from '@/types'

interface CalendarSettings {
  showToday?: boolean
  isTransparent?: boolean
  bgColor?: string
  bgGradient?: string
  showShadow?: boolean
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
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettings>({
    showToday: true,
    isTransparent: true,
    bgColor: '#ffffff',
    showShadow: true
  })

  const addEvent = (event: Event) => {
    const newEvent = {
      ...event,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate)
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
            endDate: new Date(eventData.endDate || event.endDate)
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
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendarContext() {
  const context = useContext(CalendarContext)
  if (context === undefined) {
    throw new Error('useCalendarContext must be used within a CalendarProvider')
  }
  return context
} 