<script setup lang="ts">
import { FormSwitch } from '@minitwiks/nsmp-vue-components'
import { notifyError } from '../../utils/notification'

import type { IKeyInfo } from "../../utils/types"
import ConnectorService from "../../utils/connector"
import { parseDate } from "../../utils/services"

import { ClockIcon } from 'nsmp-icons'
import { computed } from "vue"

const props = defineProps<{accessKey: IKeyInfo}>()
const api:ConnectorService = new ConnectorService()
const usingEnvAccessKey:string | null = import.meta.env.VITE_ACCESS_KEY
const keyExpired = computed(() => {
  const date = parseDate(props.accessKey.deadline)
  if (!date) return false
  return date.getTime() <= Date.now()
})
const keyActive = computed(() => {
  return props.accessKey.active && !keyExpired.value
})

const errorSwitch = (error: unknown): void => {
  notifyError('Произошла ошибка', error)
}

const successSwitch = (): void => {
  props.accessKey.active = !props.accessKey.active
}

const toggle = ():void => {
  const request = props.accessKey.active
    ? api.disableKey(props.accessKey.uuid)
    : api.enableKey(props.accessKey.uuid)

  request.then(() => successSwitch()).catch(errorSwitch)
}

</script>

<template>
    <div class="switch">
      <ClockIcon style="opacity: .5;" v-if="props.accessKey.uuid == usingEnvAccessKey"/>
      <FormSwitch
        v-else
        :checked="keyActive"
        :switch-props="{ disabled: keyExpired, size: 'small' }"
        :form-item-props="{ noStyle: true }"
        @change="toggle"
      />
    </div>
</template>

<style scoped>
.switch {
  text-align: center;
}
.switch svg {
  transform: scale(1.4);
  margin-bottom: -3px;
}
</style>
