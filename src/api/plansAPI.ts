import api from './axios';
import type { Plan, PlanInput } from '../types/plan';

export const plansAPI = {
  getPlans: async (): Promise<Plan[]> => {
    const response = await api.get('/plans');
    return response.data.data;
  },

  createPlan: async (data: PlanInput): Promise<Plan> => {
    const response = await api.post('/plans/new', data);
    return response.data.data;
  },

  updatePlan: async (id: number, data: PlanInput): Promise<Plan> => {
    const response = await api.put(`/plans/${id}`, data);
    return response.data.data;
  },
};