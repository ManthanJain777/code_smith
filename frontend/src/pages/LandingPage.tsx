import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { AshokaEmblem } from '../components/ui/AshokaEmblem';
import { GemFoundationBanner, CELEBRATION_BANNERS } from '../components/banner/GemFoundationBanner';
import {
  Search, ChevronDown, ChevronRight, ChevronLeft, Globe, PhoneCall, Sun, Moon,
  ZoomIn, ZoomOut, ExternalLink, ShieldCheck, Zap, Database, Link2,
  Award, Building2, FileText, CheckCircle2, AlertCircle, Users, BarChart3,
  UploadCloud, Clock, ArrowRight, Star, Play, Shield, Cpu, Lock,
  TrendingUp, Radio, Menu, X, Bell
} from 'lucide-react';

/* ========================================================================= */
/*  UTILITY TYPES & DATA                                                      */
/* ========================================================================= */

interface TenderCard {
  id: string;
  number: string;
  title: string;
  department: string;
  category: string;
  value: string;
  status: 'OPEN' | 'IN_EVALUATION' | 'AWARDED';
  deadline: string;
  bids: number;
}

const LIVE_TENDERS: TenderCard[] = [
  {
    id: 'TND-PUMP-001',
    number: 'GEM/2026/B/90124',
    title: 'Supply & Installation of High-Efficiency Centrifugal Water Pumps',
    department: 'Central Water Commission',
    category: 'Industrial Equipment',
    value: '₹5.00 Cr',
    status: 'IN_EVALUATION',
    deadline: '15-10-2026',
    bids: 3,
  },
  {
    id: 'TND-IT-002',
    number: 'GEM/2026/IT/30210',
    title: 'Supply of Enterprise Rack Servers & Network Switching Equipment',
    department: 'National Informatics Centre',
    category: 'IT Equipment',
    value: '₹8.00 Cr',
    status: 'OPEN',
    deadline: '30-09-2026',
    bids: 1,
  },
  {
    id: 'TND-FURN-003',
    number: 'GEM/2026/F/10050',
    title: 'Supply of Ergonomic Office Furniture for 500 Workstations',
    department: 'Dept. of Science & Engineering',
    category: 'Office Furniture',
    value: '₹1.50 Cr',
    status: 'OPEN',
    deadline: '05-10-2026',
    bids: 0,
  },
];

const QUICK_ROLES = [
  {
    role: 'PROCUREMENT_OFFICER',
    email: 'procurement.demo@gembid.local',
    name: 'Rajesh Kumar',
    title: 'Procurement Officer',
    subtitle: 'Multi-bidder compare & Committee Copilot',
    icon: FileText,
    color: 'from-emerald-600 to-teal-700',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    tag: 'FULL ACCESS',
    tagColor: 'bg-emerald-100 text-emerald-800',
  },
  {
    role: 'COMPLIANCE_REVIEWER',
    email: 'reviewer.demo@gembid.local',
    name: 'Anita Sharma',
    title: 'Compliance Reviewer',
    subtitle: 'Exception queue & Blockchain override',
    icon: CheckCircle2,
    color: 'from-blue-600 to-indigo-700',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    tag: 'SCOPED',
    tagColor: 'bg-blue-100 text-blue-800',
  },
  {
    role: 'AUDITOR',
    email: 'auditor.demo@gembid.local',
    name: 'Vikram Sethi',
    title: 'Vigilance Auditor',
    subtitle: 'Immutable EVM audit & Collusion flags',
    icon: Shield,
    color: 'from-purple-600 to-violet-700',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    tag: 'READ-ONLY',
    tagColor: 'bg-purple-100 text-purple-800',
  },
  {
    role: 'BIDDER_VENDOR',
    email: 'bidder.demo@gembid.local',
    name: 'Apex Pumps',
    title: 'Bidder / Vendor',
    subtitle: 'Bid submission & DigiLocker sync',
    icon: UploadCloud,
    color: 'from-amber-600 to-orange-600',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    tag: 'OWN DATA',
    tagColor: 'bg-amber-100 text-amber-800',
  },
  {
    role: 'SYSTEM_ADMIN',
    email: 'admin.demo@gembid.local',
    name: 'System Admin',
    title: 'System Administrator',
    subtitle: 'Health monitor & Sentinel calibration',
    icon: Cpu,
    color: 'from-slate-700 to-slate-900',
    border: 'border-slate-200',
    bg: 'bg-slate-50',
    tag: 'SUPER ADMIN',
    tagColor: 'bg-slate-200 text-slate-800',
  },
];

const STATS = [
  { value: '₹20,48,875+', label: 'Crore Transaction Value', sublabel: 'Total GeM Portal GMV' },
  { value: '10,667+', label: 'Product Categories', sublabel: '349+ Service Categories' },
  { value: '62,000+', label: 'Buyer Organizations', sublabel: 'Central & State Govts' },
  { value: '99.4%', label: 'AI Match Accuracy', sublabel: 'Zero-Hallucination System' },
  { value: '31337', label: 'Hardhat Chain ID', sublabel: 'EVM Blockchain Anchor' },
];

const CATEGORIES = [
  { name: 'Pumps & Valves', icon: '⚙️', count: '1,240+' },
  { name: 'IT Products', icon: '💻', count: '3,800+' },
  { name: 'Automobiles', icon: '🚗', count: '640+' },
  { name: 'Medical Supplies', icon: '🏥', count: '2,100+' },
  { name: 'Office Furniture', icon: '🪑', count: '850+' },
  { name: 'Electrical', icon: '⚡', count: '1,550+' },
  { name: 'Stationery', icon: '📋', count: '420+' },
  { name: 'Textiles', icon: '🧵', count: '680+' },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Zero-Hallucination AI',
    desc: 'Deterministic clause verification under GFR 2017 Rule 173 with evidence citation before any LLM reasoning.',
    color: 'text-amber-600 bg-amber-50',
  },
  {
    icon: Link2,
    title: 'Blockchain Audit Ledger',
    desc: 'Every bid evaluation event is anchored on Ethereum EVM (Hardhat/Sepolia) with keccak256 cryptographic proof.',
    color: 'text-indigo-600 bg-indigo-50',
  },
  {
    icon: Database,
    title: '13-Portal Cross-Verification',
    desc: 'GSTN, MCA-21, EPFO, DPIIT, CPPP debarment, and DigiLocker simultaneously queried for every bid.',
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: ShieldCheck,
    title: 'Forgery Detection Engine',
    desc: 'PyMuPDF metadata analysis detects creation/modification timestamp mismatches and suspicious PDF producers.',
    color: 'text-rose-600 bg-rose-50',
  },
  {
    icon: Users,
    title: 'Multi-Tenant Isolation',
    desc: 'Strict organizational boundaries via JWT-scoped data access. Competitor inspection returns 403 Forbidden.',
    color: 'text-purple-600 bg-purple-50',
  },
  {
    icon: BarChart3,
    title: 'RBAC Permissions Engine',
    desc: 'Dynamic database-driven feature map per role: FULL, READ, OWN, SCOPED, READ_ONLY, or BLOCKED.',
    color: 'text-teal-600 bg-teal-50',
  },
];

/* ========================================================================= */
/*  COMPONENT                                                                  */
/* ========================================================================= */

export const LandingPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'products' | 'services' | 'bids'>('all');
  const [activeSlide, setActiveSlide] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');
  const [langModal, setLangModal] = useState(false);
  const [tickerOffset, setTickerOffset] = useState(0);
  const tickerRef = useRef<HTMLDivElement>(null);

  /* Live clock */
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      const time = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata', hour12: true,
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      setCurrentTime(`${dd}-${mm}-${yyyy} | ${time} IST`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  /* Auto-advance 5 flagship celebration banners (pause on hover) */
  useEffect(() => {
    if (isCarouselPaused) return;
    const id = setInterval(() => {
      setActiveSlide(p => (p + 1) % CELEBRATION_BANNERS.length);
    }, 6500);
    return () => clearInterval(id);
  }, [isCarouselPaused]);

  /* Ticker animation */
  useEffect(() => {
    const id = setInterval(() => {
      setTickerOffset(p => {
        if (tickerRef.current && -p > tickerRef.current.scrollWidth / 2) return 0;
        return p - 1;
      });
    }, 30);
    return () => clearInterval(id);
  }, []);

  /* Quick login */
  const handleQuickLogin = async (email: string, roleLabel: string) => {
    setIsLoggingIn(email);
    setLoginError('');
    const res = await login(email, 'Password123!');
    setIsLoggingIn(null);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setLoginError(`Login failed for ${roleLabel}: ${res.error}`);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(user ? `/tenders?search=${encodeURIComponent(searchQuery)}` : '/login');
  };

  const fontSizeClass = {
    sm: 'text-sm',
    md: '',
    lg: 'text-lg',
  }[fontSize];

  return (
    <div className={`min-h-screen flex flex-col font-sans ${fontSizeClass} ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>

      {/* ================================================================ */}
      {/* 1. TOP ACCESSIBILITY & UTILITY BAR                               */}
      {/* ================================================================ */}
      <div className="h-1 w-full flex" aria-hidden="true">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-white" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      <div className={`${darkMode ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-900 text-slate-300 border-slate-800'} text-[11px] border-b`}>
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-1.5 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">भारत सरकार | Government of India</span>
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-slate-300 font-medium">Ministry of Petroleum & Natural Gas</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden lg:inline text-slate-400 font-mono">{currentTime}</span>

            {/* Accessibility controls */}
            <div className="flex items-center gap-1.5 border-l border-slate-700 pl-3">
              <span className="text-slate-500 hidden sm:inline">Font:</span>
              {(['sm', 'md', 'lg'] as const).map(sz => (
                <button key={sz} onClick={() => setFontSize(sz)}
                  className={`w-5 h-5 rounded text-[10px] font-bold transition ${fontSize === sz ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                  {sz === 'sm' ? 'A-' : sz === 'md' ? 'A' : 'A+'}
                </button>
              ))}
            </div>

            <button onClick={() => setDarkMode(d => !d)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition text-[11px]"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {darkMode ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-slate-400" />}
              <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
            </button>

            <button onClick={() => setLangModal(true)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition text-[11px]"
              title="Toggle Language">
              <Globe className="w-3 h-3 text-amber-400" />
              <span>{lang === 'EN' ? 'English' : 'हिन्दी'}</span>
            </button>

            <a href="tel:18004193436"
              className="hidden sm:flex items-center gap-1 text-slate-400 hover:text-amber-400 transition">
              <PhoneCall className="w-3 h-3" />
              <span>1800-419-3436</span>
            </a>

            <a href="#main-content" className="sr-only focus:not-sr-only focus:px-2 focus:py-0.5 focus:bg-amber-500 focus:text-black focus:rounded text-[10px]">
              Skip to Main Content
            </a>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 2. MAIN GOVERNMENT BRANDING HEADER                               */}
      {/* ================================================================ */}
      <header className={`sticky top-0 z-40 shadow-sm border-b ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-2 flex items-center gap-3 sm:gap-6">

          {/* Logo Block */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <AshokaEmblem size={48} variant={darkMode ? 'white' : 'navy'} />
            <div className="hidden sm:flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className={`font-black text-lg leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  GeM <span className="text-amber-500">Compliance</span>
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${darkMode ? 'bg-slate-800 text-amber-400 border-slate-600' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                  SIH26100
                </span>
              </div>
              <span className={`text-[10px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                National Bid Compliance Verification Platform
              </span>
              <span className={`text-[9px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Government e Marketplace • GFR 2017 Certified
              </span>
            </div>
          </Link>

          {/* Omnibar Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex">
            <div className="relative w-full flex shadow-sm">
              <select
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value as any)}
                className={`border-y border-l rounded-l-lg px-3 text-xs font-semibold focus:outline-none ${darkMode ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-700'}`}>
                <option value="all">All</option>
                <option value="products">Products</option>
                <option value="services">Services</option>
                <option value="bids">Bids/Tenders</option>
              </select>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tenders, products, categories, sellers..."
                className={`flex-1 pl-3 pr-2 py-2 text-sm border-y focus:outline-none focus:ring-2 focus:ring-amber-500 ${darkMode ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
              />
              <button type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-[#1B365D] hover:bg-[#0f2540] text-white text-sm font-semibold rounded-r-lg transition border border-[#1B365D]">
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* User Action Bar */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            {user ? (
              <>
                <span className={`hidden md:inline text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Welcome, <strong>{user.fullName?.split(' ')[0]}</strong>
                </span>
                <Link to="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded-lg transition shadow-sm">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login"
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition ${darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link to="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B365D] hover:bg-[#0f2540] text-white font-bold text-xs rounded-lg transition shadow-sm">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Platform</span>
                </Link>
              </>
            )}
            <button onClick={() => setIsMobileMenuOpen(m => !m)}
              className={`md:hidden p-2 rounded-lg ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}>
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ============================================================= */}
        {/* PRIMARY PORTAL NAVIGATION BAR                                  */}
        {/* ============================================================= */}
        <nav className="bg-[#1B365D] border-t border-[#0f2540]/50 hidden md:block">
          <div className="max-w-screen-2xl mx-auto px-6 flex items-center gap-1">
            {[
              { label: 'Categories', icon: <ChevronDown className="w-3 h-3 ml-0.5" />, href: '#categories' },
              { label: 'Bids & Tenders', icon: <ChevronDown className="w-3 h-3 ml-0.5" />, href: '#tenders' },
              { label: 'Ongoing Auctions', href: '#' },
              { label: 'Seller on GeM', icon: <ChevronDown className="w-3 h-3 ml-0.5" />, href: '#' },
              { label: 'CPPP Tenders', href: '#' },
              { label: 'Notifications', icon: <Bell className="w-3 h-3 ml-1 text-amber-400" />, href: '#ticker' },
            ].map((item, i) => (
              <a key={i} href={item.href}
                className="flex items-center text-slate-200 hover:text-white hover:bg-[#2d4f7a] px-3 py-3 text-xs font-semibold tracking-wide transition-colors">
                {item.label}
                {item.icon}
              </a>
            ))}
            <div className="flex-1" />
            {/* SIH Compliance Platform CTA */}
            <Link to={user ? '/dashboard' : '/login'}
              className="flex items-center gap-1.5 my-1 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs rounded-md transition shadow-md">
              <Zap className="w-3.5 h-3.5" />
              AI Compliance Gateway
            </Link>
          </div>
        </nav>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t p-4 space-y-2 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tenders, products..."
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
              <button type="submit" className="px-3 py-2 bg-[#1B365D] text-white rounded-lg">
                <Search className="w-4 h-4" />
              </button>
            </form>
            {[{ label: 'Categories', href: '#categories' }, { label: 'Tenders', href: '#tenders' }, { label: 'Sign In', to: '/login' }].map((item, i) =>
              item.to ? (
                <Link key={i} to={item.to} onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">
                  {item.label}
                </Link>
              ) : (
                <a key={i} href={item.href} onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">
                  {item.label}
                </a>
              )
            )}
          </div>
        )}
      </header>

      {/* ================================================================ */}
      {/* LIVE NOTIFICATIONS TICKER                                        */}
      {/* ================================================================ */}
      <div id="ticker" className={`border-b overflow-hidden flex items-stretch ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-amber-50 border-amber-200'}`}>
        <div className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold ${darkMode ? 'bg-slate-700 text-amber-400' : 'bg-amber-600 text-white'}`}>
          <Radio className="w-3 h-3 animate-pulse" />
          <span>LIVE</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div ref={tickerRef}
            style={{ transform: `translateX(${tickerOffset}px)`, transition: 'none', whiteSpace: 'nowrap' }}
            className={`inline-block py-1.5 text-[11px] font-medium ${darkMode ? 'text-slate-300' : 'text-amber-900'}`}>
            {[
              '⭐ GeM is linked with TReDS Exchanges for sharing CPSE purchases from MSMEs with financiers, encouraging cheaper and quicker financing. Primary Buyers and Sellers/Service Providers are encouraged to leverage the integrated TReDS facility on GeM for instant invoice discounting.',
              '📢 GEM/2026/B/90124 — High-Efficiency Water Pumps: 3 bids received, IN EVALUATION',
              '🆕 GEM/2026/IT/30210 — Enterprise Servers: OPEN, deadline 30-09-2026',
              '✅ SIH26100 Compliance Platform LIVE — AI verification active, blockchain anchored on Hardhat Chain 31337',
              '📋 GEM/2026/F/10050 — Office Furniture (500 workstations): accepting bids till 05-10-2026',
              '🔐 DigiLocker integration enabled — Aadhaar, GST, and MSME document sync active',
              '⚡ Contradiction resolution — 1 cross-document discrepancy detected and resolved in TND-PUMP-001',
            ].join('  •  ') + '  '}
            {/* Duplicate for seamless scroll */}
            {[
              '⭐ GeM is linked with TReDS Exchanges for sharing CPSE purchases from MSMEs with financiers, encouraging cheaper and quicker financing. Primary Buyers and Sellers/Service Providers are encouraged to leverage the integrated TReDS facility on GeM.',
              '📢 GEM/2026/B/90124 — High-Efficiency Water Pumps: 3 bids received, IN EVALUATION',
              '🆕 GEM/2026/IT/30210 — Enterprise Servers: OPEN, deadline 30-09-2026',
              '✅ SIH26100 Compliance Platform LIVE — AI verification active, blockchain anchored on Hardhat Chain 31337',
            ].join('  •  ')}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* MAIN CONTENT                                                     */}
      {/* ================================================================ */}
      <main id="main-content" className="flex-1">

        {/* ============================================================= */}
        {/* 3. HERO BANNER CAROUSEL (5 CELEBRATION BANNERS)               */}
        {/* ============================================================= */}
        <section 
          className="relative group select-none"
          onMouseEnter={() => setIsCarouselPaused(true)}
          onMouseLeave={() => setIsCarouselPaused(false)}
        >
          <GemFoundationBanner 
            activeDotIndex={activeSlide} 
            totalDots={CELEBRATION_BANNERS.length} 
            onSelectDot={i => setActiveSlide(i)} 
          />

          {/* Floating Left / Right Chevron Controls */}
          <button
            type="button"
            onClick={() => setActiveSlide(p => (p - 1 + CELEBRATION_BANNERS.length) % CELEBRATION_BANNERS.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-xl border border-slate-200/80 flex items-center justify-center transition-all opacity-70 group-hover:opacity-100 hover:scale-110 z-30 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            aria-label="Previous Celebration Banner"
            title="Previous Banner"
          >
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </button>
          <button
            type="button"
            onClick={() => setActiveSlide(p => (p + 1) % CELEBRATION_BANNERS.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-xl border border-slate-200/80 flex items-center justify-center transition-all opacity-70 group-hover:opacity-100 hover:scale-110 z-30 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            aria-label="Next Celebration Banner"
            title="Next Banner"
          >
            <ChevronRight className="w-6 h-6 text-slate-700" />
          </button>
        </section>

        {/* ============================================================= */}
        {/* 4. NATIONAL PROCUREMENT STATS BAR                             */}
        {/* ============================================================= */}
        <section className={`border-b ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#1B365D] border-[#0f2540]'}`}>
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 divide-x divide-white/10">
            {STATS.map((s, i) => (
              <div key={i} className="px-4 text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-black text-amber-400 leading-none">{s.value}</p>
                <p className="text-white font-semibold text-xs mt-1">{s.label}</p>
                <p className="text-slate-400 text-[10px] mt-0.5">{s.sublabel}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================= */}
        {/* 5. FIVE-ROLE QUICK LAUNCHERS (BENTO GRID)                     */}
        {/* ============================================================= */}
        <section className={`py-12 px-4 sm:px-8 ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center mb-8">
              <span className="inline-block px-3 py-1 text-[11px] font-bold tracking-widest uppercase bg-amber-100 text-amber-800 rounded-full mb-3">
                ROLE-BASED EVALUATION SUITE
              </span>
              <h2 className={`text-2xl sm:text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Select Your Role to Access the Platform
              </h2>
              <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Each role has a dynamically configured permission scope, copilot variant, and data isolation boundary.
              </p>
            </div>

            {loginError && (
              <div className="mb-4 max-w-xl mx-auto flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {loginError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {QUICK_ROLES.map(role => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.role}
                    onClick={() => handleQuickLogin(role.email, role.title)}
                    disabled={!!isLoggingIn}
                    className={`group relative flex flex-col items-start gap-3 p-5 rounded-2xl border-2 transition-all text-left hover:shadow-lg hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed ${role.border} ${darkMode ? 'bg-slate-800 hover:bg-slate-750' : `${role.bg} hover:bg-white`}`}>

                    {/* Role icon with gradient background */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${role.color} text-white shadow-md`}>
                      {isLoggingIn === role.email ? (
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 w-full">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{role.title}</p>
                          <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>{role.name}</p>
                        </div>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0 ${role.tagColor}`}>
                          {role.tag}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-2 leading-snug ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {role.subtitle}
                      </p>
                    </div>

                    <div className={`flex items-center gap-1 text-[11px] font-bold group-hover:gap-2 transition-all ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span>Quick Launch</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                );
              })}
            </div>
            <p className={`text-center text-[11px] mt-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              All quick-launch profiles use demo credentials. Password: <code className="font-mono bg-slate-100 px-1 rounded">Password123!</code>
            </p>
          </div>
        </section>

        {/* ============================================================= */}
        {/* 6. ACTIVE TENDERS SHOWCASE                                     */}
        {/* ============================================================= */}
        <section id="tenders" className={`py-12 px-4 sm:px-8 border-t ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
              <div>
                <span className="inline-block px-3 py-1 text-[11px] font-bold tracking-widest uppercase bg-emerald-100 text-emerald-800 rounded-full mb-2">
                  LIVE PROCUREMENT
                </span>
                <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Active Tenders
                </h2>
              </div>
              <Link to={user ? '/tenders' : '/login'}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1B365D] hover:bg-[#0f2540] text-white font-semibold text-sm transition">
                View All Tenders <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {LIVE_TENDERS.map(tender => (
                <div key={tender.id}
                  className={`rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition group ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'}`}>
                  <div className={`px-5 py-4 border-b ${darkMode ? 'border-slate-600' : 'border-slate-100'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={`text-[10px] font-mono font-bold ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                          {tender.number}
                        </p>
                        <h3 className={`font-bold text-sm leading-snug mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {tender.title}
                        </h3>
                      </div>
                      <span className={`flex-shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full ${
                        tender.status === 'IN_EVALUATION'
                          ? 'bg-amber-100 text-amber-800'
                          : tender.status === 'OPEN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {tender.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="px-5 py-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Department</span>
                      <span className={`font-semibold text-right max-w-[55%] ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{tender.department}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Estimated Value</span>
                      <span className={`font-black ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{tender.value}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Deadline</span>
                      <span className={`font-semibold flex items-center gap-1 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                        <Clock className="w-3 h-3" /> {tender.deadline}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Bids Received</span>
                      <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{tender.bids}</span>
                    </div>
                  </div>

                  <div className={`px-5 pb-4 flex gap-2 border-t pt-3 ${darkMode ? 'border-slate-600' : 'border-slate-100'}`}>
                    <Link to={user ? `/compliance?tender=${tender.id}` : '/login'}
                      className="flex-1 text-center px-3 py-1.5 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 transition">
                      Compliance Matrix
                    </Link>
                    <Link to={user ? `/tenders/${tender.id}/results` : '/login'}
                      className={`flex-1 text-center px-3 py-1.5 rounded-lg text-[11px] font-bold border transition ${darkMode ? 'border-slate-500 text-slate-300 hover:bg-slate-600' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                      View Results
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* 7. POPULAR CATEGORIES                                          */}
        {/* ============================================================= */}
        <section id="categories" className={`py-12 px-4 sm:px-8 border-t ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center mb-8">
              <span className="inline-block px-3 py-1 text-[11px] font-bold tracking-widest uppercase bg-blue-100 text-blue-800 rounded-full mb-3">
                PROCUREMENT CATALOGUE
              </span>
              <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Popular Product Categories
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {CATEGORIES.map((cat, i) => (
                <Link key={i} to={user ? '/tenders' : '/login'}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition hover:shadow-md hover:-translate-y-0.5 text-center ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-amber-500/50' : 'bg-white border-slate-200 hover:border-amber-300'}`}>
                  <span className="text-2xl">{cat.icon}</span>
                  <span className={`text-xs font-bold leading-tight ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{cat.name}</span>
                  <span className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{cat.count} items</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* 8. PLATFORM FEATURES                                           */}
        {/* ============================================================= */}
        <section className={`py-14 px-4 sm:px-8 border-t ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block px-3 py-1 text-[11px] font-bold tracking-widest uppercase bg-indigo-100 text-indigo-800 rounded-full mb-3">
                WHY CHOOSE THIS PLATFORM
              </span>
              <h2 className={`text-2xl sm:text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                AI-Powered Compliance Differentiators
              </h2>
              <p className={`mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Built specifically for public procurement under GFR 2017, GeM GTC, and Indian government statutory requirements.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i}
                    className={`group p-6 rounded-2xl border transition hover:shadow-md ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${f.color} mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className={`font-bold text-base mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{f.title}</h3>
                    <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* 9. OUTLET STORES / SPECIAL INITIATIVES                         */}
        {/* ============================================================= */}
        <section className={`py-10 px-4 sm:px-8 border-t ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <div className="max-w-screen-2xl mx-auto">
            <h2 className={`text-xl font-black mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              GeM Outlet Stores & Special Initiatives
            </h2>
            <div className="flex flex-wrap gap-3">
              {[
                { emoji: '🌾', label: 'SARAS Ajeevika', color: 'bg-green-50 border-green-200 text-green-800' },
                { emoji: '🏺', label: 'ODOP Products', color: 'bg-amber-50 border-amber-200 text-amber-800' },
                { emoji: '🚀', label: 'Startup Runway', color: 'bg-purple-50 border-purple-200 text-purple-800' },
                { emoji: '🧵', label: 'India Handloom', color: 'bg-pink-50 border-pink-200 text-pink-800' },
                { emoji: '🎨', label: 'India Handicraft', color: 'bg-orange-50 border-orange-200 text-orange-800' },
                { emoji: '👩', label: 'Womaniya', color: 'bg-rose-50 border-rose-200 text-rose-800' },
                { emoji: '🌾', label: 'Millets', color: 'bg-lime-50 border-lime-200 text-lime-800' },
              ].map((store, i) => (
                <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition cursor-pointer hover:shadow-sm ${store.color}`}>
                  <span>{store.emoji}</span>
                  <span>{store.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* 10. TRUST & STATUTORY COMPLIANCE CTA STRIP                     */}
        {/* ============================================================= */}
        <section className="bg-[#1B365D] text-white py-12 px-4 sm:px-8">
          <div className="max-w-screen-2xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <AshokaEmblem size={72} variant="white" />
            </div>
            <h2 className="text-2xl font-black mb-3 text-white">
              Transparent • Accountable • Efficient
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl mx-auto mb-6">
              The SIH26100 platform upholds the government's commitment to zero-corruption public procurement through automated GFR 2017 compliance, tamper-proof Ethereum audit trails, and multi-role transparent evaluation workflows.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={user ? '/dashboard' : '/login'}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 transition shadow-lg text-sm">
                <Zap className="w-4 h-4" />
                Access Compliance Platform
              </Link>
              <a href="https://gem.gov.in" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition text-sm">
                <ExternalLink className="w-4 h-4" />
                Visit GeM National Portal
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ================================================================ */}
      {/* 11. OFFICIAL GOVERNMENT FOOTER                                   */}
      {/* ================================================================ */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
        <div className="h-0.5 w-full flex" aria-hidden="true">
          <div className="h-full w-1/3 bg-[#FF9933]" />
          <div className="h-full w-1/3 bg-white" />
          <div className="h-full w-1/3 bg-[#138808]" />
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <AshokaEmblem size={56} variant="white" />
            <div className="text-white font-bold text-sm">GeM Bid Compliance Platform</div>
            <p className="text-[11px] leading-relaxed">
              Ministry of Petroleum & Natural Gas, Government of India.
              Automated GFR 2017 compliance verification under the Smart India Hackathon initiative.
            </p>
            <span className="inline-block bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-mono text-[10px]">SIH26100</span>
          </div>

          <div className="text-[11px] space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Statutory Verification</h4>
            {[
              { label: 'Government e-Marketplace (GeM)', href: 'https://gem.gov.in' },
              { label: 'GSTN National Tax Registry', href: 'https://services.gst.gov.in' },
              { label: 'MCA-21 Corporate Registry', href: 'https://mca.gov.in' },
              { label: 'Udyam MSME Registration', href: 'https://udyamregistration.gov.in' },
              { label: 'CPPP Public Tenders', href: 'https://eprocure.gov.in/cppp' },
            ].map((link, i) => (
              <a key={i} href={link.href} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 hover:text-amber-400 transition-colors">
                {link.label} <ExternalLink className="w-2.5 h-2.5" />
              </a>
            ))}
          </div>

          <div className="text-[11px] space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Vigilance & Redressal</h4>
            {[
              { label: 'CPGRAMS Public Grievance Portal', href: 'https://pgportal.gov.in' },
              { label: 'RTI Online Portal', href: 'https://rtionline.gov.in' },
              { label: 'GFR 2017 Rule 173 — Transparency Standard' },
              { label: 'DPDP Act 2023 Compliant' },
              { label: 'Blockchain Proof-of-Existence on EVM' },
            ].map((item, i) =>
              item.href ? (
                <a key={i} href={item.href} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 hover:text-amber-400 transition-colors">
                  {item.label} <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ) : (
                <p key={i}>{item.label}</p>
              )
            )}
          </div>

          <div className="text-[11px] space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Helpdesk & Support</h4>
            <div className="space-y-2">
              <a href="tel:18004193436" className="flex items-center gap-2 text-slate-300 hover:text-amber-400 transition-colors">
                <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold">Toll-Free: 1800-419-3436</span>
              </a>
              <p className="text-slate-500">compliance-helpdesk@gem.gov.in</p>
              <p className="text-slate-500">Mon–Sat, 09:00–18:00 IST</p>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <p className="text-[10px] text-slate-600">
                Developed by Team SIH26100 under the Smart India Hackathon 2026.<br />
                Hosted by NIC — National Informatics Centre, MeitY.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-600">
          <span>© 2026 Government e Marketplace SPV. All rights reserved. | Ministry of Commerce & Industry, Government of India.</span>
          <span>Last Updated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
        </div>
      </footer>

      {/* Language Modal */}
      {langModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-100 overflow-hidden">
            <div className="bg-[#1B365D] text-white p-5">
              <h3 className="font-bold text-base">Language Selection</h3>
              <p className="text-slate-300 text-xs mt-0.5">Platform language preference</p>
            </div>
            <div className="p-6 space-y-3">
              {[
                { code: 'EN', name: 'English', note: 'Currently active' },
                { code: 'HI', name: 'हिन्दी (Hindi)', note: 'आगामी / Coming Soon' },
              ].map(l => (
                <button key={l.code} onClick={() => { setLang(l.code as any); setLangModal(false); }}
                  className={`w-full text-left p-3 rounded-xl border-2 transition flex items-center justify-between ${lang === l.code ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div>
                    <p className="font-bold text-sm text-slate-900">{l.name}</p>
                    <p className="text-xs text-slate-500">{l.note}</p>
                  </div>
                  {lang === l.code && <CheckCircle2 className="w-5 h-5 text-amber-500" />}
                </button>
              ))}
              <button onClick={() => setLangModal(false)}
                className="w-full py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition mt-2">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
