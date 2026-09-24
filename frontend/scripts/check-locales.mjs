import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const localeDir = path.resolve(scriptDir, '../src/locales')
const flatten = (value, prefix = '') => Object.entries(value).flatMap(([key, child]) => {
  const next = `${prefix}${key}`
  return child && typeof child === 'object' && !('other' in child)
    ? flatten(child, `${next}.`)
    : [next]
})

const locales = Object.fromEntries(fs.readdirSync(localeDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => [path.basename(file, '.json'), new Set(flatten(JSON.parse(fs.readFileSync(path.join(localeDir, file), 'utf8'))))]))

const base = locales.vi
if (!base) {
  console.error('Missing base locale: vi.json')
  process.exit(1)
}

let hasMismatch = false
for (const [language, keys] of Object.entries(locales)) {
  if (language === 'vi') continue
  const missing = [...base].filter((key) => !keys.has(key))
  const extra = [...keys].filter((key) => !base.has(key))
  if (missing.length || extra.length) {
    hasMismatch = true
    console.error(`[${language}] missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'}`)
  }
}
if (hasMismatch) process.exit(1)
console.log(`Locale keys match (${Object.keys(locales).join(', ')})`)
