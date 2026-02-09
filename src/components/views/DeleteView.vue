<script setup lang="ts">
import {ref} from 'vue'
import {connector} from "../../main.ts";
import InitialData from "../../model/InitialData.ts";
import {notification} from "ant-design-vue";

interface Emits {
  (e: 'update:deleted'): void

  (e: 'update:cancelled'): void
}

interface Props {
  login: string | null
  initData: InitialData
}

const props = defineProps<Props>()

const emits = defineEmits<Emits>()

const localLogin = ref<string | null>(props.login)

const loading = ref(false)

async function deleteAllKeys(): Promise<void> {
  loading.value = true
  await connector.deleteUserAccessKeys(localLogin.value!).then(() => {
    notification.success({
      message: "Все удалено",
      placement: 'top',
      duration: 5
    })
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
  if (bol1.value && bol2.value && bol3.value && bol4.value && bol5.value) {
    console.log("1231231")
    await deleteAllKeys()
    emits("update:deleted")
  } else {
    notification.warn({
      message: "Вы недостаточно уверены",
      description: "Нужно нажать кнопочки \"Да\"",
      placement: 'top',
      duration: 3
    })
  }
}

function cancel() {
  emits("update:cancelled")
}

const bol1 = ref(false)
const bol2 = ref(false)
const bol3 = ref(false)
const bol4 = ref(false)
const bol5 = ref(false)

</script>

<template>
  <a-form class="main-container">
    <div class="line" v-if="initData.superUser">
      <a-typography-text class="title" content="Логин пользователя:"/>
      <a-input class="field" v-model:value="localLogin"/>
    </div>
    <div class="line">
      <a-typography-text class="big-title" content="Вы точно уверены?"/>
    </div>
    <div class="line">
      <a-radio-group class="field" v-model:value="bol1">
        <a-radio-button class="r-btn" :value="false">Нет</a-radio-button>
        <a-radio-button class="r-btn" :value="true">Да</a-radio-button>
      </a-radio-group>
    </div>
    <div class="line">
      <a-radio-group class="field" v-model:value="bol2">
        <a-radio-button class="r-btn" :value="true">Да</a-radio-button>
        <a-radio-button class="r-btn" :value="false">Нет</a-radio-button>
      </a-radio-group>
    </div>
    <div class="line">
      <a-radio-group class="field" v-model:value="bol3">
        <a-radio-button class="r-btn" :value="false">Нет</a-radio-button>
        <a-radio-button class="r-btn" :value="true">Да</a-radio-button>
      </a-radio-group>
    </div>
    <div class="line">
      <a-radio-group class="field" v-model:value="bol4">
        <a-radio-button class="r-btn" :value="true">Да</a-radio-button>
        <a-radio-button class="r-btn" :value="false">Нет</a-radio-button>
      </a-radio-group>
    </div>
    <div class="line">
      <a-radio-group class="field" v-model:value="bol5">
        <a-radio-button class="r-btn" :value="false">Нет</a-radio-button>
        <a-radio-button class="r-btn" :value="true">Да</a-radio-button>
      </a-radio-group>
    </div>
    <div class="line btn-container">
      <a-button class="final-btn" type="primary" @click="ok">
        Удалить!
      </a-button>
      <a-button class="final-btn" @click="cancel">
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

.big-title {
  font-size: 20px;
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
