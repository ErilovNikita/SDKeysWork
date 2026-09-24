import { Platform, PlatformFeature } from './types'
import type { PlatformFeatureRules } from './types'

const DISABLED_FEATURES_ATTRIBUTE = 'data-disabled-platform-features'
const ANT_ANIMATIONS_STYLE_ID = 'platform-ant-animations'

const ANT_ANIMATIONS_STYLES = `
[${DISABLED_FEATURES_ATTRIBUTE}~="${PlatformFeature.AntAnimations}"] [class^="ant-"],
[${DISABLED_FEATURES_ATTRIBUTE}~="${PlatformFeature.AntAnimations}"] [class*=" ant-"] {
  animation: none !important;
  transition: none !important;
  scroll-behavior: auto !important;
}
`

/** Возвращает возможности, отключённые правилами для указанной платформы. */
export const getDisabledPlatformFeatures = (
  platform: Platform,
  rules: PlatformFeatureRules,
): readonly PlatformFeature[] => rules[platform] ?? []

/**
 * Применяет отключённые возможности к документу.
 *
 * Для `AntAnimations` отключает CSS-анимации и переходы всех Ant-компонентов.
 * Повторный вызов заменяет ранее применённый список возможностей.
 */
export const applyDisabledPlatformFeatures = (
  features: readonly PlatformFeature[],
  documentObject: Document | undefined = globalThis.document,
): void => {
  if (!documentObject) return

  const root = documentObject.documentElement
  if (features.length === 0) {
    root.removeAttribute(DISABLED_FEATURES_ATTRIBUTE)
    return
  }

  root.setAttribute(DISABLED_FEATURES_ATTRIBUTE, features.join(' '))

  if (
    features.includes(PlatformFeature.AntAnimations)
    && !documentObject.getElementById(ANT_ANIMATIONS_STYLE_ID)
  ) {
    const style = documentObject.createElement('style')
    style.id = ANT_ANIMATIONS_STYLE_ID
    style.textContent = ANT_ANIMATIONS_STYLES
    documentObject.head.append(style)
  }
}

/** Выбирает и применяет отключённые возможности для текущей платформы. */
export const applyPlatformFeatureRules = (
  platform: Platform,
  rules: PlatformFeatureRules,
  documentObject?: Document,
): readonly PlatformFeature[] => {
  const features = getDisabledPlatformFeatures(platform, rules)
  applyDisabledPlatformFeatures(features, documentObject)
  return features
}
