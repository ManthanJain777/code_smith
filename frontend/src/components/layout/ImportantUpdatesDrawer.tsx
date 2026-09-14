import React from 'react';
import { X, CheckCheck, Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatGovDate } from '../../utils/date';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string; // ERROR, WARNING, INFO, SUCCESS
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface ImportantUpdatesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onSelectNotification?: (item: NotificationItem) => void;
}

export const ImportantUpdatesDrawer: React.FC<ImportantUpdatesDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectNotification
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getBorderColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'ERROR':
      case 'CRITICAL':
        return 'border-l-4 border-l-rose-500 bg-rose-50/50';
      case 'WARNING':
        return 'border-l-4 border-l-amber-500 bg-amber-50/50';
      case 'SUCCESS':
        return 'border-l-4 border-l-emerald-500 bg-emerald-50/50';
      case 'INFO':
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-50/50';
    }
  };

  const getIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'ERROR':
      case 'CRITICAL':
        return <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />;
      case 'INFO':
      default:
        return <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />;
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    if (onSelectNotification) {
      onSelectNotification(item);
    }
    if (item.actionUrl) {
      navigate(item.actionUrl);
      onClose();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-slate-800 rounded-lg text-amber-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight flex items-center space-x-2">
                  <span>Important Updates</span>
                  {unreadCount > 0 && (
                    <span className="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.2 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  Official Vigilance Alerts & Procurement Notifications
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Showing {notifications.length} notification{notifications.length === 1 ? '' : 's'}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center space-x-1 text-amber-700 hover:text-amber-800 font-semibold transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No current alerts or notifications</p>
                <p className="text-xs text-slate-500">All procurement pipelines operating normally.</p>
              </div>
            ) : (
              notifications.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 rounded-lg border border-slate-200 shadow-sm transition-all hover:shadow cursor-pointer ${getBorderColor(
                    item.type
                  )} ${item.read ? 'opacity-70' : 'bg-white font-medium'}`}
                >
                  <div className="flex items-start space-x-3">
                    {getIcon(item.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono flex-shrink-0 ml-2">
                          {formatGovDate(item.timestamp, true)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.message}
                      </p>
                      {item.actionUrl && (
                        <div className="mt-2 flex items-center text-[11px] text-amber-700 font-semibold group">
                          <span>Inspect details</span>
                          <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
            In compliance with GFR 2017 & Indian Public Procurement Standards
          </div>
        </div>
      </div>
    </div>
  );
};
