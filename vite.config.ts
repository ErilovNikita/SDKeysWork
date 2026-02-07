import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json'

export default defineConfig(({mode}) => {
    const env = loadEnv(mode, "./")
    return {
        plugins: [
            vue()
        ],
        base: "./",
        define: {
            __APP_VERSION__: JSON.stringify(pkg.version),
            __APP_NAME__: JSON.stringify(pkg.name)
        }
    }
})
