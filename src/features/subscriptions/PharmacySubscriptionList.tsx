import React, { useEffect, useState } from "react";
import { subscriptionAPI } from "../../api/subscriptionAPI";
import {
  SubscriptionState,
  type Subscription,
  type PlanState,
} from "../../types/subscription";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";

export const PharmacySubscriptionList: React.FC = () => {
  const [pharmPlan, setPharmPlan] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const { t } = useLanguage();
  const { showToast } = useToast();

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await subscriptionAPI.getAllPharmacyPlans();
      if(data) setPharmPlan(data);  
      console.log("Fetched pharmacy plans:", data); 
    } catch (error) {
      showToast(t("common.error"), error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const totalPages = Math.ceil(pharmPlan.length / itemsPerPage);
  const currentItems = pharmPlan.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

    const handleRenewBilling = async (plan: Subscription) => {
    try {
      await subscriptionAPI.renewPharmacyBilling({
        subscriptionId: Number(plan.id),
      });
      showToast(t("common.updateSuccess"), "success");
      fetchPlans();
    } catch (error) {
      showToast(t("common.error"), error);
    }
  };

  const handleToggleState = async (
    subscriptionId: string,
    currentState: PlanState,
  ) => {
    try {
      const newState =
        currentState === SubscriptionState.ACTIVE
          ? SubscriptionState.SUSPENDED
          : SubscriptionState.ACTIVE;
      await subscriptionAPI.updatePlanState(subscriptionId, newState);
      showToast(t("common.updateSuccess"), "success");
      fetchPlans();
    } catch (error) {
      showToast(t("common.error"), error);
    }
  };

  const handleToggleNextMonthPaid = async (subscriptionId: string) => {
    try {
      await subscriptionAPI.toggleNextMonthPaid(subscriptionId);
      showToast(t("common.updateSuccess"), "success");
      fetchPlans();
    } catch (error) {
      showToast(t("common.error"), error);
    }
  };

  if (loading) return null;


  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                  {t("subscriptions.pharmacy")}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                  {t("subscriptions.plan")}
                </th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                  {t("subscriptions.status")}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white text-center">
                  {t("subscriptions.nextMonthPaid")}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                  {t("subscriptions.messages")}
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                  {t("subscriptions.expiry")}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white text-center">
                  {t("common.details")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentItems.length > 0 ? (
                currentItems.map((plan) => (
                  <tr
                    key={plan.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm dark:text-gray-300">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {plan.pharmacies?.pharmacy_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {plan.plans?.name}
                      </span>
                    </td>
                                        <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          plan.subscription_state === SubscriptionState.ACTIVE
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {t(`subscriptions.${plan?.subscription_state.toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={plan.next_month_paid}
                        onChange={() => handleToggleNextMonthPaid(plan.id)}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {plan.messages_used || 0} / {plan.plans?.messages_limit}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{
                            width: `${Math.min(((plan.messages_used || 0) / (plan.plans?.messages_limit || 1)) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(plan.bill_due).toLocaleDateString()}
                    </td>
                                        <td className="px-6 py-4 text-center space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => handleRenewBilling(plan)}
                        disabled={plan.state === "CANCELED"}
                        className="px-3 py-1 text-xs rounded border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        {t("subscriptions.renew")}
                      </button>
                      <button
                        onClick={() =>
                          handleToggleState(plan.id, plan.state)
                        }
                        disabled={plan.state === "CANCELED"}
                        className={`px-3 py-1 text-xs rounded border transition-colors ${
                          plan.state === SubscriptionState.ACTIVE
                            ? "border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            : "border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                        }`}
                      >
                        {plan.state === SubscriptionState.ACTIVE
                          ? t("subscriptions.suspend")
                          : t("subscriptions.activate")}
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {t("subscriptions.noSubscriptions")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6 pb-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            {t("common.previous")}
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-200">
            {t("common.page")} {currentPage} {t("common.of")} {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            {t("common.next")}
          </button>
        </div>
      )}
    </div>
  );
};
