<script setup lang="ts">
import {ref} from 'vue'

const version = ref<string>(__APP_VERSION__)
</script>

<template>
  <a-layout-footer class="footer">
    <a-space direction="vertical" class="center">
      <a-typography-text style="font-size: 16px" :content="'Made with ❤ by ErilovNikita & KazantsevEgor'"/>
      <a-typography-text>✔️ {{ version }}</a-typography-text>
    </a-space>
  </a-layout-footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid #dfdfdf;
  padding-top: 10px;
}

.center {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
