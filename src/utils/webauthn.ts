/**
 * WebAuthn (FIDO2) Biometric Verification Utility
 * Supports Fingerprint (Touch ID, Windows Hello, Android Biometrics) & Face ID
 */

// Helper to convert string to ArrayBuffer for WebAuthn challenge
export function bufferFromString(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export function bufferToString(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface BiometricVerificationResult {
  success: boolean;
  type: 'fingerprint' | 'face';
  token: string;
  authenticatorName: string;
  timestamp: string;
  isNativeHardware: boolean;
}

// Check if browser supports WebAuthn
export const isWebAuthnSupported = (): boolean => {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential;
};

// Check if device has a platform authenticator (Touch ID, Face ID, Windows Hello, etc.)
export const isPlatformAuthenticatorAvailable = async (): Promise<boolean> => {
  if (!isWebAuthnSupported()) return false;
  try {
    if (typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return false;
  } catch (err) {
    console.warn('WebAuthn platform check error:', err);
    return false;
  }
};

/**
 * Register biometric credential using native WebAuthn API
 */
export const registerBiometricCredential = async (
  email: string,
  userName: string
): Promise<{ credentialId: string; success: boolean }> => {
  if (!isWebAuthnSupported() || !navigator.credentials?.create) {
    throw new Error('WebAuthn is not supported in this browser.');
  }

  const userId = bufferFromString(email);
  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge: challenge as unknown as BufferSource,
    rp: {
      name: '+CareBridge Outpatient Portal',
      id: window.location.hostname,
    },
    user: {
      id: userId as unknown as BufferSource,
      name: email,
      displayName: userName || email.split('@')[0],
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },   // ES256
      { alg: -257, type: 'public-key' }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      requireResidentKey: false,
    },
    timeout: 60000,
    attestation: 'none',
  };

  try {
    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential;

    if (!credential) {
      throw new Error('Biometric credential enrollment failed.');
    }

    const credId = bufferToString(credential.rawId);
    // Persist enrolled status in localStorage
    localStorage.setItem(`safah_webauthn_${email}`, credId);
    return { credentialId: credId, success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.warn('Native WebAuthn enrollment error:', err);
    throw err;
  }
};

/**
 * Perform Biometric Verification via WebAuthn navigator.credentials.get
 */
export const verifyBiometricCredential = async (
  email: string
): Promise<BiometricVerificationResult> => {
  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const enrolledCredId = localStorage.getItem(`safah_webauthn_${email}`);

  if (isWebAuthnSupported() && navigator.credentials?.get) {
    const requestOptions: PublicKeyCredentialRequestOptions = {
      challenge: challenge as unknown as BufferSource,
      rpId: window.location.hostname,
      userVerification: 'required',
      timeout: 60000,
    };

    if (enrolledCredId) {
      // Decode hex credential id
      const matches = enrolledCredId.match(/.{1,2}/g);
      if (matches) {
        const rawIdBytes = new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
        requestOptions.allowCredentials = [
          {
            id: rawIdBytes as unknown as BufferSource,
            type: 'public-key',
            transports: ['internal'],
          },
        ];
      }
    }

    try {
      const assertion = (await navigator.credentials.get({
        publicKey: requestOptions,
      })) as PublicKeyCredential;

      if (assertion) {
        const token = `FIDO2-WEBAUTHN-${Date.now()}-${bufferToString(assertion.rawId).slice(0, 12)}`;
        return {
          success: true,
          type: 'fingerprint',
          token,
          authenticatorName: 'Device Biometric Authenticator (Platform Hardware)',
          timestamp: new Date().toLocaleTimeString(),
          isNativeHardware: true,
        };
      }
    } catch (err: unknown) {
      console.warn('WebAuthn hardware verification failed or denied:', err);
      // Fall through to handled flow
      throw err;
    }
  }

  throw new Error('WebAuthn is not supported in this environment.');
};
