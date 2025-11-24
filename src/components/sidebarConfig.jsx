export const createSidebarItems = (handleLogout, role) => {
  // Menu khusus Admin/Kepala Sekolah
  if (role === "admin" || role === "kepala_sekolah") {
    return [
      { key: "home", label: "Beranda", href: "/dashboard", icon: "HomeIcon" },
      { key: "rekap", label: "Rekap", href: "/dashboard/rekap", icon: "CalendarIcon" },
      {
        key: "kelola sekolah",
        label: "Kelola Sekolah",
        icon: "SchoolIcon",
        children: [
          { key: "jurusan", label: "Jurusan", href: "/dashboard/jurusan" },
          { key: "kelas", label: "Kelas", href: "/dashboard/kelas" },
          { key: "wali-kelas", label: "Wali Kelas", href: "/dashboard/wali-kelas" },
          { key: "guru-piket", label: "Guru Piket", href: "/dashboard/guru-piket" }
          ,{ key: "jadwal-piket", label: "Jadwal Piket", href: "/dashboard/jadwal-piket" }
        ],
      },
      { key: "pengaturan", label: "Pengaturan Sistem", href: "/dashboard/pengaturan", icon: "SettingsIcon" },
      { key: "profil", label: "Profil", href: "/profil", icon: "UserIcon" },
      { key: "logout", label: "Logout", href: "#", icon: "LogoutIcon", onClick: handleLogout },
    ];
  }

  // Menu khusus Wali Kelas: batasi item sesuai permintaan
  if (role === "walas") {
    return [
      { key: "home", label: "Beranda", href: "/dashboard", icon: "HomeIcon" },
      { key: "rekap-walas", label: "Rekap Absensi", href: "/dashboard/rekap-walas", icon: "CalendarIcon" },
      { key: "profil", label: "Profil", href: "/profil", icon: "UserIcon" },
      { key: "logout", label: "Logout", href: "#", icon: "LogoutIcon", onClick: handleLogout },
    ];
  }

  // Default menu (gurket) tetap seperti sebelumnya
  return [
    { key: "home", label: "Beranda", href: "/dashboard", icon: "HomeIcon" },
    {
      key: "absensi",
      label: "Absensi",
      icon: "CheckIcon",
      children: [
        { key: "absen-hari-ini", label: "Absen Hari Ini", href: "/dashboard/absensi-hari-ini" },
        { key: "izin-sakit", label: "Izin / Sakit", href: "/dashboard/siswa-izinsakit" },
        { key: "lihat-absensi", label: "Lihat Absensi", href: "/dashboard/lihat-absensi" },
        { key: "rencana-absensi", label: "Rencana Absensi", href: "/dashboard/rencana-absensi" }
      ],
    },
    {
      key: "siswa",
      label: "Kelola Siswa",
      icon: "UsersIcon",
      children: [
        { key: "import-siswa", label: "Import Data Siswa", href: "/dashboard/import-siswa" },
        { key: "kelola-siswa", label: "Kelola Data Siswa", href: "/dashboard/kelola-siswa" },
      ],
    },
    { key: "profil", label: "Profil", href: "/profil", icon: "UserIcon" },
    { key: "logout", label: "Logout", href: "#", icon: "LogoutIcon", onClick: handleLogout },
  ];
};

export const iconComponents = {
  SettingsIcon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="#cfe6ff" strokeWidth="1.6" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .32 1.76l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.76-.32 1.6 1.6 0 0 0-1 1.46V21a2 2 0 0 1-4 0v-.05a1.6 1.6 0 0 0-1-1.46 1.6 1.6 0 0 0-1.76.32l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.6 1.6 0 0 0 .32-1.76 1.6 1.6 0 0 0-1.46-1H3a2 2 0 0 1 0-4h.05a1.6 1.6 0 0 0 1.46-1 1.6 1.6 0 0 0-.32-1.76l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.6 1.6 0 0 0 1.76.32 1.6 1.6 0 0 0 1-1.46V3a2 2 0 0 1 4 0v.05a1.6 1.6 0 0 0 1 1.46 1.6 1.6 0 0 0 1.76-.32l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.32 1.76 1.6 1.6 0 0 0 1.46 1H21a2 2 0 0 1 0 4h-.05a1.6 1.6 0 0 0-1.46 1Z" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  HomeIcon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 10.5L12 4l9 6.5"
        stroke="#cfe6ff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 21V11.5h14V21"
        stroke="#cfe6ff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  CheckIcon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 6L9 17l-5-5"
        stroke="#cfe6ff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  CalendarIcon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="#cfe6ff"
        strokeWidth="1.6"
      />
      <path
        d="M16 3v4M8 3v4"
        stroke="#cfe6ff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  UsersIcon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
        stroke="#cfe6ff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="7" r="4" stroke="#cfe6ff" strokeWidth="1.6" />
    </svg>
  ),
  UserIcon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3" stroke="#cfe6ff" strokeWidth="1.6" />
      <path
        d="M6 20v-1a6 6 0 0 1 12 0v1"
        stroke="#cfe6ff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  LogoutIcon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke="#cfe6ff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17l5-5-5-5"
        stroke="#cfe6ff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12H9"
        stroke="#cfe6ff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  // school
  SchoolIcon: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-school-icon lucide-school"><path d="M14 21v-3a2 2 0 0 0-4 0v3" /><path d="M18 5v16" /><path d="m4 6 7.106-3.79a2 2 0 0 1 1.788 0L20 6" /><path d="m6 11-3.52 2.147a1 1 0 0 0-.48.854V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a1 1 0 0 0-.48-.853L18 11" /><path d="M6 5v16" /><circle cx="12" cy="9" r="2" /></svg>

  )

};