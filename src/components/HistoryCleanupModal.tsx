import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Download, 
  ShieldAlert, 
  X, 
  Clock, 
  Sparkles,
  Archive,
  RefreshCw,
  Info
} from 'lucide-react';
import { Language, Ticket, HistoryCleanupMode } from '../types';
import { translations } from '../translations';

interface HistoryCleanupModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  tickets: Ticket[];
  onTicketsUpdated: () => void;
  onExportCSV: () => void;
}

export const HistoryCleanupModal: React.FC<HistoryCleanupModalProps> = ({
  lang,
  isOpen,
  onClose,
  tickets,
  onTicketsUpdated,
  onExportCSV
}) => {
  const t = translations[lang];

  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<{
    totalResolved: number;
    resolvedOlder30Days: number;
    totalRejected: number;
    totalTickets: number;
    lastAutoCleanupTime: string;
  } | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    mode: HistoryCleanupMode;
    title: string;
    description: string;
    targetCount: number;
  } | null>(null);

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCleanupStats = async () => {
    try {
      const res = await fetch('/api/admin/cleanup-stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.warn('Failed to fetch cleanup stats from server:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCleanupStats();
      setFeedbackMsg(null);
      setConfirmModal(null);
    }
  }, [isOpen]);

  // Calculations from local tickets
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved');
  const resolvedOlder30Days = resolvedTickets.filter(t => {
    const time = new Date(t.resolvedAt || t.updatedAt || t.createdAt).getTime();
    return (now - time) > thirtyDaysMs;
  });
  const rejectedTickets = tickets.filter(t => t.status === 'rejected');

  const initiatePurge = (mode: HistoryCleanupMode) => {
    setFeedbackMsg(null);
    if (mode === 'resolved_all') {
      setConfirmModal({
        mode: 'resolved_all',
        title: lang === 'hi' ? 'सभी सुलझे हुए (Resolved) केस हटाएं?' : 'Delete All Resolved Tickets?',
        description: lang === 'hi' 
          ? `यह क्रिया वर्तमान में मौजूद सभी ${resolvedTickets.length} सुलझे हुए टिकटों को हमेशा के लिए हटा देगी।`
          : `This will permanently delete all ${resolvedTickets.length} resolved tickets from the database.`,
        targetCount: resolvedTickets.length
      });
    } else if (mode === 'resolved_older_30d') {
      setConfirmModal({
        mode: 'resolved_older_30d',
        title: lang === 'hi' ? '30 दिन से पुराने सुलझे हुए केस हटाएं?' : 'Delete Resolved Tickets Older Than 30 Days?',
        description: lang === 'hi'
          ? `यह क्रिया 1 माह (30 दिन) से पुराने ${resolvedOlder30Days.length} सुलझे हुए केस हटा देगी। हालिया टिकट सुरक्षित रहेंगे।`
          : `This will permanently delete ${resolvedOlder30Days.length} tickets resolved over 30 days ago. Recent tickets remain safe.`,
        targetCount: resolvedOlder30Days.length
      });
    } else if (mode === 'rejected_all') {
      setConfirmModal({
        mode: 'rejected_all',
        title: lang === 'hi' ? 'सभी अस्वीकृत (Rejected) केस हटाएं?' : 'Delete All Rejected Tickets?',
        description: lang === 'hi'
          ? `यह क्रिया सभी ${rejectedTickets.length} अस्वीकृत या कैंसल टिकटों को हटा देगी।`
          : `This will permanently remove all ${rejectedTickets.length} rejected/cancelled tickets.`,
        targetCount: rejectedTickets.length
      });
    }
  };

  const handleExecutePurge = async () => {
    if (!confirmModal) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cleanup-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: confirmModal.mode, daysThreshold: 30 })
      });
      const data = await res.json();

      if (data.success) {
        setFeedbackMsg({
          type: 'success',
          text: data.message || t.purgeSuccessMsg
        });
        setConfirmModal(null);
        fetchCleanupStats();
        onTicketsUpdated();
      } else {
        setFeedbackMsg({
          type: 'error',
          text: data.message || 'Cleanup operation failed.'
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Error communicating with server.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-400/30 flex items-center justify-center text-rose-400">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-display text-white">
                {t.historyCleanupTitle}
              </h3>
              <p className="text-xs text-rose-200">
                {t.historyCleanupSub}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Notification Feedback */}
          {feedbackMsg && (
            <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
              feedbackMsg.type === 'success' 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-center space-x-2">
                {feedbackMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{feedbackMsg.text}</span>
              </div>
              <button onClick={() => setFeedbackMsg(null)} className="opacity-70 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Automated Monthly Retention Status Box */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-emerald-950 text-sm">
                    {lang === 'hi' ? 'ऑटोमैटिक मासिक क्लीनअप सक्रिय (Monthly Auto-Prune)' : 'Automatic Monthly Purge Active'}
                  </h4>
                  <span className="bg-emerald-200/80 text-emerald-900 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                    30 Days
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  {t.autoMonthlyPurgeNotice}
                </p>
              </div>
            </div>

            <div className="text-[11px] font-mono text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-lg shrink-0">
              {lang === 'hi' ? 'हर महीने स्वतः सफाया' : 'Scheduled Auto-Clean'}
            </div>
          </div>

          {/* Quick Snapshot Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
              <span className="text-xs text-slate-500 font-medium block">
                {lang === 'hi' ? 'कुल सुलझे हुए केस' : 'Total Resolved'}
              </span>
              <span className="text-2xl font-bold text-slate-900 font-mono mt-0.5 block">
                {resolvedTickets.length}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">
                {lang === 'hi' ? 'समाधान हो चुके' : 'Closed cases'}
              </span>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 text-center">
              <span className="text-xs text-amber-800 font-medium block">
                {lang === 'hi' ? '30+ दिन पुराने सुलझे केस' : 'Resolved > 30 Days'}
              </span>
              <span className="text-2xl font-bold text-amber-900 font-mono mt-0.5 block">
                {resolvedOlder30Days.length}
              </span>
              <span className="text-[11px] text-amber-700 font-medium">
                {lang === 'hi' ? 'ऑटो-क्लीन हेतु पात्र' : 'Eligible for auto-clean'}
              </span>
            </div>

            <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3.5 text-center">
              <span className="text-xs text-rose-800 font-medium block">
                {lang === 'hi' ? 'कुल अस्वीकृत केस' : 'Total Rejected'}
              </span>
              <span className="text-2xl font-bold text-rose-900 font-mono mt-0.5 block">
                {rejectedTickets.length}
              </span>
              <span className="text-[11px] text-rose-700 font-medium">
                {lang === 'hi' ? 'कैंसल टिकट' : 'Cancelled cases'}
              </span>
            </div>
          </div>

          {/* Manual Cleanup Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>{t.manualCleanupHeading}</span>
              </h4>

              <button
                type="button"
                onClick={onExportCSV}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.downloadBackupBeforePurge}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: 30 Days Purge */}
              <div className="border border-slate-200 hover:border-amber-400 rounded-xl p-4 transition bg-white flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800">
                      {lang === 'hi' ? '30 दिन पुराने केस' : 'Older than 30 Days'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {resolvedOlder30Days.length} {lang === 'hi' ? 'केस' : 'cases'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {lang === 'hi' 
                      ? '1 माह से पुराने सुलझे हुए टिकट हटाएं। नए केस सुरक्षित रहेंगे।'
                      : 'Purge resolved tickets older than 1 month. Recent tickets kept.'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={resolvedOlder30Days.length === 0}
                  onClick={() => initiatePurge('resolved_older_30d')}
                  className="w-full py-2 px-3 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white transition shadow-2xs flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.purge30DaysResolvedBtn}</span>
                </button>
              </div>

              {/* Option 2: All Resolved Purge */}
              <div className="border border-slate-200 hover:border-rose-400 rounded-xl p-4 transition bg-white flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800">
                      {lang === 'hi' ? 'सभी सुलझे हुए केस' : 'All Resolved Cases'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {resolvedTickets.length} {lang === 'hi' ? 'केस' : 'cases'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {lang === 'hi'
                      ? 'सभी पुराने व नए सुलझे हुए टिकट हमेशा के लिए डिलीट करें।'
                      : 'Delete all resolved tickets entirely from the database.'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={resolvedTickets.length === 0}
                  onClick={() => initiatePurge('resolved_all')}
                  className="w-full py-2 px-3 text-xs font-bold rounded-lg bg-rose-700 hover:bg-rose-600 disabled:opacity-40 text-white transition shadow-2xs flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.purgeAllResolvedBtn}</span>
                </button>
              </div>

              {/* Option 3: Rejected Purge */}
              <div className="border border-slate-200 hover:border-slate-400 rounded-xl p-4 transition bg-white flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {lang === 'hi' ? 'सभी अस्वीकृत केस' : 'All Rejected Cases'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {rejectedTickets.length} {lang === 'hi' ? 'केस' : 'cases'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {lang === 'hi'
                      ? 'अस्वीकृत या डुप्लीकेट पाए गए बंद टिकटों को साफ करें।'
                      : 'Clean out rejected or duplicate closed tickets.'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={rejectedTickets.length === 0}
                  onClick={() => initiatePurge('rejected_all')}
                  className="w-full py-2 px-3 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition shadow-2xs flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.purgeRejectedBtn}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Danger Popup Drawer */}
        {confirmModal && (
          <div className="p-5 bg-rose-50 border-t-2 border-rose-500 animate-in slide-in-from-bottom-2">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-rose-950 text-sm">
                  {confirmModal.title}
                </h4>
                <p className="text-xs text-rose-800 mt-1 font-medium">
                  {confirmModal.description}
                </p>
                <p className="text-[11px] text-rose-700 mt-1">
                  ⚠️ {t.confirmPurgeWarning}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={onExportCSV}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.downloadBackupBeforePurge}</span>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleExecutePurge}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{loading ? 'Deleting...' : t.executePurgeBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmModal(null)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                  >
                    {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            {lang === 'hi' ? 'डैशबोर्ड पर लौटें' : 'Done & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
