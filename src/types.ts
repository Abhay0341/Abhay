export type Language = 'hi' | 'en';

export type TicketStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';

export type TicketUrgency = 'low' | 'normal' | 'high' | 'critical';

export interface Ticket {
  id: string; // e.g. "TKT-2026-1042"
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  state: string;
  district: string;
  bankName: string;
  branchName: string;
  bcLocation: string;
  koId: string;
  name: string;
  mobileNo: string;
  anydeskId: string;
  fingerprintDevice: string;
  deviceSerial?: string;
  problemCategory: string;
  problemDescription: string;
  screenshotUrl?: string;
  urgency: TicketUrgency;
  status: TicketStatus;
  assignedTechnician?: string;
  resolutionRemarks?: string;
  resolutionSteps?: string[];
  resolvedAt?: string;
  resolvedBy?: string;
  whatsappNotified?: boolean;
  syncedFromOffline?: boolean;
  rating?: number;
  feedback?: string;
}

export interface TicketStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  critical: number;
  resolvedToday: number;
  avgResolutionMinutes: number;
}

export interface AIDiagnosisResult {
  problemSummary: string;
  possibleCauses: string[];
  instantFixSteps: string[];
  rdServiceGuidance: string;
  anydeskRequired: boolean;
  preventionTip: string;
}

export type AdminUserRole = 'admin' | 'technician' | 'support';

export interface AdminUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: AdminUserRole;
  mobileNo?: string;
  createdAt: string;
  isActive: boolean;
  isPrimaryAdmin?: boolean;
}

export type HistoryCleanupMode = 'resolved_all' | 'resolved_older_30d' | 'rejected_all' | 'single_ticket';

// UI Customization & Admin Field Control Types
export interface BiometricDeviceConfig {
  id: string;
  name: string;
  driverInfo: string;
  vendor: string;
  isCustom?: boolean;
}

export interface ProblemCategoryConfig {
  id: string;
  en: string;
  hi: string;
  icon?: string;
  suggestedFixEn?: string;
  suggestedFixHi?: string;
  isCustom?: boolean;
}

export interface AnnouncementConfig {
  enabled: boolean;
  titleEn: string;
  titleHi: string;
  messageEn: string;
  messageHi: string;
  type: 'info' | 'warning' | 'urgent' | 'success';
  linkUrl?: string;
  linkTextEn?: string;
  linkTextHi?: string;
}

export interface FormFieldsConfig {
  anydeskMode: 'required' | 'optional' | 'hidden';
  showDeviceSerial: boolean;
  deviceSerialRequired: boolean;
  showScreenshot: boolean;
  screenshotRequired: boolean;
  showBranchName: boolean;
  branchNameRequired: boolean;
  showBcLocation: boolean;
  bcLocationRequired: boolean;
  showUrgencySelection: boolean;
  defaultUrgency: TicketUrgency;
  allowSelfHelpAi: boolean;
}

export interface SupportInfoConfig {
  superAdminMobile: string;
  helplineNumber: string;
  supportEmail: string;
  operatingHoursEn: string;
  operatingHoursHi: string;
  showWhatsAppQuickHelp: boolean;
  bannerNoticeEn?: string;
  bannerNoticeHi?: string;
}

export interface QuickFaqConfig {
  id: string;
  questionEn: string;
  questionHi: string;
  answerEn: string;
  answerHi: string;
}

export interface UIConfig {
  banks: string[];
  devices: BiometricDeviceConfig[];
  problemCategories: ProblemCategoryConfig[];
  statesDistricts: Record<string, string[]>;
  announcement: AnnouncementConfig;
  formFields: FormFieldsConfig;
  supportInfo: SupportInfoConfig;
  quickFaqs: QuickFaqConfig[];
  lastUpdated?: string;
}

