import api from './axios';
import type { LoginCredentials, AuthResponse, User } from '../types/user';
/**
 * Login with mobile and password.
 * Sets the HTTP-only cookie automatically via Axios credentials.
 */
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/login', credentials);
    return response.data;
  },

  /**
   * Get current logged-in user.
   * Treat a 401 as "no active session" instead of throwing.
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await api.get<User>('/me');
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError?.response?.status === 401) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Logout and clear server-side session.
   */
  logout: async (): Promise<void> => {
    await api.post('/logout');
    window.location.href='/login'; // Redirect to login page after logout
  },
};
