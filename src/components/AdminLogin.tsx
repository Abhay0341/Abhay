import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  KeyRound, 
  AlertCircle, 
  ArrowRight,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Copy,
  PhoneCall,
  X
} from 'lucide-react';
import { MegnotEmblem } from './MegnotLogo';
import { Language } from '../types';
import { translations } from '../translations';
import { SUPER_ADMIN_MOBILE, getSuperAdminWhatsAppUrl, generateSuperAdminResetRequestMessage } from '../utils/whatsapp';

interface AdminLoginProps {
  lang: Language;
  onLoginSuccess: () => void;
  onCancel?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  lang,
  onLoginSuccess,
  onCancel
}) => {
  const t = translations[lang];
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Forgot Password / WhatsApp Reset States
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotInput, setForgotInput] = useState<string>('');
  const [forgotLoading, setForgotLoading] = useState<boolean>(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotResult, setForgotResult] = useState<{
    newPassword?: string;
    username?: string;
    name?: string;
    mobileNo?: string;
    userWhatsAppUrl?: string;
    superAdminWhatsAppUrl?: string;
    message?: string;
  } | null>(null);
  const [copiedForgotPass, setCopiedForgotPass] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg(lang === 'hi' ? 'कृपया यूज़र आईडी और पासवर्ड दोनों दर्ज करें।' : 'Please enter both User ID and Password.');
      return;
    }

    setIsLoading(true);

    try {
      // Try server login first
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: cleanPass })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (rememberMe) {
            localStorage.setItem('megnot_admin_auth', 'true');
            localStorage.setItem('megnot_admin_user', cleanUser);
          } else {
            sessionStorage.setItem('megnot_admin_auth', 'true');
            sessionStorage.setItem('megnot_admin_user', cleanUser);
          }
          onLoginSuccess();
          return;
        }
      }

      // Offline / Direct verification fallback
      if (cleanUser.toLowerCase() === 'megnottech' && cleanPass === 'Abhay0341') {
        if (rememberMe) {
          localStorage.setItem('megnot_admin_auth', 'true');
          localStorage.setItem('megnot_admin_user', cleanUser);
        } else {
          sessionStorage.setItem('megnot_admin_auth', 'true');
          sessionStorage.setItem('megnot_admin_user', cleanUser);
        }
        onLoginSuccess();
      } else {
        setErrorMsg(t.adminLoginError);
      }
    } catch {
      // Client-side fallback if server is unreachable
      if (cleanUser.toLowerCase() === 'megnottech' && cleanPass === 'Abhay0341') {
        if (rememberMe) {
          localStorage.setItem('megnot_admin_auth', 'true');
        } else {
          sessionStorage.setItem('megnot_admin_auth', 'true');
        }
        onLoginSuccess();
      } else {
        setErrorMsg(t.adminLoginError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotResult(null);

    const inputVal = forgotInput.trim();
    if (!inputVal) {
      setForgotError(lang === 'hi' ? 'कृपया अपनी यूज़र आईडी या मोबाइल नंबर दर्ज करें।' : 'Please enter your User ID or mobile number.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: inputVal })
      });
      const data = await res.json();

      if (data.success) {
        setForgotResult({
          newPassword: data.newPassword,
          username: data.username,
          name: data.name,
          mobileNo: data.mobileNo,
          userWhatsAppUrl: data.userWhatsAppUrl,
          superAdminWhatsAppUrl: data.superAdminWhatsAppUrl,
          message: data.message
        });
      } else {
        setForgotError(data.message || 'Account not found.');
        if (data.superAdminWhatsAppUrl) {
          setForgotResult({
            superAdminWhatsAppUrl: data.superAdminWhatsAppUrl
          });
        }
      }
    } catch (err: any) {
      setForgotError(err.message || 'Error processing password reset');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCopyForgotPass = (pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedForgotPass(true);
    setTimeout(() => setCopiedForgotPass(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-7 text-white text-center relative">
          <div className="flex items-center justify-center gap-3 mb-3">
            <MegnotEmblem size={46} className="bg-white/95 shadow-md border-0" />
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600/30 border border-blue-400/30 text-amber-400 shadow-inner">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white">
            {t.adminLoginTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-md mx-auto leading-relaxed">
            {t.adminLoginSub}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/50 text-[11px] font-medium text-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.adminSecurityNotice}</span>
          </div>
        </div>

        {/* Login Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{lang === 'hi' ? 'प्रवेश अस्वीकृत' : 'Authentication Failed'}</p>
                <p className="text-xs text-red-600 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* User ID */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t.adminUserIdLabel}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.adminUserIdPlaceholder}
                autoCapitalize="none"
                autoCorrect="off"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {t.adminPasswordLabel}
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotInput(username);
                  setForgotResult(null);
                  setForgotError(null);
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
              >
                {t.forgotPasswordLink}
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.adminPasswordPlaceholder}
                required
                className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
              />
              <span>{t.adminRememberMe}</span>
            </label>

            <a
              href={getSuperAdminWhatsAppUrl(generateSuperAdminResetRequestMessage(username || 'Megnot User', lang))}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-1"
              title="WhatsApp Super Admin"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp: {SUPER_ADMIN_MOBILE}</span>
            </a>
          </div>

          {/* Submit Button */}
          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <span>{lang === 'hi' ? 'सत्यापन हो रहा है...' : 'Verifying...'}</span>
              ) : (
                <>
                  <span>{t.adminLoginBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                {lang === 'hi' ? '← वापस सहायता फॉर्म पर जाएं' : '← Back to Support Form'}
              </button>
            )}
          </div>
        </form>

        {/* Forgot Password Modal / Drawer */}
        {showForgotModal && (
          <div className="p-6 bg-slate-50 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-2 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <span>{lang === 'hi' ? 'WhatsApp पासवर्ड रीसेट' : 'WhatsApp Password Reset'}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {!forgotResult ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <p className="text-xs text-slate-600">
                  {lang === 'hi' 
                    ? 'अपनी यूज़र आईडी (जैसे Megnottech, ajay_tech) या रजिस्टर्ड मोबाइल नंबर दर्ज करें। एक नया डिफ़ॉल्ट पासवर्ड तैयार कर आपके WhatsApp पर भेजा जाएगा।'
                    : 'Enter your User ID (e.g. Megnottech, ajay_tech) or registered mobile. A fresh default password will be generated and dispatched to your WhatsApp.'}
                </p>

                <div>
                  <input
                    type="text"
                    required
                    value={forgotInput}
                    onChange={(e) => setForgotInput(e.target.value)}
                    placeholder={t.enterUsernameOrMobile}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{forgotLoading ? 'Generating...' : t.requestResetBtn}</span>
                  </button>

                  <a
                    href={getSuperAdminWhatsAppUrl(generateSuperAdminResetRequestMessage(forgotInput || 'Megnot User', lang))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t.superAdminContactBtn}</span>
                  </a>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {forgotResult.newPassword && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        {lang === 'hi' ? `नया डिफ़ॉल्ट पासवर्ड तैयार किया गया:` : `New default password generated:`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-white border border-emerald-200 px-3 py-2 rounded-lg font-mono text-sm font-bold text-slate-900">
                      <span>{forgotResult.newPassword}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyForgotPass(forgotResult.newPassword!)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-sans font-bold flex items-center space-x-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedForgotPass ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-emerald-700">
                      {lang === 'hi' 
                        ? `यूज़र: ${forgotResult.name} (${forgotResult.username})` 
                        : `User: ${forgotResult.name} (${forgotResult.username})`}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  {forgotResult.userWhatsAppUrl && (
                    <a
                      href={forgotResult.userWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{lang === 'hi' ? 'WhatsApp पर पासवर्ड प्राप्त करें' : 'Get Password on WhatsApp'}</span>
                    </a>
                  )}

                  {forgotResult.superAdminWhatsAppUrl && (
                    <a
                      href={forgotResult.superAdminWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>Super Admin (7001335445)</span>
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (forgotResult.newPassword) {
                      setPassword(forgotResult.newPassword);
                      if (forgotResult.username) setUsername(forgotResult.username);
                    }
                    setShowForgotModal(false);
                  }}
                  className="w-full py-2 text-xs font-bold text-blue-600 hover:text-blue-800 text-center block"
                >
                  {lang === 'hi' ? '← इस पासवर्ड से लॉगिन फॉर्म भरें' : '← Use this password to login'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer info banner */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Megnot Central Technical Desk</span>
          <span className="font-mono text-[11px] font-semibold text-slate-600">
            Super Admin: {SUPER_ADMIN_MOBILE}
          </span>
        </div>
      </div>
    </div>
  );
};

