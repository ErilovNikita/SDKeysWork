<script setup lang="ts">
import { onBeforeUnmount, ref, onMounted } from "vue"
import { IKeyInfo, IParameters } from "../../utils/types"
import { usePlatform } from '../../utils/platform'

const { isMac } = usePlatform()
const props = defineProps<{ accessKey: IKeyInfo }>()
const hideAccessKeys = ref<Boolean>(true)
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

onMounted( async () => {
  const parameters:IParameters = await jsApi.contents.getParameters()
  hideAccessKeys.value = parameters.hideAccessKeys ?? false
})

onBeforeUnmount(() => clearTimeout(resetCopiedTimer))
</script>

<template>
  <a-space direction="horizontal">
    <a-tooltip v-model:open="tooltipOpen" :title="copied ? 'Скопировано!' : 'Скопировать'" class="uuid-text" placement="top">
      <span class="uuid-trigger">
        <a-skeleton-button 
          v-if="!showText && hideAccessKeys"
          :active="isMac"
          shape="round" 
          class="key-skeleton"
          @click="handleClick"
        />
        <a-typography-text 
          v-else
          class="uuid-text"
          :content="accessKey.uuid"
          @click="handleClick"
        />
      </span>
    </a-tooltip>
  </a-space>
</template>

<style scoped>
.uuid-text {
  font-family: monospace;
  cursor: pointer;
}
.uuid-trigger {
  display: inline-flex;
  align-items: center;
  height: 32px;
}
</style>
