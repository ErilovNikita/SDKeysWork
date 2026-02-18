<script setup lang="ts">
import {notification} from "ant-design-vue"

import { IKeyInfo } from "../../utils/types"
import ConnectorService from "../../utils/connector"
import { parseRuDate } from "../../utils/services"
import { useSearchStore } from "../../stores/search"

import ClockIcon from '../../assets/icons/clock.svg'
import { computed } from "vue"

const searchStore = useSearchStore()
const props = defineProps<{accessKey: IKeyInfo}>()
const api:ConnectorService = new ConnectorService()
const usingEnvAccessKey:string | null = import.meta.env.VITE_ACCESS_KEY
const keyExpired = computed(() => {
  const date = parseRuDate(props.accessKey.deadline)
  if (!date) return false
  return date.getTime() <= Date.now()
})
const keyActive = computed(() => {
  return props.accessKey.active && !keyExpired.value
})

const errorSwitch = (e: any):void => {
  notification.error({
    message: "Произошла ошибка",
    description : JSON.parse(e).cause.message,
    placement: 'bottomRight',
    duration: 5
  })
}

const successSwitch = (description:string):any => {
  notification.success({
    message: "Ключ успешно изменен",
    description: description,
    placement: 'bottomRight',
    duration: 5
  })
  searchStore.setSearchData(searchStore.data!)
}

const toggle = ():void => {
  if (props.accessKey.active) api.enableKey(props.accessKey.uuid)
    .then(successSwitch("Ключ доступа активирован"))
    .catch(errorSwitch)
  else api.disableKey(props.accessKey.uuid)
    .then(successSwitch("Ключ доступа отключен"))
    .catch(errorSwitch)
}

</script>

<template>
    <div class="switch">
      <ClockIcon style="opacity: .5;" v-if="props.accessKey.uuid == usingEnvAccessKey"/>
      <a-switch :checked="keyActive" :disabled="keyExpired" @click='toggle' size="small" v-else/>
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
