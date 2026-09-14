import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, ArrowLeft,
  UserCheck, CheckCircle2, ChevronLeft, ChevronRight, Cpu, Layers, Database, Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { GemStarLogo } from '../components/ui/GemStarLogo';

interface CarouselSlide {
  title: string;
  subtitle: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    title: 'Autonomous Bid Compliance Evaluation',
    subtitle: 'Zero-hallucination deterministic clause verification and hybrid RAG evidence citation under GFR 2017 Rules.',
    tag: 'PROCUREMENT INTELLIGENCE',
    icon: Cpu
  },
  {
    title: '13-Portal Automated Statutory Vetting',
    subtitle: 'Real-time API connector simulation across GSTN, MCA21, EPFO, DPIIT, and CPPP debarment registries.',
    tag: 'SELLER VERIFICATION',
    icon: Database
  },
  {
    title: 'Ethereum Proof-of-Authority Audit Ledger',
    subtitle: 'Immutable, tamper-proof on-chain anchoring for bid submissions, officer overrides, and tender awards.',
    tag: 'BLOCKCHAIN INTEGRITY',
    icon: Layers
  }
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const { user, login } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // If already authenticated, redirect to dashboard immediately
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Check if session expired query param is present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('session') === 'expired') {
      setErrorMessage('Your security session has expired. Please sign in again.');
    }
  }, [location.search]);

  // Auto-advance marketing carousel every 6s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = CAROUSEL_SLIDES[activeSlide] || CAROUSEL_SLIDES[0];
  const SlideIcon = currentSlide.icon;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoRoleLabel: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setErrorMessage('');
    setIsSubmitting(true);

    const res = await login(demoEmail, 'Password123!');
    setIsSubmitting(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(`Quick Login for ${demoRoleLabel} failed: ${res.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Top Ministry Accent Header Strip */}
      <div className="h-1.5 w-full flex" aria-hidden="true">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-white" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-2 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-800 tracking-tight">भारत सरकार | Government of India</span>
          <span className="text-slate-300">•</span>
          <span>Ministry of Commerce & Industry</span>
        </div>
        <div className="flex items-center space-x-2.5 text-[10px] font-mono text-slate-500">
          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-1 text-slate-700 hover:text-amber-800 font-sans font-semibold bg-slate-100 hover:bg-amber-50 border border-slate-300 px-2.5 py-0.5 rounded transition shadow-xs cursor-pointer"
            title="Toggle Language"
          >
            <Globe className="w-3 h-3 text-amber-600" />
            <span>{lang === 'EN' ? 'हिन्दी (HI)' : 'English (EN)'}</span>
          </button>
          <Link
            to="/"
            className="flex items-center gap-1 text-slate-700 hover:text-amber-700 font-sans font-bold bg-slate-100 hover:bg-amber-50 border border-slate-300 px-2.5 py-0.5 rounded transition shadow-xs"
            title="Return to GeM Public Portal"
          >
            <ArrowLeft className="w-3 h-3 text-slate-600" />
            <span>{t('login.goBackToPortal', 'Go Back to Portal')}</span>
          </Link>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="hidden sm:inline">GFR 2017 & 2024 Audit Engine</span>
        </div>
      </div>

      {/* Subtle Background Mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-emerald-100/40 blur-[130px] rounded-full pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Brand Header with GeM Shield Logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <GemStarLogo size={52} variant="color" className="mb-2" />
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-black tracking-tight text-slate-900 font-mono">
                GeM<span className="text-amber-600">COMPLIANCE</span>
              </span>
              <span className="bg-amber-100 text-amber-900 font-bold text-[9px] px-2 py-0.5 rounded border border-amber-300">
                GFR 2017 CERTIFIED
              </span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {t('login.heading')}
          </h1>
          <p className="mt-1 text-xs text-slate-500 uppercase tracking-widest font-mono">
            {t('login.subheading')}
          </p>
        </div>

        {/* 2-Column Responsive Layout: Feature Carousel + Auth Form */}
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Carousel & Trust Accreditations */}
          <div className="lg:col-span-6 space-y-5">
            {/* Dynamic Feature Carousel Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  {currentSlide.tag}
                </span>
                <div className="flex items-center space-x-1.5">
                  {CAROUSEL_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        activeSlide === idx ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2.5 min-h-[140px]">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-2">
                  <SlideIcon className="w-6 h-6" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                  {currentSlide.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {currentSlide.subtitle}
                </p>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-slate-100 text-xs text-slate-500">
                <span>GFR 2017 & 2024 Procurement Standards</span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setActiveSlide(prev => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveSlide(prev => (prev + 1) % CAROUSEL_SLIDES.length)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Trust Badge Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center space-x-3 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">GFR Rule 173 Certified</h3>
                  <p className="text-[11px] text-slate-500">Public procurement compliance</p>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center space-x-3 shadow-xs">
                <Lock className="w-5 h-5 text-teal-600 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">256-Bit Blockchain</h3>
                  <p className="text-[11px] text-slate-500">Tamper-proof event proof</p>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center space-x-3 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Zero Hallucination</h3>
                  <p className="text-[11px] text-slate-500">Evidence-first requirement audit</p>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center space-x-3 shadow-xs">
                <UserCheck className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Multi-Bidder Isolation</h3>
                  <p className="text-[11px] text-slate-500">Strict organizational boundaries</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Form & Quick Seed Logins */}
          <div className="lg:col-span-6">
            <div className="bg-white py-7 px-6 sm:px-8 shadow-sm border border-slate-200 rounded-2xl">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{t('login.signIn')}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{t('login.subtitle')}</p>
                </div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-bold transition shadow-xs border border-slate-200 shrink-0"
                  title="Return to GeM Public Portal"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('login.goBack')}</span>
                </Link>
              </div>

              {errorMessage && (
                <div className="mb-5 rounded-lg bg-red-50 border border-red-200 p-3 flex items-start space-x-2.5 text-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">{errorMessage}</div>
                </div>
              )}

              <form className="space-y-3.5" onSubmit={handleLogin}>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    {t('login.email')}
                  </label>
                  <div className="relative rounded-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer@gem.gov.in"
                      className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-xs sm:text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    {t('login.password')}
                  </label>
                  <div className="relative rounded-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="block w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-xs sm:text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:opacity-50 transition-all cursor-pointer mt-2"
                >
                  {isSubmitting ? (
                    <span>{t('login.authenticating')}</span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <span>{t('login.signIn')}</span>
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </button>
              </form>

              {/* Quick Demo Role Logins */}
              <div className="mt-5 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-700 tracking-wider uppercase flex items-center space-x-1.5">
                    <UserCheck className="h-4 w-4 text-emerald-700" />
                    <span>{t('login.quickRoles')}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Password123!</span>
                </div>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('procurement.demo@gembid.local', 'Procurement Officer')}
                    className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 flex items-center justify-between text-xs transition cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-slate-900">Procurement Officer</span>
                      <span className="block text-[11px] text-slate-500">procurement.demo@gembid.local</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200 text-[10px] text-emerald-800 font-mono font-bold">
                      Full Officer Authority
                    </span>
                  </button>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('reviewer.demo@gembid.local', 'Compliance Reviewer')}
                      className="text-left px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition cursor-pointer"
                    >
                      <span className="font-bold text-slate-800 block text-[11px]">Reviewer</span>
                      <span className="text-[10px] text-slate-500 truncate block">reviewer.demo...</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('admin.demo@gembid.local', 'System Admin')}
                      className="text-left px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition cursor-pointer"
                    >
                      <span className="font-bold text-slate-800 block text-[11px]">System Admin</span>
                      <span className="text-[10px] text-slate-500 truncate block">admin.demo...</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('auditor.demo@gembid.local', 'Auditor')}
                      className="text-left px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition cursor-pointer"
                    >
                      <span className="font-bold text-slate-800 block text-[10px]">Auditor</span>
                      <span className="text-[9px] text-slate-500 truncate block">auditor.demo...</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('bidder.demo@gembid.local', 'Apex Pumps Vendor')}
                      className="text-left px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition cursor-pointer"
                    >
                      <span className="font-bold text-slate-800 block text-[10px]">Bidder 1 (Apex)</span>
                      <span className="text-[9px] text-slate-500 truncate block">bidder.demo...</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('bharat.valves@gembid.local', 'Bharat Valves Vendor')}
                      className="text-left px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition cursor-pointer"
                    >
                      <span className="font-bold text-slate-800 block text-[10px]">Bidder 2 (Bharat)</span>
                      <span className="text-[9px] text-slate-500 truncate block">bharat.valves...</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('crompton.flow@gembid.local', 'Crompton Flow Vendor')}
                      className="text-left px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition cursor-pointer"
                    >
                      <span className="font-bold text-slate-800 block text-[10px]">Bidder 3 (Crompton)</span>
                      <span className="text-[9px] text-slate-500 truncate block">crompton.flow...</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Government Footer Bar */}
      <div className="bg-white border-t border-slate-200 py-3 px-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Government e Marketplace (GeM) • National Public Procurement Portal</span>
          <span>SIH26100 AI Bid Compliance Verification Platform • GFR 2017</span>
        </div>
      </div>
    </div>
  );
};
