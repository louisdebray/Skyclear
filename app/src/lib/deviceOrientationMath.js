/**
 * Converts device orientation angles (alpha/beta/gamma, as given by DeviceOrientationEvent) into
 * the compass azimuth and elevation the device's back camera is actually pointed at.
 *
 * This exists because the naive shortcut — `elevation = 90 - beta` — breaks down exactly at
 * beta ≈ 90°, which is precisely how a phone is held to aim at the sky (upright, like a camera).
 * That's a real mathematical singularity (gimbal lock) in the alpha/beta/gamma representation,
 * not a tuning issue: right where we need it most, the numbers become unstable and can swing
 * wildly (this is why a target could appear to be "underfoot").
 *
 * The fix: build the device's orientation as a quaternion (no gimbal lock, ever) and rotate a
 * fixed "out the back camera" vector by it, then read azimuth/elevation off the resulting 3D
 * vector. Forming the quaternion from alpha/beta/gamma is smooth everywhere — the singularity
 * only exists when going the other way (decomposing a matrix back into three separate angles),
 * which we never do. Verified numerically stable straight through beta=90° (see git history for
 * the sanity checks: flat-down, vertical-at-horizon, tilted-back-45°, and heading-independence
 * of elevation all check out, plus no azimuth blow-up from small roll/tilt jitter at beta=90°).
 */
export function getPointingVector(alpha, beta, gamma) {
  const rad = Math.PI / 180
  const halfX = (beta * rad) / 2
  const halfY = (gamma * rad) / 2
  const halfZ = (alpha * rad) / 2

  const cX = Math.cos(halfX)
  const cY = Math.cos(halfY)
  const cZ = Math.cos(halfZ)
  const sX = Math.sin(halfX)
  const sY = Math.sin(halfY)
  const sZ = Math.sin(halfZ)

  // Quaternion for intrinsic Z (alpha) -> X' (beta) -> Y'' (gamma) rotation, per the
  // DeviceOrientation spec's rotation order.
  const qw = cX * cY * cZ - sX * sY * sZ
  const qx = sX * cY * cZ - cX * sY * sZ
  const qy = cX * sY * cZ + sX * cY * sZ
  const qz = cX * cY * sZ + sX * sY * cZ

  // Rotate the local "out the back of the device" vector (0, 0, -1) by the quaternion, using
  // v' = v + 2w(q×v) + 2(q×(q×v)).
  const vx = 0,
    vy = 0,
    vz = -1
  const cx1 = qy * vz - qz * vy
  const cy1 = qz * vx - qx * vz
  const cz1 = qx * vy - qy * vx
  const tx = 2 * cx1
  const ty = 2 * cy1
  const tz = 2 * cz1
  const cx2 = qy * tz - qz * ty
  const cy2 = qz * tx - qx * tz
  const cz2 = qx * ty - qy * tx

  const worldX = vx + qw * tx + cx2 // East
  const worldY = vy + qw * ty + cy2 // North
  const worldZ = vz + qw * tz + cz2 // Up

  return { x: worldX, y: worldY, z: worldZ }
}

/**
 * Reads azimuth (0-360°, 0 = North) and elevation (-90..90°) off a pointing vector produced by
 * `getPointingVector`. Kept separate from vector computation so callers can smooth the vector
 * itself first (see useDeviceHeading) — smoothing a 3D direction is well-behaved everywhere,
 * whereas smoothing the azimuth *angle* directly falls apart near the poles of this coordinate
 * system (straight up/down), where azimuth is nearly undefined and tiny sensor noise in the
 * vector translates into huge, erratic swings in the angle.
 */
export function azimuthElevationFromVector({ x, y, z }) {
  const azimuthDeg = ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360
  const elevationDeg = (Math.asin(Math.max(-1, Math.min(1, z))) * 180) / Math.PI
  return { azimuthDeg, elevationDeg }
}
