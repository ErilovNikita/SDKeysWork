<script setup lang="ts">
import {notification} from "ant-design-vue"

import { IKeyInfo } from "../../utils/types"
import ConnectorService from "../../utils/connector"

import ClockIcon from '../../assets/icons/clock.svg'

const props = defineProps<{accessKey: IKeyInfo}>()
const api:ConnectorService = new ConnectorService()
const usingEnvAccessKey:string | null = import.meta.env.VITE_ACCESS_KEY

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
      <a-switch v-model:checked="props.accessKey.active" @click='toggle' size="small" v-if="props.accessKey.uuid != usingEnvAccessKey"/>
      <ClockIcon style="opacity: .5;" v-if="props.accessKey.uuid == usingEnvAccessKey"/>
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
