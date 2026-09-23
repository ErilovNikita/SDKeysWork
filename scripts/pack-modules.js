#!/usr/bin/env node

import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import process from 'node:process'

const rootDir = process.cwd()
const modulesDir = path.join(rootDir, 'modules')
const outputPath = path.resolve(
  process.argv[2] || path.join(rootDir, 'public', 'modules', 'parameters.xml')
)
const checksumSalt = '{66d4d9e9390e090854a95dc54e85d27c1eeae80f45083758e379dd34b5a7a83e}\n'

const escapeXml = value => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;')

const escapeCdata = value => value.replaceAll(']]>', ']]]]><![CDATA[>')
const checksum = (code, body) => {
  const hash = createHash('sha256')
    .update(`${code}${body}falsefalse${checksumSalt}`, 'utf8')
    .digest('hex')

  return hash.replace(/^0+(?=.)/, '')
}

async function getModuleFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async entry => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return getModuleFiles(entryPath)
    return entry.isFile() && entryPath !== outputPath ? [entryPath] : []
  }))

  return files.flat().sort((left, right) => left.localeCompare(right))
}

async function main() {
  const files = await getModuleFiles(modulesDir)
  if (!files.length) throw new Error(`В папке ${path.relative(rootDir, modulesDir)} нет файлов модулей`)

  const modules = await Promise.all(files.map(async filePath => {
    const body = await fs.readFile(filePath, 'utf8')
    const code = path.basename(filePath, path.extname(filePath))
    const hash = checksum(code, body)

    return [
      '    <module>',
      `      <code>${escapeXml(code)}</code>`,
      '      <active>true</active>',
      `      <script checksum="${hash}"><![CDATA[${escapeCdata(body)}]]></script>`,
      '      <rest_allowed>true</rest_allowed>',
      '    </module>',
    ].join('\n')
  }))

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<scriptStorage>',
    '  <modules>',
    modules.join('\n'),
    '  </modules>',
    '</scriptStorage>',
    '',
  ].join('\n')

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, xml, 'utf8')
  console.log(`Упаковано модулей: ${files.length}. Файл: ${path.relative(rootDir, outputPath)}`)
}

main().catch(error => {
  console.error(`Ошибка упаковки модулей: ${error.message}`)
  process.exitCode = 1
})
