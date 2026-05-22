<script setup lang="ts">
import { ABSEN_TYPES, ABSEN_TYPE_ORDER } from '@/config/sheetsConfig'
import type { AbsenType } from '@/config/sheetsConfig'

defineProps<{
  filterDateStart: string
  filterDateEnd: string
  filterNama: string
  filterJenisAbsen: AbsenType[]
  uniqueNames: string[]
  totalFiltered: number
  totalRecords: number
}>()

const emit = defineEmits<{
  'update:filterDateStart': [value: string]
  'update:filterDateEnd': [value: string]
  'update:filterNama': [value: string]
  toggleAbsenFilter: [type: AbsenType]
  resetFilters: []
  exportCsv: []
}>()

const isFiltered = (type: AbsenType, activeFilters: AbsenType[]) => activeFilters.includes(type)
</script>

<template>
  <div class="filter-panel glass-card animate-fade-in-up stagger-2" id="filter-panel">
    <div class="filter-header">
      <div class="filter-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        <h3>Filter</h3>
        <span class="filter-count" v-if="totalFiltered !== totalRecords">
          {{ totalFiltered }} / {{ totalRecords }}
        </span>
      </div>
      <div class="filter-actions">
        <button class="btn btn-sm" @click="emit('resetFilters')" id="btn-reset-filter">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          Reset
        </button>
        <button class="btn btn-primary btn-sm" @click="emit('exportCsv')" id="btn-export-csv">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export CSV
        </button>
      </div>
    </div>

    <div class="filter-body">
      <!-- Date Range -->
      <div class="filter-group">
        <label class="filter-label">Tanggal Mulai</label>
        <input
          type="date"
          :value="filterDateStart"
          @input="emit('update:filterDateStart', ($event.target as HTMLInputElement).value)"
          id="filter-date-start"
        />
      </div>

      <div class="filter-group">
        <label class="filter-label">Tanggal Selesai</label>
        <input
          type="date"
          :value="filterDateEnd"
          @input="emit('update:filterDateEnd', ($event.target as HTMLInputElement).value)"
          id="filter-date-end"
        />
      </div>

      <!-- Nama Karyawan -->
      <div class="filter-group">
        <label class="filter-label">Nama Karyawan</label>
        <select
          :value="filterNama"
          @change="emit('update:filterNama', ($event.target as HTMLSelectElement).value)"
          id="filter-nama"
        >
          <option value="">Semua Karyawan</option>
          <option v-for="name in uniqueNames" :key="name" :value="name">{{ name }}</option>
        </select>
      </div>

      <!-- Jenis Absen Toggle Buttons -->
      <div class="filter-group filter-group-wide">
        <label class="filter-label">Jenis Absen</label>
        <div class="absen-toggles">
          <button
            v-for="type in ABSEN_TYPE_ORDER"
            :key="type"
            class="absen-toggle"
            :class="{
              active: isFiltered(type, filterJenisAbsen),
              [`toggle-${type.toLowerCase().replace(/\s+/g, '-')}`]: true,
            }"
            :style="{
              '--toggle-color': ABSEN_TYPES[type].color,
              '--toggle-bg': ABSEN_TYPES[type].bgColor,
            }"
            @click="emit('toggleAbsenFilter', type)"
          >
            <span class="toggle-icon">{{ ABSEN_TYPES[type].icon }}</span>
            {{ ABSEN_TYPES[type].label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-panel {
  padding: var(--space-lg);
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.filter-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--text-primary);
}

.filter-title h3 {
  font-size: var(--font-size-lg);
}

.filter-count {
  padding: 2px 10px;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: #fff;
}

.filter-actions {
  display: flex;
  gap: var(--space-sm);
}

.filter-body {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group-wide {
  grid-column: 1 / -1;
}

.filter-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.absen-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.absen-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-full);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-family);
}

.absen-toggle:hover {
  background: var(--toggle-bg);
  border-color: var(--toggle-color);
  color: var(--toggle-color);
}

.absen-toggle.active {
  background: var(--toggle-bg);
  border-color: var(--toggle-color);
  color: var(--toggle-color);
  font-weight: 600;
  box-shadow: 0 0 12px color-mix(in srgb, var(--toggle-color) 20%, transparent);
}

.toggle-icon {
  font-size: 14px;
}

@media (max-width: 768px) {
  .filter-body {
    grid-template-columns: 1fr;
  }

  .filter-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-actions {
    width: 100%;
  }

  .filter-actions .btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
