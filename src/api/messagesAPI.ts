import api from './axios';
import type { Message, CreateMessageDto } from '../types/message';

export const messagesAPI = {
  getMessages: async (userNumber: string, contactPhone?: string): Promise<Message[]> => {
    const search = contactPhone ? `?contactPhone=${encodeURIComponent(contactPhone)}` : '';
    const response = await api.get<Message[]>(`/messages/user/${userNumber}${search}`);
    return response.data;
  },

  getMessagesByPharmacy: async (
    pharmacyId: number,
  ): Promise<Message[]> => {
    // const params = new URLSearchParams();
    // if (contactPhone) params.set('contactPhone', contactPhone);
    // if (pharmacyPhone) params.set('pharmacyPhone', pharmacyPhone);
    // const search = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<Message[]>(`/messages/pharmacy/${pharmacyId}`);
    return response.data;
  },

  getOrderMessageCountByUserMobile: async (mobile: string): Promise<number> => {
    const response = await api.get<number>(`/messages/orders/count/user/${encodeURIComponent(mobile)}`);
    return response.data;
  },

  getOrderMessageCountByPharmacy: async (pharmacyId: number): Promise<number> => {
    const response = await api.get<number>(`/messages/orders/count/pharmacy/${pharmacyId}`);
    return response.data;
  },

  getMessage: async (id: string): Promise<Message> => {
    const response = await api.get<Message>(`/messages/${id}`);
    return response.data;
  },

  createMessage: async (data: CreateMessageDto): Promise<Message> => {
    const response = await api.post<Message>(`/messages/new`,data);
    return response.data;
  },

  updateMessage: async (
    id: string,
    data: Partial<CreateMessageDto>,
  ): Promise<Message> => {
    const response = await api.patch<Message>(`/messages/${id}`, data);
    return response.data;
  },

    deleteMessage: async (id: string): Promise<void> => {
    await api.delete(`/messages/${id}`);
  },
};