// Makes the server a normal, self-contained TypeScript project (no
// cross-directory rootDir tricks) by copying the canonical shared protocol
// file in from the repo root before every build/dev run. Source of truth
// stays at ../shared/mpTypes.ts; this copy is generated and gitignored.
import { copyFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const src = join(here, '..', '..', 'shared', 'mpTypes.ts')
const destDir = join(here, '..', 'src', 'shared')
const dest = join(destDir, 'mpTypes.ts')

mkdirSync(destDir, { recursive: true })
copyFileSync(src, dest)
console.log(`Copied shared protocol types: ${src} -> ${dest}`)
