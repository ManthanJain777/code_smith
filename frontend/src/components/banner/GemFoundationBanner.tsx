import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Award, Zap, Leaf, Users, Cpu } from 'lucide-react';

export interface CelebrationBannerData {
  id: string;
  badge: string;
  badgeColor: string;
  tagline: string;
  hindiHeadlineLine1: string;
  hindiHeadlineLine2: string;
  subtext: string;
  imageSrc: string;
  logoPrefix: string;
  logoHighlight: string;
  logoSuperscript?: string;
  hindiSub: string;
  highlight1: string;
  highlight2: string;
  primaryCta: { label: string; to: string };
  secondaryCta: { label: string; to: string };
  waveColor1: string;
  waveColor2: string;
  centerSymbol: '10' | 'MII_LION' | 'WOMANIYA_LOTUS' | 'AI_SHIELD' | 'GREEN_LEAF';
}

export const CELEBRATION_BANNERS: CelebrationBannerData[] = [
  {
    id: 'gem-10-years',
    badge: 'GeM Foundation Banner',
    badgeColor: 'bg-slate-900/90 text-white border-slate-700/60',
    tagline: '10 Glorious Years (2016–2026)',
    hindiHeadlineLine1: 'भरोसे और बदलाव',
    hindiHeadlineLine2: 'का दशक',
    subtext: 'Empowering 1.5M+ MSMEs and transforming public procurement through complete transparency and trust.',
    imageSrc: '/assets/gem_montage.jpg',
    logoPrefix: 'Ge',
    logoHighlight: 'M',
    logoSuperscript: '10',
    hindiSub: 'असीम संभावनाओं का दशक',
    highlight1: 'उत्सव उस दशक का जिसने अवसरों को नई उड़ान दी',
    highlight2: 'आइए, इस परिवर्तनकारी यात्रा का हिस्सा बनें',
    primaryCta: { label: 'Explore Live Bids', to: '/tenders' },
    secondaryCta: { label: 'Sign In as Seller / Buyer', to: '/login' },
    waveColor1: '#EA580C',
    waveColor2: '#16A34A',
    centerSymbol: '10',
  },
  {
    id: 'make-in-india',
    badge: 'Make in India • Class-I Preference',
    badgeColor: 'bg-amber-950/90 text-amber-300 border-amber-600/60',
    tagline: 'Aatmanirbhar Bharat Initiative',
    hindiHeadlineLine1: 'आत्मनिर्भर भारत का',
    hindiHeadlineLine2: 'सशक्त मंच',
    subtext: 'Prioritizing domestic manufacturing across aerospace, defence, heavy engineering, and semiconductors under PPP-MII Order.',
    imageSrc: '/assets/gem_make_in_india.jpg',
    logoPrefix: 'Make In ',
    logoHighlight: 'India',
    logoSuperscript: 'MII',
    hindiSub: 'स्वदेशी निर्माण, वैश्विक पहचान',
    highlight1: '75%+ स्थानीय सामग्री (Local Content) को सर्वोच्च प्राथमिकता',
    highlight2: '₹8.5 लाख करोड़+ मूल्य की स्वदेशी सामग्री की खरीद',
    primaryCta: { label: 'View MII Tenders', to: '/tenders' },
    secondaryCta: { label: 'MII Class-I Verification', to: '/sellers' },
    waveColor1: '#C2410C',
    waveColor2: '#CA8A04',
    centerSymbol: 'MII_LION',
  },
  {
    id: 'womaniya-msme',
    badge: 'Womaniya on GeM • MSME Growth',
    badgeColor: 'bg-rose-950/90 text-rose-200 border-rose-600/60',
    tagline: '55%+ Procurement from MSMEs',
    hindiHeadlineLine1: 'नारी शक्ति और लघु उद्योग',
    hindiHeadlineLine2: 'का अभूतपूर्व उत्थान',
    subtext: 'Direct market linkage for women entrepreneurs, tribal SHGs, startup innovators, and artisan clusters nationwide.',
    imageSrc: '/assets/gem_womaniya.jpg',
    logoPrefix: 'Womaniya ',
    logoHighlight: 'GeM',
    logoSuperscript: 'SHG',
    hindiSub: 'स्वावलंबन से राष्ट्रीय समृद्धि',
    highlight1: '1.8 लाख+ पंजीकृत महिला उद्यमी और स्व-सहायता समूह',
    highlight2: 'बिना किसी बिचौलिए के सीधे सरकार को आपूर्ति की सुविधा',
    primaryCta: { label: 'Explore MSME Bids', to: '/tenders' },
    secondaryCta: { label: 'DigiLocker Udyam Sync', to: '/digilocker-simulation' },
    waveColor1: '#E11D48',
    waveColor2: '#0D9488',
    centerSymbol: 'WOMANIYA_LOTUS',
  },
  {
    id: 'ai-blockchain-sovereignty',
    badge: 'AI Verification & EVM Blockchain',
    badgeColor: 'bg-blue-950/90 text-blue-200 border-blue-600/60',
    tagline: 'GFR Rule 173 Certified AI',
    hindiHeadlineLine1: 'पारदर्शिता और तकनीक की',
    hindiHeadlineLine2: 'सॉवरेन नई सुबह',
    subtext: 'Zero-hallucination deterministic clause matching, 13-portal automated cross-vetting, and immutable Hardhat EVM audit proofs.',
    imageSrc: '/assets/gem_ai.jpg',
    logoPrefix: 'GeM AI ',
    logoHighlight: '2026',
    logoSuperscript: 'EVM',
    hindiSub: 'संप्रभु डिजिटल न्याय और शुद्धता',
    highlight1: '13 वैधानिक सरकारी पोर्टलों का स्वतः बैक-चेक सत्यापन',
    highlight2: 'कमेटी के 100% निर्णय ब्लॉकचेन पर अपरिवर्तनीय सुरक्षित',
    primaryCta: { label: 'Inspect AI Matrix', to: '/compliance' },
    secondaryCta: { label: 'Audit Log Explorer', to: '/audit' },
    waveColor1: '#2563EB',
    waveColor2: '#9333EA',
    centerSymbol: 'AI_SHIELD',
  },
  {
    id: 'green-procurement',
    badge: 'Mission LiFE • Green Procurement',
    badgeColor: 'bg-emerald-950/90 text-emerald-200 border-emerald-600/60',
    tagline: 'Net-Zero 2070 Pathway',
    hindiHeadlineLine1: 'हरित भारत और सतत',
    hindiHeadlineLine2: 'विकास का भविष्य',
    subtext: 'Promoting carbon-neutral procurement across solar power mega-parks, electric vehicle transit fleets, and energy-efficient systems.',
    imageSrc: '/assets/gem_green.jpg',
    logoPrefix: 'Green ',
    logoHighlight: 'GeM',
    logoSuperscript: 'LiFE',
    hindiSub: 'पर्यावरण-अनुकूल खरीद, सुरक्षित भविष्य',
    highlight1: '100% नवीकरणीय ऊर्जा और ऊर्जा-दक्ष उपकरणों को वरीयता',
    highlight2: 'शून्य कार्बन उत्सर्जन की दिशा में सरकारी खरीद का योगदान',
    primaryCta: { label: 'Explore Green Tenders', to: '/tenders' },
    secondaryCta: { label: 'View Sustainability Index', to: '/analytics' },
    waveColor1: '#16A34A',
    waveColor2: '#0284C7',
    centerSymbol: 'GREEN_LEAF',
  }
];

interface GemFoundationBannerProps {
  activeDotIndex?: number;
  totalDots?: number;
  onSelectDot?: (index: number) => void;
}

export const GemFoundationBanner: React.FC<GemFoundationBannerProps> = ({
  activeDotIndex = 0,
  totalDots = CELEBRATION_BANNERS.length,
  onSelectDot,
}) => {
  const currentBanner = CELEBRATION_BANNERS[activeDotIndex % CELEBRATION_BANNERS.length] || CELEBRATION_BANNERS[0];

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#edf2f7] via-[#f8fafc] to-[#eef2f6] border-y border-slate-200 select-none transition-colors duration-500">
      {/* Background soft perspective radial glow */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.95) 0%, rgba(241,245,249,0.5) 60%, rgba(226,232,240,0.85) 100%)',
        }}
      />
      
      {/* Perspective floor lines */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-25" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1200 400"
      >
        <defs>
          <linearGradient id="gridGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="360" x2="1200" y2="360" stroke="url(#gridGrad)" strokeWidth="1" />
        <line x1="0" y1="380" x2="1200" y2="380" stroke="url(#gridGrad)" strokeWidth="1.5" />
        <line x1="200" y1="400" x2="450" y2="300" stroke="url(#gridGrad)" strokeWidth="0.8" />
        <line x1="1000" y1="400" x2="750" y2="300" stroke="url(#gridGrad)" strokeWidth="0.8" />
      </svg>

      {/* Main Banner Grid */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-8 lg:py-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 min-h-[360px] lg:min-h-[400px]">
        
        {/* =================================================================== */}
        {/* LEFT SECTION: HINDI HEADLINE + INITIATIVE BADGE                     */}
        {/* =================================================================== */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-10 animate-in fade-in duration-300">
          <div className="space-y-1 sm:space-y-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1B365D] leading-tight font-sans drop-shadow-xs">
              {currentBanner.hindiHeadlineLine1}
            </h2>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1B365D] leading-tight font-sans drop-shadow-xs">
              {currentBanner.hindiHeadlineLine2}
            </h2>
          </div>

          <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-sm text-[11px] font-semibold tracking-wide shadow-md border ${currentBanner.badgeColor}`}>
              {currentBanner.badge}
            </span>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-300 shadow-xs">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              {currentBanner.tagline}
            </span>
          </div>

          <p className="mt-3 text-xs sm:text-sm text-slate-600 font-medium max-w-sm">
            {currentBanner.subtext}
          </p>
        </div>

        {/* =================================================================== */}
        {/* CENTER SECTION: 3D GOLD PEDESTAL + SYMBOL WITH PHOTOGRAPHIC MONTAGE */}
        {/* =================================================================== */}
        <div className="relative flex-shrink-0 flex flex-col items-center justify-center my-2 lg:my-0 z-20">
          
          <div className="relative w-[280px] sm:w-[320px] lg:w-[360px] h-[220px] sm:h-[250px] lg:h-[280px] flex items-center justify-center">
            
            {/* Dynamic 3D Curved Bezier Waves in Vibrant Palette */}
            <svg 
              className="absolute -inset-10 w-[360px] sm:w-[400px] lg:w-[440px] h-[300px] sm:h-[330px] lg:h-[360px] pointer-events-none z-15 transition-all duration-700" 
              viewBox="0 0 440 360"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id={`dynWave1-${currentBanner.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={currentBanner.waveColor1} stopOpacity="0.85" />
                  <stop offset="60%" stopColor={currentBanner.waveColor1} stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#FDBA74" stopOpacity="0.3" />
                </linearGradient>

                <linearGradient id={`dynWave2-${currentBanner.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={currentBanner.waveColor2} stopOpacity="0.85" />
                  <stop offset="50%" stopColor={currentBanner.waveColor2} stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#86EFAC" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Lower sweeping wave */}
              <path 
                d="M10 240 C 90 280, 160 210, 220 230 C 280 250, 360 300, 430 260 C 400 275, 300 245, 230 220 C 170 200, 90 260, 20 230 Z" 
                fill={`url(#dynWave1-${currentBanner.id})`} 
                opacity="0.9"
              />
              <path 
                d="M0 250 C 80 290, 150 220, 230 240 C 310 260, 370 285, 440 270" 
                stroke={currentBanner.waveColor1} 
                strokeWidth="2.5" 
                opacity="0.8"
              />

              {/* Upper looping wave */}
              <path 
                d="M140 130 C 200 60, 280 40, 350 70 C 410 95, 420 150, 440 180 C 420 160, 380 90, 330 75 C 270 55, 200 80, 160 140 Z" 
                fill={`url(#dynWave2-${currentBanner.id})`} 
                opacity="0.85"
              />
              <path 
                d="M160 125 C 220 50, 300 45, 370 75 C 415 95, 430 140, 440 170" 
                stroke={currentBanner.waveColor2} 
                strokeWidth="2" 
                opacity="0.75"
              />
            </svg>

            {/* SVG Composite for the 3D Gold Dais + Photographic Motif */}
            <svg 
              className="relative w-full h-full z-10 drop-shadow-2xl" 
              viewBox="0 0 360 280"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="goldBevel" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FEF08A" />
                  <stop offset="25%" stopColor="#F59E0B" />
                  <stop offset="50%" stopColor="#D97706" />
                  <stop offset="75%" stopColor="#FEF08A" />
                  <stop offset="100%" stopColor="#78350F" />
                </linearGradient>

                <linearGradient id="pedestalGold" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FEF08A" />
                  <stop offset="20%" stopColor="#F59E0B" />
                  <stop offset="60%" stopColor="#B45309" />
                  <stop offset="100%" stopColor="#451A03" />
                </linearGradient>

                {/* Clip path for Digit '1' or Left Panel */}
                <clipPath id="digitOneClip">
                  <path d="M95 45 L135 45 L135 185 L95 185 L95 80 L75 95 L65 75 Z" />
                </clipPath>

                {/* Clip path for Digit '0' or Right Panel */}
                <clipPath id="digitZeroClip">
                  <path 
                    fillRule="evenodd"
                    d="M225 35 C 265 35, 290 65, 290 115 C 290 165, 265 195, 225 195 C 185 195, 160 165, 160 115 C 160 65, 185 35, 225 35 Z M225 65 C 205 65, 195 85, 195 115 C 195 145, 205 165, 225 165 C 245 165, 255 145, 255 115 C 255 85, 245 65, 225 65 Z"
                  />
                </clipPath>

                {/* Large Panoramic Circle Clip for other banners */}
                <clipPath id="panoramicCenterClip">
                  <circle cx="180" cy="115" r="76" />
                </clipPath>
              </defs>

              {/* 1. Golden Dais / Tiered Pedestal Base */}
              <ellipse cx="180" cy="230" rx="140" ry="24" fill="url(#pedestalGold)" filter="drop-shadow(0 15px 12px rgba(0,0,0,0.35))" />
              <ellipse cx="180" cy="226" rx="136" ry="20" fill="#FDE047" opacity="0.6" />
              
              <ellipse cx="180" cy="218" rx="122" ry="19" fill="url(#pedestalGold)" />
              <ellipse cx="180" cy="215" rx="118" ry="16" fill="#FEF08A" opacity="0.7" />

              <ellipse cx="180" cy="206" rx="104" ry="14" fill="url(#pedestalGold)" />
              <ellipse cx="180" cy="204" rx="100" ry="12" fill="#FFFBEB" opacity="0.85" />

              {/* 2. Motif / Symbol Rendering */}
              {currentBanner.centerSymbol === '10' ? (
                <>
                  {/* Bevel for 1 */}
                  <path d="M92 42 L138 42 L138 188 L92 188 L92 78 L72 94 L62 72 Z" fill="#78350F" opacity="0.6" />
                  <path d="M94 44 L136 44 L136 186 L94 186 L94 79 L74 95 L64 74 Z" fill="url(#goldBevel)" stroke="#B45309" strokeWidth="2.5" />

                  {/* Bevel for 0 */}
                  <path 
                    fillRule="evenodd"
                    d="M225 32 C 268 32, 293 63, 293 115 C 293 167, 268 198, 225 198 C 182 198, 157 167, 157 115 C 157 63, 182 32, 225 32 Z M225 67 C 207 67, 197 86, 197 115 C 197 144, 207 163, 225 163 C 243 163, 253 144, 253 115 C 253 86, 243 67, 225 67 Z"
                    fill="url(#goldBevel)"
                    stroke="#B45309"
                    strokeWidth="2.5"
                  />

                  {/* Clipped photographic image inside 1 */}
                  <g clipPath="url(#digitOneClip)">
                    <image 
                      href={currentBanner.imageSrc} 
                      x="20" 
                      y="20" 
                      width="280" 
                      height="200" 
                      preserveAspectRatio="xMidYMid slice" 
                    />
                    <rect x="60" y="40" width="80" height="150" fill="url(#goldBevel)" opacity="0.12" />
                  </g>

                  {/* Clipped photographic image inside 0 */}
                  <g clipPath="url(#digitZeroClip)">
                    <image 
                      href={currentBanner.imageSrc} 
                      x="140" 
                      y="20" 
                      width="240" 
                      height="200" 
                      preserveAspectRatio="xMidYMid slice" 
                    />
                    <rect x="155" y="30" width="140" height="170" fill="url(#goldBevel)" opacity="0.12" />
                  </g>

                  {/* Gold outlines */}
                  <path d="M95 45 L135 45 L135 185 L95 185 L95 80 L75 95 L65 75 Z" fill="none" stroke="#FEF08A" strokeWidth="1.5" opacity="0.9" />
                  <path 
                    fillRule="evenodd"
                    d="M225 35 C 265 35, 290 65, 290 115 C 290 165, 265 195, 225 195 C 185 195, 160 165, 160 115 C 160 65, 185 35, 225 35 Z M225 65 C 205 65, 195 85, 195 115 C 195 145, 205 165, 225 165 C 245 165, 255 145, 255 115 C 255 85, 245 65, 225 65 Z"
                    fill="none" 
                    stroke="#FEF08A" 
                    strokeWidth="1.5" 
                    opacity="0.9"
                  />
                </>
              ) : (
                <>
                  {/* Ornate Gold Outer Ring */}
                  <circle cx="180" cy="115" r="82" fill="url(#goldBevel)" stroke="#78350F" strokeWidth="3" filter="drop-shadow(0 10px 10px rgba(0,0,0,0.3))" />
                  <circle cx="180" cy="115" r="77" fill="#FEF08A" opacity="0.5" />

                  {/* Clipped Photographic Montage */}
                  <g clipPath="url(#panoramicCenterClip)">
                    <image 
                      href={currentBanner.imageSrc} 
                      x="90" 
                      y="25" 
                      width="180" 
                      height="180" 
                      preserveAspectRatio="xMidYMid slice" 
                    />
                    <circle cx="180" cy="115" r="76" fill="url(#goldBevel)" opacity="0.1" />
                  </g>

                  {/* Inner Golden Rim & Embellishments */}
                  <circle cx="180" cy="115" r="76" fill="none" stroke="#FEF08A" strokeWidth="2.5" />
                  <circle cx="180" cy="115" r="72" fill="none" stroke="#F59E0B" strokeWidth="1" strokeDasharray="4 2" />
                </>
              )}
            </svg>
          </div>

          {/* =============================================================== */}
          {/* DOTS PAGINATION: Interactive dot indicators                    */}
          {/* =============================================================== */}
          <div className="flex items-center gap-2 mt-2 z-30">
            {CELEBRATION_BANNERS.map((_, idx) => {
              const isActive = idx === (activeDotIndex % CELEBRATION_BANNERS.length);
              return (
                <button
                  key={idx}
                  onClick={() => onSelectDot && onSelectDot(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isActive
                      ? 'w-3.5 h-3.5 bg-[#EA580C] shadow-sm ring-2 ring-[#EA580C]/40 scale-110'
                      : 'w-2 h-2 bg-slate-300 hover:bg-slate-400 border border-slate-400/50'
                  }`}
                  aria-label={`Switch to celebration banner ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT SECTION: LOGO LOCKUP, HINDI SUBTITLE, ORNAMENT & ACTION CTAS */}
        {/* =================================================================== */}
        <div className="flex-1 flex flex-col items-center lg:items-end text-center lg:text-right z-10 animate-in fade-in duration-300">
          
          {/* Brand Lockup with Star Sparkles */}
          <div className="relative flex items-baseline justify-center lg:justify-end">
            <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1B365D] tracking-tighter">
              {currentBanner.logoPrefix}
            </span>
            <span className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-[#EA580C] to-[#F97316] bg-clip-text text-transparent tracking-tighter">
              {currentBanner.logoHighlight}
            </span>
            {currentBanner.logoSuperscript && (
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B365D] italic ml-1 align-super drop-shadow-xs">
                {currentBanner.logoSuperscript}
              </span>
            )}

            {/* Radiant golden sparkle burst */}
            <div className="absolute -top-2 -right-8 flex items-center text-amber-500 animate-pulse">
              <Sparkles className="w-6 h-6 text-amber-500 fill-amber-400" />
            </div>
          </div>

          {/* Hindi Subtitle */}
          <h3 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#1B365D] tracking-tight font-sans">
            {currentBanner.hindiSub}
          </h3>

          {/* Golden Ornamental Divider with Triple Diamond */}
          <div className="w-full max-w-xs sm:max-w-sm my-3 flex items-center justify-center lg:justify-end gap-2">
            <div className="flex-1 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-amber-500" />
            <span className="text-amber-600 text-xs font-bold">◆ ◆ ◆</span>
            <div className="w-6 h-[1.5px] bg-amber-500 hidden lg:block" />
          </div>

          {/* Celebration Call to Action Copy */}
          <div className="space-y-1">
            <p className="text-sm sm:text-base font-bold text-slate-700">
              {currentBanner.highlight1}
            </p>
            <p className="text-base sm:text-lg font-black text-[#1B365D]">
              {currentBanner.highlight2}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-end gap-3">
            <Link
              to={currentBanner.primaryCta.to}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1B365D] hover:bg-[#0f2540] text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
            >
              <span>{currentBanner.primaryCta.label}</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </Link>

            <Link
              to={currentBanner.secondaryCta.to}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-[#1B365D] font-bold text-xs sm:text-sm border border-slate-300 transition-all shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{currentBanner.secondaryCta.label}</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GemFoundationBanner;
