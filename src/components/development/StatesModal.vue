<script setup lang="ts">
import { useSearchStore } from '../../stores/search'
import { useUserStore } from '../../stores/user'

const searchStore = useSearchStore()
const userStore = useUserStore()

</script>

<template>
    <a-collapse class="site-collapse-custom-collapse" :accordion="true">
        <a-collapse-panel key="1" header="Отладочные данные">
            <p class="header">Пользовательские данные:</p>
            <p><b>login: </b>{{ userStore.login }}</p>
            <p><b>title: </b>{{ userStore.title }}</p>
            <p><b>uuid: </b>{{ userStore.uuid }}</p>
            <p><b>profiles: </b>{{ userStore.profiles }}</p>
            <p><b>roles: </b>{{ userStore.roles }}</p>
            
            <p class="header">Глобальные данные приложения:</p>
            <p><b>searchData: </b>{{ searchStore.data }}</p>
        </a-collapse-panel>
    </a-collapse>
</template>

<style scoped>
.site-collapse-custom-collapse {
    z-index: 999;
    position: absolute;
    width: 20%;
    bottom: 20px;
    left: 20px;;
}
.header {
    margin-top: 20px;
    margin-bottom: 10px !important;
    font-weight: 600 !important;
}
p {
    margin-bottom: 0px;
}
</style>