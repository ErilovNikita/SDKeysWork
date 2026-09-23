<script setup lang="ts">
import { useSearchStore } from '../../stores/search'
import { useUserStore } from '../../stores/user'
import { AttrGroup } from '@minitwiks/nsmp-vue-components'

const searchStore = useSearchStore()
const userStore = useUserStore()

const values = {
    login: userStore.login,
    title: userStore.title,
    uuid: userStore.uuid,
    profiles: userStore.profiles,
    roles: userStore.roles,
    searchData: searchStore.data,
    searchMode: searchStore.mode
}
const fields: Array<[string, string]> = [
    ['Логин', 'login'],
    ['Название', 'title'],
    ['UUID', 'uuid'],
    ['Профили прав', 'profiles'],
    ['Роли', 'roles'],
    ['Данные для поиска', 'searchData'],
    ['Тип поиска', 'searchMode'],
]
</script>

<template>
    <AttrGroup 
        title="Отладочные данные" 
        :items="fields"
        :values="values" 
        class="developmentModal"
    />
</template>