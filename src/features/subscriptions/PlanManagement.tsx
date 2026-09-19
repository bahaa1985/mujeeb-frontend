import React, { useEffect, useState } from "react";
import { subscriptionAPI } from "../../api/subscriptionAPI";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/ui/Button";

export const PlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    messages_limit: 0,
    price: 0,
    common_replies: false,
    prescription_reader: false,
    prescription_reader_100:false,
    order_notification: false,
    basic_dashboard:false,
    advanced_dashboard: false,
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await subscriptionAPI.getPlans();
      setPlans(data);
    } catch (error) {
      showToast(t("common.error"),error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenModal = (plan: any = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        messages_limit: plan.messages_limit,
        price: Number(plan.price),
        common_replies: plan.common_replies,
        prescription_reader: plan.prescription_reader,
        prescription_reader_100:plan.prescription_reader_100,
        order_notification: plan.order_notification,
        basic_dashboard:plan.basic_dashboard,
        advanced_dashboard: plan.advanced_dashboard,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: "",
        messages_limit: 100,
        price: 0,
        common_replies: false,
        prescription_reader: false,
        prescription_reader_100:false,
        order_notification: false,
        basic_dashboard:false,
        advanced_dashboard: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await subscriptionAPI.updatePlan(editingPlan.id, formData);
        showToast(t("common.updateSuccess"), "success");
      } else {
        await subscriptionAPI.createPlan(formData);
        showToast(t("common.success"), "success");
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      showToast(t("common.error"),error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t("common.confirmDelete"))) return;
    try {
      await subscriptionAPI.deletePlan(id);
      showToast(t("common.deleteSuccess"), "success");
      fetchPlans();
    } catch (error) {
      showToast(t("common.error"),error);
    }
  };

  if (loading) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t("subscriptions.plansManagement")}
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary dark:text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          {t("common.create")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.sort((a,b)=>a.id-b.id).map((plan) => (
          <div
            key={plan.id}
            className="border dark:border-gray-700 rounded-xl p-4 flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg dark:text-white">{plan.name}</h3>
                <p className="text-primary font-bold">{plan.price} EGP</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(plan)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  {t("common.edit")}
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
            <ul className="text-sm space-y-2 mb-4 flex-1 dark:text-gray-300">
              <li>• {plan.messages_limit} {t("subscriptions.messages")}</li>
              <li>• {plan.common_replies ? "✅" : "❌"} {t("subscriptions.common_replies")}</li>
              {plan.prescription_reader_100 === true?<li>{"•"+" "+"✅"+" "+t("subscriptions.prescription_reader_100")}</li>:null}   
              {plan.prescription_reader === true ? <li>{"•"+" "+"✅"+" "+t("subscriptions.prescription_reader")}</li>:null}              
              {plan.basic_dashboard === true? <li>{"•"+" "+"✅"+" "+t("subscriptions.basic_dashboard")}</li>:null}
              {plan.advanced_dashboard ===true ? <li>{"•"+" "+"✅"+" "+t("subscriptions.advanced_dashboard")}</li>:null}
              <li>• {plan.order_notification ? "✅" : "❌"} {t("subscriptions.order_notification")}</li>
              {/* {
                plan.prescription_reader_100 === true ? <li>• ✅ {t("subscriptions.prescription_reader_100")}</li>:null 
              }
              {plan.prescription_reader ??  <li>• ✅ {t("subscriptions.prescription_reader")}</li>}                            
              <li>• {plan.order_notification ? "✅" : "❌"} {t("subscriptions.order_notification")}</li>
              {
                plan.basic_dashboard ?? <li>• "✅" {t("subscriptions.basic_dashboard")}</li>
              }             
              {
                plan.advanced_dashboard ?? <li>• "✅" {t("subscriptions.advanced_dashboard")}</li>
              } */}
            </ul>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 dark:text-white">
              {editingPlan ? t("common.edit") : t("common.create")} {t("subscriptions.plan")}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  {t("subscriptions.plan name")}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                    {t("subscriptions.limit")}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.messages_limit}
                    onChange={(e) => setFormData({ ...formData, messages_limit: Number(e.target.value) })}
                    className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                    {t("common.price")}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2"
                  />
                </div>
              </div>
              <div className="space-y-2">
                {[
                  "common_replies",
                  "prescription_reader_100",
                  "prescription_reader",
                  "order_notification",
                  "basic_dashboard",
                  "advanced_dashboard",
                ].map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={(formData as any)[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                      className="rounded text-primary"
                    />
                    {t(`subscriptions.${key}`)}
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                {/* <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-6 py-2 rounded-lg"
                >
                  {t("common.save")}
                </button> */}
                <Button variant="secondary" onClick={()=>setIsModalOpen(false)}>{t("common.cancel")}</Button>
                <Button onClick={handleSubmit}>
{t("common.save")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
