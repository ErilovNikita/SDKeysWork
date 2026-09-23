<script setup lang="ts">
import { ConfigProvider } from '@minitwiks/nsmp-vue-components'
import { onMounted, reactive, ref } from 'vue'

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
  <ConfigProvider>
    <div v-if="appReady" style="background-color: white;">
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
      />

      <MessageTemplate 
        v-if="!userStore.canUse" emoji="✨"
        header="Ваших прав не достаточно" description="Но вы можете посмотреть как тут красиво"
      />
    </div>
  </ConfigProvider>
</template>
