const parseRuDate = (value: string): Date | null => {
  const match = value.match(
    /^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})$/
  )

  if (!match) return null

  const [, day, month, year, hour, minute] = match

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  )
}

export const formatSmartDate = (value?: string | Date | null): string => {
  if (!value) return 'Не указано'

  let date: Date | null = value instanceof Date ? value : parseRuDate(value)
  if (!date || isNaN(date.getTime())) return 'Не указано'
  const now = new Date()

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )

  const startOfTarget = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  )

  const diffDays = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24))

  const time = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (diffDays === 0) return `Сегодня в ${time}`
  if (diffDays === -1) return `Вчера в ${time}`
  if (diffDays === 1) return `Завтра в ${time}`

  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const criticalDeadline = (value?: string | null): boolean => {
  if (!value) return false

  const date = parseRuDate(value)
  if (!date || isNaN(date.getTime())) return false

  const now = new Date()
  const nowPlusTwoDays = new Date(
    now.getTime() + 2 * 24 * 60 * 60 * 1000
  )

  return date.getTime() < nowPlusTwoDays.getTime()
}

export const getLastVersion = async (
  owner: string,
  repo: string
): Promise<string> => {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`)

    if (!response.ok) throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    const data:any[] = await response.json()

    if (!data[0].tag_name) throw new Error('Некорректный ответ GitHub API: отсутствует tag_name')

    return data[0].tag_name
  } catch (error) {
    throw new Error(`Не удалось получить последнюю версию: ${(error as Error).message}`)
  }
}

export const compareVersions = (localVersion: string, remoteVersion: string): -1 | 0 | 1 => {
  const parse = (v: string) => v.split('.').map(n => parseInt(n, 10))

  for (let i = 0; i < 3; i++) {
    const localNum = parse(localVersion)[i] ?? 0
    const remoteNum = parse(remoteVersion)[i] ?? 0

    if (localNum < remoteNum) return -1
    if (localNum > remoteNum) return 1
  }

  return 0
}