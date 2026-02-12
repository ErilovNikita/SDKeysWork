<script setup lang="ts">
import type { ModalController } from '../../utils/fileds'

const props = defineProps<{
    controller: ModalController
}>()
</script>

<template>
    <a-modal v-model:open="props.controller.visiable.value" :title="props.controller.title.value">
        <slot name="alert"></slot>
        <slot name="form"></slot>
        <template #footer>
            <slot name="footer"></slot>
        </template>
    </a-modal>
</template>