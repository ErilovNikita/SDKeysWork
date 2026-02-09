<script setup lang="ts">
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import CreateView from './components/views/CreateView.vue'
import EmptyView from './components/views/EmptyView.vue'
import NoPermissionView from './components/views/NoPermissionView.vue'
import ListView from './components/views/ListView.vue'
import DeleteView from "./components/views/DeleteView.vue";
import {connector, jsApi} from "./main.ts";
import {ref} from "vue";
import InitialData from "./model/InitialData.ts";
import {notification} from "ant-design-vue";
import AccessKeyView from "./components/views/AccessKeyView.vue";

const initialData = ref<InitialData | null>(null)
const currentUser = ref<string | null>(null)
const state = ref<"create" | "list" | "empty" | "permissionError" | 'delete' | 'key'>("list")
const login = ref<string | null>(currentUser.value)
const uuid = ref<string | null>(null)
const initializationDone = ref<boolean>(false)

const list = ref()

connector.getInitialData().then(data => {
  //data.superUser = false
  //data.canUse = false
  initialData.value = data
}).then(() => {
  //throw new Error("ТЕСТ")
  if (!initialData.value!.canUse) state.value = 'permissionError'
  login.value = jsApi.getCurrentUser().login
  currentUser.value = login.value
  initializationDone.value = true
}).catch(e => {
  notification.error({
    message: "Ошибочка при инициализации",
    placement: 'top',
    duration: 5
  })
  state.value = 'permissionError'
  throw e
})

function handleSearchUserEmit() {
  state.value = 'list'
  list.value.extSearch()
}

</script>

<template>
  <div v-if="initializationDone">
    <Header :init-login="login"
            :init-data="initialData!"
            :state="state"
            @update:login="a => login = a"
            @search:login="handleSearchUserEmit"
            @update:uuid="a => uuid = a"
            @search:uuid="state = 'key'"
            @add:accessKey="state = 'create'"
            @delete:accessKeys="state = 'delete'"/>
    <CreateView v-if="state == 'create'"
                :login="login"
                :init-data="initialData!"
                @update:cancelled="() => state = 'list'"
                @update:created="() => state = 'list'"/>
    <DeleteView v-if="state == 'delete'"
                :init-data="initialData!"
                :login="login"
                @update:cancelled="() => state = 'list'"
                @update:deleted="() => state = 'list'"/>
    <ListView ref="list"
              v-if="state == 'list'"
              :init-data="initialData!"
              @update:empty="state = 'empty'"
              :login="login"/>
    <EmptyView v-if="state == 'empty'"
               @update:add="() => state = 'create'"/>
    <NoPermissionView v-if="state == 'permissionError'"/>
    <AccessKeyView v-if="state == 'key'"
                   :uuid="uuid"
                   @update:ok="() => state = 'list'"
                   :init-data="initialData!"/>
    <Footer/>
  </div>
</template>
