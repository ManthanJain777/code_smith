import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
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

  const userRoleNormalized = (user.role || '').toUpperCase().replace('ROLE_', '');
  const isBlockedFeature = feature && !hasAccess(feature);
  const isBlockedRole = allowedRoles && allowedRoles.length > 0 && !allowedRoles.some(r => r.toUpperCase().replace('ROLE_', '') === userRoleNormalized);
  const isBlockedPermission = requiredPermission && !hasPermission(requiredPermission);

  if (isBlockedFeature || isBlockedRole || isBlockedPermission) {
    return (
      <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 py-8 text-center max-w-2xl mx-auto">
        <div className="rounded-2xl bg-amber-500/10 p-5 border border-amber-500/30 mb-4 text-amber-500 shadow-inner">
          <ShieldAlert className="h-12 w-12 mx-auto" />
        </div>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold mb-2">
          <span>GFR 2017 RULE-BASED ROLE SEGREGATION</span>
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Role-Restricted Procurement Surface
        </h2>

        <p className="mt-2 text-slate-600 text-sm leading-relaxed">
          You are currently signed in as <strong className="text-amber-800 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{user.role}</strong> ({user.fullName}). Under statutory public procurement rules, access to <span className="font-mono font-bold text-slate-900">{feature || location.pathname}</span> requires specialized committee or officer accreditation.
        </p>

        {/* Action Options */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 font-bold text-white bg-[#1B365D] rounded-xl hover:bg-[#152843] transition shadow-sm"
          >
            <span>Return to Dashboard</span>
          </Link>
          <Link
            to="/tenders"
            className="inline-flex items-center gap-1.5 px-4 py-2 font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-200"
          >
            <span>Browse Active Tenders</span>
          </Link>
          <Link
            to="/bids/upload"
            className="inline-flex items-center gap-1.5 px-4 py-2 font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition border border-purple-200"
          >
            <span>Submit Bid Dossier</span>
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition border border-slate-300 shadow-sm"
          >
            <span>Switch Authorized Account</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
