import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { schemas } from '../scripts/content-schema.mjs'

const dataDir = path.join(process.cwd(), 'content', 'data')

test('all canonical content files match their schemas', async () => {
  for (const [file, schema] of Object.entries(schemas)) {
    const json = JSON.parse(await readFile(path.join(dataDir, file), 'utf8'))
    assert.doesNotThrow(() => schema.parse(json), file)
  }
})

test('all public projects have unique ids and slugs', async () => {
  const projects = JSON.parse(await readFile(path.join(dataDir, 'projects.json'), 'utf8'))
  assert.equal(new Set(projects.map((item) => item.id)).size, projects.length)
  assert.equal(new Set(projects.map((item) => item.slug)).size, projects.length)
})
