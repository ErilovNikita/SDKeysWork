<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue"
import { IKeyInfo } from "../../utils/types"
import { usePlatform } from '../../composables/usePlatform'

const { isMac } = usePlatform()
const props = defineProps<{ accessKey: IKeyInfo }>()
const showText = ref(false)
const copied = ref(false)
const tooltipOpen = ref(false)
let resetCopiedTimer: ReturnType<typeof setTimeout> | undefined

const copy = async () => {
  navigator.clipboard.writeText(props.accessKey.uuid)
  copied.value = true
  tooltipOpen.value = true
  clearTimeout(resetCopiedTimer)
  resetCopiedTimer = setTimeout(() => {
    copied.value = false
    tooltipOpen.value = false
  }, 1500)
}
const handleClick = () => {
  copy()
  showText.value = true
}

onBeforeUnmount(() => clearTimeout(resetCopiedTimer))
</script>

<template>
  <a-space direction="horizontal">
    <a-tooltip v-model:open="tooltipOpen" :title="copied ? 'Скопировано!' : 'Скопировать'" class="uuid-text" placement="top">
      <a-skeleton-button 
        :active="isMac"
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
}
</style>
