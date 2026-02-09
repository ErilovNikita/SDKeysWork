<script setup lang="ts">

import KeyInfo from "../../model/KeyInfo.ts";
import {h, ref} from "vue";
import {CopyOutlined} from '@ant-design/icons-vue';

interface Props {
  accessKey: KeyInfo
}

const props = defineProps<Props>()
const tooltipTitle = ref<string>("Скопировать")


function copy() {
  navigator.clipboard.writeText(props.accessKey.uuid)
  tooltipTitle.value = 'Скопировано!';

  // Автоматически скрываем уведомление через 2 секунды
  setTimeout(() => {
    tooltipTitle.value = 'Скопировать'
  }, 2000)
}

const showText = ref(false);

</script>

<template>
  <a-space direction="horizontal">
    <a-tooltip :title="tooltipTitle">
      <a-button type="text"
                class="btn1"
                shape="circle"
                @click="copy"
                :icon="h(CopyOutlined)"/>
    </a-tooltip>
    <a-button shape="round">
      <a-typography-text v-if="showText"
                         :content="accessKey.uuid"
                         @click="showText = !showText"/>
      <a-typography-text v-if="!showText"
                         :content="accessKey.uuid.replace(/[^-]/g, '*')"
                         @click="showText = !showText"/>
    </a-button>

  </a-space>
</template>

<style scoped>
.btn1 {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
