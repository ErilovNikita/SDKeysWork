<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

import { Button, Form, FormInput, FormSelect, Modal } from '@minitwiks/nsmp-vue-components'
import { useSearchStore } from '../../stores/search'
import { useUserStore } from '../../stores/user.ts'
import { SearchMode } from '../../utils/types'

const searchStore = useSearchStore()
const userStore = useUserStore()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ (e: 'search', value: string): void }>()
const formRef = ref<{ validate: () => Promise<unknown> }>()
const model = reactive({ 
  searchData: userStore.login,
  mode: SearchMode.Login
})

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

watch(() => searchStore.mode, () => model.searchData = '')
watch(() => model.mode, () => {
  model.searchData = ''
  searchStore.mode = model.mode
})

</script>

<template>
  <Modal title="Фильтрация" v-model:open="open">
    <template #form>
      <Form ref="formRef" :model="model">
        <FormSelect
          name="mode"
          label="Тип"
          :options="[
            { label: 'Логин', value: SearchMode.Login },
            { label: 'Ключ', value: SearchMode.UUID },
          ]"
          view="radio-button"
          radio-button-style="solid"
        />

        <FormInput
          name="searchData"
          :label="model.mode === SearchMode.Login ? 'Логин' : 'Значение ключа'"
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
