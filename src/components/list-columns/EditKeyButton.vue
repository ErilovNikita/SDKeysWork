<script setup lang="ts">
import { notification } from "ant-design-vue"
import { h, reactive, ref, watch } from "vue"

import Modal from "../naumen/Modal.vue"
import EditIcon from '../../assets/icons/edit.svg'

import { IKeyInfo, IEditKeyForm } from "../../utils/types"
import ConnectorService from "../../utils/connector"
import { AlertFiledObject, ModalController } from "../../utils/fileds"
import { useSearchStore } from "../../stores/search"

const searchStore = useSearchStore()
const props = defineProps<{ accessKey: IKeyInfo }>()
const usingEnvAccessKey:string | null = import.meta.env.VITE_ACCESS_KEY

const model = reactive<IEditKeyForm>({
  deadline: props.accessKey.deadline,
  description: props.accessKey.description,
})

const formRef = ref()
const controller = new ModalController("Вы уверены?")
const descriptionAlertController = new AlertFiledObject(false, 'info', true, "Для чего используется ключ").show()
const api: ConnectorService = new ConnectorService()
const dateFormat = ref<string>('DD.MM.YYYY HH:mm')

const yes = async () => {
  try {
    await formRef.value.validate()
    api.editAccessKey(props.accessKey.uuid, model.description, model.deadline)
      .then(() => {
        notification.success({
          message: "Ключ успешно изменен",
          placement: 'bottomRight',
          duration: 5
        })
        searchStore.setSearchData(searchStore.data!)
      })
      .catch((e:any) => {
        notification.error({
          message: "При изменении произошла ошибка",
          description: JSON.parse(e).cause.message,
          placement: 'bottomRight',
          duration: 5
        })
      })
      .finally(() => {
        controller.hidden()
      })
  } catch { }
}

watch(
  () => controller.visiable.value,
  (visible) => {
    if (visible) {
      model.deadline = props.accessKey.deadline
      model.description = props.accessKey.description
    }
  }
)

</script>


<template>
  <Modal :controller="controller">
    <template #form>
      <a-form ref="formRef" :model="model" class="main-container" layout="vertical">
        <a-form-item name="deadline" :rules="[{ required: true, message: 'Обязатетельно к заполнению' }]" label="Дедлайн">
          <a-date-picker class="field" v-model:value="model.deadline" :format="dateFormat" :value-format="dateFormat"
            placeholder=" " />
        </a-form-item>
        <a-form-item name="description" :rules="[{ required: true, message: 'Обязатетельно к заполнению' }]" label="Описание">
          <a-alert v-if="descriptionAlertController.visiable.value" :type="descriptionAlertController.type.value"
            :closable="descriptionAlertController.closable.value"
            :show-icon="descriptionAlertController.showIcon.value">
            <template #message>
              {{ descriptionAlertController.message.value }}
            </template>
          </a-alert>
          <a-input placeholder="" class="field" v-model:value="model.description" />
        </a-form-item>
      </a-form>
    </template>
    <template #footer>
      <a-button type="primary" @click="yes">Сохранить</a-button>
      <a-button type="text" @click="controller.hidden()">Отмена</a-button>
    </template>
  </Modal>

  <a-button 
    type="text" 
    class="icon" 
    shape="circle" 
    @click="controller.show()" 
    :icon="h(EditIcon)"
    v-if="props.accessKey.uuid != usingEnvAccessKey"
  />
</template>

<style scoped>
.text {
  margin-bottom: 20px;
}
.field {
  margin-bottom: 10px;
}
</style>
