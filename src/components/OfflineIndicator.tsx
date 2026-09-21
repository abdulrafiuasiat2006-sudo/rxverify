import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div 
      id="offline-status-banner"
      className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-2.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-lg animate-fade-in"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <div className="flex-1">
        <span className="font-semibold">Offline Mode</span>
        <span className="text-amber-100 block text-[11px]">PCN audit cache active. Actions will sync upon reconnecting.</span>
      </div>
    </div>
  );
};
