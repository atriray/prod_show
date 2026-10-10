import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  // 相对路径，支持任意子目录部署与本地直接打开
  base: './',
  plugins: [
    vue(),
    vueDevTools(),
    // JS/CSS 内联进 index.html，file:// 双击也能打开；
    // 不用插件推荐配置，避免图片/视频被 base64 进 HTML
    viteSingleFile({ useRecommendedBuildConfig: false }),
  ],
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // 关闭分包：否则 file:// 下动态 import 会被 CORS 拦截
        codeSplitting: false,
      },
    },
  },
  server: {
    // 启动开发服务器后自动打开浏览器
    open: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
