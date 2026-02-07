<script setup lang="ts">
interface Emits {
  (e: 'update:add'): void
}

const emit = defineEmits<Emits>()
</script>

<template>
  <div class="main-container">
    <h1 class="display-4">😞</h1>
    <h3>Ничего не найдено</h3>
    <a-button @click="emit('update:add')">Создать новый ключ</a-button>
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  margin-top: 50px;
  margin-bottom: 50px;
}
</style>
