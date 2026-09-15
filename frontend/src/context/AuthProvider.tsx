import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AUTH_TOKEN_KEY } from '../constants/auth';
import { getApiBaseUrl } from '../services/api';

export interface UserSession {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  organizationId: string;
  permissions: string[];
  dscSerial?: string;
}

export interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  role: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: string) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = getApiBaseUrl();

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(AUTH_TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session on mount if token exists
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      if (storedToken.startsWith('demo-jwt-token-')) {
        const role = storedToken.replace('demo-jwt-token-', '');
        setUser({
          userId: 'USR-DEMO-001',
          email: role === 'BIDDER_VENDOR' ? 'bidder.apex@gmail.com' : 'officer.sharma@gem.gov.in',
          fullName: role === 'BIDDER_VENDOR' ? 'Apex Solutions Pvt Ltd' : 'Sh. Rajesh Sharma',
          role: role,
          organizationId: 'ORG-DEMO',
          permissions: ['ALL'],
        });
        setToken(storedToken);
        setIsLoading(false);
        return;
      }



      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser({
            userId: data.userId,
            email: data.email,
            fullName: data.fullName,
            role: data.role,
            organizationId: data.organizationId,
            permissions: data.permissions || [],
          });
          setToken(storedToken);
        } else {
          // If real backend rejects token, only wipe if not in demo mode
          localStorage.removeItem(AUTH_TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('Failed to verify session token against backend, keeping offline state:', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setIsLoading(false);
        return {
          success: false,
          error: errorData.message || errorData.error || 'Authentication failed. Please check credentials.',
        };
      }

      const data = await res.json();
      const authToken = data.token;
      
      localStorage.setItem(AUTH_TOKEN_KEY, authToken);
      setToken(authToken);
      setUser({
        userId: data.userId,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        organizationId: data.organizationId,
        permissions: data.permissions || [],
      });

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      // Graceful demo fallback when backend port 8080 is not active
      const demoUsers: Record<string, any> = {
        'procurement.demo@gembid.local': { userId: 'USR-OFFICER-001', fullName: 'Sh. Rajesh Sharma', role: 'PROCUREMENT_OFFICER', organizationId: 'ORG-GEM-01' },
        'officer.sharma@gem.gov.in': { userId: 'USR-OFFICER-001', fullName: 'Sh. Rajesh Sharma', role: 'PROCUREMENT_OFFICER', organizationId: 'ORG-GEM-01' },
        'reviewer.demo@gembid.local': { userId: 'USR-REVIEWER-001', fullName: 'Smt. Priya Verma', role: 'COMPLIANCE_REVIEWER', organizationId: 'ORG-GEM-01' },
        'reviewer.verma@gem.gov.in': { userId: 'USR-REVIEWER-001', fullName: 'Smt. Priya Verma', role: 'COMPLIANCE_REVIEWER', organizationId: 'ORG-GEM-01' },
        'admin.demo@gembid.local': { userId: 'USR-ADMIN-001', fullName: 'Dr. Amit Patel', role: 'SYSTEM_ADMIN', organizationId: 'ORG-GEM-ADMIN' },
        'admin.tech@gem.gov.in': { userId: 'USR-ADMIN-001', fullName: 'Dr. Amit Patel', role: 'SYSTEM_ADMIN', organizationId: 'ORG-GEM-ADMIN' },
        'auditor.demo@gembid.local': { userId: 'USR-AUDITOR-001', fullName: 'CAG Audit Directorate', role: 'AUDITOR', organizationId: 'ORG-CAG-01' },
        'auditor.cag@gov.in': { userId: 'USR-AUDITOR-001', fullName: 'CAG Audit Directorate', role: 'AUDITOR', organizationId: 'ORG-CAG-01' },
        'bidder.demo@gembid.local': { userId: 'USR-BIDDER-001', fullName: 'Apex Pumps & Motors Pvt Ltd', role: 'BIDDER_VENDOR', organizationId: 'SLR-APEX-001' },
        'bidder.apex@gmail.com': { userId: 'USR-BIDDER-001', fullName: 'Apex Pumps & Motors Pvt Ltd', role: 'BIDDER_VENDOR', organizationId: 'SLR-APEX-001' },
        'bharat.valves@gembid.local': { userId: 'USR-BID-BHARAT', fullName: 'Bharat Heavy Valves Ltd', role: 'BIDDER_VENDOR', organizationId: 'SLR-BHARAT-002' },
        'crompton.flow@gembid.local': { userId: 'USR-BID-CROMPTON', fullName: 'Crompton Flow Dynamics', role: 'BIDDER_VENDOR', organizationId: 'SLR-CROMPTON-003' },
        'stjohn@stjohn.local': { userId: 'USR-BIDDER-003', fullName: 'St. John Technologies Ltd', role: 'BIDDER_VENDOR', organizationId: 'SLR-STJOHN-001' },
        'stjohn@stjohntech.com': { userId: 'USR-BIDDER-003', fullName: 'St. John Technologies Ltd', role: 'BIDDER_VENDOR', organizationId: 'SLR-STJOHN-001' },
      };
      const demoMatch = demoUsers[email.toLowerCase().trim()];
      if (demoMatch) {
        const dummyToken = 'demo-jwt-token-' + demoMatch.role;
        localStorage.setItem(AUTH_TOKEN_KEY, dummyToken);
        setToken(dummyToken);
        setUser({
          userId: demoMatch.userId,
          email: email,
          fullName: demoMatch.fullName,
          role: demoMatch.role,
          organizationId: demoMatch.organizationId,
          permissions: ['ALL'],
        });
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return {
        success: false,
        error: err.message || 'Network error connecting to authentication server.',
      };
    }
  };

  const logout = async () => {
    if (token) {
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const switchRole = async (newRole: string) => {
    const roleCredentials: Record<string, { email: string; pass: string; profile: any }> = {
      'BIDDER_VENDOR': { email: 'bidder.demo@gembid.local', pass: 'Password123!', profile: { userId: 'USR-DEMO-BID', fullName: 'Apex Pumps Vendor Representative', email: 'bidder.demo@gembid.local', role: 'BIDDER_VENDOR', organizationId: 'ORG-001', dscSerial: 'DSC-IND-2026-APEX-8891' } },
      'PROCUREMENT_OFFICER': { email: 'procurement.demo@gembid.local', pass: 'Password123!', profile: { userId: 'USR-DEMO-PROC', fullName: 'Rajesh Kumar (Procurement Officer Demo)', email: 'procurement.demo@gembid.local', role: 'PROCUREMENT_OFFICER', organizationId: 'ORG-001', dscSerial: 'DSC-GOV-2026-SHARMA-001' } },
      'COMPLIANCE_REVIEWER': { email: 'reviewer.demo@gembid.local', pass: 'Password123!', profile: { userId: 'USR-DEMO-REV', fullName: 'Anita Sharma (Compliance Reviewer Demo)', email: 'reviewer.demo@gembid.local', role: 'COMPLIANCE_REVIEWER', organizationId: 'ORG-001', dscSerial: 'DSC-GOV-2026-VERMA-002' } },
      'AUDITOR': { email: 'auditor.demo@gembid.local', pass: 'Password123!', profile: { userId: 'USR-DEMO-AUD', fullName: 'Vikram Sethi (Auditor Demo)', email: 'auditor.demo@gembid.local', role: 'AUDITOR', organizationId: 'ORG-001', dscSerial: 'DSC-CAG-2026-AUDIT-003' } },
      'SYSTEM_ADMIN': { email: 'admin.demo@gembid.local', pass: 'Password123!', profile: { userId: 'USR-DEMO-ADMIN', fullName: 'System Admin (Demo)', email: 'admin.demo@gembid.local', role: 'SYSTEM_ADMIN', organizationId: 'ORG-001', dscSerial: 'DSC-NIC-2026-ADMIN-ROOT' } },
    };
    const target = roleCredentials[newRole] || roleCredentials['PROCUREMENT_OFFICER'];
    try {
      const res = await login(target.email, target.pass);
      if (!res.success) {
        // If login failed (e.g. backend down and demo mode enabled), set isolated session
        const p = target.profile;
        setUser({
          userId: p.userId,
          email: p.email,
          fullName: p.fullName,
          role: p.role,
          organizationId: p.organizationId,
          permissions: ['ALL'],
          dscSerial: p.dscSerial,
        });
      }
    } catch {
      const p = target.profile;
      setUser({
        userId: p.userId,
        email: p.email,
        fullName: p.fullName,
        role: p.role,
        organizationId: p.organizationId,
        permissions: ['ALL'],
        dscSerial: p.dscSerial,
      });
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'SYSTEM_ADMIN' || user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        permissions: user?.permissions || [],
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        switchRole,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
