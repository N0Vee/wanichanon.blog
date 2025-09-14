import Redis from 'ioredis'

// Create a single Redis client instance with sensible defaults.
// Keep default export compatible with existing usages (get, setex, del, keys, mget...).
// Use a global singleton to survive HMR in dev.
let client

class NoopRedis {
  constructor() {
    this.status = 'end'
  }
  async get() {
    return null
  }
  async set() {
    return 'OK'
  }
  async setex() {
    return 'OK'
  }
  async del() {
    return 0
  }
  async keys() {
    return []
  }
  async scan(_cursor = '0') {
    return ['0', []]
  }
  async mget() {
    return []
  }
  on() {
    /* no-op */
  }
}

const url = process.env.REDIS_URL
const g = globalThis
const REDIS_INSTANCE_KEY = '__WANICHANON_REDIS_CLIENT__'
const REDIS_EVENTS_WIRED = '__WANICHANON_REDIS_EVENTS_WIRED__'

if (url) {
  if (!g[REDIS_INSTANCE_KEY]) {
    g[REDIS_INSTANCE_KEY] = new Redis(url, {
      // Reduce risk of long stalls in serverless
      maxRetriesPerRequest: 2,
      enableAutoPipelining: true,
      // Optional: honor TLS when using rediss://
      tls: url.startsWith('rediss://') ? {} : undefined,
      // Optional: Defer connection until first command
      // lazyConnect: true,
    })
  }
  client = g[REDIS_INSTANCE_KEY]

  if (!g[REDIS_EVENTS_WIRED]) {
    client.on('error', (err) => {
      // Log but do not crash the app
      console.error('Redis error:', err?.message || err)
    })
    client.on('connect', () => {
      if (process.env.NODE_ENV !== 'production') {
        // Dev-only connection log
        // console.info('Redis connected')
      }
    })
    g[REDIS_EVENTS_WIRED] = true
  }
} else {
  // Graceful fallback when no REDIS_URL is provided
  // Dev-only notice (muted)
  // if (process.env.NODE_ENV !== 'production') {
  //   console.warn('REDIS_URL not set. Using NoopRedis (caching disabled).')
  // }
  client = new NoopRedis()
}

// Helper: get JSON value from Redis
export async function getJSON(key) {
  const val = await client.get(key)
  if (!val) return null
  try {
    return JSON.parse(val)
  } catch (_e) {
    // Corrupt JSON in cache; delete and return null
    try {
      await client.del(key)
    } catch {}
    return null
  }
}

// Helper: set JSON with optional TTL (seconds)
export async function setJSON(key, value, ttlSeconds) {
  const payload = JSON.stringify(value)
  if (ttlSeconds && Number.isFinite(ttlSeconds)) {
    return client.setex(key, ttlSeconds, payload)
  }
  return client.set(key, payload)
}

// Helper: scan all keys matching a pattern (avoids KEYS in prod)
export async function scanKeys(pattern, count = 200) {
  const keys = []
  let cursor = '0'
  do {
    const [nextCursor, batch] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', count)
    if (Array.isArray(batch) && batch.length) keys.push(...batch)
    cursor = nextCursor
  } while (cursor !== '0')
  return keys
}

export default client
