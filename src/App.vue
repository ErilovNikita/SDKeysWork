<script setup lang="ts">
  import main from './config'
  import { useBaseStore } from './stores'

  import Header from './components/Header.vue'
  import Footer from './components/Footer.vue'
  import CreateNewAccessKey from './components/CreateNewAccessKey.vue'
  import EmptyView from './components/EmptyView.vue'
  import StartView from './components/StartView.vue'
  import PermissionError from './components/PermissionError.vue'
  import AccessKeyList from './components/AccessKeyList.vue'

  const baseStore = useBaseStore()

  // Пишем в консоль бейдж приложения
  console.log(`%c${main.manifest.NAME} App \n%cby ${main.manifest.GITHUB_OWNER}`, 'background: #d9a5f9; color: #A020F0', 'background: #fff; color: #333')

  // Устанавливаем высоту приложения 
  let height = 800

  baseStore.devMode(
    main.manifest.DEV_MODE,
    main.manifest.DEV_URL,
    main.manifest.DEV_TOKEN
  )

  try {
    // Подключаем jsApi
    window.parent.injectJsApi(window.parent, window)
    // Прокидываем переменные из параметров контента
    jsApi.contents.getParameters().then((params) =>{
      if ( params.dev == true && baseStore.dev.enable  ) {
        baseStore.devMode(
          params.dev,
          params.instanceUrl,
          params.token
        )
      }
    })
  } catch {
    console.log('Ошибка подключения jsApi')
  }

  if (!baseStore.dev.enable) {
    // Проверяем высоту приложения
    try {
      // Отсутствует в старых версиях
      height = jsApi.contents.getInitialHeight()
    } catch {}

    try {
      // Если нет прав, отрисовываем ошибку
      if (!jsApi.getCurrentUser().admin) {
        baseStore.setView('error')
      }
    } catch {}
  }

  document.getElementsByTagName('body')[0].style.maxHeight = `${height}px`
</script>

<template>
  <Header class="mb-4"/>
  <CreateNewAccessKey v-if="baseStore.view == 'new'"/>
  <AccessKeyList v-if="baseStore.view == 'list'"/> 
  <EmptyView v-if="baseStore.view == 'empty'"/>
  <StartView v-if="baseStore.view == 'start'"/>
  <PermissionError v-if="baseStore.view == 'error'"/>
  <Footer />
</template>