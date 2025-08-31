'use client'
import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { motion } from 'framer-motion'

export default function CodeBlock({ language = 'javascript', code = '' }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code: ', err)
    }
  }

  const languageMap = {
    js: "javascript",
    ts: "typescript",
    jsx: "javascript",
    tsx: "typescript",
    py: "python",
    sh: "bash",
    shell: "bash",
    yml: "yaml",
    md: "markdown",
  }

  const detectedLanguage = language
    ? languageMap[language.toLowerCase()] || language.toLowerCase()
    : "javascript"

  return (
    <div className="mb-6">
      <div className="bg-slate-900/90 border border-slate-700/50 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700/30">
          <span className="text-slate-400 text-sm font-medium flex items-center space-x-2">
            <i className="fas fa-code" />
            <span>{detectedLanguage}</span>
          </span>
          <motion.button
            onClick={copyToClipboard}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-2 py-1 text-xs text-slate-400 hover:text-emerald-400 border border-slate-600/40 hover:border-emerald-500/40 rounded transition-all duration-200"
            title="Copy code"
          >
            <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} mr-1`} />
            {copied ? 'Copied!' : 'Copy'}
          </motion.button>
        </div>
        <div className="p-0">
          <SyntaxHighlighter
            language={detectedLanguage}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: '1rem',
              background: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '0',
              fontSize: '0.875rem',
              lineHeight: '1.5',
            }}
            codeTagProps={{
              style: {
                fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              },
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  )
}
