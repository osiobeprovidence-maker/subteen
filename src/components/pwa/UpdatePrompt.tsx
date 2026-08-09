import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { listenForUpdates, applyUpdate } from '../../lib/pwa';

export const UpdatePrompt = () => {
  const [available, setAvailable] = useState(false);

  useEffect(() => listenForUpdates(setAvailable), []);

  return (
    <AnimatePresence>
      {available && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'tween', duration: 0.25 }}
          className="fixed inset-x-0 z-[60] p-4 flex justify-center pointer-events-none pwa-floating"
          style={{ bottom: '4.75rem' }}
        >
          <div className="pointer-events-auto flex items-center gap-4 bg-zinc-950/95 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3.5 shadow-2xl shadow-black/60">
            <p className="text-white text-xs font-black uppercase tracking-widest whitespace-nowrap">
              New version available
            </p>
            <button
              onClick={applyUpdate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B8FF4D] text-black text-xs font-black uppercase tracking-widest hover:bg-white transition-colors"
            >
              <RefreshCw size={14} /> Update
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
