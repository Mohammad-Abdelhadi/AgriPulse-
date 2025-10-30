import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Notification, NotificationType, NotificationContextType } from '../types';
import { useAuth } from './AuthContext';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// A simple in-memory counter to ensure unique IDs even in rapid succession
let toastIdCounter = 0;

// Helper function to safely parse JSON from localStorage, preventing crashes from corrupted data.
const safeJsonParse = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        if (!item) return defaultValue;
        return JSON.parse(item) as T;
    } catch (e) {
        console.warn(`Could not parse JSON from localStorage for key "${key}". Clearing corrupted data and using default value.`, e);
        // Clear the corrupted item to prevent future errors
        localStorage.removeItem(key); 
        return defaultValue;
    }
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMuted, setIsMuted] = useState<boolean>(() => safeJsonParse('agripulse_notifications_muted', false));

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  useEffect(() => {
    localStorage.setItem('agripulse_notifications_muted', JSON.stringify(isMuted));
  }, [isMuted]);

  // Effect to load/clear notifications on user change
  useEffect(() => {
    if (user) {
      const storageKey = `agripulse_notifications_${user.id}`;
      const storedNotifications = localStorage.getItem(storageKey);
      if (storedNotifications) {
        try {
          const parsed = JSON.parse(storedNotifications);
          setNotifications(parsed);
          setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
        } catch (e) {
          console.error("Failed to parse notifications, resetting.", e);
          setNotifications([]);
          setUnreadCount(0);
        }
      } else {
        setNotifications([]); // No notifications for this user yet
        setUnreadCount(0);
      }
    } else {
      // User logged out, clear notifications from state
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Effect to save notifications when they change for the current user
  useEffect(() => {
    if (user) {
      const storageKey = `agripulse_notifications_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(notifications));
      setUnreadCount(notifications.filter(n => !n.read).length);
    }
  }, [notifications, user]);

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

    // Only add to persistent notifications if a user is logged in
    if (user) {
        setNotifications((prev) => [newNotification, ...prev]);
    }
    
    // Only show a toast pop-up if notifications are not muted
    if (!isMuted) {
      setToasts((prev) => [...prev, newNotification]);
    }

  }, [user, isMuted]);

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ toasts, notifications, unreadCount, isMuted, toggleMute, addNotification, removeToast, markAsRead, markAllAsRead }}>
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