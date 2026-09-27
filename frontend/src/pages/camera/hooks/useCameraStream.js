import { useState, useEffect, useRef, useCallback } from 'react'
import { captureOptimizedFrame } from '../../../utils/imageProcessing.js'

export function useCameraStream() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const requestRef = useRef(0)
  const [isStreaming, setIsStreaming] = useState(false)
  const [hasPermission, setHasPermission] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isTorchOn, setIsTorchOn] = useState(false)

  const stopCamera = useCallback(() => {
    requestRef.current += 1
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
    stopCamera()
    const requestId = requestRef.current
    setCameraError(null)

    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false)
      setCameraError('Your browser does not support live camera access. Use HTTPS or localhost.')
      return
    }

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

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            if (requestId !== requestRef.current) return
            setIsStreaming(true)
            setHasPermission(true)
          }).catch((e) => {
            console.warn('Video autoplay failed:', e)
          })
        }
      }
    } catch (err) {
      if (requestId !== requestRef.current) return
      console.warn('Unable to access the camera:', err)
      setHasPermission(false)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied. Allow camera access to scan artifacts.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera was found on this device.')
      } else {
        setCameraError('Unable to start the camera: ' + (err.message || 'Unknown error'))
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
    if (!videoRef.current || !isStreaming) return null

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
