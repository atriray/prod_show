<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FolderTile from '../components/FolderTile.vue'
import MediaViewer from '../components/MediaViewer.vue'
import { getCollection, resolveFolder } from '../lib/collections'
import type { Entry, FolderNode, WorkItem, WorkType } from '../lib/collections'

type FilterKey = 'all' | WorkType

const route = useRoute()
const router = useRouter()

const collection = computed(() => getCollection(String(route.params.name)))
const pathSegments = computed(() => {
  const rest = route.params.rest
  const arr = Array.isArray(rest) ? rest : rest ? [rest] : []
  return arr.filter((s): s is string => Boolean(s))
})
const folder = computed(() => {
  const coll = collection.value
  if (!coll) return undefined
  return resolveFolder(coll, pathSegments.value)
})

if (!collection.value || !folder.value) {
  router.replace({ name: 'home' })
}

const filter = ref<FilterKey>('all')

/** 当前文件夹的直属文件（不含子文件夹内文件） */
const directFiles = computed(
  () => folder.value?.children.filter((c): c is WorkItem => c.type !== 'folder') ?? [],
)
const directFolders = computed(
  () => folder.value?.children.filter((c): c is FolderNode => c.type === 'folder') ?? [],
)

const counts = computed(() => ({
  // 「全部」计入直属文件夹（每个 +1），但不计入子文件夹内的内容
  all: directFiles.value.length + directFolders.value.length,
  image: directFiles.value.filter((w) => w.type === 'image').length,
  video: directFiles.value.filter((w) => w.type === 'video').length,
}))

const filteredFiles = computed(() =>
  filter.value === 'all'
    ? directFiles.value
    : directFiles.value.filter((w) => w.type === filter.value),
)

// 文件夹只在「全部」视图显示
const showFolders = computed(() => filter.value === 'all' && directFolders.value.length > 0)

const gridEntries = computed<Entry[]>(() =>
  showFolders.value ? [...directFolders.value, ...filteredFiles.value] : filteredFiles.value,
)

const emptyText = computed(() =>
  filter.value === 'all' ? '当前文件夹暂无文件' : '该类型下暂无文件，切换其他类型试试',
)

const filterOptions = computed(() => [
  { key: 'all' as FilterKey, label: '全部', count: counts.value.all },
  { key: 'image' as FilterKey, label: '图片', count: counts.value.image },
  { key: 'video' as FilterKey, label: '视频', count: counts.value.video },
])

const viewerIndex = ref<number | null>(null)

function goUp() {
  const coll = collection.value
  if (!coll) return
  const rest = pathSegments.value.slice(0, -1)
  router.push(
    rest.length
      ? { name: 'collection', params: { name: coll.name, rest } }
      : { name: 'collection', params: { name: coll.name } },
  )
}

watch(
  () => [route.params.name, route.params.rest],
  () => {
    filter.value = 'all'
    viewerIndex.value = null
  },
)
</script>

<template>
  <section v-if="collection && folder" class="collection">
    <header class="page-head collection-head">
      <div class="head-left">
        <nav class="crumbs" aria-label="所在位置">
          <button
            v-if="pathSegments.length"
            type="button"
            class="back-btn"
            title="返回上一级"
            @click="goUp"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="m14.5 5.5-7 6.5 7 6.5" />
            </svg>
          </button>
          <RouterLink to="/" class="crumb">首页</RouterLink>
          <span class="crumb-sep">/</span>
          <RouterLink
            v-if="pathSegments.length"
            class="crumb"
            :to="{ name: 'collection', params: { name: collection.name } }"
          >
            {{ collection.name }}
          </RouterLink>
          <span v-if="pathSegments.length" class="crumb-sep">/</span>
          <template v-for="(seg, i) in pathSegments" :key="i">
            <RouterLink
              v-if="i < pathSegments.length - 1"
              class="crumb"
              :to="{ name: 'collection', params: { name: collection.name, rest: pathSegments.slice(0, i + 1) } }"
            >
              {{ seg }}
            </RouterLink>
            <span v-else class="crumb current">{{ seg }}</span>
            <span v-if="i < pathSegments.length - 1" class="crumb-sep">/</span>
          </template>
          <span v-if="pathSegments.length === 0" class="crumb current">
            {{ folder.name }}
          </span>
        </nav>
        <h1 class="page-title">{{ folder.name }}</h1>
        <p class="page-sub">
          {{ directFiles.length }} 个文件
          <template v-if="directFolders.length"> · {{ directFolders.length }} 个文件夹</template>
        </p>
      </div>

      <div class="filter" role="group" aria-label="按类型筛选">
        <button
          v-for="opt in filterOptions"
          :key="opt.key"
          type="button"
          class="filter-btn"
          :class="{ on: filter === opt.key }"
          @click="filter = opt.key"
        >
          {{ opt.label }}
          <i>{{ opt.count }}</i>
        </button>
      </div>
    </header>

    <ul v-if="gridEntries.length" class="works-grid">
      <template
        v-for="(entry, i) in gridEntries"
        :key="entry.type === 'folder' ? `f:${entry.name}` : entry.url"
      >
        <li v-if="entry.type === 'folder'" class="work-tile" :style="{ '--i': i }">
          <FolderTile :folder="entry" :collection-name="collection.name" :path="pathSegments" />
        </li>
        <li v-else class="work-tile" :style="{ '--i': i }">
          <button type="button" class="tile-btn" :title="entry.name" @click="viewerIndex = i - (showFolders ? directFolders.length : 0)">
            <img v-if="entry.type === 'image'" :src="entry.url" :alt="entry.name" loading="lazy" />
            <video v-else :src="entry.url" preload="metadata" muted playsinline></video>
            <span v-if="entry.type === 'video'" class="tile-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 6.5v11l9-5.5-9-5.5z" />
              </svg>
            </span>
            <span class="tile-name">{{ entry.name }}</span>
          </button>
        </li>
      </template>
    </ul>

    <div v-else class="empty-state">
      <h2>暂无文件</h2>
      <p>{{ emptyText }}。</p>
    </div>

    <Transition name="viewer">
      <MediaViewer
        v-if="viewerIndex !== null"
        :works="filteredFiles"
        :index="viewerIndex"
        @close="viewerIndex = null"
        @update="(i: number) => (viewerIndex = i)"
      />
    </Transition>
  </section>
</template>

<style scoped>
.collection-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

/* 面包屑与返回 */
.crumbs {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 12px;
  min-height: 28px;
  font-size: 12px;
  letter-spacing: 0.04em;
}

.back-btn {
  appearance: none;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  padding: 0;
  margin-right: 2px;
  cursor: pointer;
  border-radius: 8px;
  color: var(--text-dim);
  background: var(--wash);
  border: 1px solid var(--line-strong);
  transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.back-btn:hover {
  color: var(--accent);
  border-color: var(--accent-line);
  background: var(--accent-soft);
}

.back-btn svg {
  width: 14px;
  height: 14px;
}

.crumb {
  color: var(--text-dim);
  text-decoration: none;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s ease;
}

a.crumb:hover {
  color: var(--accent);
}

.crumb.current {
  color: var(--text);
}

.crumb-sep {
  color: var(--text-faint);
  opacity: 0.6;
}

.filter {
  display: flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--line-strong);
  border-radius: 11px;
  background: var(--inset-bg);
}

.filter-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  letter-spacing: 0.04em;
  color: var(--text-dim);
  background: transparent;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.filter-btn i {
  font-style: normal;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--text-faint);
  transition: color 0.2s ease;
}

.filter-btn:hover {
  color: var(--text);
}

.filter-btn.on {
  color: var(--accent-contrast);
  background: var(--accent);
}

.filter-btn.on i {
  color: color-mix(in srgb, var(--accent-contrast) 66%, transparent);
}

.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(196px, 1fr));
  gap: 16px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.work-tile {
  animation: rise-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 45ms);
}

.tile-btn {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  padding: 0;
  overflow: hidden;
  cursor: zoom-in;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--bg-deep);
}

.tile-btn img,
.tile-btn video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.tile-btn:hover img,
.tile-btn:hover video {
  transform: scale(1.05);
}

.tile-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 55%, rgba(12, 11, 10, 0.6));
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.tile-btn:hover::after {
  opacity: 1;
}

.tile-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  transform: translate(-50%, -50%);
  border-radius: 99px;
  color: var(--on-media);
  background: rgba(12, 11, 10, 0.5);
  border: 1px solid rgba(236, 231, 222, 0.22);
  backdrop-filter: blur(6px);
  transition: transform 0.25s ease, background-color 0.25s ease;
}

.tile-badge svg {
  width: 20px;
  height: 20px;
  margin-left: 2px;
}

.tile-btn:hover .tile-badge {
  transform: translate(-50%, -50%) scale(1.08);
  background: rgba(229, 164, 76, 0.85);
  color: #171410;
}

.tile-name {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 9px;
  z-index: 1;
  font-size: 12px;
  letter-spacing: 0.02em;
  color: var(--on-media);
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.25s ease, transform 0.25s ease;
  pointer-events: none;
}

.tile-btn:hover .tile-name {
  opacity: 1;
  transform: translateY(0);
}

.empty-state {
  margin-top: 6vh;
  padding: 52px 24px;
  text-align: center;
  color: var(--text-dim);
  border: 1px dashed var(--line-strong);
  border-radius: 16px;
  background: var(--wash-weak);
}

.empty-state h2 {
  margin: 0 0 8px;
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
}

.empty-state p {
  margin: 0;
  font-size: 13px;
}

.viewer-enter-active,
.viewer-leave-active {
  transition: opacity 0.22s ease;
}

.viewer-enter-from,
.viewer-leave-to {
  opacity: 0;
}

@media (max-width: 720px) {
  .crumbs .crumb {
    max-width: 110px;
  }
}
</style>
