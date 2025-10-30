import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Notification, NotificationType, NotificationContextType } from '../types';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// A simple in-memory counter to ensure unique IDs even in rapid succession
let toastIdCounter = 0;

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const storedNotifications = localStorage.getItem('agripulse_notifications');
    if (storedNotifications) {
      const parsed = JSON.parse(storedNotifications);
      setNotifications(parsed);
      setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('agripulse_notifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const addNotification = useCallback((message: string, type: NotificationType, link?: string) => {
    const newNotification: Notification = {
      id: ++toastIdCounter,
      message,
      type,
      link,
      read: false,
      timestamp: Date.now()
    };
    setToasts((prev) => [...prev, newNotification]);
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ toasts, notifications, unreadCount, addNotification, removeToast, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};