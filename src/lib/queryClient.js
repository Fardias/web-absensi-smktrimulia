import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 2 times
      retry: 2,
      // Retry delay
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus (good for real-time data)
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

// Query keys factory for consistency
export const queryKeys = {
  // Dashboard data
  dashboard: {
    all: ['dashboard'],
    stats: () => [...queryKeys.dashboard.all, 'stats'],
    activities: () => [...queryKeys.dashboard.all, 'activities'],
    trends: (days = 7) => [...queryKeys.dashboard.all, 'trends', days],
  },
  
  // Students data
  students: {
    all: ['students'],
    list: (filters) => [...queryKeys.students.all, 'list', filters],
    detail: (id) => [...queryKeys.students.all, 'detail', id],
    attendance: (id, date) => [...queryKeys.students.all, id, 'attendance', date],
    history: (id) => [...queryKeys.students.all, id, 'history'],
  },
  
  // Classes data
  classes: {
    all: ['classes'],
    list: () => [...queryKeys.classes.all, 'list'],
    detail: (id) => [...queryKeys.classes.all, 'detail', id],
    attendance: (id, date) => [...queryKeys.classes.all, id, 'attendance', date],
  },
  
  // Attendance data
  attendance: {
    all: ['attendance'],
    today: () => [...queryKeys.attendance.all, 'today'],
    byDate: (date) => [...queryKeys.attendance.all, 'date', date],
    byClass: (classId, date) => [...queryKeys.attendance.all, 'class', classId, date],
    reports: (filters) => [...queryKeys.attendance.all, 'reports', filters],
  },
  
  // User data
  user: {
    all: ['user'],
    profile: () => [...queryKeys.user.all, 'profile'],
    settings: () => [...queryKeys.user.all, 'settings'],
  },
  
  // Settings
  settings: {
    all: ['settings'],
    general: () => [...queryKeys.settings.all, 'general'],
  },
};

// Cache invalidation helpers
export const invalidateQueries = {
  dashboard: () => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
  students: () => queryClient.invalidateQueries({ queryKey: queryKeys.students.all }),
  classes: () => queryClient.invalidateQueries({ queryKey: queryKeys.classes.all }),
  attendance: () => queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all }),
  user: () => queryClient.invalidateQueries({ queryKey: queryKeys.user.all }),
  all: () => queryClient.invalidateQueries(),
};