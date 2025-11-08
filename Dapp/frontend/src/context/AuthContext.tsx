'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { passkeyService } from '@/services/passkeyService';
import { generateWalletAddress } from '@/services/walletFromPasskey';
import { registerPasskey, registerWithPIN, loginPasskey, loginWithPIN, User } from '@/services/authService';
import { storage, StorageKeys } from '@/lib/utils';

interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions - Passkey
  registerWithPasskey: (formData: PasskeyRegisterData) => Promise<void>;
  loginWithPasskeyAuth: () => Promise<void>;
  
  // Actions - PIN
  registerWithPINAuth: (formData: PINRegisterData) => Promise<void>;
  loginWithPINAuth: (phone: string, pin: string) => Promise<void>;
  
  // Common
  logout: () => Promise<void>;
  clearError: () => void;
}

interface PasskeyRegisterData {
  full_name: string;
  phone: string;
  email?: string;
  farm_name?: string;
  farm_area_hectares?: number;
  current_crop?: string;
}

interface PINRegisterData {
  full_name: string;
  phone: string;
  pin: string;
  email?: string;
  farm_name?: string;
  farm_area_hectares?: number;
  current_crop?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved state on mount
  useEffect(() => {
    const loadSavedState = () => {
      try {
        const savedUser = storage.get<User>(StorageKeys.USER);
        if (savedUser) {
          setUser(savedUser);
          console.log('✅ User loaded from localStorage:', savedUser.full_name);
        }
      } catch (err) {
        console.error('Failed to load saved state:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedState();
  }, []);

  // ============ PASSKEY AUTHENTICATION ============
  
  const registerWithPasskey = async (formData: PasskeyRegisterData) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔐 Starting Passkey registration...');

      // Check Passkey support
      const isSupported = await passkeyService.isPlatformAuthenticatorAvailable();
      if (!isSupported) {
        throw new Error('Thiết bị của bạn không hỗ trợ xác thực vân tay/Face ID');
      }

      // Register Passkey
      const passkeyResult = await passkeyService.register(formData.full_name);
      if (!passkeyResult.success) {
        throw new Error('Đăng ký vân tay thất bại');
      }

      console.log('✅ Passkey registered:', passkeyResult.credentialId);

      // Generate wallet address
      const walletAddress = generateWalletAddress(passkeyResult.credentialId || '');
      console.log('💰 Wallet created:', walletAddress);

      // Register with backend
      const registerData = {
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email || '',
        farm_name: formData.farm_name || '',
        farm_area_hectares: formData.farm_area_hectares,
        current_crop: formData.current_crop || '',
        passkey_credential_id: passkeyResult.credentialId || '',
        passkey_public_key: passkeyResult.publicKey || '',
        wallet_address: walletAddress,
      };

      const apiResult = await registerPasskey(registerData);

      if (!apiResult.success) {
        throw new Error(apiResult.error || 'Đăng ký thất bại');
      }

      console.log('✅ User registered in database:', apiResult.user_id);

      // Save user info to state and localStorage
      const newUser: User = {
        id: apiResult.user_id!,
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        wallet_address: apiResult.wallet_address || walletAddress,
        farm_name: formData.farm_name,
        current_crop: formData.current_crop,
        farm_area_hectares: formData.farm_area_hectares,
      };

      setUser(newUser);
      storage.set(StorageKeys.USER, newUser);
      storage.set(StorageKeys.AUTH_METHOD, 'passkey');
      storage.set(StorageKeys.PASSKEY_CREDENTIAL, {
        id: passkeyResult.credentialId,
        publicKey: passkeyResult.publicKey,
      });

      console.log('✅ Registration complete!');
    } catch (err: any) {
      console.error('❌ Registration error:', err);
      setError(err.message || 'Đăng ký thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPasskeyAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔐 Starting Passkey authentication...');

      // Check Passkey support
      const isSupported = await passkeyService.isPlatformAuthenticatorAvailable();
      if (!isSupported) {
        throw new Error('Thiết bị của bạn không hỗ trợ xác thực vân tay/Face ID');
      }

      // Authenticate with Passkey
      const passkeyResult = await passkeyService.authenticate();
      if (!passkeyResult.success) {
        throw new Error('Xác thực vân tay thất bại');
      }

      console.log('✅ Passkey authenticated:', passkeyResult.credentialId);

      // Login with backend
      const apiResult = await loginPasskey(passkeyResult.credentialId || '');

      if (!apiResult.success || !apiResult.user) {
        throw new Error(apiResult.error || 'Đăng nhập thất bại');
      }

      console.log('✅ User logged in:', apiResult.user);

      // Save user info
      setUser(apiResult.user);
      storage.set(StorageKeys.USER, apiResult.user);
      storage.set(StorageKeys.AUTH_METHOD, 'passkey');

      console.log('✅ Login complete!');
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Đăng nhập thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ============ PIN AUTHENTICATION ============

  const registerWithPINAuth = async (formData: PINRegisterData) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔢 Starting PIN registration...');

      // Validate PIN
      if (formData.pin.length < 4 || formData.pin.length > 6) {
        throw new Error('Mã PIN phải có 4-6 số');
      }

      // Generate wallet address from phone
      const walletAddress = generateWalletAddress(formData.phone);
      console.log('💰 Wallet created:', walletAddress);

      // Register with backend
      const registerData = {
        full_name: formData.full_name,
        phone: formData.phone,
        pin: formData.pin,
        email: formData.email || '',
        farm_name: formData.farm_name || '',
        farm_area_hectares: formData.farm_area_hectares,
        current_crop: formData.current_crop || '',
        wallet_address: walletAddress,
      };

      const apiResult = await registerWithPIN(registerData);

      if (!apiResult.success) {
        throw new Error(apiResult.error || 'Đăng ký thất bại');
      }

      console.log('✅ User registered in database:', apiResult.user_id);

      // Save user info to state and localStorage
      const newUser: User = {
        id: apiResult.user_id!,
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        wallet_address: apiResult.wallet_address || walletAddress,
        farm_name: formData.farm_name,
        current_crop: formData.current_crop,
        farm_area_hectares: formData.farm_area_hectares,
      };

      setUser(newUser);
      storage.set(StorageKeys.USER, newUser);
      storage.set(StorageKeys.AUTH_METHOD, 'pin');

      console.log('✅ Registration complete!');
    } catch (err: any) {
      console.error('❌ Registration error:', err);
      setError(err.message || 'Đăng ký thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPINAuth = async (phone: string, pin: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔢 Starting PIN authentication...');

      // Validate inputs
      if (!phone || !pin) {
        throw new Error('Vui lòng nhập đầy đủ số điện thoại và PIN');
      }

      // Login with backend
      const apiResult = await loginWithPIN(phone, pin);

      if (!apiResult.success || !apiResult.user) {
        throw new Error(apiResult.error || 'Đăng nhập thất bại');
      }

      console.log('✅ User logged in:', apiResult.user);

      // Save user info
      setUser(apiResult.user);
      storage.set(StorageKeys.USER, apiResult.user);
      storage.set(StorageKeys.AUTH_METHOD, 'pin');

      console.log('✅ Login complete!');
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Đăng nhập thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ============ COMMON ACTIONS ============

  const logout = async () => {
    try {
      setIsLoading(true);
      setUser(null);
      storage.remove(StorageKeys.USER);
      storage.remove(StorageKeys.AUTH_METHOD);
      console.log('👋 Logged out successfully');
    } catch (err) {
      console.error('❌ Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    registerWithPasskey,
    loginWithPasskeyAuth,
    registerWithPINAuth,
    loginWithPINAuth,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

