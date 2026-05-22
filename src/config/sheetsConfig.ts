/**
 * Konfigurasi Google Sheets
 *
 * CARA SETUP:
 * 1. Buat Google Form dengan field: Nama Karyawan, Tanggal, Jenis Absen, Keterangan
 * 2. Google Form akan otomatis membuat Sheet sebagai responses
 * 3. Di Sheet: File → Share → Publish to web → Pilih sheet → Format CSV → Publish
 * 4. Copy link CSV yang dihasilkan dan paste di bawah
 */

// =============================================
// URL CSV dari Google Sheets yang sudah di-publish
// =============================================
export const PUBLISHED_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vS5eQHXfJ6ncDGagvAMUATJFLZBK2_-EQHtMhTi1-L7CAoGccvGSSVCcsa1fJgGv4bRNDgAzfpuKmYj/pub?output=csv'

// Build URL untuk fetch CSV dari published Google Sheet
export function getSheetCsvUrl(): string {
  return PUBLISHED_CSV_URL
}

// =============================================
// Jenis Absen & Konfigurasi Warna
// =============================================
export type AbsenType = 'Telat' | 'Izin' | 'Sakit' | 'Tanpa Keterangan'

export interface AbsenTypeConfig {
  label: string
  color: string
  bgColor: string
  bgColorSoft: string
  icon: string
}

export const ABSEN_TYPES: Record<AbsenType, AbsenTypeConfig> = {
  Telat: {
    label: 'Telat',
    color: '#FF6B6B',
    bgColor: 'rgba(255, 107, 107, 0.15)',
    bgColorSoft: 'rgba(255, 107, 107, 0.08)',
    icon: '⏰',
  },
  Izin: {
    label: 'Izin',
    color: '#4ECDC4',
    bgColor: 'rgba(78, 205, 196, 0.15)',
    bgColorSoft: 'rgba(78, 205, 196, 0.08)',
    icon: '📋',
  },
  Sakit: {
    label: 'Sakit',
    color: '#FFE66D',
    bgColor: 'rgba(255, 230, 109, 0.15)',
    bgColorSoft: 'rgba(255, 230, 109, 0.08)',
    icon: '🏥',
  },
  'Tanpa Keterangan': {
    label: 'Tanpa Keterangan',
    color: '#A78BFA',
    bgColor: 'rgba(167, 139, 250, 0.15)',
    bgColorSoft: 'rgba(167, 139, 250, 0.08)',
    icon: '❓',
  },
}

// Urutan jenis absen untuk display
export const ABSEN_TYPE_ORDER: AbsenType[] = ['Telat', 'Izin', 'Sakit', 'Tanpa Keterangan']

// Interval auto-refresh (dalam milidetik) — cek data baru setiap 30 detik
export const AUTO_REFRESH_INTERVAL = 30 * 1000

// Jumlah item per halaman tabel
export const TABLE_PAGE_SIZE = 15

// =============================================
// Periode Absensi (Tanggal 16 s/d Tanggal 15)
// =============================================
export const PERIOD_START_DAY = 16

export interface AttendancePeriod {
  label: string       // e.g. "Mei 2026"
  startDate: string   // e.g. "2026-05-16"
  endDate: string     // e.g. "2026-06-15"
}

/**
 * Hitung periode berdasarkan tanggal
 * Periode "Mei 2026" = 16 Mei 2026 s/d 15 Juni 2026
 */
export function getCurrentPeriod(date: Date = new Date()): AttendancePeriod {
  const day = date.getDate()
  let periodMonth: number
  let periodYear: number

  if (day >= PERIOD_START_DAY) {
    // Tanggal 16-31 → periode bulan ini
    periodMonth = date.getMonth()
    periodYear = date.getFullYear()
  } else {
    // Tanggal 1-15 → masih periode bulan lalu
    periodMonth = date.getMonth() - 1
    periodYear = date.getFullYear()
    if (periodMonth < 0) {
      periodMonth = 11
      periodYear--
    }
  }

  return buildPeriod(periodYear, periodMonth)
}

/**
 * Build satu periode dari tahun dan bulan (0-indexed)
 */
function buildPeriod(year: number, month: number): AttendancePeriod {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]

  const startYear = year
  const startMonth = month

  // End = tanggal 15 bulan berikutnya
  let endMonth = month + 1
  let endYear = year
  if (endMonth > 11) {
    endMonth = 0
    endYear++
  }

  const label = `${monthNames[startMonth]!} ${startYear}`
  const startDate = `${startYear}-${String(startMonth + 1).padStart(2, '0')}-${PERIOD_START_DAY}`
  const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-15`

  return { label, startDate, endDate }
}

/**
 * Generate daftar periode (6 bulan ke belakang + bulan ini)
 */
export function generatePeriodList(count = 7): AttendancePeriod[] {
  const periods: AttendancePeriod[] = []
  const now = new Date()
  const current = getCurrentPeriod(now)

  // Parse bulan & tahun dari current period
  let month = parseInt(current.startDate.split('-')[1]!, 10) - 1
  let year = parseInt(current.startDate.split('-')[0]!, 10)

  for (let i = 0; i < count; i++) {
    let m = month - i
    let y = year
    while (m < 0) {
      m += 12
      y--
    }
    periods.push(buildPeriod(y, m))
  }

  return periods
}
