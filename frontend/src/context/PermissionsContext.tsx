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
      setPermissions(perms || {});
    } catch (err) {
      console.warn('Failed to load dynamic permissions, using role fallback:', err);
      // Fallback defaults matching DB seed
      const role = user.role || 'VIEWER';
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
          tender_spec: 'READ',
          compliance_matrix: 'READ',
          portal_verification: 'READ',
          multi_bidder_compare: 'BLOCKED',
          copilot_query: 'SCOPED',
          seller_queue: 'READ',
          human_review: 'FULL',
          compliance_reports: 'READ',
          analytics_overview: 'BLOCKED',
          blockchain_audit: 'BLOCKED',
          bid_upload: 'BLOCKED',
          contradiction_resolve: 'FULL'
        });
      } else if (role === 'AUDITOR' || role === 'VIEWER') {
        setPermissions({
          admin_dashboard: 'BLOCKED',
          tender_spec: 'READ',
          compliance_matrix: 'READ',
          portal_verification: 'BLOCKED',
          multi_bidder_compare: 'BLOCKED',
          copilot_query: 'READ_ONLY',
          seller_queue: 'BLOCKED',
          human_review: 'BLOCKED',
          compliance_reports: 'READ',
          analytics_overview: 'BLOCKED',
          blockchain_audit: 'FULL',
          bid_upload: 'BLOCKED',
          contradiction_resolve: 'BLOCKED'
        });
      } else {
        // BIDDER_VENDOR
        setPermissions({
          admin_dashboard: 'BLOCKED',
          tender_spec: 'READ',
          compliance_matrix: 'OWN',
          portal_verification: 'BLOCKED',
          multi_bidder_compare: 'BLOCKED',
          copilot_query: 'SCOPED',
          seller_queue: 'BLOCKED',
          human_review: 'BLOCKED',
          compliance_reports: 'OWN',
          analytics_overview: 'BLOCKED',
          blockchain_audit: 'BLOCKED',
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
    const level = permissions[featureKey];
    return !!level && level !== 'BLOCKED';
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
