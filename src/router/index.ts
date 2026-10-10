import { createRouter, createWebHashHistory } from 'vue-router'

/**
 * 使用 hash 模式：纯静态部署时无需服务器端回退配置即可直接访问。
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      // :rest 匹配作品集内的多级子文件夹，如 /collection/风景摄影/草稿/旧版
      path: '/collection/:name/:rest(.*)*',
      name: 'collection',
      component: () => import('../views/CollectionView.vue'),
    },
    { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
