import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { authAPI, adminAPI } from "../services/api";
import { Loading } from "../components";
import Swal from "sweetalert2";

export default function Profil() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [nama, setNama] = useState("");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await authAPI.profile();
        const pdata = res?.data?.responseData ?? null;
        setProfile(pdata);
        if (user?.role !== "siswa") {
          setNama(pdata?.nama || "");
        }
      } catch (e) {
        setErr("Gagal memuat profil");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading && !profile) {
    return <Loading text="Memuat profil..." />;
  }

  const roleColor =
    user?.role === "admin"
      ? "bg-purple-100 text-purple-700"
      : user?.role === "gurket"
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
              {(profile?.nama || user?.nama || user?.username || "-")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {profile?.nama || user?.nama || "-"}
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
                {profile?.username || user?.username || "-"}
              </span>
            </div>

            {/* Nama */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
              <div className="flex items-center gap-3">
                <span className="text-gray-500">Nama</span>
              </div>
              <span className="text-gray-900 font-medium">
                {profile?.nama || user?.nama || "-"}
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

          {user?.role !== "siswa" && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubah Nama</h3>
              <div className="flex items-center gap-3">
                <input value={nama} onChange={(e) => setNama(e.target.value)} className="flex-1 border border-gray-300 rounded px-3 py-2" placeholder="Nama" />
                <button disabled={saving} onClick={async () => {
                  try {
                    setSaving(true); setErr(null);
                    if (user?.role === "admin") {
                      await adminAPI.updateMyProfile({ nama });
                    } else {
                      await authAPI.updateProfile({ nama });
                    }
                    const r = await authAPI.profile();
                    setProfile(r?.data?.responseData);
                    Swal.fire({ icon: "success", title: "Berhasil", text: "Nama berhasil diperbarui" });
                  }
                  catch (e) {
                    const msg = e?.response?.data?.responseMessage || "Gagal memperbarui nama";
                    setErr(msg);
                    Swal.fire({ icon: "error", title: "Gagal", text: msg });
                  }
                  finally { setSaving(false); }
                }} className="px-4 py-2 rounded bg-[#003366] text-white disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </div>
                  ) : (
                    'Simpan'
                  )}
                </button>
              </div>
            </div>
          )}

          {user?.role !== "siswa" && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reset Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} className="border border-gray-300 rounded px-3 py-2" placeholder="Password lama" />
                <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="border border-gray-300 rounded px-3 py-2" placeholder="Password baru" />
                <button disabled={changing} onClick={async () => {
                  try {
                    setChanging(true); setErr(null); await authAPI.resetPassword({ old_password: oldPass, new_password: newPass }); setOldPass(""); setNewPass(""); Swal.fire({ icon: "success", title: "Berhasil", text: "Password berhasil diubah" });
                  }
                  catch (e) {
                    const msg = e?.response?.data?.responseMessage || "Gagal mengubah password";
                    setErr(msg);
                    Swal.fire({ icon: "error", title: "Gagal", text: msg });
                  }
                  finally {
                    setChanging(false);
                  }
                }} className="px-4 py-2 rounded bg-[#003366] text-white disabled:opacity-50 disabled:cursor-not-allowed">
                  {changing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Memproses...
                    </div>
                  ) : (
                    'Ganti Password'
                  )}
                </button>
              </div>
            </div>
          )}

          {err && <div className="mt-3 text-red-600 font-semibold">{err}</div>}
        </div>
      </main>
    </div>
  );
}
