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
          { key: "jurusan", label: "Jurusan", href: "/dashboard/jurusan", icon: "BookOpenIcon" },
          { key: "wali-kelas", label: "Wali Kelas", href: "/dashboard/wali-kelas", icon: "UsersIcon" },
          { key: "kelas", label: "Kelas", href: "/dashboard/kelas", icon: "BuildingIcon" },
          { key: "guru-piket", label: "Guru Piket", href: "/dashboard/guru-piket", icon: "UsersIcon" }
          , { key: "jadwal-piket", label: "Jadwal Piket", href: "/dashboard/jadwal-piket", icon: "ClockIcon" },
          { key: "import-siswa", label: "Import Data Siswa", href: "/dashboard/import-siswa", icon: "UploadIcon" },
          { key: "kelola-siswa", label: "Kelola Data Siswa", href: "/dashboard/kelola-siswa", icon: "UsersIcon" },
          { key: "riwayat-kelas", label: "Riwayat Kelas", href: "/dashboard/riwayat-kelas", icon: "HistoryIcon" },
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
        { key: "absen-hari-ini", label: "Absen Hari Ini", href: "/dashboard/absensi-hari-ini", icon: "CalendarCheckIcon" },
        { key: "izin-sakit", label: "Izin / Sakit", href: "/dashboard/siswa-izinsakit", icon: "HeartHandshakeIcon" },
        { key: "lihat-absensi", label: "Lihat Absensi", href: "/dashboard/lihat-absensi", icon: "EyeIcon" },
        { key: "rencana-absensi", label: "Rencana Absensi", href: "/dashboard/rencana-absensi", icon: "CalendarPlusIcon" }
      ],
    },
    // {
    //   key: "siswa",
    //   label: "Siswa",
    //   icon: "UsersIcon",
    //   children: [

    //   ],
    // },
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
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-school-icon lucide-school"><path d="M14 21v-3a2 2 0 0 0-4 0v3" /><path d="M18 5v16" /><path d="m4 6 7.106-3.79a2 2 0 0 1 1.788 0L20 6" /><path d="m6 11-3.52 2.147a1 1 0 0 0-.48.854V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a1 1 0 0 0-.48-.853L18 11" /><path d="M6 5v16" /><circle cx="12" cy="9" r="2" /></svg>
  ),
  
  // Icons for Kelola Sekolah submenu
  BookOpenIcon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  
  UserCheckIcon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" stroke="#cfe6ff" strokeWidth="1.6" />
      <path d="m16 11 2 2 4-4" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  
  BuildingIcon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="2" width="16" height="20" rx="2" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 22v-4h6v4" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  
  ShieldIcon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  
  ClockIcon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#cfe6ff" strokeWidth="1.6" />
      <path d="M12 6v6l4 2" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  
  UploadIcon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 8l-5-5-5 5" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3v12" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  
  HistoryIcon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 3v5h5" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7v5l4 2" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  
  // Icons for Absensi submenu
  CalendarCheckIcon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#cfe6ff" strokeWidth="1.6" />
      <path d="M16 2v4M8 2v4" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 10h18" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9 16 2 2 4-4" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  
  HeartHandshakeIcon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 5L8 21l4-7 4 7-4-16" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  
  EyeIcon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="#cfe6ff" strokeWidth="1.6" />
    </svg>
  ),
  
  CalendarPlusIcon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#cfe6ff" strokeWidth="1.6" />
      <path d="M16 2v4M8 2v4" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 10h18" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 16h4M12 14v4" stroke="#cfe6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

};
