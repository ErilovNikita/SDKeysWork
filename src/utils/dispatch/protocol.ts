import type { AllPersonalSettings, PersonalSettings, ThemeClient } from './types'

const GWT_SERVICE = 'net.customware.gwt.dispatch.shared.standard.StandardDispatchService'
const GWT_ACTION_INTERFACE = 'net.customware.gwt.dispatch.shared.Action'
const PERSONAL_SETTINGS_RESPONSE = 'ru.naumen.core.shared.dispatch.GetUserPersonalSettingsResponse'
const PERSONAL_SETTINGS_DTO = 'ru.naumen.core.shared.personalsettings.PersonalSettingsDTO'

export const PERSONAL_SETTINGS_ACTION = 'ru.naumen.core.shared.dispatch.GetUserPersonalSettingsAction'
export const ALL_PERSONAL_SETTINGS_ACTION = 'ru.naumen.core.shared.dispatch.GetAllPersonalSettingsAction'

/** Ошибка HTTP-запроса или обработки протокола GWT Dispatch. */
export class GwtDispatchError extends Error {
  /**
   * Создаёт ошибку GWT Dispatch и сохраняет исходное тело ответа для диагностики.
   *
   * @param message Понятное описание ошибки.
   * @param responseBody Необработанное тело ответа NSMP, если оно доступно.
   */
  constructor(message: string, readonly responseBody?: string) {
    super(message)
    this.name = 'GwtDispatchError'
  }
}

/** Формирует сериализованный GWT-RPC payload для указанного action. */
export const buildDispatch = (
  moduleBase: string,
  policyHash: string,
  actionSignature: string,
  action: string,
  payload?: string,
): string => {
  const strings = [
    moduleBase,
    policyHash,
    GWT_SERVICE,
    'execute',
    GWT_ACTION_INTERFACE,
    `${action}/${actionSignature}`,
  ]
  if (payload !== undefined) strings.push(payload)

  const stringCount = strings.length.toString()
  const serializedValues = payload === undefined
    ? ['1', '2', '3', '4', '1', '5', '6']
    : ['1', '2', '3', '4', '1', '5', '6', '7']
  return [stringCount, '0', stringCount, ...strings, ...serializedValues, ''].join('|')
}

/** Читает значения GWT-RPC в обратном порядке и разрешает ссылки на объекты. */
class GwtReader {
  private position: number
  private readonly references: unknown[] = []

  /** Создаёт reader для секции значений и таблицы строк GWT-пакета. */
  constructor(
    private readonly values: unknown[],
    private readonly strings: string[],
  ) {
    this.position = values.length - 1
  }

  /** Добавляет десериализованный объект в таблицу ссылок GWT. */
  addReference(value: unknown): void {
    this.references.push(value)
  }

  /** Проверяет, что следующее строковое значение содержит ожидаемый GWT-тип. */
  expectType(expected: string): void {
    const actual = this.string()
    if (!actual?.startsWith(`${expected}/`)) {
      throw new GwtDispatchError(`Ожидался GWT-тип ${expected}, получен ${actual}`)
    }
  }

  /** Читает nullable-строку из таблицы строк GWT. */
  string(): string | null {
    const token = this.integer()
    if (token === 0) return null
    if (token < 0) throw new GwtDispatchError('Ожидалась строка')
    return this.strings[token - 1] ?? null
  }

  /** Читает примитивное логическое значение GWT. */
  boolean(): boolean {
    return this.integer() === 1
  }

  /** Читает примитивное списочное значение GWT. */
  list<T>(readItem: () => T): T[] {
    this.expectType('java.util.ArrayList')
    const size = this.integer()
    const result: T[] = []
    this.addReference(result)
    for (let index = 0; index < size; index += 1) result.push(readItem())
    return result
  }

  /** Читает примитивное объектное значение GWT. */
  object<T>(expected: string, readValue: () => T): T | null {
    const token = this.integer()
    if (token === 0) return null
    if (token < 0) return this.reference(token, 'object') as T
    this.expectTokenType(token, expected)
    const value = readValue()
    this.addReference(value)
    return value
  }

  /** Читает nullable-значение `java.lang.Boolean` или ссылку на него. */
  boxedBoolean(): boolean | null {
    const token = this.integer()
    if (token === 0) return null
    if (token < 0) return this.reference(token, 'boolean') as boolean
    this.expectTokenType(token, 'java.lang.Boolean')
    const value = this.boolean()
    this.addReference(value)
    return value
  }

  /** Читает nullable-значение `java.lang.Integer` или ссылку на него. */
  boxedNumber(): number | null {
    const token = this.integer()
    if (token === 0) return null
    if (token < 0) return this.reference(token, 'number') as number
    this.expectTokenType(token, 'java.lang.Integer')
    const value = this.integer()
    this.addReference(value)
    return value
  }

  /** Читает следующее целочисленное значение пакета. */
  private integer(): number {
    const value = this.values[this.position--]
    if (!Number.isInteger(value)) throw new GwtDispatchError('Ожидалось число')
    return value as number
  }

  /** Разрешает отрицательный GWT-токен в ранее прочитанное значение указанного типа. */
  private reference(token: number, type: 'boolean' | 'number' | 'object'): unknown {
    const value = this.references[-token - 1]
    if (typeof value !== type) throw new GwtDispatchError('Некорректная GWT-ссылка')
    return value
  }

  /** Проверяет тип значения по положительному токену таблицы строк. */
  private expectTokenType(token: number, expected: string): void {
    const actual = this.strings[token - 1]
    if (!actual?.startsWith(`${expected}/`)) {
      throw new GwtDispatchError(`Ожидался тип ${expected}, получен ${actual}`)
    }
  }
}


/** Декодирует успешный ответ GWT Dispatch в персональные настройки пользователя. */
export const decodePersonalSettings = (body: string): PersonalSettings => {
  const reader = createReader(body)
  reader.expectType(PERSONAL_SETTINGS_RESPONSE)
  reader.addReference({})
  reader.expectType(PERSONAL_SETTINGS_DTO)

  const result = {} as PersonalSettings
  reader.addReference(result)
  result.addCommentInlineFormPresentation = reader.string()
  result.fontSize = reader.boxedNumber()
  result.gwtStackMode = reader.string()
  result.homePage = reader.string()
  result.interfaceCompact = reader.boxedBoolean()
  result.locale = reader.string()
  result.objectChangeTrackingEnabled = reader.boolean()
  result.personUuid = reader.string()
  result.showAdvancedSearchElements = reader.boxedBoolean()
  result.themeAdmin = reader.string()
  result.themeOperator = reader.string()
  result.timeZoneId = reader.string()
  result.useAdvancedSearch = reader.boxedBoolean()
  result.useUserQATiles = reader.boxedBoolean()
  return result
}

/** Декодирует список тем и глобальные настройки из GetAllPersonalSettingsResponse. */
export const decodeAllPersonalSettings = (body: string): AllPersonalSettings => {
  const strings = readPacketStrings(body)
  const markerIndex = strings.indexOf('system#default')
  const defaultTitle = markerIndex < 0 ? null : strings[markerIndex + 1]
  const themeTitle = defaultTitle?.match(/^.*\((.*)\)$/)?.[1] ?? null
  const themeTitleIndex = themeTitle ? strings.indexOf(themeTitle) : -1
  let themeCode = themeTitleIndex > 0 ? strings[themeTitleIndex - 1] : null

  if (themeCode == 'style.properties') themeCode = strings[themeTitleIndex - 4]

  const themes: ThemeClient[] = themeCode
    ? [{
        adminTheme: false,
        displayedInAdminMode: false,
        enabled: true,
        image: null,
        logoFile: null,
        logoLoginFile: null,
        operatorTheme: true,
        paramsFile: null,
        system: false,
        code: themeCode,
        title: themeTitle,
      }]
    : []

  return { themes, changeTrackingSettings: null }
}

function readPacketStrings(body: string): string[] {
  let packet: unknown
  try {
    packet = JSON.parse(body.slice(4))
  } catch {
    throw new GwtDispatchError('Некорректный JSON в GWT-ответе', body)
  }
  if (!Array.isArray(packet) || !Array.isArray(packet.at(-3))) {
    throw new GwtDispatchError('Некорректный GWT-ответ', body)
  }
  return packet.at(-3) as string[]
}

function createReader(body: string): GwtReader {
  let packet: unknown
  try {
    packet = JSON.parse(body.slice(4))
  } catch {
    throw new GwtDispatchError('Некорректный JSON в GWT-ответе', body)
  }
  if (!Array.isArray(packet) || !Array.isArray(packet.at(-3))) {
    throw new GwtDispatchError('Некорректный GWT-ответ', body)
  }
  return new GwtReader(packet.slice(0, -3), packet.at(-3) as string[])
}
