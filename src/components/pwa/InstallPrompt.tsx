import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { X, Plus, Download } from 'lucide-react';
import { usePwaInstall } from '../../hooks/usePwa';
import { cn } from '../../lib/utils';

export const InstallPrompt = () => {
  const { canShow, install, dismiss, isIOS } = usePwaInstall();
  const { pathname } = useLocation();
  const [showIosHelp, setShowIosHelp] = useState(false);

  const hiddenPath = pathname.startsWith('/admin') || pathname.startsWith('/editor');

  if (!canShow || hiddenPath) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'tween', duration: 0.25 }}
          className="fixed inset-x-0 z-[60] p-4 flex justify-center pointer-events-none pwa-floating"
          style={{ bottom: '1rem' }}
        >
          <div className="pointer-events-auto w-full max-w-sm bg-zinc-950/95 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/60">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src="/icons/icon-192.png" alt="" className="w-11 h-11 rounded-xl" />
                <div>
                  <p className="text-white font-black text-sm tracking-tight">
                    INSTALL SUBTEEN
                  </p>
                  <p className="text-zinc-400 text-xs mt-0.5 leading-snug">
                    Get the full Subteen experience on your device.
                  </p>
                </div>
              </div>
              <button
                onClick={dismiss}
                aria-label="Not now"
                className="text-zinc-500 hover:text-white transition-colors p-1 shrink-0"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => {
                  if (isIOS) {
                    setShowIosHelp(true);
                  } else {
                    install();
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#B8FF4D] text-black text-xs font-black uppercase tracking-widest hover:bg-white transition-colors"
              >
                <Download size={16} /> Install
              </button>
              <button
                onClick={dismiss}
                className="px-4 py-3 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {showIosHelp && (
        <div
          className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-6"
          onClick={() => setShowIosHelp(false)}
        >
          <div
            className="bg-zinc-950 border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white font-black text-sm uppercase tracking-widest">
              Add Subteen to your Home Screen
            </p>
            <ol className="text-zinc-400 text-sm space-y-3 leading-relaxed">
              <li>
                <span className="inline-flex items-center gap-1.5">
                  Tap the <Plus size={14} className="inline" /> <b>Share</b> button in Safari.
                </span>
              </li>
              <li>
                Scroll and tap <b>Add to Home Screen</b>.
              </li>
              <li>
                Tap <b>Add</b> to install Subteen.
              </li>
            </ol>
            <button
              onClick={() => {
                setShowIosHelp(false);
                dismiss();
              }}
              className={cn(
                'w-full py-3 rounded-xl bg-[#B8FF4D] text-black text-xs font-black uppercase tracking-widest hover:bg-white transition-colors',
              )}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
