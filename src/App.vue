<script setup lang="ts">
import themeConfig from './themeProvider'
import { onMounted, ref } from 'vue'

import {useSearchStore} from './stores/search.ts'
import {useUserStore} from './stores/user.ts'
import type {IUser} from './utils/types.ts'
import {SearchMode} from './utils/types.ts'
import ConnectorService from './utils/connector.ts'
import {isDev} from './utils/connector.ts'

import Header from './components/Header.vue'
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

const keysListRef = ref<InstanceType<typeof KeysList> | null>(null)
const createKeyModalRef = ref<InstanceType<typeof CreateKeyModal> | null>(null)
const deleteKeysModalRef = ref<InstanceType<typeof DeleteKeysModal> | null>(null)
const keyInfoModalRef = ref<InstanceType<typeof AccessKeyModal> | null>(null)
const searchModalRef = ref<InstanceType<typeof SearchModal> | null>(null)

new ConnectorService().getUserData().then( (data:IUser) => userStore.setUser(data))

const handleCreateKeyModalShow = ():any => createKeyModalRef.value?.controller.show()
const handleDeleteKeysModalShow = ():any => deleteKeysModalRef.value?.controller.show()
const handleKeyInfoModalShow = ():any => keyInfoModalRef.value?.controller.show()
const handleSearchModalShow = ():any => searchModalRef.value?.controller.show()
const handleResetSearch = ():any => keysListRef.value?.getPage('all')
const handleSearch = async (value: string):Promise<any> => {
  searchStore.setSearchData(value)
  
  if (searchStore.mode === SearchMode.UUID) {
    if (!keyInfoModalRef.value) return
    const result = await keyInfoModalRef.value.waitForResult()
    if (result === 'success') handleKeyInfoModalShow()
  }
}

onMounted(async () => {
  try {
    const data: IUser = await new ConnectorService().getUserData()
    userStore.setUser(data)
  } finally {
    appReady.value = true
  }
})
</script>

<template>
  <a-config-provider :theme="themeConfig">
    <template v-if="appReady">
      <StatesModal v-if="isDev()"/>
      <CreateKeyModal ref="createKeyModalRef"/>
      <DeleteKeysModal ref="deleteKeysModalRef"/>
      <AccessKeyModal ref="keyInfoModalRef"/>
      <SearchModal ref="searchModalRef" @search="handleSearch" />

      <Header 
        @showModal:CreateKey="handleCreateKeyModalShow"
        @showModal:DeleteAllKeys="handleDeleteKeysModalShow"
        @showModal:Search="handleSearchModalShow"
        @search:Reset="handleResetSearch"
      />

      <KeysList ref="keysListRef" />

      <MessageTemplate 
        v-if="!userStore.canUse"
        emoji="✨"
        header="Ваших прав не достаточно"
        description="Но вы можете посмотреть как тут красиво"
      />
    </template>
  </a-config-provider>
</template>
