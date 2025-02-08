import { useEffect, useState } from 'react'

export function useToolbarPosition(
  calendarRef: React.RefObject<HTMLDivElement | null>,
  toolbarRef: React.RefObject<HTMLDivElement | null>
) {
  const [isSticky, setIsSticky] = useState(false)
  
  useEffect(() => {
    const checkPosition = () => {
      if (!calendarRef.current || !toolbarRef.current) return
      
      const calendarRect = calendarRef.current.getBoundingClientRect()
      const toolbarHeight = toolbarRef.current.offsetHeight
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth

      // If viewport is narrow, we want the toolbar to float higher
      const adjustedBuffer = viewportWidth < 1000 ? 100 : 20
      
      setIsSticky(calendarRect.bottom + toolbarHeight + adjustedBuffer > viewportHeight)
    }

    // Run on mount and resize
    checkPosition()
    window.addEventListener('resize', checkPosition)
    
    // Also run on scroll
    window.addEventListener('scroll', checkPosition)
    
    // Create a ResizeObserver to watch for calendar size changes
    const resizeObserver = new ResizeObserver(checkPosition)
    if (calendarRef.current) {
      resizeObserver.observe(calendarRef.current)
    }
    
    return () => {
      window.removeEventListener('resize', checkPosition)
      window.removeEventListener('scroll', checkPosition)
      resizeObserver.disconnect()
    }
  }, [calendarRef, toolbarRef])

  return isSticky
} 