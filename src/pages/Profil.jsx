import { useAuth } from "../contexts/AuthContext";

export default function Profil() {
  const { user } = useAuth();

  const roleColor =
    user?.role === "admin"
      ? "bg-purple-100 text-purple-700"
      : user?.role === "guru"
      ? "bg-blue-100 text-blue-700"
      : "bg-green-100 text-green-700";

      return (
    // <div className="flex flex-col p-6 md:p-8">

    <div className="min-h-screen p-6 md:p-8">
      <h2 className="mb-2 text-2xl font-bold text-gray-800">Informasi Profil</h2>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl">
              {(user?.name || user?.nama || user?.username || "-")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {user?.name || user?.nama || "-"}
              </h2>
              <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${roleColor}`}
              >
                {user?.role || "-"}
              </span>
            </div>
          </div>

          {/* Card informasi */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informasi Akun
          </h3>
          <div className="space-y-4 text-sm">
            {/* Username */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
              <div className="flex items-center gap-3">
                <span className="text-gray-500">Username</span>
              </div>
              <span className="text-gray-900 font-medium">
                {user?.username || "-"}
              </span>
            </div>

            {/* Nama */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
              <div className="flex items-center gap-3">
                <span className="text-gray-500">Nama</span>
              </div>
              <span className="text-gray-900 font-medium">
                {user?.name || user?.nama || "-"}
              </span>
            </div>

            {/* Role */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
              <div className="flex items-center gap-3">
                <span className="text-gray-500">Role</span>
              </div>
              <span className="text-gray-900 font-medium">
                {user?.role || "-"}
              </span>
            </div>

            {/* Kelas (jika ada) */}
            {user?.kelas?.nama && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">Kelas</span>
                </div>
                <span className="text-gray-900 font-medium">
                  {user.kelas.nama}
                </span>
              </div>
            )}
          </div>

          {/* Tombol aksi (opsional) */}
          <div className="mt-6 flex justify-end">
            <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition">
              Edit Profil
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
