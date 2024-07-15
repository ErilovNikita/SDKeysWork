<script setup lang="ts">
    import main from "../config"
    import { useBaseStore } from '../stores'

    const baseStore = useBaseStore()

    function find() {
        let findValue = document.getElementsByClassName('findValue')[0].value

        if (! document.getElementsByClassName('findValue')[0].value) {
            baseStore.setView('start')
        } else {
            main.getData(findValue, 1).then((data) => {
                if ( data?.data?.length > 0 ) {
                    console.log(data)
                    baseStore.set(data, findValue)
                    baseStore.setView('list')
                } else {
                    baseStore.setView('empty')
                }
            })
        }
    }
</script>

<template>
    <div class="bg-dark">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <nav class="navbar navbar-expand-lg navbar-light  p-md-4 p-2">
                        <div class="navbar-brand text-white" @click="baseStore.setView('start')">
                            <h3 class="app-name">{{main.manifest.NAME}}</h3>
                        </div>
                    </nav>
                </div>
                <div class="col-md-6 mb-1">
                    <div class="general p-md-4 p-2">
                        <form class="d-flex mb-2" @submit.prevent="find()">
                            <input class="form-control me-2 findValue" type="search" placeholder="🔎 Поиск по логину или ключу">
                            <a 
                                class="btn btn-success btnSearchMail" 
                                @click="find()"
                            >Найти</a>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .navbar-brand {
        cursor: pointer;
    }
</style>