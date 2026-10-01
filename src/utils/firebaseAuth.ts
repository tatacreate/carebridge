import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedIdToken: string | null = null;

export interface RealGoogleAuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  emailVerified: boolean;
  accessToken: string;
  idToken: string;
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && user.email) {
      try {
        const idToken = await user.getIdToken();
        cachedIdToken = idToken;
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken || idToken);
      } catch (err) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      cachedIdToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithRealGoogle = async (): Promise<RealGoogleAuthUser> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    if (!user.email) {
      throw new Error('Google did not return an email address for this account.');
    }

    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || '';
    const idToken = await user.getIdToken(true);

    cachedAccessToken = accessToken;
    cachedIdToken = idToken;

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      accessToken: accessToken || idToken,
      idToken,
    };
  } catch (error: any) {
    console.error('Real Google OAuth Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken || cachedIdToken;
};

export const signOutGoogle = async () => {
  try {
    await firebaseSignOut(auth);
  } finally {
    cachedAccessToken = null;
    cachedIdToken = null;
  }
};
