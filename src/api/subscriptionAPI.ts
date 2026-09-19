import api from "./axios";
import { type MonthlySubscriptionLog, SubscriptionState, type Plan, type Subscription } from "../types/subscription";

export const subscriptionAPI = {
  /**
   * Get all pharmacy subscriptions.
   * The backend exposes this list endpoint rather than a dedicated /subscriptions root listing.
   */
  getAllPharmacyPlans: async (): Promise<Subscription[]> => {
    const response = await api.get("/subscriptions/list");
    return response.data.data;
  },

  /**
   * Get current subscription for a specific pharmacy.
   * The backend does not expose a direct GET by pharmacy endpoint, so we read the list and filter it.
   */
  getPharmacySubscription: async (pharmacyId: number): Promise<Subscription> => {
    const response = await api.get("/subscriptions/list");
    const subscription = response.data.data.find(
      (item: Subscription) => Number(item.pharmacy_id) === Number(pharmacyId)
    );

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    return subscription;
  },

  /**
   * This backend route does not currently expose a payment toggle endpoint.
   */
  // updatePaymentStatus: async (_pharmacyPlanId: number, _paid: boolean): Promise<PharmacyPlan> => {

  //   throw new Error("Payment status endpoint is not available in the current backend routes");
  // },

  /**
   * Update a subscription state by hitting the activate/suspend endpoints.
   */
  updatePlanState: async (
    subscriptionId: number | string,
    state: typeof SubscriptionState[keyof typeof SubscriptionState]
  ): Promise<Subscription> => {
    const endpoint = state === SubscriptionState.ACTIVE ? "activate" : "suspend";
    const response = await api.post(`/subscriptions/${subscriptionId}/${endpoint}`);
    return response.data.data;
  },

  /**
   * Toggle the next_month_paid status of a subscription.
   */
  toggleNextMonthPaid: async (subscriptionId: number | string): Promise<Subscription> => {
    const response = await api.post(`/subscriptions/${subscriptionId}/toggle-next-month-paid`);
    return response.data.data;
  },

  // Plan CRUD
  getPlans: async (): Promise<Plan[]> => {
    const response = await api.get("/subscriptions/list");
    // Extract unique plans from the subscriptions list
    const subscriptions: Subscription[] = response.data.data ?? [];
    const plansMap = new Map<number, Plan>();
    
    subscriptions.forEach(sub => {
      if (sub.plans) {
        plansMap.set(sub.plans.id, sub.plans);
      }
    });

    return Array.from(plansMap.values());
  },

  createPlan: async (data: Plan): Promise<Plan> => {
    const response = await api.post("/subscriptions/plans", data);
    return response.data.data;
  },

  updatePlan: async (id: number, data: Plan): Promise<Plan> => {
    const response = await api.put(`/subscriptions/plans/${id}`, data);
    return response.data.data;
  },

  // create new pharmacy subscription
  createPharmacySubscription: async (data: {
    pharmacy_id: string | number;
    plan_id: number;
    bill_due?: string;
  }): Promise<Subscription> => {
    const payload = {
      ...data,
      bill_due: data.bill_due ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const response = await api.post("/subscriptions/create", payload);
    return response.data.data;
  },

  // renew a subscription
  renewPharmacyBilling: async (data: {
    pharmacy_id?: string | number;
    plan_id?: number;
    amount_paid?: number;
    bill_due?: string;
    billing_month?: string;
    messages_used?: number;
    state?: typeof SubscriptionState[keyof typeof SubscriptionState];
    subscriptionId?: number;
  }): Promise<MonthlySubscriptionLog> => {
    let subscriptionId = data.subscriptionId;

    if (!subscriptionId && data.pharmacy_id != null) {
      const response = await api.get("/subscriptions/list");
      const subscription = (response.data.data ?? []).find(
        (item: Subscription) => Number(item.pharmacy_id) === Number(data.pharmacy_id)
      );

      if (!subscription) {
        throw new Error("Subscription not found for this pharmacy");
      }

      subscriptionId = Number(subscription.id);
    }

    if (!subscriptionId) {
      throw new Error("Subscription id is required to renew a subscription");
    }

    const response = await api.post(`/subscriptions/${subscriptionId}/renew`);
    return response.data;
  },
};

