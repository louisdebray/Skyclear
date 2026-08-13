import { useCallback, useEffect, useState } from 'react'

const HAS_ORIENTATION = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
const NEEDS_EXPLICIT_PERMISSION = HAS_ORIENTATION && typeof window.DeviceOrientationEvent.requestPermission === 'function'

/**
 * Live compass heading (0-360°, 0 = North) and elevation angle (0° = horizon, 90° = straight up)
 * from the device's sensors, where available. Elevation assumes the phone is held upright in
 * portrait, like sighting along its top edge — beta=90° is "held vertical, aimed at the horizon",
 * so elevation = 90 - beta. It's an approximation (no camera pass-through to calibrate against),
 * but close enough to answer "am I roughly looking at the right height".
 * iOS requires an explicit permission prompt triggered by a user gesture — Android generally
 * doesn't. Desktop browsers have no orientation sensors at all; `supported` reflects that.
 */
export function useDeviceHeading() {
  const [heading, setHeading] = useState(null)
  const [elevation, setElevation] = useState(null)
  const [permissionGranted, setPermissionGranted] = useState(!NEEDS_EXPLICIT_PERMISSION && HAS_ORIENTATION)
  const [permissionDenied, setPermissionDenied] = useState(false)

  useEffect(() => {
    if (!permissionGranted) return

    function handleOrientation(event) {
      let nextHeading = null
      if (typeof event.webkitCompassHeading === 'number') {
        nextHeading = event.webkitCompassHeading
      } else if (event.alpha != null) {
        nextHeading = (360 - event.alpha) % 360
      }
      if (nextHeading != null) setHeading(nextHeading)

      if (event.beta != null) {
        setElevation(Math.max(-90, Math.min(90, 90 - event.beta)))
      }
    }

    const eventName = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation'
    window.addEventListener(eventName, handleOrientation)
    return () => window.removeEventListener(eventName, handleOrientation)
  }, [permissionGranted])

  const requestPermission = useCallback(async () => {
    if (!NEEDS_EXPLICIT_PERMISSION) {
      setPermissionGranted(true)
      return
    }
    try {
      const result = await window.DeviceOrientationEvent.requestPermission()
      if (result === 'granted') {
        setPermissionGranted(true)
      } else {
        setPermissionDenied(true)
      }
    } catch {
      setPermissionDenied(true)
    }
  }, [])

  return {
    heading,
    elevation,
    supported: HAS_ORIENTATION,
    needsPermission: NEEDS_EXPLICIT_PERMISSION && !permissionGranted,
    permissionDenied,
    requestPermission,
  }
}
