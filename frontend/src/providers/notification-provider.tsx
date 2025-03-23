import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationContextProps {
  notifications: Notification[];
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  removeNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timeoutIds = useRef<number[]>([]);

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    const newNotification: Notification = { id, message, type };
    setNotifications(prev => [...prev, newNotification]);

    const timeoutId = window.setTimeout(() => {
      removeNotification(id);
    }, 5000);

    timeoutIds.current.push(timeoutId);
  }, [removeNotification]); // Added dependency

  useEffect(() => {
    return () => {
      // Clear all timeouts on unmount
      timeoutIds.current.forEach(id => window.clearTimeout(id));
      timeoutIds.current = [];
    };
  }, []);

  const contextValue = useMemo(() => ({
    notifications,
    addNotification,
    removeNotification,
  }), [notifications, addNotification, removeNotification]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};