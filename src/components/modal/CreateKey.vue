<script setup lang="ts">
import { h, reactive, ref } from 'vue'
import { notification, Button } from "ant-design-vue"

import Modal from '../../components/naumen/Modal.vue'

import type { ICreateKeyForm } from "../../utils/types.ts"
import ConnectorService from '../../utils/connector.ts'
import { useUserStore } from '../../stores/user.ts'
import { AlertFiledObject, ModalController } from '../../utils/fileds.ts'

const controller = new ModalController("Создать ключ")
const descriptionAlertController = new AlertFiledObject(false, 'info', true, "Для чего используется ключ").show()
const user = useUserStore()
const api: ConnectorService = new ConnectorService()
const formRef = ref()
const loading = ref<boolean>(false)
const dateFormat = ref<string>('DD.MM.YYYY HH:mm')

defineExpose({controller})

const model = reactive<ICreateKeyForm>({
  login: user.login,
  deadline: null,
  deadlineMode: "days",
  keyDays: null,
  description: null,
  onetime: false
})

const createNewToken = async (): Promise<void> => {
  if (model.deadlineMode == 'days') model.deadline = null
  if (model.deadlineMode == 'deadline') model.keyDays = null
  loading.value = true

  await api.addAccessKey(model.login!, model.keyDays, model.description, model.onetime, model.deadline).then((data: any) => {
    notification.success({
      message: "Ключ успешно создан",
      btn: () => h(
        Button,
        {
          type: 'primary',
          size: 'small',
          onClick: () => navigator.clipboard.writeText(data.uuid),
        },
        { default: () => 'Скопировать ключ' },
      ),
      placement: 'bottomRight',
      duration: 5
    })
  }).catch((e: any) => {
    notification.error({
      message: "Произошла ошибка",
      description: JSON.parse(e).cause.message,
      placement: 'bottomRight',
      duration: 5
    })
    throw e
  }).finally(() => {
    loading.value = false
  })
}

const ok = async ():Promise<void> => {
  const ok = await formRef.value.validate().then(() => {return true}).catch(() => {return false})
  if (ok) {
    createNewToken()
    controller.hidden()
  }
}

</script>

<template>
  <Modal :controller="controller">
    <template #form>
      <a-form ref="formRef" :model="model" class="main-container" layout="vertical">
        <a-form-item name="login" :rules="[{ required: true, message: 'Надо' }]" v-if="user.superUser" label="Логин пользователя">
          <a-input class="field" v-model:value="model.login" />
        </a-form-item>

        <a-form-item name="deadlineMode" label="Время жизни">
          <a-radio-group class="field" v-model:value="model.deadlineMode">
            <a-radio-button class="r-btn" value="days">В днях</a-radio-button>
            <a-radio-button class="r-btn" value="deadline">Дедлайн</a-radio-button>
          </a-radio-group>
        </a-form-item>

        <a-form-item name="deadline" v-if="model.deadlineMode == 'deadline'" label="Дедлайн">
          <a-date-picker class="field" v-model:value="model.deadline" :format="dateFormat" :value-format="dateFormat"
            placeholder=" " />
        </a-form-item>

        <a-form-item name="keyDays" v-if="model.deadlineMode == 'days'" label="Срок жизни в днях">
          <a-input-number class="field" v-model:value="model.keyDays" />
        </a-form-item>

        <a-form-item name="description" :rules="[{ required: true, message: 'Надо' }]" label="Описание">
          <a-alert 
            v-if="descriptionAlertController.visiable.value" 
            :type="descriptionAlertController.type.value" 
            :closable="descriptionAlertController.closable.value"
            :show-icon="descriptionAlertController.showIcon.value" 
        >
            <template #message>
                {{ descriptionAlertController.message.value }}
            </template>
        </a-alert>
          <a-input placeholder="" class="field" v-model:value="model.description" />
        </a-form-item>

        <a-form-item name="onetime" label="Тип">
          <a-radio-group v-model:value="model.onetime" class="field">
            <a-radio-button class="r-btn" :value="false">Многоразовый</a-radio-button>
            <a-radio-button class="r-btn" :value="true">Одноразовый</a-radio-button>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </template>
    <template #footer>
      <a-button type="primary" @click="ok" :loading="loading">Создать</a-button>
      <a-button type="text" @click="controller.hidden()">Отмена</a-button>
    </template>
  </Modal>
</template>

<style scoped>
.field {
  margin-bottom: 10px;
}
</style>
