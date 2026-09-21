import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  // If already installed in standalone mode, do not render
  if (isInstalled) {
    return null;
  }

  // If banner variant and dismissed, return null
  if (variant === 'banner' && dismissedBanner) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General instructions for desktop/mobile browsers that haven't triggered beforeinstallprompt yet
      setShowIOSGuide(true);
    }
  };

  if (variant === 'banner') {
    return (
      <>
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-[11px] shrink-0">
              Rx
            </div>
            <div>
              <p className="font-semibold text-slate-100">Install RxVerify Mobile App</p>
              <p className="text-[11px] text-slate-400">Add to home screen for instant camera barcode scanning &amp; offline logs.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="pwa-banner-install-btn"
              onClick={handleInstallClick}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
            <button
              onClick={() => setDismissedBanner(true)}
              className="p-1 text-slate-400 hover:text-white rounded"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* iOS / General Install Guide Modal */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl text-slate-900">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-slate-900 text-white rounded-md flex items-center justify-center font-bold text-xs">
                    Rx
                  </div>
                  <h3 className="font-heading font-bold text-sm text-slate-900">Install RxVerify Mobile App</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 mb-5">
                <p className="text-slate-700 font-medium">
                  Add this application to your phone's Home Screen for native full-screen performance:
                </p>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
                    <span>Tap the <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-slate-800" /> in your mobile browser toolbar (Safari or Chrome).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
                    <span>Scroll down and tap <strong>"Add to Home Screen"</strong> with the Rx icon.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[11px] shrink-0">3</span>
                    <span>Tap <strong>Add</strong> in the top-right corner to finish.</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Compact variant (e.g. for header)
  return (
    <>
      <button
        id="pwa-install-compact-btn"
        type="button"
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
        title="Install as Mobile App"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </button>

      {/* iOS / General Install Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-slate-900 text-white rounded-md flex items-center justify-center font-bold text-xs">
                  Rx
                </div>
                <h3 className="font-heading font-bold text-sm text-slate-900">Install RxVerify Mobile App</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 mb-5">
              <p className="text-slate-700 font-medium">
                Add this application to your phone's Home Screen for native full-screen performance:
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
                  <span>Tap the <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-slate-800" /> in Safari or browser menu <span className="font-mono">&vellip;</span>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
                  <span>Tap <strong>"Add to Home Screen"</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[11px] shrink-0">3</span>
                  <span>Tap <strong>Add</strong> to launch with native mobile icons &amp; offline support.</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
