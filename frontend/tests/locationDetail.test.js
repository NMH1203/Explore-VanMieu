// Render the real JSX with the project's Vite/React runtime. No browser, device,
// or network is required; effects do not run during server-side test rendering.
import { before, after, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { MAP_LOCATIONS } from '../src/data/mapLocations.js'

let server
let LocationDetailPage
let LanguageProvider
let RewardContext

before(async () => {
  server = await createServer({
    configFile: false,
    cacheDir: 'node_modules/.vite-tests',
    plugins: [react()],
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  })
  ;({ default: LocationDetailPage } = await server.ssrLoadModule('/src/pages/location-detail/LocationDetailPage.jsx'))
  ;({ LanguageProvider } = await server.ssrLoadModule('/src/i18n/LanguageContext.jsx'))
  ;({ RewardContext } = await server.ssrLoadModule('/src/store/RewardContext.jsx'))
})
after(async () => { await server?.close() })

function render(id, unlockedLocations) {
  // An empty reward challenge must not hide an earned stamp at any of ten sites.
  return renderToStaticMarkup(createElement(LanguageProvider, null,
    createElement(RewardContext.Provider, { value: { reward: { completed_ids: [] } } },
      createElement(LocationDetailPage, { id, unlockedLocations }))))
}

test('every unlocked site displays its story and stamp outside the reward challenge', () => {
  for (const site of MAP_LOCATIONS) {
    const html = render(site.id, new Set([site.id]))
    assert.match(html, /interpret-layout/, site.id)
    assert.match(html, /heritage-stamp/, site.id)
    assert.doesNotMatch(html, /locked-detail/, site.id)
  }
})

test('all ten locked detail routes hide stories and stamps', () => {
  for (const site of MAP_LOCATIONS) {
    const html = render(site.id, new Set())
    assert.match(html, /locked-detail/, site.id)
    assert.doesNotMatch(html, /interpret-layout|heritage-stamp/, site.id)
  }
})

test('public figure pages do not receive heritage-site stamps', () => {
  const html = render('figure-confucius', new Set())
  assert.match(html, /interpret-layout/)
  assert.doesNotMatch(html, /heritage-stamp/)
})
