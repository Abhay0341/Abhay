import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Monitor, 
  Fingerprint, 
  Building2, 
  User, 
  Phone, 
  Send, 
  Printer, 
  Star, 
  Share2,
  Calendar,
  Wrench,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Language, Ticket } from '../types';
import { translations } from '../translations';
import { generateTicketResolvedMessage, getWhatsAppDirectUrl } from '../utils/whatsapp';

interface TicketTrackingViewProps {
  lang: Language;
  tickets: Ticket[];
  onRefresh: () => void;
  onUpdateTicketRating?: (id: string, rating: number) => void;
}

export const TicketTrackingView: React.FC<TicketTrackingViewProps> = ({
  lang,
  tickets,
  onRefresh,
  onUpdateTicketRating
}) => {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeRating, setActiveRating] = useState<number>(5);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);

  // Filtered tickets based on search query or default to recent
  const matchedTickets = searchQuery.trim()
    ? tickets.filter(tk => 
        tk.koId.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        tk.mobileNo.includes(searchQuery.trim()) ||
        tk.id.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        tk.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : tickets.slice(0, 10);

  const selectedTicket = selectedTicketId 
    ? tickets.find(tk => tk.id === selectedTicketId) 
    : matchedTickets[0] || null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    if (matchedTickets.length > 0) {
      setSelectedTicketId(matchedTickets[0].id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            {t.statusResolved}
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-300 animate-pulse">
            <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" />
            {t.statusInProgress}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
            {t.statusRejected}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
            {t.statusPending}
          </span>
        );
    }
  };

  // Print Ticket function
  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="max-w-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            {t.trackHeading}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.trackSubheading}
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="mt-5 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              id="input-track-search"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer flex items-center justify-center space-x-1.5"
            id="btn-track-search"
          >
            <Search className="w-4 h-4" />
            <span>{t.searchButton}</span>
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="px-3.5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer flex items-center justify-center"
            title="Refresh tickets from server"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </form>
      </div>

      {matchedTickets.length === 0 && hasSearched ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {t.noTicketsFound}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {lang === 'hi'
              ? 'कृपया अपनी सही KO ID (जैसे 1A948201) या 10 अंकों का मोबाइल नंबर जांच कर दोबारा खोजें।'
              : 'Please check your KO ID or 10-digit mobile number and search again.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List Sidebar */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1">
              {lang === 'hi' ? `उपलब्ध टिकट (${matchedTickets.length})` : `Available Tickets (${matchedTickets.length})`}
            </h3>

            <div className="space-y-2.5">
              {matchedTickets.map((ticket) => {
                const isSelected = selectedTicket?.id === ticket.id;
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 shadow-xs ring-1 ring-blue-500'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-bold text-blue-900">
                        {ticket.id}
                      </span>
                      {getStatusBadge(ticket.status)}
                    </div>

                    <p className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">
                      {ticket.name} • {ticket.koId}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {ticket.bankName}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-1 italic">
                      "{ticket.problemDescription}"
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{new Date(ticket.createdAt).toLocaleDateString('en-IN')}</span>
                      <span className="font-mono text-rose-600 font-bold">{ticket.anydeskId}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ticket Full Detail Panel */}
          {selectedTicket ? (
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 print:shadow-none print:border-none">
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800">
                      #{selectedTicket.id}
                    </span>
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2 font-display">
                    {selectedTicket.name} ({selectedTicket.koId})
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedTicket.bcLocation}, {selectedTicket.district}, {selectedTicket.state}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrintTicket}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center space-x-1"
                    title={t.printReceipt}
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.printReceipt}</span>
                  </button>
                </div>
              </div>

              {/* Real-time Timeline Progress Stepper */}
              <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4">
                  {lang === 'hi' ? 'समाधान प्रगति (Live Timeline)' : 'Live Resolution Timeline'}
                </h4>

                <div className="grid grid-cols-4 gap-2 text-center relative">
                  {/* Step 1: Registered */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      1
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 mt-2">
                      {t.timelineSubmitted}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(selectedTicket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Step 2: Assigned */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                      selectedTicket.assignedTechnician || selectedTicket.status !== 'pending'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      2
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 mt-2">
                      {t.timelineAssigned}
                    </span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">
                      {selectedTicket.assignedTechnician || 'Pending Lead'}
                    </span>
                  </div>

                  {/* Step 3: AnyDesk Remote In Progress */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                      selectedTicket.status === 'in_progress' || selectedTicket.status === 'resolved'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      3
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 mt-2">
                      {t.timelineInProgress}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {selectedTicket.status === 'in_progress' ? 'Active Remote' : (selectedTicket.status === 'resolved' ? 'Completed' : 'Queue')}
                    </span>
                  </div>

                  {/* Step 4: Resolved */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                      selectedTicket.status === 'resolved'
                        ? 'bg-emerald-600 text-white animate-bounce'
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      4
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 mt-2">
                      {t.timelineResolved}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {selectedTicket.resolvedAt ? new Date(selectedTicket.resolvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resolved Celebration & WhatsApp Confirmation Alert */}
              {selectedTicket.status === 'resolved' && (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 sm:p-6 text-emerald-950 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-xs">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-emerald-950">
                          {lang === 'hi' ? '✅ समस्या ठीक हो चुकी है! (Issue Resolved)' : '✅ Technical Problem Resolved & Verified!'}
                        </h4>
                        <p className="text-xs text-emerald-800 mt-0.5">
                          {lang === 'hi' 
                            ? `समाधान समय: ${selectedTicket.resolvedAt ? new Date(selectedTicket.resolvedAt).toLocaleString('en-IN') : 'Just now'}`
                            : `Resolved on: ${selectedTicket.resolvedAt ? new Date(selectedTicket.resolvedAt).toLocaleString('en-IN') : 'Just now'}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Resolution Remarks Box */}
                  <div className="bg-white rounded-xl p-4 border border-emerald-200 text-xs sm:text-sm text-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                      {t.resolutionNotes}:
                    </span>
                    <p className="font-medium leading-relaxed">
                      {selectedTicket.resolutionRemarks || (lang === 'hi' ? 'डिवाइस RD सर्विस री-रजिस्टर की गई और टेस्ट ट्रांजेक्शन सफल रहा।' : 'Device RD Service re-registered and test transaction successful.')}
                    </p>
                    {selectedTicket.resolvedBy && (
                      <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">
                        👨‍💻 {lang === 'hi' ? 'इंजीनियर:' : 'Technician:'} <span className="font-bold text-slate-900">{selectedTicket.resolvedBy}</span>
                      </p>
                    )}
                  </div>

                  {/* WhatsApp Notification Trigger to Megnot Operator */}
                  <div className="pt-2 flex flex-wrap gap-2.5">
                    <a
                      href={getWhatsAppDirectUrl(selectedTicket.mobileNo, generateTicketResolvedMessage(selectedTicket, lang))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {lang === 'hi' ? 'व्हाट्सएप पर रसीद / सूचना प्राप्त करें' : 'Open WhatsApp Resolution Summary'}
                    </a>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generateTicketResolvedMessage(selectedTicket, lang));
                        alert(lang === 'hi' ? 'समाधान संदेश क्लिपबोर्ड में कॉपी हो गया!' : 'Resolution text copied to clipboard!');
                      }}
                      className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-emerald-900 border border-emerald-300 text-xs sm:text-sm font-semibold transition cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 mr-2 text-emerald-700" />
                      {lang === 'hi' ? 'समाधान टेक्स्ट कॉपी करें' : 'Copy Resolution Message'}
                    </button>
                  </div>
                </div>
              )}

              {/* Complete Ticket Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block font-medium">Bank & Branch:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedTicket.bankName}</span>
                  <p className="text-slate-600 mt-0.5">{selectedTicket.branchName}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block font-medium">Biometric Device:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedTicket.fingerprintDevice}</span>
                  {selectedTicket.deviceSerial && (
                    <p className="text-slate-500 font-mono mt-0.5">S/N: {selectedTicket.deviceSerial}</p>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block font-medium">AnyDesk Remote ID:</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-mono font-bold text-base text-rose-600">{selectedTicket.anydeskId}</span>
                    <a
                      href={`anydesk:${selectedTicket.anydeskId.replace(/\s+/g, '')}`}
                      className="text-[11px] text-blue-600 font-bold hover:underline flex items-center"
                    >
                      Launch <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block font-medium">Contact Mobile:</span>
                  <span className="font-bold text-slate-900 text-sm">+91 {selectedTicket.mobileNo}</span>
                  <p className="text-slate-500 mt-0.5">Operator: {selectedTicket.name}</p>
                </div>
              </div>

              {/* Problem Description Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider mb-1">
                  {lang === 'hi' ? 'दर्ज की गई समस्या:' : 'Reported Technical Problem:'}
                </span>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  {selectedTicket.problemDescription}
                </p>
                {selectedTicket.screenshotUrl && (
                  <div className="mt-3">
                    <span className="text-xs text-slate-400 block mb-1">Attached Screenshot:</span>
                    <img
                      src={selectedTicket.screenshotUrl}
                      alt="Error Attachment"
                      className="max-h-48 rounded-lg border border-slate-200 object-contain bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Rating Component */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">{t.giveFeedback}</h5>
                  <p className="text-[11px] text-slate-500">
                    {lang === 'hi' ? 'क्या आपकी समस्या का सही समाधान हुआ?' : 'How satisfied are you with the technical resolution?'}
                  </p>
                </div>

                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setActiveRating(star);
                        setRatingSubmitted(true);
                        if (onUpdateTicketRating) onUpdateTicketRating(selectedTicket.id, star);
                      }}
                      className="p-1 text-amber-400 hover:scale-110 transition cursor-pointer"
                    >
                      <Star className={`w-5 h-5 ${star <= activeRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                  {ratingSubmitted && (
                    <span className="text-xs text-emerald-600 font-bold ml-2">
                      {t.feedbackThankYou}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
