import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import { usePermissions } from '../../context/PermissionsContext';
import { GemStarLogo } from '../ui/GemStarLogo';
import { ProfileSettingsModal } from '../ui/ProfileSettingsModal';
import { CreateTenderModal } from '../tenders/CreateTenderModal';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  ShieldCheck,
  Globe,
  Bell,
  PhoneCall,
  ChevronDown,
  LogOut,
  Search,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  UserCheck,
  Users,
  BarChart3,
  Link2,
  UploadCloud,
  Award,
  HelpCircle,
  Home,
  Server,
  Sparkles,
  Bot,
  Zap
} from 'lucide-react';
import { useGuidedTour } from '../../context/GuidedTourContext';

interface GovTopNavProps {
  onToggleNotifications: () => void;
  unreadNotificationCount: number;
}

export const GovTopNav: React.FC<GovTopNavProps> = ({
  onToggleNotifications,
  unreadNotificationCount
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, switchRole } = useAuth();
  const { startTour } = useGuidedTour();
  const { hasAccess } = usePermissions();
  const { showToast } = useToast();

  const { lang, toggleLang, t } = useLanguage();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreateTenderModalOpen, setIsCreateTenderModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'tenders' | 'bids'>('all');

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      setCurrentTime(`${day}-${month}-${year} | ${timeStr} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (searchFilter === 'bids') {
      navigate(`/compliance?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/tenders?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const adjustFontSize = (size: 'sm' | 'md' | 'lg') => {
    setFontSize(size);
    const htmlEl = document.documentElement;
    if (size === 'sm') htmlEl.style.fontSize = '14px';
    else if (size === 'lg') htmlEl.style.fontSize = '17px';
    else htmlEl.style.fontSize = '16px';
  };

  const role = user?.role || 'VIEWER';
  const isVendor = role.includes('BIDDER');
  const isReviewer = role.includes('REVIEWER');
  const isAuditor = role.includes('AUDITOR') || role.includes('VIEWER');
  const isAdmin = role === 'SYSTEM_ADMIN';
  const isOfficer = role.includes('OFFICER');

  // Master Dynamic Navigation Structure with Sub-Menus (Mega-Menu items)
  interface NavGroup {
    id: string;
    label: string;
    path?: string;
    icon: React.ComponentType<{ className?: string }>;
    allowed: boolean;
    children?: Array<{
      label: string;
      path: string;
      description?: string;
      icon: React.ComponentType<{ className?: string }>;
      allowed: boolean;
    }>;
  }

  const navGroups: NavGroup[] = [
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      path: '/dashboard',
      icon: LayoutDashboard,
      allowed: true
    },
    {
      id: 'tenders',
      label: isVendor ? t('nav.browseTenders') : t('nav.tenders'),
      path: '/tenders',
      icon: FileText,
      allowed: hasAccess('tender_spec')
    },
    {
      id: 'submission',
      label: t('nav.submitBid'),
      path: '/bids/upload',
      icon: UploadCloud,
      allowed: isVendor && hasAccess('bid_upload')
    },
    {
      id: 'evaluation',
      label: isVendor ? t('nav.myCompliance') : t('nav.compliance'),
      icon: CheckCircle2,
      allowed: hasAccess('compliance_matrix'),
      children: isVendor ? undefined : [
        {
          label: t('nav.matrixAndReports'),
          path: '/compliance',
          description: 'Detailed requirement breakdown with multi-stage reasoning chain and executive audit reports',
          icon: CheckCircle2,
          allowed: hasAccess('compliance_matrix')
        },
        {
          label: t('nav.compare'),
          path: '/compare',
          description: 'Side-by-side technical evaluation across all tender bidders',
          icon: Users,
          allowed: hasAccess('multi_bidder_compare')
        }
      ],
      path: isVendor ? '/compliance' : undefined
    },
    {
      id: 'clarifications',
      label: t('nav.clarifications'),
      path: '/reviews',
      icon: AlertTriangle,
      allowed: isVendor
    },
    {
      id: 'verification',
      label: isVendor ? t('nav.vendorProfile') : t('nav.verification'),
      icon: UserCheck,
      allowed: isVendor ? true : (hasAccess('seller_queue') || hasAccess('portal_verification') || hasAccess('human_review')),
      path: isVendor ? '/sellers/me' : undefined,
      children: isVendor ? undefined : [
        {
          label: t('nav.portals'),
          path: '/portals',
          description: 'Live simulated API connectors for GSTN, MCA21, EPFO, PAN',
          icon: ShieldCheck,
          allowed: hasAccess('portal_verification')
        },
        {
          label: t('nav.sellers'),
          path: '/sellers',
          description: 'Vendor credential vetting, trust scores, and debarment screening',
          icon: UserCheck,
          allowed: hasAccess('seller_queue')
        },
        {
          label: t('nav.humanReview'),
          path: '/reviews',
          description: 'Reviewer calibration and statutory contradiction resolution',
          icon: AlertTriangle,
          allowed: hasAccess('human_review')
        }
      ]
    },
    {
      id: 'copilot',
      label: isVendor ? t('nav.bidAssistant') : (isReviewer ? t('nav.exceptionAssistant') : (isAuditor ? t('nav.vigilanceTranscripts') : t('nav.copilot'))),
      path: '/copilot',
      icon: Zap,
      allowed: hasAccess('copilot_query')
    },
    {
      id: 'analytics',
      label: t('nav.analytics'),
      path: '/analytics',
      icon: BarChart3,
      allowed: hasAccess('analytics_overview') && !isVendor
    },
    {
      id: 'audit',
      label: isVendor ? t('nav.proofs') : t('nav.audit'),
      path: isVendor ? '/audit' : undefined,
      icon: Link2,
      allowed: true,
      children: isVendor ? undefined : [
        {
          label: 'Audit Trail & Overrides',
          path: '/audit?tab=trail',
          description: 'Immutable record of security events and reviewer overrides',
          icon: Link2,
          allowed: hasAccess('blockchain_audit')
        },
        {
          label: 'Internal Chain Explorer',
          path: '/audit?tab=explorer',
          description: 'Browsable blockchain ledger with live block numbers and gas metrics',
          icon: Award,
          allowed: hasAccess('blockchain_audit')
        }
      ]
    }
  ].filter(g => g.allowed);

  const isActiveGroup = (group: NavGroup) => {
    if (group.path && location.pathname === group.path) return true;
    if (group.children) {
      return group.children.some(c => location.pathname === c.path);
    }
    return false;
  };

  return (
    <header className="w-full bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
      {/* Top 4px National Tricolor Accent Strip */}
      <div className="h-1 w-full flex" aria-hidden="true">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-[#FFFFFF]" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      {/* ========================================================================= */}
      {/* ROW 1: Thin Accessibility & Utility Bar                                   */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 sm:px-8 flex flex-wrap justify-between items-center border-b border-slate-800 font-medium select-none">
        {/* Left: Ministry Identification & Skip to Main Content */}
        <div className="flex items-center space-x-3">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:bg-amber-600 focus:text-white px-2 py-0.5 rounded text-[11px] font-semibold transition"
          >
            Skip to Main Content
          </a>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-200">भारत सरकार | Government of India</span>
          <span className="text-slate-600 hidden md:inline">•</span>
          <span className="text-slate-300 font-semibold hidden md:inline">Ministry of Petroleum & Natural Gas</span>
        </div>

        {/* Right: Controls (Font Scale, Language, Clock, Helpline) */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-1 text-slate-400 font-mono text-[10px]">
            <span>{currentTime}</span>
          </div>

          {/* Font Size A- / A / A+ Controls */}
          <div className="hidden sm:flex items-center space-x-1 border-l border-slate-700 pl-3">
            <span className="text-slate-400 text-[10px] mr-1">Font:</span>
            <button
              onClick={() => adjustFontSize('sm')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${fontSize === 'sm' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => adjustFontSize('md')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${fontSize === 'md' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
              title="Default Font Size"
            >
              A
            </button>
            <button
              onClick={() => adjustFontSize('lg')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${fontSize === 'lg' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center space-x-2 border-l border-slate-700 pl-3">
            <button
              onClick={toggleLang}
              className="flex items-center space-x-1 hover:text-white transition-colors text-[10px] font-semibold bg-slate-800 px-2 py-0.5 rounded cursor-pointer"
              title="Toggle Official Language (English / हिन्दी)"
            >
              <Globe className="w-3 h-3 text-amber-400" />
              <span>{lang === 'EN' ? 'English (EN)' : 'हिन्दी (HI)'}</span>
            </button>
            <a
              href="tel:18004193436"
              className="hidden md:flex items-center space-x-1 text-slate-300 hover:text-amber-300 transition-colors text-[10px]"
              title="Government National Procurement Helpline"
            >
              <PhoneCall className="w-3 h-3 text-amber-400" />
              <span>{t('topnav.helpline')}</span>
            </a>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LIVE DEMO ROLE SWITCHER TOOLBAR (EXPERIENCE ALL 5 ROLES INSTANTLY)        */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white px-4 sm:px-6 lg:px-8 py-1.5 border-b border-indigo-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-950/90 px-2 py-0.5 rounded border border-amber-500/40 flex items-center gap-1 shadow-xs">
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> {lang === 'HI' ? 'डेमो भूमिका स्विचर' : 'DEMO ROLE SWITCHER'}
          </span>
          <span className="text-slate-400 hidden sm:inline text-[11px]">
            {lang === 'HI' ? 'हितधारक परिप्रेक्ष्य का परीक्षण करने हेतु भूमिका बदलें:' : 'Switch identity to test any stakeholder perspective:'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {[
            { role: 'BIDDER_VENDOR', label: lang === 'HI' ? 'बोलीदाता / विक्रेता' : 'Bidder / Vendor', icon: UploadCloud },
            { role: 'PROCUREMENT_OFFICER', label: lang === 'HI' ? 'खरीद अधिकारी' : 'Procurement Officer', icon: FileText },
            { role: 'COMPLIANCE_REVIEWER', label: lang === 'HI' ? 'अनुपालन समीक्षक' : 'Compliance Reviewer', icon: CheckCircle2 },
            { role: 'AUDITOR', label: lang === 'HI' ? 'लेखा परीक्षक एवं सतर्कता' : 'Auditor & Vigilance', icon: ShieldCheck },
            { role: 'SYSTEM_ADMIN', label: lang === 'HI' ? 'सिस्टम प्रशासक' : 'System Admin', icon: Server },
          ].map(r => {
            const isCurrent = user?.role === r.role || (r.role === 'BIDDER_VENDOR' && user?.role === 'BIDDER');
            return (
              <button
                key={r.role}
                type="button"
                onClick={() => {
                  switchRole(r.role);
                  navigate('/dashboard');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-300'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
                title={`Switch active perspective to ${r.label}`}
              >
                <r.icon className={`w-3 h-3 ${isCurrent ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{r.label}</span>
                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse ml-0.5" />
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={startTour}
            className="px-3 py-1 rounded-md text-[11px] font-black bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:from-amber-400 hover:to-amber-300 transition flex items-center gap-1.5 cursor-pointer shadow-md border border-amber-300 ml-1.5 shrink-0"
            title="Start First-Time User Experience (FTUE) Guided Demo Tour"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>{lang === 'HI' ? 'इंटरैक्टिव टूर' : 'Interactive Tour'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 2: Main Brand, Search, User Identity & PROMINENT LOGOUT               */}
      {/* ========================================================================= */}
      <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Left: GeM Shield Logo & Platform Wordmark */}
        <Link to="/dashboard" className="flex items-center space-x-3 flex-shrink-0 group">
          <div className="relative flex-shrink-0">
            <GemStarLogo size={38} variant="navy" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-black text-xl tracking-tight text-slate-900 flex items-center">
                GeM <span className="text-amber-600 ml-1">Compliance</span>
              </span>
              <span className="hidden sm:inline-block bg-amber-100 text-amber-900 font-bold text-[9px] px-2 py-0.5 rounded border border-amber-200">
                GFR 2017 CERTIFIED
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-tight hidden sm:block">
              National Bid Compliance Verification Platform • SIH26100
            </p>
          </div>
        </Link>

        {/* Center: Global Search Bar for Tenders & Bids */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full flex items-center">
            <select
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value as any)}
              className="absolute left-1 top-1 bottom-1 text-[11px] font-semibold bg-slate-100 border-r border-slate-200 rounded-l-md px-2 text-slate-700 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="tenders">Tenders</option>
              <option value="bids">Bids</option>
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('nav.searchPlaceholder')}
              className="w-full pl-24 pr-10 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
            />
            <button
              type="submit"
              className="absolute right-1 p-1.5 text-slate-400 hover:text-amber-600 transition"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Right: Notifications, User Avatar & PROMINENT LOGOUT BUTTON */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* Notifications Drawer Button */}
          <button
            onClick={onToggleNotifications}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="Important Updates and Alerts"
            title="Important Updates"
          >
            <Bell className="w-5 h-5 text-slate-700" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-white text-[9px] font-bold items-center justify-center">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              </span>
            )}
          </button>

          {/* User Identity Pill (Desktop) */}
          {user && (
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="hidden lg:flex items-center space-x-2.5 border-l border-slate-200 pl-3 py-1 px-2 rounded-lg hover:bg-slate-100/90 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer group"
              title="Click to open Profile & Settings"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs shadow-inner group-hover:scale-105 transition-transform">
                {user.fullName?.charAt(0) || 'U'}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[130px] group-hover:text-amber-700 transition-colors">
                  {user.fullName}
                </div>
                <div className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">
                  {user.role?.replace('ROLE_', '')}
                </div>
              </div>
            </button>
          )}

          {/* Mobile Hamburger Trigger (<= 768px) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition focus:outline-none"
            aria-label="Toggle Full Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 3: Mega-Menu Category Row (Desktop Horizontal Navigation)             */}
      {/* ========================================================================= */}
      <nav className="hidden md:block bg-slate-800 text-white border-t border-slate-700/80 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-1" ref={dropdownRef}>
          <div className="flex items-center space-x-1">
            {navGroups.map(group => {
              const Icon = group.icon;
              const hasChildren = group.children && group.children.length > 0;
              const isActive = isActiveGroup(group);
              const isOpen = openDropdown === group.id;

              if (!hasChildren && group.path) {
                return (
                  <Link
                    key={group.id}
                    to={group.path}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-xs font-semibold transition ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-200 hover:text-white hover:bg-slate-700/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{group.label}</span>
                  </Link>
                );
              }

              return (
                <div key={group.id} className="relative">
                  <button
                    onClick={() => setOpenDropdown(isOpen ? null : group.id)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-xs font-semibold transition ${
                      isActive || isOpen
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-200 hover:text-white hover:bg-slate-700/80'
                    }`}
                    aria-expanded={isOpen}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{group.label}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Mega-Menu Panel */}
                  {isOpen && (
                    <div className="absolute left-0 mt-1 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-1.5 border-b border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {group.label}
                        </span>
                      </div>
                      <div className="py-1">
                        {group.children?.map(child => {
                          const ChildIcon = child.icon;
                          const isChildActive = location.pathname === child.path;
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={() => setOpenDropdown(null)}
                              className={`flex items-start gap-2.5 px-3 py-2 transition ${
                                isChildActive
                                  ? 'bg-amber-50 text-amber-900 font-semibold'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <ChildIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isChildActive ? 'text-amber-600' : 'text-slate-400'}`} />
                              <div>
                                <div className="text-xs font-semibold">{child.label}</div>
                                {child.description && (
                                  <div className="text-[10px] text-slate-500 line-clamp-1 leading-normal">
                                    {child.description}
                                  </div>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Role-Specific Quick Action Trigger */}
          <div className="flex items-center pl-4">
            {isOfficer && (
              <button
                type="button"
                onClick={() => setIsCreateTenderModalOpen(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                title="Create a new Notice Inviting Tender (NIT)"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-200" />
                <span>{t('nav.createTender')}</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* MOBILE FULL-SCREEN MENU TAKEOVER (<= 768px, specifically tested at 375px) */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
          <div className="bg-white flex flex-col h-full max-w-sm w-full shadow-2xl overflow-y-auto">
            {/* Mobile Header Bar */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm tracking-tight">GeM Compliance</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded">
                  {user?.role?.replace('ROLE_', '')}
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
                aria-label="Close Mobile Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="p-3 bg-slate-50 border-b border-slate-200">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search tenders / bids..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
              </div>
            </form>

            {/* Mobile Navigation Links */}
            <div className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navGroups.map(group => {
                const Icon = group.icon;
                const hasChildren = group.children && group.children.length > 0;
                const isActive = isActiveGroup(group);

                return (
                  <div key={group.id} className="py-1">
                    {!hasChildren && group.path ? (
                      <Link
                        to={group.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                          isActive ? 'bg-amber-600 text-white' : 'text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{group.label}</span>
                      </Link>
                    ) : (
                      <div>
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-slate-500" />
                          <span>{group.label}</span>
                        </div>
                        <div className="pl-4 space-y-0.5 mt-0.5">
                          {group.children?.map(child => {
                            const ChildIcon = child.icon;
                            const isChildActive = location.pathname === child.path;
                            return (
                              <Link
                                key={child.path}
                                to={child.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition ${
                                  isChildActive ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <ChildIcon className="w-3.5 h-3.5 text-slate-500" />
                                <span>{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {isOfficer && (
                <div className="pt-2 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsCreateTenderModalOpen(true);
                    }}
                    className="w-full px-3 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-emerald-200" />
                    <span>+ Create Tender (NIT)</span>
                  </button>
                </div>
              )}
            </div>

            {/* User Details & Mobile Log Out Button */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              {user && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="mb-3 w-full text-left flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
                  title="Open Profile & Settings"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs">
                      {user.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{user.fullName}</div>
                      <div className="text-[10px] text-slate-500">{user.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Settings
                  </span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>{t('nav.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile & Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Globally Triggerable Create Tender Modal */}
      <CreateTenderModal
        isOpen={isCreateTenderModalOpen}
        onClose={() => setIsCreateTenderModalOpen(false)}
        onSuccess={() => {
          setIsCreateTenderModalOpen(false);
          showToast('Notice Inviting Tender (NIT) published and anchored to EVM blockchain.', 'success', 'Tender Created');
          navigate('/tenders');
        }}
      />
    </header>
  );
};
