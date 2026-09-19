import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import type { User } from '../types/user';
import { authAPI } from '../api/authAPI';
import {requestNotificationPermission} from "../utils/firebase-client"

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authAPI.getCurrentUser();
        console.log("Current user:", currentUser);
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (mobile: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login({ mobile, password });   
        await requestNotificationPermission(response.user?.id)
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
      window.location.href='/login';
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
