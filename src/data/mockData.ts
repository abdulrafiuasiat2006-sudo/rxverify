import { 
  Prescription, 
  DispensingLogEntry, 
  OTCAlternative, 
  PharmacyProfile, 
  MockDoctor, 
  MockPharmacy,
  MockMdcnEntry,
  MockPcnEntry,
  VerificationResult,
  PendingRegistration
} from '../types';

export const MDCN_OFFICIAL_LOOKUP_URL = 'https://portal.mdcn.gov.ng/confirm-doctor-status';
export const PCN_OFFICIAL_LOOKUP_URL = 'https://pcncore.azurewebsites.net/PublicSearch/PublicVerification';

export const INITIAL_PENDING_REGISTRATIONS: PendingRegistration[] = [
  {
    id: 'reg-doc-01',
    type: 'doctor',
    status: 'PENDING_VERIFICATION',
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    fullName: 'Dr. Zainab Aliyu',
    mdcnNumber: 'MDCN/R/77102',
    phone: '+234 803 221 4488',
    email: 'zainab.aliyu@kadunahospital.gov.ng',
    specialty: 'Pediatrics & Family Medicine',
    clinicName: 'Barau Dikko Teaching Hospital, Kaduna',
  },
  {
    id: 'reg-pharm-01',
    type: 'pharmacy',
    status: 'PENDING_VERIFICATION',
    submittedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    pharmacyName: 'Alpha Pharmacy & Stores',
    pcnNumber: 'PCN/R/44120',
    phone: '+234 802 551 9022',
    email: 'dispensary@alphapharmacy.ng',
    address: '168 Awolowo Road, Ikoyi',
    city: 'Ikoyi',
    state: 'Lagos State',
  },
];

export const MOCK_DOCTORS: MockDoctor[] = [
  {
    id: 'doc-01',
    name: 'Dr. Funke Adeyemi, MBBS, FWACS',
    mdcn: 'MDCN/R/48921',
    hospital: 'Lagos University Teaching Hospital (LUTH), Idi-Araba',
    phone: '+234 802 334 1190',
    email: 'funke.adeyemi@luth.gov.ng',
    specialty: 'Orthopedic Surgery & Traumatology',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2024-01-15T08:00:00Z',
    statusNotes: 'Active License in Good Standing. Authorized for Schedule II-IV Controlled Prescriptions.',
  },
  {
    id: 'doc-02',
    name: 'Dr. Ibrahim Musa, MBBS, FWACS',
    mdcn: 'MDCN/R/29840',
    hospital: 'National Hospital Abuja, Garki',
    phone: '+234 803 559 3301',
    email: 'i.musa@nationalhospital.gov.ng',
    specialty: 'General Surgery & Pain Management',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2023-11-10T09:00:00Z',
    statusNotes: 'Active License. Federal Health Registry verified.',
  },
  {
    id: 'doc-03',
    name: 'Dr. Aisha Mohammed, MBBS, FMCPsych',
    mdcn: 'MDCN/R/51209',
    hospital: 'Federal Neuro-Psychiatric Hospital, Yaba, Lagos',
    phone: '+234 802 990 7712',
    email: 'a.mohammed@fnphyaba.gov.ng',
    specialty: 'Clinical Psychiatry & Neurobiology',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2024-02-18T10:30:00Z',
    statusNotes: 'Active License. Psychiatric Controlled Substance Prescriber.',
  },
  {
    id: 'doc-04',
    name: 'Dr. Obinna Eze, MBBS, FMCP',
    mdcn: 'MDCN/R/33918',
    hospital: 'Evercare Hospital Lekki, Lagos',
    phone: '+234 809 112 4455',
    email: 'o.eze@evercare.ng',
    specialty: 'Internal Medicine & Pulmonology',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2024-03-01T11:15:00Z',
    statusNotes: 'Active License. Certified Hospital Prescriber.',
  },
  {
    id: 'doc-05',
    name: 'Dr. Zainab Aliyu, MBBS, FWACP',
    mdcn: 'MDCN/R/77102',
    hospital: 'Barau Dikko Teaching Hospital, Kaduna',
    phone: '+234 803 221 4488',
    email: 'zainab.aliyu@kadunahospital.gov.ng',
    specialty: 'Pediatrics & Family Medicine',
    verificationStatus: 'PENDING',
    statusNotes: 'Application submitted. Awaiting MDCN database credential synchronization.',
  },
  {
    id: 'doc-06',
    name: 'Dr. Kenneth Okoro, MBBS',
    mdcn: 'MDCN/R/11094',
    hospital: 'Private Practice (Suspended by Tribunal)',
    phone: '+234 802 000 1122',
    email: 'k.okoro@medconsult.ng',
    specialty: 'General Surgery',
    verificationStatus: 'FAILED',
    statusNotes: 'Verification Failed: Practicing license suspended by Medical and Dental Practitioners Disciplinary Tribunal.',
  },
  {
    id: 'doc-07',
    name: 'Dr. Fatima Al-Hassan, MBBS, FWACS',
    mdcn: 'MDCN/R/22901',
    hospital: 'Kano State Specialist Hospital',
    phone: '+234 803 999 4433',
    email: 'f.alhassan@kanohealth.gov.ng',
    specialty: 'Obstetrics & Gynecology',
    verificationStatus: 'NEEDS_CORRECTION',
    statusNotes: 'Information Needs Correction: Annual Practicing License (APL) expired on 31 Dec 2025. Please upload renewal payment receipt to reactivate.',
  },
];

export const MOCK_PHARMACIES: MockPharmacy[] = [
  {
    id: 'pharm-01',
    name: 'Medplus Pharmacy (Ikeja Branch)',
    pcn: 'PCN/R/28419',
    pcnPremisesNumber: 'PCN/LA/IKJ/0924',
    state: 'Lagos State',
    city: 'Ikeja',
    address: 'Plot 12, Allen Avenue, Ikeja, Lagos',
    phone: '+234 802 334 8810',
    email: 'ikeja@medplusnig.com',
    supervisingPharmacist: 'Pharm. Bamidele Adeleke, B.Pharm, MPSN',
    pharmacistPCN: 'PCN/R/28419',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2025-01-14T10:00:00Z',
    statusNotes: 'PCN Certified Premises. Licensed for Schedule II-IV Controlled Dispensing.',
    lat: 6.6018,
    lng: 3.3515,
    distanceKm: 0.8,
    operatingStatus: 'OPEN',
    hoursText: 'Open Now • Closes at 10:00 PM',
    services: ['Controlled Substance Vault (Schedule II-IV)', 'Digital Rx Verification Terminal', 'Cold-Chain Biological Storage', 'Biometric NIN Validation'],
    scheduleTier: 'Tier 1 Accredited Controlled Dispenser',
    rating: 4.9,
  },
  {
    id: 'pharm-02',
    name: 'HealthPlus Pharmacy (Victoria Island)',
    pcn: 'PCN/R/19084',
    pcnPremisesNumber: 'PCN/LA/ETI/1102',
    state: 'Lagos State',
    city: 'Victoria Island',
    address: 'Plot 14B, Adetokunbo Ademola St, Victoria Island, Lagos',
    phone: '+234 805 991 2044',
    email: 'vi.dispensary@healthplus.com.ng',
    supervisingPharmacist: 'Pharm. Ngozi Uche, B.Pharm, FPSN',
    pharmacistPCN: 'PCN/R/19084',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2024-11-20T08:30:00Z',
    statusNotes: 'PCN Certified High-Security Premises. 24/7 Verified Dispenser.',
    lat: 6.4281,
    lng: 3.4219,
    distanceKm: 2.4,
    operatingStatus: 'OPEN_24_7',
    hoursText: 'Open 24 Hours • Emergency Counter Active',
    services: ['24/7 Emergency Narcotic Vault', 'PCN Central Registry Live Sync', 'Opioid Safeguard Counseling', 'Doctor Hotline Verification'],
    scheduleTier: 'Tier 1 High-Security Dispenser',
    rating: 4.8,
  },
  {
    id: 'pharm-03',
    name: 'Alpha Pharmacy & Healthcare (Ikoyi)',
    pcn: 'PCN/R/44120',
    pcnPremisesNumber: 'PCN/LA/IKO/0512',
    state: 'Lagos State',
    city: 'Ikoyi',
    address: '168 Awolowo Road, Ikoyi, Lagos',
    phone: '+234 803 772 1900',
    email: 'dispensary@alphapharmacy.ng',
    supervisingPharmacist: 'Pharm. Femi Olawale, B.Pharm, MPSN',
    pharmacistPCN: 'PCN/R/44120',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2025-02-01T09:00:00Z',
    statusNotes: 'PCN Certified Controlled Drug Dispensary.',
    lat: 6.4474,
    lng: 3.4280,
    distanceKm: 3.1,
    operatingStatus: 'OPEN',
    hoursText: 'Open Now • Closes at 9:00 PM',
    services: ['Schedule II Strict Register', 'Electronic Dispensing Log', 'Hospital Discharge Fast-Track'],
    scheduleTier: 'Tier 1 Accredited Controlled Dispenser',
    rating: 4.7,
  },
  {
    id: 'pharm-04',
    name: 'Nett Pharmacy (Abuja Central CBD)',
    pcn: 'PCN/R/31055',
    pcnPremisesNumber: 'PCN/FCT/CBD/0411',
    state: 'FCT Abuja',
    city: 'Abuja',
    address: 'Plot 710, Constitution Avenue, Central Business District, Abuja',
    phone: '+234 809 443 1182',
    email: 'abuja.central@nettpharmacy.com',
    supervisingPharmacist: 'Pharm. Yakubu Danjuma, B.Pharm',
    pharmacistPCN: 'PCN/R/31055',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2024-10-18T11:20:00Z',
    statusNotes: 'PCN Certified Federal Capital Hub. NAFDAC Track & Trace node.',
    lat: 9.0579,
    lng: 7.4951,
    distanceKm: 4.6,
    operatingStatus: 'OPEN',
    hoursText: 'Open Now • Closes at 10:30 PM',
    services: ['Federal Capital Regulatory Hub', 'NAFDAC Track & Trace Node', 'Schedule II/III Certified'],
    scheduleTier: 'Tier 1 High-Security Dispenser',
    rating: 4.9,
  },
  {
    id: 'pharm-05',
    name: 'Mopheth Pharmacy (Lekki Phase 1)',
    pcn: 'PCN/R/55201',
    pcnPremisesNumber: 'PCN/LA/ETI/3391',
    state: 'Lagos State',
    city: 'Lekki',
    address: 'Block 22, Admiralty Way, Lekki Phase 1, Lagos',
    phone: '+234 814 882 3019',
    email: 'lekki@mophethpharmacy.com',
    supervisingPharmacist: 'Pharm. Chinyere Nwankwo, B.Pharm, MPSN',
    pharmacistPCN: 'PCN/R/55201',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2025-03-02T14:15:00Z',
    statusNotes: 'PCN Certified Controlled Substance Dispenser.',
    lat: 6.4474,
    lng: 3.4735,
    distanceKm: 5.2,
    operatingStatus: 'OPEN_24_7',
    hoursText: 'Open 24 Hours • Pharmacist on Duty',
    services: ['Full Controlled Substances License', 'Digital QR Barcode Gateway', 'Substance Abuse Prevention Screening'],
    scheduleTier: 'Tier 1 Accredited Controlled Dispenser',
    rating: 4.8,
  },
  {
    id: 'pharm-06',
    name: 'Vanguard Pharmacy (Ibadan Ring Road)',
    pcn: 'PCN/R/18420',
    pcnPremisesNumber: 'PCN/OY/IBD/0199',
    state: 'Oyo State',
    city: 'Ibadan',
    address: 'Plot 4, Ring Road, Beside Mobil Station, Ibadan',
    phone: '+234 802 881 9904',
    email: 'ringroad@vanguardpharmacy.com',
    supervisingPharmacist: 'Pharm. Adeola Adeleke, B.Pharm',
    pharmacistPCN: 'PCN/R/18420',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2024-12-05T10:45:00Z',
    statusNotes: 'PCN Certified Regional Depot.',
    lat: 7.3775,
    lng: 3.8722,
    distanceKm: 8.5,
    operatingStatus: 'CLOSING_SOON',
    hoursText: 'Closing Soon • Open until 8:30 PM',
    services: ['Southwest Regional Depot', 'NAFDAC Barcode Verification', 'Anti-Forgery Protocol'],
    scheduleTier: 'Tier 2 Certified Dispenser',
    rating: 4.6,
  },
  {
    id: 'pharm-07',
    name: 'City Gate Pharmacy (Yaba - Suspended)',
    pcn: 'PCN/R/99012',
    pcnPremisesNumber: 'PCN/LA/YAB/8810',
    state: 'Lagos State',
    city: 'Yaba',
    address: '42 Commercial Avenue, Sabo Yaba, Lagos',
    phone: '+234 802 000 3344',
    email: 'info@citygatepharm.ng',
    supervisingPharmacist: 'Pharm. Kolawole Johnson (Suspended)',
    pharmacistPCN: 'PCN/R/99012',
    verificationStatus: 'SUSPENDED',
    statusNotes: 'Premises Sealed by PCN Enforcement: License Revoked for Unauthorized Controlled Substance Dispensing without Doctor Rx.',
    lat: 6.5165,
    lng: 3.3768,
    distanceKm: 4.1,
    operatingStatus: 'CLOSED',
    hoursText: 'Closed / Suspended by Regulatory Council',
    services: ['Premises Inactive'],
    scheduleTier: 'REVOKED',
    rating: 2.1,
  },
  {
    id: 'pharm-08',
    name: 'Express Care Pharmacy (Surulere - Pending)',
    pcn: 'PCN/R/61022',
    pcnPremisesNumber: 'PCN/LA/SUR/4401',
    state: 'Lagos State',
    city: 'Surulere',
    address: '18 Adeniran Ogunsanya St, Surulere, Lagos',
    phone: '+234 803 111 8899',
    email: 'surulere@expresscare.ng',
    supervisingPharmacist: 'Pharm. Blessing Okon, B.Pharm',
    pharmacistPCN: 'PCN/R/61022',
    verificationStatus: 'PENDING',
    statusNotes: 'Premises Verification Pending: Awaiting physical council inspection and narcotics vault approval.',
    lat: 6.4975,
    lng: 3.3582,
    distanceKm: 3.8,
    operatingStatus: 'OPEN',
    hoursText: 'Pending Council Certification',
    services: ['Under Regulatory Review'],
    scheduleTier: 'Unapproved for Controlled Substances',
    rating: 4.2,
  },
  {
    id: 'pharm-09',
    name: 'Universal Chemist (Unverified Draft)',
    pcn: 'PCN/DRAFT/001',
    state: 'Lagos State',
    city: 'Oshodi',
    address: 'Oshodi-Isolo Expressway, Lagos',
    supervisingPharmacist: 'Pending Superintendent Nomination',
    pharmacistPCN: 'PCN/PENDING',
    verificationStatus: 'UNVERIFIED',
    statusNotes: 'Unverified registration draft.',
    lat: 6.5367,
    lng: 3.3394,
    distanceKm: 5.5,
    operatingStatus: 'CLOSED',
    hoursText: 'Unverified',
    services: [],
    scheduleTier: 'None',
    rating: 3.0,
  },
  {
    id: 'pharm-10',
    name: 'Apex Care Chemist (Failed Inspection)',
    pcn: 'PCN/R/00912',
    state: 'Lagos State',
    city: 'Mushin',
    address: 'Agege Motor Road, Mushin, Lagos',
    supervisingPharmacist: 'Unaccredited',
    pharmacistPCN: 'PCN/INVALID',
    verificationStatus: 'FAILED',
    statusNotes: 'Verification Failed: Registration number does not match PCN national registry.',
    lat: 6.5298,
    lng: 3.3551,
    distanceKm: 4.9,
    operatingStatus: 'CLOSED',
    hoursText: 'Failed Verification',
    services: [],
    scheduleTier: 'Failed',
    rating: 1.5,
  },
];

export const CURRENT_PHARMACY = MOCK_PHARMACIES[0];

export const CONTROLLED_DRUGS_LIST = [
  {
    name: 'Tramadol HCl',
    form: '50mg Capsules / Tablets',
    schedule: 'Schedule II (High Control)',
    pcnRiskLevel: 'High Abuse Potential',
    maxDaysSupply: 7,
    indications: 'Moderate to severe post-operative or trauma acute pain',
  },
  {
    name: 'Codeine Linctus',
    form: '15mg/5ml Oral Syrup',
    schedule: 'Schedule II (High Control)',
    pcnRiskLevel: 'High Misuse Potential / Restricted NAFDAC',
    maxDaysSupply: 5,
    indications: 'Severe non-productive intractable dry cough in adults',
  },
  {
    name: 'Diazepam (Valium)',
    form: '5mg Tablets',
    schedule: 'Schedule IV',
    pcnRiskLevel: 'Physical & Psychological Dependence',
    maxDaysSupply: 14,
    indications: 'Acute anxiety crisis, status epilepticus, severe muscle spasm',
  },
  {
    name: 'Bromazepam (Lexotan)',
    form: '3mg Tablets',
    schedule: 'Schedule IV',
    pcnRiskLevel: 'Dependence / Cognitive Impairment',
    maxDaysSupply: 10,
    indications: 'Short-term management of severe disabling anxiety',
  },
  {
    name: 'Pentazocine (Fortwin)',
    form: '30mg/ml Injection Ampoule',
    schedule: 'Schedule II (High Control)',
    pcnRiskLevel: 'Very High Abuse Potential / Strict Register',
    maxDaysSupply: 3,
    indications: 'Severe intractable acute surgical pain',
  },
  {
    name: 'Pregabalin (Lyrica)',
    form: '75mg Capsules',
    schedule: 'Schedule IV',
    pcnRiskLevel: 'Controlled / Misuse Risk',
    maxDaysSupply: 14,
    indications: 'Neuropathic pain, adjunctive therapy for partial seizures',
  },
];

export const OTC_ALTERNATIVES: OTCAlternative[] = [
  {
    controlledDrug: 'Codeine Linctus',
    indicatedFor: 'Cough & Bronchial Irritation',
    otcName: 'Dextromethorphan HBr 15mg/5ml + Guaifenesin Syrup',
    dosage: '10ml three times daily after meals',
    activeIngredients: 'Dextromethorphan (Non-opioid antitussive) + Guaifenesin (Expectorant)',
    whySafer: 'Non-addictive, zero opioid dependency risk, legal OTC sale without PCN register mandate.',
    isAvailableOTC: true,
  },
  {
    controlledDrug: 'Codeine Linctus',
    indicatedFor: 'Dry Tickly Cough',
    otcName: 'Hedera Helix (Ivy Leaf Extract) Herbal Cough Syrup',
    dosage: '5ml - 7.5ml twice daily',
    activeIngredients: 'Natural Saponin Ivy Leaf extract',
    whySafer: 'Completely natural secretolytic, safe for all age brackets, immediate counter dispensation.',
    isAvailableOTC: true,
  },
  {
    controlledDrug: 'Tramadol HCl',
    indicatedFor: 'Moderate Somatic & Musculoskeletal Pain',
    otcName: 'Paracetamol 1000mg + Ibuprofen 400mg Fixed Combination',
    dosage: '1 sachet / dose every 8 hours (Max 3 doses in 24 hrs)',
    activeIngredients: 'Acetaminophen + NSAID synergistic anti-inflammatory',
    whySafer: 'Clinical studies show equivalent analgesia for acute sprains/dental pain without central nervous system sedation or addiction.',
    isAvailableOTC: true,
  },
  {
    controlledDrug: 'Diazepam / Bromazepam',
    indicatedFor: 'Mild Anxiety & Sleep Disruption',
    otcName: 'Magnesium Glycinate 400mg + Melatonin 3mg Rapid Dissolve',
    dosage: 'Take 1 tablet 45 minutes before anticipated sleep',
    activeIngredients: 'Organic Chelate Magnesium + Pineal Hormone regulator',
    whySafer: 'Restores natural circadian rhythm without morning sedation, tolerance build-up, or withdrawal symptoms.',
    isAvailableOTC: true,
  },
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-01',
    code: 'RX-9421-VAL',
    patientName: 'Chinedu Okafor',
    patientPhone: '+234 803 419 2831',
    patientAge: 38,
    patientGender: 'Male',
    patientNIN: 'NIN-9281-4412-88',
    drugName: 'Tramadol HCl Capsules',
    activeIngredient: 'Tramadol Hydrochloride',
    strength: '50mg',
    dosageInstructions: 'Take 1 capsule every 8 hours as needed for severe post-orthopedic pain. Max 3 caps/day.',
    quantity: '10 Capsules (5-day supply)',
    scheduleCategory: 'Schedule II (High Control)',
    clinicalIndication: 'Acute post-operative tibial fracture fixation pain (Orthopedic Day 4)',
    doctorName: 'Dr. Funke Adeyemi, MBBS, FWACS',
    doctorMDCN: 'MDCN/R/48921',
    doctorHospital: 'Lagos University Teaching Hospital (LUTH), Idi-Araba',
    doctorPhone: '+234 802 334 1190',
    issueDate: '2026-09-16T06:30:00Z',
    expiryDate: '2026-09-19T23:59:59Z',
    status: 'VALID_UNFILLED',
    maxRefills: 0,
    refillsRemaining: 0,
    qrPayload: 'RXVERIFY:NG:RX-9421-VAL:MDCN-48921:TRAMADOL-50MG:CHINEDU-OKAFOR:EXP-20260919',
  },
  {
    id: 'rx-02',
    code: 'RX-7823-DUP',
    patientName: 'Emeka Nwosu',
    patientPhone: '+234 805 771 9024',
    patientAge: 29,
    patientGender: 'Male',
    patientNIN: 'NIN-1849-0091-23',
    drugName: 'Codeine Linctus',
    activeIngredient: 'Codeine Phosphate',
    strength: '15mg/5ml',
    dosageInstructions: '5ml at bedtime for intractable spasms',
    quantity: '1 Bottle (100ml)',
    scheduleCategory: 'Schedule II (High Control)',
    clinicalIndication: 'Severe unremitting pleuritic dry cough',
    doctorName: 'Dr. Obinna Eze, MBBS, FMCP',
    doctorMDCN: 'MDCN/R/33918',
    doctorHospital: 'Evercare Hospital Lekki, Lagos',
    doctorPhone: '+234 809 112 4455',
    issueDate: '2026-09-16T08:00:00Z',
    expiryDate: '2026-09-20T23:59:59Z',
    status: 'BLOCKED_DUPLICATE',
    maxRefills: 0,
    refillsRemaining: 0,
    filledDetails: {
      filledAt: '2026-09-16T11:42:00Z', // 2 hours ago today
      pharmacyName: 'HealthPlus Pharmacy (Victoria Island)',
      pharmacistName: 'Pharm. Ngozi Uche, B.Pharm',
      pharmacistPCN: 'PCN/R/19084',
      batchNumber: 'NAFDAC-COD-9921B',
      locationState: 'Lagos State (VI Branch)',
    },
    qrPayload: 'RXVERIFY:NG:RX-7823-DUP:MDCN-33918:CODEINE-100ML:EMEKA-NWOSU:FILLED',
  },
  {
    id: 'rx-03',
    code: 'RX-3310-EXP',
    patientName: 'Hajia Amina Bello',
    patientPhone: '+234 802 884 7120',
    patientAge: 52,
    patientGender: 'Female',
    patientNIN: 'NIN-5501-8392-11',
    drugName: 'Diazepam (Valium) Tablets',
    activeIngredient: 'Diazepam',
    strength: '5mg',
    dosageInstructions: 'Take 1 tablet at night for acute nocturnal muscle spasms',
    quantity: '14 Tablets',
    scheduleCategory: 'Schedule IV',
    clinicalIndication: 'Cervical radiculopathy associated muscle spasms',
    doctorName: 'Dr. Ibrahim Musa, MBBS, FWACS',
    doctorMDCN: 'MDCN/R/29840',
    doctorHospital: 'National Hospital Abuja, Garki',
    doctorPhone: '+234 803 559 3301',
    issueDate: '2026-09-02T10:00:00Z',
    expiryDate: '2026-09-14T23:59:59Z', // Expired 2 days ago
    status: 'EXPIRED',
    maxRefills: 1,
    refillsRemaining: 1,
    refillRequests: [],
    qrPayload: 'RXVERIFY:NG:RX-3310-EXP:MDCN-29840:DIAZEPAM-5MG:AMINA-BELLO:EXPIRED',
  },
  {
    id: 'rx-04',
    code: 'RX-5542-ALT',
    patientName: 'Tunde Bakare',
    patientPhone: '+234 818 200 4890',
    patientAge: 44,
    patientGender: 'Male',
    patientNIN: 'NIN-4091-2381-67',
    drugName: 'Bromazepam (Lexotan) Tablets',
    activeIngredient: 'Bromazepam',
    strength: '3mg',
    dosageInstructions: 'Take half to 1 tablet at night as needed for acute situational panic attacks',
    quantity: '10 Tablets',
    scheduleCategory: 'Schedule IV',
    clinicalIndication: 'Acute situational anxiety with severe insomnia',
    doctorName: 'Dr. Aisha Mohammed, MBBS, FMCPsych',
    doctorMDCN: 'MDCN/R/51209',
    doctorHospital: 'Federal Neuro-Psychiatric Hospital, Yaba, Lagos',
    doctorPhone: '+234 802 990 7712',
    issueDate: '2026-09-15T14:20:00Z',
    expiryDate: '2026-09-22T23:59:59Z',
    status: 'VALID_UNFILLED',
    maxRefills: 0,
    refillsRemaining: 0,
    qrPayload: 'RXVERIFY:NG:RX-5542-ALT:MDCN-51209:BROMAZEPAM-3MG:TUNDE-BAKARE:VALID',
  },
  {
    id: 'rx-05',
    code: 'RX-1108-DISP',
    patientName: 'Grace Adeleke',
    patientPhone: '+234 807 654 3210',
    patientAge: 31,
    patientGender: 'Female',
    drugName: 'Pregabalin Capsules',
    activeIngredient: 'Pregabalin',
    strength: '75mg',
    dosageInstructions: '1 capsule at night for diabetic neuropathy',
    quantity: '14 Capsules',
    scheduleCategory: 'Schedule IV',
    clinicalIndication: 'Diabetic peripheral neuropathy with burning pain',
    doctorName: 'Dr. Folake Alabi, MBBS, FWACP',
    doctorMDCN: 'MDCN/R/44102',
    doctorHospital: 'First Cardiology Consultants, Ikoyi, Lagos',
    doctorPhone: '+234 803 700 8912',
    issueDate: '2026-09-16T07:15:00Z',
    expiryDate: '2026-09-23T23:59:59Z',
    status: 'FILLED',
    maxRefills: 0,
    refillsRemaining: 0,
    filledDetails: {
      filledAt: '2026-09-16T09:30:00Z',
      pharmacyName: 'Medplus Pharmacy (Ikeja Branch)',
      pharmacistName: 'Pharm. Bamidele Adeleke, B.Pharm',
      pharmacistPCN: 'PCN/R/28419',
      batchNumber: 'PGB-75-LAG-004',
      locationState: 'Lagos State',
    },
    qrPayload: 'RXVERIFY:NG:RX-1108-DISP:MDCN-44102:PREGABALIN-75MG:GRACE-ADELEKE:FILLED',
  },
];

export const INITIAL_DISPENSING_LOGS: DispensingLogEntry[] = [
  {
    id: 'log-01',
    timestamp: '2026-09-16T09:30:00Z',
    rxCode: 'RX-1108-DISP',
    patientName: 'Grace Adeleke',
    patientPhone: '+234 807 654 3210',
    drugName: 'Pregabalin 75mg Capsules',
    quantity: '14 Capsules',
    prescribingDoctor: 'Dr. Folake Alabi, MBBS, FWACP',
    doctorMDCN: 'MDCN/R/44102',
    dispensingPharmacist: 'Pharm. Bamidele Adeleke',
    pharmacistPCN: 'PCN/R/28419',
    pharmacyName: 'Medplus Pharmacy (Ikeja Branch)',
    pharmacyState: 'Lagos State',
    outcome: 'DISPENSED',
    batchNumber: 'PGB-75-LAG-004',
    notes: 'Prescription verified online. Dispensed full 14 capsules. Verified patient ID card.',
    pcnReportStatus: 'VERIFIED_AUDIT_LOGGED',
  },
  {
    id: 'log-02',
    timestamp: '2026-09-16T11:45:00Z',
    rxCode: 'RX-7823-DUP',
    patientName: 'Emeka Nwosu',
    patientPhone: '+234 805 771 9024',
    drugName: 'Codeine Linctus 15mg/5ml (100ml)',
    quantity: '1 Bottle',
    prescribingDoctor: 'Dr. Obinna Eze',
    doctorMDCN: 'MDCN/R/33918',
    dispensingPharmacist: 'Pharm. Bamidele Adeleke',
    pharmacistPCN: 'PCN/R/28419',
    pharmacyName: 'Medplus Pharmacy (Ikeja Branch)',
    pharmacyState: 'Lagos State',
    outcome: 'DUPLICATE_BLOCKED',
    notes: 'HARD LOCK: Central ledger detected this exact prescription was dispensed 2 hours prior at HealthPlus Victoria Island. Sale refused under PCN/NAFDAC anti-diversion regulation.',
    pcnReportStatus: 'COMPLIANCE_FLAG_RAISED',
  },
  {
    id: 'log-03',
    timestamp: '2026-09-16T12:10:00Z',
    rxCode: 'RX-TELE-8012',
    patientName: 'Oluwaseun Davies',
    patientPhone: '+234 812 901 3341',
    drugName: 'Tramadol HCl 50mg Capsules',
    quantity: '6 Capsules (3-day max)',
    prescribingDoctor: 'Dr. Kemi Balogun (Teleconsult on duty)',
    doctorMDCN: 'MDCN/R/52019',
    dispensingPharmacist: 'Pharm. Bamidele Adeleke',
    pharmacistPCN: 'PCN/R/28419',
    pharmacyName: 'Medplus Pharmacy (Ikeja Branch)',
    pharmacyState: 'Lagos State',
    outcome: 'TELECONSULT_CONVERTED',
    batchNumber: 'TRM-50-MED-2201',
    notes: 'Patient presented with acute post-dental extraction pain without Rx. Routed to 5-minute teleconsult. Paid ₦5,000 via Paystack. Doctor evaluated live and approved restricted 3-day supply. Sale saved legally.',
    pcnReportStatus: 'VERIFIED_AUDIT_LOGGED',
  },
];

/**
 * MOCK MDCN (Medical and Dental Council of Nigeria) REGISTRY
 * 
 * Simulated official regulatory gazette of registered and licensed medical practitioners in Nigeria.
 * Pre-populated with verified practitioners, active licenses, as well as suspended/expired entries
 * to rigorously test verification and anti-fraud rejection logic.
 */
export const MOCK_MDCN_REGISTRY: MockMdcnEntry[] = [
  // Existing registered mock doctors (Valid & Active)
  {
    mdcnNumber: 'MDCN/R/48921',
    fullName: 'Dr. Funke Adeyemi',
    status: 'ACTIVE',
    institution: 'Lagos University Teaching Hospital (LUTH), Idi-Araba',
    specialty: 'Orthopedic Surgery & Traumatology',
    qualification: 'MBBS, FWACS',
    yearRegistered: 2012,
  },
  {
    mdcnNumber: 'MDCN/R/29840',
    fullName: 'Dr. Ibrahim Musa',
    status: 'ACTIVE',
    institution: 'National Hospital Abuja, Garki',
    specialty: 'General Surgery & Pain Management',
    qualification: 'MBBS, FWACS',
    yearRegistered: 2008,
  },
  {
    mdcnNumber: 'MDCN/R/51209',
    fullName: 'Dr. Aisha Mohammed',
    status: 'ACTIVE',
    institution: 'Federal Neuro-Psychiatric Hospital, Yaba, Lagos',
    specialty: 'Clinical Psychiatry & Neurobiology',
    qualification: 'MBBS, FMCPsych',
    yearRegistered: 2015,
  },
  {
    mdcnNumber: 'MDCN/R/33918',
    fullName: 'Dr. Obinna Eze',
    status: 'ACTIVE',
    institution: 'Evercare Hospital Lekki, Lagos',
    specialty: 'Internal Medicine & Pulmonology',
    qualification: 'MBBS, FMCP',
    yearRegistered: 2010,
  },
  // New practitioners ready for registration testing (Valid & Active - WILL PASS)
  {
    mdcnNumber: 'MDCN/R/77102',
    fullName: 'Dr. Zainab Aliyu',
    status: 'ACTIVE',
    institution: 'Barau Dikko Teaching Hospital, Kaduna',
    specialty: 'Pediatrics & Family Medicine',
    qualification: 'MBBS, FWACP',
    yearRegistered: 2018,
  },
  {
    mdcnNumber: 'MDCN/R/64510',
    fullName: 'Dr. Ifeanyi Okonkwo',
    status: 'ACTIVE',
    institution: 'University of Nigeria Teaching Hospital (UNTH), Ituku-Ozalla',
    specialty: 'Cardiology & Emergency Medicine',
    qualification: 'MBBS, FMCP',
    yearRegistered: 2016,
  },
  {
    mdcnNumber: 'MDCN/R/90214',
    fullName: 'Dr. Folake Balogun',
    status: 'ACTIVE',
    institution: 'Lagoon Hospitals, Ikoyi, Lagos',
    specialty: 'Anesthesiology & Critical Care',
    qualification: 'MBBS, DA, FWACS',
    yearRegistered: 2020,
  },
  {
    mdcnNumber: 'MDCN/R/81403',
    fullName: 'Dr. Haruna Bello',
    status: 'ACTIVE',
    institution: 'Jos University Teaching Hospital (JUTH), Plateau',
    specialty: 'General Practice & Trauma Care',
    qualification: 'MBBS',
    yearRegistered: 2019,
  },
  // Test Case: Suspended by Medical Tribunal (WILL FAIL)
  {
    mdcnNumber: 'MDCN/R/11094',
    fullName: 'Dr. Kenneth Okoro',
    status: 'SUSPENDED',
    institution: 'Private Practice (Suspended by Tribunal)',
    specialty: 'General Surgery',
    qualification: 'MBBS',
    yearRegistered: 2004,
  },
  // Test Case: Expired Annual Practicing License (WILL FAIL)
  {
    mdcnNumber: 'MDCN/R/22901',
    fullName: 'Dr. Fatima Al-Hassan',
    status: 'EXPIRED',
    institution: 'Kano State Specialist Hospital',
    specialty: 'Obstetrics & Gynecology',
    qualification: 'MBBS, FWACS',
    yearRegistered: 2007,
  },
];

/**
 * MOCK PCN (Pharmacy Council of Nigeria) REGISTRY
 * 
 * Simulated official regulatory premises gazette of licensed retail community pharmacies
 * and superintendent pharmacists in Nigeria.
 * Pre-populated with licensed premises as well as revoked/expired entries
 * to test verification and anti-diversion rejection logic.
 */
export const MOCK_PCN_REGISTRY: MockPcnEntry[] = [
  // Existing registered mock pharmacies (Valid & Licensed)
  {
    pcnNumber: 'PCN/R/28419',
    pharmacyName: 'Medplus Pharmacy (Ikeja Branch)',
    pcnPremisesNumber: 'PCN/LA/IKJ/0924',
    state: 'Lagos State',
    city: 'Ikeja',
    address: 'Plot 12, Allen Avenue, Ikeja',
    supervisingPharmacist: 'Pharm. Bamidele Adeleke, B.Pharm, MPSN',
    pharmacistPCN: 'PCN/R/28419',
    status: 'LICENSED',
    validUntil: '2026-12-31',
  },
  {
    pcnNumber: 'PCN/R/19084',
    pharmacyName: 'HealthPlus Pharmacy (Victoria Island)',
    pcnPremisesNumber: 'PCN/LA/ETI/1102',
    state: 'Lagos State',
    city: 'Victoria Island',
    address: 'Plot 14B, Adetokunbo Ademola St, VI',
    supervisingPharmacist: 'Pharm. Ngozi Uche, B.Pharm, FPSN',
    pharmacistPCN: 'PCN/R/19084',
    status: 'LICENSED',
    validUntil: '2026-12-31',
  },
  {
    pcnNumber: 'PCN/R/31055',
    pharmacyName: 'Nett Pharmacy (Abuja Central)',
    pcnPremisesNumber: 'PCN/FCT/CBD/0411',
    state: 'FCT Abuja',
    city: 'Abuja',
    address: 'Plot 710, Constitution Avenue, Central Business District',
    supervisingPharmacist: 'Pharm. Yakubu Danjuma, B.Pharm',
    pharmacistPCN: 'PCN/R/31055',
    status: 'LICENSED',
    validUntil: '2026-12-31',
  },
  // New pharmacies ready for registration testing (Valid & Licensed - WILL PASS)
  {
    pcnNumber: 'PCN/R/44120',
    pharmacyName: 'Alpha Pharmacy & Stores',
    pcnPremisesNumber: 'PCN/LA/IKY/1420',
    state: 'Lagos State',
    city: 'Ikoyi',
    address: '168 Awolowo Road, Ikoyi',
    supervisingPharmacist: 'Pharm. Chuka Obi, B.Pharm, MPSN',
    pharmacistPCN: 'PCN/R/44120',
    status: 'LICENSED',
    validUntil: '2026-12-31',
  },
  {
    pcnNumber: 'PCN/R/50812',
    pharmacyName: 'CarePoint Community Pharmacy',
    pcnPremisesNumber: 'PCN/FCT/WUS/0882',
    state: 'FCT Abuja',
    city: 'Abuja',
    address: 'Plot 24, Aminu Kano Crescent, Wuse 2',
    supervisingPharmacist: 'Pharm. Amina Bello, B.Pharm',
    pharmacistPCN: 'PCN/R/50812',
    status: 'LICENSED',
    validUntil: '2026-12-31',
  },
  {
    pcnNumber: 'PCN/R/62319',
    pharmacyName: 'RivState Chemists Ltd',
    pcnPremisesNumber: 'PCN/RV/PHC/2104',
    state: 'Rivers State',
    city: 'Port Harcourt',
    address: '45 Aba Road, Port Harcourt',
    supervisingPharmacist: 'Pharm. Tamuno Briggs, B.Pharm',
    pharmacistPCN: 'PCN/R/62319',
    status: 'LICENSED',
    validUntil: '2026-12-31',
  },
  {
    pcnNumber: 'PCN/R/73810',
    pharmacyName: 'Fadco Pharmaceuticals',
    pcnPremisesNumber: 'PCN/KN/BMP/0517',
    state: 'Kano State',
    city: 'Kano',
    address: '12 Bompai Road, Fagge',
    supervisingPharmacist: 'Pharm. Garba Lawal, B.Pharm',
    pharmacistPCN: 'PCN/R/73810',
    status: 'LICENSED',
    validUntil: '2026-12-31',
  },
  // Test Case: Revoked by PCN Inspectorate (WILL FAIL)
  {
    pcnNumber: 'PCN/R/88901',
    pharmacyName: 'QuickMed Pharmacy Onitsha',
    pcnPremisesNumber: 'PCN/AN/ONT/0019',
    state: 'Anambra State',
    city: 'Onitsha',
    address: 'Old Market Road, Onitsha',
    supervisingPharmacist: 'Pharm. Emeka Okoye (Sanctioned)',
    pharmacistPCN: 'PCN/R/88901',
    status: 'REVOKED',
    validUntil: '2024-06-30',
  },
  // Test Case: Expired Annual Premises License (WILL FAIL)
  {
    pcnNumber: 'PCN/R/33890',
    pharmacyName: 'Apex Care Dispensary',
    pcnPremisesNumber: 'PCN/OY/IBD/0440',
    state: 'Oyo State',
    city: 'Ibadan',
    address: 'Ring Road, Ibadan',
    supervisingPharmacist: 'Pharm. Olumide Johnson',
    pharmacistPCN: 'PCN/R/33890',
    status: 'EXPIRED',
    validUntil: '2024-12-31',
  },
];

/**
 * SIMULATED REGULATORY VERIFICATION STEP
 * 
 * NOTE: This is a mocked verification step standing in for a real regulatory API integration.
 * In a production deployment, this function would query the official Medical and Dental
 * Council of Nigeria (MDCN) web services / API portal to validate doctor credentials in real time.
 * Because public live MDCN/PCN verification APIs are not currently available,
 * this function simulates real-time credential verification against MOCK_MDCN_REGISTRY
 * for demo, compliance audit, and anti-diversion validation purposes.
 */
export function verifyDoctor(
  mdcnNumber: string,
  fullName: string,
  existingDoctors: MockDoctor[] = []
): VerificationResult<MockMdcnEntry> {
  const cleanMdcn = mdcnNumber.trim().toUpperCase();
  const cleanName = fullName.trim().toLowerCase();

  if (!cleanMdcn) {
    return {
      success: false,
      error: 'MDCN registration number is required.',
    };
  }

  if (!cleanName) {
    return {
      success: false,
      error: 'Practitioner full name is required.',
    };
  }

  // Check if this MDCN is already registered and active in the application state
  const alreadyRegistered = existingDoctors.find(
    (d) => d.mdcn.trim().toUpperCase() === cleanMdcn
  );
  if (alreadyRegistered) {
    return {
      success: false,
      error: `Doctor with license ${cleanMdcn} (${alreadyRegistered.name}) is already registered on RxVerify. Please proceed to the Sign In tab.`,
    };
  }

  // Look up in the simulated MDCN registry
  const match = MOCK_MDCN_REGISTRY.find((entry) => {
    const regClean = entry.mdcnNumber.toUpperCase();
    const entryDigits = regClean.replace(/[^A-Z0-9]/g, '');
    const inputDigits = cleanMdcn.replace(/[^A-Z0-9]/g, '');
    return regClean === cleanMdcn || entryDigits === inputDigits;
  });

  if (!match) {
    return {
      success: false,
      error: `MDCN number not found in registry — "${cleanMdcn}" does not exist in the active Nigerian Medical Register gazette. Please check your registration certificate.`,
    };
  }

  // Check disciplinary / license status
  if (match.status === 'SUSPENDED') {
    return {
      success: false,
      error: `License verification failed: MDCN registration ${match.mdcnNumber} (${match.fullName}) is currently flagged as SUSPENDED by the Medical and Dental Disciplinary Tribunal. Prescribing privileges are revoked.`,
    };
  }

  if (match.status === 'EXPIRED') {
    return {
      success: false,
      error: `License verification failed: Annual practicing license for ${match.mdcnNumber} has EXPIRED in MDCN gazette records. Doctor must renew practicing license to prescribe controlled drugs.`,
    };
  }

  // Name verification against registered gazette record
  const stopWords = new Set(['dr', 'dr.', 'doctor', 'mbbs', 'fwacs', 'fmcp', 'fmcpsych', 'fwacp', 'md', 'phd', 'mr', 'mrs']);
  const registeredWords = match.fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const inputWords = cleanName
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const hasNameMatch =
    registeredWords.length === 0 ||
    registeredWords.some((rw) => inputWords.includes(rw)) ||
    inputWords.some((iw) => registeredWords.includes(iw)) ||
    cleanName.includes(match.fullName.toLowerCase()) ||
    match.fullName.toLowerCase().includes(cleanName);

  if (!hasNameMatch) {
    return {
      success: false,
      error: `Name mismatch: MDCN record for ${match.mdcnNumber} is registered to "${match.fullName}". Entered name "${fullName.trim()}" does not match the official registry record.`,
    };
  }

  return {
    success: true,
    record: match,
  };
}

/**
 * SIMULATED REGULATORY VERIFICATION STEP
 * 
 * NOTE: This is a mocked verification step standing in for a real regulatory API integration.
 * In a production deployment, this function would query the official Pharmacy Council
 * of Nigeria (PCN) premises inspection and superintendent licensing database in real time.
 * Because public live MDCN/PCN verification APIs are not currently available,
 * this function simulates real-time premises verification against MOCK_PCN_REGISTRY
 * for demo, compliance audit, and anti-diversion validation purposes.
 */
export function verifyPharmacy(
  pcnNumber: string,
  pharmacyName: string,
  existingPharmacies: MockPharmacy[] = []
): VerificationResult<MockPcnEntry> {
  const cleanPcn = pcnNumber.trim().toUpperCase();
  const cleanName = pharmacyName.trim().toLowerCase();

  if (!cleanPcn) {
    return {
      success: false,
      error: 'PCN premises registration number is required.',
    };
  }

  if (!cleanName) {
    return {
      success: false,
      error: 'Pharmacy premises name is required.',
    };
  }

  // Check if this PCN is already registered in platform pharmacies
  const alreadyRegistered = existingPharmacies.find(
    (p) => p.pcn.trim().toUpperCase() === cleanPcn
  );
  if (alreadyRegistered) {
    return {
      success: false,
      error: `Pharmacy with PCN registration ${cleanPcn} (${alreadyRegistered.name}) is already registered on RxVerify. Please proceed to the Sign In tab.`,
    };
  }

  // Look up in the simulated PCN registry
  const match = MOCK_PCN_REGISTRY.find((entry) => {
    const regClean = entry.pcnNumber.toUpperCase();
    const entryDigits = regClean.replace(/[^A-Z0-9]/g, '');
    const inputDigits = cleanPcn.replace(/[^A-Z0-9]/g, '');
    return regClean === cleanPcn || entryDigits === inputDigits;
  });

  if (!match) {
    return {
      success: false,
      error: `PCN number not found in registry — "${cleanPcn}" was not found in the PCN directory of approved premises. Please verify your PCN certificate.`,
    };
  }

  // Check regulatory compliance status
  if (match.status === 'REVOKED') {
    return {
      success: false,
      error: `Premises verification failed: PCN premises license ${match.pcnNumber} (${match.pharmacyName}) has been REVOKED / SEALED by PCN enforcement for regulatory non-compliance. Controlled drug dispensing is locked.`,
    };
  }

  if (match.status === 'EXPIRED') {
    return {
      success: false,
      error: `Premises verification failed: Annual PCN registration for ${match.pcnNumber} expired on ${match.validUntil}. Premises must pass annual PCN recertification.`,
    };
  }

  // Name verification against registered gazette record
  const stopWords = new Set(['pharmacy', 'pharm', 'chemist', 'chemists', 'stores', 'ltd', 'limited', 'and', '&', 'branch']);
  const registeredWords = match.pharmacyName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const inputWords = cleanName
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const hasNameMatch =
    registeredWords.length === 0 ||
    registeredWords.some((rw) => inputWords.includes(rw)) ||
    inputWords.some((iw) => registeredWords.includes(iw)) ||
    cleanName.includes(match.pharmacyName.toLowerCase()) ||
    match.pharmacyName.toLowerCase().includes(cleanName);

  if (!hasNameMatch) {
    return {
      success: false,
      error: `Pharmacy name mismatch: PCN record for ${match.pcnNumber} is officially registered as "${match.pharmacyName}". Entered name "${pharmacyName.trim()}" does not match the premises certificate.`,
    };
  }

  return {
    success: true,
    record: match,
  };
}
