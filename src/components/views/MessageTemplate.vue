<script setup lang="ts">
const props = defineProps<{
    emoji?: string
    header?: string
    description?: string
}>()
</script>

<template>
    <a-space direction="vertical" class="text-center">
        <div class="magic" v-if="props.emoji">{{ props.emoji }}</div>
        <a-typography-title :level="3" class="header" v-if="props.header">{{ props.header }}</a-typography-title>
        <a-typography-text disabled class="description" v-if="props.description"> {{ props.description }}</a-typography-text>
        <slot name="end"></slot>
    </a-space>
</template>

<style scoped>
.text-center {
    display: flex;
    justify-content: center;
    text-align: center;
}

.magic {
    font-size: 48px;
}

.header {
    margin-bottom: 0px;
}

.description {
    margin-top: 0px;
}
</style>