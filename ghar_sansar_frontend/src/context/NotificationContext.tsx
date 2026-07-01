import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  metadata?: {
    orderId?: string;
    orderNumber?: string;
    customerName?: string;
    total?: number;
  };
}

interface NotificationContextType {
  notifications: AppNotification[];
  loading: boolean;
  unreadCount: number;
  soundEnabled: boolean;
  pushPermission: 'default' | 'granted' | 'denied';
  toggleSound: () => void;
  requestPushPermission: () => Promise<boolean>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_AWS_API_URL || "http://localhost:5001/api";

// Pure Web Audio API synthesis for premium alert chime sound (no static file asset dependency)
const playChime = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Beautiful major triad chime sound
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.12); // E5

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
    osc2.frequency.exponentialRampToValueAtTime(880.00, audioCtx.currentTime + 0.12); // A5

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);

    osc1.start(audioCtx.currentTime);
    osc2.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.45);
    osc2.stop(audioCtx.currentTime + 0.45);
  } catch (e) {
    console.warn("Chime playback blocked by browser/audio policy:", e);
  }
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('admin_notif_sound');
    return saved !== 'false';
  });
  const [pushPermission, setPushPermission] = useState<NotificationSettingStatus>(() => {
    if (!("Notification" in window)) return 'denied';
    return Notification.permission as NotificationSettingStatus;
  });
  const [isInitialized, setIsInitialized] = useState(false);

  type NotificationSettingStatus = 'default' | 'granted' | 'denied';

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleSound = () => {
    setSoundEnabled(prev => {
      localStorage.setItem('admin_notif_sound', String(!prev));
      return !prev;
    });
  };

  const requestPushPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;
    const res = await Notification.requestPermission();
    setPushPermission(res);
    return res === 'granted';
  };

  const sendPushNotification = (title: string, body: string) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/logo.png', // Fallback to icon
      });
    }
  };

  const fetchNotifications = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await fetch(`${API_BASE}/notifications`);
      if (!res.ok) throw new Error("Failed to load notifications");
      const data = await res.json();
      
      if (data.success && data.notifications) {
        const fetched = data.notifications;
        
        // Trigger alert only on subsequent fetches for newly received notifications
        if (isInitialized && !isInitial) {
          const newUnreads = fetched.filter(
            (fn: AppNotification) => !fn.read && !notifications.some(existing => existing.id === fn.id)
          );
          
          if (newUnreads.length > 0) {
            newUnreads.forEach((n: AppNotification) => {
              // Toast
              toast.success(n.message, {
                duration: 6000,
                position: 'top-right',
                style: {
                  background: '#1e1b4b',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  border: '1px solid #4338ca',
                  borderRadius: '16px',
                  padding: '16px'
                }
              });
              // Push notification
              sendPushNotification(n.title, n.message);
            });
            
            // Play sound chime
            if (soundEnabled) {
              playChime();
            }
          }
        }
        
        setNotifications(fetched);
      }
    } catch (e) {
      console.error("Notifications fetch failed:", e);
    } finally {
      if (isInitial) {
        setLoading(false);
        setIsInitialized(true);
      }
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
      }
    } catch (e) {
      console.error("Failed to mark read:", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        );
        toast.success("All notifications marked as read");
      }
    } catch (e) {
      console.error("Failed to mark all read:", e);
    }
  };

  const clearAll = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setNotifications([]);
        toast.success("Notifications cleared");
      }
    } catch (e) {
      console.error("Failed to clear notifications:", e);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchNotifications(true);
  }, []);

  // Periodic polling check every 10 seconds for real-time notification support
  useEffect(() => {
    if (!isInitialized) return;
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [isInitialized, notifications, soundEnabled]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      loading,
      unreadCount,
      soundEnabled,
      pushPermission,
      toggleSound,
      requestPushPermission,
      markAsRead,
      markAllAsRead,
      clearAll,
      fetchNotifications: () => fetchNotifications(false)
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};
