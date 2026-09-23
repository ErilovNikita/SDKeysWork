#!/usr/bin/env node

import fs from 'node:fs/promises'
import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import process from 'node:process'
import { loadEnv } from 'vite'

const rootDir = process.cwd()
const fileEnv = loadEnv('deploy', rootDir, '')
const env = { ...fileEnv, ...process.env }

function required(name, fallback) {
  const value = env[name] || fallback
  if (!value) throw new Error(`Не задана переменная окружения ${name}`)
  return value
}

function parseBoolean(name, fallback = false) {
  const value = env[name]
  if (value === undefined || value === '') return fallback
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error(`${name} должна иметь значение true или false`)
}

function safeFormValue(value) {
  return String(value).replace(/[\r\n]/g, ' ')
}

function formField(boundary, name, value) {
  return Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="${name}"\r\n\r\n` +
    `${safeFormValue(value)}\r\n`
  )
}

async function createRequestBody({ boundary, archivePath, fields }) {
  const archive = await fs.readFile(archivePath)
  const fileName = path.basename(archivePath).replace(/["\r\n]/g, '_')
  const parts = Object.entries(fields).map(([name, value]) =>
    formField(boundary, name, value)
  )

  parts.push(Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
    'Content-Type: application/zip\r\n\r\n'
  ))
  parts.push(archive)
  parts.push(Buffer.from(`\r\n--${boundary}--\r\n`))

  return Buffer.concat(parts)
}

function send(url, body, boundary, rejectUnauthorized) {
  const transport = url.protocol === 'https:' ? https : http

  return new Promise((resolve, reject) => {
    const request = transport.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
      },
      ...(url.protocol === 'https:' ? { rejectUnauthorized } : {})
    }, response => {
      const chunks = []
      response.on('data', chunk => chunks.push(chunk))
      response.on('end', () => {
        const responseBody = Buffer.concat(chunks).toString('utf8')
        const status = response.statusCode ?? 0

        if (status < 200 || status >= 300) {
          reject(new Error(`NSMP вернул HTTP ${status}: ${responseBody || response.statusMessage}`))
          return
        }

        resolve(responseBody)
      })
    })

    request.setTimeout(60_000, () => {
      request.destroy(new Error('Истекло время ожидания ответа NSMP'))
    })
    request.on('error', reject)
    request.end(body)
  })
}

async function main() {
  const packageJson = JSON.parse(
    await fs.readFile(path.join(rootDir, 'package.json'), 'utf8')
  )
  const baseUrl = required('NSMP_URL')
  const accessKey = required('NSMP_ACCESS_KEY')
  const code = required('NSMP_APP_CODE', env.VITE_APP_CODE || packageJson.name)
  const archivePath = path.resolve(
    rootDir,
    'dist',
    `${env.VITE_APP_CODE || packageJson.name}-release-v${packageJson.version}.zip`
  )
  const endpoint = new URL('/sd/services/smpsync/ea', baseUrl)
  endpoint.searchParams.set('accessKey', accessKey)

  await fs.access(archivePath)

  const fields = {
    title: env.NSMP_APP_TITLE || code,
    code,
    minHeight: env.NSMP_APP_MIN_HEIGHT || '1000',
    turnOff: !parseBoolean('NSMP_APP_ENABLE', true)
  }
  const boundary = `----nsmp-${Date.now().toString(16)}`
  const body = await createRequestBody({ boundary, archivePath, fields })

  console.log(`Загрузка ${path.relative(rootDir, archivePath)} на ${endpoint.origin}...`)
  const response = await send(
    endpoint,
    body,
    boundary,
    parseBoolean('NSMP_TLS_REJECT_UNAUTHORIZED', true)
  )
  console.log(response || 'Приложение успешно загружено.')
}

main().catch(error => {
  console.error(`Ошибка публикации: ${error.message}`)
  process.exitCode = 1
})