import { useState, useEffect, useRef, useCallback } from 'react'

export function useCameraStream() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [hasPermission, setHasPermission] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isTorchOn, setIsTorchOn] = useState(false)

  const stopCamera = useCallback(() => {
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
    setCameraError(null)

    // Kiểm tra hỗ trợ trình duyệt
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false)
      setCameraError('Trình duyệt của bạn không hỗ trợ truy cập Camera trực tiếp.')
      return
    }

    try {
      // Ưu tiên camera sau (environment) cho trải nghiệm quét di tích
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setIsStreaming(true)
            setHasPermission(true)
          }).catch((e) => {
            console.warn('Lỗi tự động phát video:', e)
          })
        }
      }
    } catch (err) {
      console.warn('Không thể truy cập camera:', err)
      setHasPermission(false)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Bạn đã từ chối quyền truy cập Camera. Hãy cấp quyền để quét hiện vật.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('Không tìm thấy thiết bị Camera trên máy của bạn.')
      } else {
        setCameraError('Không thể khởi động Camera: ' + (err.message || 'Lỗi không xác định'))
      }
    }
  }, [])

  // Bật/tắt đèn pin (Flash/Torch) nếu thiết bị hỗ trợ
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
        setIsTorchOn((prev) => !prev) // Mô phỏng trạng thái
      }
    } catch (err) {
      console.warn('Thiết bị không hỗ trợ bật đèn pin:', err)
      setIsTorchOn((prev) => !prev)
    }
  }, [isTorchOn])

  // Chụp ảnh từ khung hình video hiện tại sang Data URL
  const captureSnapshot = useCallback(() => {
    if (!videoRef.current || !isStreaming) return null

    try {
      const video = videoRef.current
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      const ctx = canvas.getContext('2d')
      if (!ctx) return null

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      setCapturedImage(dataUrl)
      return dataUrl
    } catch (e) {
      console.error('Lỗi chụp khung hình:', e)
      return null
    }
  }, [isStreaming])

  // Dọn dẹp tài nguyên khi unmount trang (tắt camera để bảo vệ pin và quyền riêng tư)
  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [startCamera, stopCamera])

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
