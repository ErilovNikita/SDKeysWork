<script setup lang="ts">
import { h, reactive, ref, watch } from "vue"
import { Button, Form, FormDate, FormInput, Modal } from '@minitwiks/nsmp-vue-components'
import { notifyError, notifySuccess } from '../../utils/notification'
import { EditIcon } from 'nsmp-icons'

import type { IKeyInfo, IEditKeyForm } from "../../utils/types"
import ConnectorService from "../../utils/connector"
import { parseDate } from '../../utils/services'
import { useSearchStore } from "../../stores/search"

const searchStore = useSearchStore()
const props = defineProps<{ accessKey: IKeyInfo }>()
const usingEnvAccessKey: string | null = import.meta.env.VITE_ACCESS_KEY

const formRef = ref<{ validate: () => Promise<unknown> }>()
const api: ConnectorService = new ConnectorService()
const open = ref(false)
const dateFormat = 'DD.MM.YYYY HH:mm'
const modalTitle = h('span', { style: 'display: block; text-align: left' }, 'Вы уверены?')

const formatDeadline = (value: string): string => {
  const date = parseDate(value) ?? new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (part: number) => String(part).padStart(2, '0')
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const model = reactive<IEditKeyForm>({
  deadline: formatDeadline(props.accessKey.deadline),
  description: props.accessKey.description,
})

const submit = async (): Promise<void> => {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  try {
    await api.editAccessKey(props.accessKey.uuid, model.description, model.deadline)
    notifySuccess('Ключ успешно изменен')
    searchStore.setSearchData(searchStore.data!)
    open.value = false
  } catch (error) {
    notifyError('При изменении произошла ошибка', error)
  }
}

watch(open, visible => {
  if (visible) Object.assign(model, {
    deadline: formatDeadline(props.accessKey.deadline),
    description: props.accessKey.description,
  })
})

</script>


<template>
  <Modal v-model:open="open" :title="modalTitle" :body-style="{ textAlign: 'left' }">
    <template #form>
      <Form ref="formRef" :model="model">
        <FormDate
          name="deadline"
          label="Дедлайн"
          type="datetime"
          :date-picker-props="{ format: dateFormat, valueFormat: dateFormat }"
          :rules="[{ required: true, message: 'Обязательно к заполнению' }]"
        />
        <FormInput
          name="description"
          label="Описание"
          description="Для чего используется ключ"
          :rules="[{ required: true, message: 'Обязательно к заполнению' }]"
        />
      </Form>
    </template>
    
    <template #footer>
      <Button type="primary" @click="submit">Сохранить</Button>
      <Button type="text" @click="open = false">Отмена</Button>
    </template>
  </Modal>

  <Button
    type="text"
    class="icon"
    shape="circle"
    @click="open = true"
    :icon="EditIcon"
    v-if="props.accessKey.uuid != usingEnvAccessKey"
  />
</template>
