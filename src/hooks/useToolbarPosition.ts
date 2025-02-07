import { useEffect, useState, RefObject } from 'react'

export function useToolbarPosition(
  calendarRef: RefObject<HTMLDivElement>,
  toolbarRef: RefObject<HTMLDivElement>
) {
  const [isSticky, setIsSticky] = useState(false)  // Start non-sticky
  
  useEffect(() => {
    const checkPosition = () => {
      if (!calendarRef.current || !toolbarRef.current) return
      
      const calendarBottom = calendarRef.current.getBoundingClientRect().bottom
      const toolbarHeight = toolbarRef.current.offsetHeight
      const viewportHeight = window.innerHeight
      const buffer = 20 // Add buffer to snap earlier
      
      // Make sticky before it actually touches the bottom
      setIsSticky(calendarBottom + toolbarHeight + buffer > viewportHeight)
    }

    checkPosition()
    window.addEventListener('scroll', checkPosition)
    window.addEventListener('resize', checkPosition)
    
    return () => {
      window.removeEventListener('scroll', checkPosition)
      window.removeEventListener('resize', checkPosition)
    }
  }, [calendarRef, toolbarRef])

  return isSticky
} 