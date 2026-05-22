import { getSheetCsvUrl } from '@/config/sheetsConfig'
import type { AbsenType } from '@/config/sheetsConfig'

/**
 * Tipe data satu record absensi
 */
export interface AttendanceRecord {
  id: number
  timestamp: string
  namaKaryawan: string
  tanggal: string
  jenisAbsen: AbsenType
  keterangan: string
}

/**
 * Parse satu baris CSV, handling quoted fields dengan benar
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"'
        i++ // skip escaped quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current.trim())
  return fields
}

/**
 * Normalisasi tanggal ke format YYYY-MM-DD
 * Google Sheets /pub?output=csv biasanya output format M/D/YYYY (US format)
 */
function normalizeDate(dateStr: string): string {
  if (!dateStr) return ''

  // Sudah format YYYY-MM-DD? Langsung return
  const ymdMatch = dateStr.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/)
  if (ymdMatch) {
    const year = ymdMatch[1]!
    const month = ymdMatch[2]!
    const day = ymdMatch[3]!
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  // Coba parse dengan Date (handle M/D/YYYY, MM/DD/YYYY, dll dari Google Sheets)
  const parsed = new Date(dateStr)
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear()
    const month = String(parsed.getMonth() + 1).padStart(2, '0')
    const day = String(parsed.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return dateStr
}

/**
 * Normalisasi jenis absen ke format yang dikenal
 */
function normalizeAbsenType(raw: string): AbsenType {
  const lower = raw.toLowerCase().trim()
  if (lower.includes('telat') || lower.includes('terlambat') || lower.includes('late')) return 'Telat'
  if (lower.includes('izin') || lower.includes('permission') || lower.includes('cuti')) return 'Izin'
  if (lower.includes('sakit') || lower.includes('sick') || lower.includes('ill')) return 'Sakit'
  return 'Tanpa Keterangan'
}

/**
 * Parse CSV string menjadi array of AttendanceRecord
 */
function parseCsvToRecords(csv: string): AttendanceRecord[] {
  const lines = csv.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter((line) => line.trim() !== '')

  if (lines.length < 2) return [] // Hanya header, tidak ada data

  // Skip header (baris pertama)
  const dataLines = lines.slice(1)

  return dataLines.map((line, index) => {
    const fields = parseCsvLine(line)

    return {
      id: index + 1,
      timestamp: fields[0] || '',
      namaKaryawan: fields[1] || 'Unknown',
      tanggal: normalizeDate(fields[2] || ''),
      jenisAbsen: normalizeAbsenType(fields[3] || ''),
      keterangan: fields[4] || '-',
    }
  })
}

/**
 * Fetch data absensi dari Google Sheets
 */
export async function fetchAttendanceData(): Promise<AttendanceRecord[]> {
  const url = getSheetCsvUrl()

  const response = await fetch(url, {
    headers: {
      Accept: 'text/csv',
    },
  })

  if (!response.ok) {
    throw new Error(`Gagal mengambil data dari Google Sheets (HTTP ${response.status})`)
  }

  const csv = await response.text()
  return parseCsvToRecords(csv)
}

/**
 * Generate demo data untuk testing tanpa Google Sheets
 */
export function generateDemoData(): AttendanceRecord[] {
  const names = [
    'Ahmad Fauzi',
    'Siti Nurhaliza',
    'Budi Santoso',
    'Dewi Lestari',
    'Rizky Pratama',
    'Anisa Rahma',
    'Hendra Wijaya',
    'Putri Ayu',
    'Dimas Arya',
    'Ratna Sari',
    'Fajar Nugroho',
    'Maya Indah',
    'Eko Prasetyo',
    'Rina Wati',
    'Yoga Permana',
  ]

  const absenTypes: AbsenType[] = ['Telat', 'Izin', 'Sakit', 'Tanpa Keterangan']

  const keteranganMap: Record<AbsenType, string[]> = {
    Telat: ['Macet di jalan', 'Ban bocor', 'Hujan deras', 'Ketiduran', 'Anak sakit'],
    Izin: [
      'Urusan keluarga',
      'Perpanjang SIM',
      'Acara pernikahan',
      'Kontrol ke dokter',
      'Ambil rapor anak',
    ],
    Sakit: ['Demam', 'Flu', 'Sakit gigi', 'Migrain', 'Diare'],
    'Tanpa Keterangan': ['-', '-', '-', '-', '-'],
  }

  const records: AttendanceRecord[] = []

  // Generate data untuk 30 hari terakhir
  const today = new Date()
  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const date = new Date(today)
    date.setDate(date.getDate() - daysAgo)

    const name = names[Math.floor(Math.random() * names.length)]!
    const type = absenTypes[Math.floor(Math.random() * absenTypes.length)]!
    const keteranganList = keteranganMap[type]
    const keterangan = keteranganList[Math.floor(Math.random() * keteranganList.length)]!

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(Math.floor(Math.random() * 12) + 7).padStart(2, '0')
    const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0')

    records.push({
      id: i + 1,
      timestamp: `${year}-${month}-${day} ${hours}:${minutes}:00`,
      namaKaryawan: name,
      tanggal: `${year}-${month}-${day}`,
      jenisAbsen: type,
      keterangan,
    })
  }

  // Sort by tanggal descending
  records.sort((a, b) => b.tanggal.localeCompare(a.tanggal))

  // Re-index IDs
  records.forEach((r, i) => (r.id = i + 1))

  return records
}
