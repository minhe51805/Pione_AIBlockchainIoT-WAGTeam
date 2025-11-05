import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/browser';

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const RP_NAME = process.env.NEXT_PUBLIC_RP_NAME || 'AgroTwin';

/**
 * Generate registration options for WebAuthn
 */
export function generateRegistrationOptions(username: string): PublicKeyCredentialCreationOptionsJSON {
  const userId = new Uint8Array(16);
  crypto.getRandomValues(userId);
  const userIdBase64 = btoa(String.fromCharCode(...userId));

  return {
    challenge: generateChallenge(),
    rp: {
      name: RP_NAME,
      id: RP_ID,
    },
    user: {
      id: userIdBase64,
      name: username,
      displayName: username,
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 },  // ES256
      { type: 'public-key', alg: -257 }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      residentKey: 'required',
    },
    timeout: 60000,
    attestation: 'none',
  };
}

/**
 * Generate authentication options for WebAuthn
 */
export function generateAuthenticationOptions(): PublicKeyCredentialRequestOptionsJSON {
  return {
    challenge: generateChallenge(),
    rpId: RP_ID,
    userVerification: 'required',
    timeout: 60000,
  };
}

/**
 * Register a new Passkey
 */
export async function registerPasskey(username: string) {
  try {
    const options = generateRegistrationOptions(username);
    const credential = await startRegistration(options);
    
    return {
      success: true,
      credential,
      credentialId: credential.id,
      publicKey: credential.response.publicKey,
    };
  } catch (error: any) {
    console.error('Passkey registration failed:', error);
    return {
      success: false,
      error: error.message || 'Registration failed',
    };
  }
}

/**
 * Authenticate with Passkey
 */
export async function authenticatePasskey() {
  try {
    const options = generateAuthenticationOptions();
    const credential = await startAuthentication(options);
    
    return {
      success: true,
      credential,
      credentialId: credential.id,
    };
  } catch (error: any) {
    console.error('Passkey authentication failed:', error);
    return {
      success: false,
      error: error.message || 'Authentication failed',
    };
  }
}

/**
 * Generate a random challenge (base64url encoded)
 */
function generateChallenge(): string {
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  return btoa(String.fromCharCode(...challenge))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Check if WebAuthn is supported
 */
export function isWebAuthnSupported(): boolean {
  return typeof window !== 'undefined' && 
         window.PublicKeyCredential !== undefined &&
         typeof window.PublicKeyCredential === 'function';
}

/**
 * Check if platform authenticator is available
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return false;
  }
  
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (error) {
    console.error('Error checking platform authenticator:', error);
    return false;
  }
}

/**
 * Export as object for easier import
 */
export const passkeyService = {
  registerPasskey,
  authenticatePasskey,
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  authenticate: authenticatePasskey,
  register: registerPasskey,
};

