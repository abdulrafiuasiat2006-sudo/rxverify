import React from 'react';
import { 
  Scale, 
  ShieldAlert, 
  FileCheck, 
  CheckCircle2
} from 'lucide-react';
import { CONTROLLED_DRUGS_LIST } from '../data/mockData';

export const GuidelinesView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-slate-200">
        <h1 className="text-xl font-heading font-bold text-slate-900">
          PCN & NAFDAC Regulatory Mandates
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Statutory standards governing controlled substance dispensary in Nigerian community pharmacies.
        </p>
      </div>

      {/* Core Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-slate-200 p-4 rounded-lg text-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold mb-2">
            <Scale className="w-4 h-4 text-slate-700" />
            <span>PCN Poison Act</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Dispensing Schedule II controlled substances without an authentic prescriber order is professional misconduct risking pharmacy premises closure.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg text-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold mb-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>NAFDAC Opioid Directive</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            All opioid analgesics (Tramadol &gt;50mg) and codeine formulations require verified batch logging and identity confirmation at counter.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg text-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold mb-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>MDCN Telehealth Validity</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Digital prescriptions issued following synchronous audio-visual doctor triage are legally binding for community pharmacy dispensing.
          </p>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6">
        <div className="p-3 border-b border-slate-200 font-bold text-xs text-slate-900">
          Controlled Substances Tracked on RxVerify
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2.5 px-3">Substance</th>
                <th className="py-2.5 px-3">Formulation</th>
                <th className="py-2.5 px-3">Schedule</th>
                <th className="py-2.5 px-3">Max Supply</th>
                <th className="py-2.5 px-3">Indications</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CONTROLLED_DRUGS_LIST.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{item.name}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{item.form}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {item.schedule}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{item.maxDaysSupply} Days</td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px]">{item.indications}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Counter SOP Checklist */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-xs">
        <div className="font-bold text-slate-900 mb-2.5">
          Pharmacist Standard Operating Protocol
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
          <div className="flex items-center gap-2 bg-white p-2.5 rounded border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>Verify digital code or QR before dispensing.</span>
          </div>
          <div className="flex items-center gap-2 bg-white p-2.5 rounded border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>Enforce system duplicate fill blocks immediately.</span>
          </div>
          <div className="flex items-center gap-2 bg-white p-2.5 rounded border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>Route unverified walk-ins to 5-minute teleconsult.</span>
          </div>
          <div className="flex items-center gap-2 bg-white p-2.5 rounded border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>Log physical manufacturer batch number on dispense.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
