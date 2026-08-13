import { useCallback, useEffect, useRef, useState } from 'react'
import { getPointingDirection } from '../lib/deviceOrientationMath'

const HAS_ORIENTATION = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
const NEEDS_EXPLICIT_PERMISSION = HAS_ORIENTATION && typeof window.DeviceOrientationEvent.requestPermission === 'function'
const SMOOTHING = 0.2 // lower = smoother but more lag; raw sensor data still has some noise worth damping

/** Signed shortest difference (-180..180) from `a` to `b`, in degrees — handles the 0/360 wrap. */
function angleDelta(a, b) {
  return ((((b - a) % 360) + 540) % 360) - 180
}

/**
 * Live compass heading (0-360°, 0 = North) and elevation angle (0° = horizon, 90° = straight up)
 * the device's back camera is pointed at, from its orientation sensors where available.
 *
 * Both are derived from a proper 3D rotation (see lib/deviceOrientationMath) rather than the
 * naive `elevation = 90 - beta` shortcut, which is mathematically unstable (gimbal lock) exactly
 * when the phone is held upright to aim at the sky — that instability was making targets appear
 * wildly out of place. The rotation-based approach has no such singularity.
 *
 * Heading prefers iOS's `webkitCompassHeading` when available (it's magnetically calibrated;
 * iOS's raw `alpha` isn't north-referenced), falling back to the rotation-derived azimuth
 * otherwise (correct on Android's `deviceorientationabsolute`). Elevation always uses the
 * rotation method — it doesn't depend on alpha being correctly calibrated at all.
 *
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
      if (event.alpha == null || event.beta == null || event.gamma == null) return

      const { azimuthDeg, elevationDeg } = getPointingDirection(event.alpha, event.beta, event.gamma)
      const rawHeading = typeof event.webkitCompassHeading === 'number' ? event.webkitCompassHeading : azimuthDeg
      const rawElevation = elevationDeg

      smoothedHeading.current =
        smoothedHeading.current == null
          ? rawHeading
          : (smoothedHeading.current + angleDelta(smoothedHeading.current, rawHeading) * SMOOTHING + 360) % 360
      setHeading(smoothedHeading.current)

      smoothedElevation.current =
        smoothedElevation.current == null
          ? rawElevation
          : smoothedElevation.current + (rawElevation - smoothedElevation.current) * SMOOTHING
      setElevation(smoothedElevation.current)
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
