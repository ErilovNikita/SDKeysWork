<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { notification } from "ant-design-vue"

import Modal from '../../components/naumen/Modal.vue'

import ConnectorService from '../../utils/connector'
import { useUserStore } from '../../stores/user'
import { ModalController } from '../../utils/fileds.ts'

type ConfirmItem = { options: { label: string; value: boolean }[] }
const controller = new ModalController("Создать ключ")
const user = useUserStore()
const api: ConnectorService = new ConnectorService()
const formRef = ref()
const confirmationsMeta = ref<ConfirmItem[]>([])

const model = reactive<any>({
  localLogin: user.login,
  confirmations: []
})

const shuffle = <T>(array: T[]): T[] =>  {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const generateConfirmations = (count = 5) => {
  const baseOptions = [
    { label: 'Да', value: true },
    { label: 'Нет', value: false }
  ]

  const meta: ConfirmItem[] = []
  const values: (boolean | null)[] = []

  for (let i = 0; i < count; i++) {
    const options = shuffle(baseOptions)
    meta.push({ options })
    values.push(null)
  }

  confirmationsMeta.value = meta
  model.confirmations = values
}

defineExpose({ controller })

watch(
  () => controller.visiable.value,
  (visible) => { if (visible) generateConfirmations() }
)

const deleteAllKeys = async (): Promise<void> => {
  await api.deleteUserAccessKeys(model.localLogin.value!).then(() => {
    notification.success({
      message: "Все удалено",
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
  })
}


const ok = async () =>  {
  try {
    await formRef.value.validate()
    await deleteAllKeys()
    controller.hidden()
  } catch { }
}
</script>

<template>
  <Modal :controller="controller">
    <template #form>
      <a-form class="main-container" layout="vertical" ref="formRef" :model="model">
        <a-form-item label="Логин пользователя" v-if="user.superUser" name="localLogin" class="field"
          :rules="[{ required: true, message: 'Обязательное поле' }]">
          <a-input v-model:value="model.localLogin" />
        </a-form-item>

        <a-form-item label="Вы точно уверены?" name="confirmations" :rules="[
          {
            validator: async (_: any, value: (boolean | null)[]) => {
              if (!value || value.some((v: boolean | null) => v !== true)) {
                throw new Error('Необходимо везде выбрать «Да»')
              }
            }
          }
        ]">
          <div v-for="(item, index) in confirmationsMeta" :key="index">
            <a-radio-group class="field" v-model:value="model.confirmations[index]" button-style="solid">
              <a-radio-button v-for="option in item.options" :key="option.label" class="button" :value="option.value">
                {{ option.label }}
              </a-radio-button>
            </a-radio-group>
          </div>
        </a-form-item>
      </a-form>
    </template>

    <template #footer>
      <a-button type="primary" @click="ok">Удалить</a-button>
      <a-button type="text" @click="controller.hidden()">Отмена</a-button>
    </template>
  </Modal>
</template>

<style scoped>
.field {
  width: 100%;
  margin-bottom: 10px !important;
}

.field .button {
  width: 50%;
}
</style>