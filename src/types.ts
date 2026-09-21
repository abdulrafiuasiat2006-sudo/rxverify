export type PrescriptionStatus = 
  | 'VALID_UNFILLED' 
  | 'FILLED' 
  | 'EXPIRED' 
  | 'BLOCKED_DUPLICATE' 
  | 'CANCELLED';

export interface RefillRequest {
  id: string;
  requestedAt: string;
  pharmacyName: string;
  pharmacistPCN: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  note: string;
  respondedAt?: string;
}

export interface Prescription {
  id: string;
  code: string; // e.g. "RX-9421-VAL"
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientNIN?: string;
  drugName: string;
  activeIngredient: string;
  strength: string;
  dosageInstructions: string;
  quantity: string;
  scheduleCategory: 'Schedule II (High Control)' | 'Schedule III' | 'Schedule IV';
  clinicalIndication: string;
  doctorName: string;
  doctorMDCN: string; // Medical and Dental Council of Nigeria license
  doctorHospital: string;
  doctorPhone: string;
  issueDate: string;
  expiryDate: string;
  status: PrescriptionStatus;
  maxRefills: number;
  refillsRemaining: number;
  filledDetails?: {
    filledAt: string;
    pharmacyName: string;
    pharmacistName: string;
    pharmacistPCN: string;
    batchNumber: string;
    locationState: string;
  };
  refillRequests?: RefillRequest[];
  qrPayload: string;
}

export type DispensingOutcome = 
  | 'DISPENSED' 
  | 'DUPLICATE_BLOCKED' 
  | 'EXPIRED_RENEWAL_REQUESTED' 
  | 'TELECONSULT_CONVERTED' 
  | 'OTC_ALTERNATIVE_OFFERED'
  | 'PRESCRIPTION_CANCELLED'
  | 'DIVERSION_BLOCKED';

export interface DispensingLogEntry {
  id: string;
  timestamp: string;
  rxCode: string;
  patientName: string;
  patientPhone: string;
  drugName: string;
  quantity: string;
  prescribingDoctor: string;
  doctorMDCN: string;
  dispensingPharmacist: string;
  pharmacistPCN: string;
  pharmacyName: string;
  pharmacyState: string;
  outcome: DispensingOutcome;
  batchNumber?: string;
  notes: string;
  pcnReportStatus: 'VERIFIED_AUDIT_LOGGED' | 'COMPLIANCE_FLAG_RAISED';
}

export interface TeleconsultSession {
  id: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  primaryComplaint: string;
  requestedSubstance: string;
  durationOfSymptoms: string;
  painScore?: number;
  amountPaid: number; // in NGN
  paystackReference: string;
  paymentMethod: 'Card' | 'Bank Transfer' | 'USSD *737#';
  status: 'PAYMENT_PENDING' | 'WAITING_ROOM' | 'IN_CONSULT' | 'COMPLETED';
  assignedDoctor?: {
    name: string;
    mdcn: string;
    hospital: string;
    photo?: string;
  };
  clinicalFindings?: string;
  resultingRxCode?: string;
  createdAt: string;
}

export interface OTCAlternative {
  controlledDrug: string;
  indicatedFor: string;
  otcName: string;
  dosage: string;
  activeIngredients: string;
  whySafer: string;
  isAvailableOTC: boolean;
}

export interface PharmacyProfile {
  name: string;
  pcnPremisesNumber: string;
  address: string;
  city: string;
  state: string;
  supervisingPharmacist: string;
  pharmacistPCN: string;
}

export type DoctorVerificationStatus = 
  | 'PENDING' 
  | 'VERIFIED' 
  | 'FAILED' 
  | 'NEEDS_CORRECTION';

export type PharmacyVerificationStatus = 
  | 'UNVERIFIED' 
  | 'PENDING' 
  | 'VERIFIED' 
  | 'FAILED' 
  | 'SUSPENDED';

export interface MockDoctor {
  id: string;
  name: string;
  mdcn: string; // MDCN Registration License
  hospital: string;
  phone: string;
  email?: string;
  specialty: string;
  verifiedAt?: string;
  verificationStatus: DoctorVerificationStatus;
  statusNotes?: string;
}

export interface MockPharmacy {
  id: string;
  name: string;
  pcn: string; // PCN registration number
  pcnPremisesNumber?: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  email?: string;
  supervisingPharmacist: string;
  pharmacistPCN: string;
  verifiedAt?: string;
  verificationStatus: PharmacyVerificationStatus;
  statusNotes?: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  operatingStatus?: 'OPEN_24_7' | 'OPEN' | 'CLOSING_SOON' | 'CLOSED';
  hoursText?: string;
  services?: string[];
  scheduleTier?: string;
  rating?: number;
}

export interface MockMdcnEntry {
  mdcnNumber: string;
  fullName: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  institution: string;
  specialty: string;
  qualification: string;
  yearRegistered: number;
}

export interface MockPcnEntry {
  pcnNumber: string;
  pharmacyName: string;
  pcnPremisesNumber: string;
  state: string;
  city: string;
  address: string;
  supervisingPharmacist: string;
  pharmacistPCN: string;
  status: 'LICENSED' | 'REVOKED' | 'EXPIRED';
  validUntil: string;
}

export interface VerificationResult<T> {
  success: boolean;
  error?: string;
  record?: T;
}

export interface AuthSession {
  token: string;
  role: 'doctor' | 'pharmacy';
  userId: string;
  name: string;
  regNumber: string;
  verificationStatus: 'VERIFIED';
  verifiedAt: string;
  expiresAt: number;
}

export interface CurrentUser {
  role: 'doctor' | 'pharmacy' | 'admin' | 'patient' | null;
  id: string | null;
}

export type VerificationStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';

export interface PendingRegistration {
  id: string;
  type: 'doctor' | 'pharmacy';
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  
  // Doctor specific fields
  fullName?: string;
  mdcnNumber?: string;
  phone?: string;
  email?: string;
  specialty?: string;
  clinicName?: string;
  
  // Pharmacy specific fields
  pharmacyName?: string;
  pcnNumber?: string;
  address?: string;
  city?: string;
  state?: string;
}

export type ConsultationMode = 'Video' | 'Audio' | 'In-Clinic';

export interface DocNowDoctor {
  id: string;
  name: string;
  credentials: string; // e.g. "MBBS, FWACS"
  specialty: string;
  subSpecialty?: string;
  hospital: string;
  hospitalAddress: string;
  city: string;
  state: string;
  mdcnNumber: string;
  rating: number; // e.g. 4.9
  reviewCount: number; // e.g. 148
  experienceYears: number; // e.g. 12
  patientCount: number; // e.g. 1200
  consultationFee: number; // in NGN
  audioFee?: number;
  clinicFee?: number;
  availableToday: boolean;
  nextAvailableSlot: string; // e.g. "Today at 02:30 PM"
  availableSlots: string[]; // e.g. ["09:00 AM", "10:30 AM", "02:30 PM", "04:15 PM", "06:00 PM"]
  avatarUrl: string;
  bio: string;
  languages: string[];
  education: string;
  consultationModes: ConsultationMode[];
}

export interface DocNowAppointment {
  id: string; // e.g. "DN-8492"
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorHospital: string;
  doctorAvatar: string;
  doctorMdcn: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  date: string; // "2026-09-18"
  timeSlot: string; // "10:30 AM"
  mode: ConsultationMode;
  fee: number;
  status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  symptoms: string;
  aiTriageSummary?: string;
  urgencyLevel?: 'Routine' | 'Moderate' | 'Urgent';
  createdAt: string;
  prescriptionIssued?: Prescription;
  doctorNotes?: string;
}

export interface DocNowTriageResult {
  symptomQuery: string;
  urgencyLevel: 'Routine' | 'Moderate' | 'Urgent';
  clinicalSummary: string;
  possibleCauses: string[];
  recommendedSpecialty: string;
  homeCareTips: string[];
  warningSigns: string[];
  matchedDoctorIds: string[];
}

export type NavTab = 
  | 'verify' 
  | 'doctor' 
  | 'locator'
  | 'audit' 
  | 'guidelines' 
  | 'admin'
  | 'overview'
  | 'demo'
  | 'teleconsult'
  | 'doctor-login'
  | 'pharmacy-login';



