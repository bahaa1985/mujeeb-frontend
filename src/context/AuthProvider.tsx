import React, { useState, useEffect, useRef } from 'react';
import { AuthContext } from './AuthContext';
import type { User } from '../types/user';
import { authAPI } from '../api/authAPI';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authRequestId = useRef(0);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const requestId = ++authRequestId.current;
      try {
        const currentUser = await authAPI.getCurrentUser();
        if (requestId === authRequestId.current) setUser(currentUser);
      } catch {
        if (requestId === authRequestId.current) setUser(null);
      } finally {
        if (requestId === authRequestId.current) setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (mobile: string, password: string) => {
    const requestId = ++authRequestId.current;
    setIsLoading(true);
    try {
      const response = await authAPI.login({ mobile, password });
      if (requestId === authRequestId.current) setUser(response.user);
      if (requestId === authRequestId.current && response.user?.id) {
        void import("../utils/firebase-client")
          .then(({ requestNotificationPermission }) => requestNotificationPermission(response.user.id))
          .catch((error: unknown) => console.error("Failed to initialize push notifications:", error));
      }
    } finally {
      if (requestId === authRequestId.current) setIsLoading(false);
    }
  };

  const logout = async () => {
    const requestId = ++authRequestId.current;
    setIsLoading(true);
    try {
      await authAPI.logout();
      if (requestId === authRequestId.current) setUser(null);
    } finally {
      if (requestId === authRequestId.current) {
        setIsLoading(false);
        window.location.href = '/login';
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
