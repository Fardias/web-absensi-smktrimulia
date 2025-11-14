import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { createSidebarItems, iconComponents } from "./sidebarConfig.jsx";

export default function SideBar({ defaultCollapsed = false, onToggle }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [openMenu, setOpenMenu] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout(); 
    navigate("/login");
  };

  const items = createSidebarItems(handleLogout);

  const isActive = (href) => location.pathname === href;
  const isChildActive = (children) =>
    children?.some((c) => location.pathname === c.href);

  useEffect(() => {
    const activeParent = items.find(
      (item) =>
        item.children &&
        item.children.some((child) => location.pathname === child.href)
    );
    if (activeParent) setOpenMenu(activeParent.key);
  }, [location.pathname, items]);

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
    if (onToggle) onToggle();
  };

  return (
    <aside
      className={`fixed top-0 left-0 flex flex-col bg-slate-900 text-slate-100 transition-all duration-200 
      ${collapsed ? "w-[72px]" : "w-[240px]"} h-screen p-3 z-20`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-2">
        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-white text-lg">
          SM
        </div>
        {!collapsed && (
          <div className="font-bold text-base whitespace-nowrap">
            SMK Trimulia
          </div>
        )}
        <button
          onClick={toggleSidebar}
          aria-label="toggle sidebar"
          className="ml-auto border border-white/10 text-slate-100 p-1.5 rounded-md hover:bg-white/10 transition"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-3 flex-1 overflow-y-auto">
        {items.map((item) => {
          const activeMain =
            isActive(item.href) || isChildActive(item.children);

          return (
            <div key={item.key}>
              <div
                onClick={() => {
                  if (item.children)
                    setOpenMenu(openMenu === item.key ? null : item.key);
                  else if (item.key === "logout") item.onClick?.();
                  else navigate(item.href);
                }}
                className={`flex items-center justify-between px-2 py-2.5 rounded-md cursor-pointer transition-colors 
                ${
                  activeMain
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
                      className={`text-sm ${
                        activeMain ? "font-semibold" : "font-normal"
                      }`}
                    >
                      {item.label}
                    </span>
                  )}
                </div>
                {item.children && !collapsed && (
                  <span className="text-xs">
                    {openMenu === item.key ? "▾" : "▸"}
                  </span>
                )}
              </div>

              {/* Submenu */}
              {item.children && openMenu === item.key && !collapsed && (
                <div className="ml-7 mt-1">
                  {item.children.map((child) => (
                    <div
                      key={child.key}
                      onClick={() => navigate(child.href)}
                      className={`px-2 py-2 rounded-md text-sm cursor-pointer transition 
                      ${
                        isActive(child.href)
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
        {!collapsed ? "Versi 1.0 — © SMK Trimulia" : "v1.0"}
      </div>
    </aside>
  );
}

// Icon components sudah dipindahkan ke sidebarConfig.js
