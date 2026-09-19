import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { PageWrapper } from "../components/layout/PageWrapper";
import { PlanManagement } from "../features/subscriptions/PlanManagement";
import { PharmacySubscriptionList } from "../features/subscriptions/PharmacySubscriptionList";
import { NewSubscription } from "../features/subscriptions/NewSubscription";

export const SubscriptionsPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"pharmacies" | "plans">("pharmacies");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab("pharmacies");
  };

  return (
    <PageWrapper>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("subscriptions.title")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("subscriptions.subtitle")}
          </p>
        </div>

        <div className="flex gap-4 mb-6 border-b dark:border-gray-700">
          <button
            onClick={() => setActiveTab("pharmacies")}
            className={`pb-2 px-4 transition-colors ${
              activeTab === "pharmacies"
                ? "border-b-2 border-primary text-primary font-bold"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {t("layout.pharmacies")}
          </button>
          <button
            onClick={() => setActiveTab("plans")}
            className={`pb-2 px-4 transition-colors ${
              activeTab === "plans"
                ? "border-b-2 border-primary text-primary font-bold"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {t("subscriptions.plans")}
          </button>
        </div>

        {activeTab === "pharmacies" ? (
          <>
            <NewSubscription onSuccess={handleSuccess} />
            <PharmacySubscriptionList key={refreshKey} />
          </>
        ) : (
          <PlanManagement />
        )}
      </div>
    </PageWrapper>
  );
};
