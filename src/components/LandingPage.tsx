import React, { useState } from 'react';
import { 
  ScanLine, 
  Video, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  Building,
  Stethoscope
} from 'lucide-react';
import { NavTab } from '../types';

interface LandingPageProps {
  onNavigate: (tab: NavTab) => void;
  onOpenDemoScenarios: () => void;
  onOpenLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenDemoScenarios, onOpenLogin }) => {
  const [dailyControlledCustomers, setDailyControlledCustomers] = useState(8);
  const [avgTicketSize, setAvgTicketSize] = useState(4500);

  const monthlyUnverified = dailyControlledCustomers * 30;
  const potentialLostRevenue = monthlyUnverified * avgTicketSize;
  const rescuedWithTeleconsult = Math.round(potentialLostRevenue * 0.85);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Minimal Hero */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full mb-4 border border-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>PCN & NAFDAC Controlled Drug Compliance</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
          Verify Controlled Prescriptions in Seconds. <br />
          <span className="text-emerald-600">Protect Your License. Keep the Sale.</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto mb-6">
          Nigerian pharmacies shouldn't have to turn away paying customers to stay compliant. 
          RxVerify turns counter verification failures into a 5-minute detour to a legal, doctor-prescribed sale.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            id="hero-verify-counter-btn"
            onClick={() => onNavigate('verify')}
            className="px-5 py-2.5 bg-[#1B4332] hover:bg-[#143427] text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <ScanLine className="w-4 h-4 text-[#B5D99B]" />
            <span>Launch Counter Terminal</span>
          </button>

          {onOpenLogin && (
            <button
              type="button"
              id="hero-login-btn"
              onClick={onOpenLogin}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-2 transition-all border border-slate-300 shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Login as Doctor or Pharmacy</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Key Stats Strip */}
      <div className="grid grid-cols-3 gap-3 mb-12">
        <div className="bg-white border border-slate-200 p-4 rounded-lg text-center">
          <div className="text-xl font-heading font-bold text-slate-900">1.5s</div>
          <div className="text-xs text-slate-500 mt-0.5">Code Lookup Speed</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-lg text-center">
          <div className="text-xl font-heading font-bold text-emerald-600">100%</div>
          <div className="text-xs text-slate-500 mt-0.5">Anti-Diversion Lock</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-lg text-center">
          <div className="text-xl font-heading font-bold text-slate-900">5 Mins</div>
          <div className="text-xs text-slate-500 mt-0.5">Teleconsult Detour</div>
        </div>
      </div>

      {/* 4 Failure Branches Grid */}
      <div className="mb-12">
        <div className="mb-4">
          <h2 className="text-base font-heading font-bold text-slate-900">
            How RxVerify Resolves Every Counter Exception
          </h2>
          <p className="text-xs text-slate-500">
            Automated clinical pathways for all 4 counter verification outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Branch 1 */}
          <div className="bg-white border border-slate-200 p-4 rounded-lg">
            <div className="w-6 h-6 rounded bg-slate-900 text-white text-xs font-bold flex items-center justify-center mb-2.5">
              1
            </div>
            <h3 className="text-xs font-bold text-slate-900 mb-1">No Prescription</h3>
            <p className="text-xs text-slate-500 mb-2.5">
              Customer requests Tramadol or Codeine with no doctor note.
            </p>
            <div className="text-[11px] bg-slate-50 text-slate-700 p-2 rounded border border-slate-100 font-medium">
              &rarr; 5-min teleconsult via Paystack (₦5,000) for instant legal Rx.
            </div>
          </div>

          {/* Branch 2 */}
          <div className="bg-white border border-slate-200 p-4 rounded-lg">
            <div className="w-6 h-6 rounded bg-amber-600 text-white text-xs font-bold flex items-center justify-center mb-2.5">
              2
            </div>
            <h3 className="text-xs font-bold text-slate-900 mb-1">Expired Refill</h3>
            <p className="text-xs text-slate-500 mb-2.5">
              Chronic patient whose maintenance prescription recently expired.
            </p>
            <div className="text-[11px] bg-slate-50 text-slate-700 p-2 rounded border border-slate-100 font-medium">
              &rarr; 1-tap digital renewal sent directly to prescriber's portal.
            </div>
          </div>

          {/* Branch 3 */}
          <div className="bg-white border border-slate-200 p-4 rounded-lg">
            <div className="w-6 h-6 rounded bg-red-600 text-white text-xs font-bold flex items-center justify-center mb-2.5">
              3
            </div>
            <h3 className="text-xs font-bold text-slate-900 mb-1">Already Dispensed</h3>
            <p className="text-xs text-slate-500 mb-2.5">
              Prescription code was already redeemed at another pharmacy.
            </p>
            <div className="text-[11px] bg-slate-50 text-slate-700 p-2 rounded border border-slate-100 font-medium">
              &rarr; Hard red flag enforces block. Stops multi-pharmacy shopping.
            </div>
          </div>

          {/* Branch 4 */}
          <div className="bg-white border border-slate-200 p-4 rounded-lg">
            <div className="w-6 h-6 rounded bg-slate-700 text-white text-xs font-bold flex items-center justify-center mb-2.5">
              4
            </div>
            <h3 className="text-xs font-bold text-slate-900 mb-1">Clinical Mismatch</h3>
            <p className="text-xs text-slate-500 mb-2.5">
              Customer asks for high-dependence drug when minor symptom is present.
            </p>
            <div className="text-[11px] bg-slate-50 text-slate-700 p-2 rounded border border-slate-100 font-medium">
              &rarr; Pharmacist recommends evidence-based OTC alternative on the spot.
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Calculator */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 mb-12">
        <div className="mb-5">
          <h2 className="text-sm font-heading font-bold text-slate-900">
            Pharmacy Revenue & Protection Calculator
          </h2>
          <p className="text-xs text-slate-500">
            Estimate monthly revenue preserved by routing unverified customers through legal teleconsults.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Daily Unverified Walk-ins:</span>
                <span className="font-mono font-bold text-slate-900">{dailyControlledCustomers} customers</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                value={dailyControlledCustomers}
                onChange={(e) => setDailyControlledCustomers(Number(e.target.value))}
                className="w-full accent-slate-900 h-1.5 bg-slate-200 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Average Prescription Basket:</span>
                <span className="font-mono font-bold text-slate-900">₦{avgTicketSize.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={1500}
                max={15000}
                step={500}
                value={avgTicketSize}
                onChange={(e) => setAvgTicketSize(Number(e.target.value))}
                className="w-full accent-slate-900 h-1.5 bg-slate-200 rounded"
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-md text-xs space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Potential Lost Revenue:</span>
              <span className="font-mono font-bold text-red-600">₦{potentialLostRevenue.toLocaleString()} / mo</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
              <div>
                <span className="text-slate-700 font-semibold block">Preserved with RxVerify:</span>
                <span className="text-[11px] text-slate-400">85% converted via 5-min teleconsult</span>
              </div>
              <span className="font-mono text-base font-bold text-emerald-600">
                ₦{rescuedWithTeleconsult.toLocaleString()} / mo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('verify')}
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-left transition-colors flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs mb-1">
              <Building className="w-3.5 h-3.5 text-slate-600" />
              <span>For Community Pharmacies</span>
            </div>
            <p className="text-xs text-slate-500">
              Verify Rx codes, enforce duplicate locks, and log NAFDAC batch numbers.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 ml-3 flex-shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('doctor')}
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-left transition-colors flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs mb-1">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              <span>For MDCN Licensed Doctors</span>
            </div>
            <p className="text-xs text-slate-500">
              Issue tamper-proof digital prescriptions and approve 1-click pharmacy refills.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 ml-3 flex-shrink-0" />
        </button>
      </div>
    </div>
  );
};
