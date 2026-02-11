<script setup lang="ts">
import { reactive, ref } from 'vue'

import Modal from '../../components/naumen/Modal.vue'
import { useSearchStore } from '../../stores/search'

import { ModalController } from '../../utils/fileds'
import { SearchMode } from '../../utils/types'

const emit = defineEmits<{(e: 'search', value: string): void}>()
const controller = new ModalController("Поиск")
const loading = ref<boolean>(false)
const formRef = ref()
const searchStore = useSearchStore()
const model = reactive<any>({ searchData: "" })

const ok = async ():Promise<void> => {
  const ok = await formRef.value.validate().then(() => {return true}).catch(() => {return false})
  if (ok) {
    controller.hidden()
    emit('search', model.searchData)
  }
}

defineExpose({ controller })
</script>

<template>
    <Modal :controller="controller">
        <template #form>
            <a-form ref="formRef" :model="model" layout="vertical">
                <a-form-item :rules="[{ required: true, message: 'Обязательно к заполнению' }]" label="Тип поиска" style="margin-bottom: 10px;">
                    <a-radio-group v-model:value="searchStore.mode" button-style="solid">
                        <a-radio-button :value="SearchMode.Login"
                            @click="searchStore.setSearchMode(SearchMode.Login)">Логину</a-radio-button>
                        <a-radio-button :value="SearchMode.UUID"
                            @click="searchStore.setSearchMode(SearchMode.UUID)">Ключу</a-radio-button>
                    </a-radio-group>
                </a-form-item>

                <a-form-item name="searchData" :rules="[{ required: true, message: 'Обязательно к заполнению' }]" label="Данные для поиска">
                    <a-input v-model:value="model.searchData" placeholder="" />
                </a-form-item>
            </a-form>
        </template>

        <template #footer>
            <a-button type="primary" @click="ok" :loading="loading">Искать</a-button>
            <a-button type="text" @click="controller.hidden()">Отмена</a-button>
        </template>
    </Modal>
</template>