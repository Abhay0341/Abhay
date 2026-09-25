import React, { useState } from 'react';
import { 
  CheckCircle2, 
  X, 
  Send, 
  Share2, 
  Copy, 
  MessageSquare, 
  Wrench, 
  User, 
  Building2, 
  Phone,
  Sparkles
} from 'lucide-react';
import { Language, Ticket } from '../types';
import { translations } from '../translations';
import { generateTicketResolvedMessage, getWhatsAppDirectUrl } from '../utils/whatsapp';

interface ResolutionModalProps {
  isOpen: boolean;
  ticket: Ticket | null;
  onClose: () => void;
  onConfirmResolve: (ticketId: string, remarks: string, technicianName: string) => void;
  lang: Language;
}

export const ResolutionModal: React.FC<ResolutionModalProps> = ({
  isOpen,
  ticket,
  onClose,
  onConfirmResolve,
  lang
}) => {
  const t = translations[lang];

  const [remarks, setRemarks] = useState<string>(
    ticket?.resolutionRemarks || (lang === 'hi' 
      ? "AnyDesk के माध्यम से Morpho RD Service री-रजिस्टर की गई, Chrome Flags इनेबल किया और ₹100 की टेस्ट निकासी सत्यापित की।" 
      : "Re-registered RD Service on AnyDesk, enabled Chrome flags, and verified test transaction successfully.")
  );
  const [technicianName, setTechnicianName] = useState<string>(
    ticket?.assignedTechnician || "Ajay Sharma (Tech Lead)"
  );
  const [isResolvedSuccess, setIsResolvedSuccess] = useState<boolean>(false);

  if (!isOpen || !ticket) return null;

  const handleResolve = () => {
    onConfirmResolve(ticket.id, remarks, technicianName);
    setIsResolvedSuccess(true);
  };

  const whatsappMessage = generateTicketResolvedMessage({
    ...ticket,
    status: 'resolved',
    resolutionRemarks: remarks,
    resolvedBy: technicianName,
    resolvedAt: new Date().toISOString()
  }, lang);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden text-left relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-700 px-6 py-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display">
                {t.resolutionModalTitle}
              </h3>
              <p className="text-xs text-emerald-100">
                Ticket #{ticket.id} • {ticket.name} ({ticket.koId})
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!isResolvedSuccess ? (
            <>
              {/* Ticket Quick Meta */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-400 block font-medium">Bank / Branch:</span>
                  <span className="font-bold text-slate-900">{ticket.bankName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Biometric Device:</span>
                  <span className="font-bold text-slate-900">{ticket.fingerprintDevice}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">AnyDesk ID:</span>
                  <span className="font-mono font-bold text-rose-600">{ticket.anydeskId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">WhatsApp Mobile:</span>
                  <span className="font-semibold text-slate-900">+91 {ticket.mobileNo}</span>
                </div>
              </div>

              {/* Technician Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.technicianAssigned}
                </label>
                <input
                  type="text"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              {/* Resolution Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.enterResolutionRemarks} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 font-medium"
                ></textarea>
              </div>

              {/* WhatsApp Notification Live Preview */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950 space-y-2">
                <div className="flex items-center space-x-1.5 font-bold text-emerald-900">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'hi' ? 'व्हाट्सएप नोटिफिकेशन पूर्वावलोकन (Preview):' : 'WhatsApp Notification Preview to Bank Mitra:'}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-100 text-[11px] font-mono whitespace-pre-line text-slate-700 max-h-36 overflow-y-auto leading-relaxed">
                  {whatsappMessage}
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleResolve}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
                id="btn-confirm-resolve"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.confirmResolveBtn}</span>
              </button>
            </>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h4 className="text-base sm:text-lg font-bold text-slate-900">
                {t.whatsappSentSuccess}
              </h4>

              <p className="text-xs text-slate-600 max-w-md mx-auto">
                {lang === 'hi'
                  ? `टिकट #${ticket.id} सफलतापूर्वक हल हो गया है। बैंक मित्र ${ticket.name} (${ticket.mobileNo}) को व्हाट्सएप सूचना भेजने के लिए नीचे क्लिक करें:`
                  : `Ticket #${ticket.id} is marked as Resolved. Click below to launch WhatsApp with the formatted resolution message:`}
              </p>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <a
                  href={getWhatsAppDirectUrl(ticket.mobileNo, whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {lang === 'hi' ? 'व्हाट्सएप चैट खोलें (Send WhatsApp)' : 'Open WhatsApp'}
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(whatsappMessage);
                    alert(t.copiedToClipboard);
                  }}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-300 transition cursor-pointer"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {t.copiedToClipboard.replace('!', '')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
          >
            {lang === 'hi' ? 'बंद करें (Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
