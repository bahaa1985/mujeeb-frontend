import api from './axios';
import type { CursorPaginatedMessages, Message, CreateMessageDto } from '../types/message';

export const messagesAPI = {
  getMessages: async (
    userNumber: string,
    contactNumber: string,
    params: { cursorId?: string; limit?: number; pharmacyId?: number } = {},
  ): Promise<CursorPaginatedMessages> => {
    const response = await api.get<CursorPaginatedMessages>(
      `/messages/user/${encodeURIComponent(userNumber)}`,
      { params: { contactNumber, limit: 20, ...params } },
    );
    return response.data;
  },

  getMessagesByPharmacy: async (): Promise<Message[]> => {
    // const params = new URLSearchParams();
    // if (contactPhone) params.set('contactPhone', contactPhone);
    // if (pharmacyPhone) params.set('pharmacyPhone', pharmacyPhone);
    // const search = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<Message[]>('/messages/pharmacy');
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