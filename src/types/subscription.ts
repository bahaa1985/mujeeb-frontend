import  type {Pharmacy}  from "./pharmacy";

export const SubscriptionState = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  EXPIRED: "EXPIRED",
  CANCELED: "CANCELED",
} as const;

export type PlanState = typeof SubscriptionState[keyof typeof SubscriptionState];


export interface Plan {
  id: number;
  name: string;
  messages_limit: number;
  price: number;
  common_replies: boolean;
  prescription_reader: boolean;
  prescription_reader_100:boolean;
  order_notification: boolean;
  basic_dashboard:boolean;
  advanced_dashboard: boolean;
}

export interface Subscription {
  id: string; // BigInt serialized as string
  pharmacy_id: string;
  plan_id: number;
  subscription_start: string;
  // Enriched fields from latest billing log
  subscription_state: PlanState;
  state: PlanState;
  bill_due: string;
  messages_used: number;
  images_count: number;
  next_month_paid: boolean;
  pharmacies?: Pharmacy;
  plans?: Plan;
}

export interface MonthlySubscriptionLog {
  id: string;
  pharmacy_id: string;
  plan_id: number;
  bill_due: string;
  state: PlanState;
  billing_month: string;
  messages_used: number;
  amount_paid: number;
  created_at: string;
}

