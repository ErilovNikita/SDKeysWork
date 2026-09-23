<script setup lang="ts">
import { useSearchStore } from '../../stores/search'
import { useUserStore } from '../../stores/user'
import { AttrGroup } from '@minitwiks/nsmp-vue-components'

const searchStore = useSearchStore()
const userStore = useUserStore()

</script>

<template>
    <a-collapse class="site-collapse-custom-collapse" :accordion="true">
        <AttrGroup 
            title="Отладочные данные" 
            :items="[
                ['Логин', 'login'],
                ['Название', 'title'],
                ['UUID', 'uuid'],
                ['Профили прав', 'profiles'],
                ['Роли', 'roles'],
                ['Данные для поиска', 'searchData'],
                ['Тип поиска', 'searchMode'],
            ]"
            :values="{
                login: userStore.login,
                title: userStore.title,
                uuid: userStore.uuid,
                profiles: userStore.profiles,
                roles: userStore.roles,
                searchData: searchStore.data,
                searchMode: searchStore.mode
            }" 
            open 
            class="developmentModal"
        />
    </a-collapse>
</template>

<style scoped>
.developmentModal {
    z-index: 999;
    position: fixed;
    width: 20%;
    bottom: 20px;
    left: 20px;;
}
</style>