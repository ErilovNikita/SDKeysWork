import { defineStore } from 'pinia'
import { ref } from 'vue'
import { SearchMode } from '../utils/types'

export const useSearchStore = defineStore('search', () => {
  const mode = ref<SearchMode>(SearchMode.Login)
  const data = ref<string|null>(null)
  const trigger = ref<number>(0)

  const setSearchMode = (newMode: SearchMode) => mode.value = newMode

  const setSearchData = (text: string) => {
    data.value = text
    trigger.value++
  }

  const resetApp = () => {
    mode.value = SearchMode.Login
    data.value = null
  }

  return {
    mode,
    data,
    trigger,

    setSearchMode,
    setSearchData,
    resetApp
  }
})