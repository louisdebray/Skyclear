/**
 * Max exposure time (seconds) before star trailing becomes visible, for a given focal length
 * and sensor crop factor. The "500 rule" is the classic loose guideline; "300 rule" is the
 * stricter version recommended for high-resolution sensors.
 */
export function computeMaxExposure(focalLengthMm, cropFactor) {
  const effectiveFocal = focalLengthMm * cropFactor
  return {
    rule500: 500 / effectiveFocal,
    rule300: 300 / effectiveFocal,
  }
}

export const CROP_FACTORS = [
  { label: 'Plein format (1x)', value: 1 },
  { label: 'APS-C Canon (1.6x)', value: 1.6 },
  { label: 'APS-C Nikon/Sony (1.5x)', value: 1.5 },
  { label: 'Micro 4/3 (2x)', value: 2 },
]
