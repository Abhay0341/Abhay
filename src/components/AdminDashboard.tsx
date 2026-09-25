import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Monitor, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  Building2, 
  Fingerprint, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  Eye,
  SlidersHorizontal,
  X,
  LogOut,
  Users,
  Trash2,
  Archive,
  UserPlus,
  Globe
} from 'lucide-react';
import { Language, Ticket, TicketStatus, TicketStats, UIConfig } from '../types';
import { translations } from '../translations';
import { BANK_LIST, INDIAN_STATES_DISTRICTS, BIOMETRIC_DEVICES, DEFAULT_UI_CONFIG } from '../data/constants';
import { generateTicketCreatedMessage, generateTicketResolvedMessage, getWhatsAppDirectUrl, SUPER_ADMIN_MOBILE } from '../utils/whatsapp';
import { ResolutionModal } from './ResolutionModal';
import { UserManagementModal } from './UserManagementModal';
import { HistoryCleanupModal } from './HistoryCleanupModal';
import { UICustomizerModal } from './UICustomizerModal';
import { GoogleBlogLiveModal } from './GoogleBlogLiveModal';

interface AdminDashboardProps {
  lang: Language;
  tickets: Ticket[];
  stats: TicketStats;
  uiConfig?: UIConfig;
  onRefresh: () => void;
  onUpdateTicketStatus: (id: string, status: TicketStatus, remarks?: string, resolvedBy?: string) => void;
  onAssignTechnician: (id: string, techName: string) => void;
  onSaveUIConfig?: (config: UIConfig) => Promise<boolean>;
  onResetUIConfig?: () => Promise<boolean>;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  lang,
  tickets,
  stats,
  uiConfig = DEFAULT_UI_CONFIG,
  onRefresh,
  onUpdateTicketStatus,
  onAssignTechnician,
  onSaveUIConfig,
  onResetUIConfig,
  onLogout
}) => {
  const t = translations[lang];

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [isCleanupModalOpen, setIsCleanupModalOpen] = useState<boolean>(false);
  const [isUICustomizerOpen, setIsUICustomizerOpen] = useState<boolean>(false);
  const [isGoogleBlogModalOpen, setIsGoogleBlogModalOpen] = useState<boolean>(false);

  // Filters state
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [bankFilter, setBankFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [deviceFilter, setDeviceFilter] = useState<string>("all");

  // Selected ticket for action / modal
  const [selectedTicketForResolve, setSelectedTicketForResolve] = useState<Ticket | null>(null);
  const [inspectTicket, setInspectTicket] = useState<Ticket | null>(null);

  // Single Ticket Delete Handler
  const handleDeleteSingleTicket = async (ticket: Ticket) => {
    if (!window.confirm(lang === 'hi' 
      ? `क्या आप टिकट #${ticket.id} (${ticket.name} - ${ticket.koId}) को हमेशा के लिए हटाना चाहते हैं?` 
      : `Are you sure you want to permanently delete ticket #${ticket.id} (${ticket.name})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (inspectTicket?.id === ticket.id) {
          setInspectTicket(null);
        }
        onRefresh();
      } else {
        alert(data.message || 'Failed to delete ticket');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting ticket');
    }
  };


  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((tk) => {
      // Search
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matches = 
          tk.id.toLowerCase().includes(q) ||
          tk.koId.toLowerCase().includes(q) ||
          tk.name.toLowerCase().includes(q) ||
          tk.mobileNo.includes(q) ||
          tk.anydeskId.replace(/\s+/g, '').includes(q.replace(/\s+/g, '')) ||
          tk.district.toLowerCase().includes(q) ||
          tk.bcLocation.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Status
      if (statusFilter !== "all" && tk.status !== statusFilter) return false;

      // Bank
      if (bankFilter !== "all" && !tk.bankName.toLowerCase().includes(bankFilter.toLowerCase())) return false;

      // State
      if (stateFilter !== "all" && tk.state !== stateFilter) return false;

      // Device
      if (deviceFilter !== "all" && !tk.fingerprintDevice.toLowerCase().includes(deviceFilter.toLowerCase())) return false;

      return true;
    });
  }, [tickets, search, statusFilter, bankFilter, stateFilter, deviceFilter]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Ticket ID", "Created At", "Status", "KO ID", "Megnot Operator Name", "Mobile",
      "AnyDesk ID", "State", "District", "Bank", "Branch", "BC Location",
      "Biometric Device", "Problem Description", "Assigned Technician", "Resolution Remarks", "Resolved At"
    ];

    const rows = filteredTickets.map(tk => [
      `"${tk.id}"`,
      `"${new Date(tk.createdAt).toLocaleString('en-IN')}"`,
      `"${tk.status}"`,
      `"${tk.koId}"`,
      `"${tk.name.replace(/"/g, '""')}"`,
      `"${tk.mobileNo}"`,
      `"${tk.anydeskId}"`,
      `"${tk.state}"`,
      `"${tk.district}"`,
      `"${tk.bankName}"`,
      `"${tk.branchName}"`,
      `"${tk.bcLocation}"`,
      `"${tk.fingerprintDevice}"`,
      `"${tk.problemDescription.replace(/"/g, '""')}"`,
      `"${tk.assignedTechnician || ''}"`,
      `"${(tk.resolutionRemarks || '').replace(/"/g, '""')}"`,
      `"${tk.resolvedAt ? new Date(tk.resolvedAt).toLocaleString('en-IN') : ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Megnot_Support_Tickets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            {t.statusResolved}
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3 h-3 mr-1 text-blue-600" />
            {t.statusInProgress}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            {t.statusRejected}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 mr-1 text-amber-600" />
            {t.statusPending}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Banner / Dashboard Overview */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500 text-white">
              Admin & Technician Desk
            </span>
            <a
              href={`https://wa.me/91${SUPER_ADMIN_MOBILE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600/90 text-white hover:bg-emerald-600 transition"
              title="Super Admin WhatsApp"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Super Admin: {SUPER_ADMIN_MOBILE}</span>
            </a>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display mt-1">
            {t.adminHeading}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 max-w-2xl">
            {t.adminSubheading}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Google Blog (Blogger) Live Integration Button */}
          <button
            onClick={() => setIsGoogleBlogModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 shadow-xs border border-emerald-400/40"
            id="btn-google-blog-live"
            title="Google Blog (Blogger.com) पर लाइव करें - एम्बेड कोड व सेटअप गाइड"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? '🌐 Google Blog पर लाइव करें' : '🌐 Live on Google Blog'}</span>
          </button>

          {/* UI Customizer Button (Super Admin control) */}
          <button
            onClick={() => setIsUICustomizerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 shadow-xs"
            id="btn-ui-customizer"
            title="UI कस्टमाइज़र - बैंक, डिवाइस, समस्या श्रेणियां व फ़ील्ड्स प्रबंधित करें"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'UI कस्टमाइज़र' : 'UI Customizer'}</span>
          </button>

          {/* User Management Button */}
          <button
            onClick={() => setIsUserModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-blue-200 hover:text-white text-xs font-semibold border border-blue-700/60 transition cursor-pointer flex items-center space-x-1.5 shadow-2xs"
            id="btn-user-management"
            title={t.userManagementTitle}
          >
            <Users className="w-3.5 h-3.5 text-blue-300" />
            <span>{lang === 'hi' ? 'सपोर्ट यूज़र जोड़ें / प्रबंधित करें' : 'Manage Team Users'}</span>
          </button>

          {/* History Cleanup & Auto-Purge Button */}
          <button
            onClick={() => setIsCleanupModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-rose-200 text-xs font-semibold border border-slate-700 transition cursor-pointer flex items-center space-x-1.5 shadow-2xs"
            id="btn-history-cleanup"
            title={t.historyCleanupTitle}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>{lang === 'hi' ? 'इतिहास व ऑटो-डिलीट' : 'History & Auto-Purge'}</span>
          </button>

          <button
            onClick={onRefresh}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer flex items-center space-x-1.5"
            title={t.refreshQueue}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.refreshQueue}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center space-x-1.5"
            id="btn-export-csv"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.csvExport}</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-200 hover:text-white text-xs font-semibold border border-rose-800/60 transition cursor-pointer flex items-center space-x-1.5"
              title={t.adminLogoutBtn}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.adminLogoutBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">{t.statsTotal}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-mono">{stats.total}</div>
          <span className="text-[11px] text-slate-400">All India Tickets</span>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs bg-amber-50/30">
          <span className="text-xs font-semibold text-amber-700 block">{t.statsPending}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1 font-mono">{stats.pending}</div>
          <span className="text-[11px] text-amber-700">Awaiting Tech</span>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-xs bg-blue-50/30">
          <span className="text-xs font-semibold text-blue-700 block">{t.statsInProgress}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1 font-mono">{stats.inProgress}</div>
          <span className="text-[11px] text-blue-700">Active AnyDesk</span>
        </div>

        {/* Resolved Today */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-xs bg-emerald-50/30">
          <span className="text-xs font-semibold text-emerald-700 block">{t.statsResolved}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1 font-mono">{stats.resolved}</div>
          <span className="text-[11px] text-emerald-700">Fixed & Tested</span>
        </div>

        {/* Avg Resolution Time */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold text-slate-500 block">{t.statsAvgTime}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-mono">{stats.avgResolutionMinutes}m</div>
          <span className="text-[11px] text-emerald-600 font-medium">Under SLA target</span>
        </div>
      </div>

      {/* Filtering & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchAdmin}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              id="input-admin-search"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">{t.filterAll}</option>
              <option value="pending">{t.statusPending}</option>
              <option value="in_progress">{t.statusInProgress}</option>
              <option value="resolved">{t.statusResolved}</option>
              <option value="rejected">{t.statusRejected}</option>
            </select>
          </div>

          {/* Bank Filter (Dynamic) */}
          <div>
            <select
              value={bankFilter}
              onChange={(e) => setBankFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">{t.filterBank} (All Banks)</option>
              {(uiConfig?.banks && uiConfig.banks.length > 0 ? uiConfig.banks : BANK_LIST).map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* State Filter (Dynamic) */}
          <div>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">{t.filterState} (All States)</option>
              {Object.keys(uiConfig?.statesDistricts && Object.keys(uiConfig.statesDistricts).length > 0 ? uiConfig.statesDistricts : INDIAN_STATES_DISTRICTS).map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary Tags */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            {lang === 'hi' ? `दिखाए जा रहे हैं: ${filteredTickets.length} टिकट` : `Showing ${filteredTickets.length} of ${tickets.length} tickets`}
          </span>

          {(statusFilter !== "all" || bankFilter !== "all" || stateFilter !== "all" || search.trim()) && (
            <button
              onClick={() => {
                setStatusFilter("all");
                setBankFilter("all");
                setStateFilter("all");
                setSearch("");
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
            >
              {lang === 'hi' ? 'सभी फिल्टर हटाएं (Reset Filters)' : 'Clear All Filters'}
            </button>
          )}
        </div>
      </div>

      {/* Main Ticket Queue Table (Responsive) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">{t.tableTicketId}</th>
                <th className="py-3.5 px-4">{t.tableCspInfo}</th>
                <th className="py-3.5 px-4">{t.tableLocation}</th>
                <th className="py-3.5 px-4">{t.tableBankDevice}</th>
                <th className="py-3.5 px-4">{t.tableAnydesk}</th>
                <th className="py-3.5 px-4">{t.tableStatus}</th>
                <th className="py-3.5 px-4 text-right">{t.tableAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {lang === 'hi' ? 'कोई टिकट नहीं मिला।' : 'No tickets matched the active filters.'}
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/80 transition group">
                    {/* Ticket ID & Time */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 block">
                        #{ticket.id}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
                      </span>
                      {ticket.syncedFromOffline && (
                        <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 mt-0.5">
                          Offline Sync
                        </span>
                      )}
                    </td>

                    {/* Megnot Operator Name & Contact */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block line-clamp-1">{ticket.name}</span>
                      <span className="font-mono text-[11px] font-bold text-blue-700 block">KO: {ticket.koId}</span>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                        <a 
                          href={`tel:${ticket.mobileNo}`} 
                          className="hover:text-blue-600 flex items-center"
                          title="Call Megnot Operator"
                        >
                          <Phone className="w-3 h-3 mr-0.5" />
                          <span>{ticket.mobileNo}</span>
                        </a>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{ticket.district}, {ticket.state}</span>
                      <span className="text-[10px] text-slate-400 line-clamp-1">{ticket.bcLocation}</span>
                    </td>

                    {/* Bank & Biometric Device */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-bold text-slate-900 block line-clamp-1">{ticket.bankName}</span>
                      <span className="text-[11px] text-indigo-700 font-medium block line-clamp-1 flex items-center">
                        <Fingerprint className="w-3 h-3 mr-1 shrink-0" />
                        {ticket.fingerprintDevice}
                      </span>
                      <p className="text-[10px] text-slate-500 line-clamp-1 italic mt-0.5">
                        "{ticket.problemDescription}"
                      </p>
                    </td>

                    {/* AnyDesk ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-rose-600 text-xs bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          {ticket.anydeskId}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-2 text-[10px]">
                        <a
                          href={`anydesk:${ticket.anydeskId.replace(/\s+/g, '')}`}
                          className="text-blue-600 font-bold hover:underline inline-flex items-center"
                          title="Launch AnyDesk remote software"
                        >
                          <Monitor className="w-3 h-3 mr-0.5 text-rose-500" />
                          Launch AnyDesk
                        </a>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusPill(ticket.status)}
                      {ticket.assignedTechnician && (
                        <span className="text-[10px] text-slate-400 block mt-1 line-clamp-1">
                          Tech: {ticket.assignedTechnician}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Inspect detail */}
                        <button
                          onClick={() => setInspectTicket(ticket)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          title="View Complete Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Direct WhatsApp Chat */}
                        <a
                          href={getWhatsAppDirectUrl(ticket.mobileNo, generateTicketCreatedMessage(ticket, lang))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
                          title="Chat with CSP on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>

                        {/* In Progress Action */}
                        {ticket.status === 'pending' && (
                          <button
                            onClick={() => onUpdateTicketStatus(ticket.id, 'in_progress', 'Technician connected via AnyDesk.', 'Ajay Sharma (Tech Lead)')}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition shadow-xs cursor-pointer flex items-center space-x-1"
                          >
                            <Clock className="w-3 h-3" />
                            <span>{lang === 'hi' ? 'प्रगति पर लें' : 'Take In Progress'}</span>
                          </button>
                        )}

                        {/* Resolve Action */}
                        {ticket.status !== 'resolved' && (
                          <button
                            onClick={() => setSelectedTicketForResolve(ticket)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs cursor-pointer flex items-center space-x-1"
                            id={`btn-resolve-${ticket.id}`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{lang === 'hi' ? 'हल करें' : 'Resolve'}</span>
                          </button>
                        )}

                        {ticket.status === 'resolved' && (
                          <button
                            onClick={() => setSelectedTicketForResolve(ticket)}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-emerald-800 font-bold text-[10px] border border-emerald-200 transition cursor-pointer"
                            title="Resend WhatsApp Resolution Message"
                          >
                            WhatsApp Alert
                          </button>
                        )}

                        {/* Delete Single Ticket */}
                        <button
                          onClick={() => handleDeleteSingleTicket(ticket)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title={lang === 'hi' ? 'टिकट डिलीट करें' : 'Delete Ticket'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Ticket Detail Drawer / Modal */}
      {inspectTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 text-left space-y-4 animate-fade-in">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-800">#{inspectTicket.id}</span>
                <h3 className="text-lg font-bold text-slate-900">{inspectTicket.name} ({inspectTicket.koId})</h3>
                <p className="text-xs text-slate-500">{inspectTicket.bankName} - {inspectTicket.branchName}</p>
              </div>
              <button 
                onClick={() => setInspectTicket(null)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block">Mobile No:</span>
                <span className="font-bold text-slate-900 text-sm">+91 {inspectTicket.mobileNo}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block">AnyDesk ID:</span>
                <span className="font-mono font-bold text-rose-600 text-sm">{inspectTicket.anydeskId}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block">Biometric Device:</span>
                <span className="font-bold text-slate-900">{inspectTicket.fingerprintDevice}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block">Location:</span>
                <span className="font-bold text-slate-900">{inspectTicket.bcLocation}, {inspectTicket.district}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-bold block mb-1">Problem Description:</span>
              <p className="text-slate-800 leading-relaxed font-medium">{inspectTicket.problemDescription}</p>
              {inspectTicket.screenshotUrl && (
                <div className="mt-2">
                  <img src={inspectTicket.screenshotUrl} alt="Error screenshot" className="max-h-40 rounded-lg border border-slate-300" />
                </div>
              )}
            </div>

            {inspectTicket.resolutionRemarks && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                <span className="text-emerald-800 font-bold block mb-1">Resolution Remarks:</span>
                <p className="font-medium">{inspectTicket.resolutionRemarks}</p>
                <span className="text-[10px] text-emerald-700 block mt-1">Resolved by: {inspectTicket.resolvedBy || 'Technical Lead'}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center space-x-2">
                <a
                  href={getWhatsAppDirectUrl(inspectTicket.mobileNo, generateTicketCreatedMessage(inspectTicket, lang))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                  WhatsApp Chat
                </a>

                <button
                  onClick={() => handleDeleteSingleTicket(inspectTicket)}
                  className="inline-flex items-center px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition cursor-pointer"
                  title="Delete ticket"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span>{lang === 'hi' ? 'हटाएं' : 'Delete'}</span>
                </button>
              </div>

              <button
                onClick={() => setInspectTicket(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolution & WhatsApp Notification Trigger Modal */}
      <ResolutionModal
        isOpen={Boolean(selectedTicketForResolve)}
        ticket={selectedTicketForResolve}
        onClose={() => setSelectedTicketForResolve(null)}
        onConfirmResolve={(ticketId, remarks, techName) => {
          onUpdateTicketStatus(ticketId, 'resolved', remarks, techName);
          setSelectedTicketForResolve(null);
        }}
        lang={lang}
      />

      {/* User Management Modal */}
      <UserManagementModal
        lang={lang}
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />

      {/* History Cleanup & Retention Modal */}
      <HistoryCleanupModal
        lang={lang}
        isOpen={isCleanupModalOpen}
        onClose={() => setIsCleanupModalOpen(false)}
        tickets={tickets}
        onTicketsUpdated={onRefresh}
        onExportCSV={handleExportCSV}
      />

      {/* UI Customizer & Form Field Controller Modal */}
      <UICustomizerModal
        lang={lang}
        isOpen={isUICustomizerOpen}
        onClose={() => setIsUICustomizerOpen(false)}
        currentConfig={uiConfig || DEFAULT_UI_CONFIG}
        onSaveConfig={onSaveUIConfig}
        onResetDefaults={onResetUIConfig}
        onConfigUpdated={() => {
          onRefresh();
        }}
      />

      {/* Google Blog (Blogger.com) Live Integration Modal */}
      <GoogleBlogLiveModal
        lang={lang}
        isOpen={isGoogleBlogModalOpen}
        onClose={() => setIsGoogleBlogModalOpen(false)}
      />
    </div>
  );
};
