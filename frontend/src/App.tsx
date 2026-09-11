import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TendersPage } from './pages/TendersPage';
import { ComplianceMatrixPage } from './pages/ComplianceMatrixPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { SellersPage } from './pages/SellersPage';
import { SellerDetailPage } from './pages/SellerDetailPage';
import { CopilotPage } from './pages/CopilotPage';
import { MultiBidderPage } from './pages/MultiBidderPage';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { BidUploadPage } from './pages/BidUploadPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Business Application Shell */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/tenders" element={<TendersPage />} />
                    <Route path="/compliance" element={<ComplianceMatrixPage />} />
                    <Route path="/bids/upload" element={<BidUploadPage />} />
                    <Route path="/bids/:bidId/upload" element={<BidUploadPage />} />

                    {/* Multi-bidder comparison - Officer, Reviewer, Auditor, Admin */}
                    <Route
                      path="/compare"
                      element={
                        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'AUDITOR']}>
                          <MultiBidderPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/tenders/:tenderId/compare"
                      element={
                        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'AUDITOR']}>
                          <MultiBidderPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Procurement Copilot — Officer, Reviewer, Admin (interactive) + Auditor (read-only audit replay). Blocked for Bidder */}
                    <Route
                      path="/copilot"
                      element={
                        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'AUDITOR']}>
                          <CopilotPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Analytics dashboard — Officer, Reviewer, Auditor, Admin */}
                    <Route
                      path="/analytics"
                      element={
                        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'AUDITOR']}>
                          <AnalyticsDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Seller Verification Routes */}
                    <Route path="/sellers" element={<SellersPage />} />
                    <Route path="/sellers/:sellerId" element={<SellerDetailPage />} />

                    {/* Human Review Queue — Reviewer, Officer, Admin + Auditor (read-only oversight) */}
                    <Route
                      path="/reviews"
                      element={
                        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'AUDITOR']}>
                          <ReviewsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route
                      path="/audit"
                      element={
                        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'AUDITOR']}>
                          <AuditLogPage />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </AppShell>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

