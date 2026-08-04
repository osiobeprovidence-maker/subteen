import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  signOut,
  User,
} from 'firebase/auth';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Doc } from '../../convex/_generated/dataModel';
import { auth } from '../lib/firebase';
import type { Role } from '../lib/roles';

interface AuthUser {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  user: AuthUser | null;
  dbUser: Doc<'users'> | null;
  role: Role;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toAuthUser = (u: User): AuthUser => ({
  uid: u.uid,
  name: u.displayName ?? (u.email?.split('@')[0] ?? 'Player'),
  email: u.email ?? '',
  photoURL: u.photoURL ?? undefined,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [dbUser, setDbUser] = useState<Doc<'users'> | null>(null);
  const syncUser = useMutation(api.users.upsertFromFirebase);

  const convexUser = useQuery(
    api.users.getByFirebaseUid,
    user ? { firebaseUid: user.uid } : 'skip',
  );

  useEffect(() => {
    if (convexUser) {
      setDbUser(convexUser);
    }
  }, [convexUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const u = toAuthUser(firebaseUser);
        setUser(u);
        setIsLoggedIn(true);
        syncUser({
          firebaseUid: u.uid,
          name: u.name,
          email: u.email,
          avatar: u.photoURL,
        })
          .then((doc) => setDbUser(doc))
          .catch(() => {});
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setDbUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [syncUser]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        loading,
        user,
        dbUser,
        role: (dbUser?.role as Role | undefined) ?? 'member',
        signUp,
        signIn,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
