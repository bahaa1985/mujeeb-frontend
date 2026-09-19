import api from './axios';
import type { Contact } from '../types/contact';

type BlockedContact = {
  blocked: boolean;
  contact_number: string;
};

export const contactsAPI = {
  getContacts: async (userMobile?: string): Promise<Contact[]> => {
    const search = userMobile ? `?userMobile=${encodeURIComponent(userMobile)}` : '';
    const response = await api.get<Contact[]>(`/contacts${search}`);
    return response.data;
  },

  createContact: async (data: { name: string, phone: string, userId: number }): Promise<Contact> => {
    const response = await api.post<Contact>('/contacts/new', data);
    return response.data;
  },

  updateContact: async (data: {
    contact_mobile: string;
    user_mobile: string;
    contact_name: string;
  }): Promise<Contact> => {
    const response = await api.patch<Contact>('/contacts/update', data);
    return response.data;
  },

  getBlockedContacts: async (): Promise<BlockedContact[]> => {
    const response = await api.get<BlockedContact[]>('/contacts/blocked');
    return response.data;
  },

  toggleBlockContact: async (phone: string, block: boolean): Promise<BlockedContact> => {
    const response = await api.post<BlockedContact>('/contacts/toggle-block', { phone, block });
    return response.data;
  },
};

