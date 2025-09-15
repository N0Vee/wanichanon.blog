import Redis from 'ioredis'

// Minimal, lazy-initialized Redis client with a simple no-op fallback
let _client

class NoopRedis {
  constructor() {
    this.status = 'end'
  }
  async get() { return null }
  async set() { return 'OK' }
  async setex() { return 'OK' }
  async del() { return 0 }
  async keys() { return [] }
  async scan(_cursor = '0') { return ['0', []] }
  async mget() { return [] }
  on() { /* no-op */ }
}

export function getRedis() {
  if (_client) return _client
  const url = process.env.REDIS_URL
  if (!url) {
    _client = new NoopRedis()
    return _client
  }
  _client = new Redis(url, {
    maxRetriesPerRequest: 2,
    enableAutoPipelining: true,
    tls: url.startsWith('rediss://') ? {} : undefined,
  })
  _client.on('error', (err) => {
    console.error('Redis error:', err?.message || err)
  })
  return _client
}

// Helper: get JSON value from Redis
export async function getJSON(key) {
  const client = getRedis()
  const val = await client.get(key)
  if (!val) return null
  try {
    return JSON.parse(val)
  } catch (_e) {
    try { await client.del(key) } catch {}
    return null
  }
}

// Helper: set JSON with optional TTL (seconds)
export async function setJSON(key, value, ttlSeconds) {
  const client = getRedis()
  const payload = JSON.stringify(value)
  if (ttlSeconds && Number.isFinite(ttlSeconds)) {
    return client.setex(key, ttlSeconds, payload)
  }
  return client.set(key, payload)
}

// Helper: get multiple JSON values using MGET
export async function getJSONMany(keys) {
  if (!Array.isArray(keys) || keys.length === 0) return []
  const client = getRedis()
  const vals = await client.mget(keys)
  const out = []
  for (let i = 0; i < vals.length; i++) {
    const v = vals[i]
    if (!v) { out.push(null); continue }
    try { out.push(JSON.parse(v)) } catch { out.push(null) }
  }
  return out
}

// Helper: scan all keys matching a pattern (avoids KEYS in prod)
export async function scanKeys(pattern, count = 200) {
  const client = getRedis()
  const keys = []
  let cursor = '0'
  do {
    const [nextCursor, batch] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', count)
    if (Array.isArray(batch) && batch.length) keys.push(...batch)
    cursor = nextCursor
  } while (cursor !== '0')
  return keys
}

// Default export: a thin wrapper that lazily initializes the client on first method call
const redis = {
  get: (...args) => getRedis().get(...args),
  set: (...args) => getRedis().set(...args),
  setex: (...args) => getRedis().setex(...args),
  del: (...args) => getRedis().del(...args),
  keys: (...args) => getRedis().keys(...args),
  scan: (...args) => getRedis().scan(...args),
  mget: (...args) => getRedis().mget(...args),
  on: (...args) => getRedis().on(...args),
}

export default redis
