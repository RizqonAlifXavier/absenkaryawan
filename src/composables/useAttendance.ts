import { ref, computed, watch, onMounted, onUnmounted, type Ref } from 'vue'
import { fetchAttendanceData, generateDemoData } from '@/services/sheetsService'
import type { AttendanceRecord } from '@/services/sheetsService'
import {
  SPREADSHEET_ID,
  AUTO_REFRESH_INTERVAL,
  ABSEN_TYPE_ORDER,
  TABLE_PAGE_SIZE,
} from '@/config/sheetsConfig'
import type { AbsenType } from '@/config/sheetsConfig'

export interface AttendanceStats {
  total: number
  telat: number
  izin: number
  sakit: number
  tanpaKeterangan: number
}

export function useAttendance() {
  // =============================================
  // State
  // =============================================
  const allRecords: Ref<AttendanceRecord[]> = ref([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)
  const isDemoMode = ref(false)

  // Filters
  const filterDateStart = ref('')
  const filterDateEnd = ref('')
  const filterNama = ref('')
  const filterJenisAbsen = ref<AbsenType[]>([])
  const searchQuery = ref('')

  // Table
  const currentPage = ref(1)
  const sortColumn = ref<keyof AttendanceRecord>('tanggal')
  const sortDirection = ref<'asc' | 'desc'>('desc')

  let refreshTimer: ReturnType<typeof setInterval> | null = null

  // =============================================
  // Fetch Data
  // =============================================
  async function loadData() {
    isLoading.value = true
    error.value = null

    try {
      if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
        // Demo mode jika belum dikonfigurasi
        isDemoMode.value = true
        allRecords.value = generateDemoData()
      } else {
        isDemoMode.value = false
        allRecords.value = await fetchAttendanceData()
      }
      lastUpdated.value = new Date()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Terjadi kesalahan saat mengambil data'
      // Fallback ke demo data jika gagal fetch
      if (allRecords.value.length === 0) {
        isDemoMode.value = true
        allRecords.value = generateDemoData()
      }
    } finally {
      isLoading.value = false
    }
  }

  function refreshData() {
    loadData()
  }

  // =============================================
  // Auto-reset page ketika filter berubah
  // =============================================
  watch([filterDateStart, filterDateEnd, filterNama, filterJenisAbsen, searchQuery], () => {
    currentPage.value = 1
  }, { deep: true })

  // =============================================
  // Filtered Records
  // =============================================
  const filteredRecords = computed(() => {
    let result = [...allRecords.value]

    // Filter by date range
    if (filterDateStart.value) {
      result = result.filter((r) => r.tanggal >= filterDateStart.value)
    }
    if (filterDateEnd.value) {
      result = result.filter((r) => r.tanggal <= filterDateEnd.value)
    }

    // Filter by nama karyawan (exact match karena dari dropdown)
    if (filterNama.value) {
      result = result.filter((r) => r.namaKaryawan === filterNama.value)
    }

    // Filter by jenis absen
    if (filterJenisAbsen.value.length > 0) {
      result = result.filter((r) => filterJenisAbsen.value.includes(r.jenisAbsen))
    }

    // Search query (searches across all fields)
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (r) =>
          r.namaKaryawan.toLowerCase().includes(q) ||
          r.jenisAbsen.toLowerCase().includes(q) ||
          r.keterangan.toLowerCase().includes(q) ||
          r.tanggal.includes(q),
      )
    }

    return result
  })

  // =============================================
  // Sorted Records
  // =============================================
  const sortedRecords = computed(() => {
    const result = [...filteredRecords.value]
    result.sort((a, b) => {
      const aVal = a[sortColumn.value]
      const bVal = b[sortColumn.value]

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection.value === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection.value === 'asc' ? aVal - bVal : bVal - aVal
      }
      return 0
    })
    return result
  })

  // =============================================
  // Pagination
  // =============================================
  const totalPages = computed(() => Math.ceil(sortedRecords.value.length / TABLE_PAGE_SIZE) || 1)

  const paginatedRecords = computed(() => {
    const start = (currentPage.value - 1) * TABLE_PAGE_SIZE
    return sortedRecords.value.slice(start, start + TABLE_PAGE_SIZE)
  })

  // =============================================
  // Statistics
  // =============================================
  const stats = computed<AttendanceStats>(() => {
    const records = filteredRecords.value
    return {
      total: records.length,
      telat: records.filter((r) => r.jenisAbsen === 'Telat').length,
      izin: records.filter((r) => r.jenisAbsen === 'Izin').length,
      sakit: records.filter((r) => r.jenisAbsen === 'Sakit').length,
      tanpaKeterangan: records.filter((r) => r.jenisAbsen === 'Tanpa Keterangan').length,
    }
  })

  // Data untuk chart (distribusi per jenis absen)
  const chartData = computed(() => {
    return ABSEN_TYPE_ORDER.map((type) => ({
      type,
      count: filteredRecords.value.filter((r) => r.jenisAbsen === type).length,
    }))
  })

  // Daftar unik nama karyawan (untuk dropdown filter)
  const uniqueNames = computed(() => {
    const names = new Set(allRecords.value.map((r) => r.namaKaryawan))
    return Array.from(names).sort()
  })

  // Data trend harian (7 hari terakhir)
  const dailyTrend = computed(() => {
    const today = new Date()
    const days: { date: string; count: number }[] = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]!
      const count = filteredRecords.value.filter((r) => r.tanggal === dateStr).length
      days.push({ date: dateStr, count })
    }

    return days
  })

  // =============================================
  // Actions
  // =============================================
  function setSort(column: keyof AttendanceRecord) {
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn.value = column
      sortDirection.value = 'desc'
    }
    currentPage.value = 1
  }

  function setPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  function resetFilters() {
    filterDateStart.value = ''
    filterDateEnd.value = ''
    filterNama.value = ''
    filterJenisAbsen.value = []
    searchQuery.value = ''
    currentPage.value = 1
  }

  function toggleAbsenFilter(type: AbsenType) {
    const idx = filterJenisAbsen.value.indexOf(type)
    if (idx >= 0) {
      filterJenisAbsen.value.splice(idx, 1)
    } else {
      filterJenisAbsen.value.push(type)
    }
    currentPage.value = 1
  }

  // =============================================
  // Export to CSV
  // =============================================
  function escapeCsvField(field: string | number): string {
    const str = String(field)
    // Jika mengandung koma, quote, atau newline, wrap dengan quote
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  function exportToCsv() {
    const headers = ['No', 'Nama Karyawan', 'Tanggal', 'Jenis Absen', 'Keterangan', 'Timestamp']
    const rows = sortedRecords.value.map((r, i) => [
      escapeCsvField(i + 1),
      escapeCsvField(r.namaKaryawan),
      escapeCsvField(r.tanggal),
      escapeCsvField(r.jenisAbsen),
      escapeCsvField(r.keterangan),
      escapeCsvField(r.timestamp),
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `absensi_karyawan_${new Date().toISOString().split('T')[0]!}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // =============================================
  // Lifecycle
  // =============================================
  onMounted(() => {
    loadData()
    refreshTimer = setInterval(loadData, AUTO_REFRESH_INTERVAL)
  })

  onUnmounted(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
    }
  })

  return {
    // State
    allRecords,
    isLoading,
    error,
    lastUpdated,
    isDemoMode,

    // Filters
    filterDateStart,
    filterDateEnd,
    filterNama,
    filterJenisAbsen,
    searchQuery,

    // Computed
    filteredRecords,
    sortedRecords,
    paginatedRecords,
    stats,
    chartData,
    uniqueNames,
    dailyTrend,
    totalPages,
    currentPage,
    sortColumn,
    sortDirection,

    // Actions
    loadData,
    refreshData,
    setSort,
    setPage,
    resetFilters,
    toggleAbsenFilter,
    exportToCsv,
  }
}
