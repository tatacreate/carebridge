import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { signInWithRealGoogle, RealGoogleAuthUser } from '../utils/firebaseAuth';
import firebaseConfig from '../../firebase-applet-config.json';

export interface GoogleOAuthResult {
  email: string;
  name: string;
  avatarLetter: string;
  token: string;
  verifiedAt: string;
  clientIdUsed?: string;
  photoURL?: string | null;
}

interface GoogleOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: GoogleOAuthResult) => void;
  roleHint?: 'patient' | 'doctor';
}

export const GoogleOAuthModal: React.FC<GoogleOAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  roleHint,
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStage, setAuthStage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLaunchGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsAuthenticating(true);
    setAuthStage('Opening Google Cloud OAuth 2.0 Secure Dialog...');

    try {
      setAuthStage('Awaiting Google account verification...');
      const googleUser: RealGoogleAuthUser = await signInWithRealGoogle();

      setAuthStage('Validating cryptographic Google token & profile claims...');

      const avatar = googleUser.displayName
        ? googleUser.displayName.charAt(0).toUpperCase()
        : googleUser.email.charAt(0).toUpperCase();

      onSuccess({
        email: googleUser.email,
        name: googleUser.displayName,
        avatarLetter: avatar,
        token: googleUser.idToken || googleUser.accessToken,
        verifiedAt: new Date().toLocaleTimeString(),
        clientIdUsed: firebaseConfig.oAuthClientId,
        photoURL: googleUser.photoURL,
      });

      onClose();
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      let message = 'Google authentication was not completed.';

      if (err.code === 'auth/popup-blocked') {
        message =
          'Google Sign-in popup was blocked by your browser. Please allow popups for this site or open the app in a new tab.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = 'Google sign-in window was closed before completing verification. Please try again.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        message = 'Authentication was cancelled.';
      } else if (err.message) {
        message = err.message;
      }

      setErrorMsg(message);
    } finally {
      setIsAuthenticating(false);
      setAuthStage('');
    }
  };

  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in"
      onClick={() => !isAuthenticating && onClose()}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-5 p-6 sm:p-7 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Google Cloud Authentication
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Official Google Identity Services (OAuth 2.0)
              </p>
            </div>
          </div>

          {!isAuthenticating && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Cloud Project Info Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Google Cloud Identity Provider</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
              LIVE GCP OAUTH
            </span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Real cryptographic identity verification. When you sign in, Google directly validates your authentic email and issues a secure cryptographic token. Fake or unverified emails are strictly prohibited.
          </p>
          <div className="text-[10px] font-mono text-slate-400 truncate pt-1 border-t border-slate-200/60">
            Project: {firebaseConfig.projectId}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2 animate-fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Verification Error</span>
                <p className="leading-relaxed">{errorMsg}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-rose-200/60">
              <button
                type="button"
                onClick={handleOpenNewTab}
                className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open app in new tab if popup is blocked</span>
              </button>
            </div>
          </div>
        )}

        {/* Authentication State */}
        {isAuthenticating ? (
          <div className="py-8 px-4 text-center space-y-4 animate-fade-in">
            <div className="relative mx-auto w-14 h-14 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin" />
              <ShieldCheck className="w-7 h-7 text-teal-700" />
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-sm">
                Authenticating with Google Cloud
              </h4>
              <p className="text-xs text-teal-800 font-medium">{authStage}</p>
            </div>

            <p className="text-[11px] text-slate-500">
              Please complete the sign-in prompt in the Google popup window.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Real Google Sign-in Button */}
            <button
              onClick={handleLaunchGoogleSignIn}
              className="w-full py-3.5 px-4 rounded-2xl border-2 border-slate-300 hover:border-teal-600 bg-white hover:bg-slate-50/80 shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-3 group active:scale-[0.99]"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>

              <span className="font-extrabold text-slate-800 text-sm group-hover:text-slate-900">
                Continue with Google Account
              </span>

              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition shrink-0" />
            </button>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1 text-slate-600 font-semibold">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>SSL/TLS Encrypted Connection</span>
              </span>
              <span className="font-bold text-teal-800">
                {roleHint === 'doctor' ? 'Clinician Credentials' : 'Patient Identity'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
