import { useEffect, useState } from 'react'

/** True once the page has scrolled past `threshold` px — drives the sticky summary header. */
export function useScrolled(threshold = 180) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > threshold)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return scrolled
}
