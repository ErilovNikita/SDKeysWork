<script setup lang="ts">
import { Button, Modal } from '@minitwiks/nsmp-vue-components'
import { notifyError, notifySuccess } from '../../utils/notification'
import { h, ref } from 'vue'
import { DeleteIcon } from 'nsmp-icons'

import type { IKeyInfo } from "../../utils/types"
import ConnectorService from "../../utils/connector"
import { useSearchStore } from "../../stores/search"

const props = defineProps<{ accessKey: IKeyInfo }>()
const usingEnvAccessKey: string | null = import.meta.env.VITE_ACCESS_KEY
const searchStore = useSearchStore()
const api: ConnectorService = new ConnectorService()
const open = ref(false)
const modalTitle = h('span', { style: 'display: block; text-align: left' }, 'Вы уверены?')

const remove = async (): Promise<void> => {
  try {
    await api.deleteKey(props.accessKey.uuid)
    notifySuccess('Ключ успешно удален')
    searchStore.setSearchData(searchStore.data!)
    open.value = false
  } catch (error) {
    notifyError('При удалении произошла ошибка', error)
  }
}
</script>


<template>
  <Modal v-model:open="open" :title="modalTitle" :body-style="{ textAlign: 'left' }">
    <template #form>
      <p>Вы действительно хотите удалить ключ "<code>{{ props.accessKey.uuid }}</code>"?</p>
      <p>Данные будут потеряны навсегда.</p>
    </template>
    
    <template #footer>
      <Button type="primary" @click="remove">Удалить ключ</Button>
      <Button type="text" @click="open = false">Отмена</Button>
    </template>
  </Modal>

  <Button
    type="text"
    class="icon"
    shape="circle"
    @click="open = true"
    :icon="DeleteIcon"
    v-if="props.accessKey.uuid != usingEnvAccessKey"
  />
</template>
