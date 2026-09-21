import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Stethoscope, 
  Clock, 
  Search, 
  Filter,
  AlertTriangle,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { PendingRegistration, MockDoctor, MockPharmacy } from '../types';
import { MDCN_OFFICIAL_LOOKUP_URL, PCN_OFFICIAL_LOOKUP_URL } from '../data/mockData';

interface AdminVerificationViewProps {
  pendingRegistrations: PendingRegistration[];
  onConfirmDoctor: (registration: PendingRegistration) => void;
  onConfirmPharmacy: (registration: PendingRegistration) => void;
  onRejectRegistration: (id: string, reason: string) => void;
  onReturnToLogin?: () => void;
}

export const AdminVerificationView: React.FC<AdminVerificationViewProps> = ({
  pendingRegistrations,
  onConfirmDoctor,
  onConfirmPharmacy,
  onRejectRegistration,
  onReturnToLogin,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'doctor' | 'pharmacy'>('all');
  const [activeStatusTab, setActiveStatusTab] = useState<'pending' | 'history'>('pending');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [customRejectReason, setCustomRejectReason] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Copy registration number to clipboard
  const handleCopyNumber = (regNum: string, id: string) => {
    navigator.clipboard.writeText(regNum);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Filter registrations
  const pendingItems = pendingRegistrations.filter(r => r.status === 'PENDING_VERIFICATION');
  const historyItems = pendingRegistrations.filter(r => r.status !== 'PENDING_VERIFICATION');

  const displayedItems = (activeStatusTab === 'pending' ? pendingItems : historyItems).filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const handleConfirm = (item: PendingRegistration) => {
    if (item.type === 'doctor') {
      onConfirmDoctor(item);
      setActionSuccessMsg(`Confirmed & Enrolled: ${item.fullName} (${item.mdcnNumber}) is now active in MDCN Prescriber Directory.`);
    } else {
      onConfirmPharmacy(item);
      setActionSuccessMsg(`Confirmed & Enrolled: ${item.pharmacyName} (${item.pcnNumber}) is now active in PCN Premises Directory.`);
    }
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleStartReject = (item: PendingRegistration) => {
    setRejectingId(item.id);
    setCustomRejectReason(
      item.type === 'doctor'
        ? 'Registration number could not be confirmed against the official MDCN register. Please check your MDCN folio number.'
        : 'Registration number could not be confirmed against the official PCN premises register. Please check your PCN certificate.'
    );
  };

  const handleExecuteReject = (id: string) => {
    onRejectRegistration(id, customRejectReason);
    setRejectingId(null);
    setCustomRejectReason('');
    setActionSuccessMsg('Registration rejected. Rejection notice posted to applicant profile.');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner / Heading */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-1.5">
              <span className="p-1.5 bg-slate-900 text-white rounded">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Official Regulatory Verification Desk
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              Practitioner &amp; Premises Credential Verification
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Manual verification portal referencing the official gazetted registers. 
              Review pending applicants, copy their council license numbers, query the live government lookup portals, and confirm or reject access.
            </p>
          </div>

          {onReturnToLogin && (
            <button
              type="button"
              onClick={onReturnToLogin}
              className="self-start sm:self-center py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Back to Login / Terminals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Official Government Lookup Reference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MDCN Doctor Registry Lookup */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-emerald-700" />
                MDCN Official Doctor Status Portal
              </span>
              <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
                portal.mdcn.gov.ng
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
              Official Medical and Dental Council of Nigeria database. Look up doctors by folio number (e.g., <code>MDCN/R/77102</code>) to verify provisional/full registration, active annual practicing license, and disciplinary clearance.
            </p>
          </div>
          <a
            href={MDCN_OFFICIAL_LOOKUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="link-mdcn-portal"
            className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors w-full"
          >
            <span>Open MDCN Doctor Status Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* PCN Pharmacy Premises Registry Lookup */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-700" />
                PCN Official Premises Verification Portal
              </span>
              <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
                pcncore.azurewebsites.net
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
              Official Pharmacy Council of Nigeria search engine. Search by pharmacy license/premises registration number (e.g., <code>PCN/R/44120</code>) to verify licensed premises and Superintendent Pharmacist certificates.
            </p>
          </div>
          <a
            href={PCN_OFFICIAL_LOOKUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="link-pcn-portal"
            className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors w-full"
          >
            <span>Open PCN Premises Verification Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Action Success Alert */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Queue Navigation & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="tab-pending-verifications"
            onClick={() => setActiveStatusTab('pending')}
            className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeStatusTab === 'pending'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review ({pendingItems.length})</span>
          </button>

          <button
            type="button"
            id="tab-history-verifications"
            onClick={() => setActiveStatusTab('history')}
            className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeStatusTab === 'history'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Review History ({historyItems.length})</span>
          </button>
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 mr-1 text-[11px] font-medium">Filter:</span>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`py-1 px-2.5 rounded text-[11px] font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-slate-200 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Types
          </button>
          <button
            type="button"
            onClick={() => setFilterType('doctor')}
            className={`py-1 px-2.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
              filterType === 'doctor'
                ? 'bg-slate-200 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Stethoscope className="w-3 h-3" />
            Doctors
          </button>
          <button
            type="button"
            onClick={() => setFilterType('pharmacy')}
            className={`py-1 px-2.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
              filterType === 'pharmacy'
                ? 'bg-slate-200 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3 h-3" />
            Pharmacies
          </button>
        </div>
      </div>

      {/* List of Applications */}
      {displayedItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">
            {activeStatusTab === 'pending' ? 'No Pending Registrations' : 'No Review History Recorded'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeStatusTab === 'pending'
              ? 'All applicant registration submissions have been processed. New doctor or pharmacy submissions will appear here for verification.'
              : 'Decisions made will be logged here for audit purposes.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedItems.map((item) => {
            const isDoctor = item.type === 'doctor';
            const regNumber = isDoctor ? item.mdcnNumber || '' : item.pcnNumber || '';
            const lookupUrl = isDoctor ? MDCN_OFFICIAL_LOOKUP_URL : PCN_OFFICIAL_LOOKUP_URL;
            const lookupLabel = isDoctor ? 'Check MDCN Registry' : 'Check PCN Registry';

            return (
              <div
                key={item.id}
                id={`reg-card-${item.id}`}
                className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs transition-shadow hover:border-slate-300"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        isDoctor
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isDoctor ? <Stethoscope className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                      {isDoctor ? 'Doctor Application' : 'Pharmacy Application'}
                    </span>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        item.status === 'PENDING_VERIFICATION'
                          ? 'bg-amber-100 text-amber-900'
                          : item.status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-red-100 text-red-900'
                      }`}
                    >
                      {item.status === 'PENDING_VERIFICATION' ? '● Pending Regulatory Verification' : item.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Submitted: {new Date(item.submittedAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Main Content Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 py-4">
                  {/* Left: Applicant Information */}
                  <div className="lg:col-span-6 space-y-2">
                    <div>
                      <div className="text-base font-bold text-slate-900">
                        {isDoctor ? item.fullName : item.pharmacyName}
                      </div>
                      <div className="text-xs text-slate-600">
                        {isDoctor ? (
                          <span>{item.specialty || 'General Practitioner'} • {item.clinicName || 'Not specified'}</span>
                        ) : (
                          <span>{item.address}, {item.city || item.state}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 w-16">Contact:</span>
                        <span className="font-mono text-slate-800">{item.phone}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-700">{item.email}</span>
                      </div>
                      {!isDoctor && item.state && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 w-16">Jurisdiction:</span>
                          <span className="text-slate-800 font-medium">{item.state}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Registration Number & Official Registry Link */}
                  <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-md p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                          {isDoctor ? 'Submitted MDCN Folio Number' : 'Submitted PCN License Number'}
                        </span>
                        <span className="text-[10px] text-slate-500">Copy to query portal</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 font-mono font-bold text-sm text-slate-900">
                          {regNumber}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyNumber(regNumber, item.id)}
                          className="py-1.5 px-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          title="Copy registration number"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-600" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Government Registry Lookup Button */}
                    <div className="pt-3">
                      <a
                        href={lookupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold rounded transition-colors w-full cursor-pointer"
                      >
                        <span>{lookupLabel}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Rejection Note if already rejected in history */}
                {item.status === 'REJECTED' && item.rejectionReason && (
                  <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Rejection Reason: </span>
                      {item.rejectionReason}
                    </div>
                  </div>
                )}

                {/* Inline Rejection Reason Modal/Input */}
                {rejectingId === item.id && (
                  <div className="my-3 p-3 bg-red-50 border border-red-200 rounded-md space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-900">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      Specify Rejection Reason (shown to applicant)
                    </div>
                    <textarea
                      value={customRejectReason}
                      onChange={(e) => setCustomRejectReason(e.target.value)}
                      rows={2}
                      className="w-full p-2 text-xs bg-white border border-red-300 rounded text-slate-900 focus:outline-none focus:border-red-500"
                      placeholder="Explain why credentials could not be verified against the official register..."
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setRejectingId(null)}
                        className="py-1 px-3 text-xs bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExecuteReject(item.id)}
                        className="py-1 px-3 text-xs bg-red-700 hover:bg-red-800 text-white font-semibold rounded"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons: Confirm Verified and Reject */}
                {item.status === 'PENDING_VERIFICATION' && rejectingId !== item.id && (
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2">
                    <button
                      type="button"
                      id={`reject-btn-${item.id}`}
                      onClick={() => handleStartReject(item)}
                      className="w-full sm:w-auto py-2 px-4 bg-white hover:bg-red-50 text-red-700 border border-red-200 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      id={`confirm-btn-${item.id}`}
                      onClick={() => handleConfirm(item)}
                      className="w-full sm:w-auto py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Verified &amp; Enroll</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
