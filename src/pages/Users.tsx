import React, { useState } from "react";
import { PageWrapper } from "../components/layout/PageWrapper";
import { NewUser } from "../features/users/NewUser";
import {useAuth} from "../context/AuthContext";
import { UsersList } from "../features/users/UsersList";
import { useLanguage } from "../context/LanguageContext";
import {getRoleTheme} from "../utils/theme";

export const UsersPage: React.FC = () => {
  const { t } = useLanguage();
  const tabs = [
    { label: t("users.listTab"), value: "list" },
    { label: t("users.newTab"), value: "new" },
  ];
  const user = useAuth().user;
  const theme = getRoleTheme(user?.role_id);
  const [selectedTab, setSelectedTab] = useState<"list" | "new">("list");

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto space-y-6 dark:bg-slate-900 dark:text-slate-100 rounded-3xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold dark:text-slate-100 tracking-tight">
              {t("users.title")}
            </h1>
            <p className="dark:text-slate-300 mt-1 text-lg">{t("users.subtitle")}</p>
          </div>
        </div>

        <div className="dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700 overflow-hidden">
          <div className="border-b dark:border-slate-700 dark:bg-slate-900/60 px-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedTab(tab.value as "list" | "new")}
                  className={`
                    whitespace-nowrap py-4 px-4  font-semibold text-sm transition-all duration-200
                    ${
                      selectedTab === tab.value
                        ? `${theme.active} shadow-sm`
                        : `{border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-300} }`
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <div className="animate-in fade-in duration-500">
              {selectedTab === "list" && <UsersList />}
              {selectedTab === "new" && <NewUser />}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

