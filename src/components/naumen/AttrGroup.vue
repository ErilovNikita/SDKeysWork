<script lang="ts" setup>
import { AttrGroupController } from '../../utils/fileds'

const props = defineProps<{
    config: AttrGroupController,
    values: any
}>()

</script>

<template>
    <a-collapse ghost v-model:activeKey="config.activeKey.value">
        <a-collapse-panel :header="config.title.value" key="1">
            <a-form :label-col="{ style: { width: '225px', textAlign: 'left' } }" layout="horizontal">
                <slot name="start"></slot>
                <a-form-item v-for="item in config.items.value" :label="item[0]" style="margin-bottom: -10px;">
                    <a-typography-text>{{ values[(item[1])] }}</a-typography-text>
                </a-form-item>
                <slot name="end"></slot>
            </a-form>
        </a-collapse-panel>
    </a-collapse>
</template>