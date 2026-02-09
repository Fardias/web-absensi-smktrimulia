import { lazy, Suspense } from 'react';
import { DashboardSkeleton, TableSkeleton, FormSkeleton, ProfileSkeleton } from './LoadingSkeleton';

// Lazy load heavy components
const Dashboard = lazy(() => import('../pages/Dashboard'));
const AdminRekap = lazy(() => import('../pages/admin/Rekap'));
const KelolaDataSiswa = lazy(() => import('../pages/admin/KelolaDataSiswa'));
const LihatAbsensi = lazy(() => import('../pages/gurket/LihatAbsensi'));
const LihatAbsensiHariIni = lazy(() => import('../pages/gurket/LihatAbsensiHariIni'));
const RiwayatAbsensi = lazy(() => import('../pages/siswa/RiwayatAbsensi'));
const IzinSakit = lazy(() => import('../pages/siswa/IzinSakit'));
const Profil = lazy(() => import('../pages/Profil'));

// Admin pages
const ImportSiswa = lazy(() => import('../pages/admin/ImportSiswa'));
const AdminPengaturan = lazy(() => import('../pages/admin/Pengaturan'));
const Jurusan = lazy(() => import('../pages/admin/Jurusan'));
const Kelas = lazy(() => import('../pages/admin/Kelas'));
const WaliKelas = lazy(() => import('../pages/admin/WaliKelas'));
const GuruPiket = lazy(() => import('../pages/admin/GuruPiket'));
const JadwalPiket = lazy(() => import('../pages/admin/JadwalPiket'));
const RiwayatKelas = lazy(() => import('../pages/admin/RiwayatKelas'));

// Guru Piket pages
const SiswaIzinSakit = lazy(() => import('../pages/gurket/SiswaIzinSakit'));
const RencanaAbsensi = lazy(() => import('../pages/gurket/RencanaAbsensi'));

// Wali Kelas pages
const RekapWalas = lazy(() => import('../pages/walas/RekapWalas'));

// Siswa pages
const SiswaHome = lazy(() => import('../pages/siswa/Home'));
const AbsenDatang = lazy(() => import('../pages/siswa/AbsenDatang'));
const AbsenPulang = lazy(() => import('../pages/siswa/AbsenPulang'));
const SiswaProfil = lazy(() => import('../pages/siswa/Profil'));

// Wrapper components with appropriate skeletons
export const LazyDashboard = () => (
  <Suspense fallback={<DashboardSkeleton />}>
    <Dashboard />
  </Suspense>
);

export const LazyAdminRekap = () => (
  <Suspense fallback={<TableSkeleton rows={8} columns={7} />}>
    <AdminRekap />
  </Suspense>
);

export const LazyKelolaDataSiswa = () => (
  <Suspense fallback={<TableSkeleton rows={10} columns={6} />}>
    <KelolaDataSiswa />
  </Suspense>
);

export const LazyLihatAbsensi = () => (
  <Suspense fallback={<TableSkeleton rows={8} columns={5} />}>
    <LihatAbsensi />
  </Suspense>
);

export const LazyLihatAbsensiHariIni = () => (
  <Suspense fallback={<TableSkeleton rows={8} columns={5} />}>
    <LihatAbsensiHariIni />
  </Suspense>
);

export const LazyRiwayatAbsensi = () => (
  <Suspense fallback={<div className="min-h-screen bg-gray-50"><TableSkeleton rows={8} columns={4} /></div>}>
    <RiwayatAbsensi />
  </Suspense>
);

export const LazyIzinSakit = () => (
  <Suspense fallback={<FormSkeleton fields={4} />}>
    <IzinSakit />
  </Suspense>
);

export const LazyProfil = () => (
  <Suspense fallback={<ProfileSkeleton />}>
    <Profil />
  </Suspense>
);

export const LazyImportSiswa = () => (
  <Suspense fallback={<FormSkeleton fields={3} />}>
    <ImportSiswa />
  </Suspense>
);

export const LazyAdminPengaturan = () => (
  <Suspense fallback={<FormSkeleton fields={6} />}>
    <AdminPengaturan />
  </Suspense>
);

export const LazyJurusan = () => (
  <Suspense fallback={<TableSkeleton rows={5} columns={3} />}>
    <Jurusan />
  </Suspense>
);

export const LazyKelas = () => (
  <Suspense fallback={<TableSkeleton rows={8} columns={4} />}>
    <Kelas />
  </Suspense>
);

export const LazyWaliKelas = () => (
  <Suspense fallback={<TableSkeleton rows={6} columns={4} />}>
    <WaliKelas />
  </Suspense>
);

export const LazyGuruPiket = () => (
  <Suspense fallback={<TableSkeleton rows={6} columns={4} />}>
    <GuruPiket />
  </Suspense>
);

export const LazyJadwalPiket = () => (
  <Suspense fallback={<TableSkeleton rows={7} columns={3} />}>
    <JadwalPiket />
  </Suspense>
);

export const LazyRiwayatKelas = () => (
  <Suspense fallback={<TableSkeleton rows={8} columns={5} />}>
    <RiwayatKelas />
  </Suspense>
);

export const LazySiswaIzinSakit = () => (
  <Suspense fallback={<TableSkeleton rows={6} columns={5} />}>
    <SiswaIzinSakit />
  </Suspense>
);

export const LazyRencanaAbsensi = () => (
  <Suspense fallback={<FormSkeleton fields={4} />}>
    <RencanaAbsensi />
  </Suspense>
);

export const LazyRekapWalas = () => (
  <Suspense fallback={<TableSkeleton rows={8} columns={6} />}>
    <RekapWalas />
  </Suspense>
);

export const LazySiswaHome = () => (
  <Suspense fallback={<div className="min-h-screen bg-gray-50"><DashboardSkeleton /></div>}>
    <SiswaHome />
  </Suspense>
);

export const LazyAbsenDatang = () => (
  <Suspense fallback={<FormSkeleton fields={3} />}>
    <AbsenDatang />
  </Suspense>
);

export const LazyAbsenPulang = () => (
  <Suspense fallback={<FormSkeleton fields={2} />}>
    <AbsenPulang />
  </Suspense>
);

export const LazySiswaProfil = () => (
  <Suspense fallback={<ProfileSkeleton />}>
    <SiswaProfil />
  </Suspense>
);