import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { apiService } from '../../services/api';
import { GovTopNav } from './GovTopNav';
import { GovFooter } from './GovFooter';
import { ImportantUpdatesDrawer, NotificationItem } from './ImportantUpdatesDrawer';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      apiService.getNotifications()
        .then(data => setNotifications(data || []))
        .catch(() => {});
    }
  }, [user]);

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.warn('Failed to mark all as read:', e);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans w-full overflow-x-hidden">
      {/* 1. Official 3-Row GeM Top Navigation Bar with Prominent Logout */}
      <GovTopNav
        onToggleNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationCount={unreadCount}
      />

      {/* 2. Notifications Slide-over Drawer */}
      <ImportantUpdatesDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
      />

      {/* 3. Main Full-Width Dynamic Viewport (No Sidebar Offset, No Double Scrollbars) */}
      <main id="main-content" className="flex-1 w-full bg-slate-50 flex flex-col focus:outline-none">
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>

        {/* 4. Official Government Footer */}
        <GovFooter />
      </main>
    </div>
  );
};
