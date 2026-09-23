import {createApp} from 'vue'
import { createInitVariableFromEnv, initializeJsApi, initVariableEnvMapping } from '@minitwiks/js-api'
import {createPinia} from 'pinia'
import App from './App.vue'
import Antd from 'ant-design-vue'
import { NsmpVueComponents } from '@minitwiks/nsmp-vue-components'
import '@iframe-resizer/child'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import hljsVuePlugin from "@highlightjs/vue-plugin"

import 'highlight.js/styles/lightfair.css'
import './assets/styles/antCustomStyles.css'
import './assets/styles/main.css'

const mapping = {
    ...initVariableEnvMapping,
    APP_URL: ['MY_APP_URL', 'APP_URL', 'VITE_APP_URL']
}
const params = createInitVariableFromEnv(import.meta.env, mapping)


hljs.registerLanguage('json', json)

initializeJsApi({}, params).then((JsApi: any) => {
    const app = createApp(App)
    const pinia = createPinia()

    app.provide("jsApi", JsApi)
    app.use(Antd)
    app.use(NsmpVueComponents)
    app.use(pinia)
    app.use(hljsVuePlugin)
    app.mount('#app')
}).catch((e: string) => {
    console.error(e)
})
