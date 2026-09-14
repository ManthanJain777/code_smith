import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'EN' | 'HI';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string, fallback?: string) => string;
}

const TRANSLATIONS: Record<string, Record<Language, string>> = {
  // Brand & Header
  'brand.portalName': { EN: 'GeM Compliance', HI: 'GeM अनुपालन' },
  'brand.subtitle': { EN: 'AI-Powered Bid Compliance & Decision Support Platform', HI: 'एआई-संचालित बोली अनुपालन एवं निर्णय समर्थन मंच' },
  'brand.ministry': { EN: 'Ministry of Petroleum & Natural Gas', HI: 'पेट्रोलियम एवं प्राकृतिक गैस मंत्रालय' },
  'brand.govIndia': { EN: 'भारत सरकार | Government of India', HI: 'भारत सरकार | Government of India' },
  'brand.tag': { EN: 'GFR 2017 CERTIFIED', HI: 'GFR 2017 प्रमाणित' },

  // Navigation Links
  'nav.dashboard': { EN: 'Dashboard', HI: 'डैशबोर्ड' },
  'nav.tenders': { EN: 'Tenders', HI: 'निविदाएं' },
  'nav.browseTenders': { EN: 'Browse Tenders', HI: 'निविदाएं देखें' },
  'nav.submitBid': { EN: 'Submit Bid Dossier', HI: 'बोली दस्तावेज जमा करें' },
  'nav.compliance': { EN: 'Compliance & Evaluation', HI: 'अनुपालन एवं मूल्यांकन' },
  'nav.myCompliance': { EN: 'My Compliance Status', HI: 'मेरी अनुपालन स्थिति' },
  'nav.matrix': { EN: 'Compliance Matrix', HI: 'अनुपालन मैट्रिक्स' },
  'nav.compare': { EN: 'Multi-Bidder Compare', HI: 'बहु-बोलीदाता तुलना' },
  'nav.reports': { EN: 'Compliance Reports', HI: 'अनुपालन रिपोर्ट' },
  'nav.clarifications': { EN: 'Clarifications & Grievances', HI: 'स्पष्टीकरण एवं शिकायतें' },
  'nav.verification': { EN: 'Verification Queue', HI: 'सत्यापन कतार' },
  'nav.vendorProfile': { EN: 'Vendor Profile', HI: 'विक्रेता प्रोफ़ाइल' },
  'nav.portals': { EN: 'Government Portal Verification', HI: 'सरकारी पोर्टल सत्यापन' },
  'nav.sellers': { EN: 'Seller Verification Queue', HI: 'विक्रेता सत्यापन कतार' },
  'nav.humanReview': { EN: 'Human Review Queue', HI: 'मानव समीक्षा कतार' },
  'nav.copilot': { EN: 'Procurement Copilot', HI: 'खरीद सह-पायलट (एआई)' },
  'nav.bidAssistant': { EN: 'Bid Assistant', HI: 'बोली सहायक' },
  'nav.exceptionAssistant': { EN: 'Exception Assistant', HI: 'अपवाद सहायक' },
  'nav.vigilanceTranscripts': { EN: 'Vigilance Transcripts', HI: 'सतर्कता प्रतिलेख' },
  'nav.analytics': { EN: 'Analytics', HI: 'एनालिटिक्स' },
  'nav.audit': { EN: 'Blockchain Audit', HI: 'ब्लॉकचेन ऑडिट' },
  'nav.proofs': { EN: 'Blockchain Proofs', HI: 'ब्लॉकचेन प्रमाण' },
  'nav.createTender': { EN: '+ Create Tender (NIT)', HI: '+ नई निनिविदा बनाएं' },
  'nav.searchPlaceholder': { EN: 'Search by Tender ID, Seller name, GSTIN, PAN or Item category...', HI: 'निविदा संख्या, विक्रेता, GSTIN, PAN अथवा उत्पाद खोजें...' },
  'nav.logout': { EN: 'Log Out', HI: 'लॉग आउट' },
  'nav.profile': { EN: 'Profile', HI: 'प्रोफ़ाइल' },

  // Common UI Actions
  'common.search': { EN: 'Search', HI: 'खोजें' },
  'common.verify': { EN: 'Verify', HI: 'सत्यापित करें' },
  'common.cancel': { EN: 'Cancel', HI: 'रद्द करें' },
  'common.save': { EN: 'Save Changes', HI: 'परिवर्तन सहेजें' },
  'common.download': { EN: 'Download', HI: 'डाउनलोड' },
  'common.viewDetails': { EN: 'View Details', HI: 'विवरण देखें' },
  'common.back': { EN: 'Go Back', HI: 'वापस जाएं' },
  'common.returnDashboard': { EN: 'Return to Dashboard', HI: 'डैशबोर्ड पर वापस जाएं' },
  'common.filter': { EN: 'Filter', HI: 'फ़िल्टर' },
  'common.status': { EN: 'Status', HI: 'स्थिति' },
  'common.actions': { EN: 'Actions', HI: 'कार्रवाई' },
  'common.loading': { EN: 'Loading...', HI: 'लोड हो रहा है...' },
  'common.active': { EN: 'Active', HI: 'सक्रिय' },
  'common.verified': { EN: 'Verified', HI: 'सत्यापित' },
  'common.refresh': { EN: 'Refresh', HI: 'रीफ्रेश' },

  // Roles
  'role.procurementOfficer': { EN: 'Procurement Officer', HI: 'खरीद अधिकारी' },
  'role.complianceReviewer': { EN: 'Compliance Reviewer', HI: 'अनुपालन समीक्षक' },
  'role.systemAdmin': { EN: 'System Admin', HI: 'सिस्टम प्रशासक' },
  'role.auditor': { EN: 'Auditor & Vigilance', HI: 'लेखा परीक्षक एवं सतर्कता' },
  'role.bidder': { EN: 'Bidder / Vendor', HI: 'बोलीदाता / विक्रेता' },

  // Compliance States
  'status.compliant': { EN: 'COMPLIANT', HI: 'अनुपालन सफल' },
  'status.nonCompliant': { EN: 'NON COMPLIANT', HI: 'गैर-अनुपालन' },
  'status.partiallyCompliant': { EN: 'PARTIALLY COMPLIANT', HI: 'आंशिक अनुपालन' },
  'status.unverified': { EN: 'UNVERIFIED', HI: 'असत्यापित' },
  'status.pending': { EN: 'PENDING', HI: 'लंबित' },
  'status.approved': { EN: 'APPROVED', HI: 'स्वीकृत' },
  'status.underEvaluation': { EN: 'UNDER EVALUATION', HI: 'मूल्यांकन जारी' },

  // Login Page
  'login.heading': { EN: 'Government e-Marketplace Verification Gateway', HI: 'गवर्नमेंट ई-मार्केटप्लेस सत्यापन प्रवेश द्वार' },
  'login.subheading': { EN: 'National Public Procurement AI Compliance Engine • SIH26100', HI: 'राष्ट्रीय सार्वजनिक खरीद एआई अनुपालन इंजन • SIH26100' },
  'login.portalDesc': { EN: 'Sign In to Official GeM Portal', HI: 'आधिकारिक GeM पोर्टल में प्रवेश करें' },
  'login.signIn': { EN: 'Sign In to Platform', HI: 'मंच में प्रवेश करें' },
  'login.subtitle': { EN: 'Enter your authorized administrative or vendor credentials.', HI: 'अपने अधिकृत प्रशासनिक अथवा विक्रेता क्रेडेंशियल्स दर्ज करें।' },
  'login.goBack': { EN: 'Go Back', HI: 'वापस जाएं' },
  'login.goBackToPortal': { EN: 'Go Back to Portal', HI: 'पोर्टल पर वापस जाएं' },
  'login.email': { EN: 'Official Email Address', HI: 'आधिकारिक ईमेल पता' },
  'login.password': { EN: 'Security Passkey / Password', HI: 'सुरक्षा पासकी / पासवर्ड' },
  'login.signInButton': { EN: 'Sign In to Platform', HI: 'मंच में प्रवेश करें' },
  'login.authenticating': { EN: 'Authenticating Cryptographic Session...', HI: 'सत्र प्रमाणित किया जा रहा है...' },
  'login.quickRoles': { EN: 'Quick Role Profiles (Demo)', HI: 'त्वरित भूमिका प्रोफाइल (डेमो)' },
  'login.demoAccounts': { EN: 'Quick Role Profiles (Demo)', HI: 'त्वरित भूमिका प्रोफाइल (डेमो खाता)' },
  'login.demoHint': { EN: 'Click any role below to autofill and evaluate that specific perspective:', HI: 'उस दृष्टिकोण का परीक्षण करने हेतु नीचे किसी भी भूमिका पर क्लिक करें:' },

  // Landing Page
  'landing.heroTitle': { EN: 'Transforming Public Procurement with AI & Sovereign Integrity', HI: 'एआई एवं संप्रभु सत्यनिष्ठा के साथ सार्वजनिक खरीद में क्रांति' },
  'landing.heroSubtitle': { EN: 'Instant statutory bid evaluation under Rule 144/173 of General Financial Rules (GFR 2017) with cryptographic blockchain audit trail.', HI: 'क्रिप्टोग्राफिक ब्लॉकचेन ऑडिट ट्रेल के साथ GFR 2017 के नियम 144/173 के तहत तत्काल वैधानिक बोली मूल्यांकन।' },
  'landing.enterPortal': { EN: 'Enter Official Portal', HI: 'आधिकारिक पोर्टल में प्रवेश करें' },
  'landing.exploreTenders': { EN: 'Explore Live Tenders', HI: 'सक्रिय निविदाएं देखें' },
  'landing.heroCta': { EN: 'Sign In / Access Portal', HI: 'प्रवेश करें / पोर्टल खोलें' },
  'landing.quickRoleSelect': { EN: 'Select a Demo Persona to Explore:', HI: 'परीक्षण हेतु एक डेमो भूमिका चुनें:' },
  'landing.browseAllTenders': { EN: 'Browse All Active Tenders', HI: 'सभी सक्रिय निविदाएं देखें' },
  'landing.searchPlaceholder': { EN: 'Search products, services, tenders, or item codes...', HI: 'उत्पाद, सेवाएं, निविदाएं अथवा कोड खोजें...' },

  // Top Nav Controls
  'topnav.helpline': { EN: 'Toll-Free 1800-419-3436', HI: 'टोल-फ्री 1800-419-3436' },
  'topnav.langToggle': { EN: 'English (EN)', HI: 'हिन्दी (HI)' },
  'nav.matrixAndReports': { EN: 'Compliance Matrix & Reports', HI: 'अनुपालन मैट्रिक्स एवं रिपोर्ट' },

  // Dashboard & Metrics
  'dashboard.title': { EN: 'Executive Procurement Overview', HI: 'कार्यकारी खरीद अवलोकन' },
  'dashboard.subtitle': { EN: 'Real-time sovereign procurement monitoring under GFR 2017 standards', HI: 'GFR 2017 मानकों के तहत वास्तविक समय संप्रभु खरीद निगरानी' },
  'dashboard.activeTenders': { EN: 'Active Tenders', HI: 'सक्रिय निविदाएं' },
  'dashboard.pendingBids': { EN: 'Pending Bid Reviews', HI: 'लंबित बोली समीक्षाएं' },
  'dashboard.avgCompliance': { EN: 'Avg Compliance Score', HI: 'औसत अनुपालन स्कोर' },
  'dashboard.blockchainBlocks': { EN: 'Blockchain Proofs Anchored', HI: 'ब्लॉकचेन प्रमाणित रिकॉर्ड' },
  'dashboard.recentActivity': { EN: 'Recent System Activity', HI: 'हाल की प्रणाली गतिविधियां' },
  'dashboard.quickActions': { EN: 'Quick Administrative Actions', HI: 'त्वरित प्रशासनिक कार्रवाइयां' },
  'dashboard.evaluateBids': { EN: 'Evaluate Submitted Bids', HI: 'जमा की गई बोलियों का मूल्यांकन करें' },
  'dashboard.auditTrail': { EN: 'View Cryptographic Audit Trail', HI: 'क्रिप्टोग्राफिक ऑडिट ट्रेल देखें' },

  // Compliance Matrix & Reports
  'matrix.requirementCode': { EN: 'Requirement Code', HI: 'आवश्यकता कोड' },
  'matrix.category': { EN: 'Category', HI: 'श्रेणी' },
  'matrix.threshold': { EN: 'Statutory Threshold', HI: 'वैधानिक सीमा' },
  'matrix.bidderValue': { EN: 'Bidder Submitted Value', HI: 'बोलीदाता द्वारा प्रस्तुत मूल्य' },
  'matrix.status': { EN: 'Evaluation Status', HI: 'मूल्यांकन स्थिति' },
  'matrix.confidence': { EN: 'Confidence Score', HI: 'विश्वास स्कोर' },
  'matrix.reasoning': { EN: 'AI Legal Reasoning Chain', HI: 'एआई कानूनी तर्क श्रृंखला' },
  'matrix.evidence': { EN: 'Evidence Document Citation', HI: 'साक्ष्य दस्तावेज उद्धरण' },
  'matrix.override': { EN: 'Officer Override', HI: 'अधिकारी ओवरराइड' },
  'matrix.runPipeline': { EN: 'Run GFR Compliance Pipeline', HI: 'GFR अनुपालन पाइपलाइन चलाएं' },
  'matrix.exportReport': { EN: 'Export Audit Dossier (PDF)', HI: 'ऑडिट दस्तावेज डाउनलोड (PDF)' },
  'matrix.allRequirements': { EN: 'All Requirements', HI: 'सभी आवश्यकताएं' },
  'matrix.compliant': { EN: 'Compliant', HI: 'पूर्णतः अनुपालित' },
  'matrix.nonCompliant': { EN: 'Non-Compliant', HI: 'गैर-अनुपालित' },
  'matrix.unverified': { EN: 'Unverified', HI: 'असत्यापित' },
  'matrix.contradictions': { EN: 'Contradictions & Variances', HI: 'विसंगतियाँ एवं भिन्नताएं' },
  'matrix.detailedView': { EN: 'Detailed Matrix View', HI: 'विस्तृत मैट्रिक्स दृश्य' },
  'matrix.reportView': { EN: 'Executive Audit Report', HI: 'कार्यकारी ऑडिट रिपोर्ट' },

  // Reviews & Verification
  'review.pending': { EN: 'Pending Human Reviews', HI: 'लंबित मानव समीक्षाएं' },
  'review.resolve': { EN: 'Resolve Discrepancy', HI: 'विसंगति का समाधान करें' },
  'review.approved': { EN: 'Approved & Sealed', HI: 'स्वीकृत एवं मुहरबंद' },
  'review.rationale': { EN: 'Mandatory Legal Justification', HI: 'अनिवार्य कानूनी औचित्य' },
  'review.submitOverride': { EN: 'Record Officer Decision', HI: 'अधिकारी निर्णय दर्ज करें' },

  // Copilot & AI
  'copilot.title': { EN: 'National Procurement AI Copilot', HI: 'राष्ट्रीय खरीद एआई सह-पायलट' },
  'copilot.subtitle': { EN: 'GFR 2017 Grounded Statutory Assistant', HI: 'GFR 2017 आधारित वैधानिक सहायक' },
  'copilot.askPlaceholder': { EN: 'Ask any GFR 2017 legal or tender compliance question...', HI: 'कोई भी GFR 2017 कानूनी अथवा निविदा अनुपालन प्रश्न पूछें...' },
  'copilot.send': { EN: 'Submit Query', HI: 'प्रश्न भेजें' },
  'copilot.suggestedPrompt': { EN: 'Suggested Inquiry', HI: 'सुझाया गया प्रश्न' },

  // Multimodal OCR
  'ocr.title': { EN: 'Statutory Certificate OCR Scanner', HI: 'वैधानिक प्रमाणपत्र ओसीआर स्कैनर' },
  'ocr.upload': { EN: 'Upload Certificate for Instant Verification', HI: 'तत्काल सत्यापन हेतु प्रमाणपत्र अपलोड करें' },
  'ocr.scanNow': { EN: 'Scan Document with Gemini', HI: 'जेमिनी द्वारा दस्तावेज स्कैन करें' },
  'ocr.extracting': { EN: 'Extracting Statutory Entities...', HI: 'वैधानिक विवरण निकाले जा रहे हैं...' },
  'ocr.verifiedGenuine': { EN: 'Cryptographically Verified Genuine', HI: 'क्रिप्टोग्राफिक रूप से सत्यापित असली' },
  'ocr.confidence': { EN: 'Authenticity Confidence', HI: 'सत्यता विश्वास स्तर' },

  // Blockchain Audit
  'blockchain.title': { EN: 'Immutable EVM Audit Ledger', HI: 'अपरिवर्तनीय EVM ऑडिट लेज़र' },
  'blockchain.blockNumber': { EN: 'Block Number', HI: 'ब्लॉक संख्या' },
  'blockchain.txHash': { EN: 'Transaction Hash', HI: 'लेनदेन हैश' },
  'blockchain.merkleRoot': { EN: 'Merkle Root Proof', HI: 'मर्कल रूट प्रमाण' },
  'blockchain.timestamp': { EN: 'Timestamp (IST)', HI: 'समय मुहर (IST)' },
  'blockchain.verified': { EN: 'Verified On-Chain', HI: 'ब्लॉकचेन पर सत्यापित' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('gem_language');
    return (saved === 'HI' || saved === 'EN') ? saved : 'EN';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('gem_language', newLang);
  };

  const toggleLang = () => {
    const nextLang = lang === 'EN' ? 'HI' : 'EN';
    setLang(nextLang);
  };

  const t = (key: string, fallback?: string): string => {
    const entry = TRANSLATIONS[key];
    if (entry && entry[lang]) {
      return entry[lang];
    }
    return fallback || (entry ? entry.EN : key);
  };

  useEffect(() => {
    document.documentElement.lang = lang === 'HI' ? 'hi' : 'en';
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
