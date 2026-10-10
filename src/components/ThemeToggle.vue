<script setup lang="ts">
import { ref } from 'vue'

const isLight = ref(document.documentElement.dataset.theme === 'light')

function toggle() {
  isLight.value = !isLight.value
  const theme = isLight.value ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem('theme', theme)
  } catch {
    // 隐私模式下 localStorage 不可用，忽略即可
  }
}
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :title="isLight ? '切换到深色主题' : '切换到浅色主题'"
    :aria-label="isLight ? '切换到深色主题' : '切换到浅色主题'"
    @click="toggle"
  >
    <svg v-if="isLight" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 13.5A8 8 0 0 1 10.5 4 7 7 0 1 0 20 13.5z" />
    </svg>
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  appearance: none;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  cursor: pointer;
  border-radius: 9px;
  color: var(--text-dim);
  background: transparent;
  border: 1px solid var(--line-strong);
  transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.theme-toggle:hover {
  color: var(--accent);
  border-color: var(--accent-line);
  background: var(--accent-soft);
}

.theme-toggle svg {
  width: 17px;
  height: 17px;
}
</style>
