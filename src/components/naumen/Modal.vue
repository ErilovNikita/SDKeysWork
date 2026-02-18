<script setup lang="ts">
import type { ModalController } from '../../utils/fileds'
import { usePlatform } from '../../composables/usePlatform'

const { isMac } = usePlatform()

const props = defineProps<{
    controller: ModalController
}>()
</script>

<template>
    <a-modal 
        v-model:open="props.controller.visiable.value" 
        :title="props.controller.title.value"
        :transition-name="isMac ? undefined : ''"
        :mask-transition-name="isMac ? undefined : ''"
    >
        <slot name="alert"></slot>
        <slot name="form"></slot>
        <template #footer>
            <slot name="footer"></slot>
        </template>
    </a-modal>
</template>