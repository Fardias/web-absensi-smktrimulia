// Format waktu ke format Indonesia (HH:MM:SS)
export const formatTime = (date) => {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Format tanggal ke format Indonesia (Hari, DD MMMM YYYY)
export const formatDate = (date) => {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format tanggal singkat (DD/MM/YYYY)
export const formatDateShort = (date) => {
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Cek apakah waktu saat ini sudah melewati jam tertentu
export const isTimeAfter = (targetHour, targetMinute = 0) => {
  const now = new Date();
  const targetTime = new Date();
  targetTime.setHours(targetHour, targetMinute, 0, 0);
  return now >= targetTime;
};

// Cek apakah waktu saat ini sebelum jam tertentu
export const isTimeBefore = (targetHour, targetMinute = 0) => {
  const now = new Date();
  const targetTime = new Date();
  targetTime.setHours(targetHour, targetMinute, 0, 0);
  return now < targetTime;
};
