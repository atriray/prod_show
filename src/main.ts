import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initCollections } from './lib/collections'

// 先初始化作品集数据（生产环境尝试加载 prod-manifest.json），再挂载应用
async function bootstrap(): Promise<void> {
  await initCollections()
  createApp(App).use(router).mount('#app')
}

void bootstrap()
