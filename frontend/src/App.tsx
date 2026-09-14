import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthProvider';
import { PermissionsProvider } from './context/PermissionsContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

import { LandingPage } from './pages/LandingPage';
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
import { DigiLockerSimulationPage } from './pages/DigiLockerSimulationPage';
import { TenderResultsPage } from './pages/TenderResultsPage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * Public Home Route:
 * If user is authenticated, redirect to /dashboard immediately.
 * If user is guest, display the public GeM landing page.
 */
const HomeRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span>Verifying GeM security session...</span>
        </div>
      </div>
    );
  }
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LandingPage />;
};

/**
 * Login Route:
 * If user is already authenticated, redirect directly to /dashboard.
 */
const LoginRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span>Verifying GeM security session...</span>
        </div>
      </div>
    );
  }
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LoginPage />;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <PermissionsProvider>
            <ToastProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                {/* ============================================================ */}
                {/* PUBLIC ROUTES                                                */}
                {/* ============================================================ */}
                <Route path="/" element={<HomeRoute />} />
                <Route path="/login" element={<LoginRoute />} />

              {/* ============================================================ */}
              {/* PROTECTED APPLICATION SHELL — All routes inside AppShell     */}
              {/* ============================================================ */}
              <Route
                path="/*"
                element={
                  <AppShell>
                    <Routes>
                      {/* Dashboard — all authenticated users; primary entry after login */}
                      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

                      {/* Tenders, Creation, Results and Compliance Matrix */}
                      <Route path="/tenders" element={<ProtectedRoute feature="tender_spec"><TendersPage /></ProtectedRoute>} />
                      <Route path="/tenders/:tenderId/results" element={<ProtectedRoute><TenderResultsPage /></ProtectedRoute>} />
                      <Route path="/tenders/:tenderId/bids/create" element={<ProtectedRoute feature="bid_upload"><BidUploadPage /></ProtectedRoute>} />
                      <Route path="/compliance" element={<ProtectedRoute feature="compliance_matrix"><ComplianceMatrixPage /></ProtectedRoute>} />

                      {/* Bid Submission / Ingestion */}
                      <Route path="/bids/upload" element={<ProtectedRoute feature="bid_upload"><BidUploadPage /></ProtectedRoute>} />
                      <Route path="/bids/:bidId/upload" element={<ProtectedRoute feature="bid_upload"><BidUploadPage /></ProtectedRoute>} />

                      {/* DigiLocker Simulation Gateway inside AppShell */}
                      <Route path="/digilocker-simulation" element={<ProtectedRoute><DigiLockerSimulationPage /></ProtectedRoute>} />

                      {/* Multi-bidder comparison */}
                      <Route path="/compare" element={<ProtectedRoute feature="multi_bidder_compare"><MultiBidderPage /></ProtectedRoute>} />
                      <Route path="/tenders/:tenderId/compare" element={<ProtectedRoute feature="multi_bidder_compare"><MultiBidderPage /></ProtectedRoute>} />

                      {/* Copilot */}
                      <Route path="/copilot" element={<ProtectedRoute feature="copilot_query"><CopilotPage /></ProtectedRoute>} />

                      {/* Analytics dashboard */}
                      <Route path="/analytics" element={<ProtectedRoute feature="analytics_overview"><AnalyticsDashboard /></ProtectedRoute>} />

                      {/* Seller Verification Routes */}
                      <Route path="/sellers/me" element={<ProtectedRoute><SellerDetailPage /></ProtectedRoute>} />
                      <Route path="/sellers" element={<ProtectedRoute feature="seller_queue"><SellersPage /></ProtectedRoute>} />
                      <Route path="/sellers/:sellerId" element={<ProtectedRoute feature="seller_queue"><SellerDetailPage /></ProtectedRoute>} />

                      {/* Human Review Queue */}
                      <Route path="/reviews" element={<ProtectedRoute feature="human_review"><ReviewsPage /></ProtectedRoute>} />

                      {/* Compliance Reports */}
                      <Route path="/reports" element={<ProtectedRoute feature="compliance_reports"><ReportsPage /></ProtectedRoute>} />

                      {/* Blockchain Audit Trail */}
                      <Route path="/audit" element={<ProtectedRoute feature="blockchain_audit"><AuditLogPage /></ProtectedRoute>} />

                      {/* Government Portal Verification */}
                      <Route path="/portals" element={<ProtectedRoute feature="portal_verification"><PortalVerificationPage /></ProtectedRoute>} />

                      {/* Catch-all 404 Route */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </AppShell>
                }
              />
            </Routes>
          </BrowserRouter>
          </ToastProvider>
        </PermissionsProvider>
      </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};
