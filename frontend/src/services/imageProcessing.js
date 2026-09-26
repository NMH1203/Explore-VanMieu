// Match the server's low-detail image budget while reducing mobile upload size.
export const MAX_IMAGE_EDGE = 512
export const JPEG_QUALITY = 0.75

export function fitImageSize(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error('The camera frame has invalid dimensions.')
  }
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(width, height))
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

export function captureOptimizedFrame(video) {
  const size = fitImageSize(video.videoWidth, video.videoHeight)
  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Unable to prepare the camera image.')
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(video, 0, 0, size.width, size.height)
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}
