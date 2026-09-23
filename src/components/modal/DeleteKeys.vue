<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { Button, Form, FormInput, FormSelect, Modal } from '@minitwiks/nsmp-vue-components'
import { notifyError, notifySuccess } from '../../utils/notification'

import ConnectorService from '../../utils/connector'
import { useUserStore } from '../../stores/user'
import { useSearchStore } from "../../stores/search"

type Confirmation = number | null
type ConfirmItem = { options: { label: string; value: number }[] }
type DeleteKeysForm = { localLogin: string | null; confirmations: Confirmation[] }

const userStore = useUserStore()
const searchStore = useSearchStore()
const api: ConnectorService = new ConnectorService()
const formRef = ref<{ validate: () => Promise<unknown> }>()
const confirmationsMeta = ref<ConfirmItem[]>([])
const open = defineModel<boolean>('open', { default: false })

const model = reactive<DeleteKeysForm>({
  localLogin: userStore.login,
  confirmations: []
})

const confirmationRules = [{
  validator: async (_: unknown, value: Confirmation) => {
    if (value !== 1) throw new Error('Необходимо выбрать «Да»')
  }
}]

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
    { label: 'Да', value: 1 },
    { label: 'Нет', value: 0 }
  ]

  const meta: ConfirmItem[] = []
  const values: Confirmation[] = []

  for (let i = 0; i < count; i++) {
    const options = shuffle(baseOptions)
    meta.push({ options })
    values.push(null)
  }

  confirmationsMeta.value = meta
  model.confirmations = values
}

watch(open, visible => { if (visible) generateConfirmations() })

const deleteAllKeys = async (): Promise<void> => {
  try {
    await api.deleteUserAccessKeys(model.localLogin!)
    notifySuccess('Успешно удалено', {description: `Все ключи пользователя "${model.localLogin}" успешно удалены.`})
    searchStore.trigger++
  } catch (error) {
    notifyError('Произошла ошибка', error)
    throw error
  }
}

const submit = async (): Promise<void> => {
  try {
    await formRef.value?.validate()
    await deleteAllKeys()
    open.value = false
  } catch {
    // Ошибки валидации и удаления уже показаны пользователю.
  }
}
</script>

<template>
  <Modal v-model:open="open" title="Удалить все ключи">
    <template #form>
      <Form ref="formRef" :model="model">
        <FormInput
          v-if="userStore.superUser"
          name="localLogin"
          label="Логин пользователя"
          :rules="[{ required: true, message: 'Обязательное поле' }]"
        />

        <FormSelect
          v-for="(item, index) in confirmationsMeta"
          :key="index"
          :name="['confirmations', index]"
          :label="index === 0 ? 'Вы точно уверены?' : undefined"
          :options="item.options"
          :rules="confirmationRules"
          radioButtonStyle="solid"
          view="radio-button"
          class="confirmation"
        />
      </Form>
    </template>

    <template #footer>
      <Button type="primary" @click="submit">Удалить</Button>
      <Button type="text" @click="open = false">Отмена</Button>
    </template>
  </Modal>
</template>
