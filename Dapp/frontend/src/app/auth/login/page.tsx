'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
      const apiResult = await loginPasskey(passkeyResult.credentialId || '');

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

      // Check for callback URL (for Zalo linking)
      const callbackUrl = localStorage.getItem('login_callback_url');
      if (callbackUrl) {
        localStorage.removeItem('login_callback_url');
        router.push(callbackUrl);
      } else {
        // Redirect to dashboard
        router.push('/dashboard');
      }

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

      // Check for callback URL (for Zalo linking)
      const callbackUrl = localStorage.getItem('login_callback_url');
      if (callbackUrl) {
        localStorage.removeItem('login_callback_url');
        router.push(callbackUrl);
      } else {
        // Redirect to dashboard
        router.push('/dashboard');
      }

    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">🌾 Đăng nhập</CardTitle>
          <CardDescription>
            Chọn phương thức đăng nhập phù hợp với bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Auth Method Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setAuthMethod('passkey')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${authMethod === 'passkey'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                🔐 Passkey
              </button>
              <button
                onClick={() => setAuthMethod('pin')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${authMethod === 'pin'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                🔢 PIN
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                ❌ {error}
              </div>
            )}

            {/* Passkey Login */}
            {authMethod === 'passkey' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="text-8xl mb-4">🔐</div>
                  <p className="text-gray-600">
                    Chạm vào nút bên dưới để đăng nhập<br />
                    bằng vân tay hoặc Face ID
                  </p>
                </div>

                <Button
                  onClick={handlePasskeyLogin}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {loading ? '⏳ Đang đăng nhập...' : '🔐 Đăng nhập bằng vân tay'}
                </Button>

                <div className="text-xs text-gray-500 text-center space-y-1">
                  <p>🔒 Xác thực an toàn với sinh trắc học</p>
                  <p>✨ Không cần nhập mật khẩu</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-sm text-blue-900 mb-2">
                    📱 Yêu cầu thiết bị:
                  </h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• iPhone/iPad với Face ID hoặc Touch ID</li>
                    <li>• Android với cảm biến vân tay</li>
                    <li>• Windows Hello trên PC</li>
                    <li>• MacBook với Touch ID</li>
                  </ul>
                </div>
              </div>
            )}

            {/* PIN Login */}
            {authMethod === 'pin' && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-6xl mb-2">🔢</div>
                  <p className="text-gray-600">
                    Đăng nhập bằng email hoặc số điện thoại và mã PIN
                  </p>
                </div>

                <div>
                  <Label htmlFor="emailOrPhone">Email hoặc Số điện thoại</Label>
                  <Input
                    id="emailOrPhone"
                    type="text"
                    placeholder="example@email.com hoặc 0912345678"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="pin">Mã PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={loading}
                    maxLength={6}
                  />
                </div>

                <Button
                  onClick={handlePINLogin}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {loading ? '⏳ Đang đăng nhập...' : '🔓 Đăng nhập'}
                </Button>

                <div className="text-xs text-gray-500 text-center space-y-1">
                  <p>💡 Đơn giản và dễ sử dụng</p>
                  <p>🔒 Bảo mật với mã PIN cá nhân</p>
                </div>
              </div>
            )}

            {/* Register Link */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

