import { useCallback, useEffect, useRef, useState } from 'react'

const SUPPORTED = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

/** Opens the device's rear camera (for the AR sky-pointing view) and cleans up the stream on unmount. */
export function useBackCamera() {
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)
  const [requesting, setRequesting] = useState(false)
  const streamRef = useRef(null)

  const requestCamera = useCallback(async () => {
    if (!SUPPORTED) {
      setError('not-supported')
      return
    }
    setRequesting(true)
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = media
      setStream(media)
      setError(null)
    } catch {
      setError('denied')
    } finally {
      setRequesting(false)
    }
  }, [])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return { stream, error, requesting, supported: SUPPORTED, requestCamera }
}
