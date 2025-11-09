export const createSidebarItems = (handleLogout) => [
  { key: "home", label: "Beranda", href: "/dashboard", icon: "HomeIcon" },
  {
    key: "absensi",
    label: "Absensi",
    icon: "CheckIcon",
    children: [
      {
        key: "absen-hari-ini",
        label: "Absen Hari Ini",
        href: "/dashboard/absensi-hari-ini",
      },
      {
        key: "izin-sakit",
        label: "Izin / Sakit",
        href: "/dashboard/siswa-izinsakit",
      },
      {
        key: "lihat-absensi",
        label: "Lihat Absensi",
        href: "/dashboard/lihat-absensi",
      },
      {
        key: "rencana-absensi",
        label: "Rencana Absensi",
        href: "/dashboard/rencana-absensi"
      }
    ],
  },
  { key: "jadwal", label: "Jadwal", href: "/jadwal", icon: "CalendarIcon" },
  {
    key: "siswa",
    label: "Siswa",
    icon: "UsersIcon",
    children: [
      {
        key: "import-siswa",
        label: "Import Data Siswa",
        href: "/dashboard/import-siswa",
      },
      {
        key: "kelola-siswa",
        label: "Kelola Data Siswa",
        href: "/dashboard/kelola-siswa",
      },
    ],
  },
  { key: "profil", label: "Profil", href: "/profil", icon: "UserIcon" },
  {
    key: "logout",
    label: "Logout",
    href: "#",
    icon: "LogoutIcon",
    onClick: handleLogout,
  },
];

// Mapping nama icon ke komponen icon
export const iconComponents = {
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
};