import React, { useState } from 'react';
import { 
  Video, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Stethoscope, 
  Lock, 
  Check,
  ShieldCheck
} from 'lucide-react';
import { Prescription } from '../types';

interface TeleconsultFlowProps {
  initialPatientName?: string;
  initialPhone?: string;
  initialDrugRequested?: string;
  onTeleconsultPrescriptionIssued: (newRx: Prescription) => void;
  onReturnToCounter: (rxCode: string) => void;
}

export const TeleconsultFlow: React.FC<TeleconsultFlowProps> = ({
  initialPatientName = 'Chijioke Nnamdi',
  initialPhone = '+234 814 550 9182',
  initialDrugRequested = 'Tramadol 50mg (Severe post-dental surgery pain)',
  onTeleconsultPrescriptionIssued,
  onReturnToCounter,
}) => {
  const [step, setStep] = useState<'intake' | 'paystack' | 'consult' | 'prescribed'>('intake');
  
  // Intake State
  const [patientName, setPatientName] = useState(initialPatientName);
  const [patientPhone, setPatientPhone] = useState(initialPhone);
  const [patientAge, setPatientAge] = useState(34);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female'>('Male');
  const [complaint, setComplaint] = useState('Severe throbbing alveolar osteitis following dental extraction.');
  const [requestedSubstance, setRequestedSubstance] = useState(initialDrugRequested);

  // Paystack Simulation State
  const [paystackTab, setPaystackTab] = useState<'card' | 'transfer' | 'ussd'>('card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Prescribed state
  const [consultPrescription, setConsultPrescription] = useState<Prescription | null>(null);

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('paystack');
  };

  const handleCompletePaystack = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setStep('consult');
    }, 1000);
  };

  const handleDoctorApproveRx = () => {
    const randomCode = `RX-TELE-${Math.floor(1000 + Math.random() * 9000)}`;
    const issueDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(issueDate.getDate() + 3);

    const isCodeine = requestedSubstance.toLowerCase().includes('codeine');
    const newRx: Prescription = {
      id: `rx-tele-${Date.now()}`,
      code: randomCode,
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      drugName: isCodeine ? 'Codeine Linctus' : 'Tramadol HCl Capsules',
      activeIngredient: isCodeine ? 'Codeine Phosphate' : 'Tramadol HCl',
      strength: isCodeine ? '15mg/5ml' : '50mg',
      dosageInstructions: isCodeine ? '5ml every 6-8 hours, max 3 days.' : '1 capsule every 8 hours with food for acute pain.',
      quantity: isCodeine ? '1 bottle (100ml)' : '6 Capsules (3-day acute course)',
      scheduleCategory: 'Schedule II (High Control)',
      clinicalIndication: complaint,
      issueDate: issueDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      doctorName: 'Dr. Chika Okafor, MBBS, FMCPath',
      doctorMDCN: 'MDCN/R/61028',
      doctorHospital: 'RxVerify On-Call Telehealth Network',
      doctorPhone: '+234 803 291 0021',
      status: 'VALID_UNFILLED',
      maxRefills: 0,
      refillsRemaining: 0,
      qrPayload: JSON.stringify({ code: randomCode, patient: patientName, doctor: 'MDCN/R/61028' }),
    };

    setConsultPrescription(newRx);
    onTeleconsultPrescriptionIssued(newRx);
    setStep('prescribed');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-slate-200">
        <h1 className="text-xl font-heading font-bold text-slate-900">
          Walk-in Teleconsult Detour
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          5-minute clinical triage to convert unverified counter requests into legal prescriptions.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between text-xs mb-6 text-slate-500 border-b border-slate-100 pb-3">
        <span className={step === 'intake' ? 'font-bold text-slate-900' : ''}>1. Intake</span>
        <span>&rarr;</span>
        <span className={step === 'paystack' ? 'font-bold text-slate-900' : ''}>2. Paystack (₦5k)</span>
        <span>&rarr;</span>
        <span className={step === 'consult' ? 'font-bold text-slate-900' : ''}>3. Doctor Triage</span>
        <span>&rarr;</span>
        <span className={step === 'prescribed' ? 'font-bold text-emerald-600' : ''}>4. Legal Rx Issued</span>
      </div>

      {/* STEP 1: PATIENT INTAKE */}
      {step === 'intake' && (
        <form onSubmit={handleStartPayment} className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Patient Full Name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-slate-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Mobile Phone (for SMS Token)</label>
              <input
                type="tel"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-xs focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Age</label>
              <input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-slate-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Gender</label>
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value as any)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-slate-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="text-xs space-y-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Current Symptom / Complaint</label>
              <textarea
                rows={2}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-slate-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Controlled Substance Requested at Counter</label>
              <input
                type="text"
                value={requestedSubstance}
                onChange={(e) => setRequestedSubstance(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Telehealth Tariff: <strong>₦5,000</strong></span>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
            >
              <span>Proceed to Paystack</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: PAYSTACK PAYMENT SIMULATION */}
      {step === 'paystack' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <div className="text-xs text-slate-500 font-medium">Paystack Checkout</div>
              <div className="text-base font-bold text-slate-900">₦5,000.00</div>
            </div>
            <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
              Secured
            </span>
          </div>

          <div className="flex gap-2 mb-4 text-xs">
            {(['card', 'transfer', 'ussd'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setPaystackTab(tab)}
                className={`px-3 py-1.5 rounded text-xs capitalize ${
                  paystackTab === tab 
                    ? 'bg-slate-900 text-white font-medium' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {paystackTab === 'card' && (
            <div className="space-y-3 text-xs mb-4">
              <div>
                <label className="block text-slate-600 mb-1">Card Number</label>
                <input
                  type="text"
                  readOnly
                  value="4084 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4084"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Expiry</label>
                  <input
                    type="text"
                    readOnly
                    value="12/28"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">CVV</label>
                  <input
                    type="text"
                    readOnly
                    value="981"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-700"
                  />
                </div>
              </div>
            </div>
          )}

          {paystackTab === 'transfer' && (
            <div className="p-3 bg-slate-50 rounded text-xs space-y-1 text-slate-700 mb-4">
              <div>Bank: <strong>Titan Trust Bank / Paystack</strong></div>
              <div>Account: <strong className="font-mono">9921 4821 00</strong></div>
              <div className="text-[11px] text-slate-500">Expires in 30 minutes</div>
            </div>
          )}

          {paystackTab === 'ussd' && (
            <div className="p-3 bg-slate-50 rounded text-xs text-slate-700 mb-4">
              <div>Dial <strong className="font-mono text-slate-900">*737*50*5000*819#</strong> on GTBank mobile.</div>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep('intake')}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleCompletePaystack}
              disabled={isProcessingPayment}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
            >
              {isProcessingPayment ? (
                <span>Confirming ₦5,000...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authorize ₦5,000 via Paystack</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DOCTOR TRIAGE CONSULTATION */}
      {step === 'consult' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-xs text-slate-900">Dr. Chika Okafor (On-Call Prescriber)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">MDCN/R/61028</span>
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-md mb-4 text-center">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-400">
              <Video className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold">Active Audio-Visual Clinical Evaluation</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Patient: {patientName} &bull; Validating acute indication</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded text-xs space-y-1 mb-4 text-slate-700">
            <div><strong>Reported:</strong> {complaint}</div>
            <div><strong>Clinical Determination:</strong> Acute pain requiring short 3-day restricted course. No red flag abuse history detected.</div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleDoctorApproveRx}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve & Issue Restricted Rx (3 Days)</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PRESCRIPTION ISSUED */}
      {step === 'prescribed' && consultPrescription && (
        <div className="bg-white border border-emerald-200 rounded-lg p-5">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Digital Prescription Generated & Ready at Pharmacy Counter</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-md text-xs space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-slate-500">Prescription Code:</span>
              <span className="font-mono font-bold text-slate-900">{consultPrescription.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Patient:</span>
              <span className="font-semibold text-slate-900">{consultPrescription.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Substance:</span>
              <span className="font-semibold text-slate-900">{consultPrescription.drugName} ({consultPrescription.strength})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Prescribed By:</span>
              <span className="text-slate-900">{consultPrescription.doctorName} ({consultPrescription.doctorMDCN})</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onReturnToCounter(consultPrescription.code)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
            >
              <span>Return to Counter & Dispense</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
