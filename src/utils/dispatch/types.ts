/** Персональные настройки пользователя, возвращаемые NSMP. */
export interface PersonalSettings {
  addCommentInlineFormPresentation: string | null
  fontSize: number | null
  gwtStackMode: string | null
  homePage: string | null
  interfaceCompact: boolean | null
  locale: string | null
  objectChangeTrackingEnabled: boolean
  personUuid: string | null
  showAdvancedSearchElements: boolean | null
  themeAdmin: string | null
  themeOperator: string | null
  timeZoneId: string | null
  useAdvancedSearch: boolean | null
  useUserQATiles: boolean | null
}

/** Тема из GetAllPersonalSettingsResponse. */
export interface ThemeClient {
  code: string
  title: string | null
  displayedInAdminMode: boolean
  system: boolean
  enabled: boolean
  operatorTheme: boolean
  adminTheme: boolean
  image: string | null
  paramsFile: unknown | null
  logoFile: unknown | null
  logoLoginFile: unknown | null
}

/** Ответ GetAllPersonalSettingsAction. */
export interface AllPersonalSettings {
  themes: ThemeClient[]
  changeTrackingSettings: unknown
}


/** Параметры подключения к GWT Dispatch NSMP. */
export interface DispatchOptions {
  /** Policy hash GWT-сборки. Если не указан, загружается автоматически. */
  policyHash?: string
  /** Числовая сигнатура GWT action. Если не указана, извлекается из policy. */
  actionSignature?: string
  /** Значение заголовка `X-GWT-Permutation`. По умолчанию используется policy hash. */
  permutation?: string
  /** Базовый URL NSMP. По умолчанию используется origin текущей страницы. */
  baseUrl?: string
  /** Путь к GWT-модулю. По умолчанию `/sd/admin/`. */
  modulePath?: string
  /** CSRF-токен. Если не указан, ищется в текущем или родительском документе. */
  csrfToken?: string
}

/** Данные GWT-сборки, необходимые для формирования Dispatch-запроса. */
export interface BuildInfo {
  policyHash: string
  actionSignature: string
}
