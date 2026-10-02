import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

//get the file path 
const scriptDir = path.dirname(fileURLToPath(import.meta.url)) //=> frontend/script

//move to the file path /src/locales
const localeDir = path.resolve(scriptDir, '../src/locales')

//make the file structure of json into the structure with with . 
// for example { auth: { login: { title: "Đăng nhập" } } } → ['auth.login.title']
const flatten = (value, prefix = '') => Object.entries(value).flatMap(([key, child]) => {
  const next = `${prefix}${key}`
  return child && typeof child === 'object' && !('other' in child)
    ? flatten(child, `${next}.`)
    : [next]
})

//read all file .json in folder locales
const locales = Object.fromEntries(fs.readdirSync(localeDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => 
    //read file .json
    [path.basename(file, '.json'), 
    //Obtain a list of keys, and then convert it into a set for faster lookups.
    new Set(flatten(JSON.parse(fs.readFileSync(path.join(localeDir, file), 'utf8'))))
  ]))

//Check for the existence of a file vi.jsom
const base = locales.vi
if (!base) {
  console.error('Missing base locale: vi.json')
  process.exit(1)
}

//compare all the other.js key with vi.json to find the the misisng key from other file 
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
//check these file.json have mismatches or not
if (hasMismatch) process.exit(1)
console.log(`Locale keys match (${Object.keys(locales).join(', ')})`)
