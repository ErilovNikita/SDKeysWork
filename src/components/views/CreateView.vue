<script setup lang="ts">
import {h, reactive, ref} from 'vue'
import {connector} from "../../main.ts";
import InitialData from "../../model/InitialData.ts";
import {PlusOutlined, MinusCircleOutlined} from "@ant-design/icons-vue";
import {notification, Button} from "ant-design-vue";
import KeyInfo from "../../model/KeyInfo.ts";

interface Emits {
  (e: 'update:created', keyInfo: KeyInfo): void

  (e: 'update:cancelled'): void
}

interface Props {
  login: string | null
  initData: InitialData
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()
const formRef = ref();
const loading = ref<boolean>(false)
const dateFormat = ref<string>('DD.MM.YYYY HH:mm')

interface Model {
  login: string | null,
  deadline: string | null,
  deadlineMode: "days" | "deadline",
  keyDays: number | null,
  description: string | null,
  onetime: boolean
}

const model = reactive<Model>({
  login: props.login,
  deadline: null,
  deadlineMode: "days",
  keyDays: null,
  description: null,
  onetime: false
})

async function createNewToken(): Promise<KeyInfo> {
  if (model.deadlineMode == 'days') model.deadline = null
  if (model.deadlineMode == 'deadline') model.keyDays = null
  loading.value = true
  return await connector.addAccessKey(model.login!, model.keyDays, model.description, model.onetime, model.deadline).then((data) => {
    notification.success({
      message: "Ключ успешно создан",
      btn: () => h(
          Button,
          {
            type: 'primary',
            size: 'small',
            onClick: () => navigator.clipboard.writeText(data.uuid),
          },
          {default: () => 'Скопировать ключ'},
      ),
      placement: 'top',
      duration: 5
    })
    return data as KeyInfo
  }).catch((e: Error) => {
    notification.error({
      message: "Ошибочка вышла",
      description: e.message,
      placement: 'top',
      duration: 5
    })
    throw e
  }).finally(() => {
    loading.value = false
  })
}

async function ok() {
  const ok = await formRef.value.validate().then(() => {
    return true
  }).catch(() => {
    return false
  })
  if (ok) {
    const token = await createNewToken()
    emits("update:created", token)
  }
}

function cancel() {
  emits("update:cancelled")
}

</script>

<template>
  <a-form ref="formRef"
          :model="model"
          class="main-container">
    <div class="line" v-if="initData.superUser">
      <a-typography-text class="title" content="Логин пользователя:"/>
      <a-form-item name="login" :rules="[{ required: true, message: 'Надо' }]">
        <a-input class="field" v-model:value="model.login"/>
      </a-form-item>
    </div>
    <div class="line">
      <a-typography-text class="title" content="Время жизни:"/>
      <a-form-item name="deadlineMode">
        <a-radio-group class="field" v-model:value="model.deadlineMode">
          <a-radio-button class="r-btn" value="days">В днях</a-radio-button>
          <a-radio-button class="r-btn" value="deadline">Дедлайн</a-radio-button>
        </a-radio-group>
      </a-form-item>
    </div>
    <div v-if="model.deadlineMode == 'deadline'" class="line">
      <a-typography-text class="title" content="Дедлайн:"/>
      <a-form-item name="deadline">
        <a-date-picker class="field"
                       v-model:value="model.deadline"
                       :format="dateFormat"
                       :value-format="dateFormat"
                       placeholder=" "/>
      </a-form-item>
    </div>
    <div v-if="model.deadlineMode == 'days'" class="line">
      <a-typography-text class="title" content="Срок жизни в днях:"/>
      <a-form-item name="keyDays">
        <a-input-number class="field" v-model:value="model.keyDays"/>
      </a-form-item>
    </div>
    <div class="line">
      <a-typography-text class="title" content="Описание:"/>
      <a-form-item name="description" :rules="[{ required: true, message: 'Надо' }]">
        <a-input placeholder="Для чего используется ключ" class="field" v-model:value="model.description"/>
      </a-form-item>

    </div>
    <div class="line">
      <a-typography-text class="title" content="Тип:"/>
      <a-form-item name="onetime">
        <a-radio-group v-model:value="model.onetime" class="field">
          <a-radio-button class="r-btn" :value="false">Многоразовый</a-radio-button>
          <a-radio-button class="r-btn" :value="true">Одноразовый</a-radio-button>
        </a-radio-group>
      </a-form-item>
    </div>
    <div class="line btn-container">
      <a-button class="final-btn" type="primary" @click="ok" :loading="loading">
        <template #icon>
          <PlusOutlined/>
        </template>
        Создать
      </a-button>
      <a-button class="final-btn" @click="cancel">
        <template #icon>
          <MinusCircleOutlined/>
        </template>
        Отмена
      </a-button>
    </div>
  </a-form>
</template>

<style scoped>
.main-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 10px;
  margin-top: 5px;
}

.line {
  margin: 5px;
  width: 300px;
}

.field {
  width: 300px;
}

.title {
  font-size: 16px;
}

.r-btn {
  width: 150px !important;
  text-align: center;
}

.final-btn {
  width: 110px;
}

.btn-container {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
</style>
