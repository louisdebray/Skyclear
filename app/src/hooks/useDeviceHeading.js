import { useCallback, useEffect, useRef, useState } from 'react'

const HAS_ORIENTATION = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
const NEEDS_EXPLICIT_PERMISSION = HAS_ORIENTATION && typeof window.DeviceOrientationEvent.requestPermission === 'function'
const SMOOTHING = 0.15 // lower = smoother but more lag; raw sensor data is jittery enough to need this

/** Signed shortest difference (-180..180) from `a` to `b`, in degrees — handles the 0/360 wrap. */
function angleDelta(a, b) {
  return ((((b - a) % 360) + 540) % 360) - 180
}

/**
 * Live compass heading (0-360°, 0 = North) and elevation angle (0° = horizon, 90° = straight up)
 * from the device's sensors, where available — smoothed with an exponential moving average since
 * raw orientation events are jittery enough to make a pointer feel twitchy otherwise. Elevation
 * assumes the phone is held upright in portrait, sighting along its top edge: beta=90° means
 * "held vertical, aimed at the horizon", so elevation = 90 - beta. It's an approximation (no
 * camera to calibrate against), close enough to answer "roughly how high am I aiming".
 * iOS requires an explicit permission prompt triggered by a user gesture — Android generally
 * doesn't. Desktop browsers have no orientation sensors at all; `supported` reflects that.
 */
export function useDeviceHeading() {
  const [heading, setHeading] = useState(null)
  const [elevation, setElevation] = useState(null)
  const [permissionGranted, setPermissionGranted] = useState(!NEEDS_EXPLICIT_PERMISSION && HAS_ORIENTATION)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const smoothedHeading = useRef(null)
  const smoothedElevation = useRef(null)

  useEffect(() => {
    if (!permissionGranted) return

    function handleOrientation(event) {
      let rawHeading = null
      if (typeof event.webkitCompassHeading === 'number') {
        rawHeading = event.webkitCompassHeading
      } else if (event.alpha != null) {
        rawHeading = (360 - event.alpha) % 360
      }
      if (rawHeading != null) {
        if (smoothedHeading.current == null) {
          smoothedHeading.current = rawHeading
        } else {
          smoothedHeading.current = (smoothedHeading.current + angleDelta(smoothedHeading.current, rawHeading) * SMOOTHING + 360) % 360
        }
        setHeading(smoothedHeading.current)
      }

      if (event.beta != null) {
        const rawElevation = Math.max(-90, Math.min(90, 90 - event.beta))
        smoothedElevation.current =
          smoothedElevation.current == null
            ? rawElevation
            : smoothedElevation.current + (rawElevation - smoothedElevation.current) * SMOOTHING
        setElevation(smoothedElevation.current)
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
