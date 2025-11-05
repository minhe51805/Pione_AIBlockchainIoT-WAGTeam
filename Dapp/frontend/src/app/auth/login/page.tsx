'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { passkeyService } from '@/services/passkeyService';
import { loginPasskey, loginWithPIN } from '@/services/authService';
import { storage, StorageKeys } from '@/lib/utils';

type AuthMethod = 'passkey' | 'pin';

export default function LoginPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<AuthMethod>('passkey');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // PIN form fields
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [pin, setPin] = useState('');

  const handlePasskeyLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check Passkey support
      const isSupported = await passkeyService.isPlatformAuthenticatorAvailable();
      if (!isSupported) {
        alert(
          '❌ Thiết bị không hỗ trợ\n\n' +
          'Thiết bị của bạn không hỗ trợ xác thực vân tay/Face ID.\n\n' +
          'Yêu cầu thiết bị:\n' +
          '• iPhone/iPad với Face ID hoặc Touch ID\n' +
          '• Android với cảm biến vân tay\n' +
          '• Windows Hello trên PC\n' +
          '• MacBook với Touch ID\n\n' +
          '💡 Gợi ý: Hãy sử dụng tab PIN để đăng nhập!'
        );
        setLoading(false);
        return;
      }

      console.log('🔐 Starting Passkey authentication...');

      // Authenticate with Passkey
      const passkeyResult = await passkeyService.authenticate();

      if (!passkeyResult.success) {
        throw new Error('Xác thực vân tay thất bại');
      }

      console.log('✅ Passkey authenticated:', passkeyResult.credentialId);

      // Login with backend
      const apiResult = await loginPasskey(passkeyResult.credentialId);

      if (!apiResult.success || !apiResult.user) {
        throw new Error(apiResult.error || 'Đăng nhập thất bại');
      }

      console.log('✅ User logged in:', apiResult.user);

      // Save user info to localStorage
      storage.set(StorageKeys.USER, {
        id: apiResult.user.id,
        full_name: apiResult.user.full_name,
        wallet_address: apiResult.user.wallet_address,
        phone: apiResult.user.phone,
        farm_name: apiResult.user.farm_name,
        current_crop: apiResult.user.current_crop,
      });
      storage.set(StorageKeys.AUTH_METHOD, 'passkey');

      // Redirect to dashboard
      router.push('/dashboard');

    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handlePINLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!emailOrPhone.trim() || !pin.trim()) {
        throw new Error('Vui lòng nhập đầy đủ email/số điện thoại và PIN');
      }

      if (pin.length < 4) {
        throw new Error('Mã PIN phải có ít nhất 4 số');
      }

      console.log('🔐 Starting PIN authentication...');

      // Login with backend
      const apiResult = await loginWithPIN(emailOrPhone, pin);

      if (!apiResult.success || !apiResult.user) {
        throw new Error(apiResult.error || 'Đăng nhập thất bại');
      }

      console.log('✅ User logged in:', apiResult.user);

      // Save user info to localStorage
      storage.set(StorageKeys.USER, {
        id: apiResult.user.id,
        full_name: apiResult.user.full_name,
        wallet_address: apiResult.user.wallet_address,
        phone: apiResult.user.phone,
        farm_name: apiResult.user.farm_name,
        current_crop: apiResult.user.current_crop,
      });
      storage.set(StorageKeys.AUTH_METHOD, 'pin');

      // Redirect to dashboard
      router.push('/dashboard');

    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Solid Light Background - Single Color */}
      <div className="absolute inset-0 bg-[#f8fafc] dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"></div>

      {/* Animated Purple Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-violet-500/20 dark:bg-violet-600/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/20 dark:bg-purple-600/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-fuchsia-500/20 dark:bg-fuchsia-600/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-xs relative z-10 border-2 border-violet-200 dark:border-violet-800 shadow-2xl shadow-violet-500/20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
        <CardHeader className="text-center pb-2">
          <div className="mb-2 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full blur opacity-50 animate-pulse"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-xl shadow-violet-500/50">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>
          <CardTitle style={{ fontSize: '12px' }}>Đăng nhập</CardTitle>
          <CardDescription style={{ fontSize: '8px' }}>
            Chọn phương thức đăng nhập
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Auth Method Tabs - Compliant Colors */}
            <div className="flex gap-1 p-0.5 bg-white/50 dark:bg-slate-800/50 rounded-md border border-violet-200 dark:border-violet-700">
              <button
                onClick={() => setAuthMethod('passkey')}
                className={`flex-1 py-1.5 px-2 rounded-sm font-bold transition-all duration-200 ${
                  authMethod === 'passkey'
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60'
                }`}
                style={{ fontSize: '8px' }}
              >
                <svg className="w-3 h-3 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
                Passkey
              </button>
              <button
                onClick={() => setAuthMethod('pin')}
                className={`flex-1 py-1.5 px-2 rounded-sm font-bold transition-all duration-200 ${
                  authMethod === 'pin'
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60'
                }`}
                style={{ fontSize: '8px' }}
              >
                <svg className="w-3 h-3 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                PIN
              </button>
            </div>

            {/* Error - Purple Themed Alert */}
            {error && (
              <div className="p-2 bg-gradient-to-r from-red-50 to-rose-50 border border-red-300 rounded-md text-xs text-red-700 font-semibold flex items-center gap-1.5 shadow-md animate-scale-in">
                <span className="text-sm">❌</span>
                <span>{error}</span>
              </div>
            )}

            {/* Passkey Login - Modern UI */}
            {authMethod === 'passkey' && (
              <div className="space-y-3 animate-fade-in">
                <div className="text-center py-4 relative">
                  <div className="relative inline-block">
                    <div className="absolute -inset-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                    <div className="relative mb-2 animate-bounce-slow">
                      <svg className="w-10 h-10 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-slate-600 font-medium" style={{ fontSize: '8px' }}>
                    Đăng nhập bằng <span className="font-bold text-violet-600">vân tay</span> / <span className="font-bold text-violet-600">Face ID</span>
                  </p>
                </div>

                <Button
                  onClick={handlePasskeyLogin}
                  disabled={loading}
                  className="w-full h-9"
                  style={{ fontSize: '8px' }}
                  size="sm"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Đang đăng nhập...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                      </svg>
                      Đăng nhập bằng vân tay
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
            )}

            {/* PIN Login - Modern UI */}
            {authMethod === 'pin' && (
              <div className="space-y-3 animate-fade-in">
                <div className="text-center py-3 relative">
                  <div className="relative inline-block">
                    <div className="absolute -inset-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                    <div className="relative mb-1.5 animate-bounce-slow">
                      <svg className="w-10 h-10 text-violet-600 dark:text-violet-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium" style={{ fontSize: '8px' }}>
                    Email/SĐT và PIN
                  </p>
                </div>

                <div>
                  <Label htmlFor="emailOrPhone" className="!text-violet-700" style={{ fontSize: '6px' }}>Email/SĐT</Label>
                  <Input
                    id="emailOrPhone"
                    type="text"
                    placeholder="0912345678"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    disabled={loading}
                    className="h-8 border focus:border-violet-500 focus:ring-violet-500"
                    style={{ fontSize: '8px' }}
                  />
                </div>

                <div>
                  <Label htmlFor="pin" className="!text-violet-700" style={{ fontSize: '6px' }}>Mã PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={loading}
                    maxLength={6}
                    className="h-8 border focus:border-violet-500 focus:ring-violet-500 tracking-widest text-center"
                    style={{ fontSize: '10px' }}
                  />
                </div>

                <Button
                  onClick={handlePINLogin}
                  disabled={loading}
                  className="w-full h-9"
                  style={{ fontSize: '8px' }}
                  size="sm"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Đang đăng nhập...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      Đăng nhập
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Register Link - Purple Gradient */}
            <div className="text-center pt-3 border-t border-violet-200">
              <p className="text-slate-600 dark:text-slate-400 font-semibold" style={{ fontSize: '11px' }}>
                Chưa có tài khoản?{' '}
                <a 
                  href="/auth/register" 
                  className="font-bold bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent hover:from-violet-700 hover:to-purple-700 dark:hover:from-violet-300 dark:hover:to-purple-300 transition-all"
                >
                  Đăng ký →
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Elements for Visual Interest */}
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

