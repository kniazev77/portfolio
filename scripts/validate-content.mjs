import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { schemas } from './content-schema.mjs'

const root = process.cwd()
const dataDir = path.join(root, 'content', 'data')
const placeholderPattern = /(\[EMAIL\]|\[TÉLÉPHONE\]|\[Dates?\]|_{4,}|TODO|TBD)/i
const errors = []
const parsed = {}

for (const [file, schema] of Object.entries(schemas)) {
  try {
    const source = await readFile(path.join(dataDir, file), 'utf8')
    if (placeholderPattern.test(source)) errors.push(`${file}: contains a placeholder`)
    const json = JSON.parse(source)
    parsed[file] = schema.parse(json)
  } catch (error) {
    errors.push(`${file}: ${error.message}`)
  }
}

const projectIds = new Set((parsed['projects.json'] ?? []).map((project) => project.id))
for (const variant of parsed['cvVariants.json'] ?? []) {
  for (const id of variant.projectIds) {
    if (!projectIds.has(id)) errors.push(`cvVariants.json: unknown project id "${id}"`)
  }
}

for (const project of parsed['projects.json'] ?? []) {
  for (const media of project.media) {
    if (media.startsWith('/')) {
      try {
        await access(path.join(root, 'public', media.replace(/^\//, '')))
      } catch {
        errors.push(`projects.json: missing asset ${media}`)
      }
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log('Content validation passed.')
