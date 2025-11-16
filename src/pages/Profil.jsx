import { useAuth } from "../contexts/AuthContext";
import { Header } from "../components";

export default function Profil() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Profil" subtitle="SMK Trimulia" />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Akun</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Username</span>
              <span className="text-gray-900 font-medium">{user?.username || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Nama</span>
              <span className="text-gray-900 font-medium">{user?.name || user?.nama || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Role</span>
              <span className="text-gray-900 font-medium">{user?.role || '-'}</span>
            </div>
            {user?.kelas?.nama && (
              <div className="flex justify-between">
                <span className="text-gray-500">Kelas</span>
                <span className="text-gray-900 font-medium">{user.kelas.nama}</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}