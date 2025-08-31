'use client'
import React from 'react'

const CodeBlockAdmin = ({ data, onChange }) => {
  const handleLanguageChange = (event) => {
    onChange({
      ...data,
      language: event.target.value
    })
  }

  const handleCodeChange = (event) => {
    onChange({
      ...data,
      code: event.target.value
    })
  }

  return (
    <div style={{ 
      border: '1px solid #e1e5e9',
      borderRadius: '4px',
      padding: '16px',
      margin: '8px 0',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontSize: '14px', 
          fontWeight: '500',
          color: '#333'
        }}>
          Programming Language
        </label>
        <select
          value={data?.language || 'javascript'}
          onChange={handleLanguageChange}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="csharp">C#</option>
          <option value="php">PHP</option>
          <option value="ruby">Ruby</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
          <option value="sql">SQL</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="json">JSON</option>
          <option value="markdown">Markdown</option>
          <option value="bash">Bash</option>
          <option value="text">Plain Text</option>
        </select>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontSize: '14px', 
          fontWeight: '500',
          color: '#333'
        }}>
          Code
        </label>
        <textarea
          value={data?.code || ''}
          onChange={handleCodeChange}
          placeholder="Enter your code here..."
          style={{
            width: '100%',
            minHeight: '200px',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            backgroundColor: '#1a202c',
            color: '#f7fafc',
            resize: 'vertical'
          }}
        />
      </div>

      {data?.code && (
        <div style={{ 
          fontSize: '12px', 
          color: '#666',
          textAlign: 'right'
        }}>
          {data.code.length} characters
        </div>
      )}
    </div>
  )
}

export default CodeBlockAdmin
