<script setup lang="ts">
import {h, ref} from 'vue'
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

const loading = ref<boolean>(false)
const dateFormat = ref<string>('DD.MM.YYYY HH:mm')

const localLogin = ref<string | null>(props.login)
const deadline = ref<string | null>(null)
const deadlineMode = ref<"days" | "deadline">("days")
const keyDays = ref<number | null>(null)
const description = ref<string | null>(null)
const onetime = ref<boolean>(false)

async function createNewToken(): Promise<KeyInfo> {
  if (deadlineMode.value == 'days') deadline.value = null
  if (deadlineMode.value == 'deadline') keyDays.value = null
  loading.value = true
  return await connector.addAccessKey(localLogin.value!, keyDays.value, description.value, onetime.value, deadline.value).then((data) => {
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
  emits("update:created", await createNewToken())
}

function cancel() {
  emits("update:cancelled")
}


</script>

<template>
  <a-form class="main-container">
    <div class="line" v-if="initData.superUser">
      <a-typography-text class="title" content="Логин пользователя:"/>
      <a-input class="field" v-model:value="localLogin"/>
    </div>
    <div class="line">
      <a-typography-text class="title" content="Время жизни:"/>
      <a-radio-group class="field" v-model:value="deadlineMode">
        <a-radio-button class="r-btn" value="days">В днях</a-radio-button>
        <a-radio-button class="r-btn" value="deadline">Дедлайн</a-radio-button>
      </a-radio-group>
    </div>
    <div v-if="deadlineMode == 'deadline'" class="line">
      <a-typography-text class="title" content="Дедлайн:"/>
      <a-date-picker class="field" v-model:value="deadline" :format="dateFormat" :value-format="dateFormat"
                     placeholder=" "/>
    </div>
    <div v-if="deadlineMode == 'days'" class="line">
      <a-typography-text class="title" content="Срок жизни в днях:"/>
      <a-input-number class="field" v-model:value="keyDays"/>
    </div>
    <div class="line">
      <a-typography-text class="title" content="Описание:"/>
      <a-input class="field" v-model:value="description"/>
    </div>
    <div class="line">
      <a-typography-text class="title" content="Тип:"/>
      <a-radio-group v-model:value="onetime" class="field">
        <a-radio-button class="r-btn" :value="false">Многоразовый</a-radio-button>
        <a-radio-button class="r-btn" :value="true">Одноразовый</a-radio-button>
      </a-radio-group>
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
