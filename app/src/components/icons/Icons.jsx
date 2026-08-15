/** Minimal line-icon set (stroke = currentColor) used in place of emoji throughout the app. */

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

export function IconPin({ size = 14, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </svg>
  )
}

export function IconCompass({ size = 14, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 5-5 2 2-5 5-2Z" strokeLinejoin="round" fill="currentColor" fillOpacity="0.25" />
    </svg>
  )
}

export function IconClock({ size = 14, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </svg>
  )
}

export function IconStar({ size = 14, className, filled = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 3.5l2.4 5.2 5.6.6-4.2 3.8 1.2 5.6L12 16l-5 2.7 1.2-5.6-4.2-3.8 5.6-.6L12 3.5Z" strokeLinejoin="round" />
    </svg>
  )
}

export function IconClose({ size = 14, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function IconCity({ size = 14, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 20V9l5-3v14M9 20V6l6-3v17M15 20v-9l5 2v7" />
      <path d="M4 20h16" />
    </svg>
  )
}

export function IconComet({ size = 14, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 20L14 10" strokeOpacity="0.5" />
      <path d="M8 16L14 10" strokeOpacity="0.8" />
      <circle cx="16.5" cy="7.5" r="3" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconCheckCircle({ size = 14, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </svg>
  )
}

export function IconAlertTriangle({ size = 14, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 4.5L21 19H3L12 4.5Z" strokeLinejoin="round" />
      <path d="M12 10v4" />
      <circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconRefresh({ size = 14, className, spinning = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`${className ?? ''} ${spinning ? 'animate-spin' : ''}`}
      {...base}
    >
      <path d="M4 12a8 8 0 0 1 13.5-5.7M20 12a8 8 0 0 1-13.5 5.7" />
      <path d="M17 3v4h-4M7 21v-4h4" />
    </svg>
  )
}

export function IconRain({ size = 14, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M7 15a4 4 0 0 1 .6-7.96A5 5 0 0 1 17.5 9 3.5 3.5 0 0 1 17 16H7Z" />
      <path d="M8 19l-1 2M13 19l-1 2M18 19l-1 2" />
    </svg>
  )
}

export function IconTelescope({ size = 14, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M3 14l12-6 2 4-12 6-2-4Z" strokeLinejoin="round" />
      <path d="M13 12l6-3" />
      <path d="M9 15.5L6.5 20M12 17l-1.5 3.5" />
      <circle cx="17.5" cy="7.5" r="1.4" />
    </svg>
  )
}
