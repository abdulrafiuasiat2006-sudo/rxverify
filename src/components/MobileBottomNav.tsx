import React from 'react';
import { 
  ScanLine, 
  Stethoscope, 
  MapPin, 
  ClipboardList, 
  ShieldCheck,
  LogIn,
  ArrowLeft
} from 'lucide-react';
import { NavTab, CurrentUser } from '../types';

interface MobileBottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingRenewalCount: number;
  currentUser: CurrentUser;
  isAuthenticated: boolean;
  onOpenLogin: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  pendingRenewalCount,
  currentUser,
  isAuthenticated,
  onOpenLogin,
}) => {
  // If unauthenticated, do not display protected navigation items on mobile bottom nav
  if (!isAuthenticated) {
    const isLoginScreen = currentTab === 'doctor-login' || currentTab === 'pharmacy-login';
    return (
      <nav 
        className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-emerald-100 px-4 py-2.5 flex items-center justify-between md:hidden shadow-lg"
        aria-label="Mobile Public Bottom Bar"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>{isLoginScreen ? (currentTab === 'doctor-login' ? 'Doctor Login' : 'Pharmacy Login') : 'Accredited Login Required'}</span>
        </div>
        {isLoginScreen ? (
          <button
            type="button"
            id="mobile-back-role-btn"
            onClick={() => onSelectTab('overview')}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#1B4332]" />
            <span>Role Selection</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenLogin}
            className="px-4 py-2 bg-[#1B4332] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5 text-[#B5D99B]" />
            <span>Sign In</span>
          </button>
        )}
      </nav>
    );
  }

  // Build role-scoped items
  const navItems = [];

  if (currentUser.role === 'doctor') {
    navItems.push({
      id: 'doctor' as NavTab,
      label: 'Prescriber',
      sublabel: 'Doctor Desk',
      icon: Stethoscope,
      badge: pendingRenewalCount,
    });
  } else if (currentUser.role === 'pharmacy') {
    navItems.push(
      {
        id: 'verify' as NavTab,
        label: 'Counter',
        sublabel: 'Verify Rx',
        icon: ScanLine,
        badge: 0,
      },
      {
        id: 'locator' as NavTab,
        label: 'Locator',
        sublabel: 'Pharmacies',
        icon: MapPin,
        badge: 0,
      },
      {
        id: 'audit' as NavTab,
        label: 'Log',
        sublabel: 'Dispensed',
        icon: ClipboardList,
        badge: 0,
      }
    );
  }

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-emerald-100 px-2 py-1 flex items-center justify-around md:hidden shadow-lg"
      aria-label="Mobile Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            id={`mobile-nav-${item.id}`}
            onClick={() => onSelectTab(item.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              isActive 
                ? 'text-[#1B4332] font-bold' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <div className={`relative p-1 rounded-lg ${isActive ? 'bg-[#EBF7E5]' : ''}`}>
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#1B4332]' : 'text-slate-600'}`} />
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-slate-900 text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight leading-none mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
