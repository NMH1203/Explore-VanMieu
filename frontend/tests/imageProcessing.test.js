import assert from 'node:assert/strict'
import test from 'node:test'
import { captureOptimizedFrame, fitImageSize } from '../src/utils/imageProcessing.js'

test('fits landscape, portrait, and square frames without enlarging small images', () => {
  assert.deepEqual(fitImageSize(1280, 720), { width: 512, height: 288 })
  assert.deepEqual(fitImageSize(720, 1280), { width: 288, height: 512 })
  assert.deepEqual(fitImageSize(2000, 2000), { width: 512, height: 512 })
  assert.deepEqual(fitImageSize(120, 80), { width: 120, height: 80 })
})

test('rejects frames that are not ready or have invalid dimensions', () => {
  for (const size of [[0, 720], [100, -1], [NaN, 100], [Infinity, 100]]) {
    assert.throws(() => fitImageSize(...size), /invalid dimensions/)
  }
})

test('captures a scaled JPEG at the configured quality', (t) => {
  const calls = []
  const context = { drawImage: (...args) => calls.push(args) }
  const canvas = {
    getContext: () => context,
    toDataURL: (type, quality) => { calls.push([type, quality]); return 'data:image/jpeg;base64,test' },
  }
  const original = Object.getOwnPropertyDescriptor(globalThis, 'document')
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement: () => canvas } })
  t.after(() => { if (original) Object.defineProperty(globalThis, 'document', original); else delete globalThis.document })
  const video = { videoWidth: 1920, videoHeight: 1080 }
  assert.equal(captureOptimizedFrame(video), 'data:image/jpeg;base64,test')
  assert.deepEqual(calls, [[video, 0, 0, 512, 288], ['image/jpeg', 0.75]])
})
