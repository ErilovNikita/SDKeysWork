<script setup lang="ts">

import KeyInfo from "../../model/KeyInfo.ts";
import {connector} from "../../main.ts";
import {reactive} from "vue";
import {notification} from "ant-design-vue";

interface Props {
  accessKey: KeyInfo
}

const props = defineProps<Props>()
const localAccessKey = reactive<KeyInfo>(props.accessKey)
const catchE = (e: Error) => {
  notification.error({
    message: "Ошибочка при переключении: ",
    description : e.message,
    placement: 'top',
    duration: 5
  })
}

function toggle() {
  if (localAccessKey.active) connector.enableKey(localAccessKey.uuid).catch(catchE)
  else connector.disableKey(localAccessKey.uuid).catch(catchE)
}

</script>

<template>
  <a-space direction="horizontal">
    <div class="switch">
      <a-switch v-model:checked="localAccessKey.active" @click='toggle' size="small"/>
    </div>
  </a-space>
</template>

<style scoped>
.switch {
  display: flex;
  align-items: center;
}
</style>
