import React from 'react';
import { ShieldCheck, ExternalLink, HelpCircle, PhoneCall, Mail, Building2 } from 'lucide-react';
import { AshokaEmblem } from '../ui/AshokaEmblem';
import { formatGovDate } from '../../utils/date';

export const GovFooter: React.FC = () => {
  const lastUpdated = formatGovDate(new Date(), true);

  return (
    <footer className="w-full bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      {/* 1. Tricolor Micro-Accent */}
      <div className="h-0.5 w-full flex" aria-hidden="true">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-[#FFFFFF]" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          {/* Column 1: Ministry & Platform */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-start space-x-3 text-white font-bold text-sm">
              <AshokaEmblem size={44} variant="white" />
              <div>
                <div className="text-white font-bold text-sm leading-tight">GeM Bid Compliance Platform</div>
                <div className="text-[10px] text-amber-400 font-semibold tracking-wide mt-0.5">Government of India</div>
              </div>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Ministry of Petroleum & Natural Gas, Government of India.
              Automated deterministic and hybrid RAG verification under GFR 2017 & GeM GTC.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">National SIH Platform:</span>
              <span className="bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded font-mono text-[10px]">
                SIH26100
              </span>
            </div>
          </div>

          {/* Column 2: Governance & Portals */}
          <div className="space-y-2 text-[11px]">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Statutory Verification</h4>
            <ul className="space-y-1.5">
              <li>
                <a href="https://gem.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>Government e-Marketplace (GeM)</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a href="https://services.gst.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>GSTN National Tax Registry</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a href="https://mca.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>Ministry of Corporate Affairs (MCA21)</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a href="https://udyamregistration.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>Udyam MSME Verification</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Redressal & Legal */}
          <div className="space-y-2 text-[11px]">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Vigilance & Redressal</h4>
            <ul className="space-y-1.5">
              <li>
                <a href="https://pgportal.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>CPGRAMS Public Grievance Portal</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <span className="text-slate-400">GFR 2017 Rule 173 Transparency Standard</span>
              </li>
              <li>
                <span className="text-slate-400">Cryptographic Proof-of-Existence on EVM</span>
              </li>
              <li>
                <span className="text-slate-400">Digital Personal Data Protection (DPDP) Act Compliant</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Helpdesk & Support */}
          <div className="space-y-3 text-[11px]">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Helpdesk & Assistance</h4>
            <div className="space-y-1.5">
              <a href="tel:18004193436" className="flex items-center space-x-2 text-slate-300 hover:text-amber-400 transition-colors">
                <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold">Toll-Free: 1800-419-3436</span>
              </a>
              <div className="flex items-center space-x-2 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>compliance-helpdesk@gem.gov.in</span>
              </div>
              <div className="text-[10px] text-slate-500 pt-1">
                Operating Hours: Mon - Sat 09:00 - 18:00 IST
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Disclaimers & Last Updated */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] space-y-2 sm:space-y-0 text-slate-500">
          <div>
            © {new Date().getFullYear()} Government e-Marketplace (GeM) & Ministry of Petroleum & Natural Gas.
          </div>
          <div className="flex items-center space-x-4">
            <span>Last Updated: <strong className="text-slate-400 font-mono">{lastUpdated}</strong></span>
            <span>•</span>
            <span className="flex items-center space-x-1 text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              <span>Certified Secure Portal</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
