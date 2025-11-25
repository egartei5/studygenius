'use client';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
  type Auth,
} from 'firebase/auth';

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';

import { initializeFirebase } from '@/firebase';
import type { User, UserPreferences } from '@/lib/types';

const USER_COLLECTION = 'users';

let auth: Auth;
let db: Firestore;

const getFirebase = () => {
  if (!auth || !db) {
    const firebase = initializeFirebase();
    auth = firebase.auth;
    db = firebase.firestore;
  }
  return { auth, db };
};

const mapDocToUser = (
  docData: any,
  uid: string,
  firebaseUser: FirebaseUser
): User => ({
  id: uid,
  name: docData.name || firebaseUser.displayName || 'User',
  email: docData.email || firebaseUser.email || '',
  isPremium: docData.subscriptionStatus === 'active',
  subscriptionStatus: docData.subscriptionStatus || 'free',
  planInterval: docData.planInterval,
  currentPeriodEnd:
    docData.currentPeriodEnd?.toMillis?.() || docData.currentPeriodEnd,
  joinedDate: docData.joinedDate?.toMillis?.() || Date.now(),
  stats: docData.stats || {
    setsGenerated: 0,
    questionsAnswered: 0,
    daysStreak: 0,
    lastLogin: Date.now(),
  },
});

export const userService = {
  initAuth: (callback: (user: User | null) => void) => {
    const { auth, db } = getFirebase();
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, USER_COLLECTION, firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            'stats.lastLogin': Date.now(),
          });
          callback(mapDocToUser(userDoc.data(), firebaseUser.uid, firebaseUser));
        } else {
          const newUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'New User',
            email: firebaseUser.email || '',
            isPremium: false,
            subscriptionStatus: 'free',
            joinedDate: Date.now(),
            stats: {
              setsGenerated: 0,
              questionsAnswered: 0,
              daysStreak: 1,
              lastLogin: Date.now(),
            },
          };
          await setDoc(userDocRef, {
            ...newUser,
            joinedDate: serverTimestamp(),
            'stats.lastLogin': serverTimestamp(),
          });
          callback(newUser);
        }
      } else {
        callback(null);
      }
    });
  },

  register: async (
    name: string,
    email: string,
    password: string
  ): Promise<User> => {
    const { auth, db } = getFirebase();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (credential.user) {
      await updateProfile(credential.user, { displayName: name });

      const newUser: User = {
        id: credential.user.uid,
        name,
        email,
        isPremium: false,
        subscriptionStatus: 'free',
        joinedDate: Date.now(),
        stats: {
          setsGenerated: 0,
          questionsAnswered: 0,
          daysStreak: 1,
          lastLogin: Date.now(),
        },
      };

      await setDoc(doc(db, USER_COLLECTION, credential.user.uid), {
        ...newUser,
        joinedDate: serverTimestamp(),
        'stats.lastLogin': serverTimestamp(),
      });

      return newUser;
    }
    throw new Error('Registration failed');
  },

  login: async (email: string, password: string): Promise<User> => {
    const { auth, db } = getFirebase();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, USER_COLLECTION, credential.user.uid));
    if (userDoc.exists()) {
      return mapDocToUser(userDoc.data(), credential.user.uid, credential.user);
    }
    throw new Error('User profile not found.');
  },

  loginWithGoogle: async (): Promise<User> => {
    const { auth, db } = getFirebase();
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    const userRef = doc(db, USER_COLLECTION, credential.user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return mapDocToUser(userDoc.data(), credential.user.uid, credential.user);
    } else {
      const newUser: User = {
        id: credential.user.uid,
        name: credential.user.displayName || 'User',
        email: credential.user.email || '',
        isPremium: false,
        subscriptionStatus: 'free',
        joinedDate: Date.now(),
        stats: {
          setsGenerated: 0,
          questionsAnswered: 0,
          daysStreak: 1,
          lastLogin: Date.now(),
        },
      };
      await setDoc(userRef, { ...newUser, joinedDate: serverTimestamp() });
      return newUser;
    }
  },

  logout: async () => {
    const { auth } = getFirebase();
    await signOut(auth);
  },

  incrementStats: async (key: keyof User['stats']) => {
    const { auth, db } = getFirebase();
    if (!auth.currentUser) return;
    const fieldPath = `stats.${key}`;
    await updateDoc(doc(db, USER_COLLECTION, auth.currentUser.uid), {
      [fieldPath]: increment(1),
    });
  },

  hasPremiumAccess: (user: User | null): boolean => {
    if (!user) return false;
    if (
      user.subscriptionStatus === 'active' ||
      user.subscriptionStatus === 'trialing'
    )
      return true;
    if (user.subscriptionStatus === 'canceled' && user.currentPeriodEnd) {
      return Date.now() < user.currentPeriodEnd;
    }
    return false;
  },

  savePreferences: (prefs: UserPreferences) => {
    try {
      const current = localStorage.getItem('studygenius_prefs');
      const newPrefs = { ...(current ? JSON.parse(current) : {}), ...prefs };
      localStorage.setItem('studygenius_prefs', JSON.stringify(newPrefs));

      const { auth, db } = getFirebase();
      if (auth.currentUser) {
        updateDoc(
          doc(db, `users/${auth.currentUser.uid}/preferences`, 'settings'),
          newPrefs,
          { merge: true }
        ).catch(console.error);
      }
    } catch (error) {
      console.error('Could not save preferences.', error);
    }
  },

  getPreferences: (): UserPreferences => {
    try {
      const stored = localStorage.getItem('studygenius_prefs');
      return stored ? JSON.parse(stored) : { darkMode: false };
    } catch (error) {
      console.error('Could not read preferences.', error);
      return { darkMode: false };
    }
  },
};
