import { NextResponse } from 'next/server'
import { contentFileSchemas } from '@/lib/schema'
import { createContentPullRequest } from '@/lib/github'
import { readSession } from '@/lib/session'

type PublishFile = {
  path: string
  content: string
  encoding: 'utf-8' | 'base64'
}

export async function POST(request: Request) {
  const session = await readSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const files = body.files as PublishFile[]
  if (!Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: 'No files were provided.' }, { status: 400 })
  }
  try {
    for (const file of files) {
      if (file.encoding === 'utf-8' && file.path.startsWith('content/data/')) {
        const name = file.path.split('/').at(-1) as keyof typeof contentFileSchemas
        const schema = contentFileSchemas[name]
        if (!schema) throw new Error(`Unsupported content file: ${file.path}`)
        schema.parse(JSON.parse(file.content))
      }
      if (file.encoding === 'base64' && !file.path.startsWith('public/images/projects/')) {
        throw new Error('Binary uploads are restricted to public/images/projects/.')
      }
    }
    const pull = await createContentPullRequest({
      token: session.accessToken,
      files,
      message: body.message || 'chore(content): update portfolio content'
    })
    return NextResponse.json({ pullRequestUrl: pull.html_url, number: pull.number })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to publish content.' },
      { status: 400 }
    )
  }
}
