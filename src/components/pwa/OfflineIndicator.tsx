import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useOnlineStatus } from '../../hooks/usePwa';

export const OfflineIndicator = () => {
  const online = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    if (!online) {
      setWasOffline(true);
      setShowBack(false);
    } else if (wasOffline) {
      setShowBack(true);
      const t = setTimeout(() => {
        setShowBack(false);
        setWasOffline(false);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [online, wasOffline]);

  return (
    <AnimatePresence>
      {!online || showBack ? (
        <motion.div
          key={!online ? 'offline' : 'back'}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className="fixed left-1/2 -translate-x-1/2 z-[65] pwa-floating"
          style={{ bottom: '1.25rem' }}
        >
          <div
            className={
              !online
                ? 'flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-black/50'
                : 'flex items-center gap-2 px-4 py-2 rounded-full bg-[#B8FF4D] text-black text-[11px] font-black uppercase tracking-widest shadow-lg shadow-black/50'
            }
          >
            {!online ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                OFFLINE
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                BACK ONLINE
              </>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
