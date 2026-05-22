<script setup lang="ts">
import { useAttendance } from '@/composables/useAttendance'
import DashboardHeader from '@/components/DashboardHeader.vue'
import SummaryCards from '@/components/SummaryCards.vue'
import AttendanceChart from '@/components/AttendanceChart.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import AttendanceTable from '@/components/AttendanceTable.vue'

const {
  // State
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
  paginatedRecords,
  stats,
  chartData,
  uniqueNames,
  dailyTrend,
  totalPages,
  currentPage,
  sortColumn,
  sortDirection,
  allRecords,

  // Actions
  refreshData,
  setSort,
  setPage,
  resetFilters,
  toggleAbsenFilter,
  exportToCsv,
} = useAttendance()
</script>

<template>
  <div>
    <DashboardHeader
      :is-loading="isLoading"
      :last-updated="lastUpdated"
      :is-demo-mode="isDemoMode"
      @refresh="refreshData"
    />
    <main class="dashboard-main">
    <!-- Error Banner -->
    <div v-if="error" class="error-banner animate-fade-in">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Summary Cards -->
    <SummaryCards :stats="stats" :is-loading="isLoading" />

    <!-- Chart & Filter Row -->
    <div class="dashboard-row">
      <AttendanceChart :chart-data="chartData" :daily-trend="dailyTrend" />

      <FilterPanel
        :filter-date-start="filterDateStart"
        :filter-date-end="filterDateEnd"
        :filter-nama="filterNama"
        :filter-jenis-absen="filterJenisAbsen"
        :unique-names="uniqueNames"
        :total-filtered="filteredRecords.length"
        :total-records="allRecords.length"
        @update:filter-date-start="filterDateStart = $event"
        @update:filter-date-end="filterDateEnd = $event"
        @update:filter-nama="filterNama = $event"
        @toggle-absen-filter="toggleAbsenFilter"
        @reset-filters="resetFilters"
        @export-csv="exportToCsv"
      />
    </div>

    <!-- Attendance Table -->
    <AttendanceTable
      :records="paginatedRecords"
      :current-page="currentPage"
      :total-pages="totalPages"
      :sort-column="sortColumn"
      :sort-direction="sortDirection"
      :search-query="searchQuery"
      :is-loading="isLoading"
      @set-sort="setSort"
      @set-page="setPage"
      @update:search-query="searchQuery = $event"
    />
    </main>
  </div>
</template>

<style scoped>
.dashboard-main {
  padding: var(--space-xl);
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.error-banner {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: var(--border-radius-md);
  color: var(--color-telat);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.dashboard-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xl);
  align-items: start;
}

@media (max-width: 1024px) {
  .dashboard-main {
    padding: var(--space-md);
    gap: var(--space-md);
  }

  .dashboard-row {
    grid-template-columns: 1fr;
  }
}
</style>
