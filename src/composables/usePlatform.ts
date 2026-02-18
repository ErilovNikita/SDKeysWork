import { computed } from "vue"

export function usePlatform() {
  const isWindows = computed(() => navigator.userAgent.toLowerCase().includes('windows'))
  const isMac = computed(() => navigator.userAgent.toLowerCase().includes('mac'))

  return { isWindows, isMac }
}