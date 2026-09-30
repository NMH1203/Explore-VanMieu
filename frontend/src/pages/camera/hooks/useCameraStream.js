import { useState, useEffect, useRef, useCallback } from 'react'
import { captureOptimizedFrame } from '../../../utils/imageProcessing.js'
import { startCameraPreview } from '../../../utils/cameraPreview.js'

// CameraPage.jsx owns user actions; this hook owns the device stream lifetime.
// utils/cameraPreview.js waits for drawable video before enabling capture, then
// utils/imageProcessing.js produces the JPEG uploaded by check-in-service.
// requestRef prevents an older permission/playback request from reviving a
// stopped stream after retry or navigation. stopCamera releases every track.
export function useCameraStream() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const requestRef = useRef(0)
  const previewAbortRef = useRef(null)
  const startingRef = useRef(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [hasPermission, setHasPermission] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isTorchOn, setIsTorchOn] = useState(false)

  const stopCamera = useCallback(() => {
    requestRef.current += 1
    previewAbortRef.current?.abort()
    previewAbortRef.current = null
    startingRef.current = false
    setIsStarting(false)
    setIsTorchOn(false)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsStreaming(false)
  }, [])

  const startCamera = useCallback(async () => {
    if (startingRef.current) return
    stopCamera()
    const requestId = requestRef.current
    setCameraError(null)

    if (!window.isSecureContext) {
      setHasPermission(false)
      setCameraError('insecureCamera')
      return
    }

    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false)
      setCameraError('unsupportedCamera')
      return
    }

    startingRef.current = true
    setIsStarting(true)
    try {
      // Prefer the rear camera for scanning heritage sites
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      if (requestId !== requestRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      streamRef.current = stream

      if (!videoRef.current) throw new Error('Camera preview is unavailable.')
      const controller = new AbortController()
      previewAbortRef.current = controller
      await startCameraPreview(videoRef.current, stream, { signal: controller.signal })
      if (requestId !== requestRef.current) return
      setIsStreaming(true)
      setHasPermission(true)
      stream.getVideoTracks().forEach(track => track.addEventListener('ended', () => {
        if (requestId !== requestRef.current) return
        stopCamera()
        setCameraError('cameraInterrupted')
      }, { once: true }))
    } catch (err) {
      if (requestId !== requestRef.current) return
      console.warn('Unable to access the camera:', err)
      stopCamera()
      setHasPermission(false)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('cameraDenied')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('cameraNotFound')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('cameraBusy')
      } else {
        setCameraError('cameraStartFailed')
      }
    } finally {
      if (requestId === requestRef.current) {
        startingRef.current = false
        setIsStarting(false)
      }
    }
  }, [stopCamera])

  // Toggle the torch on supported devices
  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return
    const track = streamRef.current.getVideoTracks()[0]
    if (!track) return

    try {
      const capabilities = track.getCapabilities?.() || {}
      if (capabilities.torch) {
        const nextState = !isTorchOn
        await track.applyConstraints({
          advanced: [{ torch: nextState }],
        })
        setIsTorchOn(nextState)
      } else {
        setIsTorchOn(false)
      }
    } catch (err) {
      console.warn('Unable to enable the torch:', err)
      setIsTorchOn(false)
    }
  }, [isTorchOn])

  // Capture the current video frame as a data URL
  const captureSnapshot = useCallback(() => {
    if (!videoRef.current || !isStreaming || videoRef.current.readyState < 2) return null

    try {
      const dataUrl = captureOptimizedFrame(videoRef.current)
      setCapturedImage(dataUrl)
      return dataUrl
    } catch (e) {
      console.error('Unable to capture the frame:', e)
      return null
    }
  }, [isStreaming])

  // Camera access is requested from the user's explicit scan action so mobile
  // browsers can show the permission prompt from a trusted interaction.
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return {
    videoRef,
    isStreaming,
    isStarting,
    hasPermission,
    cameraError,
    capturedImage,
    setCapturedImage,
    isTorchOn,
    toggleTorch,
    startCamera,
    stopCamera,
    captureSnapshot,
  }
}
