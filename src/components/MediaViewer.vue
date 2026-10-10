<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { WorkItem } from '../lib/collections'

const props = defineProps<{
  /** 当前展示的作品列表（与筛选后的网格一致） */
  works: WorkItem[]
  index: number
}>()

const emit = defineEmits<{
  close: []
  update: [index: number]
}>()

const zoomed = ref(false)
const current = computed(() => props.works[props.index])
const serial = computed(() => String(props.index + 1).padStart(2, '0'))
const total = computed(() => String(props.works.length).padStart(2, '0'))

function prev() {
  emit('update', (props.index - 1 + props.works.length) % props.works.length)
}

function next() {
  emit('update', (props.index + 1) % props.works.length)
}

function onVideoReady(e: Event) {
  // 点击进入查看器属于用户手势，绝大多数浏览器允许此时播放
  void (e.target as HTMLVideoElement).play().catch(() => {})
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
  else if (e.key === 'ArrowLeft') prev()
  else if (e.key === 'ArrowRight') next()
}

watch(
  () => props.index,
  () => {
    zoomed.value = false
  },
)

onMounted(() => {
  window.addEventListener('keydown', onKey)
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div v-if="current" class="viewer" @click.self="emit('close')">
    <header class="viewer-top">
      <span class="viewer-counter">{{ serial }} <em>/</em> {{ total }}</span>
      <button type="button" class="viewer-close" title="关闭 (Esc)" @click="emit('close')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>
    </header>

    <button
      v-if="works.length > 1"
      type="button"
      class="viewer-arrow prev"
      title="上一件 (←)"
      @click="prev"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="m14.5 5.5-7 6.5 7 6.5" />
      </svg>
    </button>
    <button
      v-if="works.length > 1"
      type="button"
      class="viewer-arrow next"
      title="下一件 (→)"
      @click="next"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="m9.5 5.5 7 6.5-7 6.5" />
      </svg>
    </button>

    <figure class="viewer-stage" @click.self="emit('close')">
      <img
        v-if="current.type === 'image'"
        :key="current.url"
        :src="current.url"
        :alt="current.name"
        class="viewer-media"
        :class="{ zoomed }"
        @click="zoomed = !zoomed"
      />
      <video
        v-else
        :key="current.url"
        :src="current.url"
        class="viewer-media"
        controls
        playsinline
        @loadedmetadata="onVideoReady"
        @click.stop
      ></video>
      <figcaption class="viewer-caption">{{ current.name }}</figcaption>
    </figure>
  </div>
</template>

<style scoped>
.viewer {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--viewer-bg);
  backdrop-filter: blur(14px);
}

.viewer-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
}

.viewer-counter {
  font-family: var(--font-serif);
  font-size: 14px;
  letter-spacing: 0.14em;
  font-variant-numeric: tabular-nums;
  color: var(--text-dim);
}

.viewer-counter em {
  font-style: normal;
  color: var(--text-faint);
  margin: 0 2px;
}

.viewer-close,
.viewer-arrow {
  appearance: none;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  cursor: pointer;
  border-radius: 99px;
  color: var(--text-dim);
  background: var(--wash);
  border: 1px solid var(--line-strong);
  transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.viewer-close:hover,
.viewer-arrow:hover {
  color: var(--text);
  border-color: var(--accent-line);
  background: var(--accent-soft);
}

.viewer-close svg,
.viewer-arrow svg {
  width: 20px;
  height: 20px;
}

.viewer-arrow {
  position: absolute;
  top: 50%;
  z-index: 3;
  transform: translateY(-50%);
}

.viewer-arrow.prev {
  left: 22px;
}

.viewer-arrow.next {
  right: 22px;
}

.viewer-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin: 0;
  max-width: 100%;
}

.viewer-media {
  display: block;
  max-width: min(86vw, 1500px);
  max-height: 80vh;
  border-radius: 6px;
  box-shadow: var(--shadow-media);
}

img.viewer-media {
  object-fit: contain;
  cursor: zoom-in;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

img.viewer-media.zoomed {
  transform: scale(1.7);
  cursor: zoom-out;
}

video.viewer-media {
  max-width: min(86vw, 1200px);
  background: #000;
}

.viewer-caption {
  font-size: 12.5px;
  letter-spacing: 0.05em;
  color: var(--text-faint);
  max-width: 70vw;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 720px) {
  .viewer-arrow.prev {
    left: 10px;
  }

  .viewer-arrow.next {
    right: 10px;
  }

  .viewer-media,
  img.viewer-media.zoomed {
    max-width: 92vw;
    max-height: 74vh;
  }
}
</style>
