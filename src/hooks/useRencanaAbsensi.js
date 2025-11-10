import { useState, useEffect, useCallback } from "react";
import { guruAPI, utilityAPI } from "../services/api";

export const useRencanaAbsensi = () => {
  const [data, setData] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data rencana absensi dan kelas
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resRencana, resKelas] = await Promise.all([
        guruAPI.getRencanaAbsensi(),
        utilityAPI.listKelas(),
      ]);

      if (resRencana.data.responseStatus) {
        setData(resRencana.data.responseData);
      } else {
        setError(resRencana.data.responseMessage || "Gagal memuat data");
      }

      if (resKelas.data.responseStatus) {
        setKelasList(resKelas.data.responseData);
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    kelasList,
    loading,
    error,
    refreshData,
  };
};

export const useRencanaAbsensiForm = (refreshData) => {
  const [formData, setFormData] = useState({
    tanggal: "",
    status_hari: "",
    keterangan: "",
    kelas_id: "",
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      tanggal: "",
      status_hari: "",
      keterangan: "",
      kelas_id: "",
    });
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const res = await guruAPI.createRencanaAbsensi(formData);
        if (res.data.responseStatus) {
          await refreshData(); 
          resetForm();
          return { success: true, message: "Rencana absensi berhasil ditambahkan!" };
        } else {
          return {
            success: false,
            message: res.data.responseMessage || "Gagal menambahkan data",
          };
        }
      } catch {
        return { success: false, message: "Terjadi kesalahan saat mengirim data" };
      }
    },
    [formData, refreshData, resetForm]
  );

  return {
    formData,
    handleChange,
    handleSubmit,
    resetForm,
  };
};