import { BlocksFeature } from '@payloadcms/richtext-lexical'

const languages = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  csharp: 'C#',
  php: 'PHP',
  ruby: 'Ruby',
  go: 'Go',
  rust: 'Rust',
  sql: 'SQL',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  markdown: 'Markdown',
  bash: 'Bash',
  text: 'Plain Text'
}

export const CodeFeature = BlocksFeature({
  blocks: [
    {
      slug: 'codeBlock',
      labels: {
        singular: 'Code Block',
        plural: 'Code Blocks',
      },
      fields: [
        {
          name: 'language',
          type: 'select',
          options: Object.entries(languages).map(([key, value]) => ({
            label: value,
            value: key,
          })),
          defaultValue: 'javascript',
          required: true,
        },
        {
          name: 'code',
          type: 'code',
          required: true,
        },
      ],
    },
  ],
})