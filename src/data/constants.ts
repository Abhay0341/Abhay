import { Ticket, UIConfig, BiometricDeviceConfig, ProblemCategoryConfig, QuickFaqConfig } from '../types';

export const INDIAN_STATES_DISTRICTS: Record<string, string[]> = {
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Varanasi", "Prayagraj", "Gorakhpur", "Agra", "Meerut",
    "Bareilly", "Aligarh", "Ayodhya", "Jhansi", "Moradabad", "Azamgarh", "Basti",
    "Ghazipur", "Jaunpur", "Ballia", "Deoria", "Mirzapur", "Sultanpur", "Hardoi",
    "Sitapur", "Lakhimpur Kheri", "Gonda", "Bahraich", "Barabanki", "Unnao", "Budaun"
  ],
  "Bihar": [
    "Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia", "Rohtas",
    "Bhojpur", "Saran (Chapra)", "Samastipur", "Begusarai", "Siwan", "Motihari",
    "Bettiah", "Katihar", "Saharsa", "Madhepura", "Nalanda", "Vaishali", "Arrah", "Buxar"
  ],
  "Madhya Pradesh": [
    "Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa", "Satna",
    "Chhindwara", "Dewas", "Ratlam", "Vidisha", "Damoh", "Shivpuri", "Sehore"
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar",
    "Sikar", "Sri Ganganagar", "Bharatpur", "Pali", "Barmer", "Nagaur"
  ],
  "Maharashtra": [
    "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad (Chhatrapati Sambhaji Nagar)",
    "Solapur", "Amravati", "Kolhapur", "Nanded", "Thane", "Jalgaon", "Akola", "Latur"
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "North 24 Parganas", "South 24 Parganas", "Hooghly",
    "Murshidabad", "Nadia", "Purba Medinipur", "Paschim Medinipur", "Malda", "Bardhaman"
  ],
  "Jharkhand": [
    "Ranchi", "Dhanbad", "Jamshedpur (East Singhbhum)", "Bokaro", "Hazaribagh",
    "Giridih", "Deoghar", "Dumka", "Palamu", "Ramgarh"
  ],
  "Chhattisgarh": [
    "Raipur", "Bilaspur", "Durg", "Bhilai", "Korba", "Rajnandgaon", "Jagdalpur", "Ambikapur"
  ],
  "Haryana": [
    "Gurugram", "Faridabad", "Hisar", "Panipat", "Ambala", "Karnal", "Rohtak", "Sonipat", "Sirsa"
  ],
  "Punjab": [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Hoshiarpur", "Mohali"
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar"
  ],
  "Odisha": [
    "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Balasore", "Puri"
  ],
  "Assam": [
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"
  ],
  "Delhi (NCT)": [
    "Central Delhi", "East Delhi", "New Delhi", "North Delhi", "South Delhi", "West Delhi"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Nainital", "Almora"
  ],
  "Himachal Pradesh": [
    "Shimla", "Mandi", "Dharamshala", "Solan", "Kullu", "Hamirpur", "Bilaspur"
  ],
  "Jammu & Kashmir": [
    "Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua", "Udhampur"
  ],
  "Telangana": [
    "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"
  ],
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati"
  ],
  "Karnataka": [
    "Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Kalaburagi"
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"
  ],
  "Kerala": [
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur"
  ]
};

export const BANK_LIST = [
  "State Bank of India (SBI Kiosk)",
  "Punjab National Bank (PNB BC)",
  "Bank of Baroda (BOB Digipath)",
  "Union Bank of India (UBI)",
  "Canara Bank",
  "Central Bank of India (CBI)",
  "Indian Bank",
  "Bank of India (BOI)",
  "UCO Bank",
  "Punjab & Sind Bank",
  "Aryavart Bank (RRB)",
  "Baroda UP Bank (RRB)",
  "Dakshin Bihar Gramin Bank (DBGB)",
  "Prathama UP Gramin Bank",
  "Uttar Bihar Gramin Bank (UBGB)",
  "Madhya Pradesh Gramin Bank (MPGB)",
  "Madhyanchal Gramin Bank",
  "Sarva Haryana Gramin Bank",
  "Rajasthan Marudhara Gramin Bank (RMGB)",
  "HDFC Bank BC",
  "ICICI Bank CSP",
  "Axis Bank BC",
  "Fino Payments Bank",
  "Airtel Payments Bank",
  "India Post Payments Bank (IPPB)",
  "Paytm Payments Bank BC",
  "Other Bank / Corporate BC"
];

export const BIOMETRIC_DEVICES = [
  {
    name: "Morpho MSO 1300 E3 (USB)",
    driverInfo: "Morpho RD Service v1.0.8 / v2.0.1 HTTP:11100 / HTTPS:11101",
    vendor: "IDEMIA"
  },
  {
    name: "Morpho MSO 1300 E2 (Legacy)",
    driverInfo: "Morpho RD Service & Smart USB Driver",
    vendor: "IDEMIA"
  },
  {
    name: "Mantra MFS100 (v54 / v9.2)",
    driverInfo: "Mantra Client Service 9.0.8.6 & MFS100 Driver v9.2.0.0",
    vendor: "Mantra Softech"
  },
  {
    name: "Mantra MFS110 (L1 Device)",
    driverInfo: "Mantra L1 RD Service 1.0.0.4 for UIDAI L1 migration",
    vendor: "Mantra Softech"
  },
  {
    name: "Startek FM220 / FM220U",
    driverInfo: "Startek ACPL FM220 RD Service v1.0.5",
    vendor: "Access Computech"
  },
  {
    name: "SecuGen Hamster Pro 20 (HUPx)",
    driverInfo: "SecuGen India RD Service v1.0.2.7",
    vendor: "SecuGen"
  },
  {
    name: "Aratek A600 Fingerprint Scanner",
    driverInfo: "Aratek RD Service v1.0.3",
    vendor: "Aratek"
  },
  {
    name: "Evolute Identi5 / Leopard MicroATM",
    driverInfo: "Evolute Integrated RD Service & Bluetooth Driver",
    vendor: "Evolute"
  },
  {
    name: "Precision PB510",
    driverInfo: "Precision Biometric RD Service",
    vendor: "Precision"
  },
  {
    name: "Mantra MIS100V2 (Iris Scanner)",
    driverInfo: "Mantra Iris RD Service v1.0.8",
    vendor: "Mantra Softech"
  },
  {
    name: "Tatvik TMF20",
    driverInfo: "Tatvik RD Service Utility",
    vendor: "Tatvik"
  },
  {
    name: "Other Fingerprint Device",
    driverInfo: "Custom Biometric Driver",
    vendor: "Generic"
  }
];

export const PROBLEM_CATEGORIES: ProblemCategoryConfig[] = [
  {
    id: "rd_service_error",
    en: "RD Service Not Ready / Device Registration Failed",
    hi: "RD सर्विस नॉट रेडी / डिवाइस रजिस्ट्रेशन फेल",
    icon: "Fingerprint",
    suggestedFixEn: "Open 'services.msc', restart Morpho/Mantra RD Service. Disconnect & reconnect USB. Check port 11100 in Chrome flags.",
    suggestedFixHi: "'services.msc' खोलें और Morpho/Mantra RD सर्विस को रीस्टार्ट करें। USB केबल निकालकर दोबारा लगाएं।"
  },
  {
    id: "chrome_java_tls",
    en: "Chrome / Edge TLS Certificate & Java Pop-up Error",
    hi: "क्रोम / एज TLS सर्टिफिकेट व जावा एरर",
    icon: "Globe",
    suggestedFixEn: "Go to 'chrome://flags/#allow-insecure-localhost' and set to ENABLED. Clear SSL state in Internet Options.",
    suggestedFixHi: "'chrome://flags/#allow-insecure-localhost' को Enabled करें। Internet Options में Clear SSL State करें।"
  },
  {
    id: "anydesk_remote_needed",
    en: "Complete Remote Configuration via AnyDesk Needed",
    hi: "AnyDesk के माध्यम से पूरा रिमोट सपोर्ट चाहिए",
    icon: "Monitor",
    suggestedFixEn: "Keep AnyDesk open with 9-digit ID ready. Ensure PC is connected to steady Internet.",
    suggestedFixHi: "AnyDesk खोलकर रखें और अपना 9 अंकों का AnyDesk कोड तैयार रखें। इंटरनेट चालू रखें।"
  },
  {
    id: "portal_login_failed",
    en: "Bank Kiosk Portal Login Error / Whitelist Issue",
    hi: "बैंक कियोस्क पोर्टल लॉगिन एरर / व्हाइटलिस्ट समस्या",
    icon: "ShieldAlert",
    suggestedFixEn: "Verify IP whitelisting with BC coordinator. Check if corporate proxy or antivirus is blocking bank URL.",
    suggestedFixHi: "अपने बीसी कोऑर्डिनेटर से आईपी व्हाइटलिस्टिंग चेक कराएं। एंटीवायरस या प्रॉक्सी डिसेबल करके देखें।"
  },
  {
    id: "fingerprint_not_capturing",
    en: "Biometric Sensor Light ON but Fingerprint Not Capturing",
    hi: "डिवाइस की लाइट जल रही है पर फिंगरप्रिंट कैप्चर नहीं हो रहा",
    icon: "Scan",
    suggestedFixEn: "Clean sensor prism with dry micro-fiber cloth. Check device device test utility. Re-install driver runtime.",
    suggestedFixHi: "सेंसर ग्लास को साफ़ कपड़े से पोछें। टेस्ट यूटिलिटी में फिंगर चेक करें या ड्राइवर री-इन्स्टॉल करें।"
  },
  {
    id: "cash_deposit_stuck",
    en: "Cash Deposit / Withdrawal Transaction Stuck / AEPS Failure",
    hi: "जमा / निकासी ट्रांजैक्शन अटका / AEPS एरर",
    icon: "CreditCard",
    suggestedFixEn: "Note down RRN / Stan number. Do not re-attempt immediately to prevent double debits. Report transaction ID.",
    suggestedFixHi: "RRN और ट्रांजेक्शन नंबर नोट कर लें। तुरंत दोबारा प्रयास न करें ताकि दोहरा डेबिट न हो।"
  },
  {
    id: "microatm_pinpad_error",
    en: "MicroATM / Bluetooth Pinpad Connectivity Problem",
    hi: "माइक्रोएटीएम / पिनपैड कनेक्टिविटी समस्या",
    icon: "Smartphone",
    suggestedFixEn: "Unpair Bluetooth device and pair again. Re-install MicroATM bridge application.",
    suggestedFixHi: "ब्लूटूथ डिवाइस अनपेयर करके दोबारा कनेक्ट करें और MicroATM ब्रिज ऐप रीस्टार्ट करें।"
  },
  {
    id: "l1_upgrade_migration",
    en: "UIDAI L1 Biometric Device Upgrade / Certificate Expiry",
    hi: "UIDAI L1 डिवाइस अपग्रेड / सर्टिफिकेट एक्सपायरी समस्या",
    icon: "KeyRound",
    suggestedFixEn: "Verify UIDAI L1 certificate registration status at manufacturer portal (Mantra/Morpho portal).",
    suggestedFixHi: "कंपनी के पोर्टल पर UIDAI L1 RD सर्विस की वैलिडिटी चेक करें।"
  },
  {
    id: "other_issue",
    en: "Other Technical / Software Issue",
    hi: "अन्य तकनीकी / सॉफ्टवेयर समस्या",
    icon: "Wrench",
    suggestedFixEn: "Please provide clear details, exact error code text, and keep AnyDesk active.",
    suggestedFixHi: "कृपया एरर कोड व समस्या का पूरा विवरण लिखें और AnyDesk चालू रखें।"
  }
];

export const DEFAULT_UI_DEVICES: BiometricDeviceConfig[] = BIOMETRIC_DEVICES.map((d, index) => ({
  id: `dev-${index + 1}`,
  name: d.name,
  driverInfo: d.driverInfo,
  vendor: d.vendor,
  isCustom: false
}));

export const DEFAULT_QUICK_FAQS: QuickFaqConfig[] = [
  {
    id: "faq-1",
    questionEn: "How to fix Morpho RD Service error 11100 / 11101?",
    questionHi: "Morpho RD सर्विस एरर 11100 / 11101 कैसे ठीक करें?",
    answerEn: "Open Windows Services (Run -> services.msc), find 'Morpho RD Service', right click and select 'Restart'. Reconnect the USB cable.",
    answerHi: "Run विंडो में 'services.msc' खोलें, 'Morpho RD Service' पर राइट क्लिक करके 'Restart' करें। USB केबल निकाल कर दोबारा लगाएं।"
  },
  {
    id: "faq-2",
    questionEn: "How to resolve Java security block error on SBI Kiosk?",
    questionHi: "SBI कियोस्क पोर्टल पर जावा सिक्योरिटी ब्लॉक एरर कैसे हटाएं?",
    answerEn: "Open Configure Java -> Security tab -> Add your bank kiosk URL to Exception Site List and set security level to High.",
    answerHi: "कंट्रोल पैनल में Configure Java खोलें -> Security टैब -> Exception Site List में बैंक पोर्टल का URL जोड़ें।"
  },
  {
    id: "faq-3",
    questionEn: "Where to download UIDAI L1 RD Service drivers?",
    questionHi: "UIDAI L1 बायोमेट्रिक RD सर्विस ड्राइवर कहाँ से डाउनलोड करें?",
    answerEn: "Download official signed drivers from Mantra Softech or IDEMIA portal as per your device model.",
    answerHi: "अपनी डिवाइस के अनुसार Mantra Softech या IDEMIA की आधिकारिक वेबसाइट से L1 RD सर्विस ड्राइवर डाउनलोड करें।"
  }
];

export const DEFAULT_UI_CONFIG: UIConfig = {
  banks: [...BANK_LIST],
  devices: DEFAULT_UI_DEVICES,
  problemCategories: PROBLEM_CATEGORIES,
  statesDistricts: { ...INDIAN_STATES_DISTRICTS },
  announcement: {
    enabled: true,
    titleEn: "Megnot Tech Support Live Announcement",
    titleHi: "Megnot तकनीकी सहायता लाइव सूचना",
    messageEn: "UIDAI L1 device drivers and banking portal updates are available. For urgent ticket resolution, keep AnyDesk active.",
    messageHi: "UIDAI L1 डिवाइस ड्राइवर व बैंकिंग पोर्टल अपडेट उपलब्ध हैं। त्वरित समाधान हेतु AnyDesk आईडी तैयार रखें।",
    type: "info",
    linkUrl: "",
    linkTextEn: "Learn More",
    linkTextHi: "अधिक जानें"
  },
  formFields: {
    anydeskMode: "optional",
    showDeviceSerial: true,
    deviceSerialRequired: false,
    showScreenshot: true,
    screenshotRequired: false,
    showBranchName: true,
    branchNameRequired: false,
    showBcLocation: true,
    bcLocationRequired: false,
    showUrgencySelection: true,
    defaultUrgency: "high",
    allowSelfHelpAi: true
  },
  supportInfo: {
    superAdminMobile: "7001335445",
    helplineNumber: "7001335445",
    supportEmail: "support@megnot.com",
    operatingHoursEn: "08:00 AM - 10:00 PM (Monday to Sunday)",
    operatingHoursHi: "सुबह 08:00 बजे से रात 10:00 बजे तक (सोमवार से रविवार)",
    showWhatsAppQuickHelp: true,
    bannerNoticeEn: "Central Megnot Technical Help Desk for Banking CSP & Kiosks",
    bannerNoticeHi: "बैंकिंग सीएसपी व कियोस्क ऑपरेटरों हेतु सेंट्रल Megnot तकनीकी हेल्पडेस्क"
  },
  quickFaqs: DEFAULT_QUICK_FAQS,
  lastUpdated: new Date().toISOString()
};


export const INITIAL_SEED_TICKETS: Ticket[] = [
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
