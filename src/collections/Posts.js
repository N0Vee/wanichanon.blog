import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'
import { CodeFeature } from '../features/CodeFeature'
import redis, { setJSON, getJSON, scanKeys } from '@/app/lib/redis'

export const Posts = {
  slug: 'posts',
  hooks: {
    afterChange: [
      async ({ doc }) => {
        try {
          // อัปเดต cache เมื่อมีการเปลี่ยนแปลง
          await setJSON(`post:${doc.id}`, doc, 3600)
          // cache updated
        } catch (error) {
          console.error('❌ Redis cache update error:', error)
        }
        return doc
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        try {
          // ลบ cache เมื่อ post ถูกลบ
          await redis.del(`post:${doc.id}`)
          // cache deleted
        } catch (error) {
          console.error('❌ Redis cache delete error:', error)
        }
        return doc
      },
    ],
  },
  endpoints: [
    {
      path: '/cache/posts',
      method: 'get',
      handler: async (req, res, _next) => {
        try {
          const keys = await scanKeys('post:*')
          const posts = []
          for (const key of keys) {
            const post = await getJSON(key)
            if (post) posts.push(post)
          }
          return res.status(200).json({ posts })
        } catch (error) {
          console.error('❌ Redis fetch cache error:', error)
          return res.status(500).json({ error: 'Internal Server Error' })
        }
      },
    },
  ],
  labels: {
    singular: 'Post',
    plural: 'Posts',
  },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'thumbnail',
      type: 'upload',
      required: true,
      relationTo: 'media',
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
    },
    {
      name: 'category',
      type: 'text',
      required: true,
      admin: {
        description: 'Primary category (e.g. CSS, TypeScript, Web Development)',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'details',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature(), CodeFeature],
      }),
      required: true,
      admin: {
        description: 'Rich text content (supports formatting, images, and code blocks).',
      },
    },
    {
      name: 'readTime',
      type: 'text',
      required: true,
      admin: {
        description: 'Human readable read time, e.g. "7 min read"',
      },
    },
    {
      name: 'date',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
