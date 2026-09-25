import React from 'react';
import { WifiOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface OfflineBannerProps {
  isOnline: boolean;
  offlineCount: number;
  onSync: () => void;
  isSyncing: boolean;
  lang: Language;
  lastSyncMsg?: string | null;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline,
  offlineCount,
  onSync,
  isSyncing,
  lang,
  lastSyncMsg
}) => {
  const t = translations[lang];

  if (isOnline && offlineCount === 0 && !lastSyncMsg) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
      {!isOnline && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 sm:p-4 text-amber-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-950">
                {lang === 'hi' 
                  ? '⚠️ आप अभी ऑफलाइन हैं (इंटरनेट डिस्कनेक्टेड)' 
                  : '⚠️ Offline Mode: No Internet Connection'}
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                {t.offlineModeNotice}
              </p>
            </div>
          </div>
          {offlineCount > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
              {offlineCount} {lang === 'hi' ? 'टिकट कतार में सुरक्षित' : 'Tickets in Queue'}
            </span>
          )}
        </div>
      )}

      {isOnline && offlineCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 text-blue-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-blue-950">
                {lang === 'hi' 
                  ? `इंटरनेट वापस आ गया है! आपके पास ${offlineCount} ऑफलाइन टिकट सिंक के लिए तैयार हैं।` 
                  : `Back Online! You have ${offlineCount} queued ticket(s) ready to submit.`}
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                {lang === 'hi'
                  ? 'सर्वर पर भेजने के लिए "अभी सिंक करें" दबाएं या यह ऑटोमैटिक सबमिट हो जाएगा।'
                  : 'Click Sync Now to push them to the central admin queue.'}
              </p>
            </div>
          </div>

          <button
            onClick={onSync}
            disabled={isSyncing}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? (lang === 'hi' ? 'सिंक हो रहा है...' : 'Syncing...') : (lang === 'hi' ? 'अभी सिंक करें (Sync)' : 'Sync Now')}
          </button>
        </div>
      )}

      {lastSyncMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 shadow-xs flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{lastSyncMsg}</span>
          </div>
        </div>
      )}
    </div>
  );
};
