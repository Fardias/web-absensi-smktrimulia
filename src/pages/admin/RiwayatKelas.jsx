import { useCallback, useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import { adminAPI, utilityAPI } from '../../services/api'
import { Loading, Error, DataTable } from '../../components'

const RiwayatKelas = () => {
  const [kelasList, setKelasList] = useState([])
  const [kelasId, setKelasId] = useState('')
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [selectedKelasAsal, setSelectedKelasAsal] = useState('')
  const [processing, setProcessing] = useState(false)

  // Edit Status Modal states
  const [editingRiwayat, setEditingRiwayat] = useState(null)
  const [editStatus, setEditStatus] = useState('')
  const [processingEdit, setProcessingEdit] = useState(false)

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
        const arr2 = res2?.data?.responseData?.kelas ?? []
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

      const resRiwayat = await adminAPI.getRiwayatKelas(params)
      const riwayatArr = Array.isArray(resRiwayat?.data?.responseData?.riwayat) ? resRiwayat.data.responseData.riwayat : []

      setList(riwayatArr)
    } catch (e) {
      setError('Gagal memuat riwayat kelas')
    } finally {
      setLoading(false)
    }
  }, [kelasId])

  useEffect(() => { fetchKelas() }, [fetchKelas])
  useEffect(() => { fetchRiwayat() }, [fetchRiwayat])

  // Remove the redundant filteredList since filtering is now handled in fetchRiwayat
  const displayList = list

  const renderKelasLabel = (k) => {
    if (!k) return '-'
    const jur = k.jurusan?.nama_jurusan ?? k.jurusan
    return `${k.tingkat ?? ''} ${jur ?? ''} ${k.paralel ?? ''}`.trim()
  }

  const handleEdit = (item) => {
    setEditingRiwayat(item)
    setEditStatus(item.status)
  }

  const handleUpdateStatus = async () => {
    if (!editingRiwayat) return
    setProcessingEdit(true)
    try {
      const response = await adminAPI.updateRiwayatKelas(editingRiwayat.riwayat_kelas_id, {
        status: editStatus
      })
      if (response.status === 200 && response.data.responseStatus) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Status riwayat berhasil diperbarui',
          timer: 1500,
          showConfirmButton: false
        })
        setEditingRiwayat(null)
        fetchRiwayat()
      } else {
        throw new Error(response.data.responseMessage || 'Gagal memperbarui status')
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error?.response?.data?.responseMessage || 'Terjadi kesalahan'
      })
    } finally {
      setProcessingEdit(false)
    }
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
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'aktif'
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
          }`}>
          {item.status || '-'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (item) => (
        <button
          onClick={() => handleEdit(item)}
          className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
        >
          Edit Status
        </button>
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

  // Handle class promotion
  const handleNaikTingkat = async () => {
    if (!selectedKelasAsal) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Pilih kelas asal terlebih dahulu'
      })
      return
    }

    const selectedKelas = kelasList.find(k => String(k.id) === String(selectedKelasAsal))
    if (!selectedKelas) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Kelas tidak ditemukan'
      })
      return
    }

    // Parse current class info
    const kelasInfo = selectedKelas.label.split(' ')
    const currentTingkat = kelasInfo[0]
    const jurusan = kelasInfo.slice(1, -1).join(' ')
    const paralel = kelasInfo[kelasInfo.length - 1]

    // Determine next tingkat
    let nextTingkat
    if (currentTingkat === 'X') {
      nextTingkat = 'XI'
    } else if (currentTingkat === 'XI') {
      nextTingkat = 'XII'
    } else if (currentTingkat === 'XII') {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Siswa kelas XII tidak dapat naik tingkat lagi'
      })
      return
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Format tingkat kelas tidak valid'
      })
      return
    }

    const nextKelasLabel = `${nextTingkat} ${jurusan} ${paralel}`.trim()

    // Show confirmation
    const result = await Swal.fire({
      title: 'Konfirmasi Kenaikan Tingkat',
      html: `
        <div class="text-left">
          <p><strong>Kelas Asal:</strong> ${selectedKelas.label}</p>
          <p><strong>Kelas Tujuan:</strong> ${nextKelasLabel}</p>
          <br>
          <p class="text-sm text-gray-600">Seluruh siswa di kelas ${selectedKelas.label} akan dipindahkan ke kelas ${nextKelasLabel}.</p>
          <p class="text-sm text-red-600 font-medium">Aksi ini tidak dapat dibatalkan!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Naik Tingkat',
      cancelButtonText: 'Batal'
    })

    if (!result.isConfirmed) return

    setProcessing(true)
    try {
      // Call API to handle class promotion
      const response = await adminAPI.promoteClass(selectedKelasAsal, {
        next_tingkat: nextTingkat
      })

      if (response.status === 200 && response.data.responseStatus) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: `Seluruh siswa berhasil naik dari kelas ${selectedKelas.label} ke ${nextKelasLabel}`,
          timer: 3000,
          showConfirmButton: false
        })

        // Refresh data
        await fetchRiwayat()
        await fetchKelas()

        // Close modal and reset form
        setShowModal(false)
        setSelectedKelasAsal('')
      } else {
        throw new Error(response.data.responseMessage || 'Gagal memproses kenaikan tingkat')
      }

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error?.response?.data?.responseMessage || error.message || 'Terjadi kesalahan saat memproses kenaikan tingkat'
      })
    } finally {
      setProcessing(false)
    }
  }

  // Get active classes (tingkat X and XI only)
  const activeKelasOptions = useMemo(() => {
    return kelasList.filter(k => {
      const tingkat = k.label.split(' ')[0]
      return tingkat === 'X' || tingkat === 'XI'
    })
  }, [kelasList])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Kelas Siswa</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors font-medium"
        >
          Kelola Data Siswa
        </button>
      </div>

      {loading && <Loading text="Memuat riwayat kelas..." />}
      {error && <Error message={error} />}

      {/* Modal for Class Management */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Kelola Data Siswa</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedKelasAsal('')
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
                disabled={processing}
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pilih Kelas Asal
                </label>
                <select
                  value={selectedKelasAsal}
                  onChange={(e) => setSelectedKelasAsal(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={processing}
                >
                  <option value="">Pilih Kelas</option>
                  {activeKelasOptions.map((k) => (
                    <option key={k.id} value={k.id}>{k.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Hanya kelas X dan XI yang dapat naik tingkat
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h3 className="font-semibold text-blue-800 text-sm mb-2">Aksi: Naik Tingkat Kelas</h3>
                <p className="text-xs text-blue-700">
                  Seluruh siswa dalam kelas yang dipilih akan dipindahkan ke tingkat berikutnya secara otomatis.
                </p>
              </div>

              {selectedKelasAsal && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Kelas Terpilih:</strong> {activeKelasOptions.find(k => String(k.id) === String(selectedKelasAsal))?.label}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Siswa akan dipindahkan ke tingkat berikutnya dengan jurusan dan paralel yang sama.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedKelasAsal('')
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={processing}
              >
                Batal
              </button>
              <button
                onClick={handleNaikTingkat}
                disabled={!selectedKelasAsal || processing}
                className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {processing && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {processing ? 'Memproses...' : 'Naik Tingkat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Editing Status */}
      {editingRiwayat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Edit Status Riwayat</h2>
              <button
                onClick={() => setEditingRiwayat(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
                disabled={processingEdit}
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Siswa: <strong>{editingRiwayat.siswa?.nama}</strong> ({editingRiwayat.siswa?.nis})
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Kelas: <strong>{renderKelasLabel(editingRiwayat.kelas)}</strong>
                </p>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={processingEdit}
                >
                  <option value="aktif">Aktif</option>
                  <option value="naik kelas">Naik Kelas</option>
                  <option value="tidak naik kelas">Tidak Naik Kelas</option>
                  <option value="lulus">Lulus</option>
                  <option value="keluar">Keluar</option>
                  <option value="pindah">Pindah</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingRiwayat(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={processingEdit}
              >
                Batal
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={processingEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {processingEdit && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {processingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

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
        data={displayList}
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
