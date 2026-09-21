import React from 'react';
import { 
  ScanLine, 
  Stethoscope, 
  MapPin, 
  ClipboardList, 
  ShieldCheck,
  LogIn,
  LogOut,
  Building2,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { CurrentUser, MockDoctor, MockPharmacy, NavTab } from '../types';

export type { NavTab };

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingRenewalCount: number;
  currentUser: CurrentUser;
  currentDoctor?: MockDoctor;
  currentPharmacy?: MockPharmacy;
  isAuthenticated: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentTab, 
  onSelectTab, 
  pendingRenewalCount,
  currentUser,
  currentDoctor,
  currentPharmacy,
  isAuthenticated,
  onOpenLogin,
  onLogout,
}) => {
  // Build role-scoped navigation tabs
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [];

  if (isAuthenticated) {
    if (currentUser.role === 'doctor') {
      // Doctors ONLY get Doctor Prescriber tab
      navItems.push({ 
        id: 'doctor', 
        label: 'Doctor Prescriber', 
        icon: <Stethoscope className="w-3.5 h-3.5" />, 
        badge: pendingRenewalCount > 0 ? pendingRenewalCount : undefined 
      });
    } else if (currentUser.role === 'pharmacy') {
      // Pharmacies ONLY get Pharmacy Counter, Locator & Dispensing Log
      navItems.push(
        { 
          id: 'verify', 
          label: 'Pharmacy Counter', 
          icon: <ScanLine className="w-3.5 h-3.5 text-[#B5D99B]" /> 
        },
        { 
          id: 'locator', 
          label: 'Pharmacy Locator', 
          icon: <MapPin className="w-3.5 h-3.5" /> 
        },
        { 
          id: 'audit', 
          label: 'Dispensing Log', 
          icon: <ClipboardList className="w-3.5 h-3.5" /> 
        }
      );
    }
  }

  const activeName = currentUser.role === 'doctor'
    ? currentDoctor?.name || 'Dr. Funke Adeyemi'
    : currentPharmacy?.name || 'Medplus Pharmacy (Ikeja)';

  const councilLabel = currentUser.role === 'doctor'
    ? (currentDoctor?.mdcn || 'MDCN Verified')
    : (currentPharmacy?.pcn || 'PCN Certified');

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-emerald-100/90 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Identity */}
          <div 
            id="brand-header" 
            onClick={() => {
              if (isAuthenticated) {
                onSelectTab(currentUser.role === 'doctor' ? 'doctor' : 'verify');
              } else {
                onSelectTab('overview');
              }
            }} 
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="w-9 h-9 bg-[#1B4332] text-[#B5D99B] rounded-2xl flex items-center justify-center font-heading font-extrabold text-sm shadow-xs border border-emerald-800">
              <ShieldCheck className="w-5 h-5 text-[#B5D99B]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-slate-900 leading-none">
                  RxVerify
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#EBF7E5] text-[#1B4332] text-[9px] font-extrabold uppercase tracking-wider">
                  Nigeria
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Tab Navigation (Strictly Role-Protected: Only shown if authenticated) */}
          {isAuthenticated && navItems.length > 0 && (
            <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => onSelectTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#1B4332] text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-[#F4F9F1]'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                        isActive ? 'bg-[#B5D99B] text-[#1B4332]' : 'bg-amber-500 text-slate-900'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* User Status / Action Area */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Authenticated Role & Identity Badge */}
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-emerald-50/90 border border-emerald-200/80 rounded-xl text-left">
                  <div className="w-6 h-6 rounded-lg bg-[#1B4332] text-[#B5D99B] flex items-center justify-center shrink-0 text-xs">
                    {currentUser.role === 'doctor' ? (
                      <Stethoscope className="w-3.5 h-3.5" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="max-w-[170px] truncate">
                    <div className="text-[11px] font-bold text-slate-900 truncate">
                      {activeName}
                    </div>
                    <div className="text-[9px] font-semibold text-emerald-700 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      <span className="truncate">{councilLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Secure Logout Button */}
                <button
                  type="button"
                  id="nav-logout-btn"
                  onClick={onLogout}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs border border-slate-200 transition-all cursor-pointer"
                  title="Sign out of verified session"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-600" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              /* Public / Unauthenticated Navigation Button */
              currentTab === 'doctor-login' || currentTab === 'pharmacy-login' ? (
                <button
                  type="button"
                  id="nav-back-welcome-btn"
                  onClick={() => onSelectTab('overview')}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs border border-slate-200 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#1B4332]" />
                  <span>Back to Role Selection</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="nav-login-btn"
                  onClick={onOpenLogin}
                  className="px-4 py-2 bg-[#1B4332] hover:bg-[#143427] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all hover:scale-[1.02] cursor-pointer border border-emerald-900"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#B5D99B]" />
                  <span>Welcome / Login</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
