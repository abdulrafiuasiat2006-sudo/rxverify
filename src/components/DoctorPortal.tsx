import React, { useState } from 'react';
import { 
  Stethoscope, 
  Send, 
  Check, 
  X, 
  Search,
  CheckCircle2,
  QrCode,
  Copy,
  Printer,
  Share2,
  Clock,
  AlertTriangle,
  FileText,
  Filter,
  Ban,
  ShieldCheck,
  Calendar,
  User,
  Pill,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Prescription, RefillRequest, MockDoctor } from '../types';
import { CONTROLLED_DRUGS_LIST } from '../data/mockData';

interface DoctorPortalProps {
  currentDoctor: MockDoctor;
  prescriptions: Prescription[];
  onIssuePrescription: (newRx: Omit<Prescription, 'id' | 'qrPayload'>) => Prescription;
  onApproveRefill: (rxCode: string, requestId: string, approved: boolean, note: string) => void;
  onCancelPrescription?: (rxCode: string, reason: string) => void;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({
  currentDoctor,
  prescriptions,
  onIssuePrescription,
  onApproveRefill,
  onCancelPrescription,
}) => {
  const [activeTab, setActiveTab] = useState<'issue' | 'issued' | 'renewals'>('issue');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISPENSED' | 'EXPIRED' | 'CANCELLED'>('ALL');

  // Form State
  const [patientName, setPatientName] = useState('Babatunde Adele');
  const [patientPhone, setPatientPhone] = useState('+234 802 119 4432');
  const [patientAge, setPatientAge] = useState(42);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientNIN, setPatientNIN] = useState('NIN-8821-3912-00');
  
  const [selectedDrug, setSelectedDrug] = useState(CONTROLLED_DRUGS_LIST[0].name);
  const [strength, setStrength] = useState('50mg');
  const [dosageInstructions, setDosageInstructions] = useState('1 capsule every 8 hours as needed for severe post-operative pain. Max 3 caps/24h.');
  const [quantity, setQuantity] = useState('10 Capsules (3-day course)');
  const [clinicalIndication, setClinicalIndication] = useState('Acute post-operative tibial fracture pain (Day 2 post-surgery)');
  const [validityDays, setValidityDays] = useState(5);
  const [allowRefill, setAllowRefill] = useState(false);

  // Issued prescription preview & modal
  const [generatedRx, setGeneratedRx] = useState<Prescription | null>(null);
  const [selectedRxForSlip, setSelectedRxForSlip] = useState<Prescription | null>(null);
  const [copiedLinkCode, setCopiedLinkCode] = useState<string | null>(null);
  const [cancelModalRx, setCancelModalRx] = useState<Prescription | null>(null);
  const [cancelReason, setCancelReason] = useState('Patient clinical condition resolved / therapy discontinued');

  // Filtered list scoped to current doctor
  const doctorPrescriptions = prescriptions.filter(rx => 
    rx.doctorMDCN === currentDoctor.mdcn || rx.doctorName === currentDoctor.name
  );

  // Count pending renewals
  const pendingRenewals: { rx: Prescription; request: RefillRequest }[] = [];
  prescriptions.forEach(rx => {
    if (rx.doctorMDCN === currentDoctor.mdcn && rx.refillRequests) {
      rx.refillRequests.forEach(req => {
        if (req.status === 'PENDING') {
          pendingRenewals.push({ rx, request: req });
        }
      });
    }
  });

  // Calculate stats
  const activeCount = doctorPrescriptions.filter(rx => rx.status === 'VALID_UNFILLED').length;
  const dispensedCount = doctorPrescriptions.filter(rx => rx.status === 'FILLED').length;
  const expiredCount = doctorPrescriptions.filter(rx => rx.status === 'EXPIRED').length;
  const cancelledCount = doctorPrescriptions.filter(rx => rx.status === 'CANCELLED').length;

  const handleSubmitNewRx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert('Patient name is required.');
      return;
    }

    const issueDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(issueDate.getDate() + validityDays);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `RX-${randomSuffix}-VAL`;

    const selectedDrugObj = CONTROLLED_DRUGS_LIST.find(d => d.name === selectedDrug);

    const newRxData: Omit<Prescription, 'id' | 'qrPayload'> = {
      code,
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      patientNIN,
      drugName: selectedDrug,
      activeIngredient: selectedDrug.split(' ')[0],
      strength,
      dosageInstructions,
      quantity,
      scheduleCategory: (selectedDrugObj?.schedule as any) || 'Schedule II (High Control)',
      clinicalIndication,
      issueDate: issueDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      doctorName: currentDoctor.name,
      doctorMDCN: currentDoctor.mdcn,
      doctorHospital: currentDoctor.hospital,
      doctorPhone: currentDoctor.phone,
      status: 'VALID_UNFILLED',
      maxRefills: allowRefill ? 1 : 0,
      refillsRemaining: allowRefill ? 1 : 0,
    };

    const issued = onIssuePrescription(newRxData);
    setGeneratedRx(issued);
  };

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}/#verify?code=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedLinkCode(code);
    setTimeout(() => setCopiedLinkCode(null), 2500);
  };

  const handleCancelSubmit = () => {
    if (!cancelModalRx) return;
    if (onCancelPrescription) {
      onCancelPrescription(cancelModalRx.code, cancelReason);
    } else {
      cancelModalRx.status = 'CANCELLED';
    }
    setCancelModalRx(null);
  };

  // Filtered issued prescriptions
  const filteredIssued = doctorPrescriptions.filter(rx => {
    const q = searchFilter.toLowerCase();
    const matchesSearch = !q || (
      rx.code.toLowerCase().includes(q) ||
      rx.patientName.toLowerCase().includes(q) ||
      rx.drugName.toLowerCase().includes(q) ||
      (rx.patientNIN && rx.patientNIN.toLowerCase().includes(q))
    );

    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && rx.status === 'VALID_UNFILLED') ||
      (statusFilter === 'DISPENSED' && rx.status === 'FILLED') ||
      (statusFilter === 'EXPIRED' && rx.status === 'EXPIRED') ||
      (statusFilter === 'CANCELLED' && rx.status === 'CANCELLED');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Top Banner with DocNow Aesthetic */}
      <div className="bg-[#1B4332] text-white rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#B5D99B]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#B5D99B]/20 text-[#B5D99B] text-xs font-bold tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              MDCN Licensed Prescriber Terminal
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-white tracking-tight">
              Controlled Substance E-Prescriber
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
              Generate tamper-proof, single-dispense electronic prescriptions for Schedule II, III, and IV controlled drugs. Automatically synchronized across all PCN-accredited community pharmacies nationwide.
            </p>
          </div>

          {/* Doctor Profile Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-xs text-white max-w-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-xl bg-[#B5D99B] text-[#1B4332] font-bold flex items-center justify-center text-xs">
                Dr
              </div>
              <div>
                <div className="font-bold text-white text-sm">{currentDoctor.name}</div>
                <div className="text-[11px] text-[#B5D99B] font-mono">{currentDoctor.mdcn}</div>
              </div>
            </div>
            <div className="text-emerald-100/70 text-[11px] line-clamp-1">
              {currentDoctor.hospital}
            </div>
          </div>
        </div>

        {/* Stats Ribbon */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <div className="text-lg font-heading font-bold text-[#B5D99B]">{activeCount}</div>
            <div className="text-[11px] text-emerald-100/80">Active (Unfilled)</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <div className="text-lg font-heading font-bold text-white">{dispensedCount}</div>
            <div className="text-[11px] text-emerald-100/80">Dispensed by Pharmacies</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <div className="text-lg font-heading font-bold text-amber-300">{expiredCount}</div>
            <div className="text-[11px] text-emerald-100/80">Expired Validity</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <div className="text-lg font-heading font-bold text-white">{doctorPrescriptions.length}</div>
            <div className="text-[11px] text-emerald-100/80">Total Prescriptions Issued</div>
          </div>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-emerald-100 pb-3">
        <button
          onClick={() => setActiveTab('issue')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'issue'
              ? 'bg-[#1B4332] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Pill className="w-3.5 h-3.5 text-[#B5D99B]" />
          <span>Issue Controlled Prescription</span>
        </button>

        <button
          onClick={() => setActiveTab('issued')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'issued'
              ? 'bg-[#1B4332] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>My Prescriptions Directory</span>
          <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${
            activeTab === 'issued' ? 'bg-[#B5D99B] text-[#1B4332]' : 'bg-slate-100 text-slate-700'
          }`}>
            {doctorPrescriptions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('renewals')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'renewals'
              ? 'bg-[#1B4332] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pharmacy Refill Requests</span>
          {pendingRenewals.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-slate-900 text-[10px] font-bold rounded-full">
              {pendingRenewals.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: ISSUE PRESCRIPTION */}
      {activeTab === 'issue' && (
        <div className="space-y-4">
          {/* If a prescription was just generated, show full success confirmation with QR and share link */}
          {generatedRx ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <h2 className="text-lg font-heading font-bold text-[#1B4332]">
                      Prescription Successfully Registered &amp; Encrypted
                    </h2>
                    <p className="text-xs text-slate-500">
                      Synchronized to PCN Central Anti-Diversion Registry. Available at all accredited community pharmacies.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedRxForSlip(generatedRx)}
                    className="px-3.5 py-2 bg-[#F7FAF6] hover:bg-emerald-50 text-[#1B4332] border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Rx Slip</span>
                  </button>
                  <button
                    onClick={() => setGeneratedRx(null)}
                    className="px-3.5 py-2 bg-[#1B4332] hover:bg-[#143427] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                  >
                    Create Another Prescription
                  </button>
                </div>
              </div>

              {/* Unique Code & QR Generator Card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#F7FAF6] rounded-2xl p-5 border border-emerald-100">
                {/* QR Code Presentation */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-emerald-100 shadow-xs text-center space-y-3">
                  <div className="p-3 bg-[#F7FAF6] rounded-xl border border-dashed border-emerald-300">
                    <QrCode className="w-36 h-36 text-[#1B4332]" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Secure QR Token</div>
                    <div className="text-xs text-slate-600">Scan at any registered pharmacy scanner</div>
                  </div>
                </div>

                {/* Prescription Details & Sharing */}
                <div className="md:col-span-8 space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-500 font-medium">Prescription Code:</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xl sm:text-2xl font-extrabold text-[#1B4332] tracking-wider bg-white px-3 py-1 rounded-xl border border-emerald-200 shadow-xs">
                        {generatedRx.code}
                      </span>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-full">
                        ACTIVE • READY TO DISPENSE
                      </span>
                    </div>
                  </div>

                  {/* Shareable Link Box */}
                  <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-1.5">
                    <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Unique Verification Link:</span>
                      {copiedLinkCode === generatedRx.code && (
                        <span className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Copied to clipboard!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/#verify?code=${generatedRx.code}`}
                        className="w-full text-xs font-mono bg-[#F7FAF6] border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopyLink(generatedRx.code)}
                        className="px-3 py-2 bg-[#1B4332] text-white text-xs font-bold rounded-lg hover:bg-[#143427] transition-colors shrink-0 flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Send this link via SMS, WhatsApp, or email to the patient. They can present it at any accredited pharmacy.
                    </p>
                  </div>

                  {/* Clinical Summary */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Patient:</span>
                      <span className="font-bold text-slate-900">{generatedRx.patientName} ({generatedRx.patientAge}y, {generatedRx.patientGender})</span>
                      <div className="text-[11px] text-slate-500">{generatedRx.patientPhone}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Substance &amp; Strength:</span>
                      <span className="font-bold text-slate-900">{generatedRx.drugName}</span>
                      <div className="text-[11px] text-emerald-800 font-semibold">{generatedRx.quantity}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Controlled Drug Prescription Entry Form */
            <form onSubmit={handleSubmitNewRx} className="bg-white rounded-3xl p-5 sm:p-7 border border-emerald-100 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h3 className="font-heading font-bold text-base text-[#1B4332] flex items-center gap-2">
                    <span>Patient &amp; Clinical Medication Details</span>
                  </h3>
                  <p className="text-xs text-slate-500">All fields required for Schedule II-IV regulatory tracking</p>
                </div>
                <div className="text-xs font-bold text-slate-600 bg-[#F7FAF6] px-3 py-1 rounded-xl border border-emerald-100">
                  Step 1 of 1: Digital Prescription Generation
                </div>
              </div>

              {/* Patient Demographics */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Patient Demographics</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Patient Full Legal Name</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Babatunde Adele"
                      required
                      className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-slate-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Patient Phone (SMS Notification)</label>
                    <input
                      type="tel"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="e.g. +234 802 119 4432"
                      required
                      className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332] font-mono text-slate-900 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Age</label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(Number(e.target.value))}
                      min={1}
                      max={120}
                      required
                      className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-slate-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Gender</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-slate-900 text-sm"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">National ID Number (NIN)</label>
                    <input
                      type="text"
                      value={patientNIN}
                      onChange={(e) => setPatientNIN(e.target.value)}
                      placeholder="NIN-XXXX-XXXX-XX"
                      className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332] font-mono text-slate-900 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Medication Specifications */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Prescription Specifications</span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Controlled Medication</label>
                    <select
                      value={selectedDrug}
                      onChange={(e) => {
                        setSelectedDrug(e.target.value);
                        const match = CONTROLLED_DRUGS_LIST.find(d => d.name === e.target.value);
                        if (match) {
                          setStrength(match.form.split(' ')[0] || '50mg');
                        }
                      }}
                      className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-slate-900 text-sm font-medium"
                    >
                      {CONTROLLED_DRUGS_LIST.map(d => (
                        <option key={d.name} value={d.name}>
                          {d.name} ({d.schedule})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Dosage / Strength</label>
                    <input
                      type="text"
                      value={strength}
                      onChange={(e) => setStrength(e.target.value)}
                      placeholder="e.g. 50mg"
                      required
                      className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-slate-900 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Quantity Prescribed</label>
                    <input
                      type="text"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g. 10 Tablets (3-day course)"
                      required
                      className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-slate-900 text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Dosage Instructions (Clear Directions)</label>
                    <input
                      type="text"
                      value={dosageInstructions}
                      onChange={(e) => setDosageInstructions(e.target.value)}
                      placeholder="e.g. 1 capsule every 8 hours as needed. Max 3 caps/day."
                      required
                      className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-slate-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Clinical Indication / Diagnosis</label>
                    <input
                      type="text"
                      value={clinicalIndication}
                      onChange={(e) => setClinicalIndication(e.target.value)}
                      placeholder="e.g. Acute severe post-surgical pain (Orthopedic)"
                      required
                      className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-slate-900 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Validity & Safeguards */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <label className="font-semibold text-slate-700">Validity Window:</label>
                    <select
                      value={validityDays}
                      onChange={(e) => setValidityDays(Number(e.target.value))}
                      className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-[#F7FAF6] font-semibold text-slate-900"
                    >
                      <option value={3}>3 Days (Strict Anti-Diversion)</option>
                      <option value={5}>5 Days (Standard)</option>
                      <option value={7}>7 Days (Max Schedule II)</option>
                      <option value={14}>14 Days (Schedule IV only)</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allowRefill}
                      onChange={(e) => setAllowRefill(e.target.checked)}
                      className="w-4 h-4 rounded text-[#1B4332] accent-[#1B4332]"
                    />
                    <span className="font-medium text-slate-700">Allow 1 Pharmacy Refill Authorization</span>
                  </label>
                </div>

                <button
                  type="submit"
                  id="issue-rx-submit-btn"
                  className="px-6 py-2.5 bg-[#1B4332] hover:bg-[#143427] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#B5D99B]" />
                  <span>Generate Encrypted Prescription &amp; QR</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: MY PRESCRIPTIONS DIRECTORY */}
      {activeTab === 'issued' && (
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-xs overflow-hidden">
          {/* Filter Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search by code (e.g. RX-9421-VAL), patient name, or drug..."
                  className="w-full pl-9 pr-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'ALL', label: 'All Statuses' },
                  { id: 'ACTIVE', label: 'Active (Unfilled)' },
                  { id: 'DISPENSED', label: 'Dispensed' },
                  { id: 'EXPIRED', label: 'Expired' },
                  { id: 'CANCELLED', label: 'Cancelled' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id as any)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                      statusFilter === st.id
                        ? 'bg-[#1B4332] text-white shadow-xs'
                        : 'bg-[#F7FAF6] text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prescriptions List */}
          {filteredIssued.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-800 text-sm">No prescriptions found</p>
              <p className="text-xs text-slate-400">Try changing your search keywords or status filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredIssued.map((rx) => {
                const isActive = rx.status === 'VALID_UNFILLED';
                const isFilled = rx.status === 'FILLED';
                const isExpired = rx.status === 'EXPIRED';
                const isCancelled = rx.status === 'CANCELLED';

                return (
                  <div key={rx.id} className="p-4 sm:p-5 hover:bg-[#F7FAF6]/60 transition-colors space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono font-extrabold text-sm text-[#1B4332] bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                          {rx.code}
                        </span>

                        {/* Status Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isFilled
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : isExpired
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {isActive ? 'Active (Unfilled)' : isFilled ? 'Dispensed' : isExpired ? 'Expired' : 'Cancelled'}
                        </span>

                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="text-xs text-slate-500">
                          Issued on {new Date(rx.issueDate).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyLink(rx.code)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-1 transition-colors"
                          title="Copy Patient Verification Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedLinkCode === rx.code ? 'Copied!' : 'Link'}</span>
                        </button>

                        <button
                          onClick={() => setSelectedRxForSlip(rx)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#1B4332] bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors"
                          title="View Digital Slip & QR"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Slip &amp; QR</span>
                        </button>

                        {isActive && (
                          <button
                            onClick={() => setCancelModalRx(rx)}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg flex items-center gap-1 transition-colors"
                            title="Cancel this prescription before dispensing"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Patient & Medication Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F7FAF6] p-3 rounded-xl border border-emerald-100/60 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Patient:</span>
                        <span className="font-bold text-slate-900">{rx.patientName}</span>
                        <div className="text-[11px] text-slate-500">{rx.patientPhone} &bull; {rx.patientGender}, {rx.patientAge}y</div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Substance &amp; Quantity:</span>
                        <span className="font-bold text-[#1B4332]">{rx.drugName} ({rx.strength})</span>
                        <div className="text-[11px] text-slate-600">{rx.quantity}</div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Validity / Dispensing Info:</span>
                        {isFilled && rx.filledDetails ? (
                          <div className="text-slate-800">
                            <span className="font-bold text-emerald-800">Filled at {rx.filledDetails.pharmacyName}</span>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Batch: {rx.filledDetails.batchNumber} &bull; {new Date(rx.filledDetails.filledAt).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-700">
                            Valid until: <strong className="text-slate-900">{new Date(rx.expiryDate).toLocaleDateString()}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PENDING REFILL REQUESTS */}
      {activeTab === 'renewals' && (
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs space-y-4">
          <div className="space-y-0.5">
            <h3 className="font-heading font-bold text-base text-[#1B4332]">
              Community Pharmacy Refill Requests ({pendingRenewals.length})
            </h3>
            <p className="text-xs text-slate-500">
              When a verified patient presents an expired maintenance prescription, the dispensing pharmacist can request a 1-click renewal.
            </p>
          </div>

          {pendingRenewals.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-[#F7FAF6] rounded-2xl border border-dashed border-emerald-200">
              No pending refill authorizations requested from community pharmacies.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRenewals.map(({ rx, request }) => (
                <div key={request.id} className="bg-[#F7FAF6] border border-emerald-100 rounded-2xl p-4 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-[#1B4332] bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                      {rx.code}
                    </span>
                    <span className="text-slate-500 text-xs">
                      Requested from: <strong className="text-slate-900">{request.pharmacyName}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Patient:</span>
                      <span className="font-bold text-slate-900">{rx.patientName} ({rx.patientAge}y)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Substance:</span>
                      <span className="font-bold text-slate-900">{rx.drugName} ({rx.strength})</span>
                    </div>
                  </div>

                  <div className="text-slate-600 text-[11px] bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60">
                    <strong>Pharmacist Assessment:</strong> "{request.note}"
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onApproveRefill(rx.code, request.id, false, 'Clinical in-person evaluation required at clinic.')}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs rounded-xl font-bold border border-slate-200 transition-colors"
                    >
                      Decline Refill
                    </button>
                    <button
                      type="button"
                      onClick={() => onApproveRefill(rx.code, request.id, true, 'Authorized 5-day maintenance refill.')}
                      className="px-4 py-1.5 bg-[#1B4332] hover:bg-[#143427] text-white text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5 text-[#B5D99B]" />
                      <span>Authorize 5-Day Refill</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Printable Prescription Slip & QR Code */}
      {selectedRxForSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-[#1B4332] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#B5D99B]" />
                <h3 className="font-heading font-bold text-base">Digital Prescription Slip</h3>
              </div>
              <button
                onClick={() => setSelectedRxForSlip(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="text-center space-y-2 border-b border-slate-100 pb-4">
                <div className="font-mono text-2xl font-black text-[#1B4332] tracking-wider">
                  {selectedRxForSlip.code}
                </div>
                <div className="p-3 bg-[#F7FAF6] rounded-2xl border border-dashed border-emerald-300 inline-block">
                  <QrCode className="w-32 h-32 text-[#1B4332] mx-auto" />
                </div>
                <div className="text-[11px] text-slate-500">
                  Scan token to authenticate against PCN Central Registry
                </div>
              </div>

              {/* Prescription Particulars */}
              <div className="space-y-2 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Patient:</span>
                    <span className="font-bold text-slate-900">{selectedRxForSlip.patientName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Controlled Medication:</span>
                    <span className="font-bold text-[#1B4332]">{selectedRxForSlip.drugName} ({selectedRxForSlip.strength})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Quantity:</span>
                    <span className="font-semibold text-slate-900">{selectedRxForSlip.quantity}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Instructions:</span>
                    <span className="font-medium text-slate-800 text-right max-w-[240px]">{selectedRxForSlip.dosageInstructions}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Validity:</span>
                    <span className="font-bold text-slate-900">{new Date(selectedRxForSlip.expiryDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Prescribing Doctor:</span>
                    <span className="font-semibold text-slate-900">{selectedRxForSlip.doctorName} ({selectedRxForSlip.doctorMDCN})</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleCopyLink(selectedRxForSlip.code)}
                  className="flex-1 py-2.5 px-3 bg-[#F7FAF6] hover:bg-emerald-50 text-[#1B4332] border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLinkCode === selectedRxForSlip.code ? 'Copied Link!' : 'Copy Secure Link'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 px-3 bg-[#1B4332] hover:bg-[#143427] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cancel Prescription Confirmation */}
      {cancelModalRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                <Ban className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900">Cancel Prescription</h3>
                <span className="font-mono text-xs font-bold text-rose-700">{cancelModalRx.code}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Cancelling this prescription flags it immediately across all registered community pharmacies so it cannot be dispensed.
            </p>

            <div className="space-y-1 text-xs">
              <label className="block text-slate-700 font-semibold">Reason for Cancellation:</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7FAF6] border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalRx(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Keep Active
              </button>
              <button
                onClick={handleCancelSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
