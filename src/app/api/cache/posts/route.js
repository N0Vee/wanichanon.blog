import { scanKeys, getJSON } from '@/app/lib/redis'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    // ดึง query param
    const { searchParams } = new URL(request.url)
    const featuredParam = searchParams.get('featured') // "true" / "false" / null

    // Use SCAN to avoid blocking Redis with KEYS in production-sized datasets
    const keys = await scanKeys('post:*')
    const posts = []

    for (const key of keys) {
      const post = await getJSON(key)
      if (!post) continue

      // ถ้า query featured มีค่า ให้กรอง
      if (featuredParam !== null) {
        const isFeatured = featuredParam === 'true'
        if (post.featured !== isFeatured) continue
      }

      posts.push(post)
    }

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Redis fetch cache error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
