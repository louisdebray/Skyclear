import { useLocalClock } from '../../hooks/useLocalClock'
import { IconClock } from '../icons/Icons.jsx'

export default function LocalClock({ timezone, compact = false }) {
  const time = useLocalClock(timezone, { withSeconds: !compact })
  if (!time) return null

  return (
    <span className={`flex items-center gap-1.5 font-display tabular-nums ${compact ? 'text-xs text-muted' : 'text-sm text-brand-light'}`}>
      <IconClock size={compact ? 12 : 14} />
      {time}
    </span>
  )
}
