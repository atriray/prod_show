<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'
import { collections, totalWorks } from '../lib/collections'

const route = useRoute()

const isHome = computed(() => route.name === 'home')
const activeName = computed(() =>
  route.name === 'collection' ? String(route.params.name) : '',
)
</script>

<template>
  <aside class="sidebar">
    <RouterLink to="/" class="brand">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 7a2 2 0 0 1 2-2h4l2.2 2.5H19a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
          <path d="M3 10.5h18" />
        </svg>
      </span>
      <span class="brand-text">
        <strong>作品集</strong>
        <em>Personal Archive</em>
      </span>
    </RouterLink>

    <nav class="side-nav">
      <RouterLink to="/" class="nav-item nav-home" :class="{ active: isHome }">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-8.5z" />
          <path d="M9.5 20.5v-6h5v6" />
        </svg>
        <span>首页</span>
      </RouterLink>

      <p class="nav-label">
        作品集
        <span class="nav-label-count">{{ collections.length }}</span>
      </p>

      <div class="nav-list">
        <RouterLink
          v-for="c in collections"
          :key="c.name"
          :to="{ name: 'collection', params: { name: c.name } }"
          class="nav-item"
          :class="{ active: activeName === c.name }"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7a2 2 0 0 1 2-2h4l2.2 2.5H19a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
          </svg>
          <span class="nav-name">{{ c.name }}</span>
          <span class="nav-count">{{ c.fileCount }}</span>
        </RouterLink>

        <p v-if="collections.length === 0" class="nav-empty">
          prod 目录中暂无作品集
        </p>
      </div>
    </nav>

    <footer class="side-foot">
      <span class="foot-label">共 {{ totalWorks }} 个文件</span>
      <span class="foot-dot" aria-hidden="true"></span>
      <span class="foot-label">{{ new Date().getFullYear() }}</span>
      <ThemeToggle class="foot-toggle" />
    </footer>
  </aside>
</template>

<style scoped>
.sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  width: 252px;
  height: 100vh;
  flex-shrink: 0;
  padding: 24px 14px 18px;
  background: var(--bg-soft);
  border-right: 1px solid var(--line);
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 4px 10px 20px;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  color: var(--accent);
  background: var(--accent-soft);
  border: 1px solid var(--accent-line);
}

.brand-mark svg {
  width: 21px;
  height: 21px;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.brand-text strong {
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--text);
}

.brand-text em {
  font-style: normal;
  font-size: 10.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-faint);
}

.side-nav {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 9px;
  font-size: 13.5px;
  color: var(--text-dim);
  text-decoration: none;
  border: 1px solid transparent;
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.nav-item:hover {
  color: var(--text);
  background: var(--wash);
}

.nav-item.active {
  color: var(--text);
  background: var(--accent-soft);
  border-color: var(--accent-line);
}

.nav-icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  color: currentColor;
  opacity: 0.85;
}

.nav-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-count {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--text-faint);
  background: var(--wash);
  border-radius: 99px;
  padding: 1px 7px;
}

.nav-item.active .nav-count {
  color: var(--accent);
  background: transparent;
}

.nav-label {
  margin: 18px 0 6px;
  padding: 0 12px;
  font-size: 10.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--text-faint);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-label-count {
  letter-spacing: 0;
  font-variant-numeric: tabular-nums;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-empty {
  margin: 8px 12px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-faint);
}

.side-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 12px 2px;
  border-top: 1px solid var(--line);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--text-faint);
}

.foot-toggle {
  margin-left: auto;
}

.foot-dot {
  width: 3px;
  height: 3px;
  border-radius: 99px;
  background: var(--accent);
}

@media (max-width: 960px) {
  .sidebar {
    position: sticky;
    top: 0;
    z-index: 30;
    width: 100%;
    height: auto;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-right: none;
    border-bottom: 1px solid var(--line);
    background: color-mix(in srgb, var(--bg-soft) 88%, transparent);
    backdrop-filter: blur(12px);
  }

  .brand {
    padding: 0 6px 0 0;
  }

  .brand-mark {
    display: none;
  }

  .brand-text em {
    display: none;
  }

  .side-nav {
    flex-direction: row;
    align-items: center;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
  }

  .side-nav::-webkit-scrollbar {
    display: none;
  }

  .nav-label,
  .nav-count {
    display: none;
  }

  .side-foot {
    margin-left: auto;
    padding: 0;
    border-top: none;
  }

  .foot-label,
  .foot-dot {
    display: none;
  }

  .nav-list {
    flex-direction: row;
    gap: 6px;
  }

  .nav-item {
    white-space: nowrap;
    padding: 7px 12px;
  }

  .nav-empty {
    margin: 0;
    white-space: nowrap;
  }
}
</style>
