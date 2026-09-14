import React, { useState } from 'react';
import { useAuth } from '../../context/AuthProvider';
import {
  User,
  Mail,
  Shield,
  Key,
  Sliders,
  Bell,
  Globe,
  Sun,
  Moon,
  Lock,
  Check,
  X,
  LogOut,
  Building,
  Save,
  CheckCircle2,
  FileCheck,
  Smartphone
} from 'lucide-react';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'display' | 'security'>('profile');

  // Form / Preference states
  const [fullName, setFullName] = useState(user?.fullName || 'Sh. Rajesh Sharma');
  const [email, setEmail] = useState(user?.email || 'officer.sharma@gem.gov.in');
  const [department, setDepartment] = useState('Ministry of Petroleum & Natural Gas');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'contrast'>('light');
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  
  // Security & Notification Toggles
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [overrideAlerts, setOverrideAlerts] = useState(true);
  const [tenderUpdates, setTenderUpdates] = useState(true);
  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState('30');
  
  // Feedback toast state
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Apply font size adjustment globally
    const htmlEl = document.documentElement;
    if (fontSize === 'sm') htmlEl.style.fontSize = '14px';
    else if (fontSize === 'lg') htmlEl.style.fontSize = '17px';
    else htmlEl.style.fontSize = '16px';

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const roleTitle = user?.role?.replace('ROLE_', '').replace('_', ' ') || 'PROCUREMENT OFFICER';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-sm shadow-inner">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                User Profile & Settings
              </h3>
              <p className="text-slate-400 text-xs flex items-center gap-1.5 mt-0.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>GeM Compliance Platform • {roleTitle}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-slate-100 px-6 pt-3 border-b border-slate-200 flex space-x-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-amber-600 text-amber-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Identity</span>
          </button>

          <button
            onClick={() => setActiveTab('display')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'display'
                ? 'border-amber-600 text-amber-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Display & Accessibility</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'security'
                ? 'border-amber-600 text-amber-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security & Alerts</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          
          {/* TAB 1: Profile & Identity */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Persona Banner Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-amber-400 font-black flex items-center justify-center text-lg shadow-md">
                    {fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{fullName}</h4>
                    <span className="inline-block bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase border border-amber-300 mt-0.5">
                      {user?.role || 'PROCUREMENT_OFFICER'}
                    </span>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <div className="font-semibold text-slate-700">User ID</div>
                  <code className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono text-slate-800">
                    {user?.userId || 'USR-DEMO-001'}
                  </code>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Official Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Government Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ministry / Department Requisitioning Unit
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Organization / Entity ID
                  </label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      disabled
                      value={user?.organizationId || 'ORG-DEMO'}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 text-slate-500 border border-slate-200 rounded-lg font-mono cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Digital Signature Certificate (DSC) Status */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <FileCheck className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-emerald-900">
                      Class-3 Government Digital Signature Certificate (DSC)
                    </h5>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Active & Cryptographically Validated for e-Signing Compliance Memorandums
                    </p>
                    <div className="text-[10px] font-mono text-emerald-800 mt-1">
                      Serial No: <span className="font-bold">IN-8942-DSC-2026-X9</span> • Exp: 31-DEC-2027
                    </div>
                  </div>
                </div>
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  VERIFIED
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Display & Accessibility */}
          {activeTab === 'display' && (
            <div className="space-y-6">
              {/* Font Size Selector */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Platform Typography & Font Scale
                </label>
                <p className="text-[11px] text-slate-500">
                  Adjust UI text scale for optimal readability across audit matrices.
                </p>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFontSize('sm')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border flex flex-col items-center gap-1 transition ${
                      fontSize === 'sm'
                        ? 'bg-amber-50 border-amber-600 text-amber-900 ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs">Compact (14px)</span>
                    <span className="text-[10px] text-slate-400 font-normal">A-</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFontSize('md')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border flex flex-col items-center gap-1 transition ${
                      fontSize === 'md'
                        ? 'bg-amber-50 border-amber-600 text-amber-900 ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs">Standard (16px)</span>
                    <span className="text-[10px] text-slate-400 font-normal">A (Default)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFontSize('lg')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border flex flex-col items-center gap-1 transition ${
                      fontSize === 'lg'
                        ? 'bg-amber-50 border-amber-600 text-amber-900 ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs">Large (17px)</span>
                    <span className="text-[10px] text-slate-400 font-normal">A+</span>
                  </button>
                </div>
              </div>

              {/* Theme Preference */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Theme Preset Mode
                </label>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setThemeMode('light')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 transition ${
                      themeMode === 'light'
                        ? 'bg-amber-50 border-amber-600 text-amber-900 ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Default Light</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setThemeMode('dark')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 transition ${
                      themeMode === 'dark'
                        ? 'bg-amber-50 border-amber-600 text-amber-900 ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-slate-600" />
                    <span>Dark Vision</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setThemeMode('contrast')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 transition ${
                      themeMode === 'contrast'
                        ? 'bg-amber-50 border-amber-600 text-amber-900 ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <span>High Contrast</span>
                  </button>
                </div>
              </div>

              {/* Language Selection */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-600" />
                    <span>Official Portal Interface Language</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Switch between English and Hindi for statutory UI text.
                  </div>
                </div>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value as any)}
                  className="text-xs font-bold bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none"
                >
                  <option value="EN">English (EN)</option>
                  <option value="HI">हिन्दी (HI)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 3: Security & Alerts */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              {/* Notification Toggles */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Bell className="w-4 h-4 text-amber-600" />
                  <span>Notification & Alert Subscriptions</span>
                </h5>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Email Digest Notifications</div>
                    <div className="text-[11px] text-slate-500">Receive daily compliance summaries via government email</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={e => setEmailNotifications(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Human Override Alerts</div>
                    <div className="text-[11px] text-slate-500">Immediate notifications for technical contradiction overrides</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={overrideAlerts}
                    onChange={e => setOverrideAlerts(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Tender Lifecycle Updates</div>
                    <div className="text-[11px] text-slate-500">Real-time alerts for bid opening and financial evaluations</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={tenderUpdates}
                    onChange={e => setTenderUpdates(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Session Security */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>Session Security & Inactivity Timeout</span>
                </h5>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Auto-Logout Idle Duration</div>
                    <div className="text-[11px] text-slate-500">Automatically end active session after periods of inactivity</div>
                  </div>
                  <select
                    value={autoLogoutMinutes}
                    onChange={e => setAutoLogoutMinutes(e.target.value)}
                    className="text-xs font-bold bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes (Recommended)</option>
                    <option value="60">60 Minutes</option>
                  </select>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="font-semibold text-slate-700">Two-Factor Authentication (2FA)</span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-300">
                    ENFORCED (NIC OTP)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Success Notification */}
          {saveSuccess && (
            <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between animate-in fade-in duration-150">
              <div className="flex items-center space-x-2 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile & Settings successfully saved!</span>
              </div>
            </div>
          )}
        </form>

        {/* Modal Action Footer */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Log Out</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
