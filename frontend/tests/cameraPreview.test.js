import test from 'node:test'
import assert from 'node:assert/strict'
// Regression tests for src/utils/cameraPreview.js and HTTP error classification.
// Run with `npm test`; no physical camera, browser, or API server is required.
import { startCameraPreview } from '../src/utils/cameraPreview.js'
import { handleResponse } from '../src/utils/response.js'

class Preview extends EventTarget {
  readyState = 0
  videoWidth = 0
  videoHeight = 0
  play = () => Promise.resolve()
  frame() {
    this.readyState = 2
    this.videoWidth = 1280
    this.videoHeight = 720
    this.dispatchEvent(new Event('loadeddata'))
  }
}

test('metadata alone does not enable capture; a decoded frame does', async () => {
  const video = new Preview()
  let ready = false
  const pending = startCameraPreview(video, {}).then(() => { ready = true })
  video.readyState = 1
  video.dispatchEvent(new Event('loadedmetadata'))
  await Promise.resolve()
  assert.equal(ready, false)
  video.frame()
  await pending
  assert.equal(ready, true)
})

test('already-loaded video resolves without a new metadata event', async () => {
  const video = new Preview()
  video.frame()
  await startCameraPreview(video, {})
})

test('playback rejection reaches the caller so it can display retry', async () => {
  const video = new Preview()
  video.play = () => Promise.reject(new Error('Autoplay blocked'))
  await assert.rejects(startCameraPreview(video, {}), /Autoplay blocked/)
})

test('missing frames time out instead of leaving the shutter stuck', async () => {
  await assert.rejects(startCameraPreview(new Preview(), {}, { timeout: 10 }), /timed out/)
})

test('stopping the camera cancels a pending preview', async () => {
  const controller = new AbortController()
  const pending = startCameraPreview(new Preview(), {}, { signal: controller.signal })
  controller.abort()
  await assert.rejects(pending, { name: 'AbortError' })
})

test('HTTP 401 remains distinguishable from image recognition failures', async () => {
  await assert.rejects(handleResponse(new Response(JSON.stringify({ detail: 'Expired' }), {
    status: 401,
  }), 'Failed'), { status: 401, message: 'Expired' })
})
