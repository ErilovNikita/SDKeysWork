<script setup lang="ts">

import KeyInfo from "../../model/KeyInfo.ts";
import {connector} from "../../main.ts";
import {h, ref} from "vue";
import {notification} from "ant-design-vue";
import {DeleteOutlined} from "@ant-design/icons-vue";

interface Emits {
  (e: 'update:deleted'): void
}

interface Props {
  accessKey: KeyInfo
}

const emits = defineEmits<Emits>()
const props = defineProps<Props>()
const showConfirm = ref<boolean>(false)
const catchE = (e: Error) => {
  notification.error({
    message: "Ошибочка при удалении ",
    description: e.message,
    placement: 'top',
    duration: 5
  })
}

function yes() {
  connector.deleteKey(props.accessKey.uuid).then(() => emits("update:deleted")).catch(catchE).finally(() => showConfirm.value = false)
}

</script>

<template>
  <a-modal v-model:open="showConfirm"
           title="Вы уверены?"
           width="400px"
           :footer="null"
           :closable="false"
           :centered="true"
           :maskClosable="true">
    <div class="text">
       Восстановить не получится.
    </div>
    <div>
      <a-button type="primary"
                @click="yes"
                style="margin-right: 8px;">
        Да
      </a-button>
      <a-button @click="showConfirm = false">Нет</a-button>
    </div>
  </a-modal>
  <a-button type="text"
            class="btn1"
            shape="circle"
            @click="showConfirm = true"
            :icon="h(DeleteOutlined)"/>
</template>

<style scoped>
.text {
  margin-bottom: 20px;
}
</style>
