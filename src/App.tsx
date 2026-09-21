import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { PublicWelcomeScreen } from './components/PublicWelcomeScreen';
import { PharmacistVerification } from './components/PharmacistVerification';
import { DoctorPortal } from './components/DoctorPortal';
import { PharmacyLocator } from './components/PharmacyLocator';
import { DispensingLog } from './components/DispensingLog';
import { GuidelinesView } from './components/GuidelinesModal';
import { DemoScenariosModal } from './components/DemoScenariosModal';
import { LoginScreen } from './components/LoginScreen';
import { AdminVerificationView } from './components/AdminVerificationView';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MobileBottomNav } from './components/MobileBottomNav';
import { 
  Prescription, 
  DispensingLogEntry, 
  OTCAlternative, 
  CurrentUser, 
  MockDoctor, 
  MockPharmacy, 
  PendingRegistration,
  NavTab,
  AuthSession
} from './types';
import { 
  INITIAL_PRESCRIPTIONS, 
  INITIAL_DISPENSING_LOGS, 
  MOCK_DOCTORS, 
  MOCK_PHARMACIES, 
  INITIAL_PENDING_REGISTRATIONS 
} from './data/mockData';

export default function App() {
  // Authentication Session (Authentication-First Architecture)
  // Default is STRICTLY NULL for unauthenticated visitors
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    try {
      const saved = sessionStorage.getItem('rxverify_auth_session') || localStorage.getItem('rxverify_auth_session');
      if (saved) {
        const parsed: AuthSession = JSON.parse(saved);
        if (
          parsed &&
          parsed.token &&
          (parsed.role === 'doctor' || parsed.role === 'pharmacy') &&
          parsed.verificationStatus === 'VERIFIED' &&
          (!parsed.expiresAt || parsed.expiresAt > Date.now())
        ) {
          return parsed;
        }
      }
    } catch (e) {
      // Invalid session format
    }
    return null;
  });

  const isAuthenticated = authSession !== null && (authSession.role === 'doctor' || authSession.role === 'pharmacy');

  const currentUser: CurrentUser = useMemo(() => {
    if (!authSession) {
      return { role: null, id: null };
    }
    return { role: authSession.role, id: authSession.userId };
  }, [authSession]);

  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    if (authSession?.role === 'doctor') return 'doctor';
    if (authSession?.role === 'pharmacy') return 'verify';
    return 'overview';
  });

  const [demoModalOpen, setDemoModalOpen] = useState(false);

  // Persistent doctors and pharmacies in localStorage
  const [doctors, setDoctors] = useState<MockDoctor[]>(() => {
    const saved = localStorage.getItem('rxverify_doctors');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* fallback */ }
    }
    return MOCK_DOCTORS;
  });

  const [pharmacies, setPharmacies] = useState<MockPharmacy[]>(() => {
    const saved = localStorage.getItem('rxverify_pharmacies');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* fallback */ }
    }
    return MOCK_PHARMACIES;
  });

  // Persistent pending registrations awaiting regulatory verification
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>(() => {
    const saved = localStorage.getItem('rxverify_pending_registrations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* fallback */ }
    }
    return INITIAL_PENDING_REGISTRATIONS;
  });

  const [showAdminFromLogin, setShowAdminFromLogin] = useState(false);

  // Active identity objects
  const activePharmacy: MockPharmacy = useMemo(() => {
    if (authSession?.role === 'pharmacy') {
      const match = pharmacies.find(p => p.id === authSession.userId || p.pcn === authSession.regNumber);
      if (match) return match;
    }
    return pharmacies[0];
  }, [authSession, pharmacies]);

  const activeDoctor: MockDoctor = useMemo(() => {
    if (authSession?.role === 'doctor') {
      const match = doctors.find(d => d.id === authSession.userId || d.mdcn === authSession.regNumber);
      if (match) return match;
    }
    return doctors[0];
  }, [authSession, doctors]);

  // Persistent state in localStorage
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem('rxverify_prescriptions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_PRESCRIPTIONS;
  });

  const [dispensingLogs, setDispensingLogs] = useState<DispensingLogEntry[]>(() => {
    const saved = localStorage.getItem('rxverify_dispensing_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_DISPENSING_LOGS;
  });

  useEffect(() => {
    localStorage.setItem('rxverify_doctors', JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem('rxverify_pharmacies', JSON.stringify(pharmacies));
  }, [pharmacies]);

  useEffect(() => {
    localStorage.setItem('rxverify_pending_registrations', JSON.stringify(pendingRegistrations));
  }, [pendingRegistrations]);

  useEffect(() => {
    localStorage.setItem('rxverify_prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem('rxverify_dispensing_logs', JSON.stringify(dispensingLogs));
  }, [dispensingLogs]);

  // Route Guard: enforce authentication & role-based route protection
  useEffect(() => {
    const enforceRouteProtection = () => {
      const rawHash = window.location.hash.replace('#', '').toLowerCase();

      // 1. Unauthenticated users cannot view ANY protected screens
      if (!authSession) {
        if (rawHash === 'doctor-login') {
          setCurrentTab('doctor-login');
          return;
        }
        if (rawHash === 'pharmacy-login') {
          setCurrentTab('pharmacy-login');
          return;
        }
        if (rawHash === 'overview' || rawHash === 'welcome' || rawHash === 'login' || !rawHash) {
          setCurrentTab('overview');
          return;
        }
        // Attempted unauthorized direct URL navigation to protected page!
        window.location.hash = '#welcome';
        setCurrentTab('overview');
        return;
      }

      // 2. Doctor role restrictions
      if (authSession.role === 'doctor') {
        if (rawHash === 'verify' || rawHash === 'locator' || rawHash === 'audit' || rawHash === 'overview') {
          window.location.hash = '#doctor';
          setCurrentTab('doctor');
          return;
        }
        if (rawHash === 'doctor' || rawHash === 'guidelines') {
          setCurrentTab(rawHash as NavTab);
          return;
        }
        setCurrentTab('doctor');
        return;
      }

      // 3. Pharmacy role restrictions
      if (authSession.role === 'pharmacy') {
        if (rawHash === 'doctor' || rawHash === 'overview') {
          window.location.hash = '#verify';
          setCurrentTab('verify');
          return;
        }
        if (rawHash === 'verify' || rawHash === 'locator' || rawHash === 'audit' || rawHash === 'guidelines') {
          setCurrentTab(rawHash as NavTab);
          return;
        }
        setCurrentTab('verify');
      }
    };

    enforceRouteProtection();
    window.addEventListener('hashchange', enforceRouteProtection);
    return () => window.removeEventListener('hashchange', enforceRouteProtection);
  }, [authSession]);

  // Tab Selection Guard
  const handleSelectTab = (tab: NavTab) => {
    if (!authSession) {
      if (tab === 'doctor-login' || tab === 'pharmacy-login' || tab === 'overview') {
        setCurrentTab(tab);
        window.location.hash = `#${tab === 'overview' ? 'welcome' : tab}`;
      } else {
        setCurrentTab('overview');
        window.location.hash = '#welcome';
      }
      return;
    }

    // Role-based restrictions
    if (authSession.role === 'doctor' && tab !== 'doctor' && tab !== 'guidelines') {
      return;
    }
    if (authSession.role === 'pharmacy' && tab === 'doctor') {
      return;
    }

    setCurrentTab(tab);
    window.location.hash = `#${tab}`;
  };

  // Handle Login with Session Token & Role Enforcement
  const handleLogin = (role: 'doctor' | 'pharmacy', id: string, sessionData: AuthSession) => {
    // Persist session securely
    sessionStorage.setItem('rxverify_auth_session', JSON.stringify(sessionData));
    localStorage.setItem('rxverify_auth_session', JSON.stringify(sessionData));
    localStorage.setItem('rxverify_current_user', JSON.stringify({ role, id }));

    setAuthSession(sessionData);
    setShowAdminFromLogin(false);

    // Call backend login endpoint in background for token tracking
    fetch(`/api/auth/${role}-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: sessionData.name,
        mdcnNumber: sessionData.regNumber,
        pharmacyName: sessionData.name,
        pcnNumber: sessionData.regNumber,
        verificationStatus: 'VERIFIED',
      }),
    }).catch(() => {});

    // Route directly to appropriate dashboard
    const destinationTab: NavTab = role === 'doctor' ? 'doctor' : 'verify';
    setCurrentTab(destinationTab);
    window.location.hash = `#${destinationTab}`;
  };

  // Secure Logout: Clears session, resets history, and returns to public screen
  const handleLogout = () => {
    if (authSession?.token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authSession.token}` },
      }).catch(() => {});
    }

    sessionStorage.removeItem('rxverify_auth_session');
    localStorage.removeItem('rxverify_auth_session');
    localStorage.removeItem('rxverify_current_user');

    setAuthSession(null);
    setCurrentTab('overview');

    // Prevent access using browser back button
    window.location.hash = '#welcome';
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handleNavigateToLogin = (role?: 'doctor' | 'pharmacy') => {
    if (role === 'doctor') {
      handleSelectTab('doctor-login');
    } else if (role === 'pharmacy') {
      handleSelectTab('pharmacy-login');
    } else {
      handleSelectTab('overview');
    }
  };

  const handleSwitchPharmacy = (pharmacy: MockPharmacy) => {
    if (authSession?.role === 'pharmacy') {
      const updatedSession: AuthSession = {
        ...authSession,
        userId: pharmacy.id,
        name: pharmacy.name,
        regNumber: pharmacy.pcn,
      };
      setAuthSession(updatedSession);
      sessionStorage.setItem('rxverify_auth_session', JSON.stringify(updatedSession));
      localStorage.setItem('rxverify_auth_session', JSON.stringify(updatedSession));
    }
  };

  // Submission handler: Doctor Registration (sets status PENDING_VERIFICATION)
  const handleSubmitDoctorRegistration = (data: {
    fullName: string;
    mdcnNumber: string;
    phone: string;
    email: string;
    specialty: string;
    clinicName: string;
  }): PendingRegistration => {
    const newReg: PendingRegistration = {
      id: `reg-doc-${Date.now()}`,
      type: 'doctor',
      status: 'PENDING_VERIFICATION',
      submittedAt: new Date().toISOString(),
      ...data,
    };
    setPendingRegistrations(prev => [newReg, ...prev]);
    return newReg;
  };

  // Submission handler: Pharmacy Registration (sets status PENDING_VERIFICATION)
  const handleSubmitPharmacyRegistration = (data: {
    pharmacyName: string;
    pcnNumber: string;
    phone: string;
    email: string;
    address: string;
    state: string;
  }): PendingRegistration => {
    const newReg: PendingRegistration = {
      id: `reg-pharm-${Date.now()}`,
      type: 'pharmacy',
      status: 'PENDING_VERIFICATION',
      submittedAt: new Date().toISOString(),
      ...data,
    };
    setPendingRegistrations(prev => [newReg, ...prev]);
    return newReg;
  };

  // Admin Verification: Confirm Doctor
  const handleConfirmDoctor = (reg: PendingRegistration) => {
    const newDoctor: MockDoctor = {
      id: `doc-${Date.now()}`,
      name: reg.fullName || 'Dr. Verified Clinician',
      mdcn: reg.mdcnNumber || 'MDCN/R/00000',
      hospital: reg.clinicName || 'Accredited Medical Center',
      phone: reg.phone || '+234 800 000 0000',
      email: reg.email || '',
      specialty: reg.specialty || 'General Practitioner',
      verifiedAt: new Date().toISOString(),
      verificationStatus: 'VERIFIED',
      statusNotes: 'Accredited by Medical and Dental Council of Nigeria (MDCN).'
    };

    setDoctors(prev => [newDoctor, ...prev.filter(d => d.mdcn !== newDoctor.mdcn)]);
    setPendingRegistrations(prev =>
      prev.map(r => r.id === reg.id ? { ...r, status: 'VERIFIED', reviewedAt: new Date().toISOString() } : r)
    );
  };

  // Admin Verification: Confirm Pharmacy
  const handleConfirmPharmacy = (reg: PendingRegistration) => {
    const newPharmacy: MockPharmacy = {
      id: `pharm-${Date.now()}`,
      name: reg.pharmacyName || 'Accredited Community Pharmacy',
      pcn: reg.pcnNumber || 'PCN/R/00000',
      pcnPremisesNumber: `PCN/${(reg.state || 'LA').slice(0, 2).toUpperCase()}/PREM/${Date.now().toString().slice(-4)}`,
      address: reg.address || 'Commercial Avenue',
      city: reg.city || 'Central District',
      state: reg.state || 'Lagos State',
      phone: reg.phone || '+234 800 000 0000',
      email: reg.email || '',
      supervisingPharmacist: 'Superintendent Pharmacist (Council Verified)',
      pharmacistPCN: reg.pcnNumber || 'PCN/R/00000',
      verifiedAt: new Date().toISOString(),
      lat: 6.5244,
      lng: 3.3792,
      distanceKm: 2.1,
      operatingStatus: 'OPEN',
      services: ['Controlled Drug Dispensing', 'Pharmacist Consultation'],
      verificationStatus: 'VERIFIED',
      statusNotes: 'Accredited premise under the Pharmacy Council of Nigeria (PCN).'
    };

    setPharmacies(prev => [newPharmacy, ...prev.filter(p => p.pcn !== newPharmacy.pcn)]);
    setPendingRegistrations(prev =>
      prev.map(r => r.id === reg.id ? { ...r, status: 'VERIFIED', reviewedAt: new Date().toISOString() } : r)
    );
  };

  // Admin Verification: Reject Registration
  const handleRejectRegistration = (id: string, reason: string) => {
    setPendingRegistrations(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'REJECTED', reviewedAt: new Date().toISOString(), rejectionReason: reason } : r)
    );
  };

  // Count pending renewal requests for Doctor Portal badge (scoped to doctor if doctor is logged in)
  let pendingRenewalCount = 0;
  prescriptions.forEach(p => {
    if (currentUser.role === 'doctor' && p.doctorMDCN !== activeDoctor.mdcn) {
      return;
    }
    if (p.refillRequests) {
      p.refillRequests.forEach(r => {
        if (r.status === 'PENDING') pendingRenewalCount++;
      });
    }
  });

  // Handler: Successful counter dispensation
  const handleDispenseSuccess = (prescription: Prescription, batchNumber: string) => {
    const timestamp = new Date().toISOString();

    // 1. Update prescription status to FILLED
    setPrescriptions(prev => prev.map(p => {
      if (p.id === prescription.id) {
        return {
          ...p,
          status: 'FILLED',
          filledDetails: {
            filledAt: timestamp,
            pharmacyName: activePharmacy.name,
            pharmacistName: activePharmacy.supervisingPharmacist.split(',')[0],
            pharmacistPCN: activePharmacy.pharmacistPCN,
            batchNumber,
            locationState: activePharmacy.state,
          },
        };
      }
      return p;
    }));

    // 2. Record in immutable PCN log
    const newLog: DispensingLogEntry = {
      id: `log-${Date.now()}`,
      timestamp,
      rxCode: prescription.code,
      patientName: prescription.patientName,
      patientPhone: prescription.patientPhone,
      drugName: `${prescription.drugName} (${prescription.strength})`,
      quantity: prescription.quantity,
      prescribingDoctor: prescription.doctorName,
      doctorMDCN: prescription.doctorMDCN,
      dispensingPharmacist: activePharmacy.supervisingPharmacist.split(',')[0],
      pharmacistPCN: activePharmacy.pharmacistPCN,
      pharmacyName: activePharmacy.name,
      pharmacyState: activePharmacy.state,
      outcome: 'DISPENSED',
      batchNumber,
      notes: `Verified at counter. Dispensed ${prescription.quantity}. Verified patient identity against MDCN digital record.`,
      pcnReportStatus: 'VERIFIED_AUDIT_LOGGED',
    };

    setDispensingLogs(prev => [newLog, ...prev]);
  };

  // Handler: Expired prescription renewal request sent from pharmacy
  const handleRequestRefill = (rxCode: string, pharmacyNote: string) => {
    const timestamp = new Date().toISOString();

    setPrescriptions(prev => prev.map(p => {
      if (p.code.toUpperCase() === rxCode.toUpperCase()) {
        const newReq = {
          id: `refill-${Date.now()}`,
          requestedAt: timestamp,
          pharmacyName: activePharmacy.name,
          pharmacistPCN: activePharmacy.pharmacistPCN,
          status: 'PENDING' as const,
          note: pharmacyNote,
        };
        const existing = p.refillRequests || [];
        return {
          ...p,
          refillRequests: [newReq, ...existing],
        };
      }
      return p;
    }));

    // Also log in pharmacy audit
    const targetRx = prescriptions.find(p => p.code.toUpperCase() === rxCode.toUpperCase());
    if (targetRx) {
      const newLog: DispensingLogEntry = {
        id: `log-${Date.now()}`,
        timestamp,
        rxCode,
        patientName: targetRx.patientName,
        patientPhone: targetRx.patientPhone,
        drugName: targetRx.drugName,
        quantity: targetRx.quantity,
        prescribingDoctor: targetRx.doctorName,
        doctorMDCN: targetRx.doctorMDCN,
        dispensingPharmacist: activePharmacy.supervisingPharmacist.split(',')[0],
        pharmacistPCN: activePharmacy.pharmacistPCN,
        pharmacyName: activePharmacy.name,
        pharmacyState: activePharmacy.state,
        outcome: 'EXPIRED_RENEWAL_REQUESTED',
        notes: `Prescription expired. Digital renewal request forwarded to ${targetRx.doctorName}. Sale pending prescriber authorization.`,
        pcnReportStatus: 'VERIFIED_AUDIT_LOGGED',
      };
      setDispensingLogs(prev => [newLog, ...prev]);
    }
  };

  // Handler: Doctor approves or declines refill in Doctor Portal
  const handleApproveRefill = (rxCode: string, requestId: string, approved: boolean, note: string) => {
    setPrescriptions(prev => prev.map(p => {
      if (p.code.toUpperCase() === rxCode.toUpperCase()) {
        const updatedRequests = (p.refillRequests || []).map(r => {
          if (r.id === requestId) {
            return {
              ...r,
              status: approved ? ('APPROVED' as const) : ('REJECTED' as const),
              respondedAt: new Date().toISOString(),
              note: `${r.note} | Doctor Note: ${note}`,
            };
          }
          return r;
        });

        if (approved) {
          const newExpiry = new Date();
          newExpiry.setDate(newExpiry.getDate() + 5);
          return {
            ...p,
            status: 'VALID_UNFILLED',
            expiryDate: newExpiry.toISOString(),
            refillsRemaining: Math.max(0, p.refillsRemaining - 1),
            refillRequests: updatedRequests,
          };
        } else {
          return {
            ...p,
            refillRequests: updatedRequests,
          };
        }
      }
      return p;
    }));

    alert(approved ? `Refill authorized! Prescription ${rxCode} is now marked VALID & UNFILLED for dispensing at ${activePharmacy.name}.` : `Refill declined: ${note}`);
  };

  // Handler: Doctor issues new prescription in Doctor Portal
  const handleIssuePrescription = (newRxData: Omit<Prescription, 'id' | 'qrPayload'>): Prescription => {
    const newRx: Prescription = {
      ...newRxData,
      id: `rx-${Date.now()}`,
      qrPayload: `RXVERIFY:NG:${newRxData.code}:${newRxData.doctorMDCN}:${newRxData.drugName}:${newRxData.patientName}`,
    };

    setPrescriptions(prev => [newRx, ...prev]);
    return newRx;
  };

  // Handler: Doctor cancels active prescription
  const handleCancelPrescription = (rxCode: string, reason: string) => {
    setPrescriptions(prev => prev.map(p => {
      if (p.code === rxCode) {
        return {
          ...p,
          status: 'CANCELLED',
        };
      }
      return p;
    }));

    const targetRx = prescriptions.find(p => p.code === rxCode);
    const newLog: DispensingLogEntry = {
      id: `log-cancel-${Date.now()}`,
      timestamp: new Date().toISOString(),
      rxCode,
      patientName: targetRx?.patientName || 'N/A',
      patientPhone: targetRx?.patientPhone || '',
      drugName: targetRx?.drugName || '',
      quantity: '0 (Revoked)',
      prescribingDoctor: activeDoctor.name,
      doctorMDCN: activeDoctor.mdcn,
      dispensingPharmacist: 'System Anti-Diversion Registry',
      pharmacistPCN: 'PCN/CENTRAL/REG',
      pharmacyName: 'Central Registry Lock',
      pharmacyState: 'Nigeria',
      outcome: 'PRESCRIPTION_CANCELLED',
      notes: `Prescription revoked by prescriber ${activeDoctor.name}: ${reason}`,
      pcnReportStatus: 'VERIFIED_AUDIT_LOGGED',
    };
    setDispensingLogs(prev => [newLog, ...prev]);
    alert(`Prescription ${rxCode} has been formally cancelled and locked against dispensing nationwide.`);
  };

  // Handler: Suggest OTC Alternative & Record Sale
  const handleSelectOTCAlternative = (alternative: OTCAlternative, originalDrug: string) => {
    const newLog: DispensingLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      rxCode: 'OTC-CONVERSION',
      patientName: 'Walk-in Customer (Counseled)',
      patientPhone: '+234 800 000 0000',
      drugName: `${alternative.otcName} (Alternative for ${originalDrug})`,
      quantity: '1 Full Course',
      prescribingDoctor: 'N/A (Pharmacist OTC Counseling)',
      doctorMDCN: 'N/A',
      dispensingPharmacist: activePharmacy.supervisingPharmacist.split(',')[0],
      pharmacistPCN: activePharmacy.pharmacistPCN,
      pharmacyName: activePharmacy.name,
      pharmacyState: activePharmacy.state,
      outcome: 'OTC_ALTERNATIVE_OFFERED',
      notes: `Customer counseled on safer non-habit forming alternative: ${alternative.otcName}. Completed OTC sale without controlled drug diversion.`,
      pcnReportStatus: 'VERIFIED_AUDIT_LOGGED',
    };

    setDispensingLogs(prev => [newLog, ...prev]);
    alert(`OTC Alternative "${alternative.otcName}" selected! Sale completed and logged.`);
    setCurrentTab('audit');
  };

  const [counterInitialCode, setCounterInitialCode] = useState('RX-9421-VAL');

  // Handler: Demo Scenario selection
  const handleTriggerScenario = (scenarioId: string) => {
    if (scenarioId === 'valid') {
      setCounterInitialCode('RX-9421-VAL');
      setCurrentTab('verify');
    } else if (scenarioId === 'duplicate') {
      setCounterInitialCode('RX-7823-DUP');
      setCurrentTab('verify');
    } else if (scenarioId === 'expired') {
      setCounterInitialCode('RX-3310-EXP');
      setCurrentTab('verify');
    } else if (scenarioId === 'unverified') {
      setCounterInitialCode('RX-9999-FAKE');
      setCurrentTab('verify');
    } else if (scenarioId === 'mismatch') {
      setCounterInitialCode('RX-5542-ALT');
      setCurrentTab('verify');
    }
  };

  const pendingAdminCount = pendingRegistrations.filter(
    r => r.status === 'PENDING_VERIFICATION'
  ).length;

  return (
    <div className="min-h-screen bg-[#F7FAF6] text-slate-900 flex flex-col font-sans relative pb-24 md:pb-6">
      {/* PWA Install Banner */}
      <PWAInstallButton variant="banner" />

      {/* Offline Status Bar */}
      <OfflineIndicator />

      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        pendingRenewalCount={pendingRenewalCount}
        currentUser={currentUser}
        currentDoctor={activeDoctor}
        currentPharmacy={activePharmacy}
        isAuthenticated={isAuthenticated}
        onOpenLogin={() => handleNavigateToLogin()}
        onLogout={handleLogout}
      />

      {/* Main Screen Views */}
      <main className="flex-1">
        {!isAuthenticated ? (
          /* Public Area: Separate full-page screens, not pop-ups */
          currentTab === 'doctor-login' ? (
            <LoginScreen
              doctors={doctors}
              pharmacies={pharmacies}
              initialRole="doctor"
              onLogin={handleLogin}
              onBack={() => handleSelectTab('overview')}
              onSwitchRole={(role) => handleSelectTab(role === 'doctor' ? 'doctor-login' : 'pharmacy-login')}
            />
          ) : currentTab === 'pharmacy-login' ? (
            <LoginScreen
              doctors={doctors}
              pharmacies={pharmacies}
              initialRole="pharmacy"
              onLogin={handleLogin}
              onBack={() => handleSelectTab('overview')}
              onSwitchRole={(role) => handleSelectTab(role === 'doctor' ? 'doctor-login' : 'pharmacy-login')}
            />
          ) : (
            <PublicWelcomeScreen
              onSelectDoctorLogin={() => handleSelectTab('doctor-login')}
              onSelectPharmacyLogin={() => handleSelectTab('pharmacy-login')}
              onOpenLogin={handleNavigateToLogin}
            />
          )
        ) : (
          /* Protected Role-Scoped Dashboards */
          <>
            {authSession.role === 'doctor' && (
              <DoctorPortal
                currentDoctor={activeDoctor}
                prescriptions={prescriptions}
                onIssuePrescription={handleIssuePrescription}
                onApproveRefill={handleApproveRefill}
                onCancelPrescription={handleCancelPrescription}
              />
            )}

            {authSession.role === 'pharmacy' && (
              <>
                {currentTab === 'verify' && (
                  <PharmacistVerification
                    initialCode={counterInitialCode}
                    currentPharmacy={activePharmacy}
                    pharmacies={pharmacies}
                    onSwitchPharmacy={handleSwitchPharmacy}
                    prescriptions={prescriptions}
                    onDispenseSuccess={handleDispenseSuccess}
                    onRequestRefill={handleRequestRefill}
                    onSelectOTCAlternative={handleSelectOTCAlternative}
                  />
                )}

                {currentTab === 'locator' && (
                  <PharmacyLocator
                    pharmacies={pharmacies}
                    currentPharmacy={activePharmacy}
                    onSelectPharmacyForDispense={(pharm) => {
                      handleSwitchPharmacy(pharm);
                      setCurrentTab('verify');
                    }}
                    onNavigateToCounter={(pharmId) => {
                      if (pharmId) {
                        const match = pharmacies.find(p => p.id === pharmId);
                        if (match) handleSwitchPharmacy(match);
                      }
                      setCurrentTab('verify');
                    }}
                  />
                )}

                {currentTab === 'audit' && (
                  <DispensingLog 
                    logs={dispensingLogs} 
                    currentPharmacy={activePharmacy}
                  />
                )}
              </>
            )}

            {currentTab === 'guidelines' && (
              <GuidelinesView />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Handheld touch navigation) */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        pendingRenewalCount={pendingRenewalCount}
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        onOpenLogin={() => handleNavigateToLogin()}
      />

      {/* Demo Day Scenarios Modal */}
      <DemoScenariosModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onTriggerScenario={handleTriggerScenario}
      />

      {/* Role-Scoped Footer: Rendered only when authenticated */}
      {isAuthenticated && (
        <footer className="bg-white border-t border-emerald-100 text-slate-500 text-xs py-4 px-4 sm:px-6 mt-auto hidden md:block">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="font-heading font-bold text-[#1B4332]">RxVerify Nigeria</span>
              <span>&bull;</span>
              <span className="text-[11px] text-slate-500">
                {authSession.role === 'doctor'
                  ? `Authenticated Doctor Session: ${activeDoctor.name} (${activeDoctor.mdcn})`
                  : `Authenticated Pharmacy Session: ${activePharmacy.name} (${activePharmacy.pcn})`}
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              {authSession.role === 'doctor' ? (
                <>
                  <button
                    onClick={() => handleSelectTab('doctor')}
                    className="text-[#1B4332] font-semibold hover:underline cursor-pointer"
                  >
                    Doctor Prescriber Desk
                  </button>
                  <span>&bull;</span>
                  <button
                    onClick={() => handleSelectTab('guidelines')}
                    className="text-slate-700 hover:text-slate-900 font-medium hover:underline cursor-pointer"
                  >
                    Prescribing Guidelines
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleSelectTab('verify')}
                    className="text-[#1B4332] font-semibold hover:underline cursor-pointer"
                  >
                    Pharmacy Counter
                  </button>
                  <span>&bull;</span>
                  <button
                    onClick={() => handleSelectTab('locator')}
                    className="text-slate-700 hover:text-slate-900 font-medium hover:underline cursor-pointer"
                  >
                    Pharmacy Locator
                  </button>
                  <span>&bull;</span>
                  <button
                    onClick={() => handleSelectTab('audit')}
                    className="text-slate-700 hover:text-slate-900 font-medium hover:underline cursor-pointer"
                  >
                    Dispensing Log
                  </button>
                </>
              )}
              <span>&bull;</span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 font-bold hover:underline cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
