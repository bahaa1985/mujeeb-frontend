import React, { useEffect, useState } from "react";
import { subscriptionAPI } from "../../api/subscriptionAPI";
import { pharmacyAPI } from "../../api/pharmacyAPI";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { type Pharmacy } from "../../types/pharmacy";
import { Button } from "../../components/ui/Button";

export const NewSubscription: React.FC<{ onSuccess: () => void }> = ({
  onSuccess,
}) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    pharmacy_id: "",
    plan_id: "",
    // bill_due: (() => {
    //   const date = new Date();
    //   date.setMonth(date.getMonth() + 1);
    //   return date.toISOString().split('T')[0];
    // })()
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pharmaciesData, plansData] = await Promise.all([
          pharmacyAPI.getPharmacies(),
          subscriptionAPI.getPlans(),
        ]);
        setPharmacies(pharmaciesData);
        setPlans(plansData);
      } catch (error) {
        showToast(t("common.error"), error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pharmacy_id || !formData.plan_id) {
      showToast(t("common.fillAllFields"), "error");
      return;
    }

    try {
      await subscriptionAPI.createPharmacySubscription({
        pharmacy_id: formData.pharmacy_id,
        plan_id: Number(formData.plan_id),
      });
      showToast(t("common.success"), "success");
      onSuccess();
    } catch (error: any) {
      const message =
        error.response?.data?.message ===
        "Pharmacy already has an existing subscription"
          ? t("subscriptions.subscriptionExists")
          : t("common.error");
      showToast(message, "error");
    }
  };

  if (loading) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 sm:p-6 mb-8">
      <h2 className="text-lg sm:text-xl font-bold mb-5 sm:mb-6 text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">
        {t("subscriptions.assignSubscription")}
      </h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-5 sm:gap-6"
      >
        <div className="w-full flex flex-col md:flex-row justify-between gap-5 md:gap-6 items-stretch md:items-center md:mb-2">
          <div className="w-full sm:w-[45%] flex flex-col sm:flex-row sn:justify-center sm:items-center gap-2 sm:gap-4 md:gap-6">
            <label className="w-full sm:w-auto shrink-0 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("subscriptions.selectPharmacy")}
            </label>
            <select
              required
              value={formData.pharmacy_id}
              onChange={(e) =>
                setFormData({ ...formData, pharmacy_id: e.target.value })
              }
              className="w-full min-w-0 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">--</option>
              {pharmacies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.pharmacy_name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-[45%] flex flex-col sm:flex-row sn:justify-center sm:items-center gap-2 sm:gap-4 md:gap-6">
            <label className="w-full sm:w-auto shrink-0 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("subscriptions.selectPlan")}
            </label>
            <select
              required
              value={formData.plan_id}
              onChange={(e) =>
                setFormData({ ...formData, plan_id: e.target.value })
              }
              className="w-full min-w-0 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">--</option>
              {plans
                .sort((a, b) => a.id - b.id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.price} EGP)
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="flex gap-6 items-center lg:mb-2">
          {/* <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={formData.paid}
              onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
              className="rounded text-primary focus:ring-primary"
            />
            {t("subscriptions.isPaid")}
          </label> */}

          {/* <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={formData.trial}
              onChange={(e) => setFormData({ ...formData, trial: e.target.checked })}
              className="rounded text-primary focus:ring-primary"
            />
            {t("subscriptions.isTrial")}
          </label> */}
        </div>

        {/* <div className="w-full flex justify-center md:col-start-2 md:row-start-2"> */}
        <Button
          variant="primary"
          type="submit"
          // type="submit"
          // className="bg-primary text-white px-8 py-2.5 rounded-lg hover:opacity-90 transition-all font-bold shadow-sm"
        >
          {t("common.create")}
        </Button>
        {/* </div> */}
      </form>
    </div>
  );
};
