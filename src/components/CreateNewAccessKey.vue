<script setup lang="ts">
    import {ref} from 'vue'
    import main from "../config"
    import { useBaseStore } from '../stores'

    const baseStore = useBaseStore()
    let message = ref()
    let success = ref(true)

    function createNewToken() {
        const login = document.getElementById('login').value
        const keyDays = document.getElementById('keyDays').value

        const alert = document.getElementById('alert')

        main.addAccessKey(login, keyDays).then((data) => {
            if ( data?.status == 200 ) {
                message.value = `✅ Ключ успешно создан: ${data?.accessKey}`
                success.value = true
            } else {
                message.value = `❌ Пользователь с логином '${login}' в системе не найден`
                success.value = false
            }
        })
    }
</script>

<template>
    <div class="users">
        <div class="container p-md-4">
            <form class="row">
                <div class="col-6">
                    <p class="mb-3 fw-bolder">Создать новый AccessKey</p>

                    <div 
                        class="mt-4 alert" 
                        v-if="message" id="alert"
                        :class="{'alert-danger' : !success , 'alert-success' : success }"
                    >
                        {{ message }}
                    </div>

                    <p class="mb-2">Логин пользователя</p>
                    <input class="form-control mb-4" id="login" type="search" aria-label="Search">
                    <p class="mb-2">Cрок жизни ключа в днях</p>
                    <input class="form-control mb-4" id="keyDays" type="search" value="10" aria-label="Search">
                    <span class="btn btn-sm btn-success me-2" @click="createNewToken()">Создать</span>
                    <span class="btn btn-sm" @click="baseStore.setView('start')">Отменить</span>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
</style>
