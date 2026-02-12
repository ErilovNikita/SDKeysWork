<script setup lang="ts">
import { ref, watch } from "vue"

import Modal from '../../components/naumen/Modal.vue'
import AttrGroup from '../../components/naumen/AttrGroup.vue'

import { IKeyInfo, SearchMode } from "../../utils/types"
import { useSearchStore } from "../../stores/search.ts"
import ConnectorService from "../../utils/connector"
import { ModalController, AttrGroupController } from '../../utils/fileds.ts'

type LoadResult = 'success' | 'error'

let resolveResult: ((r: LoadResult) => void) | null = null
const controller = new ModalController("Информация о ключе")
const api: ConnectorService = new ConnectorService()
const searchStore = useSearchStore()
const keyInfo = ref<IKeyInfo | null>(null)
const userAttrs = new AttrGroupController("Данные пользователя", [
  ['Логин', 'username'],
  ['UUID', 'employeeUuid']
]).open()
const keyAttrs = new AttrGroupController("Данные о ключе", [
  ['Дедлайн', 'deadline'],
  ['Дата создания', 'creationDate'],
  ['Дата последнего использования', 'lastUsageDate']
]).open()

const waitForResult = (): Promise<LoadResult> => {
  if (resolveResult) console.warn('waitForResult already pending')
  return new Promise(resolve => resolveResult = resolve)
}

const notifySuccess = () => {
  resolveResult?.('success')
  resolveResult = null
}

const notifyError = () => {
  resolveResult?.('error')
  resolveResult = null
}

const updateKeyInfo = async () => {
  try {
    const data = await api.getAccessKeyInfo(searchStore.data!)
    if (data.uuid) {
      keyInfo.value = data
      notifySuccess()
      searchStore.reset()
    } else notifyError()
  } catch (e) {
    notifyError()
  }
}

watch(() => controller.visiable, () => {
  if (controller.visiable.value === false) {
    keyInfo.value = null
  }
})

watch(() => searchStore.trigger, () => {
  if (searchStore.mode === SearchMode.UUID) updateKeyInfo()
})

defineExpose({
  controller,
  waitForResult,
})

</script>

<template>
  <Modal :controller="controller">
    <template #form v-if="keyInfo">
      <AttrGroup :config="userAttrs" :values="keyInfo" style="padding-bottom: 20px;" />

      <AttrGroup :config="keyAttrs" :values="keyInfo">
        <template #start>
          <a-form-item label="Активен" style="margin-bottom: -10px;">
            <a-typography-text>{{ keyInfo.active ? "Да" : "Нет" }}</a-typography-text>
          </a-form-item>
          <a-form-item label="Тип" style="margin-bottom: -10px;">
            <a-typography-text>{{ keyInfo.type == 'REUSABLE' ? "Многоразовый" : "Одноразовый" }}</a-typography-text>
          </a-form-item>
        </template>
      </AttrGroup>
    </template>
    <template #footer>
      <a-button type="primary" @click="controller.hidden()">Закрыть</a-button>
    </template>
  </Modal>
</template>