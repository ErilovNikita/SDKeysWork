<script setup lang="ts">
import { notification } from "ant-design-vue"
import { h } from "vue"

import Modal from "../naumen/Modal.vue"
import DeleteIcon from '../../assets/icons/delete.svg'

import { IKeyInfo } from "../../utils/types"
import ConnectorService from "../../utils/connector"
import { ModalController } from "../../utils/fileds"
import { useSearchStore } from "../../stores/search"

const props = defineProps<{ accessKey: IKeyInfo }>()
const searchStore = useSearchStore()
const controller = new ModalController("Вы уверены?")
const api: ConnectorService = new ConnectorService()

const yes = () => {
  api.deleteKey(props.accessKey.uuid)
    .then(() => {
      notification.success({
        message: "Ключ успешно удален",
        placement: 'bottomRight',
        duration: 5
      })
      searchStore.setSearchData(searchStore.data!)
    })
    .catch((e:any) => {
      notification.error({
        message: "При удалении произошла ошибка",
        description: JSON.parse(e).cause.message,
        placement: 'bottomRight',
        duration: 5
      })
    })
    .finally(() => {
      controller.hidden()
    })
}

</script>


<template>
  <Modal :controller="controller">
    <template #form>
      <p>Восстановить не получится.</p>
    </template>
    <template #footer>
      <a-button type="primary" @click="yes">Да</a-button>
      <a-button type="text" @click="controller.hidden()">Отмена</a-button>
    </template>
  </Modal>

  <a-button 
    type="text"
    class="icon"
    shape="circle"
    @click="controller.show()"
    :icon="h(DeleteIcon)"
  />
</template>

<style scoped>
.text {
  margin-bottom: 20px;
}
</style>
