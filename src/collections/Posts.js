import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'
import { CodeFeature } from '../features/CodeFeature'

export const Posts = {
  slug: 'posts',
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
