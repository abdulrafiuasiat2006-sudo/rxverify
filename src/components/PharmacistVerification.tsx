import React, { useState } from 'react';
import { 
  ScanLine, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Building2, 
  User, 
  FileText, 
  Pill,
  Send,
  Check, 
  AlertOctagon, 
  HelpCircle, 
  Camera, 
  X, 
  ArrowRight,
  ShieldCheck,
  Printer,
  Copy,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Ban
} from 'lucide-react';
import { Prescription, OTCAlternative, MockPharmacy } from '../types';
import { OTC_ALTERNATIVES, MOCK_PHARMACIES } from '../data/mockData';

// Synthesized medical barcode scanner beep (Web Audio API)
const playScanBeep = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1900, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch (e) {
    // Silently continue if audio context is blocked
  }
};

interface PharmacistVerificationProps {
  initialCode?: string;
  currentPharmacy: MockPharmacy;
  pharmacies?: MockPharmacy[];
  onSwitchPharmacy?: (pharmacy: MockPharmacy) => void;
  prescriptions: Prescription[];
  onDispenseSuccess: (prescription: Prescription, batchNumber: string) => void;
  onRequestRefill: (rxCode: string, pharmacyNote: string) => void;
  onSelectOTCAlternative?: (alternative: OTCAlternative, originalDrug: string) => void;
}

export const PharmacistVerification: React.FC<PharmacistVerificationProps> = ({
  initialCode = 'RX-9421-VAL',
  currentPharmacy,
  pharmacies = MOCK_PHARMACIES,
  onSwitchPharmacy,
  prescriptions,
  onDispenseSuccess,
  onRequestRefill,
}) => {
  const [inputCode, setInputCode] = useState(initialCode);
  const [activeCode, setActiveCode] = useState<string>(initialCode);

  React.useEffect(() => {
    if (initialCode) {
      setInputCode(initialCode);
      setActiveCode(initialCode);
      setRefillSentSuccess(false);
    }
  }, [initialCode]);

  const [batchNumber, setBatchNumber] = useState('TRM-2026-B819');
  const [pharmacistCheckNotes, setPharmacistCheckNotes] = useState('');
  const [patientIdVerified, setPatientIdVerified] = useState(true);
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [refillSentSuccess, setRefillSentSuccess] = useState(false);
  const [dispenseSuccessModal, setDispenseSuccessModal] = useState<Prescription | null>(null);
  const [showSwitchPharmacyDropdown, setShowSwitchPharmacyDropdown] = useState(false);
  const [loggedBlockAttempt, setLoggedBlockAttempt] = useState(false);

  const PRESET_SCENARIOS = [
    { code: 'RX-9421-VAL', label: 'Valid Unfilled', desc: 'Tramadol 50mg • Ready to Dispense' },
    { code: 'RX-7823-DUP', label: 'Duplicate Block', desc: 'Codeine 100ml • Already Dispensed' },
    { code: 'RX-3310-EXP', label: 'Expired Validity', desc: 'Diazepam 5mg • Past Validity' },
    { code: 'RX-9999-FAKE', label: 'Unverified / Forged', desc: 'Invalid Code • Counterfeit Alert' },
    { code: 'RX-5542-ALT', label: 'Clinical Review / OTC', desc: 'Bromazepam • Non-Opioid Option' },
  ];

  const handleSelectPreset = (code: string) => {
    setInputCode(code);
    setActiveCode(code);
    setRefillSentSuccess(false);
    setLoggedBlockAttempt(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Support either code or full URL e.g. https://.../verify?code=RX-9421-VAL
    let clean = inputCode.trim();
    if (clean.includes('code=')) {
      const match = clean.match(/code=([^&]+)/);
      if (match && match[1]) {
        clean = match[1];
      }
    }
    clean = clean.toUpperCase();
    setActiveCode(clean);
    setRefillSentSuccess(false);
    setLoggedBlockAttempt(false);
  };

  const currentRx = prescriptions.find(p => p.code.toUpperCase() === activeCode.toUpperCase());

  const isNotFound = activeCode.length > 0 && !currentRx;
  const isValid = currentRx && currentRx.status === 'VALID_UNFILLED';
  const isDuplicate = currentRx && (currentRx.status === 'BLOCKED_DUPLICATE' || currentRx.status === 'FILLED');
  const isExpired = currentRx && currentRx.status === 'EXPIRED';
  const isCancelled = currentRx && currentRx.status === 'CANCELLED';
  const isMismatch = activeCode === 'RX-5542-ALT';

  const handleDispense = () => {
    if (!currentRx) return;
    if (!batchNumber.trim()) {
      alert('Please enter pharmaceutical batch number for PCN audit register.');
      return;
    }
    playScanBeep();
    onDispenseSuccess(currentRx, batchNumber);
    setDispenseSuccessModal(currentRx);
  };

  const handleSendRenewal = () => {
    if (!currentRx) return;
    onRequestRefill(currentRx.code, pharmacistCheckNotes || `Patient presenting at ${currentPharmacy.name} for continuation.`);
    setRefillSentSuccess(true);
  };

  const handleSimulateCameraScan = (code: string) => {
    playScanBeep();
    setInputCode(code);
    setActiveCode(code);
    setIsScanningCamera(false);
    setRefillSentSuccess(false);
    setLoggedBlockAttempt(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Pharmacy Header with DocNow Aesthetics */}
      <div className="bg-[#1B4332] text-white rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#B5D99B]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#B5D99B]/20 text-[#B5D99B] text-xs font-bold tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              Pharmacists Council of Nigeria (PCN) Authenticated Counter
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-white tracking-tight">
              Prescription Verification &amp; Dispensing Counter
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
              Verify prescription authenticity in real-time. Confirms prescribing doctor MDCN credentials, checks single-use status, and prevents forged or double-dispensed controlled medications.
            </p>
          </div>

          {/* Active Pharmacy Identity & Switcher */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-xs text-white min-w-[240px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">Logged In Facility</span>
                {onSwitchPharmacy && (
                  <button
                    onClick={() => setShowSwitchPharmacyDropdown(!showSwitchPharmacyDropdown)}
                    className="text-[11px] text-[#B5D99B] hover:underline font-bold"
                  >
                    Switch Facility
                  </button>
                )}
              </div>
              <div className="font-bold text-white text-sm">{currentPharmacy.name}</div>
              <div className="text-[11px] text-[#B5D99B] font-mono mt-0.5">
                {currentPharmacy.pcnPremisesNumber || currentPharmacy.pcn}
              </div>
              <div className="text-[10px] text-emerald-100/70 mt-1 line-clamp-1">
                Supervising: {currentPharmacy.supervisingPharmacist}
              </div>
            </div>

            {/* Switch Pharmacy Dropdown */}
            {showSwitchPharmacyDropdown && onSwitchPharmacy && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-emerald-100 p-2 z-30 space-y-1">
                <div className="text-[11px] font-bold text-slate-500 px-2 py-1 uppercase tracking-wider">
                  Select Registered Pharmacy
                </div>
                {pharmacies.map((pharm) => (
                  <button
                    key={pharm.id}
                    onClick={() => {
                      onSwitchPharmacy(pharm);
                      setShowSwitchPharmacyDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex flex-col ${
                      currentPharmacy.id === pharm.id
                        ? 'bg-[#1B4332] text-white font-bold'
                        : 'text-slate-700 hover:bg-emerald-50'
                    }`}
                  >
                    <span>{pharm.name}</span>
                    <span className="text-[10px] opacity-75 font-mono">{pharm.city}, {pharm.state}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Test Presets Bar */}
      <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs space-y-2">
        <div className="text-xs font-bold text-slate-600 flex items-center justify-between">
          <span>Simulation Scenarios for Regulatory Audit:</span>
          <span className="text-[11px] text-slate-400 font-normal">Click any preset to test the workflow</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_SCENARIOS.map((s) => {
            const isSelected = activeCode === s.code;
            return (
              <button
                key={s.code}
                onClick={() => handleSelectPreset(s.code)}
                className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all border text-left cursor-pointer ${
                  isSelected
                    ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                    : 'bg-[#F7FAF6] text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                }`}
              >
                <div className="font-bold">{s.label}</div>
                <div className={`text-[10px] ${isSelected ? 'text-[#B5D99B]' : 'text-slate-500'}`}>
                  {s.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Code Input & Camera Scanner Bar */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="prescription-code-input"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Enter prescription code (e.g. RX-9421-VAL) or paste patient link..."
              className="w-full pl-11 pr-4 py-3 bg-[#F7FAF6] border border-slate-200 rounded-2xl font-mono text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              id="verify-code-submit-btn"
              className="flex-1 sm:flex-none px-6 py-3 bg-[#1B4332] hover:bg-[#143427] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <ScanLine className="w-4 h-4 text-[#B5D99B]" />
              <span>Verify Rx</span>
            </button>

            <button
              type="button"
              id="camera-scan-toggle-btn"
              onClick={() => setIsScanningCamera(true)}
              className="px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-[#1B4332] border border-emerald-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors"
              title="Open Barcode & QR Camera Scanner"
            >
              <Camera className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">Camera Scan</span>
            </button>
          </div>
        </form>
      </div>

      {/* VERIFICATION RESULTS CONTAINER */}

      {/* 1. AUTHENTIC & VALID (UNFILLED) -> READY FOR DISPENSING */}
      {isValid && currentRx && (
        <div id="result-valid-container" className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-500 shadow-md space-y-6">
          {/* Status Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900">
                  <Check className="w-3.5 h-3.5" />
                  AUTHENTIC &bull; VALID UNFILLED PRESCRIPTION
                </span>
                <div className="font-mono text-xl font-black text-[#1B4332] mt-1">
                  {currentRx.code}
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-slate-500">
              <div>Valid until: <strong className="text-slate-900">{new Date(currentRx.expiryDate).toLocaleDateString()}</strong></div>
              <div className="text-emerald-700 font-bold">Authorized for Single Dispensing</div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Medication Info */}
            <div className="bg-[#F7FAF6] p-4 rounded-2xl border border-emerald-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Controlled Substance Details</span>
              <div className="text-base font-heading font-extrabold text-[#1B4332]">
                {currentRx.drugName} ({currentRx.strength})
              </div>
              <div className="text-slate-700">
                Authorized Quantity: <strong className="text-slate-900">{currentRx.quantity}</strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-emerald-100 text-slate-800">
                <span className="text-slate-500 block text-[10px]">Dosage Directions:</span>
                {currentRx.dosageInstructions}
              </div>
              <div className="text-slate-500 text-[11px]">
                Indication: <span className="italic text-slate-700">{currentRx.clinicalIndication}</span>
              </div>
            </div>

            {/* Prescriber & Patient Details */}
            <div className="bg-[#F7FAF6] p-4 rounded-2xl border border-emerald-100 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Patient Demographics</span>
                <div className="font-bold text-slate-900 text-sm">{currentRx.patientName}</div>
                <div className="text-slate-600 font-mono text-[11px]">{currentRx.patientPhone} &bull; {currentRx.patientGender}, {currentRx.patientAge} years</div>
                {currentRx.patientNIN && (
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">NIN: {currentRx.patientNIN}</div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Verified Prescribing Doctor</span>
                <div className="font-bold text-slate-900">{currentRx.doctorName}</div>
                <div className="text-emerald-800 font-mono text-[11px] font-bold">{currentRx.doctorMDCN}</div>
                <div className="text-slate-500 text-[11px] line-clamp-1">{currentRx.doctorHospital}</div>
              </div>
            </div>
          </div>

          {/* Dispensing Authorization Strip */}
          <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 space-y-4">
            <div className="font-bold text-xs text-[#1B4332] uppercase tracking-wider">
              Dispensing Recording &amp; Audit Log
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Manufacturer Batch # (NAFDAC / PCN Register):
                </label>
                <input
                  type="text"
                  id="batch-number-input"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g. TRM-2026-B819"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Pharmacist Dispensing Notes:
                </label>
                <input
                  type="text"
                  value={pharmacistCheckNotes}
                  onChange={(e) => setPharmacistCheckNotes(e.target.value)}
                  placeholder="e.g. Verified physical ID, counseled on non-transferability."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-emerald-200/60">
              <label className="flex items-center gap-2 text-xs text-slate-800 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={patientIdVerified}
                  onChange={(e) => setPatientIdVerified(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1B4332] accent-[#1B4332]"
                />
                <span>Confirmed physical government-issued photo ID matches patient credentials.</span>
              </label>

              <button
                id="authorize-dispense-btn"
                onClick={handleDispense}
                disabled={!patientIdVerified}
                className="px-6 py-2.5 bg-[#1B4332] hover:bg-[#143427] disabled:bg-slate-300 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4 text-[#B5D99B]" />
                <span>Confirm &amp; Record Dispensing</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DUPLICATE FILL ATTEMPT -> HARD BLOCK AGAINST REUSE */}
      {isDuplicate && currentRx && (
        <div id="result-duplicate-container" className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-rose-500 shadow-lg space-y-5">
          <div className="flex items-center gap-3 text-rose-700">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-7 h-7 text-rose-600" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-900 border border-rose-300">
                CRITICAL ALERT: PRESCRIPTION ALREADY DISPENSED
              </span>
              <div className="font-mono text-xl font-black text-rose-950 mt-1">
                {currentRx.code} &bull; DISPENSING STRICTLY FORBIDDEN
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            This controlled medication prescription has <strong>already been dispensed and redeemed</strong>. Under PCN &amp; NAFDAC anti-diversion regulations, controlled substances are single-dispense only. Reusing this prescription to obtain controlled medications constitutes illegal diversion.
          </p>

          {/* Details of Prior Dispensing */}
          <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200 text-xs space-y-2">
            <div className="font-bold text-rose-950 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-rose-700" />
              <span>Prior Audit Log Record:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800">
              <div>
                Dispensing Facility: <strong className="text-slate-950">{currentRx.filledDetails?.pharmacyName || 'HealthPlus Victoria Island'}</strong>
              </div>
              <div>
                Time Dispensed: <strong className="font-mono text-slate-950">{currentRx.filledDetails?.filledAt ? new Date(currentRx.filledDetails.filledAt).toLocaleString() : 'Earlier today'}</strong>
              </div>
              <div>
                Supervising Pharmacist: <span className="font-medium">{currentRx.filledDetails?.pharmacistName}</span> ({currentRx.filledDetails?.pharmacistPCN})
              </div>
              <div>
                Logged Batch: <span className="font-mono font-bold text-rose-900">{currentRx.filledDetails?.batchNumber || 'NAFDAC-COD-9921B'}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-500">
              National PCN Anti-Diversion Flag active across all Nigerian premises.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="decline-sale-btn"
                onClick={() => setLoggedBlockAttempt(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                {loggedBlockAttempt ? 'Logged to National PCN Incident Registry' : 'Decline Sale & Log Diversion Attempt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. EXPIRED PRESCRIPTION */}
      {isExpired && currentRx && (
        <div id="result-expired-container" className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-400 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-7 h-7 text-amber-700" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                PRESCRIPTION EXPIRED
              </span>
              <div className="font-mono text-xl font-black text-slate-900 mt-1">
                {currentRx.code} &bull; Exceeded Maximum Validity Window
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-700">
            This prescription expired on <strong>{new Date(currentRx.expiryDate).toLocaleDateString()}</strong>. In accordance with PCN regulations for controlled substances, expired prescriptions cannot be filled without doctor re-authorization.
          </p>

          <div className="bg-[#F7FAF6] rounded-2xl p-4 border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900">Prescribed by {currentRx.doctorName}</div>
              <div className="text-slate-500">{currentRx.doctorHospital} &bull; {currentRx.doctorMDCN}</div>
            </div>

            {refillSentSuccess ? (
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-100 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Renewal request submitted to prescriber portal</span>
              </div>
            ) : (
              <button
                id="send-renewal-request-btn"
                onClick={handleSendRenewal}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send 1-Click Refill Request to Doctor</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. CANCELLED BY DOCTOR */}
      {isCancelled && currentRx && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-rose-400 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
              <Ban className="w-7 h-7 text-rose-700" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-900 border border-rose-300">
                PRESCRIPTION REVOKED / CANCELLED BY PRESCRIBER
              </span>
              <div className="font-mono text-xl font-black text-slate-900 mt-1">
                {currentRx.code} &bull; Clinical Order Voided
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-700">
            The prescribing physician has formally cancelled this prescription in the national database. Do not dispense.
          </p>
        </div>
      )}

      {/* 5. UNVERIFIED / NOT FOUND (FORGED OR INVALID CODE) */}
      {isNotFound && (
        <div id="result-no-rx-container" className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-rose-400 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7 text-rose-700" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-900 border border-rose-300">
                UNVERIFIED CODE: NOT FOUND IN PCN REGISTRY
              </span>
              <h2 className="text-lg font-heading font-extrabold text-slate-900 mt-1">
                Potential Counterfeit or Fabricated Prescription
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            The prescription code <strong className="font-mono font-bold text-rose-900">"{activeCode}"</strong> does not exist in the central registry of licensed prescribers. Controlled medications (Schedule II, III, IV) cannot be legally dispensed without an authentic electronic prescription.
          </p>

          <div className="bg-[#F7FAF6] rounded-2xl p-4 border border-slate-200 text-xs space-y-3">
            <div className="font-bold text-slate-800">Recommended Pharmacist Anti-Diversion Actions:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLoggedBlockAttempt(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                {loggedBlockAttempt ? 'Incident Logged to NAFDAC/PCN Register' : 'Log Unverified Attempt to PCN Registry'}
              </button>
              <button
                onClick={() => handleSelectPreset('RX-5542-ALT')}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition-colors"
              >
                Offer Safe Non-Controlled OTC Alternatives
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. CLINICAL ALTERNATIVES (NON-CONTROLLED OTC OPTIONS) */}
      {isMismatch && (
        <div id="result-mismatch-container" className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <h3 className="font-heading font-bold text-sm text-[#1B4332]">
              Evidence-Based Non-Controlled OTC Alternatives
            </h3>
          </div>
          <p className="text-xs text-slate-600">
            For mild-to-moderate symptoms without high addiction or dependency risks, offer verified over-the-counter options:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {OTC_ALTERNATIVES.map((alt, idx) => (
              <div key={idx} className="bg-[#F7FAF6] rounded-2xl p-4 border border-emerald-100 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Indication: {alt.indicatedFor}</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">{alt.otcName}</h4>
                  <p className="text-slate-600 text-[11px] mt-1">{alt.whySafer}</p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium">
                  Directions: {alt.dosage}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CAMERA SCANNER SIMULATION MODAL */}
      {isScanningCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
            <div className="px-6 py-4 bg-[#1B4332] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#B5D99B]" />
                <h3 className="font-heading font-bold text-base">Scan Prescription QR / Barcode</h3>
              </div>
              <button
                onClick={() => setIsScanningCamera(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-center">
              {/* Camera Viewfinder with animated laser line */}
              <div className="relative w-64 h-64 mx-auto bg-slate-950 rounded-2xl overflow-hidden border-2 border-emerald-400 flex items-center justify-center">
                <div className="absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce" />
                <div className="p-4 border-2 border-dashed border-white/40 rounded-xl">
                  <ScanLine className="w-24 h-24 text-emerald-400/80" />
                </div>
                <span className="absolute bottom-3 text-[11px] text-white/80 font-mono">
                  Align patient QR code within frame
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-700">Quick Scanner Input Simulation:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSimulateCameraScan('RX-9421-VAL')}
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold rounded-xl border border-emerald-200 transition-colors text-left"
                  >
                    <div>Scan Valid Rx</div>
                    <div className="text-[10px] font-mono opacity-75">RX-9421-VAL</div>
                  </button>
                  <button
                    onClick={() => handleSimulateCameraScan('RX-7823-DUP')}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-900 font-bold rounded-xl border border-rose-200 transition-colors text-left"
                  >
                    <div>Scan Duplicate Rx</div>
                    <div className="text-[10px] font-mono opacity-75">RX-7823-DUP</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DISPENSE CONFIRMATION CERTIFICATE MODAL */}
      {dispenseSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
            <div className="px-6 py-4 bg-[#1B4332] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#B5D99B]" />
                <h3 className="font-heading font-bold text-base">Dispensing Recorded Successfully</h3>
              </div>
              <button
                onClick={() => setDispenseSuccessModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6 text-emerald-700" />
                </div>
                <h2 className="text-lg font-heading font-bold text-[#1B4332]">
                  PCN Controlled Substance Audit Entry Created
                </h2>
                <p className="text-xs text-slate-500">
                  Prescription code <span className="font-mono font-bold text-slate-800">{dispenseSuccessModal.code}</span> has been marked FILLED in the central registry.
                </p>
              </div>

              {/* Receipt Summary */}
              <div className="bg-[#F7FAF6] p-4 rounded-2xl border border-emerald-100 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-emerald-100/60">
                  <span className="text-slate-500">Substance Dispensed:</span>
                  <span className="font-bold text-slate-900">{dispenseSuccessModal.drugName} ({dispenseSuccessModal.strength})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100/60">
                  <span className="text-slate-500">Quantity:</span>
                  <span className="font-semibold text-slate-900">{dispenseSuccessModal.quantity}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100/60">
                  <span className="text-slate-500">Batch Number:</span>
                  <span className="font-mono font-bold text-emerald-800">{batchNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100/60">
                  <span className="text-slate-500">Dispensing Facility:</span>
                  <span className="font-semibold text-slate-900">{currentPharmacy.name}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Supervising Pharmacist:</span>
                  <span className="font-semibold text-slate-900">{currentPharmacy.supervisingPharmacist}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 px-3 bg-[#F7FAF6] hover:bg-emerald-50 text-[#1B4332] border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setDispenseSuccessModal(null)}
                  className="flex-1 py-2.5 px-3 bg-[#1B4332] hover:bg-[#143427] text-white rounded-xl text-xs font-bold transition-colors shadow-xs text-center"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
