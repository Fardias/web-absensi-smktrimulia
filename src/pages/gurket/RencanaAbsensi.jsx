import React, { useState } from "react";
import { 
  Loading, 
  Error, 
  Notification, 
  RencanaAbsensiModal, 
  RencanaAbsensiList 
} from "../../components";
import { useRencanaAbsensi, useRencanaAbsensiForm } from "../../hooks";

const RencanaAbsensi = () => {
  const { data, kelasList, loading, error } = useRencanaAbsensi();
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const { formData, handleChange, handleSubmit, resetForm } = useRencanaAbsensiForm(async () => {
    // Refresh data setelah submit berhasil akan ditangani di handleSubmit
  });

  const showAlert = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFormSubmit = async (e) => {
    const result = await handleSubmit(e);
    if (result.success) {
      showAlert("success", result.message);
      setShowModal(false);
      resetForm();
      window.location.reload();
    } else {
      showAlert("error", result.message);
    }
  };

  if (loading) return <Loading text="Memuat data rencana absensi..." />;
  if (error) return <Error message={error} />;

  return (
    <div className="max-w-6xl p-6 relative">
      <Notification notification={notification} />

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Rencana Absensi Siswa
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
        >
          + Tambah Rencana
        </button>
      </div>

      <RencanaAbsensiList data={data} />

      <RencanaAbsensiModal
        show={showModal}
        onClose={() => setShowModal(false)}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleFormSubmit}
        kelasList={kelasList}
      />

      {/* Animations */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideIn { animation: slideIn 0.4s ease forwards; }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default RencanaAbsensi;
