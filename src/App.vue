<script setup lang="ts">
import themeConfig from './themeProvider'
import { ref } from 'vue'

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

const searchStore = useSearchStore()
const UserStore = useUserStore()

const KeysListRef = ref<InstanceType<typeof KeysList> | null>(null)
const createKeyModalRef = ref<InstanceType<typeof CreateKeyModal> | null>(null)
const deleteKeysModalRef = ref<InstanceType<typeof DeleteKeysModal> | null>(null)
const KeyInfoModalRef = ref<InstanceType<typeof AccessKeyModal> | null>(null)
const SearchModalRef = ref<InstanceType<typeof SearchModal> | null>(null)

new ConnectorService().getUserData().then( (data:IUser) => UserStore.setUser(data))

const handleCreateKeyModalShow = ():any => createKeyModalRef.value?.controller.show()
const handleDeleteKeysModalShow = ():any => deleteKeysModalRef.value?.controller.show()
const handleKeyInfoModalShow = ():any => KeyInfoModalRef.value?.controller.show()
const handleSearchModalShow = ():any => SearchModalRef.value?.controller.show()
const handleResetSearch = ():any => KeysListRef.value?.getPage('all')
const handleSearch = async (value: string):Promise<any> => {
  searchStore.setSearchData(value)
  
  if (searchStore.mode === SearchMode.UUID) {
    if (!KeyInfoModalRef.value) return
    const result = await KeyInfoModalRef.value.waitForResult()
    if (result === 'success') handleKeyInfoModalShow()
  }
}
</script>

<template>
  <a-config-provider :theme="themeConfig">
    <StatesModal v-if="isDev()"/>
    <CreateKeyModal ref="createKeyModalRef"/>
    <DeleteKeysModal ref="deleteKeysModalRef"/>
    <AccessKeyModal ref="KeyInfoModalRef"/>
    <SearchModal ref="SearchModalRef" @search="handleSearch" />

    <Header 
      @showModal:CreateKey="handleCreateKeyModalShow"
      @showModal:DeleteAllKeys="handleDeleteKeysModalShow"
      @showModal:Search="handleSearchModalShow"
      @search:Reset="handleResetSearch"
    />

    <KeysList ref="KeysListRef" />

    <MessageTemplate 
      v-if="!UserStore.canUse"
      emoji="✨"
      header="Ваших прав не достаточно"
      description="Но вы можете посмотреть как тут красиво"
    />
  </a-config-provider>
</template>
