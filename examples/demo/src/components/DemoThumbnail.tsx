import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

interface DemoThumbnailProps {
  demo: 'table' | 'canvas' | 'calendar'
  alt?: string
}

export function DemoThumbnail({ demo, alt }: DemoThumbnailProps) {
  const { resolvedTheme } = useTheme()
  const src = `/screenshots/${demo}-${resolvedTheme}.png`

  return (
    <Link to={`/${demo}`} className="demo-thumbnail-link">
      <img
        src={src}
        alt={alt || `${demo} demo screenshot`}
        className="demo-thumbnail"
      />
    </Link>
  )
}
