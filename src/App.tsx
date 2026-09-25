import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { OfflineBanner } from './components/OfflineBanner';
import { TicketSubmissionForm } from './components/TicketSubmissionForm';
import { TicketTrackingView } from './components/TicketTrackingView';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { AIDiagnosisModal } from './components/AIDiagnosisModal';
import { GoogleBlogLiveModal } from './components/GoogleBlogLiveModal';
import { Language, Ticket, TicketStatus, TicketStats, UIConfig } from './types';
import { translations } from './translations';
import { INITIAL_SEED_TICKETS, DEFAULT_UI_CONFIG } from './data/constants';
import { 
  getOfflineQueue, 
  saveOfflineTicket, 
  removeOfflineTicket, 
  clearOfflineQueue, 
  getLocalSubmittedTickets, 
  saveLocalSubmittedTicket,
  updateLocalTicketStatus 
} from './utils/offlineStorage';
import { MegnotLogo } from './components/MegnotLogo';
import { Building2, Headphones, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('hi');
  const [activeTab, setActiveTab] = useState<'submit' | 'track' | 'admin' | 'ai'>('submit');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<Ticket[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncMsg, setLastSyncMsg] = useState<string | null>(null);

  // Dynamic UI Configuration state with persistent localStorage cache
  const [uiConfig, setUiConfig] = useState<UIConfig>(() => {
    try {
      const raw = localStorage.getItem('megnot_ui_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_UI_CONFIG,
            ...parsed,
            announcement: { ...DEFAULT_UI_CONFIG.announcement, ...(parsed.announcement || {}) },
            formFields: { ...DEFAULT_UI_CONFIG.formFields, ...(parsed.formFields || {}) },
            supportInfo: { ...DEFAULT_UI_CONFIG.supportInfo, ...(parsed.supportInfo || {}) }
          };
        }
      }
    } catch (e) {
      console.warn('Error reading local UI config cache:', e);
    }
    return DEFAULT_UI_CONFIG;
  });

  const updateUiConfigState = useCallback((newConfig: UIConfig) => {
    setUiConfig(newConfig);
    try {
      localStorage.setItem('megnot_ui_config', JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Error caching UI config to localStorage:', e);
    }
  }, []);

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('megnot_admin_auth') === 'true' ||
        sessionStorage.getItem('megnot_admin_auth') === 'true'
      );
    } catch {
      return false;
    }
  });

  const handleAdminLogout = () => {
    try {
      localStorage.removeItem('megnot_admin_auth');
      localStorage.removeItem('megnot_admin_user');
      sessionStorage.removeItem('megnot_admin_auth');
      sessionStorage.removeItem('megnot_admin_user');
    } catch (e) {
      console.warn('Storage clear error:', e);
    }
    setIsAdminLoggedIn(false);
  };

  // Tickets & Stats
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_SEED_TICKETS);
  const [stats, setStats] = useState<TicketStats>({
    total: 4,
    pending: 1,
    inProgress: 1,
    resolved: 2,
    rejected: 0,
    critical: 1,
    resolvedToday: 2,
    avgResolutionMinutes: 18
  });

  // AI Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiContext, setAiContext] = useState<{ bank?: string; device?: string; problem?: string; category?: string } | undefined>(undefined);

  // Google Blog (Blogger.com) Modal
  const [isGoogleBlogModalOpen, setIsGoogleBlogModalOpen] = useState<boolean>(false);

  // Sync offline queue count
  const refreshOfflineQueue = useCallback(() => {
    const queue = getOfflineQueue();
    setOfflineQueue(queue);
  }, []);

  // Fetch UI Configuration from server
  const fetchUIConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/config/ui');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.config) {
          updateUiConfigState(data.config);
        }
      }
    } catch (err) {
      console.warn('Could not fetch dynamic UI config from server, using cached/default:', err);
    }
  }, [updateUiConfigState]);

  // Fetch tickets, stats, and config from server
  const fetchServerData = useCallback(async () => {
    try {
      const [ticketsRes, statsRes, configRes] = await Promise.all([
        fetch('/api/tickets'),
        fetch('/api/stats'),
        fetch('/api/config/ui')
      ]);

      if (ticketsRes.ok) {
        const tData = await ticketsRes.json();
        if (tData.success && Array.isArray(tData.tickets)) {
          // Combine server tickets with any offline queued tickets
          const queue = getOfflineQueue();
          const combined = [...queue, ...tData.tickets.filter((st: Ticket) => !queue.some(q => q.id === st.id))];
          setTickets(combined);
        }
      }

      if (statsRes.ok) {
        const sData = await statsRes.json();
        if (sData.success && sData.stats) {
          setStats(sData.stats);
        }
      }

      if (configRes.ok) {
        const cData = await configRes.json();
        if (cData.success && cData.config) {
          updateUiConfigState(cData.config);
        }
      }
    } catch (err) {
      console.warn('Could not connect to server, using local tickets state:', err);
      // Fallback to local submitted tickets + initial seed
      const local = getLocalSubmittedTickets();
      const queue = getOfflineQueue();
      const combined = [...queue, ...local, ...INITIAL_SEED_TICKETS.filter(st => !local.some(l => l.id === st.id))];
      setTickets(combined);
    }
  }, [updateUiConfigState]);

  // Save UI Config with Instant Live Update & Broadcast
  const handleSaveUIConfig = useCallback(async (newConfig: UIConfig): Promise<boolean> => {
    try {
      updateUiConfigState(newConfig); // Instant local optimistic update + localStorage
      const res = await fetch('/api/config/ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: newConfig })
      });
      const data = await res.json();
      if (data.success && data.config) {
        updateUiConfigState(data.config);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error saving UI config:', err);
      return false;
    }
  }, [updateUiConfigState]);

  // Reset UI Config with Instant Live Update
  const handleResetUIConfig = useCallback(async (): Promise<boolean> => {
    try {
      updateUiConfigState(DEFAULT_UI_CONFIG);
      const res = await fetch('/api/config/ui/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.config) {
        updateUiConfigState(data.config);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error resetting UI config:', err);
      return false;
    }
  }, [updateUiConfigState]);

  // Batch Sync Offline Tickets to Server
  const handleSyncOffline = useCallback(async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    try {
      const res = await fetch('/api/tickets/batch-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickets: queue })
      });

      const data = await res.json();
      if (data.success) {
        clearOfflineQueue();
        refreshOfflineQueue();
        await fetchServerData();
        const msg = lang === 'hi' 
          ? `सफलता: ${data.syncedCount || queue.length} ऑफलाइन टिकट मुख्य सर्वर पर सिंक हो गए हैं!`
          : `Success: ${data.syncedCount || queue.length} offline tickets synced to central database!`;
        setLastSyncMsg(msg);
        setTimeout(() => setLastSyncMsg(null), 6000);
      }
    } catch (err) {
      console.error('Batch sync failed:', err);
      setLastSyncMsg(lang === 'hi' ? 'सर्वर से संपर्क नहीं हो पाया। पुनः प्रयास करें।' : 'Sync failed. Will retry automatically.');
    } finally {
      setIsSyncing(false);
    }
  }, [lang, fetchServerData, refreshOfflineQueue]);

  // Real-Time Instant Live Site Sync (SSE + Smart Periodic Fallback)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let isMounted = true;
    const lastConfigVer = { current: 1 };
    const lastTicketsVer = { current: 1 };

    // BroadcastChannel for instant cross-tab live sync in same browser
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('megnot_live_sync');
      bc.onmessage = (e) => {
        if (!isMounted) return;
        if (e.data?.type === 'config_updated' && e.data?.config) {
          updateUiConfigState(e.data.config);
        } else if (e.data?.type === 'sync_all') {
          fetchServerData();
        }
      };
    } catch {
      // BroadcastChannel not available in this environment
    }

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/live-stream');

        eventSource.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'config_updated' && payload.config) {
              updateUiConfigState(payload.config);
              if (bc) bc.postMessage({ type: 'config_updated', config: payload.config });
            } else if (
              payload.type === 'ticket_updated' || 
              payload.type === 'ticket_created' || 
              payload.type === 'tickets_synced' || 
              payload.type === 'tickets_cleaned'
            ) {
              fetchServerData();
              if (bc) bc.postMessage({ type: 'sync_all' });
            }
          } catch (err) {
            console.warn('Live stream parse error:', err);
          }
        };

        eventSource.onerror = () => {
          eventSource?.close();
          // Auto-reconnect after 4s
          setTimeout(() => {
            if (isMounted) connectSSE();
          }, 4000);
        };
      } catch (err) {
        console.warn('SSE error:', err);
      }
    };

    connectSSE();

    // Background interval check every 4 seconds to guarantee live updates
    const pollInterval = setInterval(() => {
      if (!isMounted) return;
      fetch('/api/config/version')
        .then(r => r.json())
        .then(data => {
          if (data.configVersion && data.configVersion !== lastConfigVer.current) {
            lastConfigVer.current = data.configVersion;
            fetchUIConfig();
          }
          if (data.ticketsVersion && data.ticketsVersion !== lastTicketsVer.current) {
            lastTicketsVer.current = data.ticketsVersion;
            fetchServerData();
          }
        })
        .catch(() => {});
    }, 4000);

    return () => {
      isMounted = false;
      eventSource?.close();
      clearInterval(pollInterval);
      if (bc) bc.close();
    };
  }, [fetchUIConfig, fetchServerData]);

  // Network Event Listeners & Initial Load
  useEffect(() => {
    refreshOfflineQueue();
    fetchServerData();

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when internet comes back
      handleSyncOffline();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleSyncOffline, refreshOfflineQueue, fetchServerData]);

  // When a ticket is submitted from Form
  const handleTicketSubmitted = (ticket: Ticket) => {
    saveLocalSubmittedTicket(ticket);
    refreshOfflineQueue();
    setTickets(prev => [ticket, ...prev.filter(t => t.id !== ticket.id)]);
    // Re-fetch stats
    fetchServerData();
  };

  // When admin updates ticket status
  const handleUpdateTicketStatus = async (
    id: string, 
    newStatus: TicketStatus, 
    remarks?: string, 
    resolvedBy?: string
  ) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          resolutionRemarks: remarks,
          resolvedBy: resolvedBy || 'Technical Support Lead',
          resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : undefined,
          whatsappNotified: newStatus === 'resolved'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.ticket) {
          setTickets(prev => prev.map(tk => tk.id === id ? data.ticket : tk));
          updateLocalTicketStatus(id, data.ticket);
        }
      } else {
        // Local state update fallback
        setTickets(prev => prev.map(tk => tk.id === id ? {
          ...tk,
          status: newStatus,
          resolutionRemarks: remarks || tk.resolutionRemarks,
          resolvedBy: resolvedBy || tk.resolvedBy,
          resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : tk.resolvedAt
        } : tk));
      }
      fetchServerData();
    } catch (err) {
      console.error('Error updating status:', err);
      setTickets(prev => prev.map(tk => tk.id === id ? {
        ...tk,
        status: newStatus,
        resolutionRemarks: remarks || tk.resolutionRemarks
      } : tk));
    }
  };

  const handleAssignTechnician = async (id: string, techName: string) => {
    handleUpdateTicketStatus(id, 'in_progress', `Assigned to ${techName}`, techName);
  };

  const handleUpdateTicketRating = (id: string, rating: number) => {
    setTickets(prev => prev.map(tk => tk.id === id ? { ...tk, rating } : tk));
    updateLocalTicketStatus(id, { rating });
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        lang={lang}
        onToggleLang={() => setLang(prev => prev === 'hi' ? 'en' : 'hi')}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'ai') {
            setIsAiModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        isOnline={isOnline}
        offlineQueueCount={offlineQueue.length}
        onSyncOffline={handleSyncOffline}
        isSyncing={isSyncing}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenGoogleBlog={() => setIsGoogleBlogModalOpen(true)}
      />

      {/* Offline Alert & Sync Banner */}
      <OfflineBanner
        isOnline={isOnline}
        offlineCount={offlineQueue.length}
        onSync={handleSyncOffline}
        isSyncing={isSyncing}
        lang={lang}
        lastSyncMsg={lastSyncMsg}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {activeTab === 'submit' && (
          <TicketSubmissionForm
            lang={lang}
            isOnline={isOnline}
            uiConfig={uiConfig}
            onTicketSubmitted={handleTicketSubmitted}
            onOpenAiHelp={(ctx) => {
              setAiContext(ctx);
              setIsAiModalOpen(true);
            }}
          />
        )}

        {activeTab === 'track' && (
          <TicketTrackingView
            lang={lang}
            tickets={tickets}
            onRefresh={fetchServerData}
            onUpdateTicketRating={handleUpdateTicketRating}
          />
        )}

        {activeTab === 'admin' && (
          isAdminLoggedIn ? (
            <AdminDashboard
              lang={lang}
              tickets={tickets}
              stats={stats}
              uiConfig={uiConfig}
              onRefresh={fetchServerData}
              onUpdateTicketStatus={handleUpdateTicketStatus}
              onAssignTechnician={handleAssignTechnician}
              onSaveUIConfig={handleSaveUIConfig}
              onResetUIConfig={handleResetUIConfig}
              onLogout={handleAdminLogout}
            />
          ) : (
            <AdminLogin
              lang={lang}
              onLoginSuccess={() => {
                setIsAdminLoggedIn(true);
                fetchServerData();
              }}
              onCancel={() => setActiveTab('submit')}
            />
          )
        )}
      </main>

      {/* AI Smart Diagnosis Modal */}
      <AIDiagnosisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        lang={lang}
        initialContext={aiContext}
      />

      {/* Google Blog (Blogger.com) Integration Modal */}
      <GoogleBlogLiveModal
        lang={lang}
        isOpen={isGoogleBlogModalOpen}
        onClose={() => setIsGoogleBlogModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <MegnotLogo 
              size="sm" 
              subtitle={lang === 'hi' ? 'Megnot कंसल्टेंसी सर्विसेज - ऑपरेटर हेल्पडेस्क' : 'Megnot Consultancy Services Helpdesk'} 
            />
          </div>

          <div className="flex items-center space-x-6 text-slate-600">
            <button 
              onClick={() => setActiveTab('submit')} 
              className="hover:text-blue-600 font-medium cursor-pointer"
            >
              {t.navCspForm}
            </button>
            <button 
              onClick={() => setActiveTab('track')} 
              className="hover:text-blue-600 font-medium cursor-pointer"
            >
              {t.navTrackStatus}
            </button>
            <button 
              onClick={() => setActiveTab('admin')} 
              className="hover:text-blue-600 font-medium cursor-pointer"
            >
              {t.navAdminDashboard}
            </button>
            <button 
              onClick={() => setIsGoogleBlogModalOpen(true)} 
              className="text-emerald-700 hover:text-emerald-600 font-semibold cursor-pointer flex items-center gap-1"
              title="Google Blog (Blogger.com) पर लाइव करें"
            >
              <span>🌐</span>
              <span>{lang === 'hi' ? 'Google Blog पर लाइव करें' : 'Live on Google Blog'}</span>
            </button>
          </div>

          <div className="text-center sm:text-right">
            <p className="text-slate-600 font-semibold">
              AnyDesk Remote & WhatsApp Resolution Gateway
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">
              ● Offline Queue & Auto-Sync Active
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
