import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import { usePermissions } from '../../context/PermissionsContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermission?: string;
  feature?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermission,
  feature
}) => {
  const { isAuthenticated, isLoading, user, hasPermission } = useAuth();
  const { hasAccess } = usePermissions();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
          <p className="text-sm font-medium text-slate-300">Authenticating GeM Security Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 1. Dynamic Database-Driven Feature Permission Guard
  if (feature && !hasAccess(feature)) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <div className="rounded-full bg-red-950/60 p-4 border border-red-500/30 mb-4 text-red-400">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">403 — Access Restricted</h2>
        <p className="mt-2 text-slate-600 max-w-md text-sm leading-relaxed">
          Your role (<span className="font-semibold text-amber-700">{user.role}</span>) is blocked from accessing the feature:
          <span className="block mt-1 font-mono font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200">
            {feature}
          </span>
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Under GFR 2017 & Indian Public Procurement Regulations.
        </p>
        <div className="mt-6">
          <a
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // 2. Role-based fallback authorization
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <div className="rounded-full bg-red-950/60 p-4 border border-red-500/30 mb-4 text-red-400">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">403 — Access Denied</h2>
        <p className="mt-2 text-slate-600 max-w-md text-sm">
          Your role (<span className="font-semibold text-amber-700">{user.role}</span>) does not have authorization to access this page.
        </p>
        <div className="mt-6">
          <a
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // 3. Permission authorization
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <div className="rounded-full bg-red-950/60 p-4 border border-red-500/30 mb-4 text-red-400">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">403 — Missing Permission</h2>
        <p className="mt-2 text-slate-600 max-w-md text-sm">
          Required permission (<span className="font-mono text-emerald-600">{requiredPermission}</span>) is not assigned to your role.
        </p>
        <div className="mt-6">
          <a
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
