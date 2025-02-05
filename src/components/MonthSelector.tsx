'use client'

import { format, addMonths, subMonths } from 'date-fns'
import { useCalendarContext } from '@/context/CalendarContext'

export default function MonthSelector() {
  const { currentDate, setCurrentDate } = useCalendarContext()

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={previousMonth}
        className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
        aria-label="Previous month"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextMonth}
        className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
        aria-label="Next month"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
} 