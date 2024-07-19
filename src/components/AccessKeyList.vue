<script setup lang="ts">
    import main from '../config'
    import { useBaseStore } from '../stores'
    const baseStore = useBaseStore()

    function parseDate( strDate:string ) {
        const now = new Date()
        let time = Date.parse(strDate)
        let date = new Date(time)
        let dateTime = ''
        if (date.getUTCHours() < 10) { dateTime += `0${date.getUTCHours()}`} else { dateTime += `${date.getUTCHours()}` }
        if (date.getMinutes() < 10) { dateTime += `:0${date.getMinutes()}`} else { dateTime += `:${date.getMinutes()}` }

        if ( now.getDate() == date.getDate() && now.getMonth() && date.getMonth() && now.getUTCFullYear() && date.getUTCFullYear()) {
            return `Сегодня в ${dateTime}`
        }

        if ( (now.getDate() - 1) == date.getDate() && now.getMonth() && date.getMonth() && now.getUTCFullYear() && date.getUTCFullYear()) {
            return `Вчера в ${dateTime}`
        }

        if ( (now.getDate() + 1) == date.getDate() && now.getMonth() && date.getMonth() && now.getUTCFullYear() && date.getUTCFullYear()) {
            return `Завтра в ${dateTime}`
        }

        let resultDate = ''
        if (date.getDate() < 10) { resultDate += `0${date.getDate()}`} else { resultDate += `${date.getDate()}` }
        if (date.getMonth() < 10) { resultDate += `.0${date.getMonth() + 1}`} else { resultDate += `.${date.getMonth() + 1}` }
        resultDate += `.${date.getUTCFullYear()}`
        return `${resultDate} ${dateTime}`
    }

    function parseType( strType:string ) {
        switch (strType) {
            case 'REUSABLE':
                return 'Многоразовый'
            default:
                return 'Одноразовый'
        }
    }

    function toggle( uuid:string, state:Boolean ) {
        if (state) {
            main.disableKey(uuid)
        } else {
            main.enableKey(uuid)
        }
        main.getData(baseStore.searchValue, baseStore.data.pages.current).then((data) => {
            baseStore.set(data, baseStore.searchValue)
        })
    }

    function goPage( number:integer ) {
        main.getData(baseStore.searchValue, number).then((data) => {
            baseStore.set(data, baseStore.searchValue)
        })
    }

    function copy( str:string ) {
        navigator.clipboard.writeText(str);
    }
</script>

<template>
    <div class="container">
        <p class="mb-0 fw-bolder">Список найденных ключей <span class="mb-3 text-muted">{{baseStore.data.data.length}} шт.</span></p>
        <div class="row mt-4 mb-4 w-100 d-none d-lg-flex">
            <div class="col-number-1">Ключ</div>
            <div class="col-number-2">Дата создания</div>
            <div class="col-number-3">Конец жизни</div>
            <div class="col-number-4">Тип</div>
            <div class="col-number-5">Активный</div>
            <div class="col-number-6">Сотрудник</div>
        </div>
        
        <div class="row w-100 mt-1 mb-1 position-relative" v-for="accessKey in baseStore.data.data">
            <div class="col-number-1 copyData" @click='copy(accessKey["uuid"])'>
                {{accessKey["uuid"]}} 
                <svg xmlns="http://www.w3.org/2000/svg" height="15px" class="mb-1" viewBox="0 -960 960 960" width="15px" fill="#5f6368"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>
            </div>
            <div class="col-number-2 d-flex d-lg-block">
                <span class="text-muted d-block d-lg-none me-2">Дата создания</span>
                {{parseDate(accessKey["creationDate"])}}
            </div>
            <div class="col-number-3 d-flex d-lg-block">
                <span class="text-muted d-block d-lg-none me-2">Конец жизни</span>
                {{parseDate(accessKey["deadline"])}}
            </div>
            <div class="col-number-4 d-flex d-lg-block">
                <span class="text-muted d-block d-lg-none me-2">Тип</span>
                {{parseType(accessKey["type"])}}
            </div>
            <div class="col-number-5">
                <div v-if='accessKey["uuid"] != baseStore.dev.token'>
                    <svg 
                        v-if='accessKey["active"]' 
                        @click='toggle(accessKey["uuid"], true)'
                        class="mb-1 toggleKey"
                        height="24px" 
                        viewBox="0 -960 960 960" 
                        width="24px" 
                        fill="var(--bs-success)"
                    >
                        <path d="M280-240q-100 0-170-70T40-480q0-100 70-170t170-70h400q100 0 170 70t70 170q0 100-70 170t-170 70H280Zm0-80h400q66 0 113-47t47-113q0-66-47-113t-113-47H280q-66 0-113 47t-47 113q0 66 47 113t113 47Zm400-40q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM480-480Z"/>
                    </svg>

                    <svg 
                        v-if='!accessKey["active"]' 
                        @click='toggle(accessKey["uuid"], false)'
                        class="mb-1 toggleKey"
                        height="24px" 
                        viewBox="0 -960 960 960" 
                        width="24px" 
                        fill="var(--bs-danger)"
                    >
                        <path d="M280-240q-100 0-170-70T40-480q0-100 70-170t170-70h400q100 0 170 70t70 170q0 100-70 170t-170 70H280Zm0-80h400q66 0 113-47t47-113q0-66-47-113t-113-47H280q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-40q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm200-120Z"/>
                    </svg>
                </div>
                <svg 
                    v-if='accessKey["uuid"] == baseStore.dev.token'
                    height="20px" 
                    class="mb-1"
                    viewBox="0 -960 960 960" 
                    width="20px" 
                    fill="var(--bs-blue)"
                >
                    <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/>
                </svg>
            </div>
            <div class="col-number-6">
                <span class="text-muted" v-if='accessKey["employeeUuid"].indexOf("superUser") == 0'>
                    <svg style="margin-bottom: 2px;" height="16px" viewBox="0 -960 960 960" width="16px" fill="#5f6368"><path d="M680-280q25 0 42.5-17.5T740-340q0-25-17.5-42.5T680-400q-25 0-42.5 17.5T620-340q0 25 17.5 42.5T680-280Zm0 120q31 0 57-14.5t42-38.5q-22-13-47-20t-52-7q-27 0-52 7t-47 20q16 24 42 38.5t57 14.5ZM480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v227q-19-8-39-14.5t-41-9.5v-147l-240-90-240 90v188q0 47 12.5 94t35 89.5Q310-290 342-254t71 60q11 32 29 61t41 52q-1 0-1.5.5t-1.5.5Zm200 0q-83 0-141.5-58.5T480-280q0-83 58.5-141.5T680-480q83 0 141.5 58.5T880-280q0 83-58.5 141.5T680-80ZM480-494Z"/></svg>
                    {{accessKey["username"]}}
                </span>
                <span class="" v-if='accessKey["employeeUuid"].indexOf("superUser") == -1'>
                    {{accessKey["username"]}}
                </span>
            </div>
            <div class="col-12">
                <hr class="mb-2 mt-2">
            </div>
        </div>
        <nav class="mt-4" v-if='baseStore.data.pages.count > 1'>
            <ul class="pagination justify-content-center">
                <li 
                    class="page-item" 
                    :class="{ 'active' : index == baseStore.data.pages.current}"
                    aria-current="page"
                    v-for="index in baseStore.data.pages.count" 
                    :key="index"
                    @click="goPage(index)"
                >
                    <span class="page-link">{{index}}</span>
                </li>
            </ul>
        </nav>
    </div>
</template>

<style scoped>
    .copyData {
        opacity: .5;
        cursor: pointer;
    }
    .toggleKey {
        cursor: pointer;
    }
    .copyData:hover {
        opacity: 1;
    }
    .copyData:active {
        color: var(--bs-blue) !important;
        fill: var(--bs-blue) !important;
    }
    .pagination > li {
        cursor: pointer;
    }
    .col-number-1 {
        width: 35%;
    }
    .col-number-2 {
        width: 15%;
    }
    .col-number-3 {
        width: 15%;
    }
    .col-number-4 {
        width: 12%;
    }
    .col-number-5 {
        text-align: center;
        width: 10%;
    }
    .col-number-6 {
        width: 13%;
    }

    @media screen and (max-width: 992px) {
        .col-number-1 {
            width: 100%;
        }
        .col-number-2 {
            width: 100%;
        }
        .col-number-3 {
            width: 100%;
        }
        .col-number-4 {
            width: 100%;
        }
        .col-number-5 {
            position: absolute;
            top: 0px;
            right: 0px;
        }
        .col-number-6 {
            margin-top: 10px;
            width: 100%;
        }
    }
</style>