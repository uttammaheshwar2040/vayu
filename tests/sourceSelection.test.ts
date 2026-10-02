import assert from 'node:assert/strict'
import test from 'node:test'
import { shouldUseDemoFallback, sourceBadgeLabel } from '../src/lib/sourceSelection'

test('source labels stay explicit and distinct', () => {
  assert.equal(sourceBadgeLabel('live'), 'Live YouTube data')
  assert.equal(sourceBadgeLabel('demo'), 'Demo data')
  assert.equal(sourceBadgeLabel('authorization_required'), 'Authorization required')
  assert.equal(sourceBadgeLabel('unavailable'), 'Live data unavailable')
})

test('demo fallback selector avoids mixing sample and live data', () => {
  assert.equal(shouldUseDemoFallback('demo'), true)
  assert.equal(shouldUseDemoFallback('authorization_required'), true)
  assert.equal(shouldUseDemoFallback('unavailable'), true)
  assert.equal(shouldUseDemoFallback('live'), false)
})
