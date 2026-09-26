import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

test('camera video exists before streaming starts so a stream can attach', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  try {
    const { LanguageProvider } = await server.ssrLoadModule('/src/i18n/LanguageContext.jsx')
    const { default: CameraViewfinder } = await server.ssrLoadModule('/src/pages/camera/components/CameraViewfinder.jsx')
    for (const isStreaming of [false, true]) {
      const html = renderToStaticMarkup(createElement(LanguageProvider, null,
        createElement(CameraViewfinder, { videoRef: { current: null }, isStreaming }),
      ))
      assert.match(html, /<video/)
      assert.equal(html.includes('camera-art-fallback'), !isStreaming)
    }
  } finally {
    await server.close()
  }
})
