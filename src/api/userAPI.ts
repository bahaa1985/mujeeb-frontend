import api from './axios'
import type { RegisterResponse, User } from '../types/user';

export const userAPI = {
    /**
   * Register a new user
   */
  register: async (data: {
    mobile: string;
    password: string;
    username: string;
    avatar:string;
    role_id:number;
    pharmacy_id:number;
    instance_name:string
  }): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/users/new', data);
    return response.data;
  },
  
  /**
   * Fetch all users by pharmacy ID
   */
  getUsers: async (pharmacyId:number):Promise<User[]> =>{
    if(pharmacyId){
    const response = await api.get(`/users/all/${pharmacyId}`)
    return response.data
    }
    return []
  },

  /**
   * Update user
   */
  updateUser:async(userId:number,data:Partial<User>):Promise<User> =>{
    const response = await api.patch(`/users/update/${userId}`,data)
    return response.data
  },

   // 1. الدالة الخاصة بإرسال توكن فايربيز للباك اند
    updateFcmToken: async (data: { userId: string | number, fcmToken: string }): Promise<any> => {
      // تأكد إن المسار ده متطابق مع الـ Route اللي عملناه في الباك اند
      const response = await api.post<any>('users/update-fcm-token', data);
      return response.data;
    },
}

