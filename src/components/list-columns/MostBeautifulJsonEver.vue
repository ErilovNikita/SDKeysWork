<template>
  <a-card :title="'JSON'" size="small">
    <pre class="json-view">{{ formattedJson }}</pre>
  </a-card>
</template>

<script setup lang="ts">
import {computed} from 'vue'

interface Props {
  data: any
}

const props = defineProps<Props>()

const formattedJson = computed(() =>
    JSON.stringify(props.data, null, 2)
)
</script>

<style scoped>
.json-view {
  background: #f6f8fa;
  padding: 16px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  overflow: auto;
  max-height: 400px;
  margin: 0;
}
</style>
