/**
 * Auth Service - API calls for authentication
 * Supports both Passkey (biometric) and PIN-based authentication
 */

// Use relative path - Next.js will proxy to Flask
const API_URL = '';

export interface RegisterData {
  full_name: string;
  phone: string;
  email?: string;
  farm_name?: string;
  farm_location_lat?: number;
  farm_location_lon?: number;
  farm_area_hectares?: number;
  current_crop?: string;
  passkey_credential_id: string;
  passkey_public_key: string;
  passkey_transports?: string[];
  pin?: string; // Optional PIN for PIN-based auth
  wallet_address?: string; // Optional wallet address
}

export interface RegisterPINData {
  full_name: string;
  email: string;
  phone?: string;
  farm_name?: string;
  farm_area_hectares?: number;
  current_crop?: string;
  pin: string;
  wallet_address?: string;
}

export interface User {
  id: number;
  full_name: string;
  phone: string;
  email?: string;
  wallet_address: string;
  farm_name?: string;
  farm_location_lat?: number;
  farm_location_lon?: number;
  farm_area_hectares?: number;
  current_crop?: string;
}

export interface RegisterResponse {
  success: boolean;
  user_id?: number;
  wallet_address?: string;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
  error?: string;
}

/**
 * Register new user with Passkey
 */
export async function registerPasskey(data: RegisterData): Promise<RegisterResponse> {
  try {
    const response = await fetch(`${API_URL}/api/auth/register-passkey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('❌ Register API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to register',
    };
  }
}

/**
 * Login with Passkey
 */
export async function loginPasskey(credentialId: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login-passkey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        passkey_credential_id: credentialId,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('❌ Login API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to login',
    };
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: number): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_URL}/api/auth/profile/${userId}`);
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('❌ Get profile API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get profile',
    };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: number,
  data: Partial<User>
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/auth/profile/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('❌ Update profile API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update profile',
    };
  }
}

/**
 * Register new user with PIN
 */
export async function registerWithPIN(data: RegisterPINData): Promise<RegisterResponse> {
  try {
    const response = await fetch(`${API_URL}/api/auth/register-pin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('❌ Register PIN API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to register with PIN',
    };
  }
}

/**
 * Login with PIN (accepts email or phone)
 */
export async function loginWithPIN(emailOrPhone: string, pin: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login-pin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_or_phone: emailOrPhone, pin }),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('❌ Login PIN API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to login with PIN',
    };
  }
}

