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
export const HAS_REDIS = Boolean(url)
const g = globalThis
const REDIS_INSTANCE_KEY = '__WANICHANON_REDIS_CLIENT__'
const REDIS_EVENTS_WIRED = '__WANICHANON_REDIS_EVENTS_WIRED__'
const MEMCACHE_KEY = '__WANICHANON_MEM_CACHE__' // L1 cache (always on)
const MEMCACHE_META_KEY = '__WANICHANON_MEM_CACHE_META__'

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

// Initialize L1 memory cache for all environments (even with Redis) to reduce tail latency
if (!g[MEMCACHE_KEY]) g[MEMCACHE_KEY] = new Map()
if (!g[MEMCACHE_META_KEY]) g[MEMCACHE_META_KEY] = { size: 0 }

// Helper: get JSON value from Redis
export async function getJSON(key) {
  // L1 memory lookup first
  const store = g[MEMCACHE_KEY]
  if (store) {
    const entry = store.get(key)
    if (entry) {
      const { value, exp } = entry
      if (!exp || Date.now() <= exp) {
        try {
          return JSON.parse(value)
        } catch {
          store.delete(key)
        }
      } else {
        store.delete(key)
      }
    }
  }

  if (HAS_REDIS) {
    const val = await client.get(key)
    if (!val) return null
    try {
      const parsed = JSON.parse(val)
      // populate L1 with a short TTL (e.g., 30s) if the Redis record had no TTL we still keep short
      const ttlMs = 30 * 1000
      if (store) store.set(key, { value: val, exp: Date.now() + ttlMs })
      return parsed
    } catch (_e) {
      // Corrupt JSON in cache; delete and return null
      try {
        await client.del(key)
      } catch {}
      return null
    }
  }
  // No Redis: L1 only (already checked above)
  return null
}

// Helper: set JSON with optional TTL (seconds)
export async function setJSON(key, value, ttlSeconds) {
  const payload = JSON.stringify(value)
  // Always set L1 with a bounded TTL (use provided TTL or 60s default for L1)
  const store = g[MEMCACHE_KEY]
  if (store) {
    const l1TtlMs =
      (ttlSeconds && Number.isFinite(ttlSeconds) ? Math.min(ttlSeconds, 60) : 60) * 1000
    store.set(key, { value: payload, exp: Date.now() + l1TtlMs })
  }

  if (HAS_REDIS) {
    if (ttlSeconds && Number.isFinite(ttlSeconds)) {
      return client.setex(key, ttlSeconds, payload)
    }
    return client.set(key, payload)
  }
  return 'OK'
}

// Helper: get multiple JSON values using MGET
export async function getJSONMany(keys) {
  if (!Array.isArray(keys) || keys.length === 0) return []
  const store = g[MEMCACHE_KEY]
  const out = new Array(keys.length).fill(null)
  const misses = []
  const missIdx = []
  if (store) {
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i]
      const entry = store.get(k)
      if (entry) {
        const { value, exp } = entry
        if (!exp || Date.now() <= exp) {
          try {
            out[i] = JSON.parse(value)
            continue
          } catch {
            store.delete(k)
          }
        } else {
          store.delete(k)
        }
      }
      misses.push(k)
      missIdx.push(i)
    }
  } else {
    misses.push(...keys)
    missIdx.push(...keys.map((_, i) => i))
  }

  if (HAS_REDIS && misses.length) {
    const vals = await client.mget(misses)
    for (let j = 0; j < vals.length; j++) {
      const v = vals[j]
      const i = missIdx[j]
      if (!v) {
        out[i] = null
        continue
      }
      try {
        const parsed = JSON.parse(v)
        out[i] = parsed
        // populate L1 with short TTL
        if (g[MEMCACHE_KEY])
          g[MEMCACHE_KEY].set(misses[j], { value: v, exp: Date.now() + 30 * 1000 })
      } catch {
        out[i] = null
      }
    }
  }
  return out
}

// Helper: scan all keys matching a pattern (avoids KEYS in prod)
export async function scanKeys(pattern, count = 200) {
  if (HAS_REDIS) {
    const keys = []
    let cursor = '0'
    do {
      const [nextCursor, batch] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', count)
      if (Array.isArray(batch) && batch.length) keys.push(...batch)
      cursor = nextCursor
    } while (cursor !== '0')
    return keys
  } else {
    const store = g[MEMCACHE_KEY]
    if (!store) return []
    // naive glob to regex conversion for '*'
    const regex = new RegExp(
      '^' +
        pattern
          .split('*')
          .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          .join('.*') +
        '$',
    )
    const out = []
    for (const k of store.keys()) {
      if (regex.test(k)) out.push(k)
    }
    return out
  }
}

export default client
