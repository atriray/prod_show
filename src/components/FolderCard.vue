<script setup lang="ts">
import { computed } from 'vue'
import { countFiles, getCover } from '../lib/collections'
import type { Collection } from '../lib/collections'

const props = defineProps<{ collection: Collection }>()

const cover = computed(() => getCover(props.collection))
const imageCount = computed(() => countFiles(props.collection, 'image'))
const videoCount = computed(() => countFiles(props.collection, 'video'))
</script>

<template>
  <RouterLink
    :to="{ name: 'collection', params: { name: collection.name } }"
    class="folder"
  >
    <span class="folder-tab" aria-hidden="true"></span>
    <span class="folder-body">
      <span class="folder-preview">
        <img
          v-if="cover && cover.type === 'image'"
          :src="cover.url"
          :alt="collection.name"
          loading="lazy"
        />
        <video
          v-else-if="cover"
          :src="cover.url"
          preload="metadata"
          muted
          playsinline
        ></video>
        <span class="folder-count">{{ collection.fileCount }} 个文件</span>
      </span>
      <span class="folder-meta">
        <strong>{{ collection.name }}</strong>
        <span class="folder-sub">{{ imageCount }} 图 · {{ videoCount }} 视频</span>
      </span>
    </span>
  </RouterLink>
</template>

<style scoped>
.folder {
  position: relative;
  display: block;
  padding-top: 13px;
  text-decoration: none;
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.folder:hover {
  transform: translateY(-5px);
}

/* 文件夹的凸舌 */
.folder-tab {
  position: absolute;
  top: 0;
  left: 0;
  width: 56px;
  height: 15px;
  background: linear-gradient(180deg, var(--tab-top), var(--panel));
  border: 1px solid var(--line-strong);
  border-bottom: none;
  border-radius: 7px 3px 0 0;
  clip-path: polygon(0 0, calc(100% - 11px) 0, 100% 100%, 0 100%);
  transition: background-color 0.28s ease;
}

.folder:hover .folder-tab {
  background: linear-gradient(180deg, var(--tab-hover-top), var(--tab-top));
}

.folder-body {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--panel);
  border: 1px solid var(--line-strong);
  border-radius: 3px 14px 14px 14px;
  transition: border-color 0.28s ease, box-shadow 0.28s ease;
}

.folder:hover .folder-body {
  border-color: var(--accent-line);
  box-shadow: var(--shadow-lift);
}

.folder-preview {
  position: relative;
  display: block;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--bg-deep);
}

.folder-preview img,
.folder-preview video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.folder:hover .folder-preview img,
.folder:hover .folder-preview video {
  transform: scale(1.045);
}

.folder-preview::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 62%, rgba(12, 11, 10, 0.55));
  pointer-events: none;
}

.folder-count {
  position: absolute;
  right: 10px;
  bottom: 8px;
  z-index: 1;
  padding: 2px 9px;
  border-radius: 99px;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  color: var(--on-media);
  background: var(--chip-bg);
  border: 1px solid rgba(236, 231, 222, 0.14);
  backdrop-filter: blur(6px);
}

.folder-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 13px 15px 14px;
}

.folder-meta strong {
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-sub {
  font-size: 12px;
  letter-spacing: 0.03em;
  color: var(--text-faint);
  font-variant-numeric: tabular-nums;
}
</style>
