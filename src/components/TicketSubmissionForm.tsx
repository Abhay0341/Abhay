import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  User, 
  Phone, 
  Monitor, 
  Fingerprint, 
  AlertTriangle, 
  Upload, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  RefreshCw, 
  Share2, 
  MessageSquare,
  HelpCircle,
  FileImage,
  X,
  Megaphone,
  PhoneCall,
  Info,
  ShieldCheck
} from 'lucide-react';
import { Language, Ticket, TicketUrgency, UIConfig } from '../types';
import { translations } from '../translations';
import { INDIAN_STATES_DISTRICTS, BANK_LIST, DEFAULT_UI_CONFIG, PROBLEM_CATEGORIES, DEFAULT_UI_DEVICES } from '../data/constants';
import { saveOfflineTicket } from '../utils/offlineStorage';
import { generateTicketCreatedMessage, getWhatsAppDirectUrl } from '../utils/whatsapp';

interface TicketSubmissionFormProps {
  lang: Language;
  isOnline: boolean;
  uiConfig?: UIConfig;
  onTicketSubmitted: (ticket: Ticket) => void;
  onOpenAiHelp: (context?: { bank: string; device: string; problem: string; category: string }) => void;
}

export const TicketSubmissionForm: React.FC<TicketSubmissionFormProps> = ({
  lang,
  isOnline,
  uiConfig = DEFAULT_UI_CONFIG,
  onTicketSubmitted,
  onOpenAiHelp
}) => {
  const t = translations[lang];

  // Dynamic config resolution
  const activeBanks = (uiConfig?.banks && uiConfig.banks.length > 0) ? uiConfig.banks : BANK_LIST;
  const activeDevices = (uiConfig?.devices && uiConfig.devices.length > 0) ? uiConfig.devices : DEFAULT_UI_DEVICES;
  const activeCategories = (uiConfig?.problemCategories && uiConfig.problemCategories.length > 0) ? uiConfig.problemCategories : PROBLEM_CATEGORIES;
  const activeStatesDistricts = (uiConfig?.statesDistricts && Object.keys(uiConfig.statesDistricts).length > 0) ? uiConfig.statesDistricts : INDIAN_STATES_DISTRICTS;
  const fieldSettings = { ...DEFAULT_UI_CONFIG.formFields, ...(uiConfig?.formFields || {}) };
  const supportInfo = { ...DEFAULT_UI_CONFIG.supportInfo, ...(uiConfig?.supportInfo || {}) };
  const announcement = { ...DEFAULT_UI_CONFIG.announcement, ...(uiConfig?.announcement || {}) };

  const defaultState = Object.keys(activeStatesDistricts)[0] || "Uttar Pradesh";
  const defaultDistrict = activeStatesDistricts[defaultState]?.[0] || "Gorakhpur";
  const defaultBank = activeBanks[0] || "State Bank of India (SBI Kiosk)";
  const defaultDevice = activeDevices[0]?.name || "Morpho MSO 1300 E3 (USB)";
  const defaultCategory = activeCategories[0]?.id || "rd_service_error";

  // Form State
  const [state, setState] = useState<string>(defaultState);
  const [district, setDistrict] = useState<string>(defaultDistrict);
  const [bankName, setBankName] = useState<string>(defaultBank);
  const [branchName, setBranchName] = useState<string>("");
  const [bcLocation, setBcLocation] = useState<string>("");
  const [koId, setKoId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [mobileNo, setMobileNo] = useState<string>("");
  const [anydeskId, setAnydeskId] = useState<string>("");
  const [fingerprintDevice, setFingerprintDevice] = useState<string>(defaultDevice);
  const [deviceSerial, setDeviceSerial] = useState<string>("");
  const [problemCategory, setProblemCategory] = useState<string>(defaultCategory);
  const [problemDescription, setProblemDescription] = useState<string>("");
  const [urgency, setUrgency] = useState<TicketUrgency>(fieldSettings.defaultUrgency || "high");
  const [screenshotUrl, setScreenshotUrl] = useState<string | undefined>(undefined);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  // Available districts for selected state
  const availableDistricts = activeStatesDistricts[state] || ["Main District", "Headquarters"];

  // Update district when state changes
  useEffect(() => {
    if (availableDistricts && availableDistricts.length > 0 && !availableDistricts.includes(district)) {
      setDistrict(availableDistricts[0]);
    }
  }, [state, activeStatesDistricts]);

  // AnyDesk ID formatting (e.g. 123 456 789)
  const handleAnydeskChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    let formatted = digits;
    if (digits.length > 3 && digits.length <= 6) {
      formatted = `${digits.slice(0, 3)} ${digits.slice(3)}`;
    } else if (digits.length > 6) {
      formatted = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    setAnydeskId(formatted);
  };

  // Mobile number 10 digits
  const handleMobileChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    setMobileNo(digits);
  };

  // Image Upload handler (Base64)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(lang === 'hi' ? 'फोटो का साइज 5MB से कम होना चाहिए।' : 'Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Quick Problem Select helper
  const handleCategorySelect = (catId: string) => {
    setProblemCategory(catId);
    const cat = activeCategories.find(c => c.id === catId);
    if (cat && !problemDescription) {
      setProblemDescription(lang === 'hi' ? cat.hi : cat.en);
    }
  };

  // Validation
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!state.trim()) errors.state = lang === 'hi' ? 'कृपया राज्य चुनें।' : 'State is required.';
    if (!district.trim()) errors.district = lang === 'hi' ? 'कृपया ज़िला चुनें।' : 'District is required.';
    if (!bankName.trim()) errors.bankName = lang === 'hi' ? 'कृपया बैंक का नाम चुनें।' : 'Bank is required.';
    
    if (fieldSettings.showBranchName && fieldSettings.branchNameRequired && !branchName.trim()) {
      errors.branchName = lang === 'hi' ? 'कृपया शाखा का नाम लिखें।' : 'Branch name is required.';
    }
    if (fieldSettings.showBcLocation && fieldSettings.bcLocationRequired && !bcLocation.trim()) {
      errors.bcLocation = lang === 'hi' ? 'कृपया BC केंद्र का स्थान लिखें।' : 'BC location is required.';
    }
    
    if (!koId.trim()) {
      errors.koId = lang === 'hi' ? 'कृपया KO ID / CSP ID दर्ज करें।' : 'KO ID is required.';
    }
    
    if (!name.trim()) {
      errors.name = lang === 'hi' ? 'कृपया संचालक का नाम लिखें।' : 'Name is required.';
    }

    if (!mobileNo || mobileNo.length < 10) {
      errors.mobileNo = lang === 'hi' ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' : 'Valid 10-digit mobile number required.';
    }

    // AnyDesk Mode Validation
    if (fieldSettings.anydeskMode === 'required') {
      const rawAnydesk = anydeskId.replace(/\s+/g, '');
      if (!rawAnydesk || rawAnydesk.length < 9) {
        errors.anydeskId = lang === 'hi' ? 'कृपया 9 या 10 अंकों का AnyDesk ID दर्ज करें।' : '9 or 10-digit AnyDesk ID required.';
      }
    }

    if (!fingerprintDevice.trim()) {
      errors.fingerprintDevice = lang === 'hi' ? 'कृपया फिंगरप्रिंट डिवाइस चुनें।' : 'Biometric device is required.';
    }

    if (fieldSettings.showDeviceSerial && fieldSettings.deviceSerialRequired && !deviceSerial.trim()) {
      errors.deviceSerial = lang === 'hi' ? 'कृपया डिवाइस का सीरियल नंबर लिखें।' : 'Device serial number is required.';
    }

    if (fieldSettings.showScreenshot && fieldSettings.screenshotRequired && !screenshotUrl) {
      errors.screenshot = lang === 'hi' ? 'कृपया एरर स्क्रीनशॉट अपलोड करें।' : 'Error screenshot is required.';
    }

    if (!problemDescription.trim() || problemDescription.trim().length < 5) {
      errors.problemDescription = lang === 'hi' ? 'कृपया समस्या का स्पष्ट विवरण लिखें (कम से कम 5 अक्षर)।' : 'Please describe the technical problem (min 5 chars).';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const firstErr = document.querySelector('.has-error');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);

    const ticketPayload: Ticket = {
      id: `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      state: state.trim(),
      district: district.trim(),
      bankName: bankName.trim(),
      branchName: branchName.trim() || "Main Branch",
      bcLocation: bcLocation.trim() || district.trim(),
      koId: koId.trim().toUpperCase(),
      name: name.trim(),
      mobileNo: mobileNo.trim(),
      anydeskId: anydeskId.trim() || "N/A",
      fingerprintDevice: fingerprintDevice.trim(),
      deviceSerial: deviceSerial ? deviceSerial.trim() : undefined,
      problemCategory,
      problemDescription: problemDescription.trim(),
      screenshotUrl,
      urgency,
      status: "pending",
      whatsappNotified: false,
      syncedFromOffline: !isOnline
    };

    if (!isOnline) {
      saveOfflineTicket(ticketPayload);
      setCreatedTicket(ticketPayload);
      onTicketSubmitted(ticketPayload);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketPayload)
      });

      const data = await res.json();
      if (data.success && data.ticket) {
        setCreatedTicket(data.ticket);
        onTicketSubmitted(data.ticket);
      } else {
        saveOfflineTicket(ticketPayload);
        setCreatedTicket(ticketPayload);
        onTicketSubmitted(ticketPayload);
      }
    } catch (err) {
      console.error("Network error during ticket submission, storing offline:", err);
      saveOfflineTicket(ticketPayload);
      setCreatedTicket(ticketPayload);
      onTicketSubmitted(ticketPayload);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setBranchName("");
    setBcLocation("");
    setKoId("");
    setName("");
    setMobileNo("");
    setAnydeskId("");
    setDeviceSerial("");
    setProblemDescription("");
    setScreenshotUrl(undefined);
    setFormErrors({});
    setCreatedTicket(null);
  };

  // Selected problem category metadata
  const selectedCategoryObj = activeCategories.find(c => c.id === problemCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Live Notice Banner from Admin */}
      {announcement?.enabled && (
        <div className={`p-4 rounded-2xl border flex items-start space-x-3 shadow-xs animate-in fade-in duration-300 ${
          announcement.type === 'urgent'
            ? 'bg-rose-50 border-rose-200 text-rose-950'
            : announcement.type === 'warning'
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : announcement.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : 'bg-blue-50 border-blue-200 text-blue-950'
        }`}>
          <div className={`p-2 rounded-xl shrink-0 ${
            announcement.type === 'urgent' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
          }`}>
            <Megaphone className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs sm:text-sm">
                {lang === 'hi' ? announcement.titleHi : announcement.titleEn}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/80 text-slate-800 border border-slate-200">
                LIVE NOTICE
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              {lang === 'hi' ? announcement.messageHi : announcement.messageEn}
            </p>
          </div>
        </div>
      )}

      {/* Success Modal / Card after Submission */}
      {createdTicket ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200 mb-2">
            {createdTicket.id}
          </span>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            {lang === 'hi' ? 'सपोर्ट टिकट सफलतापूर्वक दर्ज हो गया!' : 'Support Ticket Submitted Successfully!'}
          </h2>

          <p className="text-sm text-slate-600 max-w-lg mx-auto mt-2">
            {lang === 'hi'
              ? `नमस्ते ${createdTicket.name} जी (KO ID: ${createdTicket.koId})! आपका टिकट हमारे सेंट्रल एडमिन सपोर्ट डेस्क पर भेज दिया गया है।`
              : `Hello ${createdTicket.name} (KO ID: ${createdTicket.koId})! Your ticket is now registered on the central technical queue.`}
          </p>

          {/* WhatsApp Direct Action Banner */}
          <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 max-w-xl mx-auto text-left">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500 text-white shrink-0 mt-0.5">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-emerald-950">
                  {lang === 'hi' ? 'व्हाट्सएप पर सहायता सूचना भेजें / प्राप्त करें' : 'WhatsApp Notification & Support Chat'}
                </h4>
                <p className="text-xs text-emerald-800 mt-1">
                  {lang === 'hi' 
                    ? `टिकट की रसीद अपने व्हाट्सएप पर सेव करने या सुपर एडमिन (मो. ${supportInfo.superAdminMobile}) को भेजने के लिए नीचे क्लिक करें:`
                    : `Click below to launch WhatsApp with pre-filled ticket details for instant team follow-up:`}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={getWhatsAppDirectUrl(createdTicket.mobileNo, generateTicketCreatedMessage(createdTicket, lang))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer"
                    id="whatsapp-share-btn"
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    {lang === 'hi' ? 'व्हाट्सएप पर शेयर करें' : 'Open in WhatsApp'}
                  </a>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateTicketCreatedMessage(createdTicket, lang));
                      alert(lang === 'hi' ? 'व्हाट्सएप संदेश क्लिपबोर्ड में कॉपी हो गया!' : 'WhatsApp text copied to clipboard!');
                    }}
                    className="inline-flex items-center px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-300 transition cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 mr-1.5" />
                    {lang === 'hi' ? 'संदेश कॉपी करें' : 'Copy Message'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary Card */}
          <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-left max-w-xl mx-auto text-xs grid grid-cols-2 gap-3 text-slate-700">
            <div>
              <span className="text-slate-400 block font-medium">Bank:</span>
              <span className="font-semibold text-slate-900">{createdTicket.bankName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Device:</span>
              <span className="font-semibold text-slate-900">{createdTicket.fingerprintDevice}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">AnyDesk ID:</span>
              <span className="font-mono font-bold text-blue-700">{createdTicket.anydeskId}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Mobile:</span>
              <span className="font-semibold text-slate-900">+91 {createdTicket.mobileNo}</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center space-x-3">
            <button
              onClick={handleReset}
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {lang === 'hi' ? 'अन्य नया टिकट दर्ज करें' : 'Submit Another Ticket'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" id="ticket-form">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 mb-2">
                  {lang === 'hi' ? 'Megnot त्वरित सहायता फॉर्म' : 'Megnot Fast-Track Form'}
                </span>
                <h2 className="text-lg sm:text-xl font-bold font-display">
                  {t.formHeading}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                  {t.formSubheading}
                </p>
              </div>

              {/* AI Quick Advice Button (Conditional on Config) */}
              {fieldSettings.allowSelfHelpAi && (
                <button
                  type="button"
                  onClick={() => onOpenAiHelp({ bank: bankName, device: fingerprintDevice, problem: problemDescription, category: problemCategory })}
                  className="inline-flex items-center px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-xs transition hover:scale-105 cursor-pointer shrink-0"
                  id="ai-quick-fix-btn"
                >
                  <Sparkles className="w-4 h-4 mr-1.5 text-slate-950" />
                  {t.launchAiHelp}
                </button>
              )}
            </div>
          </div>

          {/* Section 1: CSP & Location Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">
                {t.secCspDetails}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* State */}
              <div className={formErrors.state ? 'has-error' : ''}>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.stateLabel} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  id="input-state"
                >
                  {Object.keys(activeStatesDistricts).map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                {formErrors.state && <p className="text-[11px] text-rose-500 mt-1">{formErrors.state}</p>}
              </div>

              {/* District */}
              <div className={formErrors.district ? 'has-error' : ''}>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.districtLabel} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  id="input-district"
                >
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {formErrors.district && <p className="text-[11px] text-rose-500 mt-1">{formErrors.district}</p>}
              </div>

              {/* Bank Name (Dynamic List) */}
              <div className={`sm:col-span-2 ${formErrors.bankName ? 'has-error' : ''}`}>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{t.bankLabel} <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">({activeBanks.length} Banks)</span>
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  id="input-bank-name"
                >
                  {activeBanks.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                {formErrors.bankName && <p className="text-[11px] text-rose-500 mt-1">{formErrors.bankName}</p>}
              </div>

              {/* Branch Name (Conditional) */}
              {fieldSettings.showBranchName && (
                <div className={formErrors.branchName ? 'has-error' : ''}>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.branchLabel} {fieldSettings.branchNameRequired && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder={t.branchPlaceholder}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    id="input-branch-name"
                  />
                  {formErrors.branchName && <p className="text-[11px] text-rose-500 mt-1">{formErrors.branchName}</p>}
                </div>
              )}

              {/* BC Location (Conditional) */}
              {fieldSettings.showBcLocation && (
                <div className={formErrors.bcLocation ? 'has-error' : ''}>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.bcLocationLabel} {fieldSettings.bcLocationRequired && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={bcLocation}
                    onChange={(e) => setBcLocation(e.target.value)}
                    placeholder={t.bcLocationPlaceholder}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    id="input-bc-location"
                  />
                  {formErrors.bcLocation && <p className="text-[11px] text-rose-500 mt-1">{formErrors.bcLocation}</p>}
                </div>
              )}

              {/* KO ID */}
              <div className={formErrors.koId ? 'has-error' : ''}>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.koIdLabel} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={koId}
                  onChange={(e) => setKoId(e.target.value.toUpperCase())}
                  placeholder={t.koIdPlaceholder}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-blue-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  id="input-ko-id"
                />
                {formErrors.koId && <p className="text-[11px] text-rose-500 mt-1">{formErrors.koId}</p>}
              </div>

              {/* Bank Mitra Name */}
              <div className={formErrors.name ? 'has-error' : ''}>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.nameLabel} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  id="input-name"
                />
                {formErrors.name && <p className="text-[11px] text-rose-500 mt-1">{formErrors.name}</p>}
              </div>

              {/* Mobile Number */}
              <div className={`sm:col-span-2 ${formErrors.mobileNo ? 'has-error' : ''}`}>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.mobileLabel} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-xs font-bold">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={mobileNo}
                    onChange={(e) => handleMobileChange(e.target.value)}
                    placeholder={t.mobilePlaceholder}
                    className="w-full pl-12 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    id="input-mobile-no"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {t.mobileHelp}
                </p>
                {formErrors.mobileNo && <p className="text-[11px] text-rose-500 mt-1">{formErrors.mobileNo}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Biometric Device & AnyDesk ID */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Fingerprint className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">
                {t.secDeviceDetails}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Biometric Device (Dynamic List) */}
              <div className={formErrors.fingerprintDevice ? 'has-error' : ''}>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.deviceLabel} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={fingerprintDevice}
                  onChange={(e) => setFingerprintDevice(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  id="input-fingerprint-device"
                >
                  {activeDevices.map((dev) => (
                    <option key={dev.id || dev.name} value={dev.name}>{dev.name} ({dev.vendor})</option>
                  ))}
                </select>
                {formErrors.fingerprintDevice && <p className="text-[11px] text-rose-500 mt-1">{formErrors.fingerprintDevice}</p>}
              </div>

              {/* AnyDesk ID (Dynamic Visibility / Mode) */}
              {fieldSettings.anydeskMode !== 'hidden' && (
                <div className={formErrors.anydeskId ? 'has-error' : ''}>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>
                      {t.anydeskLabel} {fieldSettings.anydeskMode === 'required' && <span className="text-rose-500">*</span>}
                    </span>
                    <span className="text-[10px] text-blue-600 font-normal">
                      {fieldSettings.anydeskMode === 'required' ? 'Mandatory for Remote' : 'Optional'}
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-rose-500">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={anydeskId}
                      onChange={(e) => handleAnydeskChange(e.target.value)}
                      placeholder={t.anydeskPlaceholder}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold tracking-wider text-rose-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
                      id="input-anydesk-id"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {t.anydeskHelp}
                  </p>
                  {formErrors.anydeskId && <p className="text-[11px] text-rose-500 mt-1">{formErrors.anydeskId}</p>}
                </div>
              )}

              {/* Device Serial (Conditional) */}
              {fieldSettings.showDeviceSerial && (
                <div className={`sm:col-span-2 ${formErrors.deviceSerial ? 'has-error' : ''}`}>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.deviceSerialLabel} {fieldSettings.deviceSerialRequired && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={deviceSerial}
                    onChange={(e) => setDeviceSerial(e.target.value)}
                    placeholder={t.deviceSerialPlaceholder}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    id="input-device-serial"
                  />
                  {formErrors.deviceSerial && <p className="text-[11px] text-rose-500 mt-1">{formErrors.deviceSerial}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Technical Problem Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">
                {t.secProblemDetails}
              </h3>
            </div>

            {/* Quick Category Chips (Dynamic List) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {t.categoryLabel} <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeCategories.map((cat) => {
                  const isSelected = problemCategory === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`p-2.5 rounded-xl text-left text-xs font-medium transition flex items-start space-x-2 border cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-500 text-blue-950 font-bold shadow-xs' 
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isSelected ? 'bg-blue-600' : 'bg-slate-300'}`}></span>
                      <span className="leading-tight">{lang === 'hi' ? cat.hi : cat.en}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Suggested Fix Banner for selected Category */}
            {selectedCategoryObj && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start space-x-2.5 text-xs text-amber-900">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">
                    {lang === 'hi' ? 'त्वरित सलाह (Quick Tip): ' : 'Quick Troubleshooting Tip: '}
                  </span>
                  <span>{lang === 'hi' ? selectedCategoryObj.suggestedFixHi : selectedCategoryObj.suggestedFixEn}</span>
                </div>
              </div>
            )}

            {/* Problem Description TextArea */}
            <div className={formErrors.problemDescription ? 'has-error' : ''}>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.problemDescLabel} <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder={t.problemDescPlaceholder}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                id="input-problem-desc"
              ></textarea>
              <p className="text-[11px] text-slate-500 mt-1">
                {t.problemDescHelp}
              </p>
              {formErrors.problemDescription && <p className="text-[11px] text-rose-500 mt-1">{formErrors.problemDescription}</p>}
            </div>

            {/* Urgency & Screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {fieldSettings.showUrgencySelection && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.urgencyLabel}
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as TicketUrgency)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    id="input-urgency"
                  >
                    <option value="low">{t.urgencyLow}</option>
                    <option value="normal">{t.urgencyNormal}</option>
                    <option value="high">{t.urgencyHigh}</option>
                    <option value="critical">{t.urgencyCritical}</option>
                  </select>
                </div>
              )}

              {fieldSettings.showScreenshot && (
                <div className={formErrors.screenshot ? 'has-error' : ''}>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.screenshotLabel} {fieldSettings.screenshotRequired && <span className="text-rose-500">*</span>}
                  </label>
                  {screenshotUrl ? (
                    <div className="relative inline-block border border-slate-200 rounded-xl overflow-hidden">
                      <img src={screenshotUrl} alt="Error screenshot" className="h-20 w-auto object-cover" />
                      <button
                        type="button"
                        onClick={() => setScreenshotUrl(undefined)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center px-4 py-2.5 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl bg-slate-50 hover:bg-blue-50/50 cursor-pointer transition text-xs font-medium text-slate-600">
                      <Upload className="w-4 h-4 mr-2 text-slate-400" />
                      <span>{t.uploadScreenshot}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="input-screenshot-file"
                      />
                    </label>
                  )}
                  {formErrors.screenshot && <p className="text-[11px] text-rose-500 mt-1">{formErrors.screenshot}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Direct WhatsApp Assistance Quick Button on Form */}
          {supportInfo.showWhatsAppQuickHelp && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3 text-emerald-950">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block">
                    {lang === 'hi' ? 'क्या आपको तत्काल सहायता चाहिए?' : 'Need Immediate Assistance?'}
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    {lang === 'hi' 
                      ? `सेंट्रल डेस्क / सुपर एडमिन (+91 ${supportInfo.superAdminMobile}) से सीधे WhatsApp पर चैट करें`
                      : `Chat directly with Central Desk / Super Admin (+91 ${supportInfo.superAdminMobile}) on WhatsApp`}
                  </span>
                </div>
              </div>
              <a
                href={`https://wa.me/91${supportInfo.superAdminMobile}?text=${encodeURIComponent(`नमस्ते Megnot Central Desk! मुझे बैंकिंग कियोस्क सहायता चाहिए।`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center space-x-1.5 shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Helpline</span>
              </a>
            </div>
          )}

          {/* Submit Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              {t.clearForm}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
              id="btn-submit-ticket"
            >
              <Send className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>
                {isSubmitting
                  ? t.submittingTicket
                  : isOnline
                  ? t.submitTicket
                  : t.saveOffline}
              </span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
