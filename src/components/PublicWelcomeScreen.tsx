import React, { useState } from 'react';
import { 
  ShieldCheck, 
  LogIn, 
  Stethoscope, 
  Building2, 
  Lock, 
  HelpCircle, 
  FileText, 
  Shield, 
  Info, 
  CheckCircle2, 
  X,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

interface PublicWelcomeScreenProps {
  onSelectDoctorLogin: () => void;
  onSelectPharmacyLogin: () => void;
  onOpenLogin?: (initialRole?: 'doctor' | 'pharmacy') => void;
}

export const PublicWelcomeScreen: React.FC<PublicWelcomeScreenProps> = ({ 
  onSelectDoctorLogin,
  onSelectPharmacyLogin,
  onOpenLogin,
}) => {
  const [activeModal, setActiveModal] = useState<'about' | 'help' | 'privacy' | 'terms' | null>(null);

  const handleDoctorClick = () => {
    if (onSelectDoctorLogin) {
      onSelectDoctorLogin();
    } else if (onOpenLogin) {
      onOpenLogin('doctor');
    }
  };

  const handlePharmacyClick = () => {
    if (onSelectPharmacyLogin) {
      onSelectPharmacyLogin();
    } else if (onOpenLogin) {
      onOpenLogin('pharmacy');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-[#F8FAF7] text-slate-900">
      {/* Hero Welcome Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-14 w-full flex-1 flex flex-col justify-center">

        {/* Main Title & Description */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 tracking-tight leading-tight">
            National Controlled Drug <br />
            <span className="text-[#1B4332]">Prescription Verification</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            RxVerify Nigeria is the unified verification infrastructure for licensed physicians and accredited pharmacies to issue, authenticate, and safely dispense controlled medications.
          </p>
        </div>

        {/* Primary Action Card: Welcome / Login */}
        <div className="mt-9 max-w-xl mx-auto w-full bg-white rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-900/5 p-6 sm:p-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#1B4332] text-[#B5D99B] flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="font-heading font-bold text-2xl text-slate-900">
              Welcome / Login
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Select your healthcare practitioner role to access your secure terminal:
            </p>
          </div>

          {/* Role Navigation Choices: Doctor & Pharmacy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-1">
            {/* Login as Doctor */}
            <button
              type="button"
              id="welcome-login-doctor-btn"
              onClick={handleDoctorClick}
              className="group relative bg-[#F7FAF6] hover:bg-[#EBF7E5] border-2 border-emerald-200/80 hover:border-[#1B4332] rounded-2xl p-5 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-white text-[#1B4332] group-hover:bg-[#1B4332] group-hover:text-[#B5D99B] flex items-center justify-center transition-colors shadow-2xs">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    Login as Doctor
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Issue secure e-prescriptions, approve refills, and verify MDCN credentials.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs font-bold text-[#1B4332] group-hover:translate-x-1 transition-transform">
                <span>Continue to Doctor Login</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>

            {/* Login as Pharmacy */}
            <button
              type="button"
              id="welcome-login-pharmacy-btn"
              onClick={handlePharmacyClick}
              className="group relative bg-[#F7FAF6] hover:bg-[#EBF7E5] border-2 border-emerald-200/80 hover:border-[#1B4332] rounded-2xl p-5 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-white text-[#1B4332] group-hover:bg-[#1B4332] group-hover:text-[#B5D99B] flex items-center justify-center transition-colors shadow-2xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    Login as Pharmacy
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Verify dispensing tokens, track quota, and verify PCN premises.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs font-bold text-[#1B4332] group-hover:translate-x-1 transition-transform">
                <span>Continue to Pharmacy Login</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>

        {/* 3 Core Trust Pillars (Zero Private Data) */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto w-full text-left">
          <div className="bg-white/80 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-4.5 space-y-1.5">
            <h3 className="font-heading font-bold text-xs text-slate-900">
              Anti-Diversion Lock
            </h3>
            <p className="text-[11px] text-slate-500 leading-normal">
              One-time tamper-proof verification tokens prevent duplicate dispensing and unauthorized prescription reuse across facilities.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-4.5 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#1B4332] flex items-center justify-center font-bold text-xs mb-2">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-xs text-slate-900">
              Council Verified Credentials
            </h3>
            <p className="text-[11px] text-slate-500 leading-normal">
              Doctors and superintendent pharmacists must maintain active licensing verified against MDCN and PCN statutory registers.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-4.5 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#1B4332] flex items-center justify-center font-bold text-xs mb-2">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-xs text-slate-900">
              Protected Health Information
            </h3>
            <p className="text-[11px] text-slate-500 leading-normal">
              All clinical records, doctor signatures, and patient data are strictly encrypted in compliance with the Nigeria Data Protection Act.
            </p>
          </div>
        </div>
      </div>

      {/* Public Footer with Informational Links */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>National Controlled Substance Gateway</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setActiveModal('about')}
              className="hover:text-[#1B4332] transition-colors cursor-pointer"
            >
              About
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => setActiveModal('help')}
              className="hover:text-[#1B4332] transition-colors cursor-pointer"
            >
              Help &amp; Support
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => setActiveModal('privacy')}
              className="hover:text-[#1B4332] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => setActiveModal('terms')}
              className="hover:text-[#1B4332] transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </footer>

      {/* Informational Modal Dialogs */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-[#1B4332] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#B5D99B]" />
                <h3 className="font-heading font-bold text-sm">
                  {activeModal === 'about' && 'About RxVerify Nigeria'}
                  {activeModal === 'help' && 'Practitioner Help & Support'}
                  {activeModal === 'privacy' && 'Privacy Policy (NDPA Compliance)'}
                  {activeModal === 'terms' && 'Terms of Service & Regulatory Compliance'}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 text-xs text-slate-600 leading-relaxed space-y-4 max-h-[70vh] overflow-y-auto">
              {activeModal === 'about' && (
                <>
                  <p>
                    <strong>RxVerify Nigeria</strong> is a digital regulatory verification network engineered to eliminate prescription fraud, multi-pharmacy diversion, and illicit dispensing of controlled pharmaceutical substances (Schedules II, III, and IV).
                  </p>
                  <p>
                    The platform bridges authorized Nigerian prescribers registered with the Medical and Dental Council of Nigeria (MDCN) with licensed community pharmacy premises accredited by the Pharmacy Council of Nigeria (PCN).
                  </p>
                  <p>
                    By requiring real-time verification at the dispensing counter, RxVerify guarantees that every dispensation is backed by an authentic physician signature and recorded into an immutable audit log.
                  </p>
                </>
              )}

              {activeModal === 'help' && (
                <>
                  <p>
                    <strong>For Medical Doctors:</strong> You must be an active licensee with the Medical and Dental Council of Nigeria (MDCN). Log in with your MDCN registration number to access your prescribing dashboard, generate digital prescriptions, and authorize refills.
                  </p>
                  <p>
                    <strong>For Community Pharmacies:</strong> Facilities must hold valid PCN premises registration and operate under an active superintendent pharmacist. Log in with your premises and pharmacist PCN numbers to access the counter terminal and verify customer codes.
                  </p>
                  <p>
                    Need assistance with council credential synchronization? Contact the National Compliance Desk at <span className="font-mono font-bold text-[#1B4332]">support@rxverify.ng</span>.
                  </p>
                </>
              )}

              {activeModal === 'privacy' && (
                <>
                  <p>
                    RxVerify complies strictly with the <strong>Nigeria Data Protection Act (NDPA) 2023</strong> and international health information security protocols.
                  </p>
                  <p>
                    <strong>Data Protection Safeguards:</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Patient personal identifiers are encrypted and accessible only during counter dispensing verification.</li>
                    <li>No patient health data is sold or shared with commercial entities.</li>
                    <li>Audit logs are maintained solely for statutory PCN and NAFDAC regulatory compliance.</li>
                    <li>Protected medical records are accessible exclusively following authenticated practitioner login.</li>
                  </ul>
                </>
              )}

              {activeModal === 'terms' && (
                <>
                  <p>
                    Access to RxVerify is governed by the <strong>Poison and Pharmacy Act</strong>, the <strong>Pharmacy Council of Nigeria Act</strong>, and the <strong>Medical and Dental Practitioners Act</strong>.
                  </p>
                  <p>
                    <strong>Mandatory Guidelines:</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Only licensed prescribers with active MDCN status may generate controlled drug prescriptions.</li>
                    <li>Pharmacists must verify identity and log physical drug batch numbers prior to dispensing.</li>
                    <li>Attempting to forge, falsify, or reuse verification tokens constitutes a federal offense punishable under Nigerian law.</li>
                    <li>System sessions automatically time out to preserve patient privacy on shared clinical devices.</li>
                  </ul>
                </>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
