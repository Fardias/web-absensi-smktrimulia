import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { createSidebarItems, iconComponents } from "./sidebarConfig.jsx";
import Swal from "sweetalert2";

export default function SideBar({ defaultCollapsed = false, onToggle }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [openMenus, setOpenMenus] = useState(new Set());
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = React.useCallback(async () => {
    const result = await Swal.fire({
      title: "Konfirmasi Logout",
      text: "Anda yakin ingin keluar dari aplikasi?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#003366",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, keluar",
      cancelButtonText: "Batal",
    });
    if (result.isConfirmed) {
      logout();
      navigate("/login");
    }
  }, [logout, navigate]);

  const items = React.useMemo(
    () => createSidebarItems(handleLogout, user?.role),
    [handleLogout, user?.role]
  );

  const isActive = (href) => location.pathname === href;
  const isChildActive = (children) =>
    children?.some((c) => location.pathname === c.href);

  useEffect(() => {
    const activeParent = items.find(
      (item) =>
        item.children &&
        item.children.some((child) => location.pathname === child.href)
    );
    if (activeParent) {
      setOpenMenus((prev) => {
        // Jika sudah terbuka, jangan update agar tidak memicu render ulang
        if (prev.has(activeParent.key)) return prev;
        const next = new Set(prev);
        next.add(activeParent.key);
        return next;
      });
    }
  }, [location.pathname, items]);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const newState = !prev;
      if (newState) setOpenMenus(new Set()); // tutup semua submenu saat collapse
      return newState;
    });
    if (onToggle) onToggle();
  };

  const handleMenuClick = (item) => {
    if (item.children) {
      setOpenMenus((prev) => {
        const next = new Set(prev);
        if (next.has(item.key)) {
          next.delete(item.key);
        } else {
          next.add(item.key);
        }
        return next;
      });
      return;
    }
    if (item.key === "logout") {
      item.onClick?.();
      return;
    }
    navigate(item.href);
  };

  return (
    <aside
      className={`fixed top-0 left-0 flex flex-col bg-slate-900 text-slate-100 transition-all duration-200 
      ${collapsed ? "w-[72px]" : "w-[260px]"} h-screen p-3 z-20`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-2">
        {!collapsed && (
          <div>
            <h1 className="font-bold text-base whitespace-nowrap">
              SMK TRIMULIA JAKARTA
            </h1>
            <p className="text-sm">SISENUS - Sistem Absensi Radius</p>
          </div>
        )}
      </div>

      {/* Toggle Button (di atas Beranda) */}
      <button
        onClick={toggleSidebar}
        aria-label="toggle sidebar"
        className={`
          flex items-center gap-2 px-2 py-2 rounded-md mb-3 transition
          bg-slate-800 hover:bg-slate-700 text-sm
          ${collapsed ? "justify-center" : "w-full"}
        `}
      >
        {collapsed ? "☰" : "← Tutup Sidebar"}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        {items.map((item) => {
          const activeMain =
            isActive(item.href) || isChildActive(item.children);

          return (
            <div key={item.key}>
              <div
                onClick={() => {
                  if (item.children) {
                    setOpenMenus((prev) => {
                      const next = new Set(prev);
                      if (next.has(item.key)) {
                        next.delete(item.key);
                      } else {
                        next.add(item.key);
                      }
                      return next;
                    });
                  } else {
                    handleMenuClick(item);
                  }
                }}
                className={`flex items-center justify-between px-2 py-2.5 rounded-md cursor-pointer transition-colors 
                ${activeMain
                    ? "bg-blue-600/30 text-white"
                    : "text-slate-300 hover:bg-white/5"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 flex justify-center">
                    {iconComponents[item.icon]()}
                  </div>
                  {!collapsed && (
                    <span
                      className={`text-sm ${activeMain ? "font-semibold" : ""}`}
                    >
                      {item.label}
                    </span>
                  )}
                </div>

                {/* Arrow submenu */}
                {item.children && !collapsed && (
                  <div className="text-xs">
                    {openMenus.has(item.key) ? "▾" : "▸"}
                  </div>
                )}
              </div>

              {/* Submenu */}
              {item.children && !collapsed && openMenus.has(item.key) && (
                <div className="ml-7 mt-1">
                  {item.children.map((child) => (
                    <div
                      key={child.key}
                      onClick={() => navigate(child.href)}
                      className={`px-2 py-2 rounded-md text-sm cursor-pointer transition 
                      ${isActive(child.href)
                          ? "bg-blue-600/40 text-white"
                          : "text-slate-400 hover:bg-white/5"
                        }`}
                    >
                      {child.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="text-xs text-blue-300 px-2 py-2">
        {/* {!collapsed ? "Versi 1.0 — © SMK Trimulia" : "v1.0"} */}
      </div>
    </aside>
  );
}
