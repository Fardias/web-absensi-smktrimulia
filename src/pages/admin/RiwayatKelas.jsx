import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminAPI, utilityAPI } from '../../services/api'
import { Loading, Error, DataTable } from '../../components'

const RiwayatKelas = () => {
  const [kelasList, setKelasList] = useState([])
  const [kelasId, setKelasId] = useState('')
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchKelas = useCallback(async () => {
    try {
      const res = await utilityAPI.listKelas()
      const arr = res?.data?.responseData ?? []
      const normalized = Array.isArray(arr) ? arr.map((k) => ({
        id: k.kelas_id,
        label: `${k.tingkat} ${k.jurusan?.nama_jurusan ?? k.jurusan} ${k.paralel}`.trim(),
      })) : []
      if (normalized.length === 0) throw new Error('empty')
      setKelasList(normalized)
      // biarkan default "Semua" (kelasId = '') seperti LihatAbsensiHariIni
    } catch (e) {
      try {
        const res2 = await adminAPI.getKelas()
        const arr2 = res2?.data?.kelas ?? []
        const normalized2 = Array.isArray(arr2) ? arr2.map((k) => ({
          id: k.kelas_id,
          label: `${k.tingkat} ${k.jurusan?.nama_jurusan ?? ''} ${k.paralel ?? ''}`.trim(),
        })) : []
        setKelasList(normalized2)
        // tetap default "Semua"
      } catch {
        setKelasList([])
      }
    }
  }, [])

  const fetchRiwayat = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (kelasId) params.kelas_id = kelasId
      const [resRiwayat, resSiswa] = await Promise.all([
        adminAPI.getRiwayatKelas(params),
        adminAPI.getDataSiswa(),
      ])
      const riwayatArr = Array.isArray(resRiwayat?.data?.riwayat) ? resRiwayat.data.riwayat : []
      const siswaArr = Array.isArray(resSiswa?.data?.responseData) ? resSiswa.data.responseData : []
      const existing = new Set(riwayatArr.map((r) => r?.siswa?.siswa_id))
      const synthesized = siswaArr
        .filter((s) => !existing.has(s.siswa_id))
        .filter((s) => !kelasId || String(s?.kelas?.kelas_id) === String(kelasId))
        .map((s) => ({
          riwayat_kelas_id: `synthetic-${s.siswa_id}`,
          siswa: s,
          kelas: s.kelas,
          status: 'aktif',
        }))
      setList([...riwayatArr, ...synthesized])
    } catch (e) {
      setError('Gagal memuat riwayat kelas')
    } finally {
      setLoading(false)
    }
  }, [kelasId])

  useEffect(() => { fetchKelas() }, [fetchKelas])
  useEffect(() => { fetchRiwayat() }, [])

  // Filter data based on kelas selection
  const filteredList = useMemo(() => {
    return list.filter((r) => {
      if (kelasId && String(r?.kelas?.kelas_id) !== String(kelasId)) return false
      return true
    })
  }, [list, kelasId])

  const renderKelasLabel = (k) => {
    if (!k) return '-'
    const jur = k.jurusan?.nama_jurusan ?? k.jurusan
    return `${k.tingkat ?? ''} ${jur ?? ''} ${k.paralel ?? ''}`.trim()
  }

  // Define columns for DataTable
  const columns = [
    {
      key: 'no',
      label: 'No',
      render: (item, index) => index + 1
    },
    {
      key: 'nis',
      label: 'NIS',
      sortable: true,
      accessor: (item) => item.siswa?.nis || '-'
    },
    {
      key: 'nama',
      label: 'Nama',
      sortable: true,
      accessor: (item) => item.siswa?.nama || '-'
    },
    {
      key: 'kelas',
      label: 'Kelas',
      sortable: true,
      accessor: (item) => renderKelasLabel(item.kelas),
      sortValue: (item) => renderKelasLabel(item.kelas)
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      accessor: (item) => item.status || '-',
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.status === 'aktif' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {item.status || '-'}
        </span>
      )
    }
  ];

  // Define search fields for DataTable
  const searchFields = [
    (item) => item.siswa?.nis || '',
    (item) => item.siswa?.nama || '',
    (item) => renderKelasLabel(item.kelas),
    (item) => item.status || ''
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Kelas Siswa</h1>
      </div>
      
      {loading && <Loading text="Memuat riwayat kelas..." />}
      {error && <Error message={error} />}

      {/* Filter Kelas */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex flex-col text-sm">
            <label className="text-gray-700 font-medium mb-1">Filter Kelas</label>
            <select 
              value={kelasId} 
              onChange={(e) => setKelasId(e.target.value)} 
              className="p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 min-w-48"
            >
              <option value="">Semua Kelas</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>{k.label}</option>
              ))}
            </select>
          </div>
          
          <div className="text-xs text-gray-600 self-end pb-2">
            {kelasId ? (
              <>Filter: {kelasList.find((k) => String(k.id) === String(kelasId))?.label}</>
            ) : (
              <>Filter: Semua Kelas</>
            )}
          </div>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={filteredList}
        columns={columns}
        searchFields={searchFields}
        searchPlaceholder="Cari NIS, nama siswa, kelas, atau status..."
        emptyMessage="Tidak ada data riwayat kelas"
        defaultSort={{ field: 'nama', direction: 'asc' }}
        defaultItemsPerPage={25}
      />
    </div>
  )
}

export default RiwayatKelas
