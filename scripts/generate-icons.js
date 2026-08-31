// Icon generation script — run from repo root: node scripts/generate-icons.js
// Uses @resvg/resvg-js (WASM-based, no native compilation required)
// package.json is "type": "module" so this file uses ESM import syntax.

import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')

const svgPath = resolve(repoRoot, 'public/icons/lw-icon.svg')
const svgString = readFileSync(svgPath, 'utf-8')

const outputs = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'icon-512-maskable.png', size: 512 },
]

for (const spec of outputs) {
  const resvg = new Resvg(svgString, {
    fitTo: { mode: 'width', value: spec.size },
  })
  const rendered = resvg.render()
  const pngBuffer = rendered.asPng()
  const outPath = resolve(repoRoot, 'public/icons', spec.file)
  writeFileSync(outPath, pngBuffer)
  console.log(`Generated ${spec.file} (${pngBuffer.length} bytes)`)
}

console.log('All icons generated successfully.')
