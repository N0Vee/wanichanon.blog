import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'

import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Welcome to the Payload + Next.js App!</h1>
      {user ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Hello, {user.firstName}!</h2>
          <p className="text-gray-600 mb-6">You are logged in as {user.email}.</p>
          <Image
            src={user.avatar?.url || '/default-avatar.png'}
            alt="User Avatar"
            width={100}
            height={100}
            className="rounded-full mx-auto"
          />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">You are not logged in.</h2>
          <p className="text-gray-600">Please log in to access your account details.</p>
        </div>
      )}
      <div className="mt-8 p-4 bg-white rounded-lg shadow-md w-full max-w-md text-center">
        <p className="text-gray-600">
          Open this file in VSCode: <a href={fileURL} className="text-blue-500 underline">{fileURL}</a>
        </p>
      </div>
    </div>
  )
}
