import { Ticket } from '../types';

/**
 * Generates WhatsApp notification message text when a ticket is created
 */
export function generateTicketCreatedMessage(ticket: Ticket, lang: 'hi' | 'en' = 'hi'): string {
  if (lang === 'hi') {
    return (
      `*🎫 Megnot तकनीकी सहायता टिकट दर्ज हुआ*\n` +
      `--------------------------------\n` +
      `*टिकट आईडी:* #${ticket.id}\n` +
      `*Megnot ऑपरेटर:* ${ticket.name} (KO ID: ${ticket.koId})\n` +
      `*बैंक:* ${ticket.bankName}\n` +
      `*शाखा / केंद्र:* ${ticket.branchName} - ${ticket.bcLocation}\n` +
      `*स्थान:* ${ticket.district}, ${ticket.state}\n` +
      `*डिवाइस:* ${ticket.fingerprintDevice}\n` +
      `*AnyDesk ID:* ${ticket.anydeskId}\n` +
      `*समस्या:* ${ticket.problemDescription}\n` +
      `--------------------------------\n` +
      `ℹ️ _हमारी टेक्निकल टीम जल्द ही AnyDesk पर आपसे जुड़ेगी। कृपया AnyDesk खुला रखें।_`
    );
  }

  return (
    `*🎫 Megnot Technical Support Ticket Created*\n` +
    `--------------------------------\n` +
    `*Ticket ID:* #${ticket.id}\n` +
    `*Megnot Operator:* ${ticket.name} (KO ID: ${ticket.koId})\n` +
    `*Bank:* ${ticket.bankName}\n` +
    `*Branch / Center:* ${ticket.branchName} - ${ticket.bcLocation}\n` +
    `*Location:* ${ticket.district}, ${ticket.state}\n` +
    `*Device:* ${ticket.fingerprintDevice}\n` +
    `*AnyDesk ID:* ${ticket.anydeskId}\n` +
    `*Problem:* ${ticket.problemDescription}\n` +
    `--------------------------------\n` +
    `ℹ️ _Our technical team will connect on AnyDesk shortly. Please keep AnyDesk running._`
  );
}

/**
 * Generates WhatsApp notification message when a ticket is RESOLVED (ठीक होने पर)
 */
export function generateTicketResolvedMessage(ticket: Ticket, lang: 'hi' | 'en' = 'hi'): string {
  const resolvedTime = ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');
  const remarks = ticket.resolutionRemarks || 'All drivers updated and biometric transaction verified.';

  if (lang === 'hi') {
    return (
      `✅ *Megnot तकनीकी सहायता - समस्या का समाधान (Resolved)*\n` +
      `================================\n` +
      `प्रिय *${ticket.name}* जी (KO ID: *${ticket.koId}*),\n\n` +
      `हार्दिक सूचना! आपका सहायता टिकट *#${ticket.id}* सफलतापूर्वक हल (Resolve) कर दिया गया है।\n\n` +
      `📋 *विवरण:*\n` +
      `• *बैंक:* ${ticket.bankName} (${ticket.branchName})\n` +
      `• *डिवाइस:* ${ticket.fingerprintDevice}\n` +
      `• *मूल समस्या:* ${ticket.problemDescription.slice(0, 100)}${ticket.problemDescription.length > 100 ? '...' : ''}\n\n` +
      `🛠️ *तकनीकी समाधान (Resolution Remarks):*\n` +
      `${remarks}\n\n` +
      `⏱️ *समाधान समय:* ${resolvedTime}\n` +
      `👨‍💻 *सुलझाया गया द्वारा:* ${ticket.resolvedBy || ticket.assignedTechnician || 'Technical Support Lead'}\n\n` +
      `💡 *निर्देश:* कृपया अपने कियोस्क पोर्टल पर लॉगिन करें और ₹100 की टेस्ट निकासी / बैलेंस चेक करके देखें।\n\n` +
      `यदि कोई अन्य समस्या हो तो इसी हेल्पडेस्क पोर्टल पर संपर्क करें।\n` +
      `_धन्यवाद - Megnot सपोर्ट टीम_`
    );
  }

  return (
    `✅ *Megnot Technical Support - Issue Resolved*\n` +
    `================================\n` +
    `Dear *${ticket.name}* (KO ID: *${ticket.koId}*),\n\n` +
    `Your technical support ticket *#${ticket.id}* has been successfully RESOLVED!\n\n` +
    `📋 *Summary:*\n` +
    `• *Bank:* ${ticket.bankName} (${ticket.branchName})\n` +
    `• *Device:* ${ticket.fingerprintDevice}\n` +
    `• *Reported Problem:* ${ticket.problemDescription.slice(0, 100)}${ticket.problemDescription.length > 100 ? '...' : ''}\n\n` +
    `🛠️ *Resolution Remarks:*\n` +
    `${remarks}\n\n` +
    `⏱️ *Resolved At:* ${resolvedTime}\n` +
    `👨‍💻 *Resolved By:* ${ticket.resolvedBy || ticket.assignedTechnician || 'Tech Support Team'}\n\n` +
    `💡 *Next Step:* Please log in to your Kiosk portal and perform a test transaction / balance inquiry to verify.\n\n` +
    `_Thank you - Megnot Helpdesk Team_`
  );
}

/**
 * Super Admin Master Mobile Contact
 */
export const SUPER_ADMIN_MOBILE = "7001335445";

/**
 * Normalizes phone number to international 91 format for India
 */
export function formatPhoneWithCountryCode(mobileNo: string): string {
  const cleaned = mobileNo.replace(/\D/g, '');
  if (!cleaned) return '';
  return cleaned.length === 10 ? `91${cleaned}` : cleaned;
}

/**
 * Creates WhatsApp Web URL specifically for browsers/desktops where WhatsApp Web is already open
 */
export function getWhatsAppWebUrl(mobileNo: string, text: string): string {
  const phone = formatPhoneWithCountryCode(mobileNo);
  return `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
}

/**
 * Creates direct WhatsApp Web/App click-to-chat URL (wa.me)
 */
export function getWhatsAppDirectUrl(mobileNo: string, text: string): string {
  const phone = formatPhoneWithCountryCode(mobileNo);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Opens WhatsApp Web in a new browser tab/window
 */
export function openWhatsAppWeb(mobileNo: string, text: string): Window | null {
  const url = getWhatsAppWebUrl(mobileNo, text);
  return window.open(url, '_blank');
}

/**
 * Generates official WhatsApp message for New User Account Credentials with Portal Website Link
 */
export function generateNewUserCredentialsMessage(params: {
  username: string;
  name: string;
  password: string;
  role?: string;
  mobileNo?: string;
  portalUrl?: string;
  createdByName?: string;
  lang?: 'hi' | 'en';
}): string {
  const { 
    username, 
    name, 
    password, 
    role = 'Technician', 
    mobileNo = '', 
    portalUrl = (typeof window !== 'undefined' ? window.location.origin : 'https://megnot-support.web.app'),
    createdByName = 'Super Admin',
    lang = 'hi' 
  } = params;

  const roleTitle = 
    role === 'super_admin' ? 'सुपर एडमिन (Super Admin)' :
    role === 'admin' ? 'सीनियर एडमिन (Senior Admin)' :
    role === 'technician' ? 'टेक्निकल सपोर्ट इंजीनियर (Tech Engineer)' :
    'सपोर्ट ऑपरेटर (Support Operator)';

  if (lang === 'hi') {
    return (
      `🌐 *MEGNOT TECHNICAL SUPPORT PORTAL - लॉगिन क्रेडेंशियल*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `नमस्ते *${name}* जी,\n\n` +
      `Megnot Technical Support Desk पर आपका अधिकृत अकाउंट सफलतापूर्वक सक्रिय कर दिया गया है।\n\n` +
      `🔗 *वेबसाइट पोर्टल लिंक (Live Website):*\n${portalUrl}\n\n` +
      `👤 *यूज़र आईडी (Login ID):* \`${username}\`\n` +
      `🔑 *पासवर्ड (Password):* \`${password}\`\n` +
      `🛡️ *पद / रोल (Role):* ${roleTitle}\n` +
      (mobileNo ? `📞 *रजिस्टर्ड मोबाइल:* ${mobileNo}\n` : '') +
      `👨‍💼 *अकाउंट जारीकर्ता:* ${createdByName}\n\n` +
      `📌 *लॉगिन कैसे करें:*\n` +
      `1. ऊपर दिए गए पोर्टल लिंक पर क्लिक करें।\n` +
      `2. "Admin / Staff Login" बटन दबाएं।\n` +
      `3. अपनी यूज़र आईडी \`${username}\` और पासवर्ड दर्ज करें।\n` +
      `4. लॉगिन करके तत्काल सहायता टिकट्स का प्रबंधन करें।\n\n` +
      `⚠️ *सुरक्षा सूचना:* कृपया अपने लॉगिन क्रेडेंशियल्स सुरक्षित रखें और किसी अनधिकृत व्यक्ति से साझा न करें।\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `_Megnot Central Technical Desk • Super Admin (7001335445)_`
    );
  }

  return (
    `🌐 *MEGNOT TECHNICAL SUPPORT PORTAL - LOGIN CREDENTIALS*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Hello *${name}*,\n\n` +
    `Your authorized account on the Megnot Technical Support Desk has been successfully created.\n\n` +
    `🔗 *Website Portal Link (Live Website):*\n${portalUrl}\n\n` +
    `👤 *Login ID / User ID:* \`${username}\`\n` +
    `🔑 *Password:* \`${password}\`\n` +
    `🛡️ *Role:* ${roleTitle}\n` +
    (mobileNo ? `📞 *Registered Mobile:* ${mobileNo}\n` : '') +
    `👨‍💼 *Issued By:* ${createdByName}\n\n` +
    `📌 *How to Login:*\n` +
    `1. Click the portal link above.\n` +
    `2. Click "Admin / Staff Login".\n` +
    `3. Enter your User ID \`${username}\` and password.\n` +
    `4. Access tickets and remote support desk.\n\n` +
    `⚠️ *Security Notice:* Please keep your credentials confidential.\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `_Megnot Technical Desk • Central Admin (7001335445)_`
  );
}

/**
 * Get Direct WhatsApp URL for Super Admin (7001335445)
 */
export function getSuperAdminWhatsAppUrl(text: string): string {
  return getWhatsAppDirectUrl(SUPER_ADMIN_MOBILE, text);
}

/**
 * Generates official WhatsApp message for Support User Credentials / Password Reset
 */
export function generatePasswordResetMessage(params: {
  username: string;
  name: string;
  password: string;
  role?: string;
  resetBy?: string;
  lang?: 'hi' | 'en';
}): string {
  const { username, name, password, role = 'Technician', resetBy = 'Central Super Admin', lang = 'hi' } = params;

  if (lang === 'hi') {
    return (
      `🔐 *Megnot सपोर्ट पोर्टल - पासवर्ड रीसेट विवरण*\n` +
      `================================\n` +
      `नमस्ते *${name}* जी,\n\n` +
      `आपके Megnot टेक्निकल सपोर्ट अकाउंट का पासवर्ड सफलतापूर्वक रीसेट कर दिया गया है।\n\n` +
      `👤 *यूज़र आईडी (Login ID):* \`${username}\`\n` +
      `🔑 *डिफ़ॉल्ट / नया पासवर्ड:* \`${password}\`\n` +
      `🛡️ *पद / रोल:* ${role}\n` +
      `👨‍💼 *रीसेट किया गया द्वारा:* ${resetBy}\n\n` +
      `🌐 *लॉगिन पोर्टल:* https://megnot-support.web.app (या अपने टेक्निकल डेस्क लिंक पर जाएं)\n\n` +
      `⚠️ *सुरक्षा निर्देश:* कृपया लॉगिन करने के बाद आवश्यकतानुसार पासवर्ड सुरक्षित रखें। यह जानकारी किसी अनधिकृत व्यक्ति से साझा न करें।\n\n` +
      `_Megnot Central Technical Desk • Super Admin Support_`
    );
  }

  return (
    `🔐 *Megnot Support Portal - Password Reset Notice*\n` +
    `================================\n` +
    `Hello *${name}*,\n\n` +
    `Your Megnot Technical Support account password has been successfully reset.\n\n` +
    `👤 *Login ID / User ID:* \`${username}\`\n` +
    `🔑 *Default / New Password:* \`${password}\`\n` +
    `🛡️ *Role / Designation:* ${role}\n` +
    `👨‍💼 *Reset By:* ${resetBy}\n\n` +
    `🌐 *Login Link:* Megnot Central Support Portal\n\n` +
    `⚠️ *Security Note:* Please keep your credentials secure. Do not share with unauthorized persons.\n\n` +
    `_Megnot Central Technical Support Desk_`
  );
}

/**
 * Generates WhatsApp message from user requesting Super Admin (7001335445) for password reset
 */
export function generateSuperAdminResetRequestMessage(usernameOrInfo: string, lang: 'hi' | 'en' = 'hi'): string {
  if (lang === 'hi') {
    return (
      `🚨 *Megnot पोर्टल पासवर्ड रीसेट सहायता अनुरोध*\n` +
      `नमस्ते Abhay Sir (Super Admin),\n\n` +
      `मैं Megnot टेक्निकल सपोर्ट पोर्टल का अधिकृत सदस्य हूँ। मुझे अपना लॉगिन पासवर्ड रीसेट करवाने में सहायता चाहिए।\n\n` +
      `• *यूज़र आईडी / मोबाइल:* ${usernameOrInfo}\n` +
      `• *अनुरोध समय:* ${new Date().toLocaleString('en-IN')}\n\n` +
      `कृपया मुझे नया डिफ़ॉल्ट पासवर्ड जारी करने की कृपा करें।\n` +
      `_धन्यवाद!_`
    );
  }

  return (
    `🚨 *Megnot Support Portal - Password Reset Request*\n` +
    `Hello Super Admin (Abhay Sir),\n\n` +
    `I am an authorized user of the Megnot Technical Support Portal and need assistance resetting my login password.\n\n` +
    `• *User ID / Mobile:* ${usernameOrInfo}\n` +
    `• *Request Time:* ${new Date().toLocaleString('en-IN')}\n\n` +
    `Please assist with issuing a new password.\n` +
    `_Thank you!_`
  );
}
