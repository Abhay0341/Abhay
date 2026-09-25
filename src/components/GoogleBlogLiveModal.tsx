import React, { useState } from 'react';
import { 
  Globe, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  BookOpen, 
  Code2, 
  Sparkles, 
  Layout, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Monitor
} from 'lucide-react';
import { Language } from '../types';

interface GoogleBlogLiveModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleBlogLiveModal: React.FC<GoogleBlogLiveModalProps> = ({
  lang,
  isOpen,
  onClose
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'page' | 'redirect' | 'widget' | 'googlesites' | 'preview'>('page');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  // The official permanent shared production URL
  const productionUrl = "https://ais-pre-unyzbnyghfzdkbsjjjxcek-161980697218.asia-southeast1.run.app";
  const liveUrl = (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost'))
    ? window.location.origin
    : productionUrl;

  // 1. Full-Page Blogger Embed Snippet
  const bloggerPageEmbedCode = 
`<!-- MEGNOT TECHNICAL SUPPORT PORTAL - BLOGGER FULL PAGE EMBED -->
<div style="position:relative;width:100%;height:100vh;min-height:900px;overflow:hidden;border:none;margin:0;padding:0;">
  <iframe 
    src="${liveUrl}" 
    style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.08);"
    allow="clipboard-write; clipboard-read; camera; microphone; geolocation"
    loading="lazy"
    title="Megnot Technical Support Portal">
  </iframe>
</div>
<!-- /MEGNOT TECHNICAL SUPPORT PORTAL -->`;

  // 2. Blogger Sidebar / Menu Button Widget Snippet
  const bloggerWidgetCode = 
`<!-- MEGNOT SUPPORT DESK BUTTON FOR BLOGGER SIDEBAR / HEADER -->
<div style="background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);padding:18px;border-radius:16px;text-align:center;box-shadow:0 8px 24px rgba(15,23,42,0.15);font-family:sans-serif;color:#ffffff;">
  <div style="font-size:16px;font-weight:700;margin-bottom:6px;">🛠️ Megnot Technical Support</div>
  <p style="font-size:12px;color:#cbd5e1;margin:0 0 14px 0;">CSP & BC Kiosk Biometric, RD Service & Remote Support</p>
  <a href="${liveUrl}" target="_blank" rel="noopener noreferrer" 
     style="display:inline-block;background:#2563eb;color:#ffffff;padding:10px 22px;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none;box-shadow:0 4px 12px rgba(37,99,235,0.4);">
    🚀 ओपन सपोर्ट पोर्टल (Open Support Desk) →
  </a>
</div>`;

  // 3. Auto Redirect Snippet
  const bloggerRedirectCode = 
`<!-- OPTIONAL: AUTOMATIC REDIRECT TO MEGNOT SUPPORT PORTAL -->
<script type="text/javascript">
  window.location.replace("${liveUrl}");
</script>`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-5 sm:p-6 text-white flex justify-between items-start sm:items-center">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg sm:text-xl font-display text-white">
                  {lang === 'hi' ? 'Google Blog (Blogger) पर लाइव करें' : 'Go Live on Google Blog (Blogger.com)'}
                </h3>
                <span className="text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  100% Fully Functional
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                {lang === 'hi' 
                  ? 'अपने Blogger.com ब्लॉग (जैसे yourname.blogspot.com) पर इस पूरे सपोर्ट पोर्टल को लाइव चलाएं ताकि ऑपरेटर सीधे वहीं से टिकट दर्ज व ट्रैक कर सकें।' 
                  : 'Embed and run this technical support desk inside your Blogger blog or Google Site so CSP operators can use it directly.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live URL Pill Banner */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">{lang === 'hi' ? '🌐 आपकी लाइव प्रोडक्शन लिंक:' : '🌐 Live Production URL:'}</span>
            <code className="bg-white border border-slate-300 px-2.5 py-1 rounded-md text-blue-700 font-mono font-bold text-[11px] truncate max-w-[280px] sm:max-w-md">
              {liveUrl}
            </code>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => handleCopy(liveUrl, 'live_url')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold flex items-center space-x-1 cursor-pointer transition text-[11px]"
            >
              {copiedCode === 'live_url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === 'live_url' ? (lang === 'hi' ? 'कॉपी हुआ!' : 'Copied!') : (lang === 'hi' ? 'लिंक कॉपी करें' : 'Copy Link')}</span>
            </button>

            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-1 transition text-[11px]"
            >
              <span>{lang === 'hi' ? 'नई टैब में खोलें' : 'Open in New Tab'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-5 pt-3 bg-white space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('page')}
            className={`pb-2.5 px-3 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 cursor-pointer ${
              activeSubTab === 'page'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>{lang === 'hi' ? '1. ब्लॉगर फुल पेज (अनुशंसित)' : '1. Blogger Full Page (Recommended)'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('redirect')}
            className={`pb-2.5 px-3 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 cursor-pointer ${
              activeSubTab === 'redirect'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            <span>{lang === 'hi' ? '2. ऑटो रीडायरेक्ट (Auto Redirect)' : '2. Blogger Auto Redirect'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('widget')}
            className={`pb-2.5 px-3 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 cursor-pointer ${
              activeSubTab === 'widget'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>{lang === 'hi' ? '3. साइडबार बटन गैजेट' : '3. Sidebar / Menu Widget'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('googlesites')}
            className={`pb-2.5 px-3 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 cursor-pointer ${
              activeSubTab === 'googlesites'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{lang === 'hi' ? '4. Google Sites' : '4. Google Sites Live'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('preview')}
            className={`pb-2.5 px-3 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 cursor-pointer ${
              activeSubTab === 'preview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>{lang === 'hi' ? '5. लाइव प्रिव्यू' : '5. Live Preview'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {activeSubTab === 'page' && (
            <div className="space-y-5">
              {/* Step-by-Step Instructions */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-3.5">
                <h4 className="font-bold text-sm text-blue-950 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-700" />
                  <span>
                    {lang === 'hi' 
                      ? 'Blogger.com पर फुल पेज बनाने के 4 सरल चरण:' 
                      : '4 Easy Steps to embed on Blogger.com as a Full Page:'}
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                  <div className="bg-white p-3 rounded-xl border border-blue-100 flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div>
                      <strong className="block text-slate-900">Blogger.com खोलें:</strong>
                      <span>अपने Google अकाउंट से <a href="https://blogger.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">blogger.com</a> खोलें और अपने ब्लॉग का चयन करें।</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-blue-100 flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div>
                      <strong className="block text-slate-900">नया पेज (New Page) बनाएं:</strong>
                      <span>बाएं मेनू में <strong>"Pages" (पेज)</strong> पर क्लिक करें, फिर ऊपर <strong>"+ New page"</strong> दबाएं।</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-blue-100 flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <div>
                      <strong className="block text-slate-900">HTML View चुनें:</strong>
                      <span>पेज का टाइटल <code>Megnot Technical Support</code> दें। फिर ऊपर बाईं ओर पेन/पेंसिल (✏️) आइकन दबाकर <strong>"HTML view" (&lt;&gt;)</strong> चुनें।</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-blue-100 flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <div>
                      <strong className="block text-slate-900">कोड पेस्ट करके Publish करें:</strong>
                      <span>नीचे दिया गया कोड कॉपी करके पेस्ट करें और ऊपर दाईं ओर <strong>"Publish"</strong> दबाएं! बस, लाइव चालू हो गया!</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Code Box */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'hi' ? 'ब्लॉगर पेज के लिए तैयार HTML कोड:' : 'Ready-to-paste HTML Code for Blogger Page:'}</span>
                  </label>
                  <button
                    onClick={() => handleCopy(bloggerPageEmbedCode, 'blogger_page')}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
                  >
                    {copiedCode === 'blogger_page' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'blogger_page' ? (lang === 'hi' ? 'कोड कॉपी हो गया!' : 'Code Copied!') : (lang === 'hi' ? '📋 पूरा कोड कॉपी करें' : '📋 Copy Embed Code')}</span>
                  </button>
                </div>

                <div className="relative">
                  <pre className="bg-slate-900 text-emerald-300 font-mono text-[11px] sm:text-xs p-4 rounded-2xl overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
                    <code>{bloggerPageEmbedCode}</code>
                  </pre>
                </div>

                <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {lang === 'hi' 
                      ? 'यह कोड पूरी तरह रेस्पॉन्सिव है और मोबाइल व कंप्यूटर दोनों पर 100% फुल-स्क्रीन फिट होकर काम करता है।' 
                      : 'This embed is fully responsive, auto-scales on both mobile and desktop screens.'}
                  </span>
                </p>
              </div>
            </div>
          )}

          {activeSubTab === 'redirect' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 text-xs text-emerald-950 space-y-3">
                <h4 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-emerald-700" />
                  <span>
                    {lang === 'hi'
                      ? 'ब्लॉगर वेबसाइट पर आते ही सीधे सपोर्ट पोर्टल खोलने का तरीका (Auto Redirect):'
                      : 'Automatic Redirect Method (Blogger Domain forwards to Portal):'}
                  </span>
                </h4>
                <p className="text-slate-700">
                  {lang === 'hi'
                    ? 'अगर आप चाहते हैं कि कोई भी आपके ब्लॉगर एड्रेस (जैसे yourname.blogspot.com) पर जाए, तो वह तुरंत सीधे इस लाइव सपोर्ट पोर्टल पर पहुंच जाए, तो ब्लॉगर की थीम (Theme) में यह छोटा सा कोड लगा दें:'
                    : 'If you want anyone visiting your Blogger blog domain (e.g. yourname.blogspot.com) to immediately be routed to the live Megnot Support Portal, paste this script in your Blogger Theme.'}
                </p>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 space-y-1.5 text-slate-700">
                  <div className="font-bold text-slate-900">कदम-दर-कदम प्रक्रिया (Steps):</div>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Blogger.com पर लॉगिन करें और बाएं मेनू से <strong>"Theme" (थीम)</strong> पर क्लिक करें।</li>
                    <li><strong>"Customize"</strong> के पास वाले ड्रॉपडाउन तीर (▼) पर क्लिक करके <strong>"Edit HTML"</strong> चुनें।</li>
                    <li>कोड में सबसे ऊपर <code>&lt;head&gt;</code> टैग खोजें।</li>
                    <li><code>&lt;head&gt;</code> के ठीक नीचे निम्नलिखित कोड पेस्ट करके ऊपर दाईं ओर <strong>Save (💾)</strong> बटन दबा दें!</li>
                  </ol>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    {lang === 'hi' ? 'ब्लॉगर ऑटो-रीडायरेक्ट स्क्रिप्ट:' : 'Blogger Auto-Redirect Script:'}
                  </span>
                  <button
                    onClick={() => handleCopy(bloggerRedirectCode, 'redirect_code')}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
                  >
                    {copiedCode === 'redirect_code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'redirect_code' ? (lang === 'hi' ? 'कॉपी हुआ!' : 'Copied!') : (lang === 'hi' ? '📋 रीडायरेक्ट कोड कॉपी करें' : '📋 Copy Script')}</span>
                  </button>
                </div>

                <pre className="bg-slate-900 text-emerald-300 font-mono text-[11px] sm:text-xs p-4 rounded-2xl overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
                  <code>{bloggerRedirectCode}</code>
                </pre>
              </div>
            </div>
          )}

          {activeSubTab === 'widget' && (
            <div className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
                <h4 className="font-bold text-sm text-amber-900">
                  {lang === 'hi' ? 'ब्लॉगर साइडबार या हेडर में सपोर्ट बटन कैसे लगाएं:' : 'How to add a Support Desk button in Blogger sidebar/header:'}
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-700">
                  <li>Blogger.com पर जाएं और बाएं मेनू से <strong>"Layout" (लेआउट)</strong> चुनें।</li>
                  <li>साइडबार (Sidebar) में <strong>"+ Add a Gadget" (गैजेट जोड़ें)</strong> पर क्लिक करें।</li>
                  <li>सूची में से <strong>"HTML/JavaScript"</strong> चुनें।</li>
                  <li>टाइटल में <code>Technical Support Desk</code> लिखें और नीचे दिया गया कोड पेस्ट करके <strong>"Save"</strong> करें!</li>
                </ol>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">{lang === 'hi' ? 'साइडबार बटन HTML कोड:' : 'Sidebar Widget HTML Code:'}</span>
                  <button
                    onClick={() => handleCopy(bloggerWidgetCode, 'widget')}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    {copiedCode === 'widget' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'widget' ? (lang === 'hi' ? 'कॉपी हुआ!' : 'Copied!') : (lang === 'hi' ? '📋 कोड कॉपी करें' : '📋 Copy Widget Code')}</span>
                  </button>
                </div>

                <pre className="bg-slate-900 text-amber-300 font-mono text-[11px] sm:text-xs p-4 rounded-2xl overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
                  <code>{bloggerWidgetCode}</code>
                </pre>
              </div>
            </div>
          )}

          {activeSubTab === 'googlesites' && (
            <div className="space-y-4">
              <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-5 text-xs text-purple-950 space-y-3">
                <h4 className="font-bold text-sm text-purple-900">
                  {lang === 'hi' ? 'Google Sites (sites.google.com) पर लाइव करने के 3 चरण:' : '3 Steps to Go Live on Google Sites:'}
                </h4>

                <div className="space-y-2.5 text-slate-700">
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-purple-700">1.</span>
                    <span><a href="https://sites.google.com" target="_blank" rel="noopener noreferrer" className="text-purple-700 font-bold underline">sites.google.com</a> खोलें और अपनी साइट एडिट मोड में खोलें।</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-purple-700">2.</span>
                    <span>दाएँ पैनल में <strong>"Insert" &gt; "Embed" (&lt;&gt;)</strong> पर क्लिक करें।</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-purple-700">3.</span>
                    <span><strong>"By URL"</strong> टैब चुनें और नीचे दिया गया लाइव लिंक पेस्ट करके <strong>"Insert"</strong> दबाएं:</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-purple-200 flex items-center justify-between gap-2 mt-2">
                  <code className="text-purple-800 font-mono font-bold text-xs truncate">
                    {liveUrl}
                  </code>
                  <button
                    onClick={() => handleCopy(liveUrl, 'gsites_url')}
                    className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer"
                  >
                    {copiedCode === 'gsites_url' ? 'कॉपी हुआ!' : 'कॉपी करें'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'preview' && (
            <div className="space-y-3">
              <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">https://yourblog.blogspot.com/p/megnot-support.html</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  Blogger Simulation
                </span>
              </div>

              <div className="w-full h-[550px] rounded-2xl overflow-hidden border border-slate-300 shadow-md">
                <iframe
                  src={liveUrl}
                  className="w-full h-full border-none"
                  title="Live Preview"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {lang === 'hi' 
                ? 'ब्लॉगर पर लाइव होने के बाद भी सारे एडमिन बदलाव तुरंत अपडेट होंगे।' 
                : 'All changes made in Admin will sync live instantly on Blogger.'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            {lang === 'hi' ? 'समझ गए, बंद करें (Done)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
