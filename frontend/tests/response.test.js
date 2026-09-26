import assert from 'node:assert/strict'
import test from 'node:test'
import { handleResponse } from '../src/services/response.js'

test('returns successful API data', async () => {
  assert.deepEqual(await handleResponse(Response.json({ verified: true }), 'Failed'), { verified: true })
})

test('preserves a readable API error', async () => {
  await assert.rejects(handleResponse(Response.json({ detail: 'Sign in first.' }, { status: 401 }), 'Failed'), /Sign in first/)
})

test('uses the fallback for validation arrays and HTML proxy errors', async () => {
  for (const response of [
    Response.json({ detail: [{ msg: 'Invalid input' }] }, { status: 422 }),
    new Response('<html>Bad gateway</html>', { status: 502 }),
  ]) {
    await assert.rejects(handleResponse(response, 'Unable to verify check-in'), /Unable to verify check-in/)
  }
})

test('rejects malformed successful responses', async () => {
  await assert.rejects(handleResponse(new Response('not JSON'), 'Failed'), /invalid response/)
})
