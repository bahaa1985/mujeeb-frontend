import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { userAPI } from "../../api/userAPI";
import { useAuth } from "../../context/AuthContext";
import { usePharmacy } from "../../context/PharamcyContext";
import { useLanguage } from "../../context/LanguageContext";
import { useNotifications } from "../../context/NotificationsProvider";
import { getRoleTheme } from "../../utils/theme";
import { useTheme } from "../../context/ThemeContext";

import Switch from "@mui/material/Switch";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, setUser } = useAuth();
  const { pharmacy, plan } = usePharmacy();
  const { unreadCount } = useNotifications();
  const { theme: currentTheme } = useTheme();
  const [isAiMode, setIsAiMode] = useState(user?.ai_mode);

  const { t, dir, language, setLanguage } = useLanguage();
  const theme = getRoleTheme(user?.role_id);

  const getPlanBadge = () => {
    if (!plan || !plan.plans) return null;

    const isLimitReached = plan.messages_used >= plan.plans.messages_limit;
    if (isLimitReached) {
      return {
        name: plan.plans.name,
        classes:
          "bg-gray-100 text-gray-500 border-gray-300 dark:bg-gray-700 dark:text-gray-400",
      };
    }

    const name = plan.plans.name.toLowerCase();
    if (name.includes("gold") || name.includes("شاملة")) {
      return {
        name: plan.plans.name,
        classes: "bg-yellow-100 text-yellow-700 border-yellow-300 font-bold",
      };
    }
    if (name.includes("silver") || name.includes("إحترافية")) {
      return {
        name: plan.plans.name,
        classes: "bg-slate-100 text-slate-700 border-slate-300  font-bold",
      };
    }
    if (name.includes("bronze") || name.includes("أساسية")) {
      return {
        name: plan.plans.name,
        classes: "bg-orange-100 text-orange-700 border-orange-300  font-bold",
      };
    }

    return {
      name: plan.plans.name,
      classes:
        "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400",
    };
  };

  const badge = getPlanBadge();
  const usagePercent =
    plan && plan.plans
      ? Math.min((plan.messages_used / plan.plans.messages_limit) * 100, 100)
      : 0;
  const isLimitReached = usagePercent >= 100;

  const links = [
    { path: "/dashboard", label: t("layout.dashboard") },
    { path: "/messages", label: t("layout.messages") },
    {
      path: "/notifications",
      label: t("layout.notifications"),
      badge: unreadCount,
    },
    { path: "/inventory", label: t("layout.inventory") },

    { path: "/pharmacies", label: t("layout.pharmacies") },
    { path: "/subscriptions", label: t("layout.subscriptions") },
    { path: "/users", label: t("layout.users") },
  ];

  const handleToggleAiMode = async () => {
    if (!user) return;
    try {
      const newAiMode = !user.ai_mode;
      setIsAiMode(newAiMode);
      const updatedUser = await userAPI.updateUser(user.id, {
        ai_mode: newAiMode,
      });
      setUser({ ...user, ai_mode: updatedUser.ai_mode });
    } catch (err) {
      console.error(
        err instanceof Error ? err.message : "Failed to update AI mode",
      );
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-x-0 top-16 bottom-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-16 md:top-0 ${
          dir === "rtl" ? "right-0" : "left-0"
        } w-64 max-w-[85vw] ${theme.sidebar} border-x h-[calc(100vh-4rem)] md:h-screen flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen
            ? "translate-x-0"
            : dir === "rtl"
              ? "translate-x-full"
              : "-translate-x-full"
        } md:translate-x-0 shadow-lg md:shadow-none
      dark:bg-slate-900
        dark:border-slate-800
        transition-colors
        duration-300`}
        dir={dir}
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-full flex items-center gap-2 mb-4">
            <Link
              to="/dashboard"
              aria-label="Mujeeb dashboard"
              className="block w-full"
            >
              <img
                src={
                  currentTheme === "dark"
                    ? "/mujeeb-navbar-ldark.png"
                    : "/mujeeb-navbar-light.png"
                }
                alt="Mujeeb"
                className="block w-[90%] h-16 m-auto object-cover"
              />
            </Link>
          </div>
          <Link
            to="/pharmacy-settings"
            className="flex flex-col gap-2 hover:opacity-90 transition-all"
          >
            <div className="flex items-center gap-3">
              <img
                src={pharmacy?.logo}
                className="size-10 rounded-full object-cover border dark:border-gray-700"
              />
              <h1
                className={`text-lg font-bold truncate bg-gradient-to-r ${theme.shell} bg-clip-text text-transparent`}
              >
                {pharmacy?.pharmacy_name}
              </h1>
            </div>

            {badge && (
              <div className="mt-1">
                <span
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.classes}`}
                >
                  {badge.name}
                </span>
              </div>
            )}
          </Link>

          {plan && plan.plans && (
            <div className="mt-4 px-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  {t("subscriptions.messages")}
                </span>
                <span
                  className={`text-[10px] font-bold ${isLimitReached ? "text-red-500" : "text-gray-700 dark:text-gray-300"}`}
                >
                  {plan.messages_used} / {plan.plans.messages_limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isLimitReached
                      ? "bg-red-500"
                      : usagePercent > 80
                        ? "bg-orange-500"
                        : "bg-primary"
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              {isLimitReached && (
                <p className="text-[10px] text-red-500 mt-1 font-medium leading-tight">
                  {t("layout.renewSubscription")}
                </p>
              )}
            </div>
          )}
        </div>
        <nav className="sidebar-scrollbar flex-1 p-4 overflow-y-auto">
          <style>{`
            .sidebar-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: transparent transparent;
            }

            .sidebar-scrollbar::-webkit-scrollbar {
              width: 8px;
            }

            .sidebar-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }

            .sidebar-scrollbar::-webkit-scrollbar-thumb {
              background: transparent;
              border-radius: 9999px;
              border: 2px solid transparent;
              background-clip: padding-box;
            }

            .dark .sidebar-scrollbar {
              scrollbar-color: #3f3f46 transparent;
            }

            .dark .sidebar-scrollbar::-webkit-scrollbar-track {
              background: #18181b;
            }

            .dark .sidebar-scrollbar::-webkit-scrollbar-thumb {
              background: #3f3f46;
              border-radius: 9999px;
              border: 2px solid #18181b;
              background-clip: padding-box;
            }

            .dark .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #52525b;
              border-color: #18181b;
            }
          `}</style>

          <ul className="space-y-1 py-2">
            {links.map((link) => {
              const showLink =
                (link.path !== "/users" || (user && user.role_id <= 2)) &&
                (link.path !== "/pharmacies" || (user && user.role_id === 1)) &&
                (link.path !== "/subscriptions" ||
                  (user && user.role_id === 1));

              if (!showLink) return null;
              const isActive = location.pathname === link.path;
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 font-medium ${
                      isActive
                        ? `${theme.active} shadow-sm`
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {link.badge > 99 ? "99+" : link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="my-4 border-t border-gray-100"></div>
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isAiMode ? t("layout.aiEnabled") : t("layout.aiDisabled")}
              </span>
              <Switch
                checked={!!user?.ai_mode}
                onChange={handleToggleAiMode}
                size="small"
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: theme.active.split(" ")[0],
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: theme.active.split(" ")[0],
                  },
                }}
              />
            </div>
            <div className="px-2">
              {/* <label className="block text-[10px] text-gray-400 mb-1.5 px-1 uppercase tracking-wider font-bold">
                {language === "ar" ? "اللغة" : "Language"}
              </label> */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "en" | "ar")}
                className={`w-full bg-gray-50 text-gray-700 border border-gray-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 ${theme.ring} focus:border-transparent text-sm transition-all`}
              >
                <option value="en">English</option>
                <option value="ar">عربي</option>
              </select>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};
