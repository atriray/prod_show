<script setup lang="ts">
import AppSidebar from './components/AppSidebar.vue'
</script>

<template>
  <div class="app">
    <AppSidebar />
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  min-width: 0;
  padding: 52px 60px 72px;
}

@media (max-width: 960px) {
  .app {
    flex-direction: column;
  }

  .app-main {
    padding: 28px 20px 56px;
  }
}
</style>
