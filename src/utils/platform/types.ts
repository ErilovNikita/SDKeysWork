/** Поддерживаемые клиентские платформы. */
export enum Platform {
  Windows = 'windows',
  MacOS = 'macos',
  Other = 'other',
}

/** Возможности интерфейса, которые можно отключить для выбранной платформы. */
export enum PlatformFeature {
  AntAnimations = 'ant-animations',
}

/** Список отключённых возможностей для каждой платформы. */
export type PlatformFeatureRules = Partial<Record<Platform, readonly PlatformFeature[]>>
