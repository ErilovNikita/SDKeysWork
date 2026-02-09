import {createApp} from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue';
import '../assets/custom.css';
import {JsApiProxy} from "nsd_js_api_proxy";
import devConfig from "./js_api_dev_config.ts";
import ConnectorService from "./connector.ts";
import '@iframe-resizer/child'
import 'ant-design-vue/dist/reset.css';

const app = createApp(App)
const jsApi: JsApiProxy = JsApiProxy.getInstance(devConfig)
const devMode = jsApi.isDevMode()
const connector = new ConnectorService()

app.use(Antd)
app.provide("jsApi", jsApi)

app.mount('#app')

export {jsApi, connector, devMode}
