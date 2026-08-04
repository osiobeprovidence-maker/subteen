import React, { useEffect } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { convex } from '../../convex';
import { auth } from '../../lib/firebase';

export const ConvexAuthBridge = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          convex.setAuth(() => Promise.resolve(token));
        } catch {
          convex.clearAuth();
        }
      } else {
        convex.clearAuth();
      }
    });
    return () => {
      unsubscribe();
      convex.clearAuth();
    };
  }, []);

  return <>{children}</>;
};
