import React, { useState } from 'react';
import { ToastContext } from './ToastContext';
import { Snackbar, Alert} from '@mui/material';
import type {AlertColor } from '@mui/material';

interface Toast {
  id: string;
  message: string;
  severity: AlertColor;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, severity: AlertColor = 'success') => {
    const id = Date.now().toString();
    setToasts([...toasts, { id, message, severity }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const handleClose = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <Snackbar 
          key={toast.id} 
          open={true} 
          autoHideDuration={5000} 
          onClose={() => handleClose(toast.id)} 
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity={toast.severity} onClose={() => handleClose(toast.id)}>
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
};