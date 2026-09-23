<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

import { Button, Form, FormInput, FormSelect, Modal } from '@minitwiks/nsmp-vue-components'
import {useSearchStore} from '../../stores/search'

import {SearchMode} from '../../utils/types'

const open = ref(false)
const emit = defineEmits<{ (e: 'search', value: string): void }>()
const formRef = ref<{ validate: () => Promise<unknown> }>()
const searchStore = useSearchStore()
const model = reactive({ searchData: '' })

const submit = async (): Promise<void> => {
  try {
    await formRef.value?.validate()
    open.value = false
    emit('search', model.searchData)
    model.searchData = ''
  } catch {
    // Ошибка валидации отображается компонентом формы.
  }
}

watch(() => searchStore.mode, () => {
  model.searchData = ''
})

defineExpose({open})
</script>

<template>
  <Modal title="Поиск" v-model:open="open">
    <template #form>
      <Form ref="formRef" :model="model">
        <FormSelect
          v-model:value="searchStore.mode"
          label="Тип поиска"
          :options="[
            { label: 'Логину', value: SearchMode.Login },
            { label: 'Ключу', value: SearchMode.UUID },
          ]"
          view="radio-button"
          radio-button-style="solid"
        />

        <FormInput
          v-model:value="model.searchData"
          name="searchData"
          :label="searchStore.mode === SearchMode.Login ? 'Логин' : 'Значение ключа'"
          :rules="[{ required: true, message: 'Обязательно к заполнению' }]"
        />
      </Form>
    </template>

    <template #footer>
      <Button type="primary" @click="submit">Искать</Button>
      <Button type="text" @click="open = false">Отмена</Button>
    </template>
  </Modal>
</template>
