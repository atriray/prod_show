<script setup lang="ts">
import FolderCard from '../components/FolderCard.vue'
import { collections, totalWorks } from '../lib/collections'
</script>

<template>
  <section class="home">
    <header class="page-head">
      <p class="page-eyebrow">Portfolio</p>
      <h1 class="page-title">首页</h1>
      <p class="page-sub">
        {{ collections.length }} 个作品集 · {{ totalWorks }} 个文件
      </p>
    </header>

    <div v-if="collections.length" class="folder-grid">
      <div
        v-for="(c, i) in collections"
        :key="c.name"
        class="grid-cell"
        :style="{ '--i': i }"
      >
        <FolderCard :collection="c" />
      </div>
    </div>

    <div v-else class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 7a2 2 0 0 1 2-2h4l2.2 2.5H19a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
        <path d="M3 10.5h18" />
      </svg>
      <h2>暂无作品集</h2>
      <p>
        将包含图片或视频的文件夹放入项目根目录的 <code>prod</code> 文件夹中，
        每个文件夹即一个作品集，刷新页面后自动收录。
      </p>
    </div>
  </section>
</template>

<style scoped>
.folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(228px, 1fr));
  gap: 26px 22px;
}

.grid-cell {
  animation: rise-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 70ms);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 9vh;
  padding: 56px 28px;
  text-align: center;
  color: var(--text-dim);
  border: 1px dashed var(--line-strong);
  border-radius: 16px;
  background: var(--wash-weak);
}

.empty-state svg {
  width: 44px;
  height: 44px;
  color: var(--text-faint);
}

.empty-state h2 {
  font-family: var(--font-serif);
  font-size: 19px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--text);
  margin: 4px 0 0;
}

.empty-state p {
  max-width: 400px;
  margin: 0;
  font-size: 13px;
  line-height: 1.8;
}

.empty-state code {
  padding: 1px 7px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--accent);
  background: var(--accent-soft);
  border: 1px solid var(--accent-line);
}
</style>
