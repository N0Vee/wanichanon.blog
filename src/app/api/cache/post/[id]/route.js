// app/api/cache/post/[id]/route.js
import { NextResponse } from 'next/server'
import { getJSON, setJSON } from '@/app/lib/redis'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@/payload.config.js'

export async function GET(request, { params }) {
  const { id } = await params

  try {
    // ลองดึงจาก Redis ก่อน
    const cachedPost = await getJSON(`post:${id}`)
    if (cachedPost) return NextResponse.json(cachedPost)

    // ถ้าไม่มี cache → ดึงจาก Payload โดยตรง (หลีกเลี่ยง HTTP ซ้อนในโปรเซส)
    const payload = await getPayloadHMR({ config: configPromise })
    const post = await payload.findByID({ collection: 'posts', id })

    // เก็บลง Redis cache 1 ชั่วโมง
    await setJSON(`post:${id}`, post, 3600)

    return NextResponse.json(post)
  } catch (error) {
    console.error('Redis fetch cache error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
