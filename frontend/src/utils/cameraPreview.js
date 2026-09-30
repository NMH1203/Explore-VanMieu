// Called by pages/camera/hooks/useCameraStream.js; tested in tests/cameraPreview.test.js.
// Resolve only after playback starts and a drawable frame is available. Metadata
// alone is insufficient: the camera may report dimensions before decoded pixels.
// Remove listeners on success, timeout, playback failure, or navigation abort.
export function startCameraPreview(video, stream, { signal, timeout = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    let playing = false
    const events = ['loadeddata', 'canplay', 'playing', 'resize']
    const cleanup = () => {
      clearTimeout(timer)
      events.forEach(event => video.removeEventListener(event, checkFrame))
      video.removeEventListener('error', fail)
      signal?.removeEventListener('abort', abort)
    }
    const finish = (error) => {
      cleanup()
      if (error) reject(error)
      else resolve()
    }
    const checkFrame = () => {
      if (playing && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) finish()
    }
    const fail = () => finish(new Error('Unable to play the camera preview.'))
    const abort = () => finish(new DOMException('Camera stopped.', 'AbortError'))
    const timer = setTimeout(() => finish(new Error('Camera preview timed out.')), timeout)
    events.forEach(event => video.addEventListener(event, checkFrame))
    video.addEventListener('error', fail)
    signal?.addEventListener('abort', abort, { once: true })
    if (signal?.aborted) return abort()
    try {
      video.srcObject = stream
      Promise.resolve(video.play()).then(() => {
        playing = true
        checkFrame()
      }, finish)
    } catch (error) {
      finish(error)
    }
  })
}
