import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { FaGithub, FaKeyboard } from 'react-icons/fa'
import { useHotkeysContext } from 'use-kbd'

const GITHUB_BASE = 'https://github.com/runsascoded/use-kbd/tree/main/examples/demo/src/routes'

const ROUTE_FILES: Record<string, string> = {
  '/': 'Home.tsx',
  '/table': 'TableDemo.tsx',
  '/canvas': 'CanvasDemo.tsx',
  '/calendar': 'CalendarDemo.tsx',
}

export function FloatingControls() {
  const ctx = useHotkeysContext()
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const lastScrollY = useRef(0)
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Hide keyboard shortcuts button on touch-only devices
  const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollingDown = currentScrollY > lastScrollY.current
      const nearBottom = (window.innerHeight + currentScrollY) >= (document.body.scrollHeight - 100)

      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current)
        hideTimeout.current = null
      }

      if ((scrollingDown && currentScrollY > 30) || nearBottom) {
        setIsVisible(true)
        hideTimeout.current = setTimeout(() => setIsVisible(false), 2500)
      } else if (!scrollingDown) {
        setIsVisible(false)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (hideTimeout.current) clearTimeout(hideTimeout.current)
    }
  }, [])

  const showControls = isVisible || isHovering
  const file = ROUTE_FILES[location.pathname] || 'Home.tsx'
  const githubUrl = `${GITHUB_BASE}/${file}`

  return (
    <div
      className="floating-controls-container"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className={`floating-controls ${showControls ? 'visible' : ''}`}>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="floating-btn github-link"
          title="View source on GitHub"
          aria-label="View source on GitHub"
        >
          <FaGithub />
        </a>
        {canHover && (
          <button
            className="floating-btn shortcuts-btn"
            onClick={() => ctx.openModal()}
            title="Keyboard shortcuts (?)"
            aria-label="Show keyboard shortcuts"
          >
            <FaKeyboard />
          </button>
        )}
      </div>
    </div>
  )
}
