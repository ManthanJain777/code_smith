import React, { useState, useEffect } from 'react';
import { ShieldCheck, Globe, Bell, PhoneCall, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';
import { AshokaEmblem } from '../ui/AshokaEmblem';

interface GovHeaderProps {
  onToggleNotifications: () => void;
  unreadNotificationCount: number;
}

export const GovHeader: React.FC<GovHeaderProps> = ({
  onToggleNotifications,
  unreadNotificationCount
}) => {
  const { user, login } = useAuth();
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  const DEMO_PERSONAS = [
    { role: 'PROCUREMENT_OFFICER', name: 'Sh. Rajesh Sharma', email: 'procurement.demo@gembid.local', label: 'Procurement Officer (TIA)' },
    { role: 'COMPLIANCE_REVIEWER', name: 'Smt. Priya Verma', email: 'reviewer.demo@gembid.local', label: 'Compliance Reviewer (SME)' },
    { role: 'AUDITOR', name: 'CAG Audit Directorate', email: 'auditor.demo@gembid.local', label: 'Chief Vigilance Auditor' },
    { role: 'BIDDER_VENDOR', name: 'Apex Pumps & Motors', email: 'bidder.demo@gembid.local', label: 'Registered Bidder / OEM' },
    { role: 'SYSTEM_ADMIN', name: 'Dr. Amit Patel', email: 'admin.demo@gembid.local', label: 'System Admin (DevSecOps)' },
  ];

  const handleSwitchPersona = async (email: string) => {
    setIsSwitchingRole(true);
    await login(email, 'Password123!');
    setIsSwitchingRole(false);
    setIsRoleDropdownOpen(false);
  };

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

  return (
    <header className="w-full bg-white shadow-sm border-b border-slate-200 z-30 sticky top-0">
      {/* 1. Tricolor National Accent Strip */}
      <div className="h-1 w-full flex" aria-hidden="true">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-[#FFFFFF]" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      {/* 2. Official Ministry Sub-Header Strip */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1 px-4 sm:px-8 flex flex-wrap justify-between items-center border-b border-slate-800 font-medium">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>भारत सरकार | Government of India</span>
          <span className="text-slate-600 hidden md:inline">•</span>
          <span className="text-slate-300 font-semibold hidden md:inline">Ministry of Petroleum & Natural Gas</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-1 text-slate-400 text-[11px]">
            <span>{currentTime}</span>
          </div>
          <div className="flex items-center space-x-2 border-l border-slate-700 pl-3">
            <button
              onClick={() => setLang(l => (l === 'EN' ? 'HI' : 'EN'))}
              className="flex items-center space-x-1 hover:text-white transition-colors text-[11px] font-semibold bg-slate-800 px-2 py-0.5 rounded"
              title="Toggle Language"
            >
              <Globe className="w-3 h-3 text-amber-400" />
              <span>{lang === 'EN' ? 'English (EN)' : 'हिन्दी (HI)'}</span>
            </button>
            <a
              href="tel:18004193436"
              className="hidden sm:flex items-center space-x-1 text-slate-400 hover:text-amber-300 transition-colors text-[11px]"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Toll-Free 1800-419-3436</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. Main Brand & Identity Header */}
      <div className="px-4 sm:px-8 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Official Lion Capital Emblem */}
          <div className="relative flex-shrink-0 flex items-center justify-center">
            <AshokaEmblem size={44} variant="navy" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 flex items-center">
                GeM <span className="text-amber-600 ml-1">Compliance</span>
              </span>
              <span className="hidden sm:inline-block bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded border border-amber-200">
                GFR 2017 CERTIFIED
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight">
              AI-Powered Integrated Bid Compliance Verification Platform • SIH26100
            </p>
          </div>
        </div>

        {/* Right Action Icons: Notification Trigger & Role Badge */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleNotifications}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="Important Updates & Vigilance Alerts"
          >
            <Bell className="w-5 h-5 text-slate-700" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-white text-[10px] font-bold items-center justify-center">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              </span>
            )}
          </button>

          {user && (
            <div className="relative border-l border-slate-200 pl-3">
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(prev => !prev)}
                className="flex items-center space-x-2 text-left hover:bg-slate-50 p-1 rounded-lg transition border border-transparent hover:border-slate-200"
                title="Click to Switch Persona (Demo Mode)"
              >
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                    {user.fullName}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[10px] font-semibold text-amber-700 uppercase tracking-wider">
                    <span>{user.role?.replace('ROLE_', '')}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs shadow-inner">
                  {user.fullName?.charAt(0) || 'U'}
                </div>
              </button>

              {/* Persona Switcher Dropdown */}
              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                      Demo Persona Switcher
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                      Live RBAC
                    </span>
                  </div>
                  <div className="py-1 space-y-1">
                    {DEMO_PERSONAS.map(p => {
                      const isCurrent = user.role === p.role;
                      return (
                        <button
                          key={p.role}
                          onClick={() => handleSwitchPersona(p.email)}
                          disabled={isSwitchingRole}
                          className={`w-full text-left px-3 py-2 rounded-lg transition flex flex-col ${
                            isCurrent
                              ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{p.name}</span>
                            {isCurrent && <span className="text-[10px] text-amber-600 font-extrabold">ACTIVE</span>}
                          </div>
                          <span className="text-[10px] text-slate-500">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="pt-2 border-t border-slate-100 px-2 text-[10px] text-slate-400 text-center">
                    Instant zero-reload RBAC switching for jury evaluation
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
