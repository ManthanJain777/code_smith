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
import { PortalVerificationPage } from './pages/PortalVerificationPage';

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
                    {/* Bid Submission / Ingestion — Admin (TEST MODE) and Bidder only. Officer, Reviewer, Auditor explicitly blocked */}
                    <Route
                      path="/bids/upload"
                      element={
                        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'BIDDER_VENDOR', 'BIDDER']}>
                          <BidUploadPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/bids/:bidId/upload"
                      element={
                        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'BIDDER_VENDOR', 'BIDDER']}>
                          <BidUploadPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Multi-bidder comparison — Officer and Admin ONLY. Reviewer, Auditor, Bidder explicitly blocked */}
                    <Route
                      path="/compare"
                      element={
                        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'PROCUREMENT_OFFICER']}>
                          <MultiBidderPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/tenders/:tenderId/compare"
                      element={
                        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'PROCUREMENT_OFFICER']}>
                          <MultiBidderPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Copilot — 4 distinct role configurations */}
                    <Route
                      path="/copilot"
                      element={
                        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'AUDITOR', 'VIEWER', 'BIDDER_VENDOR', 'BIDDER']}>
                          <CopilotPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Analytics dashboard — Officer and Admin ONLY. Reviewer, Auditor, Bidder explicitly blocked */}
                    <Route
                      path="/analytics"
                      element={
                        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'PROCUREMENT_OFFICER']}>
                          <AnalyticsDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Seller Verification Routes — /sellers/me open to bidder, /sellers and /sellers/:sellerId for Officer, Reviewer, Admin */}
                    <Route path="/sellers/me" element={<SellerDetailPage />} />
                    <Route
                      path="/sellers"
                      element={
                        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER']}>
                          <SellersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/sellers/:sellerId"
                      element={
                        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER']}>
                          <SellerDetailPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Human Review Queue — Reviewer, Officer, Admin. Auditor and Bidder explicitly blocked */}
                    <Route
                      path="/reviews"
                      element={
                        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER']}>
                          <ReviewsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/reports" element={<ReportsPage />} />

                    {/* Blockchain Audit Trail — Auditor (primary), Admin, Officer. Reviewer and Bidder explicitly blocked */}
                    <Route
                      path="/audit"
                      element={
                        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'AUDITOR', 'VIEWER', 'PROCUREMENT_OFFICER']}>
                          <AuditLogPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Government Portal Verification — Officer, Reviewer, Admin. Auditor and Bidder explicitly blocked */}
                    <Route
                      path="/portals"
                      element={
                        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER']}>
                          <PortalVerificationPage />
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

