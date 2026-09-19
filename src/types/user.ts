export interface User {
  id: number;
  mobile: string;
  username: string;
  avatar:string;
  role_id: number;
  pharmacy_id: number;
  ai_mode: boolean;
  is_active: boolean;
    is_logging_at: string;
  instance_name: string;
  instance_status: string;
  createdAt: string;
}


export interface LoginCredentials {
  mobile: string;
  password: string;
}

export interface AuthResponse {
  status:boolean,
  user: User;
  token?: string;
}

export interface RegisterResponse{
  status:boolean,
  user:User
}
