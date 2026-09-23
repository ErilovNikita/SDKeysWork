<script setup lang="ts">
import { ref, watch } from "vue"
import { AttrGroup, Modal } from '@minitwiks/nsmp-vue-components'
import { IKeyInfo, SearchMode } from "../../utils/types"
import { useSearchStore } from "../../stores/search.ts"
import ConnectorService from "../../utils/connector"
import { formatSmartDate } from "../../utils/services"

type LoadResult = 'success' | 'error'
const open = ref(false)

let resolveResult: ((r: LoadResult) => void) | null = null
const api: ConnectorService = new ConnectorService()
const searchStore = useSearchStore()
const keyInfo = ref<IKeyInfo | null>(null)

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

watch(() => searchStore.trigger, () => {
  if (searchStore.mode === SearchMode.UUID) updateKeyInfo()
})

defineExpose({
  open,
  waitForResult,
})

</script>

<template>
  <Modal v-model:open="open" title="Информация о ключе">
    <template #form v-if="keyInfo">
      <AttrGroup
        title="Данные пользователя"
        :items="[
          ['Логин', 'username'],
          ['UUID', 'employeeUuid']
        ]"
        :values="keyInfo"
        open
      />

      <AttrGroup title="Данные о ключе" :items="[]" :values="{}" open>
        <template #start>
          <a-form-item label="Активен" class="item">{{ keyInfo.active ? "Да" : "Нет" }}</a-form-item>
          <a-form-item label="Тип" class="item">{{ keyInfo.type == 'REUSABLE' ? "Многоразовый" : "Одноразовый" }}</a-form-item>
          <a-form-item label="Дедлайн" class="item">{{ formatSmartDate(keyInfo.deadline) }}</a-form-item>
          <a-form-item label="Дата создания" class="item">{{ formatSmartDate(keyInfo.creationDate) }}</a-form-item>
          <a-form-item label="Дата последнего использования" class="item">{{ formatSmartDate(keyInfo.lastUsageDate) }}</a-form-item>
        </template>
      </AttrGroup>
    </template>

    <template #footer>
      <Button type="primary" @click="open = false">Закрыть</Button>
    </template>
  </Modal>
</template>

<style scoped>
.item {
  margin-bottom: -10px !important;
}
</style>
