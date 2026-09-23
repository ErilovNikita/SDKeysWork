<script setup lang="ts">
import { ref, watch } from "vue"
import { AttrGroup, Modal } from '@minitwiks/nsmp-vue-components'
import { IKeyInfo, SearchMode } from "../../utils/types"
import { useSearchStore } from "../../stores/search.ts"
import ConnectorService from "../../utils/connector"
import { formatSmartDate } from "../../utils/services"

const open = defineModel<boolean>('open', { default: false })
const api: ConnectorService = new ConnectorService()
const searchStore = useSearchStore()
const keyInfo = ref<IKeyInfo | null>(null)

const updateKeyInfo = async () => {
  try {
    const data = await api.getAccessKeyInfo(searchStore.data!)
    if (data.uuid) {
      keyInfo.value = data
      open.value = true
      searchStore.reset()
    }
  } catch {
    // При неверном ключе окно не открывается.
  }
}

watch(() => searchStore.trigger, () => {
  if (searchStore.mode === SearchMode.UUID) updateKeyInfo()
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
