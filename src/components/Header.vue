<script setup lang="ts">
import PlusIcon from '../assets/icons/plus.svg'
import DeleteIcon from '../assets/icons/delete.svg'
import SearchIcon from '../assets/icons/zoomIn.svg'
import CloseIcon from '../assets/icons/exitOfState.svg'

import { useUserStore } from '../stores/user'
import { useSearchStore } from '../stores/search'
import { AlertFiledObject } from '../utils/fileds'
import { compareVersions, getLastVersion } from '../utils/services'
import { SearchMode } from '../utils/types'

const emit = defineEmits<{
  (e: 'showModal:CreateKey'): void
  (e: 'showModal:DeleteAllKeys'): void
  (e: 'showModal:Search'): void
  (e: 'search:Reset'): void
}>()

const searchStore = useSearchStore()
const user = useUserStore()
const versionController = new AlertFiledObject(false, 'info', true)

getLastVersion('ErilovNikita', 'SDKeysWork').then(remoteVersion => {
    switch(compareVersions(__APP_VERSION__, remoteVersion)) {
        case 1:
            versionController.setType('warning')
            versionController.setMessage(`Вы используете тестовую версию ${__APP_VERSION__}! Свяжитесь с поддержкой для исправления.`)
            console.warn(`Последний релиз в репозитории: ${remoteVersion} < ${__APP_VERSION__}`)
            break
        case -1:
            versionController.setType('error')
            versionController.setMessage(`Ваша версия ${__APP_VERSION__} устарела! Сбросьте кеш браузера, чтобы получить новую версию.`)
            console.warn(`Последний релиз в репозитории: ${remoteVersion} > ${__APP_VERSION__}`)
            break
        case 0:
            versionController.setType('success')
            versionController.setMessage(`Используется актуальная версия ${__APP_VERSION__}`)
            break
    }
}) .catch(e => {
    versionController.setType('error')
    versionController.setMessage((e as Error).message + ". Свяжитесь с поддержкой для исправления.") 
})
</script>

<template>
  <a-row class="header">
    <a-col :span="16">
      <a-space v-if="user?.canUse">
        <a-space :size="1">
          <a-button 
            type="primary" 
            class="cardButton" 
            @click="emit('showModal:Search')"
          >
            <SearchIcon />Поиск
          </a-button>

        </a-space>

        <a-button 
          type="primary" 
          class="cardButton" 
          @click="emit('showModal:CreateKey')"
        >
          <PlusIcon />Создать ключ
        </a-button>

        <a-button 
          type="primary" 
          class="cardButton" 
          @click="emit('showModal:DeleteAllKeys')"
        >
          <DeleteIcon />Удалить все ключи
        </a-button>

      </a-space>
    </a-col>
    <a-col :span="8">
      <a-flex justify="end">
        <a-alert 
            v-if="versionController.visiable.value" 
            :type="versionController.type.value" 
            :closable="versionController.closable.value"
            :show-icon="versionController.showIcon.value" 
            @close="versionController.hidden()"
        >
            <template #message>
                {{ versionController.message.value }}
            </template>
        </a-alert>
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
  padding: 10px 0 0 0;
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
