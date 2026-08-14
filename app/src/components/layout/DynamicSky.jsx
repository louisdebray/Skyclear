import StarField from './StarField.jsx'
import CloudLayer from './CloudLayer.jsx'
import RainLayer from './RainLayer.jsx'

const DAY_GRADIENTS = {
  clear: 'linear-gradient(to bottom, #3d7dc4 0%, #6fa8dc 55%, #bcdcf0 100%)',
  overcast: 'linear-gradient(to bottom, #5b6a7a 0%, #7c8a96 55%, #93a3b0 100%)',
}

/**
 * Single source of truth for the app's animated backdrop: a light-blue sky by day, the navy
 * starfield by night, both shifting toward grey/rain visuals as the actual weather does.
 */
export default function DynamicSky({ isDaytime, cloudCoverPercent, condition }) {
  const isOvercast = condition === 'cloudy' || condition === 'rain' || condition === 'storm' || condition === 'fog'
  const starOpacity = 1 - Math.min(1, (cloudCoverPercent ?? 0) / 90) * 0.85

  return (
    <>
      <div
        className="fixed inset-0 -z-10 transition-[background] duration-[3000ms]"
        style={{ background: isDaytime ? DAY_GRADIENTS[isOvercast ? 'overcast' : 'clear'] : undefined }}
      />
      {!isDaytime && <StarField opacity={starOpacity} />}
      <CloudLayer cloudCoverPercent={cloudCoverPercent ?? 0} light={isDaytime} />
      <RainLayer visible={condition === 'rain' || condition === 'storm'} />
    </>
  )
}
