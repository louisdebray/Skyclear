/** Small stylized SVG spheres per planet — closer to the real look than a generic emoji. */
export default function PlanetIcon({ name, size = 22 }) {
  const common = { width: size, height: size, viewBox: '0 0 32 32' }

  switch (name) {
    case 'Mercury':
      return (
        <svg {...common}>
          <defs>
            <radialGradient id="mercury" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#c9c2b8" />
              <stop offset="100%" stopColor="#7d766c" />
            </radialGradient>
          </defs>
          <circle cx="16" cy="16" r="12" fill="url(#mercury)" />
          <circle cx="12" cy="12" r="1.6" fill="#5c564d" opacity="0.6" />
          <circle cx="20" cy="18" r="2.2" fill="#5c564d" opacity="0.5" />
          <circle cx="14" cy="21" r="1" fill="#5c564d" opacity="0.5" />
        </svg>
      )
    case 'Venus':
      return (
        <svg {...common}>
          <defs>
            <radialGradient id="venus" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#fff3d6" />
              <stop offset="100%" stopColor="#d9a441" />
            </radialGradient>
          </defs>
          <circle cx="16" cy="16" r="12" fill="url(#venus)" />
        </svg>
      )
    case 'Mars':
      return (
        <svg {...common}>
          <defs>
            <radialGradient id="mars" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#f0a06e" />
              <stop offset="100%" stopColor="#9c3d1f" />
            </radialGradient>
          </defs>
          <circle cx="16" cy="16" r="12" fill="url(#mars)" />
          <circle cx="19" cy="13" r="1.8" fill="#7a2c14" opacity="0.5" />
          <circle cx="13" cy="19" r="1.2" fill="#7a2c14" opacity="0.5" />
        </svg>
      )
    case 'Jupiter':
      return (
        <svg {...common}>
          <defs>
            <radialGradient id="jupiter" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#f2ddc2" />
              <stop offset="100%" stopColor="#b98953" />
            </radialGradient>
            <clipPath id="jupiterClip">
              <circle cx="16" cy="16" r="12" />
            </clipPath>
          </defs>
          <circle cx="16" cy="16" r="12" fill="url(#jupiter)" />
          <g clipPath="url(#jupiterClip)" opacity="0.55">
            <rect x="4" y="9" width="24" height="2.2" fill="#8a5f34" />
            <rect x="4" y="14" width="24" height="3" fill="#c97a4a" />
            <rect x="4" y="19" width="24" height="2" fill="#8a5f34" />
            <ellipse cx="21" cy="16.5" rx="3" ry="1.8" fill="#a6431f" />
          </g>
        </svg>
      )
    case 'Saturn':
      return (
        <svg {...common} viewBox="0 0 40 32">
          <defs>
            <radialGradient id="saturn" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#f6e4b8" />
              <stop offset="100%" stopColor="#c9a35f" />
            </radialGradient>
          </defs>
          <ellipse cx="20" cy="16" rx="15" ry="4.2" fill="none" stroke="#d8c48c" strokeWidth="2.4" opacity="0.85" />
          <circle cx="20" cy="16" r="9" fill="url(#saturn)" />
          <ellipse cx="20" cy="16" rx="15" ry="4.2" fill="none" stroke="#8a7847" strokeWidth="1" opacity="0.4" />
        </svg>
      )
    default:
      return null
  }
}
