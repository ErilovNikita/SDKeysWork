<script setup lang="ts">
    import { useBaseStore } from '../stores'
    const baseStore = useBaseStore()
</script>

<template>
    <div class="container">
        <div class="p-4 mt-4 text-center">
            <h1 class="display-4">😞</h1>
            <h5>Ничего не найдено</h5>
            <div @click="baseStore.setView('new')" class="btn btn-primary mt-3">Создать новый ключ</div>
        </div>
    </div>
</template>

<style scoped>
</style>
