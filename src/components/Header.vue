<script setup lang="ts">
import { reactive } from 'vue'
import { Alert, Button, type AlertType } from '@minitwiks/nsmp-vue-components'
import { DeleteIcon, PlusIcon, ZoomInIcon } from 'nsmp-icons'
import { useUserStore } from '../stores/user'
import { useSearchStore } from '../stores/search'
import { compareVersions, getLastVersion } from '../utils/services'
import { SearchMode } from '../utils/types'

const emit = defineEmits<{
  (e: 'showModal:CreateKey'): void
  (e: 'showModal:DeleteAllKeys'): void
  (e: 'showModal:Search'): void
  (e: 'search:Reset'): void
}>()

const searchStore = useSearchStore()
const userStore = useUserStore()
const version = reactive({ open: false, type: 'info' as AlertType, message: '' })
const setVersion = (type: AlertType, message: string) => Object.assign(version, { open: true, type, message })

getLastVersion('ErilovNikita', 'SDKeysWork').then(remoteVersion => {
    switch(compareVersions(__APP_VERSION__, remoteVersion)) {
        case 1:
            setVersion('warning', `Вы используете тестовую версию ${__APP_VERSION__}! Свяжитесь с поддержкой для исправления.`)
            console.warn(`Последний релиз в репозитории: ${remoteVersion} < ${__APP_VERSION__}`)
            break
        case -1:
            setVersion('error', `Ваша версия ${__APP_VERSION__} устарела! Сбросьте кеш браузера, чтобы получить новую версию.`)
            console.warn(`Последний релиз в репозитории: ${remoteVersion} > ${__APP_VERSION__}`)
            break
        case 0:
            setVersion('success', `Используется актуальная версия ${__APP_VERSION__}`)
            break
    }
}) .catch(e => {
    setVersion('error', (e as Error).message + ". Свяжитесь с поддержкой для исправления.")
})
</script>

<template>
  <a-row class="header">
    <a-col :span="12">
      <a-space v-if="userStore?.canUse">
        <a-space :size="1">
          <Button
            type="default"
            :icon="ZoomInIcon"
            v-if="userStore?.superUser"
            @click="emit('showModal:Search')"
          >Поиск</Button>
        </a-space>

        <Button
          type="default"
          :icon="PlusIcon"
          @click="emit('showModal:CreateKey')"
        >Создать ключ</Button>

        <Button
          type="default"
          :icon="DeleteIcon"
          @click="emit('showModal:DeleteAllKeys')"
        >Удалить все ключи</Button>

      </a-space>
    </a-col>
    <a-col :span="12">
      <a-flex justify="end">
        <Alert v-model:open="version.open" :type="version.type" :message="version.message" :closable="false" show-icon />
      </a-flex>
    </a-col>
  </a-row>

  <a-row class="filter" v-if="searchStore.data">
    <a-col :span="24" class="line">
      <a-typography-link 
        type="text" 
        @click="emit('showModal:Search')"
      >
        Изменить
      </a-typography-link>

      <a-typography-link 
        v-if="searchStore.data"
        type="text" 
        @click="emit('search:Reset')"
      >
        Сбросить
      </a-typography-link>

      <a-typography-text>[{{ searchStore.mode == SearchMode.Login ? "Пользователь" : "Ключ" }}: {{ searchStore.data }}]</a-typography-text>
    </a-col>
  </a-row>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.filter .line {
  background-color: #f4f4f4;
  padding: 2px 10px !important;
  margin-bottom: 10px;
}
.filter .line > span,
.filter .line > a {
  font-size: 12px !important;
}
.filter .line > a {
  margin-right: 8px;
}
</style>
