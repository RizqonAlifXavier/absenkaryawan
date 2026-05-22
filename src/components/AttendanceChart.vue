<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ABSEN_TYPES, ABSEN_TYPE_ORDER } from '@/config/sheetsConfig'

const props = defineProps<{
  chartData: { type: string; count: number }[]
  dailyTrend: { date: string; count: number }[]
}>()

const donutCanvas = ref<HTMLCanvasElement | null>(null)
const barCanvas = ref<HTMLCanvasElement | null>(null)
const activeTab = ref<'donut' | 'trend'>('donut')

function getColor(type: string): string {
  return (ABSEN_TYPES as Record<string, { color: string }>)[type]?.color || '#666'
}

// =============================================
// Donut Chart
// =============================================
function drawDonut() {
  const canvas = donutCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)

  const width = rect.width
  const height = rect.height
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 2 - 30
  const innerRadius = radius * 0.6
  const total = props.chartData.reduce((sum, d) => sum + d.count, 0)

  ctx.clearRect(0, 0, width, height)

  if (total === 0) {
    // Empty state ring
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2, true)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
    ctx.fill()

    ctx.fillStyle = '#64748b'
    ctx.font = '500 14px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Tidak ada data', centerX, centerY)
    return
  }

  let startAngle = -Math.PI / 2
  const gap = 0.03

  props.chartData.forEach((data) => {
    if (data.count === 0) return

    const sliceAngle = (data.count / total) * Math.PI * 2 - gap
    const color = getColor(data.type)

    // Draw arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
    ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true)
    ctx.closePath()

    // Gradient fill
    const grad = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, radius)
    grad.addColorStop(0, color + '99')
    grad.addColorStop(1, color)
    ctx.fillStyle = grad
    ctx.fill()

    // Subtle shadow
    ctx.shadowColor = color + '40'
    ctx.shadowBlur = 10
    ctx.fill()
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0

    startAngle += sliceAngle + gap
  })

  // Center text
  ctx.fillStyle = '#1e293b'
  ctx.font = '800 28px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(total.toString(), centerX, centerY - 8)

  ctx.fillStyle = '#64748b'
  ctx.font = '500 11px Inter, sans-serif'
  ctx.fillText('TOTAL', centerX, centerY + 14)
}

// =============================================
// Bar Chart (Daily Trend)
// =============================================
function drawBarChart() {
  const canvas = barCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)

  const width = rect.width
  const height = rect.height
  const padding = { top: 20, right: 20, bottom: 40, left: 20 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  ctx.clearRect(0, 0, width, height)

  const data = props.dailyTrend
  const maxVal = Math.max(...data.map((d) => d.count), 1)
  const barWidth = Math.min(chartWidth / data.length - 8, 40)

  data.forEach((d, i) => {
    const x = padding.left + (chartWidth / data.length) * i + (chartWidth / data.length - barWidth) / 2
    const barHeight = (d.count / maxVal) * chartHeight
    const y = padding.top + chartHeight - barHeight

    // Bar gradient
    const grad = ctx.createLinearGradient(x, y, x, y + barHeight)
    grad.addColorStop(0, '#667eea')
    grad.addColorStop(1, '#764ba2')

    // Bar shadow
    ctx.fillStyle = 'rgba(102, 126, 234, 0.1)'
    ctx.beginPath()
    ctx.roundRect(x, padding.top, barWidth, chartHeight, [4, 4, 4, 4])
    ctx.fill()

    // Bar
    if (barHeight > 0) {
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0])
      ctx.fill()

      // Value on top
      ctx.fillStyle = '#1e293b'
      ctx.font = '600 11px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(d.count.toString(), x + barWidth / 2, y - 4)
    }

    // Date label
    const dateObj = new Date(d.date + 'T00:00:00')
    const dayLabel = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })

    ctx.fillStyle = '#64748b'
    ctx.font = '500 10px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(dayLabel, x + barWidth / 2, padding.top + chartHeight + 8)
  })
}

function redraw() {
  nextTick(() => {
    if (activeTab.value === 'donut') {
      drawDonut()
    } else {
      drawBarChart()
    }
  })
}

watch(() => props.chartData, redraw, { deep: true })
watch(() => props.dailyTrend, redraw, { deep: true })
watch(activeTab, redraw)

onMounted(() => {
  redraw()
  window.addEventListener('resize', redraw)
})

onUnmounted(() => {
  window.removeEventListener('resize', redraw)
})
</script>

<template>
  <div class="chart-container glass-card animate-fade-in-up stagger-3" id="chart-section">
    <div class="chart-header">
      <h3>Statistik</h3>
      <div class="chart-tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'donut' }"
          @click="activeTab = 'donut'"
        >
          Distribusi
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'trend' }"
          @click="activeTab = 'trend'"
        >
          Trend 7 Hari
        </button>
      </div>
    </div>

    <div class="chart-body">
      <div v-show="activeTab === 'donut'" class="chart-content">
        <canvas ref="donutCanvas" class="chart-canvas"></canvas>
        <div class="chart-legend">
          <div
            v-for="data in chartData"
            :key="data.type"
            class="legend-item"
          >
            <span class="legend-dot" :style="{ background: getColor(data.type) }"></span>
            <span class="legend-label">{{ data.type }}</span>
            <span class="legend-value">{{ data.count }}</span>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'trend'" class="chart-content trend-content">
        <canvas ref="barCanvas" class="chart-canvas bar-canvas"></canvas>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  min-height: 380px;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.chart-header h3 {
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.chart-tabs {
  display: flex;
  background: var(--bg-glass);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.tab-btn {
  padding: 6px 16px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn.active {
  background: var(--gradient-primary);
  color: #fff;
}

.tab-btn:hover:not(.active) {
  color: var(--text-primary);
  background: var(--bg-glass-hover);
}

.chart-body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.chart-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.trend-content {
  flex-direction: column;
}

.chart-canvas {
  width: 220px;
  height: 220px;
  flex-shrink: 0;
}

.bar-canvas {
  width: 100%;
  height: 240px;
}

.chart-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 8px 12px;
  border-radius: var(--border-radius-sm);
  transition: background var(--transition-fast);
}

.legend-item:hover {
  background: var(--bg-glass);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.legend-value {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .chart-content {
    flex-direction: column;
  }

  .chart-canvas {
    width: 180px;
    height: 180px;
  }

  .chart-legend {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
