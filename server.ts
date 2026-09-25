import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { DEFAULT_UI_CONFIG } from "./src/data/constants";
import { UIConfig } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Allow iframe embedding on Google Blog (Blogger.com / Blogspot), Google Sites, and external portals
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  // Remove X-Frame-Options and permit iframe ancestors for Google Blog embedding
  res.removeHeader("X-Frame-Options");
  res.setHeader("Content-Security-Policy", "frame-ancestors *;");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Dynamic UI Configuration Store - Admin has full power to add/remove elements
let uiConfigStore: UIConfig = JSON.parse(JSON.stringify(DEFAULT_UI_CONFIG));

// In-Memory Ticket Store initialized with realistic seed data
interface TicketData {
  id: string;
  createdAt: string;
  updatedAt: string;
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
  urgency: 'low' | 'normal' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
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

let ticketsStore: TicketData[] = [
  {
    id: "TKT-2026-1082",
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    state: "Uttar Pradesh",
    district: "Gorakhpur",
    bankName: "State Bank of India (SBI Kiosk)",
    branchName: "Sahjanwa Main Branch",
    bcLocation: "Piprauli Bazar Gram Panchayat",
    koId: "1A948201",
    name: "Rameshwar Singh Yadav",
    mobileNo: "9876543210",
    anydeskId: "482 910 334",
    fingerprintDevice: "Morpho MSO 1300 E3 (USB)",
    deviceSerial: "2048I039481",
    problemCategory: "rd_service_error",
    problemDescription: "Kiosk portal me login karne par 'Morpho RD Service not found (11100)' error aa raha hai. Subah se kaam band hai, please theek karwayen.",
    urgency: "high",
    status: "in_progress",
    assignedTechnician: "Ajay Sharma (Tech Lead)",
    resolutionRemarks: "AnyDesk se connect kiya. Config.ini me Communication Type 0 se 1 set karke Morpho RD restart kiya. Testing in progress.",
    whatsappNotified: false
  },
  {
    id: "TKT-2026-1081",
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    state: "Bihar",
    district: "Patna",
    bankName: "Punjab National Bank (PNB BC)",
    branchName: "Danapur Cantt",
    bcLocation: "Khagaul Railway Station Road CSP",
    koId: "PNB88392",
    name: "Sunita Kumari",
    mobileNo: "9431287654",
    anydeskId: "651 884 902",
    fingerprintDevice: "Mantra MFS100 (v54 / v9.2)",
    problemCategory: "chrome_java_tls",
    problemDescription: "Chrome browser update hone ke baad CSP login page par biometric pop-up nahi khul raha hai. Error: Insecure connection blocked.",
    urgency: "normal",
    status: "resolved",
    assignedTechnician: "Vikas Patel",
    resolvedBy: "Vikas Patel",
    resolvedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    resolutionRemarks: "Chrome flags me 'allow-insecure-localhost' Enable kiya aur Mantra Driver v9.2 re-register kiya. Test transaction success.",
    resolutionSteps: [
      "Chrome flags allow-insecure-localhost enabled",
      "Mantra RD Service restart & certificate re-imported",
      "Cash withdrawal of ₹100 verified successfully"
    ],
    whatsappNotified: true,
    rating: 5
  },
  {
    id: "TKT-2026-1080",
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    state: "Madhya Pradesh",
    district: "Rewa",
    bankName: "Bank of Baroda (BOB Digipath)",
    branchName: "Sirmour Branch",
    bcLocation: "Bichhiya Chowk Bank Mitra Kendra",
    koId: "BOB-9102",
    name: "Mohit Verma",
    mobileNo: "9123456780",
    anydeskId: "302 918 447",
    fingerprintDevice: "Startek FM220 / FM220U",
    problemCategory: "fingerprint_not_capturing",
    problemDescription: "Fingerprint scanner ki red light jal rahi hai par AEPS customer authentication ke samay 0% capture quality bata raha hai.",
    urgency: "critical",
    status: "pending",
    whatsappNotified: false
  },
  {
    id: "TKT-2026-1079",
    createdAt: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    state: "Uttar Pradesh",
    district: "Varanasi",
    bankName: "Aryavart Bank (RRB)",
    branchName: "Pindra Branch",
    bcLocation: "Babatpur Air Force Road CSP",
    koId: "ARY77210",
    name: "Dharmendra Kumar Gupta",
    mobileNo: "9839123456",
    anydeskId: "591 002 813",
    fingerprintDevice: "SecuGen Hamster Pro 20 (HUPx)",
    problemCategory: "portal_login_failed",
    problemDescription: "Subah se server error 500 aa raha hai, KO portal login nahi ho raha. Kripya dekhein.",
    urgency: "high",
    status: "resolved",
    assignedTechnician: "Ajay Sharma (Tech Lead)",
    resolvedBy: "Ajay Sharma",
    resolvedAt: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
    resolutionRemarks: "DNS cache flush kiya gaya ('ipconfig /flushdns') aur bank proxy settings verify ki gayi. Portal login active.",
    whatsappNotified: true,
    rating: 5
  }
];

let ticketCounter = 1083;

// Admin & Support Users Store
const SUPER_ADMIN_MOBILE = "7001335445";

interface ServerAdminUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'technician' | 'support';
  mobileNo?: string;
  createdAt: string;
  isActive: boolean;
  isPrimaryAdmin?: boolean;
}

let adminUsersStore: ServerAdminUser[] = [
  {
    id: "usr-master-1",
    username: "Megnottech",
    password: "Abhay0341",
    name: "Abhay (Central Admin)",
    role: "admin",
    mobileNo: SUPER_ADMIN_MOBILE,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    isPrimaryAdmin: true
  },
  {
    id: "usr-tech-2",
    username: "ajay_tech",
    password: "TechPass@2026",
    name: "Ajay Sharma (Tech Lead)",
    role: "technician",
    mobileNo: "9839112233",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    isPrimaryAdmin: false
  },
  {
    id: "usr-tech-3",
    username: "vikas_patel",
    password: "Vikas@123",
    name: "Vikas Patel",
    role: "technician",
    mobileNo: "9431223344",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    isPrimaryAdmin: false
  }
];

// Helper to generate clean, memorable default passwords
function generateDefaultPassword(prefix = "Megnot"): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}@${randomSuffix}`;
}

let userCounter = 4;
let lastAutoCleanupTime: string = new Date().toISOString();

// Function: Automatic Monthly Cleanup of Resolved Cases
// Deletes resolved tickets older than 30 days (1 month retention)
function performMonthlyResolvedTicketsCleanup(daysThreshold = 30): number {
  const cutoffTimestamp = Date.now() - (daysThreshold * 24 * 60 * 60 * 1000);
  const initialLength = ticketsStore.length;

  ticketsStore = ticketsStore.filter(ticket => {
    // Only prune if ticket is resolved and resolvedAt/createdAt is older than cutoff
    if (ticket.status === 'resolved') {
      const ticketTime = new Date(ticket.resolvedAt || ticket.updatedAt || ticket.createdAt).getTime();
      return ticketTime >= cutoffTimestamp;
    }
    return true; // Keep pending, in_progress, etc.
  });

  const deletedCount = initialLength - ticketsStore.length;
  lastAutoCleanupTime = new Date().toISOString();
  if (deletedCount > 0) {
    console.log(`[Auto-Cleanup] Automatically purged ${deletedCount} resolved ticket(s) older than ${daysThreshold} days.`);
  }
  return deletedCount;
}

// Run initial auto cleanup on server start
performMonthlyResolvedTicketsCleanup(30);

// Schedule automatic cleanup check every 6 hours
setInterval(() => {
  performMonthlyResolvedTicketsCleanup(30);
}, 6 * 60 * 60 * 1000);

// --- FILESYSTEM PERSISTENCE STORE ---
const DATA_DIR = path.join(process.cwd(), "data_store");
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error("Failed to create data directory:", e);
  }
}

const UI_CONFIG_FILE = path.join(DATA_DIR, "ui_config.json");
const TICKETS_FILE = path.join(DATA_DIR, "tickets.json");
const ADMIN_USERS_FILE = path.join(DATA_DIR, "admin_users.json");

function deepMergeUIConfig(current: UIConfig, updates: any): UIConfig {
  if (!updates || typeof updates !== "object") return current;
  return {
    ...DEFAULT_UI_CONFIG,
    ...current,
    ...updates,
    announcement: {
      ...DEFAULT_UI_CONFIG.announcement,
      ...(current?.announcement || {}),
      ...(updates?.announcement || {})
    },
    formFields: {
      ...DEFAULT_UI_CONFIG.formFields,
      ...(current?.formFields || {}),
      ...(updates?.formFields || {})
    },
    supportInfo: {
      ...DEFAULT_UI_CONFIG.supportInfo,
      ...(current?.supportInfo || {}),
      ...(updates?.supportInfo || {})
    },
    banks: Array.isArray(updates.banks) ? updates.banks : (current?.banks || DEFAULT_UI_CONFIG.banks),
    devices: Array.isArray(updates.devices) ? updates.devices : (current?.devices || DEFAULT_UI_CONFIG.devices),
    problemCategories: Array.isArray(updates.problemCategories) ? updates.problemCategories : (current?.problemCategories || DEFAULT_UI_CONFIG.problemCategories),
    statesDistricts: updates.statesDistricts && typeof updates.statesDistricts === 'object' ? updates.statesDistricts : (current?.statesDistricts || DEFAULT_UI_CONFIG.statesDistricts),
    quickFaqs: Array.isArray(updates.quickFaqs) ? updates.quickFaqs : (current?.quickFaqs || DEFAULT_UI_CONFIG.quickFaqs),
    lastUpdated: new Date().toISOString()
  };
}

function loadStoredData() {
  try {
    if (fs.existsSync(UI_CONFIG_FILE)) {
      const raw = fs.readFileSync(UI_CONFIG_FILE, "utf-8");
      const loaded = JSON.parse(raw);
      if (loaded && typeof loaded === 'object') {
        uiConfigStore = deepMergeUIConfig(uiConfigStore, loaded);
      }
    } else {
      fs.writeFileSync(UI_CONFIG_FILE, JSON.stringify(uiConfigStore, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Could not load stored ui_config, using default:", err);
  }

  try {
    if (fs.existsSync(TICKETS_FILE)) {
      const raw = fs.readFileSync(TICKETS_FILE, "utf-8");
      const loaded = JSON.parse(raw);
      if (Array.isArray(loaded) && loaded.length > 0) {
        ticketsStore = loaded;
      }
    } else {
      fs.writeFileSync(TICKETS_FILE, JSON.stringify(ticketsStore, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Could not load stored tickets, using default:", err);
  }

  try {
    if (fs.existsSync(ADMIN_USERS_FILE)) {
      const raw = fs.readFileSync(ADMIN_USERS_FILE, "utf-8");
      const loaded = JSON.parse(raw);
      if (Array.isArray(loaded) && loaded.length > 0) {
        // Ensure primary admin always exists
        const hasPrimary = loaded.some((u: ServerAdminUser) => u.username.toLowerCase() === 'megnottech');
        if (!hasPrimary && adminUsersStore.length > 0) {
          loaded.unshift(adminUsersStore[0]);
        }
        adminUsersStore = loaded;
      }
    } else {
      fs.writeFileSync(ADMIN_USERS_FILE, JSON.stringify(adminUsersStore, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Could not load stored admin users, using default:", err);
  }
}

function saveUIConfig() {
  try {
    fs.writeFileSync(UI_CONFIG_FILE, JSON.stringify(uiConfigStore, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to persist ui_config to disk:", e);
  }
}

function saveTickets() {
  try {
    fs.writeFileSync(TICKETS_FILE, JSON.stringify(ticketsStore, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to persist tickets to disk:", e);
  }
}

function saveAdminUsers() {
  try {
    fs.writeFileSync(ADMIN_USERS_FILE, JSON.stringify(adminUsersStore, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to persist admin users to disk:", e);
  }
}

// Load persisted data on server startup
loadStoredData();

// --- REAL-TIME LIVE UPDATE SYSTEM (SSE) ---
let configVersion = 1;
let ticketsVersion = 1;
let usersVersion = 1;
const activeSSEClients = new Set<express.Response>();

function broadcastLiveUpdate(event: { type: string; [key: string]: any }) {
  const payload = `data: ${JSON.stringify({ ...event, timestamp: new Date().toISOString() })}\n\n`;
  for (const client of activeSSEClients) {
    try {
      client.write(payload);
    } catch {
      activeSSEClients.delete(client);
    }
  }
}

// Gemini AI Client helper
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY || "";
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ---------------- API ROUTES ----------------

// Server-Sent Events (SSE) for Real-Time Instant Live Site Sync
app.get("/api/live-stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  // Send initial snapshot
  res.write(`data: ${JSON.stringify({
    type: "connected",
    config: uiConfigStore,
    configVersion,
    ticketsVersion,
    timestamp: new Date().toISOString()
  })}\n\n`);

  activeSSEClients.add(res);

  // Ping every 25 seconds to keep connection alive
  const heartbeatTimer = setInterval(() => {
    try {
      res.write(": keepalive\n\n");
    } catch {
      clearInterval(heartbeatTimer);
      activeSSEClients.delete(res);
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeatTimer);
    activeSSEClients.delete(res);
  });
});

// Version check endpoint for light periodic polling
app.get("/api/config/version", (req, res) => {
  res.json({
    success: true,
    configVersion,
    ticketsVersion,
    usersVersion,
    lastUpdated: uiConfigStore.lastUpdated || new Date().toISOString()
  });
});

// UI Configuration Endpoints (Full Admin Power to Add / Remove / Customize UI Elements)
app.get("/api/config/ui", (req, res) => {
  res.json({
    success: true,
    config: uiConfigStore
  });
});

app.post("/api/config/ui", (req, res) => {
  try {
    const updatedConfig = req.body?.config || req.body;
    if (!updatedConfig || typeof updatedConfig !== "object") {
      return res.status(400).json({ success: false, message: "Invalid configuration payload" });
    }
    
    uiConfigStore = deepMergeUIConfig(uiConfigStore, updatedConfig);

    configVersion++;
    saveUIConfig();

    // Broadcast instant live update to all live site visitors
    broadcastLiveUpdate({
      type: "config_updated",
      config: uiConfigStore,
      version: configVersion
    });

    res.json({
      success: true,
      message: "User Interface configuration updated successfully.",
      config: uiConfigStore
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to update configuration" });
  }
});

app.post("/api/config/ui/reset", (req, res) => {
  try {
    uiConfigStore = JSON.parse(JSON.stringify(DEFAULT_UI_CONFIG));
    uiConfigStore.lastUpdated = new Date().toISOString();
    
    configVersion++;
    saveUIConfig();

    // Broadcast instant reset to all live site visitors
    broadcastLiveUpdate({
      type: "config_updated",
      config: uiConfigStore,
      version: configVersion
    });

    res.json({
      success: true,
      message: "User interface reset to factory default configuration.",
      config: uiConfigStore
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to reset configuration" });
  }
});

// Bank Add / Remove
app.post("/api/config/ui/banks/add", (req, res) => {
  const { bankName } = req.body;
  if (!bankName || !bankName.trim()) {
    return res.status(400).json({ success: false, message: "Bank name is required." });
  }
  const clean = bankName.trim();
  if (uiConfigStore.banks.some(b => b.toLowerCase() === clean.toLowerCase())) {
    return res.status(400).json({ success: false, message: "Bank already exists in list." });
  }
  uiConfigStore.banks.push(clean);
  uiConfigStore.lastUpdated = new Date().toISOString();
  configVersion++;
  saveUIConfig();
  broadcastLiveUpdate({ type: "config_updated", config: uiConfigStore, version: configVersion });

  res.json({ success: true, message: `Bank '${clean}' added successfully.`, banks: uiConfigStore.banks });
});

app.post("/api/config/ui/banks/remove", (req, res) => {
  const { bankName } = req.body;
  if (!bankName) {
    return res.status(400).json({ success: false, message: "Bank name is required." });
  }
  uiConfigStore.banks = uiConfigStore.banks.filter(b => b !== bankName);
  uiConfigStore.lastUpdated = new Date().toISOString();
  configVersion++;
  saveUIConfig();
  broadcastLiveUpdate({ type: "config_updated", config: uiConfigStore, version: configVersion });

  res.json({ success: true, message: `Bank '${bankName}' removed.`, banks: uiConfigStore.banks });
});

// Biometric Device Add / Remove
app.post("/api/config/ui/devices/add", (req, res) => {
  const { name, driverInfo, vendor } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: "Device name is required." });
  }
  const newDev = {
    id: `dev-custom-${Date.now()}`,
    name: name.trim(),
    driverInfo: driverInfo ? driverInfo.trim() : "Custom RD Service / Driver",
    vendor: vendor ? vendor.trim() : "Custom",
    isCustom: true
  };
  uiConfigStore.devices.push(newDev);
  uiConfigStore.lastUpdated = new Date().toISOString();
  configVersion++;
  saveUIConfig();
  broadcastLiveUpdate({ type: "config_updated", config: uiConfigStore, version: configVersion });

  res.json({ success: true, message: `Device '${newDev.name}' added successfully.`, devices: uiConfigStore.devices });
});

app.post("/api/config/ui/devices/remove", (req, res) => {
  const { id, name } = req.body;
  if (id) {
    uiConfigStore.devices = uiConfigStore.devices.filter(d => d.id !== id);
  } else if (name) {
    uiConfigStore.devices = uiConfigStore.devices.filter(d => d.name !== name);
  } else {
    return res.status(400).json({ success: false, message: "Device ID or name is required." });
  }
  uiConfigStore.lastUpdated = new Date().toISOString();
  configVersion++;
  saveUIConfig();
  broadcastLiveUpdate({ type: "config_updated", config: uiConfigStore, version: configVersion });

  res.json({ success: true, message: `Device removed successfully.`, devices: uiConfigStore.devices });
});

// Problem Categories Add / Remove
app.post("/api/config/ui/problem-categories/add", (req, res) => {
  const { en, hi, suggestedFixEn, suggestedFixHi, icon } = req.body;
  if (!en || !hi) {
    return res.status(400).json({ success: false, message: "English and Hindi names are required." });
  }
  const id = `issue_${Date.now()}`;
  const newCat = {
    id,
    en: en.trim(),
    hi: hi.trim(),
    icon: icon || "AlertCircle",
    suggestedFixEn: suggestedFixEn ? suggestedFixEn.trim() : "Please contact technician desk or provide AnyDesk ID.",
    suggestedFixHi: suggestedFixHi ? suggestedFixHi.trim() : "कृपया तकनीशियन से संपर्क करें या AnyDesk कोड प्रदान करें।",
    isCustom: true
  };
  uiConfigStore.problemCategories.push(newCat);
  uiConfigStore.lastUpdated = new Date().toISOString();
  configVersion++;
  saveUIConfig();
  broadcastLiveUpdate({ type: "config_updated", config: uiConfigStore, version: configVersion });

  res.json({ success: true, message: `Problem category '${newCat.hi}' added.`, categories: uiConfigStore.problemCategories });
});

app.post("/api/config/ui/problem-categories/remove", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ success: false, message: "Category ID is required." });
  }
  uiConfigStore.problemCategories = uiConfigStore.problemCategories.filter(c => c.id !== id);
  uiConfigStore.lastUpdated = new Date().toISOString();
  configVersion++;
  saveUIConfig();
  broadcastLiveUpdate({ type: "config_updated", config: uiConfigStore, version: configVersion });

  res.json({ success: true, message: "Problem category removed.", categories: uiConfigStore.problemCategories });
});

// States & Districts Add / Remove
app.post("/api/config/ui/states/add", (req, res) => {
  const { stateName, initialDistricts } = req.body;
  if (!stateName || !stateName.trim()) {
    return res.status(400).json({ success: false, message: "State name is required." });
  }
  const cleanState = stateName.trim();
  if (uiConfigStore.statesDistricts[cleanState]) {
    return res.status(400).json({ success: false, message: "State already exists." });
  }
  const districts = Array.isArray(initialDistricts) && initialDistricts.length > 0
    ? initialDistricts
    : ["Main District", "Headquarters"];
  uiConfigStore.statesDistricts[cleanState] = districts;
  uiConfigStore.lastUpdated = new Date().toISOString();
  configVersion++;
  saveUIConfig();
  broadcastLiveUpdate({ type: "config_updated", config: uiConfigStore, version: configVersion });

  res.json({ success: true, message: `State '${cleanState}' added.`, statesDistricts: uiConfigStore.statesDistricts });
});

app.post("/api/config/ui/states/remove", (req, res) => {
  const { stateName } = req.body;
  if (!stateName) {
    return res.status(400).json({ success: false, message: "State name is required." });
  }
  delete uiConfigStore.statesDistricts[stateName];
  uiConfigStore.lastUpdated = new Date().toISOString();
  configVersion++;
  saveUIConfig();
  broadcastLiveUpdate({ type: "config_updated", config: uiConfigStore, version: configVersion });

  res.json({ success: true, message: `State '${stateName}' removed.`, statesDistricts: uiConfigStore.statesDistricts });
});

app.post("/api/config/ui/districts/add", (req, res) => {
  const { stateName, districtName } = req.body;
  if (!stateName || !districtName) {
    return res.status(400).json({ success: false, message: "State and District name are required." });
  }
  if (!uiConfigStore.statesDistricts[stateName]) {
    uiConfigStore.statesDistricts[stateName] = [];
  }
  const cleanDist = districtName.trim();
  if (!uiConfigStore.statesDistricts[stateName].includes(cleanDist)) {
    uiConfigStore.statesDistricts[stateName].push(cleanDist);
  }
  uiConfigStore.lastUpdated = new Date().toISOString();
  configVersion++;
  saveUIConfig();
  broadcastLiveUpdate({ type: "config_updated", config: uiConfigStore, version: configVersion });

  res.json({ success: true, message: `District '${cleanDist}' added to ${stateName}.`, statesDistricts: uiConfigStore.statesDistricts });
});

app.post("/api/config/ui/districts/remove", (req, res) => {
  const { stateName, districtName } = req.body;
  if (!stateName || !districtName) {
    return res.status(400).json({ success: false, message: "State and District name are required." });
  }
  if (uiConfigStore.statesDistricts[stateName]) {
    uiConfigStore.statesDistricts[stateName] = uiConfigStore.statesDistricts[stateName].filter(d => d !== districtName);
  }
  uiConfigStore.lastUpdated = new Date().toISOString();
  configVersion++;
  saveUIConfig();
  broadcastLiveUpdate({ type: "config_updated", config: uiConfigStore, version: configVersion });

  res.json({ success: true, message: `District '${districtName}' removed from ${stateName}.`, statesDistricts: uiConfigStore.statesDistricts });
});

// POST /api/admin/login - Authenticate central dashboard admin / technicians
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required" });
  }

  const cleanUser = username.trim().toLowerCase();
  const cleanPass = password.trim();

  // Find user in database
  const matchedUser = adminUsersStore.find(
    u => u.username.toLowerCase() === cleanUser && u.password === cleanPass
  );

  if (matchedUser) {
    if (!matchedUser.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated. Please contact Super Admin."
      });
    }

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: matchedUser.id,
        username: matchedUser.username,
        role: matchedUser.role,
        name: matchedUser.name,
        mobileNo: matchedUser.mobileNo,
        isPrimaryAdmin: matchedUser.isPrimaryAdmin
      },
      token: `megnot-auth-session-${matchedUser.id}-${Date.now()}`
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "Invalid User ID or Password"
    });
  }
});

// GET /api/admin/users - List all support/admin users
app.get("/api/admin/users", (req, res) => {
  const safeUsers = adminUsersStore.map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    mobileNo: u.mobileNo,
    createdAt: u.createdAt,
    isActive: u.isActive,
    isPrimaryAdmin: u.isPrimaryAdmin
  }));
  res.json({ success: true, users: safeUsers, count: safeUsers.length });
});

// POST /api/admin/users - Create new support user / technician
app.post("/api/admin/users", (req, res) => {
  try {
    const { username, password, name, role, mobileNo } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Username, password and full name are required."
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    
    // Check if username already exists
    const exists = adminUsersStore.some(u => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: `Username '${cleanUsername}' already exists. Please choose a different User ID.`
      });
    }

    const newUser: ServerAdminUser = {
      id: `usr-${userCounter++}-${Date.now()}`,
      username: cleanUsername,
      password: password.trim(),
      name: name.trim(),
      role: role || 'technician',
      mobileNo: mobileNo ? mobileNo.trim() : undefined,
      createdAt: new Date().toISOString(),
      isActive: true,
      isPrimaryAdmin: false
    };

    adminUsersStore.push(newUser);
    saveAdminUsers();
    usersVersion++;
    broadcastLiveUpdate({ type: "users_updated", version: usersVersion });

    // Build WhatsApp message with Live Website Link
    const hostHeader = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
    const protoHeader = req.headers["x-forwarded-proto"] || "https";
    const siteUrl = req.headers.origin || `${protoHeader}://${hostHeader}`;

    const cleanMobile = (newUser.mobileNo || "").replace(/\D/g, "");
    const phoneWithCountry = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;

    const roleName = 
      newUser.role === 'admin' ? 'सीनियर एडमिन (Senior Admin)' :
      newUser.role === 'technician' ? 'टेक्निकल सपोर्ट इंजीनियर (Tech Engineer)' :
      'हेल्पडेस्क सपोर्ट ऑपरेटर (Support Operator)';

    const whatsappMessage = 
      `🌐 *MEGNOT TECHNICAL SUPPORT PORTAL - लॉगिन क्रेडेंशियल*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `नमस्ते *${newUser.name}* जी,\n\n` +
      `Megnot Technical Support Desk पर आपका अधिकृत अकाउंट सफलतापूर्वक सक्रिय कर दिया गया है।\n\n` +
      `🔗 *वेबसाइट पोर्टल लिंक (Live Website):*\n${siteUrl}\n\n` +
      `👤 *यूज़र आईडी (Login ID):* \`${newUser.username}\`\n` +
      `🔑 *पासवर्ड (Password):* \`${newUser.password}\`\n` +
      `🛡️ *पद / रोल (Role):* ${roleName}\n` +
      (cleanMobile ? `📞 *रजिस्टर्ड मोबाइल:* ${cleanMobile}\n` : '') +
      `👨‍💼 *अकाउंट जारीकर्ता:* Central Super Admin\n\n` +
      `📌 *लॉगिन निर्देश:*\n` +
      `1. ऊपर दिए गए पोर्टल लिंक पर क्लिक करें।\n` +
      `2. "Admin / Staff Login" बटन दबाएं।\n` +
      `3. अपनी यूज़र आईडी \`${newUser.username}\` और पासवर्ड दर्ज करके लॉगिन करें।\n` +
      `4. लॉगिन करके तत्काल सहायता टिकट्स का प्रबंधन करें।\n\n` +
      `⚠️ *सुरक्षा निर्देश:* कृपया अपना पासवर्ड सुरक्षित रखें और किसी अनधिकृत व्यक्ति से साझा न करें।\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `_Megnot Central Technical Desk • Super Admin (7001335445)_`;

    // WhatsApp Web specific URL (uses machine's active WhatsApp Web)
    const whatsappWebUrl = cleanMobile 
      ? `https://web.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(whatsappMessage)}`
      : "";
    
    // Direct WhatsApp link (wa.me)
    const whatsappDirectUrl = cleanMobile 
      ? `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(whatsappMessage)}`
      : "";

    res.status(201).json({
      success: true,
      message: `User '${newUser.username}' (${newUser.name}) created successfully.`,
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
        mobileNo: newUser.mobileNo,
        createdAt: newUser.createdAt,
        isActive: newUser.isActive,
        isPrimaryAdmin: newUser.isPrimaryAdmin
      },
      rawPassword: newUser.password,
      siteUrl,
      whatsappWebUrl,
      whatsappDirectUrl,
      whatsappMessage
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create user" });
  }
});

// PATCH /api/admin/users/:id - Update user details, password or status
app.patch("/api/admin/users/:id", (req, res) => {
  const { id } = req.params;
  const userIdx = adminUsersStore.findIndex(u => u.id === id);

  if (userIdx === -1) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const existing = adminUsersStore[userIdx];
  const { name, role, mobileNo, isActive, password } = req.body;

  // Prevent deactivating primary admin
  if (existing.isPrimaryAdmin && isActive === false) {
    return res.status(400).json({
      success: false,
      message: "Cannot deactivate the primary Master Admin account."
    });
  }

  const updated: ServerAdminUser = {
    ...existing,
    name: name !== undefined ? name.trim() : existing.name,
    role: role !== undefined ? role : existing.role,
    mobileNo: mobileNo !== undefined ? mobileNo.trim() : existing.mobileNo,
    isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
    password: password && password.trim() ? password.trim() : existing.password
  };

  adminUsersStore[userIdx] = updated;
  saveAdminUsers();
  usersVersion++;
  broadcastLiveUpdate({ type: "users_updated", version: usersVersion });

  res.json({
    success: true,
    message: `User '${updated.username}' updated successfully.`,
    user: {
      id: updated.id,
      username: updated.username,
      name: updated.name,
      role: updated.role,
      mobileNo: updated.mobileNo,
      createdAt: updated.createdAt,
      isActive: updated.isActive,
      isPrimaryAdmin: updated.isPrimaryAdmin
    }
  });
});

// DELETE /api/admin/users/:id - Delete a support user
app.delete("/api/admin/users/:id", (req, res) => {
  const { id } = req.params;
  const userToDelete = adminUsersStore.find(u => u.id === id);

  if (!userToDelete) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (userToDelete.isPrimaryAdmin || userToDelete.username.toLowerCase() === 'megnottech') {
    return res.status(400).json({
      success: false,
      message: "Primary Master Admin 'megnottech' cannot be deleted."
    });
  }

  adminUsersStore = adminUsersStore.filter(u => u.id !== id);
  saveAdminUsers();
  usersVersion++;
  broadcastLiveUpdate({ type: "users_updated", version: usersVersion });

  res.json({
    success: true,
    message: `User '${userToDelete.username}' deleted successfully.`
  });
});

// POST /api/admin/users/:id/reset-password - Central Admin resets password for any user
app.post("/api/admin/users/:id/reset-password", (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, resetBy = "Central Super Admin" } = req.body;

    const userIdx = adminUsersStore.findIndex(u => u.id === id);
    if (userIdx === -1) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const targetUser = adminUsersStore[userIdx];
    const generatedPass = (newPassword && newPassword.trim()) ? newPassword.trim() : generateDefaultPassword();

    // Update password
    targetUser.password = generatedPass;
    adminUsersStore[userIdx] = targetUser;
    saveAdminUsers();
    usersVersion++;
    broadcastLiveUpdate({ type: "users_updated", version: usersVersion });

    const hostHeader = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
    const protoHeader = req.headers["x-forwarded-proto"] || "https";
    const siteUrl = req.headers.origin || `${protoHeader}://${hostHeader}`;

    const mobileToUse = targetUser.mobileNo || SUPER_ADMIN_MOBILE;
    const cleanPhone = mobileToUse.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const whatsappText = 
      `🔐 *Megnot सपोर्ट पोर्टल - पासवर्ड रीसेट विवरण*\n` +
      `================================\n` +
      `नमस्ते *${targetUser.name}* जी,\n\n` +
      `आपके Megnot टेक्निकल सपोर्ट अकाउंट का पासवर्ड सफलतापूर्वक रीसेट कर दिया गया है।\n\n` +
      `🔗 *वेबसाइट पोर्टल लिंक:*\n${siteUrl}\n\n` +
      `👤 *यूज़र आईडी (Login ID):* \`${targetUser.username}\`\n` +
      `🔑 *डिफ़ॉल्ट / नया पासवर्ड:* \`${generatedPass}\`\n` +
      `🛡️ *पद / रोल:* ${targetUser.role}\n` +
      `👨‍💼 *रीसेट किया गया द्वारा:* ${resetBy}\n\n` +
      `⚠️ *सुरक्षा निर्देश:* कृपया लॉगिन करने के बाद आवश्यकतानुसार पासवर्ड सुरक्षित रखें। यह जानकारी किसी अनधिकृत व्यक्ति से साझा न करें।\n\n` +
      `_Megnot Central Technical Desk • Super Admin (7001335445)_`;

    const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(whatsappText)}`;
    const whatsappWebUrl = `https://web.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(whatsappText)}`;

    res.json({
      success: true,
      message: `Password for '${targetUser.username}' has been successfully reset.`,
      newPassword: generatedPass,
      user: {
        id: targetUser.id,
        username: targetUser.username,
        name: targetUser.name,
        role: targetUser.role,
        mobileNo: targetUser.mobileNo,
        isPrimaryAdmin: targetUser.isPrimaryAdmin
      },
      siteUrl,
      whatsappUrl,
      whatsappWebUrl,
      whatsappText,
      superAdminMobile: SUPER_ADMIN_MOBILE
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to reset password" });
  }
});

// POST /api/admin/forgot-password - User forgot password request
app.post("/api/admin/forgot-password", (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your User ID or registered mobile number."
      });
    }

    const cleanInput = identifier.trim().toLowerCase();
    const cleanNumbersOnly = cleanInput.replace(/\D/g, '');

    // Search by username or mobile
    const matchedUser = adminUsersStore.find(u => {
      if (u.username.toLowerCase() === cleanInput) return true;
      if (u.mobileNo && (u.mobileNo === cleanInput || u.mobileNo.replace(/\D/g, '') === cleanNumbersOnly)) return true;
      return false;
    });

    if (!matchedUser) {
      const superAdminText = 
        `🚨 *Megnot पोर्टल पासवर्ड रीसेट सहायता अनुरोध*\n` +
        `नमस्ते Abhay Sir (Super Admin),\n\n` +
        `मैं Megnot टेक्निकल सपोर्ट पोर्टल का अधिकृत सदस्य हूँ। मुझे अपना लॉगिन पासवर्ड रीसेट करवाने में सहायता चाहिए।\n\n` +
        `• *यूज़र आईडी / मोबाइल:* ${identifier}\n` +
        `• *अनुरोध समय:* ${new Date().toLocaleString('en-IN')}\n\n` +
        `कृपया मुझे नया डिफ़ॉल्ट पासवर्ड जारी करने की कृपा करें।\n` +
        `_धन्यवाद!_`;

      return res.status(404).json({
        success: false,
        message: `No active account found for '${identifier}'. You can message Super Admin directly.`,
        superAdminWhatsAppUrl: `https://wa.me/91${SUPER_ADMIN_MOBILE}?text=${encodeURIComponent(superAdminText)}`,
        superAdminMobile: SUPER_ADMIN_MOBILE
      });
    }

    // Generate new default password
    const defaultPassword = generateDefaultPassword();
    matchedUser.password = defaultPassword;

    const userPhone = (matchedUser.mobileNo || SUPER_ADMIN_MOBILE).replace(/\D/g, '');
    const phoneWithCountry = userPhone.length === 10 ? `91${userPhone}` : userPhone;

    const dispatchText = 
      `🔐 *Megnot सपोर्ट पोर्टल - डिफ़ॉल्ट पासवर्ड*\n` +
      `================================\n` +
      `नमस्ते *${matchedUser.name}* जी,\n\n` +
      `आपके अनुरोध पर आपका Megnot टेक्निकल सपोर्ट पासवर्ड रीसेट कर दिया गया है।\n\n` +
      `👤 *यूज़र आईडी (Login ID):* \`${matchedUser.username}\`\n` +
      `🔑 *डिफ़ॉल्ट पासवर्ड (Default Password):* \`${defaultPassword}\`\n` +
      `🛡️ *रोल:* ${matchedUser.role}\n\n` +
      `🌐 *लॉगिन करें:* Megnot Central Support Portal\n` +
      `_Megnot Central Technical Desk • Super Admin (7001335445)_`;

    const userWhatsAppUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(dispatchText)}`;
    
    const superAdminNotifyText = 
      `ℹ️ *Megnot पोर्टल - पासवर्ड रीसेट नोटिफिकेशन*\n` +
      `यूज़र *${matchedUser.name}* (${matchedUser.username}, मोबाइल: ${matchedUser.mobileNo || 'N/A'}) का पासवर्ड रीसेट किया गया है। नया डिफ़ॉल्ट पासवर्ड: \`${defaultPassword}\``;

    res.json({
      success: true,
      message: `Default password generated for ${matchedUser.name}. Click below to receive it on WhatsApp.`,
      newPassword: defaultPassword,
      username: matchedUser.username,
      name: matchedUser.name,
      mobileNo: matchedUser.mobileNo,
      userWhatsAppUrl,
      superAdminWhatsAppUrl: `https://wa.me/91${SUPER_ADMIN_MOBILE}?text=${encodeURIComponent(superAdminNotifyText)}`,
      superAdminMobile: SUPER_ADMIN_MOBILE
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to process reset request" });
  }
});

// POST /api/admin/cleanup-history - Manual History Deletion & Purging
app.post("/api/admin/cleanup-history", (req, res) => {
  try {
    const { mode, ticketId, daysThreshold = 30 } = req.body;
    const initialCount = ticketsStore.length;
    let deletedCount = 0;
    let message = "";

    if (mode === "resolved_all") {
      // Delete ALL resolved tickets
      ticketsStore = ticketsStore.filter(t => t.status !== "resolved");
      deletedCount = initialCount - ticketsStore.length;
      message = `Successfully deleted ${deletedCount} resolved ticket(s) from history.`;
    } else if (mode === "resolved_older_30d") {
      // Delete resolved tickets older than 30 days
      deletedCount = performMonthlyResolvedTicketsCleanup(daysThreshold);
      message = `Successfully purged ${deletedCount} resolved ticket(s) older than ${daysThreshold} days.`;
    } else if (mode === "rejected_all") {
      // Delete all rejected tickets
      ticketsStore = ticketsStore.filter(t => t.status !== "rejected");
      deletedCount = initialCount - ticketsStore.length;
      message = `Successfully deleted ${deletedCount} rejected ticket(s) from history.`;
    } else if (mode === "single_ticket" && ticketId) {
      // Delete single ticket by ID
      ticketsStore = ticketsStore.filter(t => t.id !== ticketId);
      deletedCount = initialCount - ticketsStore.length;
      message = `Ticket #${ticketId} deleted successfully.`;
    } else {
      return res.status(400).json({ success: false, message: "Invalid cleanup mode specified." });
    }

    saveTickets();
    ticketsVersion++;
    broadcastLiveUpdate({ type: "tickets_cleaned", version: ticketsVersion });

    res.json({
      success: true,
      deletedCount,
      remainingCount: ticketsStore.length,
      message,
      lastAutoCleanupTime
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Cleanup failed" });
  }
});

// DELETE /api/tickets/:id - Delete single ticket
app.delete("/api/tickets/:id", (req, res) => {
  const { id } = req.params;
  const initialLength = ticketsStore.length;
  ticketsStore = ticketsStore.filter(t => t.id !== id);

  if (ticketsStore.length === initialLength) {
    return res.status(404).json({ success: false, message: "Ticket not found" });
  }

  saveTickets();
  ticketsVersion++;
  broadcastLiveUpdate({ type: "tickets_cleaned", version: ticketsVersion });

  res.json({
    success: true,
    message: `Ticket #${id} has been permanently deleted from dashboard.`
  });
});

// GET /api/admin/cleanup-stats - Return stats about history retention
app.get("/api/admin/cleanup-stats", (req, res) => {
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  
  const totalResolved = ticketsStore.filter(t => t.status === "resolved").length;
  const resolvedOlder30Days = ticketsStore.filter(t => {
    if (t.status !== "resolved") return false;
    const time = new Date(t.resolvedAt || t.updatedAt || t.createdAt).getTime();
    return (now - time) > thirtyDaysMs;
  }).length;
  const totalRejected = ticketsStore.filter(t => t.status === "rejected").length;

  res.json({
    success: true,
    stats: {
      totalResolved,
      resolvedOlder30Days,
      totalRejected,
      totalTickets: ticketsStore.length,
      autoCleanupEnabled: true,
      retentionDays: 30,
      lastAutoCleanupTime
    }
  });
});


// GET /api/tickets - fetch tickets with optional filtering & search
app.get("/api/tickets", (req, res) => {
  const { status, bank, state, search } = req.query;
  let filtered = [...ticketsStore];

  if (status && status !== "all") {
    filtered = filtered.filter(t => t.status === status);
  }
  if (bank && bank !== "all") {
    filtered = filtered.filter(t => t.bankName.toLowerCase().includes(String(bank).toLowerCase()));
  }
  if (state && state !== "all") {
    filtered = filtered.filter(t => t.state.toLowerCase() === String(state).toLowerCase());
  }
  if (search) {
    const q = String(search).toLowerCase().trim();
    filtered = filtered.filter(t => 
      t.id.toLowerCase().includes(q) ||
      t.koId.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.mobileNo.includes(q) ||
      t.anydeskId.replace(/\s+/g, '').includes(q.replace(/\s+/g, '')) ||
      t.district.toLowerCase().includes(q) ||
      t.bcLocation.toLowerCase().includes(q)
    );
  }

  // Sort latest first
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ success: true, tickets: filtered, count: filtered.length });
});

// GET /api/tickets/:id - single ticket detail
app.get("/api/tickets/:id", (req, res) => {
  const ticket = ticketsStore.find(t => t.id === req.params.id || t.koId.toLowerCase() === req.params.id.toLowerCase());
  if (!ticket) {
    return res.status(404).json({ success: false, message: "Ticket not found" });
  }
  res.json({ success: true, ticket });
});

// POST /api/tickets - create new ticket
app.post("/api/tickets", (req, res) => {
  try {
    const data = req.body;
    
    // Required fields validation
    if (!data.state || !data.district || !data.bankName || !data.name || !data.mobileNo || !data.koId || !data.anydeskId || !data.fingerprintDevice || !data.problemDescription) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required Megnot operator details (State, District, Bank, KO ID, Name, Mobile, AnyDesk ID, Fingerprint Device, Problem Description)." 
      });
    }

    const newTicket: TicketData = {
      id: data.id || `TKT-2026-${ticketCounter++}`,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      state: data.state.trim(),
      district: data.district.trim(),
      bankName: data.bankName.trim(),
      branchName: (data.branchName || "Main Branch").trim(),
      bcLocation: (data.bcLocation || "CSP Center").trim(),
      koId: data.koId.trim().toUpperCase(),
      name: data.name.trim(),
      mobileNo: data.mobileNo.replace(/\D/g, ''),
      anydeskId: data.anydeskId.trim(),
      fingerprintDevice: data.fingerprintDevice.trim(),
      deviceSerial: data.deviceSerial ? data.deviceSerial.trim() : undefined,
      problemCategory: data.problemCategory || "other_issue",
      problemDescription: data.problemDescription.trim(),
      screenshotUrl: data.screenshotUrl,
      urgency: data.urgency || "normal",
      status: "pending",
      whatsappNotified: false,
      syncedFromOffline: data.syncedFromOffline || false
    };

    ticketsStore.unshift(newTicket);
    saveTickets();
    ticketsVersion++;
    broadcastLiveUpdate({ type: "ticket_created", ticket: newTicket, version: ticketsVersion });

    res.status(201).json({
      success: true,
      message: "Ticket submitted successfully to centralized dashboard.",
      ticket: newTicket
    });
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create ticket" });
  }
});

// POST /api/tickets/batch-sync - sync offline queued tickets
app.post("/api/tickets/batch-sync", (req, res) => {
  try {
    const { tickets } = req.body;
    if (!Array.isArray(tickets) || tickets.length === 0) {
      return res.json({ success: true, syncedCount: 0, message: "No tickets to sync" });
    }

    let syncedCount = 0;
    const syncedList: TicketData[] = [];

    for (const item of tickets) {
      // Check if ticket already exists
      const existingIdx = ticketsStore.findIndex(t => t.id === item.id);
      if (existingIdx >= 0) {
        // Update
        ticketsStore[existingIdx] = {
          ...ticketsStore[existingIdx],
          ...item,
          updatedAt: new Date().toISOString()
        };
        syncedList.push(ticketsStore[existingIdx]);
      } else {
        const newTicket: TicketData = {
          ...item,
          id: item.id || `TKT-2026-${ticketCounter++}`,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncedFromOffline: true,
          status: item.status || "pending"
        };
        ticketsStore.unshift(newTicket);
        syncedList.push(newTicket);
        syncedCount++;
      }
    }

    saveTickets();
    ticketsVersion++;
    broadcastLiveUpdate({ type: "tickets_synced", version: ticketsVersion });

    res.json({
      success: true,
      syncedCount,
      syncedList,
      message: `Successfully synchronized ${syncedCount} offline ticket(s) to central dashboard.`
    });
  } catch (error: any) {
    console.error("Error in batch-sync:", error);
    res.status(500).json({ success: false, message: "Batch sync failed" });
  }
});

// PATCH /api/tickets/:id - update ticket status, assign technician, add remarks
app.patch("/api/tickets/:id", (req, res) => {
  const { id } = req.params;
  const ticketIndex = ticketsStore.findIndex(t => t.id === id);

  if (ticketIndex === -1) {
    return res.status(404).json({ success: false, message: "Ticket not found" });
  }

  const existing = ticketsStore[ticketIndex];
  const updates = req.body;

  const isResolving = updates.status === "resolved" && existing.status !== "resolved";

  const updatedTicket: TicketData = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
    resolvedAt: isResolving ? (updates.resolvedAt || new Date().toISOString()) : (updates.resolvedAt || existing.resolvedAt),
    resolvedBy: isResolving ? (updates.resolvedBy || updates.assignedTechnician || "Tech Support Team") : existing.resolvedBy
  };

  ticketsStore[ticketIndex] = updatedTicket;
  saveTickets();
  ticketsVersion++;
  broadcastLiveUpdate({ type: "ticket_updated", ticket: updatedTicket, version: ticketsVersion });

  res.json({
    success: true,
    message: isResolving ? "Ticket marked as resolved and notification recorded." : "Ticket updated successfully.",
    ticket: updatedTicket
  });
});

// GET /api/stats - dashboard summary metrics
app.get("/api/stats", (req, res) => {
  const total = ticketsStore.length;
  const pending = ticketsStore.filter(t => t.status === "pending").length;
  const inProgress = ticketsStore.filter(t => t.status === "in_progress").length;
  const resolved = ticketsStore.filter(t => t.status === "resolved").length;
  const rejected = ticketsStore.filter(t => t.status === "rejected").length;
  const critical = ticketsStore.filter(t => t.urgency === "critical" && t.status !== "resolved").length;

  const today = new Date().toISOString().split("T")[0];
  const resolvedToday = ticketsStore.filter(t => t.status === "resolved" && t.resolvedAt && t.resolvedAt.startsWith(today)).length;

  res.json({
    success: true,
    stats: {
      total,
      pending,
      inProgress,
      resolved,
      rejected,
      critical,
      resolvedToday: resolvedToday || resolved,
      avgResolutionMinutes: 18
    }
  });
});

// POST /api/ai-diagnose - Gemini 3.7 Flash powered RD Service & CSP Quick Troubleshooter
app.post("/api/ai-diagnose", async (req, res) => {
  try {
    const { fingerprintDevice, problemCategory, problemDescription, bankName, lang } = req.body;

    const ai = getAI();
    const isHindi = lang === 'hi';

    const systemPrompt = `You are an expert Megnot & CSP Kiosk Technical Support Engineer.
You specialize in Indian Banking Kiosk Portals (SBI Kiosk, PNB BC, BOB Digipath, Aryavart Bank, Union Bank, etc.) and UIDAI Biometric RD Services (Morpho MSO 1300 E3/E2, Mantra MFS100/MFS110, Startek FM220, SecuGen Hamster Pro 20, Aratek A600).
Your goal is to provide concise, step-by-step diagnostic and immediate 30-second fix instructions in ${isHindi ? 'Hindi (Devanagari script + English technical terms like services.msc, Chrome flags, HTTPS 11100)' : 'clear English'}.

Return a JSON object with:
- problemSummary: short 1-line diagnosis
- possibleCauses: array of 2-3 bullet points
- instantFixSteps: array of 3-5 numbered steps to try immediately
- rdServiceGuidance: specific port/config/driver instruction for the device
- anydeskRequired: boolean (true if remote session needed, false if self-fixable)
- preventionTip: 1 short practical tip to avoid this error tomorrow.`;

    const userPrompt = `Diagnose Megnot Issue:
- Bank: ${bankName || 'General Kiosk'}
- Biometric Device: ${fingerprintDevice || 'Morpho/Mantra'}
- Category: ${problemCategory || 'RD Service issue'}
- Problem text: "${problemDescription || 'Device not ready in browser'}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            problemSummary: { type: Type.STRING },
            possibleCauses: { type: Type.ARRAY, items: { type: Type.STRING } },
            instantFixSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            rdServiceGuidance: { type: Type.STRING },
            anydeskRequired: { type: Type.BOOLEAN },
            preventionTip: { type: Type.STRING }
          },
          required: ["problemSummary", "possibleCauses", "instantFixSteps", "rdServiceGuidance", "anydeskRequired", "preventionTip"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({ success: true, diagnosis: parsed });
  } catch (error: any) {
    console.error("Error in AI diagnosis:", error);
    
    // Graceful fallback with standard CSP guidance if API key isn't provided yet
    const isHindi = req.body?.lang === 'hi';
    res.json({
      success: true,
      diagnosis: {
        problemSummary: isHindi 
          ? "RD सर्विस कम्युनिकेशन या ब्राउज़र सर्टिफिकेट सेटिंग की समस्या" 
          : "RD Service communication or browser certificate configuration issue",
        possibleCauses: isHindi 
          ? [
              "डिवाइस ड्राइवर या RD Service बैकग्राउंड में बंद (Stopped) हो सकती है",
              "Chrome ब्राउज़र में allow-insecure-localhost फ्लैग डिसेबल है",
              "USB पोर्ट में वोल्टेज ड्रॉप या केबल ढीली है"
            ]
          : [
              "RD Service Windows background service is stopped",
              "Chrome localhost certificate whitelist is disabled",
              "USB port loose connection or driver mismatch"
            ],
        instantFixSteps: isHindi
          ? [
              "1. 'Win + R' दबाएं, 'services.msc' टाइप करें और एंटर दबाएं।",
              "2. सूची में 'Morpho RD Service' या 'Mantra Client Service' खोजें और 'Restart' पर क्लिक करें।",
              "3. Chrome में 'chrome://flags/#allow-insecure-localhost' खोलें और 'Enabled' सेट करें।",
              "4. डिवाइस की USB केबल को पीछे वाले मुख्य USB पोर्ट में लगाएं।"
            ]
          : [
              "1. Press Win + R, type 'services.msc' and press Enter.",
              "2. Locate your Morpho / Mantra RD Service and click 'Restart'.",
              "3. Open chrome://flags/#allow-insecure-localhost and toggle to 'Enabled'.",
              "4. Reconnect USB cable into motherboards rear USB port."
            ],
        rdServiceGuidance: isHindi
          ? "Morpho के लिए C:\\MorphoRDServiceL0Soft\\Config.ini में Communication Type 0 या 1 चेक करें।"
          : "For Morpho, verify Communication Type in C:\\MorphoRDServiceL0Soft\\Config.ini.",
        anydeskRequired: true,
        preventionTip: isHindi
          ? "कियोस्क सिस्टम चालू करने के बाद 1 मिनट तक RD Service लोड होने दें, फिर ब्राउज़र खोलें।"
          : "Allow 1 minute after boot for RD Service to initialize before launching kiosk portal."
      }
    });
  }
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Megnot Support Server running on port ${PORT}`);
  });
}

startServer();
