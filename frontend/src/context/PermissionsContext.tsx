import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from './AuthProvider';

interface PermissionsContextType {
  permissions: Record<string, string>;
  hasAccess: (featureKey: string) => boolean;
  getAccessLevel: (featureKey: string) => string;
  loading: boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const getRoleFallback = (role?: string): Record<string, string> => {
    const r = role || 'VIEWER';
    if (r === 'SYSTEM_ADMIN') {
      return {
        admin_dashboard: 'FULL',
        tender_spec: 'FULL',
        compliance_matrix: 'FULL',
        portal_verification: 'FULL',
        multi_bidder_compare: 'FULL',
        copilot_query: 'FULL',
        seller_queue: 'FULL',
        human_review: 'FULL',
        compliance_reports: 'FULL',
        analytics_overview: 'FULL',
        blockchain_audit: 'FULL',
        bid_upload: 'FULL',
        contradiction_resolve: 'FULL'
      };
    } else if (r === 'PROCUREMENT_OFFICER') {
      return {
        admin_dashboard: 'BLOCKED',
        tender_spec: 'FULL',
        compliance_matrix: 'FULL',
        portal_verification: 'FULL',
        multi_bidder_compare: 'FULL',
        copilot_query: 'FULL',
        seller_queue: 'FULL',
        human_review: 'READ_ONLY',
        compliance_reports: 'FULL',
        analytics_overview: 'FULL',
        blockchain_audit: 'READ_ONLY',
        bid_upload: 'BLOCKED',
        contradiction_resolve: 'BLOCKED'
      };
    } else if (r === 'COMPLIANCE_REVIEWER') {
      return {
        admin_dashboard: 'BLOCKED',
        tender_spec: 'READ_ONLY',
        compliance_matrix: 'FULL',
        portal_verification: 'READ_ONLY',
        multi_bidder_compare: 'READ_ONLY',
        copilot_query: 'FULL',
        seller_queue: 'READ_ONLY',
        human_review: 'FULL',
        compliance_reports: 'READ_ONLY',
        analytics_overview: 'BLOCKED',
        blockchain_audit: 'READ_ONLY',
        bid_upload: 'BLOCKED',
        contradiction_resolve: 'FULL'
      };
    } else if (r === 'AUDITOR' || r === 'VIEWER') {
      return {
        admin_dashboard: 'BLOCKED',
        tender_spec: 'READ_ONLY',
        compliance_matrix: 'READ_ONLY',
        portal_verification: 'READ_ONLY',
        multi_bidder_compare: 'READ_ONLY',
        copilot_query: 'FULL',
        seller_queue: 'READ_ONLY',
        human_review: 'READ_ONLY',
        compliance_reports: 'READ_ONLY',
        analytics_overview: 'FULL',
        blockchain_audit: 'FULL',
        bid_upload: 'BLOCKED',
        contradiction_resolve: 'BLOCKED'
      };
    } else {
      // BIDDER_VENDOR
      return {
        admin_dashboard: 'BLOCKED',
        tender_spec: 'READ_ONLY',
        compliance_matrix: 'READ_ONLY',
        portal_verification: 'BLOCKED',
        multi_bidder_compare: 'BLOCKED',
        copilot_query: 'FULL',
        seller_queue: 'BLOCKED',
        human_review: 'BLOCKED',
        compliance_reports: 'BLOCKED',
        analytics_overview: 'BLOCKED',
        blockchain_audit: 'BLOCKED',
        bid_upload: 'FULL',
        contradiction_resolve: 'BLOCKED'
      };
    }
  };

  const fetchPermissions = async () => {
    if (!user) {
      setPermissions({});
      setLoading(false);
      return;
    }

    const defaultRolePerms = getRoleFallback(user.role);

    try {
      setLoading(true);
      const perms = await apiService.getMyPermissions();
      // Merge perms with defaultRolePerms taking precedence for the current user role
      setPermissions({ ...(perms || {}), ...defaultRolePerms });
    } catch (err) {
      console.warn('Failed to load dynamic permissions, using role fallback:', err);
      setPermissions(defaultRolePerms);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [user]);

  const hasAccess = (featureKey: string): boolean => {
    if (!featureKey) return true;
    const role = (user?.role || 'VIEWER').toUpperCase().replace(/^ROLE_/, '');
    if (role === 'SYSTEM_ADMIN') return true;

    const level = permissions[featureKey];
    if (level !== undefined) {
      return level !== 'BLOCKED';
    }

    // Graceful fallback if dynamic permissions did not explicitly enumerate this key
    if (role === 'BIDDER_VENDOR') {
      return ['tender_spec', 'compliance_matrix', 'bid_upload', 'compliance_reports', 'copilot_query', 'blockchain_audit'].includes(featureKey);
    }
    return featureKey !== 'bid_upload' && featureKey !== 'admin_dashboard';
  };

  const getAccessLevel = (featureKey: string): string => {
    return permissions[featureKey] || 'BLOCKED';
  };

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        hasAccess,
        getAccessLevel,
        loading,
        refreshPermissions: fetchPermissions
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
