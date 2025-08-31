import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@/payload.config.js'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ posts: [] })
    }

    const payload = await getPayloadHMR({ config: configPromise })

    const posts = await payload.find({
      collection: 'posts',
      where: {
        or: [
          {
            title: {
              like: query,
            },
          },
          {
            excerpt: {
              like: query,
            },
          },
        ],
      },
      limit: 10,
      sort: '-createdAt',
      select: {
        id: true,
        title: true,
        excerpt: true,
        details: true,
        createdAt: true,
        date: true,
        thumbnail: true,
        category: true,
      },
    })

    // Extract excerpt from content
    const postsWithExcerpts = posts.docs.map((post) => {
      // Use existing excerpt field or fallback to extracting from details
      let excerpt = post.excerpt || ''

      // If no excerpt, try to extract from Lexical details content
      if (!excerpt && post.details && Array.isArray(post.details)) {
        for (const block of post.details) {
          if (block.type === 'paragraph' && block.children) {
            const textNodes = block.children.filter((child) => child.type === 'text')
            if (textNodes.length > 0) {
              excerpt = textNodes.map((node) => node.text).join(' ')
              break
            }
          }
        }
      }

      // Limit excerpt length
      if (excerpt && excerpt.length > 150) {
        excerpt = excerpt.substring(0, 147) + '...'
      }

      return {
        id: post.id,
        title: post.title,
        excerpt: excerpt || 'No excerpt available',
        createdAt: post.createdAt,
        date: post.date || post.createdAt,
        thumbnail: post.thumbnail,
        category: post.category,
      }
    })

    return NextResponse.json({ posts: postsWithExcerpts })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Search failed', posts: [] }, { status: 500 })
  }
}
