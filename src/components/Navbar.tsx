import React from 'react';
import { 
  Languages, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ShieldCheck, 
  FileText, 
  Search, 
  Sparkles,
  Headphones,
  Lock,
  Globe
} from 'lucide-react';
import { MegnotLogo } from './MegnotLogo';
import { Language } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  activeTab: 'submit' | 'track' | 'admin' | 'ai';
  onSelectTab: (tab: 'submit' | 'track' | 'admin' | 'ai') => void;
  isOnline: boolean;
  offlineQueueCount: number;
  onSyncOffline: () => void;
  isSyncing: boolean;
  isAdminLoggedIn?: boolean;
  onOpenGoogleBlog?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  activeTab,
  onSelectTab,
  isOnline,
  offlineQueueCount,
  onSyncOffline,
  isSyncing,
  isAdminLoggedIn,
  onOpenGoogleBlog
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Utility Ribbon */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-emerald-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
            24x7 Technical Desk
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-400">
            {lang === 'hi' 
              ? 'Megnot सीएसपी एवं ऑपरेटर टेक्निकल सपोर्ट' 
              : 'Megnot CSP & Operator Tech Support Helpline'}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Online/Offline Status */}
          <div className="flex items-center space-x-1.5">
            {isOnline ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                <Wifi className="w-3 h-3 mr-1 text-emerald-400" />
                {t.onlineStatus}
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950 text-amber-300 border border-amber-800/60 animate-pulse">
                <WifiOff className="w-3 h-3 mr-1 text-amber-400" />
                {t.offlineStatus}
              </span>
            )}
          </div>

          {/* Sync Button if offline items exist */}
          {offlineQueueCount > 0 && (
            <button
              onClick={onSyncOffline}
              disabled={isSyncing || !isOnline}
              className="inline-flex items-center px-2.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium transition cursor-pointer disabled:opacity-50"
              title="Sync offline tickets to server"
            >
              <RefreshCw className={`w-3 h-3 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{t.syncQueueNow} ({offlineQueueCount})</span>
            </button>
          )}

          {/* Google Blog Live Button */}
          {onOpenGoogleBlog && (
            <button
              onClick={onOpenGoogleBlog}
              className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-300 hover:text-white bg-emerald-950/90 hover:bg-emerald-900 px-2.5 py-1 rounded transition border border-emerald-600/50 cursor-pointer shadow-xs"
              id="google-blog-ribbon-btn"
              title={lang === 'hi' ? 'Google Blog (Blogger.com) पर लाइव करें - एम्बेड कोड' : 'Live on Google Blog (Blogger.com) - Embed Code'}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'hi' ? 'Google Blog लाइव' : 'Blogger Live'}</span>
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="flex items-center space-x-1 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition border border-slate-700 cursor-pointer"
            id="lang-toggle-btn"
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Portal Identity */}
          <div 
            onClick={() => onSelectTab('submit')}
            className="flex items-center cursor-pointer group py-1"
          >
            <MegnotLogo 
              size="md" 
              subtitle={lang === 'hi' ? 'सीएसपी टेक्निकल हेल्पडेस्क पोर्टल' : 'Technical Support & Helpdesk'} 
            />
          </div>

          {/* View Switcher Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => onSelectTab('submit')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'submit'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              id="tab-new-ticket"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">{t.navCspForm}</span>
              <span className="sm:hidden">{lang === 'hi' ? 'नया टिकट' : 'New'}</span>
            </button>

            <button
              onClick={() => onSelectTab('track')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'track'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              id="tab-track-status"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">{t.navTrackStatus}</span>
              <span className="sm:hidden">{lang === 'hi' ? 'ट्रैक' : 'Track'}</span>
            </button>

            <button
              onClick={() => onSelectTab('ai')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
              }`}
              id="tab-ai-diag"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="hidden md:inline">{t.navAiDiagnostic}</span>
              <span className="md:hidden">AI Fix</span>
            </button>

            <button
              onClick={() => onSelectTab('admin')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200'
              }`}
              id="tab-admin-dashboard"
            >
              {isAdminLoggedIn ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className="hidden sm:inline">{t.navAdminDashboard}</span>
              <span className="sm:hidden">{lang === 'hi' ? 'एडमिन' : 'Admin'}</span>
              {isAdminLoggedIn && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Admin Active" />
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
