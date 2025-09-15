import { scanKeys, getJSON, setJSON, getJSONMany } from '@/app/lib/redis'
import { NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@/payload.config.js'

export async function GET(request) {
  try {
    // ดึง query param
    const { searchParams } = new URL(request.url)
    const featuredParam = searchParams.get('featured') // "true" / "false" / null
    const isFeaturedFilter =
      featuredParam === 'true' ? true : featuredParam === 'false' ? false : null

    // Try an aggregated list cache first to avoid scanning many keys
    const indexKey = isFeaturedFilter === true ? 'posts:index:featured' : 'posts:index:all'
    const cachedList = await getJSON(indexKey)
    if (Array.isArray(cachedList) && cachedList.length) {
      return NextResponse.json({ posts: cachedList })
    }

    // Build from existing per-post caches quickly using MGET
    let posts = []
    const keys = await scanKeys('post:*')
    if (keys.length) {
      const all = await getJSONMany(keys)
      posts = all.filter(Boolean)
      if (isFeaturedFilter !== null) posts = posts.filter((p) => p?.featured === isFeaturedFilter)
      // Sort newest first by createdAt or fallback to date
      posts.sort(
        (a, b) => new Date(b?.createdAt || b?.date || 0) - new Date(a?.createdAt || a?.date || 0),
      )
      posts = posts.slice(0, 20)
    }

    // If still empty, hit Payload API as a fallback and populate caches
    if (posts.length === 0) {
      const payload = await getPayloadHMR({ config: configPromise })
      const query = {
        collection: 'posts',
        limit: 20,
        sort: '-createdAt',
      }
      if (isFeaturedFilter !== null) {
        query.where = { featured: { equals: isFeaturedFilter } }
      }
      const result = await payload.find(query)
      posts = result?.docs || []

      // Write individual post caches in background
      Promise.all(
        posts.map((post) => setJSON(`post:${post.id}`, post, 3600).catch(() => {})),
      ).catch(() => {})
    }

    // Store aggregated list cache with a short TTL for speed on subsequent requests
    setJSON(indexKey, posts, 60).catch(() => {})

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Redis fetch cache error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
