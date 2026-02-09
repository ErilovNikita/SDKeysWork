<script setup lang="ts">
import KeyInfo from "../../model/KeyInfo.ts";
import {connector} from "../../main.ts";
import {onMounted, ref} from "vue";
import InitialData from "../../model/InitialData.ts";
import {notification} from "ant-design-vue";

interface Props {
  uuid: string | null
  initData: InitialData
}

const props = defineProps<Props>()
const keyInfo = ref<KeyInfo | null>(null)

interface Emits {
  (e: 'update:ok'): void
}

const emits = defineEmits<Emits>()

onMounted(() => {
  if (props.uuid) connector.getAccessKeyInfo(props.uuid!).then((data: KeyInfo) => {
    keyInfo.value = data
  }).catch((e) => {
    notification.error({
      message: "Ошибочка вышла",
      description: e.message,
      placement: 'top',
      duration: 5
    })
  })
})
</script>

<template>
  <div class="main-container" v-if="keyInfo != null">
    <a-space v-if="keyInfo" class="line" direction="vertical">
      <div class="title">Логин пользователя:</div>
      <div class="field">{{ keyInfo.username }}</div>
    </a-space>
    <a-space v-if="initData.superUser" class="line" direction="vertical">
      <div class="title">UUID пользователя:</div>
      <div class="field">{{ keyInfo.employeeUuid }}</div>
    </a-space>
    <a-space class="line" direction="vertical">
      <div class="title">Активен:</div>
      <div class="field">{{ keyInfo.active ? "Да" : "Нет" }}</div>
    </a-space>
    <a-space class="line" direction="vertical">
      <div class="title">Тип:</div>
      <span v-if="keyInfo.type == 'REUSABLE'">Многоразовый</span>
      <span v-if="keyInfo.type == 'DISPOSABLE'">Одноразовый</span>
    </a-space>
    <a-space class="line" direction="vertical">
      <div class="title">Дедлайн:</div>
      <div class="field">{{ keyInfo.deadline }}</div>
    </a-space>
    <a-space class="line" direction="vertical">
      <div class="title">Дата создания:</div>
      <div class="field">{{ keyInfo.creationDate }}</div>
    </a-space>
    <a-space v class="line" direction="vertical">
      <div class="title">Дата последнего использования:</div>
      <div class="field">{{ keyInfo.lastUsageDate }}</div>
    </a-space>
    <div class="line btn-container">
      <a-button class="final-btn" type="primary" @click="emits('update:ok')">
        Обратно к списку
      </a-button>
    </div>
  </div>
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

.final-btn {
  width: 200px;
}

.btn-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
