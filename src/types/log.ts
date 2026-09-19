export interface LogParams {
  pharmacyId?: string | number;
  userId?: string | number;
  action?: string;
  page?: number;
  limit?: number;
}

export interface SystemLog {
  id: string;
  user_id: string;
  pharmacy_id: string | null;
  action: string;
  details: any;
  ip_address: string | null;
  created_at: string;
  users?: {
    username: string;
    first_name: string;
    last_name: string;
  };
}