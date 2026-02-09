<script setup lang="ts">

import {ref} from "vue";
import InitialData from "../model/InitialData.ts";
import {PlusOutlined, DeleteOutlined, UnorderedListOutlined} from '@ant-design/icons-vue';

interface Props {
  initData: InitialData
  initLogin: string | null
  state : "create" | "list" | "empty" | "permissionError" | 'delete' | 'key'
}

interface Emits {
  (e: 'update:mode', mode: string): void

  (e: 'update:uuid', key: string | null): void

  (e: 'update:login', login: string | null): void

  (e: 'search:uuid', uuid: string | null): void

  (e: 'search:login', login: string | null): void

  (e: 'add:accessKey', login: string | null): void

  (e: 'delete:accessKeys', login: string | null): void

}

const emit = defineEmits<Emits>()
const props = defineProps<Props>()

const login = ref<string | null>(props.initLogin)
const uuid = ref<string | null>(null)
const mode = ref<string>(props.initData.superUser ? "login" : "uuid")


</script>

<template>
  <a-page-header style="border: 1px solid rgb(235, 237, 240)"
      title="🔑 KeysWork">
    <template #extra>
      <a-space v-if="initData.canUse">
        <a-space direction="horizontal" v-if="initData.superUser">
          <a-typography style="font-size: 16px">Искать по:</a-typography>
          <a-radio-group v-model:value="mode" button-style="solid" @change="emit('update:mode', mode)">
            <a-radio-button value="login">Логину</a-radio-button>
            <a-radio-button value="uuid">Ключу</a-radio-button>
          </a-radio-group>
        </a-space>
        <a-space v-if="mode == 'login' && initData.superUser" direction="horizontal">
          <a-input v-model:value="login" placeholder="🔍 Поиск по логину" @change="emit('update:login', login)"/>
          <a-button type="primary" @click="emit('search:login', login)">Найти</a-button>
        </a-space>
        <a-space v-if="mode == 'uuid'" direction="horizontal">
          <a-input-password v-model:value="uuid" placeholder="🔍 Поиск по ключу" @change="emit('update:uuid', uuid)"/>
          <a-button type="primary" @click="emit('search:uuid', uuid)">Найти</a-button>
        </a-space>
        <a-button type="primary" @click="emit('search:login', login)" :ghost="state == 'list'">
          Список
          <template #icon>
            <UnorderedListOutlined />
          </template>
        </a-button>
        <a-button type="primary" @click="emit('add:accessKey', login)" :ghost="state == 'create'">
          Создать ключ
          <template #icon>
            <PlusOutlined/>
          </template>
        </a-button>
        <a-button type="primary" @click="emit('delete:accessKeys', login)" :ghost="state == 'delete'">
          Удалить все ключи
          <template #icon>
            <DeleteOutlined/>
          </template>
        </a-button>
      </a-space>
    </template>
  </a-page-header>
</template>

<style scoped>

</style>
