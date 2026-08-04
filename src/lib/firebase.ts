import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyAGkyitSoWwkngpY-lJamrrR3HHmt7GYfA',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'usesubteen.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'usesubteen',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'usesubteen.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '384597315454',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:384597315454:web:d024ebe682d83b5281ed2f',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-PMEFD1M4QF',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
