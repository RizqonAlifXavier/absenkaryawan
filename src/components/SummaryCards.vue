<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { AttendanceStats } from '@/composables/useAttendance'
import { ABSEN_TYPES, ABSEN_TYPE_ORDER } from '@/config/sheetsConfig'

const props = defineProps<{
  stats: AttendanceStats
  isLoading: boolean
}>()

// Animated counters
const displayValues = ref({
  telat: 0,
  izin: 0,
  sakit: 0,
  tanpaKeterangan: 0,
  total: 0,
})

function animateValue(key: keyof typeof displayValues.value, target: number, duration = 600) {
  const start = displayValues.value[key]
  const diff = target - start
  if (diff === 0) return

  const startTime = performance.now()
  function step(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3)
    displayValues.value[key] = Math.round(start + diff * eased)
    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }
  requestAnimationFrame(step)
}

watch(
  () => props.stats,
  (newStats) => {
    animateValue('telat', newStats.telat)
    animateValue('izin', newStats.izin)
    animateValue('sakit', newStats.sakit)
    animateValue('tanpaKeterangan', newStats.tanpaKeterangan)
    animateValue('total', newStats.total)
  },
  { deep: true },
)

onMounted(() => {
  displayValues.value = {
    telat: props.stats.telat,
    izin: props.stats.izin,
    sakit: props.stats.sakit,
    tanpaKeterangan: props.stats.tanpaKeterangan,
    total: props.stats.total,
  }
})

const cardMap: { key: keyof typeof displayValues.value; type: (typeof ABSEN_TYPE_ORDER)[number] }[] = [
  { key: 'telat', type: 'Telat' },
  { key: 'izin', type: 'Izin' },
  { key: 'sakit', type: 'Sakit' },
  { key: 'tanpaKeterangan', type: 'Tanpa Keterangan' },
]

function getGradientVar(type: string): string {
  const map: Record<string, string> = {
    Telat: 'var(--gradient-telat)',
    Izin: 'var(--gradient-izin)',
    Sakit: 'var(--gradient-sakit)',
    'Tanpa Keterangan': 'var(--gradient-tanpa-keterangan)',
  }
  return map[type] || 'var(--gradient-primary)'
}

function getGlowVar(type: string): string {
  const map: Record<string, string> = {
    Telat: 'var(--shadow-glow-telat)',
    Izin: 'var(--shadow-glow-izin)',
    Sakit: 'var(--shadow-glow-sakit)',
    'Tanpa Keterangan': 'var(--shadow-glow-tanpa-keterangan)',
  }
  return map[type] || 'none'
}
</script>

<template>
  <div class="summary-section">
    <!-- Total Card -->
    <div class="summary-card total-card animate-fade-in-up" id="card-total">
      <div class="card-inner">
        <div class="card-icon total-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="card-content">
          <span class="card-label">Total Record</span>
          <span class="card-value" v-if="!isLoading">{{ displayValues.total }}</span>
          <span class="card-value skeleton-value" v-else>&nbsp;</span>
        </div>
      </div>
      <div class="card-bar" style="background: var(--gradient-primary)"></div>
    </div>

    <!-- Per-type Cards -->
    <div
      v-for="(card, index) in cardMap"
      :key="card.type"
      class="summary-card animate-fade-in-up"
      :class="`stagger-${index + 1}`"
      :id="`card-${card.key}`"
      :style="{
        '--card-glow': getGlowVar(card.type),
      }"
    >
      <div class="card-inner">
        <div
          class="card-icon"
          :style="{ background: ABSEN_TYPES[card.type].bgColor }"
        >
          <span class="icon-emoji">{{ ABSEN_TYPES[card.type].icon }}</span>
        </div>
        <div class="card-content">
          <span class="card-label">{{ ABSEN_TYPES[card.type].label }}</span>
          <span
            class="card-value"
            :style="{ color: ABSEN_TYPES[card.type].color }"
            v-if="!isLoading"
          >
            {{ displayValues[card.key] }}
          </span>
          <span class="card-value skeleton-value" v-else>&nbsp;</span>
        </div>
      </div>
      <div class="card-bar" :style="{ background: getGradientVar(card.type) }"></div>
    </div>
  </div>
</template>

<style scoped>
.summary-section {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-md);
}

.summary-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: all var(--transition-base);
  opacity: 0;
  position: relative;
}

.summary-card:hover {
  border-color: var(--border-color-hover);
  box-shadow: var(--card-glow, var(--shadow-md));
  transform: translateY(-2px);
}

.card-inner {
  padding: var(--space-md) var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.card-icon {
  width: 42px;
  height: 42px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.total-icon {
  background: rgba(102, 126, 234, 0.12);
  color: #667eea;
}

.icon-emoji {
  font-size: 20px;
  line-height: 1;
}

.card-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.card-label {
  font-size: 10px;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-value {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.total-card .card-value {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.skeleton-value {
  width: 48px;
  height: 36px;
  display: inline-block;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 25%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.04) 75%
  );
  background-size: 200px 100%;
  animation: shimmer 1.5s ease infinite;
  border-radius: 6px;
}

.card-bar {
  height: 3px;
  width: 100%;
}

.total-card {
  box-shadow: 0 0 30px rgba(102, 126, 234, 0.1);
}

@media (max-width: 1200px) {
  .summary-section {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .summary-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .total-card {
    grid-column: 1 / -1;
  }

  .card-inner {
    padding: var(--space-md);
  }

  .card-value {
    font-size: var(--font-size-xl);
  }
}

@media (max-width: 480px) {
  .summary-section {
    grid-template-columns: 1fr;
  }
}
</style>
