import { useState, useEffect, useRef, useCallback } from 'react'

// Phát âm thanh tiếng chụp ảnh (Shutter click "tách") bằng Web Audio API
export function playShutterSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    // Click 1 (màn trập mở)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'triangle'
    osc1.frequency.setValueAtTime(1100, now)
    osc1.frequency.exponentialRampToValueAtTime(180, now + 0.03)
    gain1.gain.setValueAtTime(0.85, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.03)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.035)

    // Click 2 (màn trập đóng sau 0.04s)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'square'
    osc2.frequency.setValueAtTime(1500, now + 0.04)
    osc2.frequency.exponentialRampToValueAtTime(100, now + 0.09)
    gain2.gain.setValueAtTime(0.9, now + 0.04)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.09)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.04)
    osc2.stop(now + 0.1)
  } catch (e) {
    console.warn('Không thể phát âm thanh màn trập:', e)
  }
}

export function useCameraStream() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [hasPermission, setHasPermission] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [facingMode, setFacingMode] = useState('user') // Mặc định 'user' (camera trước / webcam quét mặt)
  const [reloadKey, setReloadKey] = useState(0)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsStreaming(false)
  }, [])

  // Khởi động Camera với cơ chế fallback tự động (hỗ trợ React StrictMode)
  useEffect(() => {
    let isCancelled = false
    setIsStreaming(false)
    setCameraError(null)

    async function initCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (!isCancelled) {
          setHasPermission(false)
          setCameraError('Trình duyệt không hỗ trợ WebRTC Camera.')
        }
        return
      }

      // Dừng stream cũ trước khi xin stream mới
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }

      let activeStream = null

      // 1. Thử mở theo hướng camera yêu cầu (trước/sau)
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: false,
        })
      } catch (err1) {
        console.warn(`Không mở được theo facingMode ${facingMode}, thử fallback camera bất kỳ:`, err1)
      }

      // 2. Fallback: Mở bất kỳ webcam nào có trên máy (Laptop/PC)
      if (!activeStream) {
        try {
          activeStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          })
        } catch (err2) {
          if (!isCancelled) {
            console.error('Không thể mở camera:', err2)
            setHasPermission(false)
            if (err2.name === 'NotAllowedError' || err2.name === 'PermissionDeniedError') {
              setCameraError('Quyền truy cập Camera đang bị chặn. Hãy bấm vào biểu tượng Camera có dấu X đỏ trên thanh địa chỉ URL để chọn Cho phép (Allow).')
            } else if (err2.name === 'NotFoundError' || err2.name === 'DevicesNotFoundError') {
              setCameraError('Không tìm thấy thiết bị Camera / Webcam nào trên máy của bạn.')
            } else {
              setCameraError('Lỗi khởi động Camera: ' + (err2.message || 'Không xác định'))
            }
          }
          return
        }
      }

      if (isCancelled) {
        if (activeStream) {
          activeStream.getTracks().forEach((t) => t.stop())
        }
        return
      }

      if (activeStream) {
        streamRef.current = activeStream
        setHasPermission(true)
        setCameraError(null)

        if (videoRef.current) {
          videoRef.current.srcObject = activeStream
          videoRef.current.onloadedmetadata = () => {
            if (!isCancelled) {
              videoRef.current?.play().catch(() => {})
              setIsStreaming(true)
            }
          }
          videoRef.current.play().then(() => {
            if (!isCancelled) setIsStreaming(true)
          }).catch(() => {})
        }
      }
    }

    initCamera()

    return () => {
      isCancelled = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [facingMode, reloadKey])

  // Hàm thủ công để người dùng kích hoạt xin lại quyền camera
  const startCamera = useCallback(() => {
    setReloadKey((prev) => prev + 1)
  }, [])

  // Đổi qua lại giữa Camera trước và Camera sau
  const toggleFacingMode = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }, [])

  // Chụp ảnh từ khung hình video hiện tại
  const captureSnapshot = useCallback(() => {
    playShutterSound()

    if (!videoRef.current) return null

    try {
      const video = videoRef.current
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      const ctx = canvas.getContext('2d')
      if (!ctx) return null

      // Lật gương nếu là camera trước (webcam)
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      setCapturedImage(dataUrl)
      return dataUrl
    } catch (e) {
      console.error('Lỗi chụp khung hình:', e)
      return null
    }
  }, [facingMode])

  return {
    videoRef,
    isStreaming,
    hasPermission,
    cameraError,
    capturedImage,
    setCapturedImage,
    facingMode,
    toggleFacingMode,
    startCamera,
    stopCamera,
    captureSnapshot,
  }
}
