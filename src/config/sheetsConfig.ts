/**
 * Konfigurasi Google Sheets
 *
 * CARA SETUP:
 * 1. Buat Google Form dengan field: Nama Karyawan, Tanggal, Jenis Absen, Keterangan
 * 2. Google Form akan otomatis membuat Sheet sebagai responses
 * 3. Di Sheet: File → Share → Publish to web → Pilih sheet → Format CSV → Publish
 * 4. Copy Spreadsheet ID dari URL dan paste di bawah
 */

// =============================================
// GANTI SPREADSHEET_ID DENGAN ID ANDA
// =============================================
export const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'

// Nama sheet (biasanya "Form Responses 1" jika dari Google Form)
export const SHEET_NAME = 'Form Responses 1'

// Build URL untuk fetch CSV dari published Google Sheet
export function getSheetCsvUrl(): string {
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`
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

// Interval auto-refresh (dalam milidetik) — default 5 menit
export const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000

// Jumlah item per halaman tabel
export const TABLE_PAGE_SIZE = 15
