import {createApp} from 'vue'
import { createInitVariableFromEnv, initializeJsApi, initVariableEnvMapping, PartialJsApi } from '@minitwiks/js-api'
import {createPinia} from 'pinia'
import App from './App.vue'
import Antd from 'ant-design-vue'
import { NsmpVueComponents } from '@minitwiks/nsmp-vue-components'
import 'iframe-resizer/js/iframeResizer.contentWindow'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import hljsVuePlugin from "@highlightjs/vue-plugin"
import { applyPlatformFeatureRules, detectPlatform, Platform, PlatformFeature } from './utils/platform'

import 'highlight.js/styles/lightfair.css'
import '@minitwiks/nsmp-vue-components/style.css'
import './assets/styles/index.css'

applyPlatformFeatureRules(
  detectPlatform(globalThis.navigator?.userAgent ?? ''),
  {
    [Platform.Windows]: [
      PlatformFeature.AntAnimations,
      PlatformFeature.ModalBackdropBlur,
    ],
  },
)

const mapping = {
    ...initVariableEnvMapping,
    APP_URL: ['MY_APP_URL', 'APP_URL', 'VITE_APP_URL']
}
const params = createInitVariableFromEnv(import.meta.env, mapping)


hljs.registerLanguage('json', json)

const mock: PartialJsApi = {
    contents: {
        getParameters: async () => {
            const raw = import.meta.env.VITE_MOCK_PARAMETERS_HIDE_ACCESSKEY;
            const hideAccessKeys =
                typeof raw === 'string'
                ? ['1', 'true', 'yes', 'on'].includes(raw.toLowerCase())
                : false;

            return { hideAccessKeys };
        },
    }
}

initializeJsApi(mock, params).then((JsApi: any) => {
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
