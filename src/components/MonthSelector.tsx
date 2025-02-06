'use client'

import { addMonths, subMonths } from 'date-fns'
import { useCalendarContext } from '@/context/CalendarContext'

interface MonthSelectorProps {
  hideControls?: boolean
}

export default function MonthSelector({ hideControls = false }: MonthSelectorProps): JSX.Element {
  const { currentDate, setCurrentDate } = useCalendarContext()

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  return (
    <div className="flex items-start justify-between">
      {!hideControls && (
        <>
          <button 
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors" 
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors" 
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
} 