<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, shallowRef } from 'vue'

import { ConfigProvider } from '@minitwiks/nsmp-vue-components'
import { parseNsmpTheme } from '@minitwiks/nsmp-vue-components/utils'
import type { NsmpThemeProperties } from '@minitwiks/nsmp-vue-components/utils'
import { getCurrentUserTheme } from './utils/theme'
import { getThemeConfigurationByCode } from './utils/theme'

import {useSearchStore} from './stores/search.ts'
import {useUserStore} from './stores/user.ts'
import type {IUser} from './utils/types.ts'
import ConnectorService from './utils/connector.ts'
import {isDev} from './utils/connector.ts'

import Version from './components/Version.vue'
import KeysList from './components/KeysList.vue'
import MessageTemplate from './components/views/MessageTemplate.vue'
import StatesModal from './components/development/StatesModal.vue'
import CreateKeyModal from './components/modal/CreateKey.vue'
import DeleteKeysModal from "./components/modal/DeleteKeys.vue"
import AccessKeyModal from "./components/modal/AccessKey.vue"
import SearchModal from "./components/modal/Search.vue"

const appReady = ref(false)
const searchStore = useSearchStore()
const userStore = useUserStore()
const modals = reactive({ 
  create: false, 
  delete: false, 
  keyInfo: false, 
  search: false 
})
const nsmpTheme = shallowRef<NsmpThemeProperties>()
const hasOpenModal = ref(false)
let modalObserver: MutationObserver | undefined

const updateModalHeight = (): void => {
  hasOpenModal.value = Array.from(document.querySelectorAll('.ant-modal-wrap')).some((modal) => {
    const style = window.getComputedStyle(modal)
    return style.display !== 'none' && style.visibility !== 'hidden'
  })
}

onMounted(async () => {
  // Modals are teleported outside of the application root. Keep the element
  // measured by iframe-resizer at least 700px high while any of them is open.
  updateModalHeight()
  modalObserver = new MutationObserver(updateModalHeight)
  modalObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['class', 'style'],
    childList: true,
    subtree: true,
  })

  try{
    const themeCode = await getCurrentUserTheme(jsApi.getCurrentUser().uuid)
    const themeConfiguration = await getThemeConfigurationByCode(themeCode)
    nsmpTheme.value = parseNsmpTheme(themeConfiguration)
  } catch(e) {
    console.error('Ошибка при получении темы пользователя:', e)
  }

  try {
    const data: IUser = await new ConnectorService().getUserData()
    userStore.setUser(data)
  } finally {
    appReady.value = true
  }
})

onBeforeUnmount(() => modalObserver?.disconnect())
</script>

<template>
  <ConfigProvider :nsmp-theme="nsmpTheme">
    <div
      v-if="appReady"
      data-iframe-size
      :style="{ backgroundColor: 'white', minHeight: hasOpenModal ? '700px' : undefined }"
    >
      <StatesModal v-if="isDev()"/>
      <CreateKeyModal v-model:open="modals.create"/>
      <DeleteKeysModal v-model:open="modals.delete"/>
      <AccessKeyModal v-model:open="modals.keyInfo"/>
      <SearchModal v-model:open="modals.search" @search="searchStore.setSearchData" />

      <Version/>

      <KeysList 
        v-if="userStore.canUse"
        @showModal:CreateKey="modals.create = true"
        @showModal:DeleteAllKeys="modals.delete = true"
        @showModal:Search="modals.search = true"
        @showModal:AccessKeyInfo="searchStore.setSearchData"
      />

      <MessageTemplate 
        v-if="!userStore.canUse" emoji="✨"
        header="Ваших прав не достаточно" description="Но вы можете посмотреть как тут красиво"
      />
    </div>
  </ConfigProvider>
</template>
