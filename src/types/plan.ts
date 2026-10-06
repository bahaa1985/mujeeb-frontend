export interface PlanInput {
  name: string;
  messages_limit: number;
  images_limit: number;
  price: number;
  common_replies: boolean;
  order_notification: boolean;
  basic_dashboard: boolean;
  advanced_dashboard: boolean;
}

export interface Plan extends Omit<PlanInput, 'price'> {
  id: number;
  price: number | string;
}