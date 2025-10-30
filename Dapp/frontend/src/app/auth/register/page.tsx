'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { passkeyService } from '@/services/passkeyService';
import { generateWalletAddress } from '@/services/walletFromPasskey';
import { registerPasskey, registerWithPIN } from '@/services/authService';
import { storage, StorageKeys } from '@/lib/utils';

const CROPS = [
  'coffee', 'rice', 'maize', 'banana', 'mango', 'coconut', 
  'orange', 'apple', 'grapes', 'cotton', 'jute'
];

type AuthMethod = 'passkey' | 'pin';

export default function RegisterPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<AuthMethod>('passkey');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    farm_name: '',
    current_crop: 'coffee',
    farm_area_hectares: '',
    pin: '', // For PIN method
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasskeyRegister = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate
      if (!formData.full_name || !formData.phone) {
        throw new Error('Vui lòng nhập tên và số điện thoại');
      }

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
          '💡 Gợi ý: Hãy đăng ký bằng PIN (tab bên cạnh) để sử dụng trên mọi thiết bị!'
        );
        setLoading(false);
        return;
      }

      console.log('🔐 Starting Passkey registration...');

      // Register Passkey
      const passkeyResult = await passkeyService.register(formData.full_name);

      if (!passkeyResult.success) {
        throw new Error('Đăng ký vân tay thất bại');
      }

      console.log('✅ Passkey registered:', passkeyResult.credentialId);

      // Generate wallet address
      const walletAddress = generateWalletAddress(passkeyResult.credentialId);
      console.log('💰 Wallet created:', walletAddress);

      // Register with backend
      const registerData = {
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email || undefined,
        farm_name: formData.farm_name || undefined,
        farm_area_hectares: formData.farm_area_hectares ? parseFloat(formData.farm_area_hectares) : undefined,
        current_crop: formData.current_crop,
        passkey_credential_id: passkeyResult.credentialId,
        passkey_public_key: passkeyResult.publicKey,
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
        current_crop: formData.current_crop,
      });
      storage.set(StorageKeys.AUTH_METHOD, 'passkey');

      alert(`✅ Đăng ký thành công!\n\nVí của bạn: ${walletAddress}\n\nBạn có thể đăng nhập bằng vân tay/Face ID`);

      // Redirect to dashboard
      router.push('/dashboard');

    } catch (err: any) {
      console.error('❌ Registration error:', err);
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handlePINRegister = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate
      if (!formData.full_name || !formData.phone || !formData.pin) {
        throw new Error('Vui lòng nhập đầy đủ thông tin');
      }

      if (formData.pin.length < 4) {
        throw new Error('Mã PIN phải có ít nhất 4 số');
      }

      console.log('🔐 Starting PIN registration...');

      // Generate wallet address from phone number (simple method)
      const walletAddress = generateWalletAddress(formData.phone);
      console.log('💰 Wallet created:', walletAddress);

      // Register with backend
      const registerData = {
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email || undefined,
        farm_name: formData.farm_name || undefined,
        farm_area_hectares: formData.farm_area_hectares ? parseFloat(formData.farm_area_hectares) : undefined,
        current_crop: formData.current_crop,
        pin: formData.pin,
        wallet_address: walletAddress,
      };

      const apiResult = await registerWithPIN(registerData);

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
        current_crop: formData.current_crop,
      });
      storage.set(StorageKeys.AUTH_METHOD, 'pin');

      alert(`✅ Đăng ký thành công!\n\nVí của bạn: ${walletAddress}\n\nBạn có thể đăng nhập bằng số điện thoại và PIN`);

      // Redirect to dashboard
      router.push('/dashboard');

    } catch (err: any) {
      console.error('❌ Registration error:', err);
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">🌾 Đăng ký tài khoản</CardTitle>
          <CardDescription>
            Chọn phương thức đăng ký phù hợp với bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Auth Method Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setAuthMethod('passkey')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  authMethod === 'passkey'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                🔐 Passkey
              </button>
              <button
                onClick={() => setAuthMethod('pin')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  authMethod === 'pin'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                🔢 PIN
              </button>
            </div>

            {/* Common Fields */}
            <div>
              <Label htmlFor="full_name">Họ và tên *</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                disabled={loading}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0912345678"
                disabled={loading}
                required
              />
            </div>

            {/* PIN Field - Only for PIN method */}
            {authMethod === 'pin' && (
              <div>
                <Label htmlFor="pin">Mã PIN (4-6 số) *</Label>
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
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email (tùy chọn)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="farm_name">Tên nông trại (tùy chọn)</Label>
              <Input
                id="farm_name"
                name="farm_name"
                value={formData.farm_name}
                onChange={handleChange}
                placeholder="Nông trại cà phê Đà Lạt"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="current_crop">Cây trồng hiện tại</Label>
              <select
                id="current_crop"
                name="current_crop"
                value={formData.current_crop}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                disabled={loading}
              >
                {CROPS.map(crop => (
                  <option key={crop} value={crop}>
                    {crop.charAt(0).toUpperCase() + crop.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="farm_area_hectares">Diện tích (hectares, tùy chọn)</Label>
              <Input
                id="farm_area_hectares"
                name="farm_area_hectares"
                type="number"
                step="0.1"
                value={formData.farm_area_hectares}
                onChange={handleChange}
                placeholder="2.5"
                disabled={loading}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                ❌ {error}
              </div>
            )}

            {/* Register Button */}
            <Button
              onClick={authMethod === 'passkey' ? handlePasskeyRegister : handlePINRegister}
              disabled={loading}
              className={`w-full ${
                authMethod === 'passkey' 
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              size="lg"
            >
              {loading ? '⏳ Đang đăng ký...' : authMethod === 'passkey' ? '🔐 Đăng ký bằng vân tay' : '🔢 Đăng ký bằng PIN'}
            </Button>

            {/* Info */}
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>✨ Ví blockchain sẽ được tạo tự động</p>
              <p>🔒 Dữ liệu được mã hóa và bảo mật</p>
            </div>

            {/* Login Link */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <a href="/auth/login" className="text-blue-600 hover:underline font-medium">
                  Đăng nhập
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

