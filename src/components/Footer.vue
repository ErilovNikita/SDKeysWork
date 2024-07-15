<script setup lang="ts">
    import { ref } from 'vue'
    import main from "../config"

    let updateState = ref('await')
            
    main.getReleaseVersion().then((releaseVerison) => {
        releaseVerison = releaseVerison?.replace('v', '')
        const verisonValue = document.getElementsByClassName('version')[0]

        switch(releaseVerison) {
            case undefined: case releaseVerison:
                verisonValue.innerHTML = main.manifest.VERSION
                updateState.value = 'ok'
                break;
            dafault:
                verisonValue.innerHTML = `${main.manifest.VERSION} <svg style="margin-bottom: 1px;" height="15px" viewBox="0 -960 960 960" width="15px" fill="var(--bs-blue)"><path d="m560-240-56-58 142-142H160v-80h486L504-662l56-58 240 240-240 240Z"/></svg> ${releaseVerison}`
                updateState.value = 'error'
                break;
        }
    })
</script>

<template>
    <div id="footer" class="p-4 text-center">
        <hr>
        <small class="d-inline-block">
            Made with <span class="text-danger">❤</span> by {{main.manifest.GITHUB_OWNER}}<br>
            <span class="app-version">
                <svg :class="{'d-none': updateState != 'await'}" height="20px" viewBox="0 -960 960 960" width="20px" fill="#5f6368"><path d="M440-122q-121-15-200.5-105.5T160-440q0-66 26-126.5T260-672l57 57q-38 34-57.5 79T240-440q0 88 56 155.5T440-202v80Zm80 0v-80q87-16 143.5-83T720-440q0-100-70-170t-170-70h-3l44 44-56 56-140-140 140-140 56 56-44 44h3q134 0 227 93t93 227q0 121-79.5 211.5T520-122Z"/></svg>
                <svg :class="{'d-none': updateState != 'ok'}" height="20px" viewBox="0 -960 960 960" width="20px" fill="var(--bs-success)"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
                <svg :class="{'d-none': updateState != 'error'}" height="20px" viewBox="0 -960 960 960" width="20px" fill="var(--bs-danger)"><path d="m720-80 120-120-28-28-72 72v-164h-40v164l-72-72-28 28L720-80ZM480-800 243-663l237 137 237-137-237-137ZM120-321v-318q0-22 10.5-40t29.5-29l280-161q10-5 19.5-8t20.5-3q11 0 21 3t19 8l280 161q19 11 29.5 29t10.5 40v159h-80v-116L479-434 200-596v274l240 139v92L160-252q-19-11-29.5-29T120-321ZM720 0q-83 0-141.5-58.5T520-200q0-83 58.5-141.5T720-400q83 0 141.5 58.5T920-200q0 83-58.5 141.5T720 0ZM480-491Z"/></svg>
                <span class="version"></span>
            </span>
        </small>
    </div>
</template>

<style scoped>
</style>
