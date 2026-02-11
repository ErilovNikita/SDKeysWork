<script setup lang="ts">
import { ref } from "vue"
import { IKeyInfo } from "../../utils/types"

const props = defineProps<{ accessKey: IKeyInfo }>()
const showText = ref(false)
const tooltipTitle = ref<string>("Скопировать")

const copy = () => {
  navigator.clipboard.writeText(props.accessKey.uuid)
  tooltipTitle.value = "Скопировано!"
  setTimeout(() => (tooltipTitle.value = "Скопировать"), 2000)
}
const handleClick = () => {
  copy()
  showText.value = true
}
</script>

<template>
  <a-space direction="horizontal">
    <a-tooltip :title="tooltipTitle" class="uuid-text" :trigger="['hover']" placement="top">
      <a-skeleton-button 
        :active="true" 
        shape="round" 
        class="key-skeleton"
        v-if="!showText"
        @click="handleClick"
      />
    </a-tooltip>

      <a-typography-text 
        v-if="showText"
        class="uuid-text"
        :content="accessKey.uuid"
        @click="showText = false"
      />
  </a-space>
</template>

<style scoped>
.uuid-text {
  font-family: monospace;
  cursor: pointer;
  user-select: all;
}
</style>
