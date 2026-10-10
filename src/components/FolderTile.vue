<script setup lang="ts">
import type { FolderNode } from '../lib/collections'

const props = defineProps<{
  folder: FolderNode
  collectionName: string
  /** 当前所在文件夹的路径段 */
  path: string[]
}>()

function target() {
  return {
    name: 'collection',
    params: {
      name: props.collectionName,
      rest: [...props.path, props.folder.name],
    },
  }
}
</script>

<template>
  <RouterLink class="folder-tile" :to="target()" :title="folder.name">
    <span class="ft-tab" aria-hidden="true"></span>
    <span class="ft-body">
      <svg class="ft-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 7a2 2 0 0 1 2-2h4l2.2 2.5H19a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
        <path d="M3 10.5h18" />
      </svg>
      <strong>{{ folder.name }}</strong>
      <span class="ft-count">{{ folder.fileCount }} 个文件</span>
    </span>
  </RouterLink>
</template>

<style scoped>
.folder-tile {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding-top: 10px;
  text-decoration: none;
}

.ft-tab {
  position: absolute;
  top: 0;
  left: 14px;
  width: 42px;
  height: 12px;
  background: linear-gradient(180deg, var(--tab-hover-top), var(--tab-top));
  border: 1px solid var(--line-strong);
  border-bottom: none;
  border-radius: 6px 2px 0 0;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 100%, 0 100%);
}

.ft-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 100%;
  padding: 16px 12px;
  text-align: center;
  background: var(--tile-bg);
  border: 1px solid var(--line-strong);
  border-radius: 2px 12px 12px 12px;
  box-shadow: var(--tile-shadow);
  transition: border-color 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease;
}

.folder-tile:hover .ft-body {
  border-style: solid;
  border-color: var(--accent-line);
  background: color-mix(in srgb, var(--accent-soft) 55%, var(--tile-bg));
  box-shadow: var(--shadow-lift);
}

.ft-icon {
  width: 34px;
  height: 34px;
  color: var(--text-dim);
  transition: color 0.25s ease;
}

.folder-tile:hover .ft-icon {
  color: var(--accent);
}

.ft-body strong {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text);
}

.ft-count {
  font-size: 11.5px;
  letter-spacing: 0.03em;
  color: var(--text-faint);
  font-variant-numeric: tabular-nums;
}
</style>
