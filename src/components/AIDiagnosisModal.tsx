import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Monitor, 
  Fingerprint, 
  ExternalLink,
  Copy,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Language, AIDiagnosisResult } from '../types';
import { translations } from '../translations';
import { BIOMETRIC_DEVICES, PROBLEM_CATEGORIES, BANK_LIST } from '../data/constants';

interface AIDiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialContext?: {
    bank?: string;
    device?: string;
    problem?: string;
    category?: string;
  };
}

export const AIDiagnosisModal: React.FC<AIDiagnosisModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialContext
}) => {
  const t = translations[lang];

  const [selectedDevice, setSelectedDevice] = useState<string>(initialContext?.device || "Morpho MSO 1300 E3 (USB)");
  const [selectedBank, setSelectedBank] = useState<string>(initialContext?.bank || "State Bank of India (SBI Kiosk)");
  const [selectedCategory, setSelectedCategory] = useState<string>(initialContext?.category || "rd_service_error");
  const [customProblem, setCustomProblem] = useState<string>(initialContext?.problem || "");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<AIDiagnosisResult | null>(null);

  if (!isOpen) return null;

  const handleRunDiagnosis = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai-diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fingerprintDevice: selectedDevice,
          bankName: selectedBank,
          problemCategory: selectedCategory,
          problemDescription: customProblem || "Biometric not detecting in kiosk browser",
          lang
        })
      });

      const data = await res.json();
      if (data.success && data.diagnosis) {
        setDiagnosis(data.diagnosis);
      }
    } catch (err) {
      console.error("AI diagnosis error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden text-left relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-6 py-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display">
                {lang === 'hi' ? 'AI Megnot स्मार्ट डायग्नोस्टिक्स' : 'AI Megnot Instant RD Diagnosis'}
              </h3>
              <p className="text-xs text-amber-100">
                {lang === 'hi' ? 'Morpho, Mantra व कियोस्क पोर्टल की त्वरित 30-सेकंड समाधान गाइड' : '30-second troubleshooting assistant for RD Service & CSP Portal'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Configuration Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.deviceLabel}
              </label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
              >
                {BIOMETRIC_DEVICES.map((d) => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.bankLabel}
              </label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
              >
                {BANK_LIST.slice(0, 10).map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.problemDescLabel}
              </label>
              <input
                type="text"
                value={customProblem}
                onChange={(e) => setCustomProblem(e.target.value)}
                placeholder={lang === 'hi' ? 'उदा. Morpho 11100 error, Mantra device not ready' : 'e.g. Morpho 11100 error, Mantra device not ready'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleRunDiagnosis}
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer disabled:opacity-50"
            id="btn-run-ai-diagnosis"
          >
            <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? (lang === 'hi' ? 'AI विश्लेषण कर रहा है...' : 'AI Analyzing...') : (lang === 'hi' ? 'तुरंत AI समाधान खोजें (Run AI Check)' : 'Diagnose & Get Instant Fix')}</span>
          </button>

          {/* Diagnosis Output Results */}
          {diagnosis && (
            <div className="space-y-4 pt-2 border-t border-slate-200 animate-fade-in">
              {/* Summary Card */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-950">
                <div className="flex items-center space-x-2 mb-1">
                  <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-bold uppercase tracking-wider text-[11px] text-amber-800">
                    {lang === 'hi' ? 'समस्या का मुख्य कारण:' : 'Diagnostic Summary:'}
                  </span>
                </div>
                <p className="font-semibold text-sm text-slate-900 mt-1">{diagnosis.problemSummary}</p>
              </div>

              {/* Step-by-Step Instant Fix Steps */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5">
                <span className="font-extrabold uppercase tracking-wider text-[11px] text-slate-600 block">
                  🛠️ {lang === 'hi' ? 'तुरंत यह 4 कदम उठाएं (Instant Fix Steps):' : 'Immediate Resolution Steps:'}
                </span>

                <div className="space-y-2">
                  {diagnosis.instantFixSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-2 bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-slate-800 font-medium leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device Specific Driver Config Tip */}
              {diagnosis.rdServiceGuidance && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-950 flex items-start space-x-2.5">
                  <Fingerprint className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">
                      {lang === 'hi' ? 'डिवाइस विशिष्ट निर्देश:' : 'RD Service Specific Setting:'}
                    </span>
                    <p className="text-indigo-900 font-mono mt-0.5">{diagnosis.rdServiceGuidance}</p>
                  </div>
                </div>
              )}

              {/* Prevention Tip */}
              {diagnosis.preventionTip && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">
                      {lang === 'hi' ? 'भविष्य के लिए सुझाव: ' : 'Prevention Tip: '}
                    </span>
                    <span>{diagnosis.preventionTip}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-slate-500">
            {lang === 'hi' ? 'यदि समस्या हल न हो तो टिकट सबमिट करें।' : 'If unresolved, please submit a support ticket.'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
          >
            {lang === 'hi' ? 'बंद करें (Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
