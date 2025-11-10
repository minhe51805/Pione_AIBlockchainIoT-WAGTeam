import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

// RP_ID must match the hostname (without port or protocol)
// For IP addresses, use the IP directly
const RP_ID = process.env.NEXT_PUBLIC_RP_ID || 
  (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
const RP_NAME = process.env.NEXT_PUBLIC_RP_NAME || 'AgroTwin';

/**
 * UTF-8 safe base64 encoding (supports Vietnamese characters)
 */
function utf8ToBase64(str: string): string {
  try {
    // Use TextEncoder for proper UTF-8 encoding
    const utf8Bytes = new TextEncoder().encode(str);
    // Convert to binary string
    const binaryString = String.fromCharCode(...utf8Bytes);
    // Encode to base64
    return btoa(binaryString);
  } catch (e) {
    // Fallback: use crypto.randomUUID() if encoding fails
    console.warn('UTF-8 encoding failed, using random ID instead');
    return btoa(crypto.randomUUID());
  }
}

/**
 * Passkey Registration Flow
 */
function generateRegistrationOptions(username: string) {
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  
  const challengeBase64 = btoa(String.fromCharCode(...challenge));

  return {
    challenge: challengeBase64,
    rp: {
      name: RP_NAME,
      id: RP_ID,
    },
    user: {
      id: utf8ToBase64(username), // ✅ Now supports Vietnamese characters!
      name: username,
      displayName: username,
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' as const },
      { alg: -257, type: 'public-key' as const },
    ],
    timeout: 60000,
    attestation: 'none' as const,
    authenticatorSelection: {
      // Don't require platform authenticator - allow both platform and cross-platform
      // authenticatorAttachment: 'platform' as const,
      requireResidentKey: false,
      residentKey: 'preferred' as const,
      userVerification: 'preferred' as const,
    },
    excludeCredentials: [],
  };
}

export async function registerPasskey(username: string) {
  try {
    console.log('🔐 Starting Passkey registration for:', username);
    console.log('🌐 Current origin:', window.location.origin);
    console.log('🆔 RP_ID:', RP_ID);
    
    const options = generateRegistrationOptions(username);
    console.log('⚙️ Registration options:', JSON.stringify(options, null, 2));
    
    const credential = await startRegistration(options as any);
    console.log('✅ Credential received:', credential.id);
    
    return {
      success: true,
      credentialId: credential.id,
      publicKey: credential.response.publicKey || btoa(JSON.stringify(credential.response)),
      transports: credential.response.transports,
    };
  } catch (error: any) {
    console.error('❌ Passkey registration failed:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    return {
      success: false,
      error: error.message || 'Registration failed',
    };
  }
}

/**
 * Passkey Authentication Flow
 */
function generateAuthenticationOptions() {
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  
  const challengeBase64 = btoa(String.fromCharCode(...challenge));
  
  return {
    challenge: challengeBase64,
    rpId: RP_ID,
    timeout: 60000,
    userVerification: 'preferred' as const,
    allowCredentials: [],
  };
}

export async function authenticatePasskey() {
  try {
    const options = generateAuthenticationOptions();
    const credential = await startAuthentication(options as any);
    
    return {
      success: true,
      credentialId: credential.id,
      authenticatorData: credential.response.authenticatorData,
      clientDataJSON: credential.response.clientDataJSON,
      signature: credential.response.signature,
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
 * Check if platform authenticator is available
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  try {
    if (!window.PublicKeyCredential) {
      return false;
    }
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (error) {
    console.error('Failed to check platform authenticator:', error);
    return false;
  }
}

// Default export for backward compatibility
export const passkeyService = {
  registerPasskey,
  register: registerPasskey, // Alias for backward compatibility
  authenticatePasskey,
  authenticate: authenticatePasskey, // Alias for backward compatibility
  isPlatformAuthenticatorAvailable,
};

export default passkeyService;
