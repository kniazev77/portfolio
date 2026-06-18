import { NextResponse } from 'next/server'
import { readSession } from '@/lib/session'
import profile from '@/content/data/profile.json'
import experience from '@/content/data/experience.json'
import education from '@/content/data/education.json'
import projects from '@/content/data/projects.json'
import cvVariants from '@/content/data/cvVariants.json'

export async function GET() {
  const session = await readSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({
    'profile.json': profile,
    'experience.json': experience,
    'education.json': education,
    'projects.json': projects,
    'cvVariants.json': cvVariants
  })
}
