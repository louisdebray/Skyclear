import { useMemo } from 'react'
import { getUpcomingMeteorShowers } from '../../lib/meteorShowers'
import { formatDayLabel } from '../../utils/format'
import { IconComet, IconCheckCircle, IconAlertTriangle } from '../icons/Icons.jsx'

export default function MeteorShowerAlert({ currentCloudCover }) {
  const upcoming = useMemo(() => getUpcomingMeteorShowers(new Date(), 45), [])

  if (!upcoming.length) return null

  const favorable = currentCloudCover <= 30

  return (
    <div>
      <h3 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">Pluies de météores</h3>
      <div className="flex flex-col gap-3">
        {upcoming.slice(0, 3).map((shower) => (
          <div key={`${shower.name}-${shower.peakDate.getFullYear()}`} className="flex items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 font-medium text-sm">
                <IconComet size={14} className="text-brand-light" />
                {shower.name}
              </p>
              <p className="text-xs text-muted">
                Radiant : {shower.radiant} · jusqu'à {shower.zhr}/h au pic
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              {shower.daysUntilPeak <= 0 ? (
                <p className="text-sm font-medium text-brand-light">Pic ce soir</p>
              ) : (
                <p className="text-sm font-medium">
                  Pic dans {shower.daysUntilPeak} j{shower.daysUntilPeak > 1 ? 's' : ''}
                </p>
              )}
              <p className="text-xs text-muted capitalize">{formatDayLabel(shower.peakDate)}</p>
            </div>
          </div>
        ))}
      </div>
      {currentCloudCover != null && upcoming[0]?.daysUntilPeak <= 0 && (
        <p className={`flex items-center gap-1.5 text-xs mt-3 ${favorable ? 'text-sky-good' : 'text-sky-okay'}`}>
          {favorable ? <IconCheckCircle size={13} className="flex-shrink-0" /> : <IconAlertTriangle size={13} className="flex-shrink-0" />}
          {favorable
            ? `Ciel dégagé ce soir : bonne occasion de tenter les ${upcoming[0].name}.`
            : 'Couverture nuageuse actuelle défavorable au pic ce soir.'}
        </p>
      )}
    </div>
  )
}
