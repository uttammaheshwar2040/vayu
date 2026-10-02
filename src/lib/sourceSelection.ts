import type { SourceStatus } from '../types/integration'

export function sourceBadgeLabel(source: SourceStatus) {
  if (source === 'live') {
    return 'Live YouTube data'
  }

  if (source === 'authorization_required') {
    return 'Authorization required'
  }

  if (source === 'unavailable') {
    return 'Live data unavailable'
  }

  return 'Demo data'
}

export function shouldUseDemoFallback(source: SourceStatus) {
  return source === 'demo' || source === 'authorization_required' || source === 'unavailable'
}
