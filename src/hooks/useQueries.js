import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI, guruAPI, generalAPI, authAPI } from '../services/api';
import { queryKeys, invalidateQueries } from '../lib/queryClient';
import { handleApiError } from '../services/api';
import toast from 'react-hot-toast';

// Dashboard Queries
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: async () => {
      const response = await adminAPI.dashboard();
      return response.data?.responseData || response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard stats
  });
};

export const useDashboardActivities = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.activities(),
    queryFn: async () => {
      const response = await adminAPI.aktivitas();
      return response.data?.responseData || response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time feel
  });
};

export const useDashboardTrends = (days = 7) => {
  return useQuery({
    queryKey: queryKeys.dashboard.trends(days),
    queryFn: async () => {
      // Implementation for trend data
      const results = await Promise.all(
        Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          return adminAPI.rekap({ tanggal: dateStr });
        })
      );
      
      return results.map((result, index) => {
        const data = result?.data?.responseData?.rekap || [];
        const total = data.reduce((sum, item) => sum + (item.hadir || 0) + (item.terlambat || 0) + (item.izin || 0) + (item.sakit || 0) + (item.alfa || 0), 0);
        const hadir = data.reduce((sum, item) => sum + (item.hadir || 0) + (item.terlambat || 0), 0);
        const rate = total > 0 ? Math.round((hadir / total) * 100) : 0;
        
        const date = new Date();
        date.setDate(date.getDate() - index);
        
        return {
          label: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`,
          rate
        };
      }).reverse();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Students Queries
export const useStudentsList = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.students.list(filters),
    queryFn: async () => {
      const response = await adminAPI.listSiswa(filters);
      return response.data?.responseData || response.data;
    },
  });
};

export const useStudentDetail = (studentId) => {
  return useQuery({
    queryKey: queryKeys.students.detail(studentId),
    queryFn: async () => {
      const response = await adminAPI.detailSiswa(studentId);
      return response.data?.responseData || response.data;
    },
    enabled: !!studentId,
  });
};

// Classes Queries
export const useClassesList = () => {
  return useQuery({
    queryKey: queryKeys.classes.list(),
    queryFn: async () => {
      const response = await generalAPI.listKelas();
      return response.data?.responseData || response.data;
    },
    staleTime: 10 * 60 * 1000, // Classes don't change often
  });
};

// Attendance Queries
export const useAttendanceByClass = (classId, date) => {
  return useQuery({
    queryKey: queryKeys.attendance.byClass(classId, date),
    queryFn: async () => {
      const response = await guruAPI.lihatAbsensi({ kelas: classId, tanggal: date });
      return response.data?.responseData || response.data;
    },
    enabled: !!(classId && date),
  });
};

export const useAttendanceReports = (filters) => {
  return useQuery({
    queryKey: queryKeys.attendance.reports(filters),
    queryFn: async () => {
      const response = await adminAPI.rekap(filters);
      return response.data?.responseData || response.data;
    },
    enabled: !!filters,
  });
};

// User Queries
export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: async () => {
      const response = await authAPI.profile();
      return response.data?.responseData || response.data;
    },
  });
};

// Settings Queries
export const useSettings = () => {
  return useQuery({
    queryKey: queryKeys.settings.general(),
    queryFn: async () => {
      const response = await generalAPI.getPengaturan();
      return response.data?.responseData || response.data;
    },
    staleTime: 15 * 60 * 1000, // Settings rarely change
  });
};

// Mutations
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ studentId, data }) => {
      const response = await adminAPI.updateSiswa(studentId, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch student data
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(variables.studentId) });
      toast.success('Data siswa berhasil diperbarui');
    },
    onError: (error) => {
      const message = handleApiError(error, 'Gagal memperbarui data siswa');
      toast.error(message);
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (studentId) => {
      const response = await adminAPI.deleteSiswa(studentId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      toast.success('Siswa berhasil dihapus');
    },
    onError: (error) => {
      const message = handleApiError(error, 'Gagal menghapus siswa');
      toast.error(message);
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ studentId, date, status }) => {
      const response = await guruAPI.updateStatusAbsensi(studentId, { status, tanggal: date });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate attendance queries
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success('Status absensi berhasil diperbarui');
    },
    onError: (error) => {
      const message = handleApiError(error, 'Gagal memperbarui status absensi');
      toast.error(message);
    },
  });
};

// Prefetch helpers
export const usePrefetchQueries = () => {
  const queryClient = useQueryClient();
  
  const prefetchStudents = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.students.list(),
      queryFn: async () => {
        const response = await adminAPI.listSiswa();
        return response.data?.responseData || response.data;
      },
    });
  };
  
  const prefetchClasses = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.classes.list(),
      queryFn: async () => {
        const response = await generalAPI.listKelas();
        return response.data?.responseData || response.data;
      },
    });
  };
  
  return { prefetchStudents, prefetchClasses };
};