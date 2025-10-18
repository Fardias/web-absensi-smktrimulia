import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SideBar({ defaultCollapsed = false }) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);
    const [openMenu, setOpenMenu] = useState(null);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const items = [
        { key: "home", label: "Beranda", href: "/beranda", icon: HomeIcon },
        {
            key: "absensi",
            label: "Absensi",
            icon: CheckIcon,
            children: [
                { key: "absen-hari-ini", label: "Absen Hari Ini", href: "/absensi/hari-ini" },
                { key: "izin-sakit", label: "Izin / Sakit", href: "/absensi/izin" },
            ],
        },
        { key: "jadwal", label: "Jadwal", href: "/jadwal", icon: CalendarIcon },
        {
            key: "siswa",
            label: "Siswa",
            icon: UsersIcon,
            children: [
                { key: "import-siswa", label: "Import Data Siswa", href: "/dashboard/import-siswa" }
            ]
        },
        { key: "profil", label: "Profil", href: "/profil", icon: UserIcon },
        { key: "logout", label: "Logout", href: "#", icon: LogoutIcon, onClick: handleLogout },
    ];

    return (
        <aside
            style={{
                width: collapsed ? 72 : 240,
                height: "100vh",
                background: "#0f172a",
                color: "#e6eef8",
                transition: "width 180ms ease",
                display: "flex",
                flexDirection: "column",
                padding: "12px 8px",
                boxSizing: "border-box",
            }}
        >
            {/* Header Logo + Collapse Button */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px",
                }}
            >
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: "#1e293b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        color: "#fff",
                        fontSize: 18,
                    }}
                >
                    SM
                </div>
                {!collapsed && (
                    <div style={{ fontSize: 16, fontWeight: 700 }}>SMK Trimulia</div>
                )}
                <div style={{ marginLeft: "auto" }}>
                    <button
                        onClick={() => setCollapsed((c) => !c)}
                        aria-label="toggle sidebar"
                        style={{
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.06)",
                            color: "#e6eef8",
                            padding: 6,
                            borderRadius: 6,
                            cursor: "pointer",
                        }}
                    >
                        {collapsed ? "→" : "←"}
                    </button>
                </div>
            </div>

            {/* Navigasi */}
            <nav style={{ marginTop: 12, flex: 1 }}>
                {items.map((item) => (
                    <div key={item.key}>
                        {/* Menu utama */}
                        <div
                            onClick={() => {
                                if (item.children) {
                                    setOpenMenu(openMenu === item.key ? null : item.key);
                                } else if (item.key === "logout") {
                                    item.onClick?.();
                                } else {
                                    navigate(item.href);
                                }
                            }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px 8px",
                                color: "#cfe6ff",
                                borderRadius: 8,
                                margin: "6px 4px",
                                cursor: "pointer",
                                transition: "background .12s",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "transparent")
                            }
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div
                                    style={{
                                        width: 28,
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <item.icon />
                                </div>
                                {!collapsed && <span style={{ fontSize: 14 }}>{item.label}</span>}
                            </div>
                            {item.children && !collapsed && (
                                <span style={{ fontSize: 12 }}>
                                    {openMenu === item.key ? "▾" : "▸"}
                                </span>
                            )}
                        </div>

                        {/* Submenu */}
                        {item.children && openMenu === item.key && !collapsed && (
                            <div style={{ marginLeft: 28 }}>
                                {item.children.map((child) => (
                                    <div
                                        key={child.key}
                                        onClick={() => navigate(child.href)}
                                        style={{
                                            padding: "8px 8px",
                                            borderRadius: 6,
                                            margin: "4px 0",
                                            fontSize: 13,
                                            color: "#bcd7ff",
                                            cursor: "pointer",
                                            transition: "background .12s",
                                        }}
                                        onMouseEnter={(e) =>
                                        (e.currentTarget.style.background =
                                            "rgba(255,255,255,0.05)")
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.background = "transparent")
                                        }
                                    >
                                        {child.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* Footer Versi */}
            <div style={{ padding: 8, fontSize: 12, color: "#93c5fd" }}>
                {!collapsed ? "Versi 1.0 — © SMK Trimulia" : "v1.0"}
            </div>
        </aside>
    );
}

/* ========================== */
/* ==== Icon Components ===== */
/* ========================== */

function HomeIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
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
    );
}

function CheckIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
                d="M20 6L9 17l-5-5"
                stroke="#cfe6ff"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
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
    );
}

function UsersIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
                d="M17 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
                stroke="#cfe6ff"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="12" cy="7" r="4" stroke="#cfe6ff" strokeWidth="1.6" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="8" r="3" stroke="#cfe6ff" strokeWidth="1.6" />
            <path
                d="M6 20v-1a6 6 0 0 1 12 0v1"
                stroke="#cfe6ff"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

function LogoutIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
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
    );
}
