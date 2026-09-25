import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Wrench, 
  Headphones, 
  X, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone, 
  KeyRound,
  AlertCircle,
  RefreshCw,
  UserCheck,
  MessageSquare,
  Copy,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Language, AdminUser, AdminUserRole } from '../types';
import { translations } from '../translations';
import { 
  SUPER_ADMIN_MOBILE, 
  getWhatsAppDirectUrl, 
  getWhatsAppWebUrl,
  openWhatsAppWeb,
  generateNewUserCredentialsMessage,
  generatePasswordResetMessage 
} from '../utils/whatsapp';

interface UserManagementModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  lang,
  isOpen,
  onClose
}) => {
  const t = translations[lang];

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // User creation WhatsApp dispatch state
  const [createdUserData, setCreatedUserData] = useState<{
    username: string;
    rawPassword?: string;
    name: string;
    role: string;
    mobileNo?: string;
    siteUrl: string;
    whatsappWebUrl: string;
    whatsappDirectUrl: string;
    whatsappMessage: string;
  } | null>(null);

  // Quick WhatsApp Dispatch Modal for existing user
  const [quickSendUser, setQuickSendUser] = useState<AdminUser | null>(null);
  const [quickSendPassword, setQuickSendPassword] = useState<string>('');

  // Password Reset State
  const [resettingUser, setResettingUser] = useState<AdminUser | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState<string>('');
  const [resetSuccessData, setResetSuccessData] = useState<{
    newPassword: string;
    whatsappUrl: string;
    whatsappWebUrl?: string;
    userName: string;
    mobileNo?: string;
    siteUrl?: string;
  } | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [copiedPass, setCopiedPass] = useState<boolean>(false);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Form State
  const [username, setUsername] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<AdminUserRole>('technician');
  const [mobileNo, setMobileNo] = useState<string>('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (err) {
      console.warn('Failed to fetch users from server, fallback to local users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSubmitError(null);
      setSubmitSuccess(null);
      setResettingUser(null);
      setResetSuccessData(null);
    }
  }, [isOpen]);

  const generateQuickPassword = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `Megnot@${randomSuffix}`;
  };

  const handleOpenResetModal = (user: AdminUser) => {
    setResettingUser(user);
    setResetNewPassword(generateQuickPassword());
    setResetSuccessData(null);
    setCopiedPass(false);
  };

  const handleExecutePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;

    setIsResetting(true);
    setSubmitError(null);

    const finalPass = resetNewPassword.trim() || generateQuickPassword();

    try {
      const res = await fetch(`/api/admin/users/${resettingUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword: finalPass,
          resetBy: 'Central Super Admin'
        })
      });
      const data = await res.json();

      if (data.success) {
        const liveSiteUrl = data.siteUrl || window.location.origin;
        setResetSuccessData({
          newPassword: data.newPassword || finalPass,
          whatsappUrl: data.whatsappUrl,
          whatsappWebUrl: data.whatsappWebUrl,
          userName: resettingUser.name,
          mobileNo: resettingUser.mobileNo,
          siteUrl: liveSiteUrl
        });
        setSubmitSuccess(
          lang === 'hi' 
            ? `${resettingUser.username} का पासवर्ड बदलकर '${data.newPassword || finalPass}' कर दिया गया है!` 
            : `Password for ${resettingUser.username} successfully reset to: ${data.newPassword || finalPass}`
        );
        fetchUsers();
      } else {
        setSubmitError(data.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Error communicating with server');
    } finally {
      setIsResetting(false);
    }
  };

  const handleCopyPassword = (pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleOpenQuickSend = (user: AdminUser) => {
    setQuickSendUser(user);
    setQuickSendPassword('');
  };

  const handleSendCredentialsViaWhatsAppWeb = (user: AdminUser, customPass?: string) => {
    const mobile = user.mobileNo || SUPER_ADMIN_MOBILE;
    const finalPass = (customPass && customPass.trim()) || "Pass as set by Super Admin";
    const liveSiteUrl = window.location.origin;
    const msg = generateNewUserCredentialsMessage({
      username: user.username,
      name: user.name,
      password: finalPass,
      role: user.role,
      mobileNo: mobile,
      portalUrl: liveSiteUrl,
      lang
    });
    openWhatsAppWeb(mobile, msg);
    setQuickSendUser(null);
  };

  const handleAddUser = async (e: React.FormEvent, sendToWhatsAppWeb = true) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanName = name.trim();
    const cleanMobile = mobileNo.trim();

    if (!cleanUsername || !cleanPassword || !cleanName) {
      setSubmitError(
        lang === 'hi' 
          ? 'कृपया यूज़र आईडी, पूरा नाम और पासवर्ड दर्ज करें।' 
          : 'Please enter User ID, Full Name and Password.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
          name: cleanName,
          role,
          mobileNo: cleanMobile || undefined
        })
      });
      const data = await res.json();

      if (data.success) {
        const liveSiteUrl = data.siteUrl || window.location.origin;
        const msg = data.whatsappMessage || generateNewUserCredentialsMessage({
          username: cleanUsername,
          name: cleanName,
          password: cleanPassword,
          role,
          mobileNo: cleanMobile,
          portalUrl: liveSiteUrl,
          lang
        });

        const webUrl = data.whatsappWebUrl || (cleanMobile ? getWhatsAppWebUrl(cleanMobile, msg) : '');
        const directUrl = data.whatsappDirectUrl || (cleanMobile ? getWhatsAppDirectUrl(cleanMobile, msg) : '');

        setCreatedUserData({
          username: cleanUsername,
          rawPassword: cleanPassword,
          name: cleanName,
          role,
          mobileNo: cleanMobile,
          siteUrl: liveSiteUrl,
          whatsappWebUrl: webUrl,
          whatsappDirectUrl: directUrl,
          whatsappMessage: msg
        });

        // Automatically open WhatsApp Web in new tab if mobile provided
        if (sendToWhatsAppWeb && webUrl) {
          window.open(webUrl, '_blank');
        }

        setSubmitSuccess(
          lang === 'hi' 
            ? `नया यूज़र '${cleanUsername}' (${cleanName}) बन गया और WhatsApp Web लिंक तैयार है!` 
            : `User '${cleanUsername}' created successfully! Ready to send via WhatsApp Web.`
        );

        setUsername('');
        setPassword('');
        setName('');
        setMobileNo('');
        setShowAddForm(false);
        fetchUsers();
      } else {
        setSubmitError(data.message || 'Failed to create user');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Server error while creating user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    if (user.isPrimaryAdmin) return;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive })
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (user.isPrimaryAdmin || user.username.toLowerCase() === 'megnottech') {
      alert(t.cannotDeletePrimaryAdmin);
      return;
    }

    if (!window.confirm(`${t.confirmDeleteUser} (${user.username} - ${user.name})`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(data.message || t.userDeletedSuccess);
        fetchUsers();
      } else {
        alert(data.message || 'Could not delete user');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting user');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-display text-white flex items-center gap-2">
                <span>{t.userManagementTitle}</span>
                <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  Super Admin: {SUPER_ADMIN_MOBILE}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                {t.userManagementSub}
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
          {/* Notifications */}
          {submitSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{submitSuccess}</span>
              </div>
              <button onClick={() => setSubmitSuccess(null)} className="text-emerald-600 hover:text-emerald-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {submitError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{submitError}</span>
              </div>
              <button onClick={() => setSubmitError(null)} className="text-rose-600 hover:text-rose-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Central Admin Power Notice Banner */}
          <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5 text-blue-950">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <span className="font-bold">
                  {lang === 'hi' ? 'सेंट्रल सुपर एडमिन पासवर्ड नियंत्रण:' : 'Central Admin Password Control:'}
                </span>{' '}
                <span className="text-slate-600">
                  {lang === 'hi' 
                    ? 'आप किसी भी सपोर्ट यूज़र का पासवर्ड तुरंत रीसेट कर सकते हैं और डिफ़ॉल्ट पासवर्ड सीधे उनके WhatsApp पर भेज सकते हैं।' 
                    : 'You can instantly reset any team member’s password and send default credentials via WhatsApp.'}
                </span>
              </div>
            </div>

            <a
              href={`https://wa.me/91${SUPER_ADMIN_MOBILE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700 transition"
              title="Super Admin WhatsApp"
            >
              <MessageSquare className="w-3 h-3" />
              <span>{SUPER_ADMIN_MOBILE}</span>
            </a>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-900 text-sm">{t.userListHeading}</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-bold">
                {users.length}
              </span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={fetchUsers}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center space-x-1 cursor-pointer"
                title="Refresh user list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{showAddForm ? (lang === 'hi' ? 'फॉर्म छुपाएं' : 'Hide Form') : t.addNewUserBtn}</span>
              </button>
            </div>
          </div>

          {/* Add User Form Drawer */}
          {showAddForm && (
            <form 
              onSubmit={handleAddUser}
              className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 space-y-4 transition animate-in fade-in slide-in-from-top-2"
            >
              <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4 text-blue-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    {lang === 'hi' ? 'नया सपोर्ट यूज़र विवरण दर्ज करें' : 'Enter New Support User Details'}
                  </h4>
                </div>
                <span className="text-[11px] text-blue-600 font-medium">
                  {lang === 'hi' ? '* सभी अनिवार्य फील्ड भरें' : '* Required fields'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.usernameLabel} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rahul_tech"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {lang === 'hi' ? 'लॉगिन के लिए उपयोग किया जाएगा' : 'Used for dashboard login'}
                  </span>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.userNameLabel} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      {t.userPasswordLabel} <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setPassword(generateQuickPassword())}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-0.5"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{lang === 'hi' ? 'डिफ़ॉल्ट बनाएं' : 'Generate Default'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs px-3 py-2 pr-9 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.userRoleLabel} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as AdminUserRole)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  >
                    <option value="technician">{t.roleTechnician}</option>
                    <option value="support">{t.roleSupport}</option>
                    <option value="admin">{t.roleAdmin}</option>
                  </select>
                </div>

                {/* Mobile */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.userMobileLabel}
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="e.g. 9876543210 (For WhatsApp password dispatch)"
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-blue-100">
                <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {lang === 'hi' 
                      ? 'मशीन में खुले WhatsApp Web का उपयोग करके क्रेडेंशियल व वेबसाइट लिंक सीधे भेजा जाएगा।' 
                      : 'Credentials & portal link will be dispatched directly using active WhatsApp Web.'}
                  </span>
                </span>

                <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                  >
                    {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleAddUser(e, false)}
                    disabled={isSubmitting}
                    className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {lang === 'hi' ? 'केवल सेव करें' : 'Save Only'}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleAddUser(e, true)}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-200" />
                    <span>
                      {isSubmitting 
                        ? (lang === 'hi' ? 'बनाया जा रहा है...' : 'Creating...') 
                        : (lang === 'hi' ? '🟢 यूज़र बनाएं और WhatsApp Web पर भेजें' : '🟢 Create & Send via WhatsApp Web')}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Newly Created User Credentials Success Card with Direct WhatsApp Web Dispatch */}
          {createdUserData && (
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-400 rounded-2xl p-5 space-y-4 shadow-md animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                      <span>{lang === 'hi' ? '🎉 नया यूज़र अकाउंट सक्रिय & WhatsApp Web तैयार!' : '🎉 New User Active & WhatsApp Ready!'}</span>
                    </h4>
                    <p className="text-xs text-emerald-800">
                      {lang === 'hi' 
                        ? `${createdUserData.name} (${createdUserData.username}) का अकाउंट बन गया है। WhatsApp Web में विवरण भेजने के लिए बटन दबाएं:`
                        : `Account created for ${createdUserData.name}. Click below to dispatch via WhatsApp Web:`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCreatedUserData(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  title="Close banner"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Credentials Box */}
              <div className="bg-white/90 backdrop-blur-xs border border-emerald-200 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">{lang === 'hi' ? 'वेबसाइट पोर्टल लिंक:' : 'Website Portal Link:'}</span>
                  <a
                    href={createdUserData.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-700 hover:underline flex items-center gap-1 break-all"
                  >
                    <span>{createdUserData.siteUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">{lang === 'hi' ? 'यूज़र आईडी (Login ID):' : 'User ID (Login ID):'}</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                    {createdUserData.username}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">{lang === 'hi' ? 'सेट किया गया पासवर्ड:' : 'Assigned Password:'}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-md text-xs">
                      {createdUserData.rawPassword || '••••••••'}
                    </span>
                    {createdUserData.rawPassword && (
                      <button
                        type="button"
                        onClick={() => handleCopyPassword(createdUserData.rawPassword!)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedPass ? (lang === 'hi' ? 'कॉपी हुआ!' : 'Copied!') : (lang === 'hi' ? 'कॉपी' : 'Copy')}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">{lang === 'hi' ? 'रजिस्टर्ड मोबाइल (WhatsApp):' : 'Registered WhatsApp Mobile:'}</span>
                  <span className="font-mono font-bold text-slate-900">
                    {createdUserData.mobileNo || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {/* 1. WhatsApp Web Button (Opens WhatsApp Web directly) */}
                <button
                  type="button"
                  onClick={() => {
                    if (createdUserData.mobileNo) {
                      openWhatsAppWeb(createdUserData.mobileNo, createdUserData.whatsappMessage);
                    } else {
                      alert(lang === 'hi' ? 'कृपया पहले यूज़र का मोबाइल नंबर दर्ज करें।' : 'No mobile number provided');
                    }
                  }}
                  className="flex-1 min-w-[240px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-200" />
                  <span>
                    {lang === 'hi' 
                      ? `🟢 WhatsApp Web में भेजें (${createdUserData.mobileNo || 'खोलें'})` 
                      : `🟢 Send via WhatsApp Web (${createdUserData.mobileNo || 'Open'})`}
                  </span>
                </button>

                {/* 2. Direct WhatsApp wa.me Link */}
                {createdUserData.mobileNo && (
                  <a
                    href={createdUserData.whatsappDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
                    title="Direct WhatsApp"
                  >
                    <span>📱 WhatsApp Direct</span>
                  </a>
                )}

                {/* 3. Copy Full Message Button */}
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(createdUserData.whatsappMessage);
                    setCopiedAll(true);
                    setTimeout(() => setCopiedAll(false), 2500);
                  }}
                  className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedAll ? (lang === 'hi' ? 'पूरा मैसेज कॉपी हुआ!' : 'Message Copied!') : (lang === 'hi' ? 'पूरा मैसेज कॉपी करें' : 'Copy Full Message')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCreatedUserData(null)}
                  className="py-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  {lang === 'hi' ? 'पूर्ण (Done)' : 'Done'}
                </button>
              </div>
            </div>
          )}

          {/* Quick WhatsApp Web Dispatch Modal for existing user */}
          {quickSendUser && (
            <div className="bg-emerald-50/90 border-2 border-emerald-400 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-emerald-800" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                    {lang === 'hi' 
                      ? `WhatsApp Web पर लॉगिन लिंक भेजें: ${quickSendUser.name} (${quickSendUser.username})` 
                      : `Send Login via WhatsApp Web: ${quickSendUser.name}`}
                  </h4>
                </div>
                <button
                  onClick={() => setQuickSendUser(null)}
                  className="p-1 text-emerald-700 hover:text-emerald-950 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-white border border-emerald-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">{lang === 'hi' ? 'यूज़र आईडी:' : 'User ID:'}</span>
                    <span className="font-mono font-bold text-slate-900">{quickSendUser.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">{lang === 'hi' ? 'पूरा नाम व रोल:' : 'Name & Role:'}</span>
                    <span className="font-bold text-slate-900">{quickSendUser.name} ({quickSendUser.role})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">{lang === 'hi' ? 'WhatsApp मोबाइल:' : 'WhatsApp Mobile:'}</span>
                    <span className="font-mono font-bold text-emerald-800">{quickSendUser.mobileNo || SUPER_ADMIN_MOBILE}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">{lang === 'hi' ? 'वेबसाइट पोर्टल लिंक:' : 'Website Portal Link:'}</span>
                    <span className="font-bold text-blue-700">{window.location.origin}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'पासवर्ड (यदि नया पासवर्ड लिखकर भेजना चाहें):' : 'Password (optional custom password note):'}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'hi' ? 'पासवर्ड दर्ज करें (वैकल्पिक)...' : 'Enter password to send...'}
                    value={quickSendPassword}
                    onChange={(e) => setQuickSendPassword(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono bg-white"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setQuickSendUser(null)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                  >
                    {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendCredentialsViaWhatsAppWeb(quickSendUser, quickSendPassword)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-200" />
                    <span>{lang === 'hi' ? '🟢 WhatsApp Web खोलें और भेजें' : '🟢 Open WhatsApp Web & Send'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Password Reset Modal / Drawer for Selected User */}
          {resettingUser && (
            <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-amber-800" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                    {lang === 'hi' ? `पासवर्ड रीसेट: ${resettingUser.name} (${resettingUser.username})` : `Reset Password: ${resettingUser.name}`}
                  </h4>
                </div>
                <button
                  onClick={() => {
                    setResettingUser(null);
                    setResetSuccessData(null);
                  }}
                  className="p-1 text-amber-700 hover:text-amber-950 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!resetSuccessData ? (
                <form onSubmit={handleExecutePasswordReset} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-amber-950">
                        {t.newPasswordLabel}
                      </label>
                      <button
                        type="button"
                        onClick={() => setResetNewPassword(generateQuickPassword())}
                        className="text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-200/80 px-2 py-0.5 rounded-md flex items-center space-x-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{t.generateDefaultPasswordBtn}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        placeholder="e.g. Megnot@4562"
                        className="w-full text-sm font-mono font-bold text-slate-900 px-3.5 py-2.5 rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>
                    <p className="text-[11px] text-amber-800 mt-1">
                      ℹ️ {t.defaultPasswordNotice} (WhatsApp: {resettingUser.mobileNo || SUPER_ADMIN_MOBILE})
                    </p>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setResettingUser(null)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                    >
                      {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                    </button>

                    <button
                      type="submit"
                      disabled={isResetting}
                      className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{isResetting ? 'Saving...' : (lang === 'hi' ? 'पासवर्ड रीसेट करें और WhatsApp तैयार करें' : 'Reset & Prep WhatsApp')}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Success State with WhatsApp Web and Direct Dispatch */
                <div className="space-y-4 pt-1">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{lang === 'hi' ? 'पासवर्ड सफलतापूर्वक बदल गया है!' : 'Password successfully updated!'}</span>
                    </div>

                    <div className="flex items-center justify-between bg-white border border-emerald-200 px-3 py-2 rounded-lg font-mono text-sm font-bold text-slate-900">
                      <span>{resetSuccessData.newPassword}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyPassword(resetSuccessData.newPassword)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-sans font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedPass ? (lang === 'hi' ? 'कॉपी हुआ!' : 'Copied!') : (lang === 'hi' ? 'कॉपी करें' : 'Copy')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Send to User's WhatsApp Web */}
                    <button
                      type="button"
                      onClick={() => {
                        const targetMobile = resetSuccessData.mobileNo || SUPER_ADMIN_MOBILE;
                        if (resetSuccessData.whatsappWebUrl) {
                          window.open(resetSuccessData.whatsappWebUrl, '_blank');
                        } else {
                          openWhatsAppWeb(targetMobile, resetSuccessData.newPassword);
                        }
                      }}
                      className="flex-1 min-w-[220px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-xs transition cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>
                        {lang === 'hi' 
                          ? `🟢 WhatsApp Web में भेजें (${resetSuccessData.mobileNo || SUPER_ADMIN_MOBILE})`
                          : `🟢 Send via WhatsApp Web (${resetSuccessData.mobileNo || SUPER_ADMIN_MOBILE})`}
                      </span>
                    </button>

                    {/* Direct wa.me link */}
                    <a
                      href={resetSuccessData.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
                    >
                      <span>📱 WhatsApp Direct</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setResettingUser(null)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      {lang === 'hi' ? 'संपन्न (Done)' : 'Done'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User List Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">User ID & Name</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">WhatsApp / Mobile</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {users.map((u) => {
                    const isMaster = u.isPrimaryAdmin || u.username.toLowerCase() === 'megnottech';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isMaster ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-slate-900">{u.username}</span>
                                {isMaster && (
                                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded-full">
                                    Super Admin
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-500 block">{u.name}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'technician'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {u.role === 'admin' ? t.roleAdmin : u.role === 'technician' ? t.roleTechnician : t.roleSupport}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono text-slate-700 font-semibold">{u.mobileNo || SUPER_ADMIN_MOBILE}</span>
                            {u.mobileNo && (
                              <a
                                href={`https://wa.me/91${u.mobileNo.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-700"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <button
                            type="button"
                            disabled={isMaster}
                            onClick={() => handleToggleStatus(u)}
                            className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-full transition ${
                              u.isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            } ${isMaster ? 'cursor-default' : 'cursor-pointer'}`}
                            title={isMaster ? 'Master Admin cannot be disabled' : 'Click to toggle status'}
                          >
                            {u.isActive ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-slate-500" />
                                <span>Disabled</span>
                              </>
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* WhatsApp Web Direct Dispatch Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenQuickSend(u)}
                              className="px-2.5 py-1 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                              title={lang === 'hi' ? 'मशीन के WhatsApp Web पर लॉगिन विवरण भेजें' : 'Send login credentials via active WhatsApp Web'}
                            >
                              <MessageSquare className="w-3 h-3 text-emerald-600" />
                              <span>WhatsApp Web</span>
                            </button>

                            {/* Reset Password Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenResetModal(u)}
                              className="px-2.5 py-1 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                              title={t.resetPasswordBtn}
                            >
                              <KeyRound className="w-3 h-3" />
                              <span>{lang === 'hi' ? 'पासवर्ड रीसेट' : 'Reset'}</span>
                            </button>

                            {/* Delete Button */}
                            {isMaster ? (
                              <span className="text-[11px] text-slate-400 italic px-1">Protected</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {users.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400 italic">
                        No support users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Super Admin: <strong className="font-mono text-slate-800">{SUPER_ADMIN_MOBILE}</strong></span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            {lang === 'hi' ? 'डैशबोर्ड पर लौटें' : 'Done & Back to Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
};

