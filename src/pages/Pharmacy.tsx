import React, { useState } from "react";
import { PageWrapper } from "../components/layout/PageWrapper";
import { NewPharmacy } from "../features/pharmacy/NewPharmacy";
import { PharmaciesList } from "../features/pharmacy/PharmaciesList";
import {useAuth} from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {getRoleTheme} from "../utils/theme";
export const PharmacyPage: React.FC = () => {
  const { t } = useLanguage();
  const tabs = [
    { label: t("pharmacy.listTab"), value: "list" },
    { label: t("pharmacy.newTab"), value: "new" },
  ];
  const [selectedTab, setSelectedTab] = useState<"list" | "new">("list");
  const user = useAuth().user;
  const theme = getRoleTheme(user?.role_id); // Assuming role_id 2 for pharmacy, adjust as needed
  return (
    <PageWrapper>
      <div className="space-y-8 dark:bg-slate-900 dark:text-slate-100 rounded-3xl p-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold dark:text-slate-100 tracking-tight">
            {t("pharmacy.title")}
          </h1>
          <p className="text-sm sm:text-base dark:text-slate-300 mt-2 max-w-2xl">
            {t("pharmacy.subtitle")}
          </p>
          <div className="mt-6 sm:mt-8">
            <div className="border-b dark:border-slate-700">
              <nav
                className="-mb-px flex space-x-8 overflow-x-auto overflow-y-hidden"
                aria-label="Tabs"
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setSelectedTab(tab.value as "list" | "new")}
                    className={`whitespace-nowrap py-4 px-4  font-semibold text-sm transition-all duration-200
                    ${
                      selectedTab === tab.value
                        ? `${theme.active} shadow-sm`
                        : `{border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-300} }`
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          <div className="mt-8">
            {selectedTab === "list" && <PharmaciesList />}
            {selectedTab === "new" && <NewPharmacy />}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
