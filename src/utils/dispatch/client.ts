import {
  buildDispatch,
  decodePersonalSettings,
  decodeAllPersonalSettings,
  GwtDispatchError,
  PERSONAL_SETTINGS_ACTION,
  ALL_PERSONAL_SETTINGS_ACTION
} from './protocol'
import type { AllPersonalSettings, BuildInfo, DispatchOptions, PersonalSettings } from './types'

/** Загружает текстовый ресурс текущей NSMP-сессии. */
const fetchText = async (url: string): Promise<string> => {
  const response = await window.fetch(url, { credentials: 'include' })
  const body = await response.text()
  if (!response.ok) { throw new GwtDispatchError(`Не удалось загрузить ${url}: HTTP ${response.status}`, body)}
  return body
}

/** Экранирует строку для безопасного использования внутри регулярного выражения. */
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Загружает policy hash и определяет сигнатуру action персональных настроек. */
const loadBuildInfo = async (
  moduleBase: string,
  options: DispatchOptions,
  action: string,
  actionSignature?: string,
): Promise<BuildInfo> => {
  const policySource = options.policyHash ?? await fetchText(`${moduleBase}police.txt`)
  const policyHash = policySource.match(/[0-9A-F]{32}/i)?.[0]
  if (!policyHash) {
    throw new GwtDispatchError(`Не удалось извлечь policy hash из ответа: ${JSON.stringify(policySource)}`)
  }

  if (actionSignature) {
    return { policyHash, actionSignature }
  }

  const policy = await fetchText(`${moduleBase}${policyHash}.gwt.rpc`)
  const escapedAction = escapeRegExp(action)
  const detectedActionSignature = policy.match(new RegExp(`${escapedAction}/(\\d+)`))?.[1]
  if (!detectedActionSignature) {
    throw new GwtDispatchError(`Action ${action} отсутствует в policy ${policyHash}`)
  }

  return { policyHash, actionSignature: detectedActionSignature }
}

/** Безопасно возвращает документ родительского окна при доступном same-origin доступе. */
const getParentDocument = (): Document | undefined => {
  try {
    return window.parent.document
  } catch {
    return undefined
  }
}

/** Ищет CSRF-токен NSMP в текущем и родительском документах. */
const findCsrfToken = (): string | undefined => {
  for (const documentObject of [document, getParentDocument()]) {
    const token = documentObject?.querySelector<HTMLMetaElement>('meta[name="_csrf"]')?.content
    if (token) return token
  }
  return undefined
}

/** Универсальный клиент выполнения GWT Dispatch action в NSMP. */
export class Dispatch {
  private readonly buildInfo = new Map<string, Promise<BuildInfo>>()

  /** Создаёт клиент и сохраняет параметры подключения. */
  constructor(private readonly options: DispatchOptions = {}) {}

  /** Выполняет GWT Dispatch action и возвращает необработанное тело ответа. */
  async dispatch(action: string, payload?: string, actionSignature?: string): Promise<string> {
    if (!action.trim()) throw new TypeError('Имя Dispatch action не должно быть пустым')

    const moduleBase = new URL(
      this.options.modulePath ?? '/sd/admin/',
      this.options.baseUrl ?? window.location.origin,
    ).href
    const build = await this.getBuildInfo(moduleBase, action, actionSignature)
    const csrfToken = this.options.csrfToken ?? findCsrfToken()
    if (!csrfToken) throw new GwtDispatchError('Не найден CSRF-токен текущей сессии')

    const response = await window.fetch(`${moduleBase}dispatch`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/x-gwt-rpc; charset=UTF-8',
        'X-GWT-Module-Base': moduleBase,
        'X-GWT-Permutation': this.options.permutation ?? build.policyHash,
        'X-CSRF-TOKEN': csrfToken,
      },
      body: buildDispatch(
        moduleBase,
        build.policyHash,
        build.actionSignature,
        action,
        payload,
      ),
    })

    const body = await response.text()
    if (!response.ok || !body.startsWith('//OK')) {
      throw new GwtDispatchError(`Ошибка GWT Dispatch: HTTP ${response.status}`, body)
    }
    return body
  }

  /** Получает персональные настройки пользователя. */
  async getPersonalSettings(userUuid: string): Promise<PersonalSettings> {
    return decodePersonalSettings(await this.dispatch(PERSONAL_SETTINGS_ACTION, userUuid))
  }

  /** Получает все персональные настройки. */
  async getAllPersonalSettings(): Promise<AllPersonalSettings> {
    return decodeAllPersonalSettings(await this.dispatch(ALL_PERSONAL_SETTINGS_ACTION))
  }

  /** Загружает данные GWT-сборки один раз и кеширует выполняющийся Promise. */
  private getBuildInfo(
    moduleBase: string,
    action: string,
    actionSignature?: string,
  ): Promise<BuildInfo> {
    const key = `${moduleBase}|${action}|${actionSignature ?? this.options.actionSignature ?? ''}`
    const existing = this.buildInfo.get(key)
    if (existing) return existing
    const buildInfo = loadBuildInfo(moduleBase, this.options, action, actionSignature ?? this.options.actionSignature)
    this.buildInfo.set(key, buildInfo)
    return buildInfo
  }
}

