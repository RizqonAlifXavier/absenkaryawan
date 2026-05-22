<script setup lang="ts">
defineProps<{
  isLoading: boolean
  lastUpdated: Date | null
  isDemoMode: boolean
}>()

const emit = defineEmits<{
  refresh: []
}>()

function formatTime(date: Date | null): string {
  if (!date) return '-'
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
</script>

<template>
  <header class="dashboard-header">
    <div class="header-left">
      <div class="logo-group">
        <div class="logo-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <path d="M8 14h.01"/>
            <path d="M12 14h.01"/>
            <path d="M16 14h.01"/>
            <path d="M8 18h.01"/>
            <path d="M12 18h.01"/>
          </svg>
        </div>
        <div class="logo-text">
          <h1>Absensi Karyawan</h1>
          <p class="subtitle">Dashboard Monitoring</p>
        </div>
      </div>
    </div>

    <div class="header-right">
      <div v-if="isDemoMode" class="demo-badge">
        <span class="demo-dot"></span>
        Demo Mode
      </div>

      <div class="last-updated">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>Update: {{ formatTime(lastUpdated) }}</span>
      </div>

      <button
        class="btn refresh-btn"
        :class="{ 'is-loading': isLoading }"
        :disabled="isLoading"
        @click="emit('refresh')"
        id="btn-refresh"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          :class="{ 'animate-spin': isLoading }"
        >
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
        </svg>
        {{ isLoading ? 'Memuat...' : 'Refresh' }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg) var(--space-xl);
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  gap: var(--space-md);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.logo-group {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.logo-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-md);
  color: #fff;
  flex-shrink: 0;
}

.logo-text h1 {
  font-size: var(--font-size-xl);
  font-weight: 800;
  background: linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.subtitle {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.demo-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(255, 230, 109, 0.1);
  border: 1px solid rgba(255, 230, 109, 0.2);
  border-radius: var(--border-radius-full);
  color: var(--color-sakit);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.demo-dot {
  width: 6px;
  height: 6px;
  background: var(--color-sakit);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.last-updated {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  white-space: nowrap;
}

.refresh-btn {
  gap: 6px;
}

.refresh-btn.is-loading {
  opacity: 0.7;
  cursor: wait;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    padding: var(--space-md);
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .last-updated {
    display: none;
  }
}
</style>
