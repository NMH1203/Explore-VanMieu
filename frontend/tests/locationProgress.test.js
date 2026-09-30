// Exercise the state used by src/hooks/useLocationProgress.js -> src/App.jsx.
// These cases protect the ten-site catalog and delayed cross-account responses.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { MAP_LOCATIONS } from '../src/data/mapLocations.js'
import { heritageItems } from '../src/data/heritageItems.js'
import { detailPaths } from '../src/routes/index.js'
import { locationProgressReducer as reduce } from '../src/utils/locationProgress.js'
import { getProgress } from '../src/services/passport-service/index.js'

const empty = () => ({ userId: 'alice', ids: new Set() })
const verified = (id, userId = 'alice') => ({ type: 'verified', userId, result: { verified: true, location_id: id } })
const first = MAP_LOCATIONS[0].id

test('all ten database seed IDs have matching map entries and detail routes', () => {
  const source = readFileSync(new URL('../../database/seeds/seed_locations.py', import.meta.url), 'utf8')
  const seedIds = [...source.matchAll(/"location_id":\s*"([^"]+)"/g)].map(match => match[1])
  assert.equal(seedIds.length, 10)
  assert.equal(new Set(seedIds).size, 10)
  assert.deepEqual(new Set(MAP_LOCATIONS.map(item => item.id)), new Set(seedIds))
  for (const id of seedIds) {
    assert.ok(detailPaths[id], `Missing route for ${id}`)
    assert.ok(heritageItems.some(item => item.id === id), `Missing detail content for ${id}`)
  }
})

test('all ten persisted unlocks restore after a reload', () => {
  const state = reduce(empty(), { type: 'loaded', userId: 'alice', progress: MAP_LOCATIONS.map(item => ({ location_id: item.id, status: true })) })
  assert.equal(state.ids.size, 10)
})

test('a delayed initial snapshot does not erase a newly verified stamp', () => {
  const scanned = reduce(empty(), verified(first))
  assert.ok(reduce(scanned, { type: 'loaded', userId: 'alice', progress: [] }).ids.has(first))
})

test('duplicate scans count once; failed scans and unknown IDs never unlock', () => {
  let state = reduce(empty(), verified(first))
  state = reduce(state, verified(first))
  state = reduce(state, verified('unknown-location'))
  state = reduce(state, { type: 'verified', userId: 'alice', result: { verified: false, location_id: MAP_LOCATIONS[1].id } })
  assert.deepEqual([...state.ids], [first])
})

test('only explicit true status from progress grants a known site', () => {
  const progress = [
    { location_id: first, status: false },
    { location_id: MAP_LOCATIONS[1].id, status: 'false' },
    { location_id: 'unknown-location', status: true },
  ]
  assert.equal(reduce(empty(), { type: 'loaded', userId: 'alice', progress }).ids.size, 0)
})

test('switching accounts clears stamps and ignores late responses for the old account', () => {
  let state = reduce(empty(), verified(first))
  state = reduce(state, { type: 'reset', userId: 'bob' })
  state = reduce(state, verified(first))
  state = reduce(state, { type: 'loaded', userId: 'alice', progress: [{ location_id: first, status: true }] })
  assert.equal(state.ids.size, 0)
  assert.equal(state.userId, 'bob')
})

test('progress requests carry session credentials and the cancellation signal', async t => {
  const controller = new AbortController()
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/progress')
    assert.equal(options.credentials, 'include')
    assert.equal(options.signal, controller.signal)
    return new Response('[]')
  })
  assert.deepEqual(await getProgress({ signal: controller.signal }), [])
})
