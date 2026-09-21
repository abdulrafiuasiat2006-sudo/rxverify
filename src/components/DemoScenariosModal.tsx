import React from 'react';
import { 
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Clock,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface DemoScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerScenario: (scenarioId: string) => void;
}

export const DemoScenariosModal: React.FC<DemoScenariosModalProps> = ({
  isOpen,
  onClose,
  onTriggerScenario,
}) => {
  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'valid',
      title: 'Valid E-Prescription & Single Dispense',
      code: 'RX-9421-VAL',
      desc: 'Authentic prescription for Tramadol 50mg. Enter batch number, verify ID, and record legal dispensing.',
      badge: 'Valid Rx',
      icon: CheckCircle2,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'duplicate',
      title: 'Duplicate Dispense Attempt (Diversion Block)',
      code: 'RX-7823-DUP',
      desc: 'Codeine prescription already redeemed 2 hours ago elsewhere. Hard red block prevents multi-pharmacy diversion.',
      badge: 'Blocked Reuse',
      icon: AlertOctagon,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
    },
    {
      id: 'expired',
      title: 'Expired Validity & Prescriber Refill Request',
      code: 'RX-3310-EXP',
      desc: 'Diazepam maintenance prescription expired. Send instant digital refill request to prescribing doctor.',
      badge: 'Expired',
      icon: Clock,
      color: 'text-amber-800 bg-amber-50 border-amber-200',
    },
    {
      id: 'unverified',
      title: 'Unverified / Forged Prescription Code',
      code: 'RX-9999-FAKE',
      desc: 'Prescription code does not exist in national PCN register. Flag as potential counterfeit and log incident.',
      badge: 'Counterfeit Alert',
      icon: AlertTriangle,
      color: 'text-rose-800 bg-rose-50 border-rose-200',
    },
    {
      id: 'mismatch',
      title: 'Clinical Mismatch & Evidence-Based OTC Fit',
      code: 'RX-5542-ALT',
      desc: 'Minor symptom patient requesting high-dependency drug. Pharmacist counsels on safer non-habit forming OTC alternative.',
      badge: 'OTC Alternative',
      icon: Sparkles,
      color: 'text-blue-800 bg-blue-50 border-blue-200',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-100 my-8 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                Audit &amp; Testing Scenarios
              </h3>
              <p className="text-xs text-slate-500">
                Jump directly into key verification states for controlled drug compliance.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {scenarios.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.id} className="border border-slate-200 hover:border-emerald-300 bg-[#F7FAF6] p-3.5 rounded-2xl text-xs transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-700" />
                    <span className="font-bold text-slate-900">{s.title}</span>
                  </div>
                  <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${s.color}`}>
                    {s.badge}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {s.desc}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="font-mono text-xs font-bold text-slate-700">{s.code}</span>
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerScenario(s.id);
                      onClose();
                    }}
                    className="px-3 py-1 bg-[#1B4332] hover:bg-[#143427] text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors shadow-xs"
                  >
                    <span>Test State</span>
                    <ArrowRight className="w-3 h-3 text-[#B5D99B]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
