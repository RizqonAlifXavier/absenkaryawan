<script setup lang="ts">
import { ABSEN_TYPES } from '@/config/sheetsConfig'
import type { AbsenType } from '@/config/sheetsConfig'
import type { AttendanceRecord } from '@/services/sheetsService'

defineProps<{
  records: AttendanceRecord[]
  currentPage: number
  totalPages: number
  sortColumn: keyof AttendanceRecord
  sortDirection: 'asc' | 'desc'
  searchQuery: string
  isLoading: boolean
}>()

const emit = defineEmits<{
  setSort: [column: keyof AttendanceRecord]
  setPage: [page: number]
  'update:searchQuery': [value: string]
}>()

function getBadgeClass(type: AbsenType): string {
  const map: Record<string, string> = {
    Telat: 'badge-telat',
    Izin: 'badge-izin',
    Sakit: 'badge-sakit',
    'Tanpa Keterangan': 'badge-tanpa-keterangan',
  }
  return map[type] || ''
}

function getIcon(type: AbsenType): string {
  return ABSEN_TYPES[type]?.icon || '❓'
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function getSortIcon(column: keyof AttendanceRecord, sortCol: keyof AttendanceRecord, sortDir: string): string {
  if (column !== sortCol) return '↕'
  return sortDir === 'asc' ? '↑' : '↓'
}

function getPageRange(current: number, total: number): number[] {
  const range: number[] = []
  const delta = 2
  const start = Math.max(1, current - delta)
  const end = Math.min(total, current + delta)

  if (start > 1) {
    range.push(1)
    if (start > 2) range.push(-1) // ellipsis
  }

  for (let i = start; i <= end; i++) {
    range.push(i)
  }

  if (end < total) {
    if (end < total - 1) range.push(-1) // ellipsis
    range.push(total)
  }

  return range
}
</script>

<template>
  <div class="table-container glass-card animate-fade-in-up stagger-4" id="attendance-table">
    <!-- Table Header -->
    <div class="table-header">
      <div class="table-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18"/>
        </svg>
        <h3>Data Absensi</h3>
        <span class="record-count">{{ records.length }} record</span>
      </div>
      <div class="table-search">
        <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="search"
          placeholder="Cari nama, jenis, keterangan..."
          :value="searchQuery"
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          id="table-search-input"
        />
      </div>
    </div>

    <!-- Table Body -->
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th class="th-no">#</th>
            <th class="th-sortable" @click="emit('setSort', 'namaKaryawan')">
              Nama Karyawan
              <span class="sort-icon">{{ getSortIcon('namaKaryawan', sortColumn, sortDirection) }}</span>
            </th>
            <th class="th-sortable" @click="emit('setSort', 'tanggal')">
              Tanggal
              <span class="sort-icon">{{ getSortIcon('tanggal', sortColumn, sortDirection) }}</span>
            </th>
            <th class="th-sortable" @click="emit('setSort', 'jenisAbsen')">
              Jenis Absen
              <span class="sort-icon">{{ getSortIcon('jenisAbsen', sortColumn, sortDirection) }}</span>
            </th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading State -->
          <template v-if="isLoading && records.length === 0">
            <tr v-for="i in 5" :key="`skel-${i}`" class="skeleton-row">
              <td><div class="skeleton" style="width: 24px; height: 16px;"></div></td>
              <td><div class="skeleton" style="width: 140px; height: 16px;"></div></td>
              <td><div class="skeleton" style="width: 120px; height: 16px;"></div></td>
              <td><div class="skeleton" style="width: 100px; height: 24px; border-radius: 12px;"></div></td>
              <td><div class="skeleton" style="width: 160px; height: 16px;"></div></td>
            </tr>
          </template>

          <!-- Empty State -->
          <tr v-else-if="records.length === 0" class="empty-row">
            <td colspan="5">
              <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p class="empty-title">Tidak ada data ditemukan</p>
                <p class="empty-desc">Coba ubah filter atau kata kunci pencarian</p>
              </div>
            </td>
          </tr>

          <!-- Data Rows -->
          <tr
            v-for="(record, index) in records"
            :key="record.id"
            class="data-row"
          >
            <td class="td-no">{{ (currentPage - 1) * 15 + index + 1 }}</td>
            <td class="td-nama">
              <div class="nama-cell">
                <div class="avatar">{{ record.namaKaryawan.charAt(0).toUpperCase() }}</div>
                <span>{{ record.namaKaryawan }}</span>
              </div>
            </td>
            <td class="td-tanggal">{{ formatDate(record.tanggal) }}</td>
            <td class="td-jenis">
              <span class="badge" :class="getBadgeClass(record.jenisAbsen)">
                {{ getIcon(record.jenisAbsen) }} {{ record.jenisAbsen }}
              </span>
            </td>
            <td class="td-keterangan">{{ record.keterangan }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button
        class="page-btn"
        :disabled="currentPage <= 1"
        @click="emit('setPage', currentPage - 1)"
        id="btn-prev-page"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      <template v-for="page in getPageRange(currentPage, totalPages)" :key="page">
        <span v-if="page === -1" class="page-ellipsis">···</span>
        <button
          v-else
          class="page-btn"
          :class="{ active: page === currentPage }"
          @click="emit('setPage', page)"
        >
          {{ page }}
        </button>
      </template>

      <button
        class="page-btn"
        :disabled="currentPage >= totalPages"
        @click="emit('setPage', currentPage + 1)"
        id="btn-next-page"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.table-container {
  overflow: hidden;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: var(--space-md);
}

.table-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--text-primary);
}

.table-title h3 {
  font-size: var(--font-size-lg);
}

.record-count {
  padding: 2px 10px;
  background: var(--bg-glass);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  font-weight: 500;
}

.table-search {
  position: relative;
  width: 280px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.table-search input {
  padding-left: 36px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--bg-glass);
}

th {
  padding: 12px 16px;
  text-align: left;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  border-bottom: 1px solid var(--border-color);
}

.th-no {
  width: 50px;
  text-align: center;
}

.th-sortable {
  cursor: pointer;
  user-select: none;
  transition: color var(--transition-fast);
}

.th-sortable:hover {
  color: var(--text-primary);
}

.sort-icon {
  margin-left: 4px;
  opacity: 0.5;
  font-size: 11px;
}

.th-sortable:hover .sort-icon {
  opacity: 1;
}

td {
  padding: 14px 16px;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
}

.td-no {
  text-align: center;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}

.data-row {
  transition: background var(--transition-fast);
}

.data-row:hover {
  background: var(--bg-glass-hover);
}

.data-row:last-child td {
  border-bottom: none;
}

.nama-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.nama-cell span {
  color: var(--text-primary);
  font-weight: 500;
}

.td-tanggal {
  white-space: nowrap;
}

.td-keterangan {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Empty State */
.empty-row td {
  border-bottom: none;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-2xl) var(--space-lg);
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--space-md);
}

.empty-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.empty-desc {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

/* Skeleton */
.skeleton-row td {
  border-bottom: 1px solid var(--border-color);
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--border-color);
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-family);
}

.page-btn:hover:not(:disabled):not(.active) {
  background: var(--bg-glass-hover);
  border-color: var(--border-color-hover);
  color: var(--text-primary);
}

.page-btn.active {
  background: var(--gradient-primary);
  border-color: transparent;
  color: #fff;
  font-weight: 600;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-ellipsis {
  padding: 0 4px;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .table-search {
    width: 100%;
  }

  th, td {
    padding: 10px 12px;
  }

  .avatar {
    display: none;
  }

  .td-keterangan {
    max-width: 150px;
  }
}
</style>
