<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue'
import { Button, Form, FormDate, FormInput, FormNumber, FormSelect, Modal } from '@minitwiks/nsmp-vue-components'
import { notifyError, notifySuccess } from '../../utils/notification'

import type { ICreateKeyForm } from "../../utils/types.ts"
import ConnectorService from '../../utils/connector.ts'
import { useUserStore } from '../../stores/user.ts'
import { useSearchStore } from '../../stores/search'

const userStore = useUserStore()
const searchStore = useSearchStore()

const api: ConnectorService = new ConnectorService()
const formRef = ref<{ validate: () => Promise<unknown> }>()
const loading = ref(false)
const open = defineModel<boolean>('open', { default: false })
const dateFormat = 'DD.MM.YYYY HH:mm'

const lifetimeOptions = [
  { label: 'В днях', value: 'days' },
  { label: 'Дедлайн', value: 'deadline' },
]

const model = reactive<ICreateKeyForm>({
  login: userStore.login,
  deadline: null,
  deadlineMode: "days",
  keyDays: null,
  description: null,
  onetime: false
})

const keyType = computed<number>({
  get: () => Number(model.onetime),
  set: value => model.onetime = Boolean(value),
})

const createNewToken = async (): Promise<void> => {
  if (model.deadlineMode === 'days') model.deadline = null
  if (model.deadlineMode === 'deadline') model.keyDays = null
  loading.value = true

  try {
    const data = await api.addAccessKey(model.login!, model.keyDays, model.description, model.onetime, model.deadline)
    notifySuccess('Ключ успешно создан', {
      action: h(
        Button,
        {
          type: 'primary',
          size: 'small',
          onClick: () => navigator.clipboard.writeText(data.uuid),
        },
        { default: () => 'Скопировать ключ' },
      ),
    })
    searchStore.setSearchData(searchStore.data!)
  } catch (error) {
    notifyError('Произошла ошибка', error)
    throw error
  } finally {
    loading.value = false
  }
}

const submit = async (): Promise<void> => {
  try {
    await formRef.value?.validate()
    await createNewToken()
    open.value = false
  } catch {
    // Ошибки валидации и создания уже показаны пользователю.
  }
}

</script>

<template>
  <Modal v-model:open="open" title="Создать ключ">
    <template #form>
      <Form ref="formRef" :model="model">
        <FormInput
          v-if="userStore.superUser"
          name="login"
          label="Логин пользователя"
          :rules="[{ required: true, message: 'Надо' }]"
        />

        <FormSelect
          name="deadlineMode"
          label="Время жизни"
          radioButtonStyle="solid"
          :options="lifetimeOptions"
          view="radio-button"
        />

        <FormDate
          v-if="model.deadlineMode === 'deadline'"
          name="deadline"
          label="Дедлайн"
          type="datetime"
          :date-picker-props="{ format: dateFormat, valueFormat: dateFormat }"
        />

        <FormNumber
          v-if="model.deadlineMode === 'days'"
          name="keyDays"
          label="Срок жизни в днях"
        />

        <FormInput
          name="description"
          label="Описание"
          description="Для чего используется ключ"
          :rules="[{ required: true, message: 'Надо' }]"
        />

        <FormSelect
          v-model:value="keyType"
          name="onetime"
          radioButtonStyle="solid"
          label="Тип"
          :options="[{ label: 'Многоразовый', value: 0 }, { label: 'Одноразовый', value: 1 }]"
          view="radio-button"
        />
      </Form>
    </template>
    <template #footer>
      <Button type="primary" :loading="loading" @click="submit">Создать</Button>
      <Button type="text" @click="open = false">Отмена</Button>
    </template>
  </Modal>
</template>
