import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json'
import svgLoader from 'vite-svg-loader'
import zipPack from "vite-plugin-zip-pack"

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd())
    
    return {
        plugins: [
            vue(),
            svgLoader(),
            zipPack({
                outDir: 'dist',
                outFileName: `${env.VITE_APP_CODE}-${process.env.npm_package_version}.zip`
            })
        ],
        base: "./",
        define: {
            __APP_VERSION__: JSON.stringify(pkg.version),
            __APP_NAME__: JSON.stringify(pkg.name)
        },
        server: {
            proxy: {
                "/sd/": {
                    target: env.VITE_APP_REAL_URL,
                    changeOrigin: true,
                    secure: false,
                    ws: true
                }
            }
        }
    }
})
