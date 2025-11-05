'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { registerPasskey as registerUser, registerWithPIN as registerUserPIN } from '@/services/authService';
import { registerPasskey as startPasskeyRegistration } from '@/services/passkeyService';

interface FormData {
  full_name: string;
  phone: string;
  email: string;
  farm_name: string;
  farm_area_hectares: string;
  current_crop: string;
  pin: string;
}

const CROPS = ['rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas', 'mothbeans', 'mungbean', 'blackgram', 'lentil', 'pomegranate', 'banana', 'mango', 'grapes', 'watermelon', 'muskmelon', 'apple', 'orange', 'papaya', 'coconut', 'cotton', 'jute', 'coffee'];

function generateWalletAddress(seed: string): string {
  const hash = Array.from(seed).reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  const hex = Math.abs(hash).toString(16).padStart(40, '0').slice(0, 40);
  return `0x${hex}`;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    phone: '',
    email: '',
    farm_name: '',
    farm_area_hectares: '',
    current_crop: 'rice',
    pin: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMethod, setAuthMethod] = useState<'passkey' | 'pin'>('passkey');
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasskeyRegister = async () => {
    if (!formData.full_name || !formData.phone) {
      setError('Please fill in name and phone');
      return;
    }

    if (formData.phone.length < 10) {
      setError('Phone number must be at least 10 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Starting Passkey registration...');

      // Authenticate with Passkey
      const passkeyResult = await startPasskeyRegistration(formData.full_name);

      if (!passkeyResult.success) {
        throw new Error(passkeyResult.error || 'Passkey registration failed');
      }

      console.log('✅ Passkey registered:', passkeyResult.credentialId);

      // Generate wallet address
      const walletAddress = generateWalletAddress(passkeyResult.credentialId || '');
      // Create wallet address from passkey credential ID
      const walletAddress = generateWalletAddress(passkeyResult.credentialId!);
      console.log('💰 Wallet created:', walletAddress);

      const farmAreaValue = formData.farm_area_hectares ? parseFloat(formData.farm_area_hectares) : undefined;

      // Register user
      const userData = await registerUser({
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email || '',
        farm_name: formData.farm_name || '',
        farm_area_hectares: formData.farm_area_hectares ? parseFloat(formData.farm_area_hectares) : undefined,
        current_crop: formData.current_crop,
        passkey_credential_id: passkeyResult.credentialId || '',
        passkey_public_key: passkeyResult.publicKey || '',
        wallet_address: walletAddress,
      };

      const apiResult = await registerPasskey(registerData);

      if (!apiResult.success) {
        throw new Error(apiResult.error || 'Đăng ký thất bại');
      }

      console.log('✅ User registered in database:', apiResult.user_id);

      // Save user info to localStorage
      storage.set(StorageKeys.USER, {
        id: apiResult.user_id,
        full_name: formData.full_name,
        wallet_address: apiResult.wallet_address || walletAddress,
        phone: formData.phone,
        farm_name: formData.farm_name,
        email: formData.email || undefined,
        farm_name: formData.farm_name || undefined,
        farm_area_hectares: farmAreaValue,
        current_crop: formData.current_crop,
        passkey_credential_id: passkeyResult.credentialId || '',
        passkey_public_key: passkeyResult.publicKey || '',
        wallet_address: walletAddress
      });

      if (userData.success && userData.user_id) {
        // Store user data in localStorage
        const user = {
          id: userData.user_id,
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email,
          wallet_address: walletAddress,
          farm_name: formData.farm_name,
          current_crop: formData.current_crop,
          farm_area_hectares: farmAreaValue
        };
        localStorage.setItem('aquamind_user', JSON.stringify(user));
        localStorage.setItem('aquamind_auth_method', 'passkey');

        router.push('/dashboard');
      } else {
        throw new Error(userData.message || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register with Passkey');
    } finally {
      setLoading(false);
    }
  };

  const handlePINRegister = async () => {
    if (!formData.full_name || !formData.phone || !formData.pin) {
      setError('Please fill in name, phone and PIN');
      return;
    }

    if (formData.phone.length < 10) {
      setError('Phone number must be at least 10 digits');
      return;
    }

    if (formData.pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Starting PIN registration...');

      // Create wallet address from phone
      const walletAddress = generateWalletAddress(formData.phone);
      console.log('💰 Wallet created:', walletAddress);

      const farmAreaValue = formData.farm_area_hectares ? parseFloat(formData.farm_area_hectares) : undefined;

      // Register user
      const userData = await registerUserPIN({
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email || '',
        farm_name: formData.farm_name || '',
        farm_area_hectares: formData.farm_area_hectares ? parseFloat(formData.farm_area_hectares) : undefined,
        phone: formData.phone || undefined,
        email: formData.email || '',
        farm_name: formData.farm_name || undefined,
        farm_area_hectares: farmAreaValue,
        current_crop: formData.current_crop,
        pin: formData.pin,
        wallet_address: walletAddress
      });

      if (userData.success && userData.user_id) {
        // Store user data in localStorage
        const user = {
          id: userData.user_id,
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email,
          wallet_address: walletAddress,
          farm_name: formData.farm_name,
          current_crop: formData.current_crop,
          farm_area_hectares: farmAreaValue
        };
        localStorage.setItem('aquamind_user', JSON.stringify(user));
        localStorage.setItem('aquamind_auth_method', 'pin');

        router.push('/dashboard');
      } else {
        throw new Error(userData.message || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register with PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Solid Light Background - Single Color */}
      <div className="absolute inset-0 bg-[#f8fafc] dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"></div>
      
      {/* Animated Purple Blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-violet-500/20 dark:bg-violet-600/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/20 dark:bg-purple-600/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-fuchsia-500/20 dark:bg-fuchsia-600/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-2xl relative z-10 border border-violet-200 dark:border-violet-800 shadow-xl shadow-violet-500/20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
        <CardHeader className="text-center pb-2">
          <div className="mb-2 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full blur-md opacity-40 animate-pulse"></div>
              <div className="relative w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 dark:from-violet-500 dark:to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/50">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>
          <CardTitle className="text-xl font-black text-gray-800 dark:text-white mb-1">Đăng ký tài khoản</CardTitle>
          <CardDescription className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">
            Chọn phương thức đăng ký
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-3 px-4">
          <div className="space-y-3">
            {/* Auth Method Toggle - Extra Compact */}
            <div className="flex gap-1.5 p-1 bg-white/50 dark:bg-slate-800/50 rounded-md border border-violet-200 dark:border-violet-700 shadow-sm">
              <button
                onClick={() => setAuthMethod('passkey')}
                className={`flex-1 py-1.5 px-3 rounded-sm font-bold transition-all duration-300 flex items-center justify-center gap-1 text-xs ${
                  authMethod === 'passkey'
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm shadow-violet-500/50 scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60 hover:scale-102'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
                <span>Passkey</span>
              </button>
              <button
                onClick={() => setAuthMethod('pin')}
                className={`flex-1 py-1.5 px-3 rounded-sm font-bold transition-all duration-300 flex items-center justify-center gap-1 text-xs ${
                  authMethod === 'pin'
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm shadow-violet-500/50 scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60 hover:scale-102'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <span>PIN</span>
              </button>
            </div>

            {/* 2-Column Extra Compact Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Left Column - Personal Info */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-violet-700 dark:text-violet-400 mb-1 flex items-center gap-1 pb-1 border-b border-violet-200 dark:border-violet-700">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Thông tin cá nhân
                </h3>
                
                <div className="space-y-0.5">
                  <Label htmlFor="full_name" className="text-[10px] font-bold text-violet-700 dark:text-violet-400">Họ và tên *</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    disabled={loading}
                    required
                    className="h-7 text-xs px-2 border border-violet-200 dark:border-violet-700 focus:border-violet-500 dark:focus:border-violet-500"
                  />
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="phone" className="text-[10px] font-bold text-violet-700 dark:text-violet-400">Số điện thoại *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0912345678"
                    disabled={loading}
                    required
                    className="h-7 text-xs px-2 border border-violet-200 dark:border-violet-700 focus:border-violet-500 dark:focus:border-violet-500"
                  />
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="email" className="text-[10px] font-bold text-violet-700 dark:text-violet-400">Email (tùy chọn)</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    disabled={loading}
                    className="h-7 text-xs px-2 border border-violet-200 dark:border-violet-700 focus:border-violet-500 dark:focus:border-violet-500"
                  />
                </div>

                {authMethod === 'pin' && (
                  <div className="space-y-0.5">
                    <Label htmlFor="pin" className="text-[10px] font-bold text-purple-700 dark:text-purple-400">Mã PIN (4-6 số) *</Label>
                    <Input
                      id="pin"
                      name="pin"
                      type="password"
                      value={formData.pin}
                      onChange={(e) => setFormData({
                        ...formData,
                        pin: e.target.value.replace(/\D/g, '').slice(0, 6)
                      })}
                      placeholder="••••"
                      disabled={loading}
                      maxLength={6}
                      required
                      className="h-7 text-base tracking-widest px-2 border border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 text-center"
                    />
                  </div>
                )}
              </div>

              {/* Right Column - Farm Info */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-purple-700 dark:text-purple-400 mb-1 flex items-center gap-1 pb-1 border-b border-purple-200 dark:border-purple-700">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Thông tin nông trại
                </h3>
                
                <div className="space-y-0.5">
                  <Label htmlFor="farm_name" className="text-[10px] font-bold text-violet-700 dark:text-violet-400">Tên nông trại (tùy chọn)</Label>
                  <Input
                    id="farm_name"
                    name="farm_name"
                    value={formData.farm_name}
                    onChange={handleChange}
                    placeholder="Nông trại cà phê Đà Lạt"
                    disabled={loading}
                    className="h-7 text-xs px-2 border border-violet-200 dark:border-violet-700 focus:border-violet-500 dark:focus:border-violet-500"
                  />
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="current_crop" className="text-[10px] font-bold text-violet-700 dark:text-violet-400">Cây trồng hiện tại</Label>
                  <select
                    id="current_crop"
                    name="current_crop"
                    value={formData.current_crop}
                    onChange={handleChange}
                    className="w-full h-7 text-xs px-2 border border-violet-200 dark:border-violet-700 focus:border-violet-500 dark:focus:border-violet-500 rounded-md bg-white dark:bg-slate-900"
                    disabled={loading}
                  >
                    {CROPS.map(crop => (
                      <option key={crop} value={crop}>
                        {crop.charAt(0).toUpperCase() + crop.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="farm_area_hectares" className="text-[10px] font-bold text-violet-700 dark:text-violet-400">Diện tích (hectares)</Label>
                  <Input
                    id="farm_area_hectares"
                    name="farm_area_hectares"
                    type="number"
                    step="0.1"
                    value={formData.farm_area_hectares}
                    onChange={handleChange}
                    placeholder="2.5"
                    disabled={loading}
                    className="h-7 text-xs px-2 border border-violet-200 dark:border-violet-700 focus:border-violet-500 dark:focus:border-violet-500"
                  />
                </div>

                {authMethod === 'passkey' && (
                  <div className="flex items-center justify-center py-2 border border-violet-300 dark:border-violet-700 rounded-md bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50 shadow-sm">
                    <div className="text-center">
                      <div className="mb-1 animate-bounce-slow">
                        <svg className="w-7 h-7 mx-auto text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                        </svg>
                      </div>
                      <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400">
                        Vân tay / Face ID
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security Info Button - Extra Compact */}
            <button
              onClick={() => setShowSecurityModal(true)}
              className="w-full py-1.5 px-3 text-left border border-purple-200 dark:border-purple-700 rounded-md bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 hover:from-purple-100 hover:to-violet-100 dark:hover:from-purple-900/50 dark:hover:to-violet-900/50 transition-all duration-300 font-bold shadow-sm hover:shadow-md"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3 h-3 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[10px] text-purple-700 dark:text-purple-300">Xem thông tin bảo mật</span>
              </span>
            </button>

            {/* Error - Extra Compact */}
            {error && (
              <div className="p-2 bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-400 font-bold text-xs shadow-sm flex items-center gap-1.5">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Register Button - Extra Compact */}
            <Button
              onClick={authMethod === 'passkey' ? handlePasskeyRegister : handlePINRegister}
              disabled={loading}
              className="w-full h-8 text-xs font-black shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <svg className="w-3 h-3 mr-1.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Đang đăng ký...
                </>
              ) : authMethod === 'passkey' ? (
                <>
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                  Đăng ký vân tay
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  Đăng ký PIN
                </>
              )}
            </Button>

            {/* Login Link - Extra Compact */}
            <div className="text-center pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">
                Đã có tài khoản?{' '}
                <a href="/auth/login" className="text-xs font-black text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline transition-colors">
                  Đăng nhập →
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Info Modal - Extra Compact */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-3">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-purple-300 dark:border-purple-700 p-3 max-w-md w-full shadow-2xl relative animate-scale-in">
            <button 
              onClick={() => setShowSecurityModal(false)}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200 font-bold text-lg"
            >
              ×
            </button>
            
            <div className="mb-3">
              <h3 className="text-sm font-black text-violet-700 dark:text-violet-400 flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-sm">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                Thông tin Bảo mật
              </h3>
            </div>

            {authMethod === 'passkey' ? (
              <div className="space-y-2">
                <div className="p-2.5 bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-950/40 border border-purple-200 dark:border-purple-700 rounded-lg shadow-sm">
                  <p className="text-xs font-black text-purple-900 dark:text-purple-300 mb-1.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                    Passkey
                  </p>
                  <ul className="text-purple-700 dark:text-purple-400 space-y-1 font-semibold text-[10px]">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-purple-600 rounded-full flex-shrink-0"></span>
                      Sử dụng vân tay hoặc Face ID
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-purple-600 rounded-full flex-shrink-0"></span>
                      Không cần nhớ mật khẩu
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-purple-600 rounded-full flex-shrink-0"></span>
                      Bảo mật cao nhất
                    </li>
                  </ul>
                </div>
                
                <div className="p-2.5 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40 border border-violet-200 dark:border-violet-700 rounded-lg shadow-sm">
                  <p className="text-xs font-black text-violet-900 dark:text-violet-300 mb-1.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Blockchain Wallet
                  </p>
                  <ul className="text-violet-700 dark:text-violet-400 space-y-1 font-semibold text-[10px]">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-violet-600 rounded-full flex-shrink-0"></span>
                      Tự động tạo ví blockchain
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-violet-600 rounded-full flex-shrink-0"></span>
                      Lưu trữ dữ liệu an toàn
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-violet-600 rounded-full flex-shrink-0"></span>
                      Mã hóa end-to-end
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-2.5 bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-950/40 border border-purple-200 dark:border-purple-700 rounded-lg shadow-sm">
                  <p className="text-xs font-black text-purple-900 dark:text-purple-300 mb-1.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    Mã PIN
                  </p>
                  <ul className="text-purple-700 dark:text-purple-400 space-y-1 font-semibold text-[10px]">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-purple-600 rounded-full flex-shrink-0"></span>
                      Mã PIN 4-6 số dễ nhớ
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-purple-600 rounded-full flex-shrink-0"></span>
                      Bảo mật cơ bản
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-purple-600 rounded-full flex-shrink-0"></span>
                      Phù hợp mọi thiết bị
                    </li>
                  </ul>
                </div>
                
                <div className="p-2.5 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40 border border-violet-200 dark:border-violet-700 rounded-lg shadow-sm">
                  <p className="text-xs font-black text-violet-900 dark:text-violet-300 mb-1.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Blockchain Wallet
                  </p>
                  <ul className="text-violet-700 dark:text-violet-400 space-y-1 font-semibold text-[10px]">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-violet-600 rounded-full flex-shrink-0"></span>
                      Tự động tạo ví blockchain
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-violet-600 rounded-full flex-shrink-0"></span>
                      Lưu trữ dữ liệu an toàn
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-violet-600 rounded-full flex-shrink-0"></span>
                      Mã hóa end-to-end
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
