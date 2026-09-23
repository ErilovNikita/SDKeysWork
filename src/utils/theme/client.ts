import { Dispatch } from '../dispatch'

/** Ошибка загрузки конфигурации темы. */
export class ThemeError extends Error {
  constructor(message: string, readonly responseBody?: string) {
    super(message)
    this.name = 'ThemeError'
  }
}

/**
 * Получает конфигурацию темы NSMP по её коду.
 *
 * @param themeCode Код темы, передаваемый в параметре `theme`.
 * @returns Строковое содержимое конфигурации темы.
 * @throws {TypeError} Если код темы пустой.
 * @throws {ThemeError} Если сервер вернул неуспешный HTTP-статус.
 */
export const getThemeConfigurationByCode = async (themeCode: string): Promise<string> => {
  if (!themeCode.trim()) throw new TypeError('Код темы не должен быть пустым')

  const params = new URLSearchParams({
    id: 'common',
    method: 'theme',
    theme: themeCode,
  })
  const response = await window.fetch(`/sd/jspresource?${params.toString()}`, {
    method: 'GET',
  })
  const body = await response.text()

  if (!response.ok) { throw new ThemeError(`Не удалось получить конфигурацию темы: HTTP ${response.status}`, body)}

  return body
}

/** Получает код темы операторского интерфейса текущего пользователя. */
export const getCurrentUserTheme = async (userUuid: string): Promise<string> => {
  const dispatch = new Dispatch()
  const settings = await dispatch.getPersonalSettings(userUuid)

  if (settings.themeOperator && settings.themeOperator !== 'system#default') return settings.themeOperator 

  const allSettings = await dispatch.getAllPersonalSettings()
  const defaultTheme = allSettings.themes.find(theme => theme.operatorTheme)?.code

  if (!defaultTheme) { throw new ThemeError('Не удалось определить тему оператора по умолчанию') }

  return defaultTheme
}