<script setup lang="ts">
    import { useBaseStore } from '../stores'
    const baseStore = useBaseStore()
</script>

<template>
    <div class="container">
        <div class="p-4 mt-4 text-center">
            <h1 class="display-4">🕵️‍♂️</h1>
            <h5 class="mb-0">Пока тут пусто</h5>
            <p class="text-muted">Введите в поисковую строку логин или ключ</p>
            <div @click="baseStore.setView('new')" class="btn btn-primary mt-2">Создать новый ключ</div>
        </div>
    </div>
</template>

<style scoped>
</style>
