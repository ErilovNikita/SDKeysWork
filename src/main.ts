import {createApp} from 'vue'
import {initializeJsApi, InitVariable} from '@nsmp/js-api'
import { createPinia } from 'pinia'
import App from './App.vue'
import Antd from 'ant-design-vue'
import '@iframe-resizer/child'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import hljsVuePlugin from "@highlightjs/vue-plugin"

import 'highlight.js/styles/lightfair.css'
import './assets/styles/antCustomStyles.css'
import './assets/styles/main.css'

const env = new InitVariable(
	import.meta.env.MODE,
	import.meta.env.VITE_ACCESS_KEY,
	import.meta.env.VITE_APP_URL,
	import.meta.env.VITE_APP_CODE,
	import.meta.env.VITE_REST_PATH,
	import.meta.env.VITE_SUBJECT_UUID,
	import.meta.env.VITE_USER_LOGIN,
	import.meta.env.VITE_USER_UUID,
    import.meta.env.VITE_USER_ADMIN,
    import.meta.env.VITE_USER_LICENSED
)

hljs.registerLanguage('json', json)

initializeJsApi( {}, env ).then((declorateJsApi: any) => {
    const app = createApp(App)
	const pinia = createPinia()

	app.provide("jsApi", declorateJsApi)
	app.use(Antd)
	app.use(pinia)
	app.use(hljsVuePlugin)
	app.mount('#app')
}) 
.catch((e:string) => {
    console.error(e)
})
