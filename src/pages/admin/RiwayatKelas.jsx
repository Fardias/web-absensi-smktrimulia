import React from 'react'
import { adminAPI, utilityAPI } from '../../services/api'
import { Loading, Error } from '../../components'

const RiwayatKelas = () => {
  const [kelasList, setKelasList] = React.useState([])
  const [kelasId, setKelasId] = React.useState('')
  const [q, setQ] = React.useState('')
  const [list, setList] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const fetchKelas = React.useCallback(async () => {
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

  const fetchRiwayat = React.useCallback(async () => {
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

  React.useEffect(() => { fetchKelas() }, [fetchKelas])
  React.useEffect(() => { fetchRiwayat() }, [])

  const filteredList = React.useMemo(() => {
    const term = q.trim().toLowerCase()
    return list.filter((r) => {
      if (kelasId && String(r?.kelas?.kelas_id) !== String(kelasId)) return false
      if (!term) return true
      const nama = (r?.siswa?.nama || '').toLowerCase()
      const nis = (r?.siswa?.nis || '').toLowerCase()
      return nama.includes(term) || nis.includes(term)
    })
  }, [list, q, kelasId])

  const renderKelasLabel = (k) => {
    if (!k) return '-'
    const jur = k.jurusan?.nama_jurusan ?? k.jurusan
    return `${k.tingkat ?? ''} ${jur ?? ''} ${k.paralel ?? ''}`.trim()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Kelas Siswa</h1>
      </div>
      {loading && <Loading text="Memuat riwayat kelas..." />}
      {error && <Error message={error} />}

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex flex-col text-sm">
          <label className="text-gray-700 font-medium">Filter Kelas</label>
          <select value={kelasId} onChange={(e) => setKelasId(e.target.value)} className="mt-1 p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200">
            <option value="">Semua Kelas</option>
            {kelasList.map((k) => (
              <option key={k.id} value={k.id}>{k.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col text-sm">
          <label className="text-gray-700 font-medium">Cari NIS/Nama</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); fetchRiwayat(); } }}
            placeholder="Masukkan NIS atau nama siswa"
            className="mt-1 p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="text-xs text-gray-600 mb-2">
        {kelasId ? (
          <>Filter kelas: {kelasList.find((k) => String(k.id) === String(kelasId))?.label}</>
        ) : (
          <>Filter kelas: Semua</>
        )}
      </div>

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">No</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">NIS</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Nama</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Kelas</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredList.map((r, idx) => (
              <tr key={r.riwayat_kelas_id ?? `${idx}`}>
                <td className="px-4 py-2">{idx + 1}</td>
                <td className="px-4 py-2">{r.siswa?.nis ?? '-'}</td>
                <td className="px-4 py-2">{r.siswa?.nama ?? '-'}</td>
                <td className="px-4 py-2">{renderKelasLabel(r.kelas)}</td>
                <td className="px-4 py-2">{r.status}</td>
              </tr>
            ))}
            {filteredList.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">Tidak ada data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RiwayatKelas
