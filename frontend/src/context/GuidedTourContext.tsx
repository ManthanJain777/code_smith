import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { apiService } from '../services/api';

export interface TourStep {
  id: number;
  title: string;
  route: string;
  role: 'PROCUREMENT_OFFICER' | 'BIDDER_VENDOR' | 'COMPLIANCE_REVIEWER' | 'AUDITOR' | 'SYSTEM_ADMIN';
  roleName: string;
  email: string;
  description: string;
  gfrRule: string;
  targetSelector: string;
}

export const FRESH_SOLAR_TENDER = {
  id: 'TND-SOLAR-99088',
  organizationId: 'ORG-GEM-01',
  tenderNumber: 'GEM/2026/SOLAR/99088',
  title: 'Supply & Commissioning of High-Capacity Solar Microgrid Systems',
  description: 'Procurement of high-capacity solar inverter systems, microgrid battery storage, and MPPT charge controllers for regional renewable energy expansion. Minimum inverter efficiency 98%, ISO 14001 certification required.',
  issuingAuthority: 'Ministry of New & Renewable Energy',
  category: 'Clean Energy & Electrical',
  estimatedValue: 65000000.00,
  status: 'OPEN',
  createdBy: 'USR-PROC-01',
  createdAt: new Date().toISOString(),
  requirements: [
    { id: 'REQ-SOL-001', tenderId: 'TND-SOLAR-99088', reqCode: 'REQ-SOL-001', category: 'Financial', rawText: 'Bidder must have minimum ₹100 crore annual turnover for previous 3 financial years.', reqType: 'NUMERIC_THRESHOLD', operator: '>=', threshold: 100, unit: 'Cr', isMandatory: true, sourcePage: 2 },
    { id: 'REQ-SOL-002', tenderId: 'TND-SOLAR-99088', reqCode: 'REQ-SOL-002', category: 'Technical', rawText: 'Solar Inverter efficiency shall not be less than 98%.', reqType: 'NUMERIC_THRESHOLD', operator: '>=', threshold: 98, unit: '%', isMandatory: true, sourcePage: 3 },
    { id: 'REQ-SOL-003', tenderId: 'TND-SOLAR-99088', reqCode: 'REQ-SOL-003', category: 'Certification', rawText: 'Valid ISO 14001 Environmental Management System Certificate mandatory.', reqType: 'DOCUMENT_PRESENCE', operator: '==', isMandatory: true, sourcePage: 4 },
    { id: 'REQ-SOL-004', tenderId: 'TND-SOLAR-99088', reqCode: 'REQ-SOL-004', category: 'Eligibility', rawText: 'Valid GST Registration Certificate & PAN Card must be submitted.', reqType: 'DOCUMENT_PRESENCE', operator: '==', isMandatory: true, sourcePage: 5 }
  ]
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: '1. Real Officer Login & Dashboard Metrics',
    route: '/dashboard',
    role: 'PROCUREMENT_OFFICER',
    roleName: 'Sh. Rajesh Sharma',
    email: 'procurement.demo@gembid.local',
    description: 'Logging in as Procurement Officer. Inspect active tender lifecycles, GFR 2017 speed metrics, and 48-hour evaluation turnaround acceleration.',
    gfrRule: 'GFR 2017 Clause 144 & Turnaround Acceleration',
    targetSelector: '[data-tour="kpi-metrics"]'
  },
  {
    id: 2,
    title: '2. Create FRESH Tender GEM/2026/SOLAR/99088',
    route: '/tenders',
    role: 'PROCUREMENT_OFFICER',
    roleName: 'Sh. Rajesh Sharma',
    email: 'procurement.demo@gembid.local',
    description: 'Publishing brand new fresh tender GEM/2026/SOLAR/99088 ("Supply of High-Capacity Solar Microgrid Systems", ₹6.50 Cr budget). Notice specifies ₹100 Cr Turnover & 98% Solar Efficiency.',
    gfrRule: 'GFR 2017 Rule 170 (EMD Exemption) & Rule 173 (NIT)',
    targetSelector: '[data-tour="tenders-board"]'
  },
  {
    id: 3,
    title: '3. Real Vendor Bidding on Fresh Solar Tender',
    route: '/tenders',
    role: 'BIDDER_VENDOR',
    roleName: 'Apex Pumps & Motors Pvt Ltd',
    email: 'bidder.demo@gembid.local',
    description: 'Switching to Vendor portal. Apex Pumps searches GEM/2026/SOLAR/99088, clicks Participate, completes 4-step BoQ & technical dossier, and seals bid with Class-3 DSC.',
    gfrRule: 'GFR 2017 Rule 173(i) — Sealed Electronic Bidding',
    targetSelector: '[data-tour="bid-wizard"]'
  },
  {
    id: 4,
    title: '4. Autonomous AI Pipeline & 5-Stage Reasoning Matrix',
    route: '/compliance?tenderId=TND-SOLAR-99088',
    role: 'PROCUREMENT_OFFICER',
    roleName: 'Sh. Rajesh Sharma',
    email: 'procurement.demo@gembid.local',
    description: 'Executing AI compliance pipeline for GEM/2026/SOLAR/99088. Inspecting the 5-Stage Reasoning Chain (Requirement → Dossier Snippet → Rule Engine → Grounding Confidence → Final Determination).',
    gfrRule: 'Zero-Hallucination RAG Vector Match',
    targetSelector: '[data-tour="reasoning-chain"]'
  },
  {
    id: 5,
    title: '5. Statutory Human Officer Override on Fresh Tender',
    route: '/compliance?tenderId=TND-SOLAR-99088',
    role: 'PROCUREMENT_OFFICER',
    roleName: 'Sh. Rajesh Sharma',
    email: 'procurement.demo@gembid.local',
    description: 'Statutory human-in-the-loop oversight under GFR Clause 144. Procurement Officer inputs mandatory written justification (>=15 chars) for REQ-SOL-002 and commits binding override to EVM blockchain.',
    gfrRule: 'GFR 2017 Clause 144 — Officer Audit Trail',
    targetSelector: '[data-tour="officer-override-card"]'
  },
  {
    id: 6,
    title: '6. Multi-Bidder L1 Comparison & Winner Determination',
    route: '/compare?tenderId=TND-SOLAR-99088',
    role: 'PROCUREMENT_OFFICER',
    roleName: 'Sh. Rajesh Sharma',
    email: 'procurement.demo@gembid.local',
    description: 'Opening side-by-side technical & commercial comparison for GEM/2026/SOLAR/99088. System ranks L1 winner (Apex Pumps — 100% Pass, ₹6.15 Cr) vs GlobalFlow (50% Fail, ₹6.48 Cr).',
    gfrRule: 'GFR 2017 Rule 173(x) — L1 Commercial Award',
    targetSelector: '[data-tour="multi-compare"]'
  },
  {
    id: 7,
    title: '7. Search Awarded Tender & Generate Official GeM Contract Order',
    route: '/tenders',
    role: 'PROCUREMENT_OFFICER',
    roleName: 'Sh. Rajesh Sharma',
    email: 'procurement.demo@gembid.local',
    description: 'Searching for fresh awarded tender GEM/2026/SOLAR/99088, opening public Standings & On-Chain Proof, and generating the official GeM Contract Award & Sanction Order.',
    gfrRule: 'GFR 2017 Rule 173(x) & EVM Sanction Order Proof',
    targetSelector: '[data-tour="generate-contract-order-btn"]'
  }
];

export interface CursorPosition {
  x: number;
  y: number;
  isClicking: boolean;
  label?: string;
}

interface GuidedTourContextType {
  isActive: boolean;
  currentStepIndex: number;
  currentStep: TourStep;
  isAutoPlaying: boolean;
  cursorPos: CursorPosition;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  toggleAutoPlay: () => void;
  exitTour: () => void;
  goToStep: (index: number) => void;
}

const GuidedTourContext = createContext<GuidedTourContextType | undefined>(undefined);

export const GuidedTourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPerformingAuth, setIsPerformingAuth] = useState(false);

  const [cursorPos, setCursorPos] = useState<CursorPosition>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
    isClicking: false
  });

  const { user, login, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Helper: Wait for element in DOM
  const waitForElement = (selector: string, maxWaitMs = 3000): Promise<HTMLElement | null> => {
    return new Promise(resolve => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const el = document.querySelector(selector) as HTMLElement | null;
        if (el) {
          clearInterval(interval);
          resolve(el);
        } else if (Date.now() - startTime >= maxWaitMs) {
          clearInterval(interval);
          resolve(null);
        }
      }, 100);
    });
  };

  // Helper: Automatically scroll element into viewport center if hidden or off-screen
  const ensureElementInView = async (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const isOutAbove = rect.top < 90;
    const isOutBelow = rect.bottom > (window.innerHeight - 90);
    const isOutLeft = rect.left < 0;
    const isOutRight = rect.right > window.innerWidth;

    if (isOutAbove || isOutBelow || isOutLeft || isOutRight) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      await new Promise(r => setTimeout(r, 450));
    }
  };

  // Helper: Glide cursor to element and click
  const glideAndClick = async (selector: string, label: string): Promise<boolean> => {
    const el = await waitForElement(selector);
    if (!el) return false;

    await ensureElementInView(el);

    const rect = el.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;

    setCursorPos({ x: targetX, y: targetY, isClicking: false, label });
    await new Promise(r => setTimeout(r, 600));

    setCursorPos({ x: targetX, y: targetY, isClicking: true, label });
    await new Promise(r => setTimeout(r, 200));

    setCursorPos({ x: targetX, y: targetY, isClicking: false, label: undefined });
    el.click();
    return true;
  };

  // Helper: Glide cursor to input and type text character-by-character
  const glideAndType = async (selector: string, text: string, label: string): Promise<boolean> => {
    const el = (await waitForElement(selector)) as HTMLInputElement | HTMLTextAreaElement | null;
    if (!el) return false;

    await ensureElementInView(el);

    const rect = el.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;

    setCursorPos({ x: targetX, y: targetY, isClicking: false, label });
    await new Promise(r => setTimeout(r, 500));

    el.focus();

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;

    let currentStr = '';
    for (let i = 0; i < text.length; i++) {
      currentStr += text[i];
      if (el instanceof HTMLInputElement && nativeInputValueSetter) {
        nativeInputValueSetter.call(el, currentStr);
      } else if (el instanceof HTMLTextAreaElement && nativeTextAreaValueSetter) {
        nativeTextAreaValueSetter.call(el, currentStr);
      } else {
        el.value = currentStr;
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 25));
    }

    setCursorPos({ x: targetX, y: targetY, isClicking: false, label: undefined });
    return true;
  };

  // Authentic Human Logout & Real Login Flow via /login
  const performHumanAuthFlow = async (targetRole: string, targetEmail: string, targetRoute: string) => {
    setIsPerformingAuth(true);

    // 1. If user is currently logged in, glide to Profile Menu -> Click Sign Out
    if (user) {
      const profileBtn = await waitForElement('[data-tour="user-profile-menu"]', 1500);
      if (profileBtn) {
        await glideAndClick('[data-tour="user-profile-menu"]', 'Opening Profile Menu');
        const logoutBtn = await waitForElement('[data-tour="logout-btn"]', 1500);
        if (logoutBtn) {
          await glideAndClick('[data-tour="logout-btn"]', 'Signing Out...');
        }
      }
      logout();
    }

    // 2. Navigate to /login with target route state so LoginPage redirects directly to targetRoute upon authentication
    navigate('/login', { state: { from: { pathname: targetRoute } } });
    await new Promise(r => setTimeout(r, 400));

    // 3. On /login, glide cursor to Email field & type character-by-character
    const emailInput = await waitForElement('input[type="email"]', 3000);
    if (emailInput) {
      await glideAndType('input[type="email"]', targetEmail, `Logging in as ${targetRole.replace('_', ' ')}...`);
    }

    // 4. Glide cursor to Password field & type Password123!
    const passwordInput = await waitForElement('input[type="password"]', 1500);
    if (passwordInput) {
      await glideAndType('input[type="password"]', 'Password123!', 'Entering Security Passkey...');
    }

    // 5. Glide cursor to Sign In button & click with ripple
    const submitBtn = await waitForElement('button[type="submit"]', 1500);
    if (submitBtn) {
      await glideAndClick('button[type="submit"]', 'Signing In to Platform');
    }

    // 6. Complete authentic login & role assignment
    await login(targetEmail, 'Password123!');
    switchRole(targetRole);

    // 7. Navigate to target route for step & wait for component mount
    navigate(targetRoute);
    await new Promise(r => setTimeout(r, 500));
    setIsPerformingAuth(false);
  };

  // Step sub-action sequence driver
  const runStepActions = async (stepId: number) => {
    if (stepId === 1) {
      // Step 1: Officer Dashboard Metrics & Human-Like Navigation to Tenders
      const targetEl = await waitForElement('[data-tour="kpi-metrics"]');
      if (targetEl) {
        await ensureElementInView(targetEl);
        const rect = targetEl.getBoundingClientRect();
        setCursorPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, isClicking: false, label: 'Inspecting Speed Metrics' });
        await new Promise(r => setTimeout(r, 1000));
      }

      // Smoothly glide cursor to top nav Tenders link & click it like a human
      const tendersNavBtn = await waitForElement('[data-tour="nav-tenders"]');
      if (tendersNavBtn) {
        await glideAndClick('[data-tour="nav-tenders"]', 'Opening Tenders Requisitions Portal');
      }
    } else if (stepId === 2) {
      // Step 2: Publish Fresh Solar Tender — INSPECT TENDERS & FILL ALL ENTRIES IN MODAL
      try {
        const storedTenders = JSON.parse(localStorage.getItem('gem_tenders_override') || '[]');
        if (!storedTenders.some((t: any) => t.id === FRESH_SOLAR_TENDER.id)) {
          localStorage.setItem('gem_tenders_override', JSON.stringify([FRESH_SOLAR_TENDER, ...storedTenders]));
        }
      } catch (err) {
        console.warn('Tender publish local override error:', err);
      }

      // 0. Smooth Top-to-Bottom & Bottom-to-Top Tender Board Inspection with quadratic easing
      setCursorPos({
        x: window.innerWidth / 2,
        y: 300,
        isClicking: false,
        label: 'Inspecting Live Registered GeM Tenders...'
      });
      await new Promise(r => setTimeout(r, 400));

      // Custom smooth quadratic eased scroll helper
      const smoothScrollTo = async (targetY: number, durationMs: number) => {
        const startY = window.scrollY;
        const diff = targetY - startY;
        const steps = 35;
        const stepDelay = durationMs / steps;
        for (let i = 1; i <= steps; i++) {
          const progress = i / steps;
          const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
          window.scrollTo(0, startY + diff * ease);
          await new Promise(r => setTimeout(r, stepDelay));
        }
      };

      // Scroll down over 2.0 seconds
      setCursorPos({
        x: window.innerWidth / 2,
        y: window.innerHeight - 200,
        isClicking: false,
        label: 'Reviewing Active Requisitions & GFR Status...'
      });
      await smoothScrollTo(document.body.scrollHeight, 2000);

      // Pause at bottom for 1.0 second
      await new Promise(r => setTimeout(r, 1000));

      // Scroll back up over 2.0 seconds
      setCursorPos({
        x: window.innerWidth / 2,
        y: 200,
        isClicking: false,
        label: 'Returning to Top to Publish New NIT...'
      });
      await smoothScrollTo(0, 2000);
      await new Promise(r => setTimeout(r, 500));

      const createBtn = await waitForElement('[data-tour="create-tender-btn"]');
      if (createBtn) {
        await glideAndClick('[data-tour="create-tender-btn"]', 'Opening Create Tender Modal (NIT)');
        
        // 1. Fill Tender Number
        await glideAndType('[data-tour="tender-num-input"]', FRESH_SOLAR_TENDER.tenderNumber, 'Setting Tender Ref Number...');
        
        // 2. Fill Category
        await glideAndType('[data-tour="tender-category-input"]', FRESH_SOLAR_TENDER.category, 'Setting Category...');
        
        // 3. Fill Tender Title
        await glideAndType('[data-tour="tender-title-input"]', FRESH_SOLAR_TENDER.title, 'Typing Solar Tender Specifications...');
        
        // 4. Fill Issuing Authority
        await glideAndType('[data-tour="tender-authority-input"]', FRESH_SOLAR_TENDER.issuingAuthority, 'Setting Ministry Authority...');
        
        // 5. Fill Estimated Value
        await glideAndType('[data-tour="tender-value-input"]', '65000000', 'Setting Budget (₹6.50 Cr)...');
        
        // 6. Fill Description
        await glideAndType('[data-tour="tender-desc-input"]', FRESH_SOLAR_TENDER.description, 'Typing Specification Details...');
        
        // 7. Click Submit Button to publish tender & run OCR
        await glideAndClick('[data-tour="tender-submit-btn"]', 'Publishing Tender & Processing OCR');
      } else {
        const board = await waitForElement('[data-tour="tenders-board"]');
        if (board) {
          await ensureElementInView(board);
          const rect = board.getBoundingClientRect();
          setCursorPos({ x: rect.left + rect.width / 2, y: rect.top + 100, isClicking: false, label: 'Fresh Solar Tender GEM/2026/SOLAR/99088 Live' });
        }
      }
    } else if (stepId === 3) {
      // Step 3: Real Vendor Search, Participation & 4-Step Bidding Process
      // Ensure we are on /tenders page before executing search
      if (window.location.pathname !== '/tenders') {
        navigate('/tenders');
        await new Promise(r => setTimeout(r, 400));
      }

      // 1. Search for Tender Specifically on Browse Tenders page
      const searchInput = await waitForElement('[data-tour="tenders-search-input"]', 3000);
      if (searchInput) {
        await glideAndType('[data-tour="tenders-search-input"]', FRESH_SOLAR_TENDER.tenderNumber, 'Searching Fresh Solar Tender GEM/2026/SOLAR/99088...');
        await new Promise(r => setTimeout(r, 600));
      }

      // 2. Click 'Participate & Submit Bid' button on filtered tender card
      const participateBtn = await waitForElement('[data-tour="participate-bid-btn"]', 3000);
      if (participateBtn) {
        await glideAndClick('[data-tour="participate-bid-btn"]', 'Clicking Participate & Submit Bid');
        await new Promise(r => setTimeout(r, 600));
      }

      // 3. Step 1 Wizard: Statutory Profile -> Click Proceed to Commercial BoQ
      const nextStep1Btn = await waitForElement('[data-tour="next-step-1-btn"]', 3000);
      if (nextStep1Btn) {
        await glideAndClick('[data-tour="next-step-1-btn"]', 'Reviewing MSME & GSTIN Profile -> Commercial BoQ');
        await new Promise(r => setTimeout(r, 600));
      }

      // 4. Step 2 Wizard: Commercial BoQ -> Click Proceed to Technical Documents
      const nextStep2Btn = await waitForElement('[data-tour="next-step-2-btn"]', 3000);
      if (nextStep2Btn) {
        await glideAndClick('[data-tour="next-step-2-btn"]', 'Verifying BoQ Quotation (₹6.15 Cr) -> Technical Dossier');
        await new Promise(r => setTimeout(r, 600));
      }

      // 5. Step 3 Wizard: Technical Dossier -> Submit Formal Bid Dossier & Digital Seal (DSC)
      const submitDossierBtn = await waitForElement('[data-tour="submit-dossier-btn"]', 3000);
      if (submitDossierBtn) {
        await glideAndClick('[data-tour="submit-dossier-btn"]', 'Attaching PDF Dossiers & Sealing with Class-3 DSC');
        await new Promise(r => setTimeout(r, 1200));
      } else {
        const fastSubmitBtn = await waitForElement('[data-tour="fast-submit-bid-btn"]', 1500);
        if (fastSubmitBtn) {
          await glideAndClick('[data-tour="fast-submit-bid-btn"]', 'Signing Bid with Class-3 DSC Seal');
          await new Promise(r => setTimeout(r, 1200));
        }
      }

      // 6. Step 4 Wizard: Digital Seal Acknowledgment Receipt
      const ackCert = await waitForElement('[data-tour="bid-wizard"]', 2000);
      if (ackCert) {
        await ensureElementInView(ackCert);
        const rect = ackCert.getBoundingClientRect();
        setCursorPos({ x: rect.left + rect.width / 2, y: rect.top + 100, isClicking: false, label: 'Bid Submission Sealed & Anchored on EVM Blockchain' });
      }
    } else if (stepId === 4) {
      // Step 4: AI Compliance Pipeline & Reasoning Chain
      apiService.runCompliancePipeline(FRESH_SOLAR_TENDER.id).catch(console.warn);
      const chainEl = await waitForElement('[data-tour="reasoning-chain"]');
      if (chainEl) {
        await ensureElementInView(chainEl);
        const rect = chainEl.getBoundingClientRect();
        setCursorPos({ x: rect.left + rect.width / 2, y: rect.top + 80, isClicking: false, label: 'Inspecting 5-Stage AI Reasoning Chain' });
      }
    } else if (stepId === 5) {
      // Step 5: Statutory Officer Override
      const cardEl = await waitForElement('[data-tour="officer-override-card"]');
      if (cardEl) {
        await ensureElementInView(cardEl);
        const rect = cardEl.getBoundingClientRect();
        setCursorPos({ x: rect.left + rect.width / 2, y: rect.top + 60, isClicking: false, label: 'Statutory GFR Clause 144 Officer Review' });
        await glideAndType(
          'textarea',
          'Technical committee verified solar testbed efficiency certificate CWPRS/SOL/2026/102 under GFR 2017 Clause 144.',
          'Typing Auditable Justification...'
        );
      }
    } else if (stepId === 6) {
      // Step 6: Multi-Bidder Matrix & L1 Winner Determination
      const compareEl = await waitForElement('[data-tour="multi-compare"]');
      if (compareEl) {
        await ensureElementInView(compareEl);
        const rect = compareEl.getBoundingClientRect();
        // Target Apex Pumps (Winner: 100% Pass, Risk 0/100, L1 ₹6.15 Cr)
        setCursorPos({ x: rect.left + rect.width / 4, y: rect.top + 140, isClicking: false, label: 'L1 Winner — Apex Pumps (100% Pass, ₹6.15 Cr)' });
      }
    } else if (stepId === 7) {
      // Step 7: Search Awarded Tender & Generate Official GeM Contract Order
      const searchInput = await waitForElement('[data-tour="tenders-search-input"]');
      if (searchInput) {
        await glideAndType('[data-tour="tenders-search-input"]', FRESH_SOLAR_TENDER.tenderNumber, 'Searching Fresh Awarded Solar Tender...');
      }
      const standingsBtn = await waitForElement('[data-tour="view-award-standings-btn"]');
      if (standingsBtn) {
        await glideAndClick('[data-tour="view-award-standings-btn"]', 'Opening Public Standings & Proof');
      }
      const contractOrderBtn = await waitForElement('[data-tour="generate-contract-order-btn"]');
      if (contractOrderBtn) {
        await glideAndClick('[data-tour="generate-contract-order-btn"]', 'Generating Official GeM Contract Award Order');
      }
    }
  };

  // Execute authentic login/logout sequence whenever persona needs to switch
  useEffect(() => {
    if (!isActive) return;
    const step = TOUR_STEPS[currentStepIndex];
    if (!step) return;

    const currentRoleNorm = (user?.role || '').toUpperCase().replace(/^ROLE_/, '');
    const needsRoleSwitch = !user || currentRoleNorm !== step.role;

    if (needsRoleSwitch) {
      performHumanAuthFlow(step.role, step.email, step.route).then(() => {
        runStepActions(step.id);
      });
    } else {
      navigate(step.route);
      runStepActions(step.id);
    }
  }, [isActive, currentStepIndex]);

  // Tailored auto-play timer (14s for Step 2, 10s for others)
  useEffect(() => {
    if (!isActive || !isAutoPlaying || isPerformingAuth) return;
    const duration = currentStepIndex === 0 ? 3500 : currentStepIndex === 1 ? 21000 : currentStepIndex === 2 ? 18000 : 10000;
    const timer = setTimeout(() => {
      if (currentStepIndex < TOUR_STEPS.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else {
        setIsAutoPlaying(false);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [isActive, isAutoPlaying, currentStepIndex, isPerformingAuth]);

  const startTour = () => {
    setCurrentStepIndex(0);
    setIsAutoPlaying(true);
    setIsActive(true);
    const firstStep = TOUR_STEPS[0];
    performHumanAuthFlow(firstStep.role, firstStep.email, firstStep.route).then(() => {
      runStepActions(firstStep.id);
    });
  };

  const nextStep = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsActive(false);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(prev => !prev);
  };

  const exitTour = () => {
    setIsActive(false);
    setIsAutoPlaying(false);
  };

  const goToStep = (index: number) => {
    if (index >= 0 && index < TOUR_STEPS.length) {
      setCurrentStepIndex(index);
    }
  };

  return (
    <GuidedTourContext.Provider
      value={{
        isActive,
        currentStepIndex,
        currentStep,
        isAutoPlaying,
        cursorPos,
        startTour,
        nextStep,
        prevStep,
        toggleAutoPlay,
        exitTour,
        goToStep
      }}
    >
      {children}
    </GuidedTourContext.Provider>
  );
};

export const useGuidedTour = () => {
  const context = useContext(GuidedTourContext);
  if (!context) {
    throw new Error('useGuidedTour must be used within a GuidedTourProvider');
  }
  return context;
};
