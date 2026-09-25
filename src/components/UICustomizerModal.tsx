import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  X, 
  Building2, 
  Fingerprint, 
  AlertTriangle, 
  MapPin, 
  Megaphone, 
  Settings2, 
  PhoneCall, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { 
  Language, 
  UIConfig, 
  BiometricDeviceConfig, 
  ProblemCategoryConfig, 
  QuickFaqConfig, 
  TicketUrgency 
} from '../types';
import { DEFAULT_UI_CONFIG } from '../data/constants';

interface UICustomizerModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  currentConfig?: UIConfig;
  onSaveConfig?: (updated: UIConfig) => Promise<boolean>;
  onResetDefaults?: () => Promise<boolean>;
  onConfigUpdated?: () => void;
}

type TabType = 'banks' | 'devices' | 'issues' | 'states' | 'banner' | 'fields' | 'support' | 'faqs';

export const UICustomizerModal: React.FC<UICustomizerModalProps> = ({
  lang,
  isOpen,
  onClose,
  currentConfig,
  onSaveConfig,
  onResetDefaults,
  onConfigUpdated
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<TabType>('banks');
  const [config, setConfig] = useState<UIConfig>(() => {
    try {
      const source = currentConfig || DEFAULT_UI_CONFIG;
      return JSON.parse(JSON.stringify(source));
    } catch {
      return DEFAULT_UI_CONFIG;
    }
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state ONLY when modal OPENS, prevent background poll clobbering user edits
  useEffect(() => {
    if (isOpen) {
      try {
        const source = currentConfig || DEFAULT_UI_CONFIG;
        setConfig(JSON.parse(JSON.stringify(source)));
        setErrorMsg(null);
        setSaveSuccess(false);
      } catch {
        setConfig(DEFAULT_UI_CONFIG);
      }
    }
  }, [isOpen]);

  // Central save helper with instant optimistic feedback, SSE broadcast & localStorage sync
  const persistConfig = async (newConfig: UIConfig, showSuccessToast: boolean = false): Promise<boolean> => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      let ok = false;
      if (onSaveConfig) {
        ok = await onSaveConfig(newConfig);
      } else {
        const res = await fetch('/api/config/ui', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config: newConfig })
        });
        const data = await res.json();
        ok = !!data.success;
      }

      if (ok) {
        try {
          localStorage.setItem('megnot_ui_config', JSON.stringify(newConfig));
        } catch {}
        if (showSuccessToast) {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        }
        if (onConfigUpdated) onConfigUpdated();
        return true;
      } else {
        setErrorMsg(lang === 'hi' ? 'सेव करने में त्रुटि हुई।' : 'Failed to save configuration.');
        return false;
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error saving configuration');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Filter & Search states
  const [bankSearch, setBankSearch] = useState<string>('');
  const [newBankName, setNewBankName] = useState<string>('');

  // New Device Form
  const [newDevName, setNewDevName] = useState<string>('');
  const [newDevDriver, setNewDevDriver] = useState<string>('');
  const [newDevVendor, setNewDevVendor] = useState<string>('');

  // New Problem Form
  const [newProblemEn, setNewProblemEn] = useState<string>('');
  const [newProblemHi, setNewProblemHi] = useState<string>('');
  const [newProblemFixEn, setNewProblemFixEn] = useState<string>('');
  const [newProblemFixHi, setNewProblemFixHi] = useState<string>('');

  // State & District Form
  const [selectedState, setSelectedState] = useState<string>(() => Object.keys(config.statesDistricts)[0] || 'Uttar Pradesh');
  const [newStateName, setNewStateName] = useState<string>('');
  const [newDistrictName, setNewDistrictName] = useState<string>('');

  // New FAQ Form
  const [newFaqQEn, setNewFaqQEn] = useState<string>('');
  const [newFaqQHi, setNewFaqQHi] = useState<string>('');
  const [newFaqAEn, setNewFaqAEn] = useState<string>('');
  const [newFaqAHi, setNewFaqAHi] = useState<string>('');

  // --- Handlers: Banks ---
  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newBankName.trim();
    if (!val) return;
    if (config.banks.some(b => b.toLowerCase() === val.toLowerCase())) {
      setErrorMsg(lang === 'hi' ? 'यह बैंक पहले से लिस्ट में मौजूद है।' : 'Bank already exists in list.');
      return;
    }
    const updated = [val, ...config.banks];
    const newCfg = { ...config, banks: updated };
    setConfig(newCfg);
    setNewBankName('');
    setErrorMsg(null);
    persistConfig(newCfg, true);
  };

  const handleRemoveBank = (bankToRemove: string) => {
    if (config.banks.length <= 1) {
      setErrorMsg(lang === 'hi' ? 'कम से कम एक बैंक लिस्ट में रहना आवश्यक है।' : 'At least one bank must remain in list.');
      return;
    }
    const updated = config.banks.filter(b => b !== bankToRemove);
    const newCfg = { ...config, banks: updated };
    setConfig(newCfg);
    setErrorMsg(null);
    persistConfig(newCfg, true);
  };

  // --- Handlers: Devices ---
  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newDevName.trim();
    if (!name) return;
    const newDev: BiometricDeviceConfig = {
      id: `dev-custom-${Date.now()}`,
      name,
      driverInfo: newDevDriver.trim() || 'Custom Biometric RD Service Driver',
      vendor: newDevVendor.trim() || 'Custom',
      isCustom: true
    };
    const updated = [newDev, ...config.devices];
    const newCfg = { ...config, devices: updated };
    setConfig(newCfg);
    setNewDevName('');
    setNewDevDriver('');
    setNewDevVendor('');
    setErrorMsg(null);
    persistConfig(newCfg, true);
  };

  const handleRemoveDevice = (devId: string) => {
    if (config.devices.length <= 1) {
      setErrorMsg(lang === 'hi' ? 'कम से कम एक डिवाइस रहना आवश्यक है।' : 'At least one device must remain in list.');
      return;
    }
    const updated = config.devices.filter(d => d.id !== devId);
    const newCfg = { ...config, devices: updated };
    setConfig(newCfg);
    setErrorMsg(null);
    persistConfig(newCfg, true);
  };

  // --- Handlers: Issues / Categories ---
  const handleAddProblem = (e: React.FormEvent) => {
    e.preventDefault();
    const en = newProblemEn.trim();
    const hi = newProblemHi.trim();
    if (!en || !hi) {
      setErrorMsg(lang === 'hi' ? 'कृपया अंग्रेजी और हिंदी दोनों नाम दर्ज करें।' : 'Please enter both English and Hindi titles.');
      return;
    }
    const newCat: ProblemCategoryConfig = {
      id: `cat_custom_${Date.now()}`,
      en,
      hi,
      icon: 'AlertCircle',
      suggestedFixEn: newProblemFixEn.trim() || 'Please keep AnyDesk connected and contact the helpdesk.',
      suggestedFixHi: newProblemFixHi.trim() || 'कृपया AnyDesk चालू रखें और तकनीकी डेस्क से संपर्क करें।',
      isCustom: true
    };
    const updated = [...config.problemCategories, newCat];
    const newCfg = { ...config, problemCategories: updated };
    setConfig(newCfg);
    setNewProblemEn('');
    setNewProblemHi('');
    setNewProblemFixEn('');
    setNewProblemFixHi('');
    setErrorMsg(null);
    persistConfig(newCfg, true);
  };

  const handleRemoveProblem = (catId: string) => {
    if (config.problemCategories.length <= 1) {
      setErrorMsg(lang === 'hi' ? 'कम से कम एक समस्या श्रेणी रहनी चाहिए।' : 'At least one category must remain.');
      return;
    }
    const updated = config.problemCategories.filter(c => c.id !== catId);
    const newCfg = { ...config, problemCategories: updated };
    setConfig(newCfg);
    setErrorMsg(null);
    persistConfig(newCfg, true);
  };

  // --- Handlers: States & Districts ---
  const handleAddState = (e: React.FormEvent) => {
    e.preventDefault();
    const st = newStateName.trim();
    if (!st) return;
    if (config.statesDistricts[st]) {
      setErrorMsg(lang === 'hi' ? 'यह राज्य पहले से मौजूद है।' : 'State already exists.');
      return;
    }
    const updated = {
      ...config.statesDistricts,
      [st]: ['Main District', 'Headquarters']
    };
    const newCfg = { ...config, statesDistricts: updated };
    setConfig(newCfg);
    setSelectedState(st);
    setNewStateName('');
    setErrorMsg(null);
    persistConfig(newCfg, true);
  };

  const handleRemoveState = (stToRemove: string) => {
    const keys = Object.keys(config.statesDistricts);
    if (keys.length <= 1) {
      setErrorMsg(lang === 'hi' ? 'कम से कम एक राज्य रहना आवश्यक है।' : 'At least one state must remain.');
      return;
    }
    const updated = { ...config.statesDistricts };
    delete updated[stToRemove];
    const newCfg = { ...config, statesDistricts: updated };
    setConfig(newCfg);
    setSelectedState(Object.keys(updated)[0]);
    setErrorMsg(null);
    persistConfig(newCfg, true);
  };

  const handleAddDistrict = (e: React.FormEvent) => {
    e.preventDefault();
    const dist = newDistrictName.trim();
    if (!dist || !selectedState) return;
    const currentDistricts = config.statesDistricts[selectedState] || [];
    if (currentDistricts.includes(dist)) {
      setErrorMsg(lang === 'hi' ? 'यह ज़िला पहले से मौजूद है।' : 'District already exists.');
      return;
    }
    const updated = {
      ...config.statesDistricts,
      [selectedState]: [...currentDistricts, dist]
    };
    const newCfg = { ...config, statesDistricts: updated };
    setConfig(newCfg);
    setNewDistrictName('');
    setErrorMsg(null);
    persistConfig(newCfg, true);
  };

  const handleRemoveDistrict = (distToRemove: string) => {
    const currentDistricts = config.statesDistricts[selectedState] || [];
    if (currentDistricts.length <= 1) {
      setErrorMsg(lang === 'hi' ? 'राज्य में कम से कम 1 ज़िला होना चाहिए।' : 'State must have at least one district.');
      return;
    }
    const updated = {
      ...config.statesDistricts,
      [selectedState]: currentDistricts.filter(d => d !== distToRemove)
    };
    const newCfg = { ...config, statesDistricts: updated };
    setConfig(newCfg);
    setErrorMsg(null);
    persistConfig(newCfg, true);
  };

  // --- Handlers: FAQs ---
  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQHi.trim() || !newFaqAHi.trim()) {
      setErrorMsg(lang === 'hi' ? 'कृपया प्रश्न और उत्तर दर्ज करें।' : 'Please enter question and answer.');
      return;
    }
    const newFaq: QuickFaqConfig = {
      id: `faq-${Date.now()}`,
      questionHi: newFaqQHi.trim(),
      questionEn: newFaqQEn.trim() || newFaqQHi.trim(),
      answerHi: newFaqAHi.trim(),
      answerEn: newFaqAEn.trim() || newFaqAHi.trim()
    };
    const newCfg = { ...config, quickFaqs: [...config.quickFaqs, newFaq] };
    setConfig(newCfg);
    setNewFaqQHi('');
    setNewFaqQEn('');
    setNewFaqAHi('');
    setNewFaqAEn('');
    setErrorMsg(null);
    persistConfig(newCfg, true);
  };

  const handleRemoveFaq = (faqId: string) => {
    const newCfg = { ...config, quickFaqs: config.quickFaqs.filter(f => f.id !== faqId) };
    setConfig(newCfg);
    persistConfig(newCfg, true);
  };

  // --- Master Save & Reset ---
  const handleSaveAll = async (closeAfterSave: boolean = false) => {
    const shouldClose = closeAfterSave === true;
    const success = await persistConfig(config, true);
    if (success && shouldClose) {
      setTimeout(() => onClose(), 400);
    }
  };

  const handleResetToDefaults = async () => {
    const confirmMsg = lang === 'hi' 
      ? 'क्या आप निश्चित हैं कि आप सभी यूज़र इंटरफेस सेटिंग्स, बैंक लिस्ट और फील्ड्स को डिफ़ॉल्ट पर रीसेट करना चाहते हैं?'
      : 'Are you sure you want to reset all UI settings, banks, devices and fields to factory defaults?';
    if (!window.confirm(confirmMsg)) return;

    setIsSaving(true);
    try {
      let ok = false;
      if (onResetDefaults) {
        ok = await onResetDefaults();
      } else {
        const res = await fetch('/api/config/ui/reset', {
          method: 'POST'
        });
        const data = await res.json();
        ok = !!data.success;
      }

      if (ok) {
        setConfig(JSON.parse(JSON.stringify(DEFAULT_UI_CONFIG)));
        if (onConfigUpdated) onConfigUpdated();
        onClose();
      } else {
        setErrorMsg(lang === 'hi' ? 'रीसेट करने में त्रुटि हुई।' : 'Failed to reset configuration.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error resetting configuration');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered Banks
  const filteredBanks = config.banks.filter(b => b.toLowerCase().includes(bankSearch.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl my-6 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold">
                  {lang === 'hi' ? 'यूज़र इंटरफेस नियंत्रण व कस्टमाइज़र' : 'User Interface Customizer & Control Suite'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500 text-white uppercase tracking-wider">
                  Admin Power
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'hi' 
                  ? 'बैंक लिस्ट, डिवाइस, समस्या श्रेणियां, लाइव अलर्ट व फ़ॉर्म फील्ड्स को जोड़ें या हटाएं।'
                  : 'Add or remove banks, biometric devices, issue categories, notice banners, and form fields.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {saveSuccess && (
          <div className="px-6 py-2.5 bg-emerald-500 text-white text-xs font-bold flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'hi' ? 'सफलता: यूज़र इंटरफेस सेटिंग्स तुरंत अपडेट व लागू हो गई हैं!' : 'Success: UI configuration applied and live on user interface!'}</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="px-6 py-2.5 bg-rose-500 text-white text-xs font-bold flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-white hover:underline text-xs">Dismiss</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 flex items-center space-x-1 overflow-x-auto shrink-0 py-2">
          {[
            { id: 'banks', labelHi: 'बैंक लिस्ट', labelEn: 'Banks List', icon: Building2, count: config.banks.length },
            { id: 'devices', labelHi: 'बायोमेट्रिक डिवाइस', labelEn: 'Biometric Devices', icon: Fingerprint, count: config.devices.length },
            { id: 'issues', labelHi: 'समस्या श्रेणियां', labelEn: 'Issue Categories', icon: AlertTriangle, count: config.problemCategories.length },
            { id: 'states', labelHi: 'राज्य व ज़िले', labelEn: 'States & Districts', icon: MapPin, count: Object.keys(config.statesDistricts).length },
            { id: 'banner', labelHi: 'लाइव नोटिस पट्टी', labelEn: 'Notice Banner', icon: Megaphone, active: config.announcement.enabled },
            { id: 'fields', labelHi: 'फ़ॉर्म फील्ड्स', labelEn: 'Form Fields Rules', icon: Settings2 },
            { id: 'support', labelHi: 'हेल्पलाइन व संपर्क', labelEn: 'Hotline & Contact', icon: PhoneCall },
            { id: 'faqs', labelHi: 'सहायता FAQ', labelEn: 'Self-Help FAQs', icon: HelpCircle, count: config.quickFaqs.length }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? tab.labelHi : tab.labelEn}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.active && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Live Banner Active" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: BANKS MANAGEMENT */}
          {activeTab === 'banks' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center space-x-1.5">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>{lang === 'hi' ? 'नया बैंक जोड़ें (Add New Bank to Dropdown)' : 'Add New Bank to Dropdown'}</span>
                </h4>
                <form onSubmit={handleAddBank} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    placeholder={lang === 'hi' ? 'बैंक का नाम दर्ज करें (उदा. Aryavart Bank CSP)' : 'Enter Bank Name (e.g. Aryavart Bank CSP)'}
                    className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? 'बैंक जोड़ें' : 'Add Bank'}</span>
                  </button>
                </form>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                    <span>{lang === 'hi' ? `वर्तमान बैंक लिस्ट (${config.banks.length})` : `Active Banks (${config.banks.length})`}</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      {lang === 'hi' ? '(यूज़र टिकट फ़ॉर्म में दिखने वाले बैंक)' : '(Visible on Kiosk Ticket Form)'}
                    </span>
                  </div>
                  <div className="relative w-48 sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                      placeholder={lang === 'hi' ? 'बैंक खोजें...' : 'Search banks...'}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                  {filteredBanks.map((bank, idx) => (
                    <div 
                      key={bank}
                      className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between hover:border-blue-300 transition shadow-2xs group"
                    >
                      <div className="flex items-center space-x-2 overflow-hidden pr-2">
                        <span className="text-[10px] font-mono text-slate-400 shrink-0 w-5">#{idx + 1}</span>
                        <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 truncate" title={bank}>{bank}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBank(bank)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition opacity-80 group-hover:opacity-100 cursor-pointer"
                        title={lang === 'hi' ? 'हटाएं' : 'Remove Bank'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {filteredBanks.length === 0 && (
                    <div className="col-span-full py-8 text-center text-xs text-slate-500">
                      {lang === 'hi' ? 'कोई बैंक नहीं मिला।' : 'No banks found matching search.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BIOMETRIC DEVICES */}
          {activeTab === 'devices' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>{lang === 'hi' ? 'नया बायोमेट्रिक / डिवाइस जोड़ें' : 'Add New Biometric / Peripheral Device'}</span>
                </h4>
                <form onSubmit={handleAddDevice} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {lang === 'hi' ? 'डिवाइस का नाम' : 'Device Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={newDevName}
                      onChange={(e) => setNewDevName(e.target.value)}
                      placeholder="e.g. Mantra MFS110 L1"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {lang === 'hi' ? 'ड्राइवर / RD सर्विस विवरण' : 'Driver / RD Service Info'}
                    </label>
                    <input
                      type="text"
                      value={newDevDriver}
                      onChange={(e) => setNewDevDriver(e.target.value)}
                      placeholder="e.g. RD Service v1.0.0.4 Port 11100"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {lang === 'hi' ? 'कंपनी / वेंडर' : 'Manufacturer / Vendor'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newDevVendor}
                        onChange={(e) => setNewDevVendor(e.target.value)}
                        placeholder="e.g. Mantra Softech"
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition shadow-xs shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'जोड़ें' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-800 mb-3">
                  {lang === 'hi' ? `उपलब्ध डिवाइसेज (${config.devices.length})` : `Available Devices (${config.devices.length})`}
                </div>
                <div className="space-y-2 max-h-[380px] overflow-y-auto">
                  {config.devices.map((dev, idx) => (
                    <div
                      key={dev.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between hover:border-blue-300 transition shadow-2xs"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Fingerprint className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900">{dev.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {dev.vendor}
                            </span>
                            {dev.isCustom && (
                              <span className="px-1.5 py-0.2 rounded-md text-[9px] font-extrabold bg-blue-100 text-blue-800">
                                CUSTOM
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">{dev.driverInfo}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDevice(dev.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title={lang === 'hi' ? 'डिवाइस हटाएं' : 'Remove Device'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROBLEM CATEGORIES & QUICK FIXES */}
          {activeTab === 'issues' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>{lang === 'hi' ? 'नई समस्या श्रेणी व तुरंत समाधान जोड़ें' : 'Add New Problem Category & Instant Fix Steps'}</span>
                </h4>
                <form onSubmit={handleAddProblem} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        {lang === 'hi' ? 'समस्या का नाम (हिंदी)' : 'Issue Title (Hindi)'} *
                      </label>
                      <input
                        type="text"
                        required
                        value={newProblemHi}
                        onChange={(e) => setNewProblemHi(e.target.value)}
                        placeholder="उदा. बायोमेट्रिक लाइट जल रही है पर स्कैन नहीं हो रहा"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        {lang === 'hi' ? 'समस्या का नाम (English)' : 'Issue Title (English)'} *
                      </label>
                      <input
                        type="text"
                        required
                        value={newProblemEn}
                        onChange={(e) => setNewProblemEn(e.target.value)}
                        placeholder="e.g. Biometric sensor light ON but fingerprint not capturing"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        {lang === 'hi' ? 'त्वरित समाधान टिप्स (हिंदी)' : 'Suggested Instant Fix (Hindi)'}
                      </label>
                      <input
                        type="text"
                        value={newProblemFixHi}
                        onChange={(e) => setNewProblemFixHi(e.target.value)}
                        placeholder="उदा. सेंसर ग्लास साफ़ करें और RD सर्विस रीस्टार्ट करें।"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        {lang === 'hi' ? 'त्वरित समाधान टिप्स (English)' : 'Suggested Instant Fix (English)'}
                      </label>
                      <input
                        type="text"
                        value={newProblemFixEn}
                        onChange={(e) => setNewProblemFixEn(e.target.value)}
                        placeholder="e.g. Clean sensor glass with dry cloth and restart RD service."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'समस्या श्रेणी जोड़ें' : 'Add Category'}</span>
                    </button>
                  </div>
                </form>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-800 mb-3">
                  {lang === 'hi' ? `सक्रिय समस्या श्रेणियां (${config.problemCategories.length})` : `Active Issue Categories (${config.problemCategories.length})`}
                </div>
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
                  {config.problemCategories.map((cat, idx) => (
                    <div
                      key={cat.id}
                      className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-start justify-between hover:border-blue-300 transition shadow-2xs"
                    >
                      <div className="space-y-1 pr-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">{cat.hi}</span>
                          <span className="text-[11px] text-slate-500">/ {cat.en}</span>
                          {cat.isCustom && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800">
                              CUSTOM
                            </span>
                          )}
                        </div>
                        {cat.suggestedFixHi && (
                          <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 flex items-center space-x-1.5">
                            <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span><strong>सुझाव:</strong> {cat.suggestedFixHi}</span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProblem(cat.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0 mt-0.5"
                        title={lang === 'hi' ? 'हटाएं' : 'Remove Category'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STATES & DISTRICTS */}
          {activeTab === 'states' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Add State */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span>{lang === 'hi' ? 'नया राज्य जोड़ें (Add State)' : 'Add New State'}</span>
                  </h4>
                  <form onSubmit={handleAddState} className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newStateName}
                      onChange={(e) => setNewStateName(e.target.value)}
                      placeholder="e.g. Jharkhand, Delhi, etc."
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'राज्य जोड़ें' : 'Add State'}</span>
                    </button>
                  </form>
                </div>

                {/* Add District */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span>{lang === 'hi' ? `ज़िला जोड़ें (${selectedState})` : `Add District to (${selectedState})`}</span>
                  </h4>
                  <form onSubmit={handleAddDistrict} className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newDistrictName}
                      onChange={(e) => setNewDistrictName(e.target.value)}
                      placeholder="e.g. Deoria, Basti, etc."
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'ज़िला जोड़ें' : 'Add District'}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* State & District Explorer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* States Column */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-800 mb-2 px-1 flex items-center justify-between">
                    <span>{lang === 'hi' ? 'राज्य (States)' : 'States'}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{Object.keys(config.statesDistricts).length}</span>
                  </div>
                  <div className="space-y-1 max-h-[300px] overflow-y-auto">
                    {Object.keys(config.statesDistricts).map(st => (
                      <div
                        key={st}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          selectedState === st 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                        onClick={() => setSelectedState(st)}
                      >
                        <span className="truncate">{st}</span>
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                            selectedState === st ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {config.statesDistricts[st]?.length || 0}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveState(st);
                            }}
                            className={`p-1 rounded hover:text-rose-500 ${
                              selectedState === st ? 'text-blue-200 hover:bg-blue-700' : 'text-slate-400 hover:bg-slate-100'
                            }`}
                            title="Remove State"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Districts Column */}
                <div className="md:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-800 mb-2 px-1 flex items-center justify-between">
                    <span>
                      {lang === 'hi' ? `${selectedState} के ज़िले` : `Districts in ${selectedState}`}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {config.statesDistricts[selectedState]?.length || 0} districts
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-1">
                    {(config.statesDistricts[selectedState] || []).map(dist => (
                      <div
                        key={dist}
                        className="px-2.5 py-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between hover:border-blue-300 transition text-xs font-medium text-slate-800 shadow-2xs group"
                      >
                        <span className="truncate" title={dist}>{dist}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDistrict(dist)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition opacity-70 group-hover:opacity-100 cursor-pointer shrink-0"
                          title="Remove District"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NOTICE BANNER / ANNOUNCEMENT */}
          {activeTab === 'banner' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      {lang === 'hi' ? 'लाइव कियोस्क नोटिस पट्टी (Live Announcement Ticker)' : 'Live Kiosk Announcement Ticker'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {lang === 'hi' ? 'यह नोटिस यूजर टिकट फ़ॉर्म के ठीक ऊपर सभी ऑपरेटरों को दिखेगा।' : 'Displayed prominently at the top of the Kiosk operator ticket form.'}
                    </p>
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.announcement.enabled}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          announcement: { ...config.announcement, enabled: e.target.checked }
                        };
                        setConfig(updated);
                        persistConfig(updated, true);
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      {config.announcement.enabled ? 'सक्रिय (ACTIVE)' : 'निष्क्रिय (OFF)'}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {lang === 'hi' ? 'नोटिस प्रकार (Type)' : 'Banner Style / Type'}
                    </label>
                    <select
                      value={config.announcement.type}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        announcement: { ...prev.announcement, type: e.target.value as any }
                      }))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                    >
                      <option value="info">🔵 Information (नीला)</option>
                      <option value="urgent">🔴 Urgent / Emergency (लाल)</option>
                      <option value="warning">🟡 Warning / Alert (पीला)</option>
                      <option value="success">🟢 Success / Announcement (हरा)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {lang === 'hi' ? 'शीर्षक (हिंदी)' : 'Title (Hindi)'}
                    </label>
                    <input
                      type="text"
                      value={config.announcement.titleHi}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        announcement: { ...prev.announcement, titleHi: e.target.value }
                      }))}
                      placeholder="उदा. महत्वपूर्ण सूचना"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {lang === 'hi' ? 'शीर्षक (English)' : 'Title (English)'}
                    </label>
                    <input
                      type="text"
                      value={config.announcement.titleEn}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        announcement: { ...prev.announcement, titleEn: e.target.value }
                      }))}
                      placeholder="e.g. Important Notice"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {lang === 'hi' ? 'संदेश विवरण (हिंदी)' : 'Message Body (Hindi)'}
                    </label>
                    <textarea
                      rows={2}
                      value={config.announcement.messageHi}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        announcement: { ...prev.announcement, messageHi: e.target.value }
                      }))}
                      placeholder="कियोस्क ऑपरेटरों के लिए संदेश लिखें..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {lang === 'hi' ? 'संदेश विवरण (English)' : 'Message Body (English)'}
                    </label>
                    <textarea
                      rows={2}
                      value={config.announcement.messageEn}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        announcement: { ...prev.announcement, messageEn: e.target.value }
                      }))}
                      placeholder="Enter announcement text in English..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => persistConfig(config, true)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? 'लाइव नोटिस सहेजें व तुरंत लागू करें' : 'Save & Apply Notice Banner'}</span>
                  </button>
                </div>
              </div>

              {/* Live Preview Card */}
              <div>
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {lang === 'hi' ? 'लाइव पूर्वावलोकन (Live Banner Preview)' : 'Live Banner Preview'}
                </div>
                {config.announcement.enabled ? (
                  <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
                    config.announcement.type === 'urgent'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : config.announcement.type === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : config.announcement.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-blue-50 border-blue-200 text-blue-900'
                  }`}>
                    <Megaphone className={`w-5 h-5 shrink-0 mt-0.5 ${
                      config.announcement.type === 'urgent' ? 'text-rose-600' : 'text-blue-600'
                    }`} />
                    <div>
                      <div className="font-bold text-xs">
                        {lang === 'hi' ? config.announcement.titleHi : config.announcement.titleEn}
                      </div>
                      <p className="text-xs mt-0.5">
                        {lang === 'hi' ? config.announcement.messageHi : config.announcement.messageEn}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                    {lang === 'hi' ? 'नोटिस पट्टी वर्तमान में बंद है।' : 'Announcement banner is currently disabled.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: FORM FIELDS CONFIG */}
          {activeTab === 'fields' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
                  {lang === 'hi' ? 'फ़ॉर्म फील्ड्स नियंत्रण व अनिवार्यता (Form Field Rules)' : 'Form Field Rules & Visibility Controls'}
                </h4>

                {/* AnyDesk Mode */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-xl border border-slate-200 gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-900">AnyDesk ID Field Mode</span>
                    <p className="text-[11px] text-slate-500">
                      {lang === 'hi' ? 'AnyDesk आईडी अनिवार्य करें, वैकल्पिक रखें या छुपाएं।' : 'Set AnyDesk ID requirement on ticket form.'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {[
                      { val: 'required', labelHi: 'अनिवार्य (Required)', labelEn: 'Mandatory', color: 'text-rose-700 bg-rose-50 border-rose-200' },
                      { val: 'optional', labelHi: 'वैकल्पिक (Optional)', labelEn: 'Optional', color: 'text-blue-700 bg-blue-50 border-blue-200' },
                      { val: 'hidden', labelHi: 'छुपाएं (Hide)', labelEn: 'Hidden', color: 'text-slate-600 bg-slate-100 border-slate-200' }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...config,
                            formFields: { ...config.formFields, anydeskMode: opt.val as any }
                          };
                          setConfig(updated);
                          persistConfig(updated, true);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          config.formFields.anydeskMode === opt.val 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                            : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                        }`}
                      >
                        {lang === 'hi' ? opt.labelHi : opt.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Device Serial Number */}
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      {lang === 'hi' ? 'डिवाइस सीरियल नंबर (Device Serial Number)' : 'Device Serial Number'}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {lang === 'hi' ? 'कियोस्क ऑपरेटर से बायोमेट्रिक सीरियल नंबर मांगें।' : 'Ask operator for hardware serial number.'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={config.formFields.showDeviceSerial}
                        onChange={(e) => {
                          const updated = {
                            ...config,
                            formFields: { ...config.formFields, showDeviceSerial: e.target.checked }
                          };
                          setConfig(updated);
                          persistConfig(updated, true);
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span>Show Field</span>
                    </label>
                    {config.formFields.showDeviceSerial && (
                      <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-semibold text-rose-700">
                        <input
                          type="checkbox"
                          checked={config.formFields.deviceSerialRequired}
                          onChange={(e) => {
                            const updated = {
                              ...config,
                              formFields: { ...config.formFields, deviceSerialRequired: e.target.checked }
                            };
                            setConfig(updated);
                            persistConfig(updated, true);
                          }}
                          className="w-4 h-4 text-rose-600 rounded"
                        />
                        <span>Mandatory</span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Screenshot Upload */}
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      {lang === 'hi' ? 'स्क्रीनशॉट अपलोड (Screenshot Upload)' : 'Error Screenshot Upload'}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {lang === 'hi' ? 'एरर स्क्रीनशॉट अपलोड करने का विकल्प दें।' : 'Allow uploading error photo from mobile/PC.'}
                    </p>
                  </div>
                  <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={config.formFields.showScreenshot}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          formFields: { ...config.formFields, showScreenshot: e.target.checked }
                        };
                        setConfig(updated);
                        persistConfig(updated, true);
                      }}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>Show Upload Button</span>
                  </label>
                </div>

                {/* Branch Name & BC Location */}
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      {lang === 'hi' ? 'ब्रांच नाम व सीएसपी स्थान (Branch & Location)' : 'Branch & Location Fields'}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {lang === 'hi' ? 'लिंक ब्रांच और बीसी सेंटर का पता इनपुट करें।' : 'Collect link branch name and kiosk location.'}
                    </p>
                  </div>
                  <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={config.formFields.showBranchName}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          formFields: { 
                            ...config.formFields, 
                            showBranchName: e.target.checked,
                            showBcLocation: e.target.checked
                          }
                        };
                        setConfig(updated);
                        persistConfig(updated, true);
                      }}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>Show Location Fields</span>
                  </label>
                </div>

                {/* AI Self Help Diagnostic */}
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      {lang === 'hi' ? 'AI स्मार्ट डायग्नोस्टिक (AI Instant Fix Guidance)' : 'AI Smart Diagnostics on Form'}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {lang === 'hi' ? 'यूज़र को टिकट बनाने से पहले AI सुझाव देखने की अनुमति दें।' : 'Allow operators to get AI troubleshooting before filing.'}
                    </p>
                  </div>
                  <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-semibold text-emerald-700">
                    <input
                      type="checkbox"
                      checked={config.formFields.allowSelfHelpAi}
                      onChange={(e) => {
                        const updated = {
                          ...config,
                          formFields: { ...config.formFields, allowSelfHelpAi: e.target.checked }
                        };
                        setConfig(updated);
                        persistConfig(updated, true);
                      }}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>Active on Form</span>
                  </label>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => persistConfig(config, true)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? 'फ़ील्ड नियम सहेजें व तुरंत लागू करें' : 'Save & Apply Form Rules'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SUPPORT HOTLINE & CONTACTS */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2 flex items-center space-x-1.5">
                  <PhoneCall className="w-4 h-4 text-blue-600" />
                  <span>{lang === 'hi' ? 'हेल्पलाइन व सुपर एडमिन संपर्क नंबर' : 'Support Hotline & Super Admin Contact Details'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {lang === 'hi' ? 'सुपर एडमिन मोबाइल नंबर (Master Admin WhatsApp)' : 'Super Admin Mobile Number'} *
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-mono font-bold text-slate-700">
                        +91
                      </span>
                      <input
                        type="text"
                        required
                        value={config.supportInfo.superAdminMobile}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          supportInfo: { ...prev.supportInfo, superAdminMobile: e.target.value.replace(/\D/g, '') }
                        }))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {lang === 'hi' ? 'हेल्पलाइन फ़ोन नंबर' : 'Technical Helpline Number'}
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-mono font-bold text-slate-700">
                        +91
                      </span>
                      <input
                        type="text"
                        value={config.supportInfo.helplineNumber}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          supportInfo: { ...prev.supportInfo, helplineNumber: e.target.value.replace(/\D/g, '') }
                        }))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {lang === 'hi' ? 'सपोर्ट ईमेल (Support Email)' : 'Support Email'}
                    </label>
                    <input
                      type="email"
                      value={config.supportInfo.supportEmail}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        supportInfo: { ...prev.supportInfo, supportEmail: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {lang === 'hi' ? 'कार्य समय (Working Hours - Hindi)' : 'Working Hours (Hindi)'}
                    </label>
                    <input
                      type="text"
                      value={config.supportInfo.operatingHoursHi}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        supportInfo: { ...prev.supportInfo, operatingHoursHi: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-900">
                      {lang === 'hi' ? 'यूज़र स्क्रीन पर डायरेक्ट WhatsApp सपोर्ट बटन दिखाएं' : 'Show Direct WhatsApp Help Floating Button to Users'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.supportInfo.showWhatsAppQuickHelp}
                    onChange={(e) => {
                      const updated = {
                        ...config,
                        supportInfo: { ...config.supportInfo, showWhatsAppQuickHelp: e.target.checked }
                      };
                      setConfig(updated);
                      persistConfig(updated, true);
                    }}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => persistConfig(config, true)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? 'हेल्पलाइन व संपर्क जानकारी सहेजें' : 'Save & Apply Contact Info'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SELF-HELP FAQS */}
          {activeTab === 'faqs' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>{lang === 'hi' ? 'नया प्रश्नोत्तर / टिप्स जोड़ें (Add Self-Help FAQ)' : 'Add Self-Help FAQ / Guide'}</span>
                </h4>
                <form onSubmit={handleAddFaq} className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={newFaqQHi}
                      onChange={(e) => setNewFaqQHi(e.target.value)}
                      placeholder="प्रश्न (हिंदी) - उदा. Morpho 11100 एरर कैसे ठीक करें?"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={newFaqQEn}
                      onChange={(e) => setNewFaqQEn(e.target.value)}
                      placeholder="Question (English)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <textarea
                      rows={2}
                      required
                      value={newFaqAHi}
                      onChange={(e) => setNewFaqAHi(e.target.value)}
                      placeholder="समाधान (हिंदी) - चरणबद्ध तरीका लिखें..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      rows={2}
                      value={newFaqAEn}
                      onChange={(e) => setNewFaqAEn(e.target.value)}
                      placeholder="Answer / Steps (English)..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'FAQ जोड़ें' : 'Add FAQ'}</span>
                    </button>
                  </div>
                </form>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-800 mb-3">
                  {lang === 'hi' ? `सक्रिय FAQs (${config.quickFaqs.length})` : `Active FAQs (${config.quickFaqs.length})`}
                </div>
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
                  {config.quickFaqs.map(faq => (
                    <div
                      key={faq.id}
                      className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-start justify-between hover:border-blue-300 transition shadow-2xs"
                    >
                      <div className="space-y-1 pr-3">
                        <div className="text-xs font-bold text-slate-900">
                          {faq.questionHi}
                        </div>
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {faq.answerHi}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(faq.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0 mt-0.5"
                        title="Remove FAQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleResetToDefaults}
              disabled={isSaving}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 text-slate-700 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'डिफ़ॉल्ट सेटिंग्स पर रीसेट करें' : 'Reset to Defaults'}</span>
            </button>
            <span className="hidden sm:inline-flex items-center text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
              {lang === 'hi' ? 'स्वतः सहेजें व लाइव सिंक सक्रिय' : 'Live Auto-Sync Active'}
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              {lang === 'hi' ? 'बंद करें' : 'Close'}
            </button>
            <button
              type="button"
              onClick={() => handleSaveAll(true)}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              title="Save changes and close customizer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'hi' ? 'सहेजें व बंद करें' : 'Save & Close'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveAll(false)}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : lang === 'hi' ? 'सहेजें व तुरंत लागू करें' : 'Save & Apply to Live UI'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
