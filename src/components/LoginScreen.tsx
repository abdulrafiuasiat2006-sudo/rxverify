import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Info, 
  Search, 
  RefreshCw, 
  ArrowLeft,
  Lock,
  KeyRound,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { 
  MockDoctor, 
  MockPharmacy, 
  DoctorVerificationStatus, 
  PharmacyVerificationStatus,
  AuthSession
} from '../types';
import { 
  MOCK_MDCN_REGISTRY, 
  MOCK_PCN_REGISTRY 
} from '../data/mockData';

interface LoginScreenProps {
  doctors: MockDoctor[];
  pharmacies: MockPharmacy[];
  initialRole?: 'doctor' | 'pharmacy' | null;
  onLogin: (role: 'doctor' | 'pharmacy', id: string, sessionData: AuthSession) => void;
  onBack: () => void;
  onSwitchRole?: (role: 'doctor' | 'pharmacy') => void;
  onClose?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  doctors,
  pharmacies,
  initialRole = null,
  onLogin,
  onBack,
  onSwitchRole,
  onClose,
}) => {
  // Step 1: Exactly Two Choices ('role_select')
  // Step 2: Doctor flow ('doctor_flow') or Pharmacy flow ('pharmacy_flow')
  const [activeStep, setActiveStep] = useState<'role_select' | 'doctor_flow' | 'pharmacy_flow'>(
    initialRole === 'doctor' ? 'doctor_flow' : initialRole === 'pharmacy' ? 'pharmacy_flow' : 'role_select'
  );

  useEffect(() => {
    if (initialRole === 'doctor') {
      setActiveStep('doctor_flow');
    } else if (initialRole === 'pharmacy') {
      setActiveStep('pharmacy_flow');
    } else if (initialRole === null) {
      setActiveStep('role_select');
    }
  }, [initialRole]);

  // Doctor Flow - Phase 1: Authentication Credentials
  const [docEmail, setDocEmail] = useState('funke.adeyemi@luth.gov.ng');
  const [docPhone, setDocPhone] = useState('+234 802 334 1190');
  const [docPassword, setDocPassword] = useState('••••••••••••');

  // Doctor Flow - Phase 2: Professional Verification
  const [docName, setDocName] = useState('Dr. Funke Adeyemi, MBBS, FWACS');
  const [docMdcn, setDocMdcn] = useState('MDCN/R/48921');
  const [docHospital, setDocHospital] = useState('Lagos University Teaching Hospital (LUTH), Idi-Araba');
  const [docSpecialty, setDocSpecialty] = useState('Orthopedic Surgery & Traumatology');

  // Doctor Verification State & Notes
  const [docVerificationStatus, setDocVerificationStatus] = useState<DoctorVerificationStatus>('VERIFIED');
  const [docStatusNotes, setDocStatusNotes] = useState<string>(
    'Active Practitioner License in Good Standing. Verified on MDCN Central Register. Authorized to prescribe Schedule II-IV controlled substances.'
  );
  const [docIsChecking, setDocIsChecking] = useState(false);

  // Pharmacy Flow - Phase 1: Authentication Credentials
  const [pharmEmail, setPharmEmail] = useState('ikeja@medplusnig.com');
  const [pharmPhone, setPharmPhone] = useState('+234 802 334 8810');
  const [pharmPassword, setPharmPassword] = useState('••••••••••••');

  // Pharmacy Flow - Phase 2: Professional & Premises Verification
  const [pharmName, setPharmName] = useState('Medplus Pharmacy (Ikeja Branch)');
  const [pharmAddress, setPharmAddress] = useState('Plot 12, Allen Avenue, Ikeja, Lagos');
  const [pharmCity, setPharmCity] = useState('Ikeja');
  const [pharmState, setPharmState] = useState('Lagos State');
  const [pharmPremisesNumber, setPharmPremisesNumber] = useState('PCN/LA/IKJ/0924');
  const [pharmPharmacistName, setPharmPharmacistName] = useState('Pharm. Bamidele Adeleke, B.Pharm, MPSN');
  const [pharmPharmacistPcn, setPharmPharmacistPcn] = useState('PCN/R/28419');

  // Pharmacy Verification State & Notes
  const [pharmVerificationStatus, setPharmVerificationStatus] = useState<PharmacyVerificationStatus>('VERIFIED');
  const [pharmStatusNotes, setPharmStatusNotes] = useState<string>(
    'PCN Certified Controlled Substance Dispensing Facility. Superintendent Pharmacist license active. Displays in Verified Pharmacy Locator.'
  );
  const [pharmIsChecking, setPharmIsChecking] = useState(false);

  // Verification Checker: Doctor against Nigerian MDCN Central Register
  const handleVerifyDoctorCredentials = (overrideMdcn?: string) => {
    setDocIsChecking(true);
    const checkMdcn = (overrideMdcn || docMdcn).trim().toUpperCase();

    setTimeout(() => {
      setDocIsChecking(false);
      const registryMatch = MOCK_MDCN_REGISTRY.find(
        (r) => r.mdcnNumber.toUpperCase() === checkMdcn
      );

      if (!registryMatch) {
        setDocVerificationStatus('FAILED');
        setDocStatusNotes(
          `Verification Failed: License number "${checkMdcn}" was not found in the Medical and Dental Council of Nigeria (MDCN) gazette.`
        );
        return;
      }

      if (registryMatch.status === 'ACTIVE') {
        setDocVerificationStatus('VERIFIED');
        setDocStatusNotes(
          `Verified: ${registryMatch.fullName} is an active, licensed medical practitioner (${registryMatch.qualification}, ${registryMatch.specialty}). MDCN license active since ${registryMatch.yearRegistered}. Authorized to issue controlled substance prescriptions.`
        );
      } else if (registryMatch.status === 'SUSPENDED') {
        setDocVerificationStatus('FAILED');
        setDocStatusNotes(
          `Verification Failed: Practitioner ${registryMatch.fullName} is suspended by the Medical and Dental Practitioners Disciplinary Tribunal. Controlled medication prescribing is legally prohibited.`
        );
      } else if (registryMatch.status === 'EXPIRED') {
        setDocVerificationStatus('NEEDS_CORRECTION');
        setDocStatusNotes(
          `Information Needs Correction: Annual Practicing License (APL) for ${registryMatch.fullName} has expired. Please upload proof of current year renewal payment to reactivate controlled prescribing.`
        );
      }
    }, 500);
  };

  // Verification Checker: Pharmacy against Nigerian PCN Gazette
  const handleVerifyPharmacyCredentials = (overridePcn?: string) => {
    setPharmIsChecking(true);
    const checkPcn = (overridePcn || pharmPharmacistPcn).trim().toUpperCase();

    setTimeout(() => {
      setPharmIsChecking(false);
      const registryMatch = MOCK_PCN_REGISTRY.find(
        (p) => p.pcnNumber.toUpperCase() === checkPcn
      );

      if (!registryMatch) {
        setPharmVerificationStatus('FAILED');
        setPharmStatusNotes(
          `Verification Failed: Council registration "${checkPcn}" does not match any accredited retail pharmacy premises in the Pharmacy Council of Nigeria registry.`
        );
        return;
      }

      if (registryMatch.status === 'LICENSED') {
        setPharmVerificationStatus('VERIFIED');
        setPharmStatusNotes(
          `Verified: ${registryMatch.pharmacyName} is fully licensed (Premises: ${registryMatch.pcnPremisesNumber}). Superintendent: ${registryMatch.supervisingPharmacist}. Active until ${registryMatch.validUntil}. Eligible to dispense Schedule II-IV controlled substances.`
        );
      } else if (registryMatch.status === 'REVOKED') {
        setPharmVerificationStatus('SUSPENDED');
        setPharmStatusNotes(
          `Suspended / Revoked: Premises sealed by PCN National Enforcement Directorate for unauthorized dispensing infractions. Premise is legally barred from dispensing.`
        );
      } else if (registryMatch.status === 'EXPIRED') {
        setPharmVerificationStatus('FAILED');
        setPharmStatusNotes(
          `Verification Failed: Premises annual retention fee expired on ${registryMatch.validUntil}. Facility must be re-inspected before dispensing controlled medications.`
        );
      }
    }, 500);
  };

  // Prototype Test Scenarios: Doctor (4 Regulatory States)
  const applyDoctorPreset = (presetType: 'VERIFIED' | 'PENDING' | 'FAILED' | 'NEEDS_CORRECTION') => {
    if (presetType === 'VERIFIED') {
      setDocName('Dr. Funke Adeyemi, MBBS, FWACS');
      setDocEmail('funke.adeyemi@luth.gov.ng');
      setDocPhone('+234 802 334 1190');
      setDocMdcn('MDCN/R/48921');
      setDocHospital('Lagos University Teaching Hospital (LUTH), Idi-Araba');
      setDocSpecialty('Orthopedic Surgery & Traumatology');
      setDocVerificationStatus('VERIFIED');
      setDocStatusNotes('Active Practitioner License in Good Standing. Verified on MDCN Central Register. Authorized for Schedule II-IV controlled substances.');
    } else if (presetType === 'PENDING') {
      setDocName('Dr. Zainab Aliyu, MBBS, FWACP');
      setDocEmail('zainab.aliyu@kadunahospital.gov.ng');
      setDocPhone('+234 803 221 4488');
      setDocMdcn('MDCN/R/77102');
      setDocHospital('Barau Dikko Teaching Hospital, Kaduna');
      setDocSpecialty('Pediatrics & Family Medicine');
      setDocVerificationStatus('PENDING');
      setDocStatusNotes('Verification Pending: Credentials submitted and awaiting automated synchronization with MDCN regulatory council servers.');
    } else if (presetType === 'FAILED') {
      setDocName('Dr. Kenneth Okoro, MBBS');
      setDocEmail('k.okoro@medconsult.ng');
      setDocPhone('+234 802 000 1122');
      setDocMdcn('MDCN/R/11094');
      setDocHospital('Private Clinic, Lagos');
      setDocSpecialty('General Surgery');
      setDocVerificationStatus('FAILED');
      setDocStatusNotes('Verification Failed: Practitioner is currently suspended by the Medical and Dental Practitioners Disciplinary Tribunal. Prescribing access is blocked.');
    } else if (presetType === 'NEEDS_CORRECTION') {
      setDocName('Dr. Fatima Al-Hassan, MBBS, FWACS');
      setDocEmail('f.alhassan@kanohealth.gov.ng');
      setDocPhone('+234 803 999 4433');
      setDocMdcn('MDCN/R/22901');
      setDocHospital('Kano State Specialist Hospital');
      setDocSpecialty('Obstetrics & Gynecology');
      setDocVerificationStatus('NEEDS_CORRECTION');
      setDocStatusNotes('Information Needs Correction: Annual Practicing License (APL) expired on 31 Dec 2025. Please upload renewal payment receipt to reactivate controlled prescribing.');
    }
  };

  // Prototype Test Scenarios: Pharmacy (5 Regulatory States)
  const applyPharmacyPreset = (presetType: 'VERIFIED' | 'VERIFIED_247' | 'PENDING' | 'UNVERIFIED' | 'SUSPENDED' | 'FAILED') => {
    if (presetType === 'VERIFIED') {
      setPharmName('Medplus Pharmacy (Ikeja Branch)');
      setPharmAddress('Plot 12, Allen Avenue, Ikeja, Lagos');
      setPharmCity('Ikeja');
      setPharmState('Lagos State');
      setPharmPhone('+234 802 334 8810');
      setPharmEmail('ikeja@medplusnig.com');
      setPharmPremisesNumber('PCN/LA/IKJ/0924');
      setPharmPharmacistName('Pharm. Bamidele Adeleke, B.Pharm, MPSN');
      setPharmPharmacistPcn('PCN/R/28419');
      setPharmVerificationStatus('VERIFIED');
      setPharmStatusNotes('PCN Certified Controlled Substance Dispensing Facility. Superintendent Pharmacist license active. Displays in Verified Pharmacy Locator.');
    } else if (presetType === 'VERIFIED_247') {
      setPharmName('HealthPlus Pharmacy (Victoria Island)');
      setPharmAddress('Plot 14B, Adetokunbo Ademola St, Victoria Island, Lagos');
      setPharmCity('Victoria Island');
      setPharmState('Lagos State');
      setPharmPhone('+234 805 991 2044');
      setPharmEmail('vi.dispensary@healthplus.com.ng');
      setPharmPremisesNumber('PCN/LA/ETI/1102');
      setPharmPharmacistName('Pharm. Ngozi Uche, B.Pharm, FPSN');
      setPharmPharmacistPcn('PCN/R/19084');
      setPharmVerificationStatus('VERIFIED');
      setPharmStatusNotes('PCN Certified High-Security Premises. 24/7 Verified Emergency Dispenser. Displays in Verified Pharmacy Locator.');
    } else if (presetType === 'PENDING') {
      setPharmName('Express Care Pharmacy (Surulere)');
      setPharmAddress('18 Adeniran Ogunsanya St, Surulere, Lagos');
      setPharmCity('Surulere');
      setPharmState('Lagos State');
      setPharmPhone('+234 803 111 8899');
      setPharmEmail('surulere@expresscare.ng');
      setPharmPremisesNumber('PCN/LA/SUR/4401');
      setPharmPharmacistName('Pharm. Blessing Okon, B.Pharm');
      setPharmPharmacistPcn('PCN/R/61022');
      setPharmVerificationStatus('PENDING');
      setPharmStatusNotes('Verification Pending: Awaiting physical council premises inspection and narcotics vault clearance. Does NOT appear on public map until approved.');
    } else if (presetType === 'UNVERIFIED') {
      setPharmName('Universal Chemist (Draft Store)');
      setPharmAddress('Oshodi-Isolo Expressway, Lagos');
      setPharmCity('Oshodi');
      setPharmState('Lagos State');
      setPharmPhone('+234 800 000 1122');
      setPharmEmail('info@universalchemist.ng');
      setPharmPremisesNumber('PCN/DRAFT/001');
      setPharmPharmacistName('Pending Superintendent Nomination');
      setPharmPharmacistPcn('PCN/PENDING');
      setPharmVerificationStatus('UNVERIFIED');
      setPharmStatusNotes('Unverified: Premise registration draft has not been submitted for PCN gazetting. Controlled substance dispensing disabled.');
    } else if (presetType === 'SUSPENDED') {
      setPharmName('City Gate Pharmacy (Yaba - Suspended)');
      setPharmAddress('42 Commercial Avenue, Sabo Yaba, Lagos');
      setPharmCity('Yaba');
      setPharmState('Lagos State');
      setPharmPhone('+234 802 000 3344');
      setPharmEmail('info@citygatepharm.ng');
      setPharmPremisesNumber('PCN/LA/YAB/8810');
      setPharmPharmacistName('Pharm. Kolawole Johnson (Suspended)');
      setPharmPharmacistPcn('PCN/R/99012');
      setPharmVerificationStatus('SUSPENDED');
      setPharmStatusNotes('Suspended / Revoked: Sealed by PCN Enforcement Directorate. Barred from dispensing and removed from public locator.');
    } else if (presetType === 'FAILED') {
      setPharmName('Apex Care Chemist (Failed)');
      setPharmAddress('Agege Motor Road, Mushin, Lagos');
      setPharmCity('Mushin');
      setPharmState('Lagos State');
      setPharmPhone('+234 801 222 3344');
      setPharmEmail('apex@chemist.ng');
      setPharmPremisesNumber('PCN/INVALID/999');
      setPharmPharmacistName('Unaccredited Dispenser');
      setPharmPharmacistPcn('PCN/R/00000');
      setPharmVerificationStatus('FAILED');
      setPharmStatusNotes('Verification Failed: Registration number does not exist on PCN national register.');
    }
  };

  // Complete Doctor Login: Strictly requires docVerificationStatus === 'VERIFIED'
  const handleProceedToDoctorDashboard = () => {
    if (docVerificationStatus !== 'VERIFIED') return;
    const match = doctors.find((d) => d.mdcn === docMdcn) || doctors[0];
    const userId = match?.id || `doc-${docMdcn.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;

    const sessionData: AuthSession = {
      token: `rxv_doctor_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      role: 'doctor',
      userId,
      name: docName,
      regNumber: docMdcn,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    onLogin('doctor', userId, sessionData);
  };

  // Complete Pharmacy Login: Strictly requires pharmVerificationStatus === 'VERIFIED'
  const handleProceedToPharmacyDashboard = () => {
    if (pharmVerificationStatus !== 'VERIFIED') return;
    const match = pharmacies.find((p) => p.pcn === pharmPharmacistPcn) || pharmacies[0];
    const userId = match?.id || `pharm-${pharmPharmacistPcn.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;

    const sessionData: AuthSession = {
      token: `rxv_pharmacy_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      role: 'pharmacy',
      userId,
      name: pharmName,
      regNumber: pharmPharmacistPcn,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    onLogin('pharmacy', userId, sessionData);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAF7] text-slate-900 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* STEP 1: CHOOSE ROLE (EXACTLY TWO CHOICES) */}
        {activeStep === 'role_select' && (
          <div className="space-y-6 py-2">
            {/* Top Back Option to Welcome */}
            <div className="flex items-center justify-start">
              <button
                type="button"
                id="role-select-back-btn"
                onClick={onBack}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#1B4332] hover:bg-[#F4F9F1] text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#1B4332]" />
                <span>Back to Welcome Screen</span>
              </button>
            </div>
          {/* Header */}
          <div className="text-center space-y-2 max-w-md mx-auto">
            <div className="w-12 h-12 bg-[#1B4332] text-[#B5D99B] rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
              Sign In to RxVerify Nigeria
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Select your accredited professional role to proceed with secure authentication and regulatory verification.
            </p>
          </div>

          {/* EXACTLY TWO CHOICES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-2">
            {/* CHOICE 1: Login as Doctor */}
            <div
              id="login-choice-doctor"
              onClick={() => {
                setActiveStep('doctor_flow');
                onSwitchRole?.('doctor');
              }}
              className="group relative bg-white border-2 border-slate-200 hover:border-[#1B4332] rounded-3xl p-6 transition-all hover:shadow-xl cursor-pointer flex flex-col justify-between text-left"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1B4332] group-hover:bg-[#1B4332] group-hover:text-[#B5D99B] flex items-center justify-center transition-colors">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Medical Practitioner
                  </span>
                  <h3 className="font-heading font-bold text-lg text-slate-900 mt-1">
                    Login as Doctor
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    For licensed physicians verified via the Medical and Dental Council of Nigeria (MDCN). Issue tamper-proof digital prescriptions and approve refills.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1B4332] group-hover:translate-x-1 transition-transform">
                <span>Continue as Doctor</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* CHOICE 2: Login as Pharmacy */}
            <div
              id="login-choice-pharmacy"
              onClick={() => {
                setActiveStep('pharmacy_flow');
                onSwitchRole?.('pharmacy');
              }}
              className="group relative bg-white border-2 border-slate-200 hover:border-[#1B4332] rounded-3xl p-6 transition-all hover:shadow-xl cursor-pointer flex flex-col justify-between text-left"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1B4332] group-hover:bg-[#1B4332] group-hover:text-[#B5D99B] flex items-center justify-center transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Accredited Premise
                  </span>
                  <h3 className="font-heading font-bold text-lg text-slate-900 mt-1">
                    Login as Pharmacy
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    For retail community pharmacies verified via the Pharmacy Council of Nigeria (PCN). Authenticate counter prescriptions and record NAFDAC dispensing logs.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1B4332] group-hover:translate-x-1 transition-transform">
                <span>Continue as Pharmacy</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-[11px] text-slate-400">
              RxVerify Nigeria strictly restricts access to accredited healthcare professionals under PCN and MDCN statutory guidelines.
            </p>
          </div>
        </div>
      )}

      {/* STEP 2A: DOCTOR FLOW (AUTHENTICATION → PROFESSIONAL VERIFICATION → VERIFICATION RESULT → DOCTOR DASHBOARD) */}
      {activeStep === 'doctor_flow' && (
        <div className="space-y-5">
          {/* Breadcrumb back / full-page navigation */}
          <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 shadow-2xs">
            <button
              type="button"
              id="doctor-login-back-btn"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#1B4332] hover:text-[#143427] hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#1B4332]" />
              <span>Back to Role Selection</span>
            </button>
            <div className="flex items-center gap-3">
              {onSwitchRole && (
                <button
                  type="button"
                  onClick={() => onSwitchRole('pharmacy')}
                  className="text-xs font-semibold text-slate-600 hover:text-emerald-800 hover:underline cursor-pointer hidden sm:inline-flex items-center gap-1"
                >
                  <span>Switch to Pharmacy Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="text-xs font-semibold text-slate-400">
                Doctor Authentication
              </span>
            </div>
          </div>

          {/* Title banner */}
          <div className="bg-[#1B4332] text-white p-4.5 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-[#B5D99B] flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-white">
                  Doctor Authentication &amp; Professional Verification
                </h3>
                <p className="text-xs text-emerald-100/80">
                  Cross-referenced with the Medical and Dental Council of Nigeria (MDCN) central register
                </p>
              </div>
            </div>
          </div>

          {/* Scenario Tester Bar (For evaluator testing of all 4 states) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                Prototype Verification Scenarios (Test All 4 States):
              </span>
              <span className="text-[10px] text-slate-400">Click to autofill</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => applyDoctorPreset('VERIFIED')}
                className={`px-2.5 py-1.5 rounded-xl border text-left font-medium transition-all ${
                  docVerificationStatus === 'VERIFIED'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3 h-3" /> 1. Verified Active
                </div>
                <div className="text-[10px] text-slate-500 truncate">Dr. Funke Adeyemi</div>
              </button>

              <button
                type="button"
                onClick={() => applyDoctorPreset('PENDING')}
                className={`px-2.5 py-1.5 rounded-xl border text-left font-medium transition-all ${
                  docVerificationStatus === 'PENDING'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] text-amber-700 font-bold">
                  <Clock className="w-3 h-3" /> 2. Pending Sync
                </div>
                <div className="text-[10px] text-slate-500 truncate">Dr. Zainab Aliyu</div>
              </button>

              <button
                type="button"
                onClick={() => applyDoctorPreset('FAILED')}
                className={`px-2.5 py-1.5 rounded-xl border text-left font-medium transition-all ${
                  docVerificationStatus === 'FAILED'
                    ? 'bg-red-50 border-red-500 text-red-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] text-red-700 font-bold">
                  <XCircle className="w-3 h-3" /> 3. Failed / Suspended
                </div>
                <div className="text-[10px] text-slate-500 truncate">Dr. Kenneth Okoro</div>
              </button>

              <button
                type="button"
                onClick={() => applyDoctorPreset('NEEDS_CORRECTION')}
                className={`px-2.5 py-1.5 rounded-xl border text-left font-medium transition-all ${
                  docVerificationStatus === 'NEEDS_CORRECTION'
                    ? 'bg-purple-50 border-purple-500 text-purple-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] text-purple-700 font-bold">
                  <AlertCircle className="w-3 h-3" /> 4. Needs Correction
                </div>
                <div className="text-[10px] text-slate-500 truncate">Dr. Fatima Al-Hassan</div>
              </button>
            </div>
          </div>

          {/* Phase 1: Doctor Account Authentication */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Lock className="w-4 h-4 text-slate-700" />
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-700">
                Phase 1 &bull; Doctor Account Authentication
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Practitioner Email
                </label>
                <input
                  type="email"
                  value={docEmail}
                  onChange={(e) => setDocEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={docPhone}
                  onChange={(e) => setDocPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Practitioner Passcode
                </label>
                <input
                  type="password"
                  value={docPassword}
                  onChange={(e) => setDocPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>
            </div>
          </div>

          {/* Phase 2: Doctor Professional Verification */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#1B4332]">
                Phase 2 &bull; MDCN Statutory License Verification
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Full Name &amp; Qualification
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  MDCN Registration Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={docMdcn}
                    onChange={(e) => setDocMdcn(e.target.value)}
                    className="w-full px-3 py-2 font-mono font-bold bg-[#F7FAF6] border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#1B4332]"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifyDoctorCredentials()}
                    disabled={docIsChecking}
                    className="px-3 py-2 bg-[#1B4332] text-white rounded-xl text-xs font-bold shrink-0 hover:bg-[#143427] cursor-pointer flex items-center gap-1"
                  >
                    {docIsChecking ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>Verify</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Practicing Hospital / Medical Center
                </label>
                <input
                  type="text"
                  value={docHospital}
                  onChange={(e) => setDocHospital(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Medical Cadre / Specialty
                </label>
                <input
                  type="text"
                  value={docSpecialty}
                  onChange={(e) => setDocSpecialty(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>
            </div>
          </div>

          {/* Phase 3: Verification Result & Dashboard Entry */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-xs text-slate-600 uppercase tracking-wider">
              Verification Result &amp; Prescribing Access
            </h4>

            {docVerificationStatus === 'VERIFIED' && (
              <div className="bg-[#EBF7E5] border-2 border-emerald-500 rounded-2xl p-4.5 space-y-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-emerald-950">
                        STATUS: VERIFIED ACTIVE
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase">
                        Authorized Prescriber
                      </span>
                    </div>
                    <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                      {docStatusNotes}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-800">
                    Authority: Medical and Dental Council of Nigeria
                  </span>
                  <button
                    type="button"
                    id="doctor-enter-dashboard-btn"
                    onClick={handleProceedToDoctorDashboard}
                    className="px-5 py-2.5 bg-[#1B4332] hover:bg-[#143427] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
                  >
                    <span>Enter Doctor Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-[#B5D99B]" />
                  </button>
                </div>
              </div>
            )}

            {docVerificationStatus === 'PENDING' && (
              <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4.5 space-y-2">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-amber-950">
                        STATUS: VERIFICATION PENDING
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold uppercase">
                        Council Verification Pending
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                      {docStatusNotes}
                    </p>
                  </div>
                </div>
                <div className="text-[11px] text-amber-800 bg-amber-100/60 p-2.5 rounded-xl">
                  Notice: As a security safeguard, the Doctor Dashboard is locked until MDCN records are confirmed.
                </div>
              </div>
            )}

            {docVerificationStatus === 'FAILED' && (
              <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4.5 space-y-2">
                <div className="flex items-start gap-2.5">
                  <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-red-950">
                        STATUS: VERIFICATION FAILED
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-red-200 text-red-900 text-[10px] font-extrabold uppercase">
                        Access Blocked
                      </span>
                    </div>
                    <p className="text-xs text-red-900 mt-1 leading-relaxed">
                      {docStatusNotes}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {docVerificationStatus === 'NEEDS_CORRECTION' && (
              <div className="bg-purple-50 border-2 border-purple-400 rounded-2xl p-4.5 space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-purple-950">
                        STATUS: INFORMATION NEEDS CORRECTION
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 text-[10px] font-extrabold uppercase">
                        Action Required
                      </span>
                    </div>
                    <p className="text-xs text-purple-900 mt-1 leading-relaxed">
                      {docStatusNotes}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2B: PHARMACY FLOW (AUTHENTICATION → PREMISES VERIFICATION → VERIFICATION RESULT → PHARMACY DASHBOARD) */}
      {activeStep === 'pharmacy_flow' && (
        <div className="space-y-5">
          {/* Breadcrumb back / full-page navigation */}
          <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 shadow-2xs">
            <button
              type="button"
              id="pharmacy-login-back-btn"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#1B4332] hover:text-[#143427] hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#1B4332]" />
              <span>Back to Role Selection</span>
            </button>
            <div className="flex items-center gap-3">
              {onSwitchRole && (
                <button
                  type="button"
                  onClick={() => onSwitchRole('doctor')}
                  className="text-xs font-semibold text-slate-600 hover:text-emerald-800 hover:underline cursor-pointer hidden sm:inline-flex items-center gap-1"
                >
                  <span>Switch to Doctor Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="text-xs font-semibold text-slate-400">
                Pharmacy Authentication
              </span>
            </div>
          </div>

          {/* Title banner */}
          <div className="bg-[#1B4332] text-white p-4.5 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-[#B5D99B] flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-white">
                  Pharmacy Authentication &amp; Premises Verification
                </h3>
                <p className="text-xs text-emerald-100/80">
                  Cross-referenced with the Pharmacy Council of Nigeria (PCN) gazetted register
                </p>
              </div>
            </div>
          </div>

          {/* Scenario Tester Bar (For evaluator testing of all 5 states) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                Prototype Verification Scenarios (Test All 5 States):
              </span>
              <span className="text-[10px] text-slate-400">Click to autofill</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <button
                type="button"
                onClick={() => applyPharmacyPreset('VERIFIED')}
                className={`px-2 py-1.5 rounded-xl border text-left font-medium transition-all ${
                  pharmVerificationStatus === 'VERIFIED'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3 h-3" /> 1. Verified
                </div>
                <div className="text-[10px] text-slate-500 truncate">Medplus (Ikeja)</div>
              </button>

              <button
                type="button"
                onClick={() => applyPharmacyPreset('PENDING')}
                className={`px-2 py-1.5 rounded-xl border text-left font-medium transition-all ${
                  pharmVerificationStatus === 'PENDING'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] text-amber-700 font-bold">
                  <Clock className="w-3 h-3" /> 2. Pending
                </div>
                <div className="text-[10px] text-slate-500 truncate">Express Surulere</div>
              </button>

              <button
                type="button"
                onClick={() => applyPharmacyPreset('UNVERIFIED')}
                className={`px-2 py-1.5 rounded-xl border text-left font-medium transition-all ${
                  pharmVerificationStatus === 'UNVERIFIED'
                    ? 'bg-slate-100 border-slate-500 text-slate-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] text-slate-700 font-bold">
                  <HelpCircle className="w-3 h-3" /> 3. Unverified
                </div>
                <div className="text-[10px] text-slate-500 truncate">Universal Chemist</div>
              </button>

              <button
                type="button"
                onClick={() => applyPharmacyPreset('FAILED')}
                className={`px-2 py-1.5 rounded-xl border text-left font-medium transition-all ${
                  pharmVerificationStatus === 'FAILED'
                    ? 'bg-red-50 border-red-500 text-red-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] text-red-700 font-bold">
                  <XCircle className="w-3 h-3" /> 4. Failed
                </div>
                <div className="text-[10px] text-slate-500 truncate">Apex Chemist</div>
              </button>

              <button
                type="button"
                onClick={() => applyPharmacyPreset('SUSPENDED')}
                className={`px-2 py-1.5 rounded-xl border text-left font-medium transition-all ${
                  pharmVerificationStatus === 'SUSPENDED'
                    ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] text-rose-700 font-bold">
                  <Lock className="w-3 h-3" /> 5. Suspended
                </div>
                <div className="text-[10px] text-slate-500 truncate">City Gate Yaba</div>
              </button>
            </div>
          </div>

          {/* Phase 1: Pharmacy Account Authentication */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Lock className="w-4 h-4 text-slate-700" />
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-700">
                Phase 1 &bull; Pharmacy Account Authentication
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Premises Email
                </label>
                <input
                  type="email"
                  value={pharmEmail}
                  onChange={(e) => setPharmEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={pharmPhone}
                  onChange={(e) => setPharmPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Dispenser Passcode
                </label>
                <input
                  type="password"
                  value={pharmPassword}
                  onChange={(e) => setPharmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>
            </div>
          </div>

          {/* Phase 2: Pharmacy Premises & Superintendent Verification */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#1B4332]">
                Phase 2 &bull; PCN Premises &amp; Superintendent Verification
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Pharmacy Registered Name
                </label>
                <input
                  type="text"
                  value={pharmName}
                  onChange={(e) => setPharmName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  PCN Premises Registration Number
                </label>
                <input
                  type="text"
                  value={pharmPremisesNumber}
                  onChange={(e) => setPharmPremisesNumber(e.target.value)}
                  className="w-full px-3 py-2 font-mono font-bold bg-[#F7FAF6] border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Superintendent Pharmacist PCN License
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pharmPharmacistPcn}
                    onChange={(e) => setPharmPharmacistPcn(e.target.value)}
                    className="w-full px-3 py-2 font-mono font-bold bg-[#F7FAF6] border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#1B4332]"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifyPharmacyCredentials()}
                    disabled={pharmIsChecking}
                    className="px-3 py-2 bg-[#1B4332] text-white rounded-xl text-xs font-bold shrink-0 hover:bg-[#143427] cursor-pointer flex items-center gap-1"
                  >
                    {pharmIsChecking ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>Verify</span>
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Physical Street Address
                </label>
                <input
                  type="text"
                  value={pharmAddress}
                  onChange={(e) => setPharmAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  City / LGA
                </label>
                <input
                  type="text"
                  value={pharmCity}
                  onChange={(e) => setPharmCity(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={pharmState}
                  onChange={(e) => setPharmState(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Responsible Superintendent Pharmacist Name
                </label>
                <input
                  type="text"
                  value={pharmPharmacistName}
                  onChange={(e) => setPharmPharmacistName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>
            </div>
          </div>

          {/* Phase 3: Verification Result & Terminal Entry */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-xs text-slate-600 uppercase tracking-wider">
              Verification Result &amp; Dispensing Authorization
            </h4>

            {pharmVerificationStatus === 'VERIFIED' && (
              <div className="bg-[#EBF7E5] border-2 border-emerald-500 rounded-2xl p-4.5 space-y-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-emerald-950">
                        STATUS: VERIFIED LICENSED PREMISE
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase">
                        Authorized Dispenser
                      </span>
                    </div>
                    <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                      {pharmStatusNotes}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-800">
                    Authority: Pharmacy Council of Nigeria (PCN)
                  </span>
                  <button
                    type="button"
                    id="pharmacy-enter-dashboard-btn"
                    onClick={handleProceedToPharmacyDashboard}
                    className="px-5 py-2.5 bg-[#1B4332] hover:bg-[#143427] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
                  >
                    <span>Enter Pharmacy Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-[#B5D99B]" />
                  </button>
                </div>
              </div>
            )}

            {pharmVerificationStatus === 'PENDING' && (
              <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4.5 space-y-2">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-amber-950">
                        STATUS: VERIFICATION PENDING
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold uppercase">
                        Premises Inspection Pending
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                      {pharmStatusNotes}
                    </p>
                  </div>
                </div>
                <div className="text-[11px] text-amber-800 bg-amber-100/60 p-2.5 rounded-xl">
                  Notice: Premise is not permitted to access dispensing terminals until PCN inspection committee clearance.
                </div>
              </div>
            )}

            {pharmVerificationStatus === 'UNVERIFIED' && (
              <div className="bg-slate-100 border-2 border-slate-400 rounded-2xl p-4.5 space-y-2">
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-heading font-bold text-sm text-slate-900">
                      STATUS: UNVERIFIED DRAFT
                    </span>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {pharmStatusNotes}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {pharmVerificationStatus === 'FAILED' && (
              <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4.5 space-y-2">
                <div className="flex items-start gap-2.5">
                  <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-heading font-bold text-sm text-red-950">
                      STATUS: VERIFICATION FAILED
                    </span>
                    <p className="text-xs text-red-900 mt-1 leading-relaxed">
                      {pharmStatusNotes}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {pharmVerificationStatus === 'SUSPENDED' && (
              <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-4.5 space-y-2">
                <div className="flex items-start gap-2.5">
                  <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-heading font-bold text-sm text-rose-950">
                      STATUS: SUSPENDED / REVOKED
                    </span>
                    <p className="text-xs text-rose-900 mt-1 leading-relaxed">
                      {pharmStatusNotes}
                    </p>
                  </div>
                </div>
                <div className="text-[11px] text-rose-800 bg-rose-100/60 p-2.5 rounded-xl">
                  Enforcement Notice: Facility premises are sealed. Controlled prescription counter access is disabled.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
