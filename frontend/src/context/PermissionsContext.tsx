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

  const fetchPermissions = async () => {
    if (!user) {
      setPermissions({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const perms = await apiService.getMyPermissions();
      if (perms && typeof perms === 'object' && Object.keys(perms).length > 0 && perms['tender_spec']) {
        setPermissions(perms);
        return;
      }
      throw new Error('Permissions response missing standard feature keys');
    } catch (err) {
      console.warn('Failed to load dynamic permissions, using role fallback:', err);
      // Fallback defaults matching DB seed
      const role = (user.role || 'VIEWER').toUpperCase().replace(/^ROLE_/, '');
      if (role === 'SYSTEM_ADMIN') {
        setPermissions({
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
        });
      } else if (role === 'PROCUREMENT_OFFICER') {
        setPermissions({
          admin_dashboard: 'BLOCKED',
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
          bid_upload: 'BLOCKED',
          contradiction_resolve: 'BLOCKED'
        });
      } else if (role === 'COMPLIANCE_REVIEWER') {
        setPermissions({
          admin_dashboard: 'BLOCKED',
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
          bid_upload: 'BLOCKED',
          contradiction_resolve: 'FULL'
        });
      } else if (role === 'AUDITOR' || role === 'VIEWER') {
        setPermissions({
          admin_dashboard: 'BLOCKED',
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
          bid_upload: 'BLOCKED',
          contradiction_resolve: 'BLOCKED'
        });
      } else {
        // BIDDER_VENDOR
        setPermissions({
          admin_dashboard: 'BLOCKED',
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
          contradiction_resolve: 'BLOCKED'
        });
      }
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
