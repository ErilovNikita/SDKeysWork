/// <reference types="vite/client" />

import { VNode } from "vue"

declare global {
    namespace JSX {
        interface Element extends VNode {}
        interface IntrinsicElements {
            [elem: string]: any
        }
    }

    declare const __APP_VERSION__: string
    declare const __APP_NAME__: string
    declare const jsApi: IJsApi
}

declare module '*.vue' {
    import { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}
