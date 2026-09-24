import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { Platform } from './types'

/** Определяет платформу по строке User-Agent. */
export const detectPlatform = (userAgent: string): Platform => {
  const normalizedUserAgent = userAgent.toLowerCase()

  if (normalizedUserAgent.includes('windows')) return Platform.Windows
  if (normalizedUserAgent.includes('mac')) return Platform.MacOS
  return Platform.Other
}

/**
 * Возвращает реактивные признаки текущей платформы.
 * User-Agent можно передать явно для тестов или серверного рендеринга.
 */
export const usePlatform = (
  userAgent = globalThis.navigator?.userAgent ?? '',
): {
  platform: ComputedRef<Platform>
  isWindows: ComputedRef<boolean>
  isMac: ComputedRef<boolean>
} => {
  const platform = computed(() => detectPlatform(userAgent))
  const isWindows = computed(() => platform.value === Platform.Windows)
  const isMac = computed(() => platform.value === Platform.MacOS)

  return { platform, isWindows, isMac }
}

export {
  applyDisabledPlatformFeatures,
  applyPlatformFeatureRules,
  getDisabledPlatformFeatures,
} from './features'
export { Platform, PlatformFeature } from './types'
export type { PlatformFeatureRules } from './types'
