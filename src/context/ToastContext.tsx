import React, { createContext} from 'react';
import type {AlertColor } from '@mui/material';

interface ToastContextType {
  showToast: (message: string, severity?: AlertColor) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
