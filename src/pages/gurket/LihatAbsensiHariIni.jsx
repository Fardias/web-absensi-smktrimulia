import React from 'react'
import { guruAPI, utilityAPI } from '../../services/api'
import { Loading } from '../../components';
import Error from '../../components/Error';
import Swal from 'sweetalert2';

export const LihatAbsensiHariIni = () => {
  const [absensi, setAbsensi] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [kelasList, setKelasList] = React.useState([]);
  const [kelas, setKelas] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [tanggal] = React.useState(new Date().toISOString().slice(0, 10));
  const [search, setSearch] = React.useState("");
  const [updatingStatus, setUpdatingStatus] = React.useState({});

  React.useEffect(() => {
    const fetchKelas = async () => {
      try {
        const res = await utilityAPI.listKelas();
        const data = res?.data?.responseData ?? [];
        const list = data.map((k) => ({
          id: k.kelas_id,
          label: `${k.tingkat} ${k.jurusan?.nama_jurusan ?? k.jurusan} ${k.paralel}`,
        }));
        setKelasList(list);
      } catch {
        setKelasList([]);
      }
    };
    fetchKelas();
  }, []);

  const fetchAbsensi = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { tanggal };
      if (kelas) params.kelas_id = kelas;
      if (status) params.status = status;
      const res = await guruAPI.lihatAbsensiSiswa(params);
      const data = res?.data?.responseData?.absensi ?? [];
      setAbsensi(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memuat data');
      setAbsensi([]);
    } finally {
      setLoading(false);
    }
  }, [kelas, status, tanggal]);

  React.useEffect(() => {
    fetchAbsensi();
  }, [fetchAbsensi]);

  const getStatusBadge = (status) => {
    const styles = {
      hadir: 'bg-green-100 text-green-800',
      terlambat: 'bg-yellow-100 text-yellow-800',
      izin: 'bg-yellow-100 text-yellow-800',
      sakit: 'bg-red-100 text-red-800',
      alfa: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.alfa}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const handleStatusChange = async (absensiId, newStatus, oldStatus, siswaName) => {
    // Confirm the change
    const result = await Swal.fire({
      title: 'Konfirmasi Perubahan Status',
      html: `
        <div class="text-sm">
          <p><strong>Siswa:</strong> ${siswaName}</p>
          <p><strong>Status Lama:</strong> <span class="capitalize">${oldStatus}</span></p>
          <p><strong>Status Baru:</strong> <span class="capitalize">${newStatus}</span></p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Ubah Status',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    // Set loading state for this specific row
    setUpdatingStatus(prev => ({ ...prev, [absensiId]: true }));

    try {
      await guruAPI.updateAbsensiStatusAll({
        absensi_id: absensiId,
        status: newStatus
      });

      // Update local state
      setAbsensi(prev => prev.map(item => 
        item.absensi_id === absensiId 
          ? { ...item, status: newStatus }
          : item
      ));

      Swal.fire({
        icon: 'success',
        title: 'Status Berhasil Diubah!',
        text: `Status kehadiran ${siswaName} berhasil diubah menjadi ${newStatus}`,
        confirmButtonColor: '#3b82f6',
        timer: 3000,
        timerProgressBar: true
      });

    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengubah Status',
        text: error?.response?.data?.responseMessage || 'Terjadi kesalahan saat mengubah status',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [absensiId]: false }));
    }
  };

  const StatusDropdown = ({ item }) => {
    const statusOptions = [
      { value: 'hadir', label: 'Hadir', color: 'text-green-600' },
      { value: 'terlambat', label: 'Terlambat', color: 'text-yellow-600' },
      { value: 'izin', label: 'Izin', color: 'text-blue-600' },
      { value: 'sakit', label: 'Sakit', color: 'text-red-600' },
      { value: 'alfa', label: 'Alfa', color: 'text-gray-600' }
    ];

    const isUpdating = updatingStatus[item.absensi_id];

    return (
      <div className="relative">
        <select
          value={item.status}
          onChange={(e) => handleStatusChange(
            item.absensi_id,
            e.target.value,
            item.status,
            item.nama
          )}
          disabled={isUpdating}
          className={`
            w-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium border border-gray-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${isUpdating ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer hover:bg-gray-50'}
            transition-colors duration-200
          `}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {isUpdating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-md">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  const filtered = absensi.filter((item) => {
    if (status && String(item.status).toLowerCase() !== String(status).toLowerCase()) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const nis = String(item.nis || "").toLowerCase();
    const nama = String(item.nama || "").toLowerCase();
    return nis.includes(q) || nama.includes(q);
  });

  if (loading) return <Loading text="Loading..." />;
  if (error) return <Error message={error} />;

  return (
    <div className="flex flex-col p-4 sm:p-6 md:p-8">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">Absensi Siswa Hari Ini</h1>
        
        {/* Info Box - Collapsible on mobile */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-2 sm:ml-3">
              <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-1">
                Fitur Edit Status Kehadiran
              </h4>
              <p className="text-xs sm:text-sm text-blue-700 hidden sm:block">
                Anda dapat mengubah status kehadiran siswa dengan mengklik dropdown di kolom Status. 
                Gunakan fitur ini untuk mengoreksi status siswa yang melakukan kecurangan atau kesalahan input.
              </p>
              <p className="text-xs text-blue-700 sm:hidden">
                Klik dropdown Status untuk mengubah kehadiran siswa.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section - Mobile Optimized */}
      <div className="mb-4 space-y-4">
        {/* Kelas Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter Kelas</label>
          <select
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Semua Kelas</option>
            {kelasList.map((k) => (
              <option key={k.id} value={k.id}>{k.label}</option>
            ))}
          </select>
        </div>

        {/* Status Filter - Mobile Optimized */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status Kehadiran</label>
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
            {['', 'hadir', 'terlambat', 'izin', 'sakit', 'alfa'].map((s) => (
              <button
                key={s || 'semua'}
                onClick={() => setStatus(s)}
                className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm border transition-colors ${
                  status === s 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Semua'}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Reset */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cari NIS/Nama</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Masukkan NIS atau nama siswa"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setKelas(''); setStatus(''); setSearch(''); }}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Filter Info */}
      <div className="text-xs text-gray-600 mb-3 p-2 bg-gray-50 rounded-md">
        <span className="font-medium">Filter aktif:</span> 
        <span className="ml-1">
          Kelas: {kelas ? kelasList.find((k) => String(k.id) === String(kelas))?.label : 'Semua'}
        </span>
        <span className="mx-1">•</span>
        <span>Status: {status ? status : 'Semua'}</span>
      </div>

      {/* Table Section - Mobile Optimized */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Mobile Card View */}
        <div className="block sm:hidden">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {status
                ? `Belum ada data siswa yang ${status}`
                : 'Belum ada data absensi hari ini'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filtered.map((item, idx) => (
                <div key={item.absensi_id ?? `${item.nis}-${idx}`} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-gray-900">{item.nama}</div>
                      <div className="text-sm text-gray-500">NIS: {item.nis}</div>
                    </div>
                    <div className="text-xs text-gray-500">#{idx + 1}</div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    {item.tingkat} {item.jurusan?.nama_jurusan ?? item.jurusan} {item.paralel}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500 mb-1">Status</div>
                      <StatusDropdown item={item} />
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Jam Datang</div>
                      <div className="font-medium">{item.jam_datang || '-'}</div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm">
                    <div className="text-gray-500 mb-1">Jam Pulang</div>
                    <div className="font-medium">{item.jam_pulang || '-'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="table-base">
            <thead className="table-thead">
              <tr>
                <th className="table-th">No</th>
                <th className="table-th">NIS</th>
                <th className="table-th">Nama</th>
                <th className="table-th">Kelas</th>
                <th className="table-th">Status</th>
                <th className="table-th">Jam Datang</th>
                <th className="table-th">Jam Pulang</th>
              </tr>
            </thead>
            <tbody className="table-tbody">
              {filtered.length === 0 ? (
                <tr>
                  <td className="table-td text-center" colSpan={7}>
                    {status
                      ? `Belum ada data siswa yang ${status}`
                      : 'Belum ada data absensi hari ini'}
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.absensi_id ?? `${item.nis}-${idx}`} className="table-tr">
                    <td className="table-td">{idx + 1}</td>
                    <td className="table-td">{item.nis}</td>
                    <td className="table-td">{item.nama}</td>
                    <td className="table-td">
                      {item.tingkat} {item.jurusan?.nama_jurusan ?? item.jurusan} {item.paralel}
                    </td>
                    <td className="table-td">
                      <StatusDropdown item={item} />
                    </td>
                    <td className="table-td">{item.jam_datang || '-'}</td>
                    <td className="table-td">{item.jam_pulang || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
