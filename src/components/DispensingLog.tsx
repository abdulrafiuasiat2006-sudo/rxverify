import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  AlertOctagon, 
  CheckCircle2, 
  Video, 
  Clock
} from 'lucide-react';
import { DispensingLogEntry, DispensingOutcome, MockPharmacy } from '../types';

interface DispensingLogProps {
  logs: DispensingLogEntry[];
  currentPharmacy?: MockPharmacy;
}

export const DispensingLog: React.FC<DispensingLogProps> = ({ logs, currentPharmacy }) => {
  const [filterOutcome, setFilterOutcome] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const totalDispensed = logs.filter(l => l.outcome === 'DISPENSED' || l.outcome === 'TELECONSULT_CONVERTED').length;
  const duplicatesBlocked = logs.filter(l => l.outcome === 'DUPLICATE_BLOCKED').length;
  const teleconsultConverted = logs.filter(l => l.outcome === 'TELECONSULT_CONVERTED').length;

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filterOutcome === 'ALL' || log.outcome === filterOutcome;
    const matchesSearch = 
      log.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.rxCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.prescribingDoctor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getOutcomeBadge = (outcome: DispensingOutcome) => {
    switch (outcome) {
      case 'DISPENSED':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            DISPENSED
          </span>
        );
      case 'DUPLICATE_BLOCKED':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit">
            <AlertOctagon className="w-2.5 h-2.5 text-rose-600" />
            BLOCKED
          </span>
        );
      case 'TELECONSULT_CONVERTED':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white flex items-center gap-1 w-fit">
            <Video className="w-2.5 h-2.5" />
            TELECONSULT
          </span>
        );
      case 'EXPIRED_RENEWAL_REQUESTED':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            RENEWAL REQ
          </span>
        );
      case 'OTC_ALTERNATIVE_OFFERED':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            OTC SOLD
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Rx Code', 'Patient', 'Phone', 'Drug', 'Quantity', 'Batch Number', 'Prescriber', 'Prescriber MDCN', 'Pharmacist', 'Pharmacist PCN', 'Outcome', 'PCN Status'];
    const rows = logs.map(l => [
      l.timestamp,
      l.rxCode,
      l.patientName,
      l.patientPhone,
      l.drugName,
      l.quantity,
      l.batchNumber || 'N/A',
      l.prescribingDoctor,
      l.doctorMDCN,
      l.dispensingPharmacist,
      l.pharmacistPCN,
      l.outcome,
      l.pcnReportStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RxVerify_PCN_Log_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900">
            PCN Dispensing Audit Log
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable register of controlled substance dispensary events.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {currentPharmacy && (
            <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md">
              <span className="font-semibold text-slate-800">{currentPharmacy.name}</span>
              <span className="mx-1.5 text-slate-300">|</span>
              <span className="font-mono text-[11px] text-emerald-700">{currentPharmacy.pharmacistPCN}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-slate-200 p-3.5 rounded-md">
          <div className="text-xs text-slate-500">Total Dispensed</div>
          <div className="text-lg font-bold text-emerald-600 mt-0.5">{totalDispensed}</div>
        </div>
        <div className="bg-white border border-slate-200 p-3.5 rounded-md">
          <div className="text-xs text-slate-500">Diversion Attempts Blocked</div>
          <div className="text-lg font-bold text-rose-600 mt-0.5">{duplicatesBlocked}</div>
        </div>
        <div className="bg-white border border-slate-200 p-3.5 rounded-md">
          <div className="text-xs text-slate-500">Teleconsults Converted</div>
          <div className="text-lg font-bold text-slate-900 mt-0.5">{teleconsultConverted}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6">
        <div className="p-3 border-b border-slate-100 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by patient, code, or drug..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:bg-white focus:border-slate-400"
            />
          </div>

          <select
            value={filterOutcome}
            onChange={(e) => setFilterOutcome(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Outcomes ({logs.length})</option>
            <option value="DISPENSED">Dispensed Only</option>
            <option value="DUPLICATE_BLOCKED">Duplicate Blocked Only</option>
            <option value="TELECONSULT_CONVERTED">Teleconsult Converted Only</option>
            <option value="EXPIRED_RENEWAL_REQUESTED">Renewal Requested Only</option>
            <option value="OTC_ALTERNATIVE_OFFERED">OTC Alternative Only</option>
          </select>
        </div>

        {/* Minimalist Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2.5 px-3">Date / Code</th>
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Drug / Batch</th>
                <th className="py-2.5 px-3">Prescriber &amp; Pharmacy</th>
                <th className="py-2.5 px-3">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3">
                    <div className="font-mono font-bold text-slate-900">{log.rxCode}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-slate-800">{log.patientName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{log.patientPhone}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-slate-800">{log.drugName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Batch: {log.batchNumber || 'N/A'}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="text-slate-800 font-medium">{log.prescribingDoctor}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.doctorMDCN}</div>
                    {log.pharmacyName && (
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {log.pharmacyName} &bull; <span className="font-mono text-[9px]">{log.pharmacistPCN}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {getOutcomeBadge(log.outcome)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
