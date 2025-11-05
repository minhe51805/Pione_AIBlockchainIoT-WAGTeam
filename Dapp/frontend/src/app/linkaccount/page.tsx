'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Loader, Zap, Link } from 'lucide-react';

interface LinkAccountResponse {
  success: boolean;
  message: string;
  zalo_id?: string;
  user_id?: number;
  full_name?: string;
  error?: string;
}

export default function LinkAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [status, setStatus] = useState<'checking' | 'ready' | 'linking' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('Đang kiểm tra...');
  const [errorMessage, setErrorMessage] = useState('');

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Check if user is logged in
  const checkAuthentication = async () => {
    try {
      setMessage('Đang kiểm tra đăng nhập...');
      
      // Check token first
      if (!token) {
        setStatus('error');
        setErrorMessage('Liên kết không hợp lệ. Token bị thiếu.');
        return;
      }
      
      // Check localStorage for user session (FIX: use correct key)
      const userInfo = localStorage.getItem('aquamind_user');
      
      if (!userInfo) {
        // Not logged in - redirect to login with callback
        setStatus('error');
        setErrorMessage('Bạn cần đăng nhập để liên kết tài khoản Zalo.');
        
        // Store the callback URL with token
        const callbackUrl = `/linkaccount?token=${token}`;
        localStorage.setItem('login_callback_url', callbackUrl);
        
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
        return;
      }

      const user = JSON.parse(userInfo);
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      setStatus('ready');
      setMessage('Sẵn sàng liên kết tài khoản');
    } catch (error) {
      console.error('Auth check error:', error);
      setStatus('error');
      setErrorMessage('Lỗi khi kiểm tra trạng thái đăng nhập');
    }
  };

  // Handle Zalo account linking
  const handleLinkAccount = async () => {
    if (!token || !currentUser) {
      setStatus('error');
      setErrorMessage('Thông tin liên kết không đầy đủ');
      return;
    }

    setIsLoading(true);
    setStatus('linking');
    setMessage('Đang liên kết tài khoản...');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/zalo/link-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          user_id: currentUser.id,
        }),
      });

      const data: LinkAccountResponse = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Tài khoản Zalo đã được liên kết thành công!');
        
        // Update user info in localStorage
        const updatedUser = {
          ...currentUser,
          zalo_id: data.zalo_id,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Clean up pending token
        localStorage.removeItem('pending_zalo_link_token');
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Lỗi khi liên kết tài khoản');
      }
    } catch (error) {
      console.error('Link account error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Lỗi khi liên kết tài khoản');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 via-green-600 to-blue-600 px-6 py-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-5"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <Link className="w-8 h-8" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-center">Liên kết Zalo</h1>
              <p className="text-center text-green-50 mt-2 text-sm">Kết nối tài khoản Zalo với Pione IoT</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            {/* Token Info (Debug) */}
            {token && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">🔑 Token:</p>
                <p className="text-xs font-mono text-gray-700 truncate">{token}</p>
              </div>
            )}

            {/* User Info Display */}
            {isAuthenticated && currentUser && (
              <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                    {currentUser.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">Tài khoản</p>
                    <p className="text-xl font-bold text-gray-900">{currentUser.full_name}</p>
                    {currentUser.phone && (
                      <p className="text-sm text-gray-600 mt-1.5 flex items-center gap-1">
                        <span className="text-blue-500">📱</span> {currentUser.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Status Messages */}
            {status === 'checking' && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative mb-8">
                  <Loader className="w-16 h-16 text-green-500 animate-spin" strokeWidth={3} />
                  <div className="absolute inset-0 w-16 h-16 rounded-full bg-green-100 animate-ping opacity-30"></div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-gray-700 font-bold text-lg">{message}</p>
                  <p className="text-sm text-gray-500">Vui lòng đợi trong giây lát...</p>
                </div>
              </div>
            )}

            {status === 'ready' && (
              <div className="space-y-6">
                <div className="p-5 bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 rounded-2xl border-2 border-green-400 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="font-bold text-green-900 text-xl mb-1">Sẵn sàng liên kết</p>
                      <p className="text-sm text-green-700">{message}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">📋</span>
                    </div>
                    <p className="text-base font-bold text-blue-900">Quy trình liên kết</p>
                  </div>
                  <ol className="space-y-3">
                    <li className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                      <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                      <span className="text-sm text-gray-700">Xác nhận tài khoản của bạn</span>
                    </li>
                    <li className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                      <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                      <span className="text-sm text-gray-700">Kích hoạt liên kết với Zalo</span>
                    </li>
                    <li className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                      <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                      <span className="text-sm text-gray-700">Hoàn tất và chuyển về dashboard</span>
                    </li>
                  </ol>
                </div>

                <button
                  onClick={handleLinkAccount}
                  disabled={isLoading}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-white text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-xl ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 via-emerald-600 to-blue-600 hover:from-green-600 hover:via-emerald-700 hover:to-blue-700 hover:shadow-2xl active:scale-98 transform hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-6 h-6 animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-7 h-7" fill="currentColor" />
                      <span>Liên kết tài khoản Zalo</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {status === 'linking' && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative mb-6">
                  <Loader className="w-16 h-16 text-blue-500 animate-spin" />
                  <div className="absolute inset-0 w-16 h-16 rounded-full bg-blue-100 animate-ping opacity-20"></div>
                </div>
                <p className="text-gray-700 text-center font-bold text-lg">{message}</p>
                <p className="text-sm text-gray-500 text-center mt-3">Vui lòng không tắt trang này...</p>
                <div className="mt-6 flex gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative mb-6">
                  <CheckCircle className="w-20 h-20 text-green-500" />
                  <div className="absolute inset-0 w-20 h-20 rounded-full bg-green-100 animate-ping"></div>
                </div>
                <p className="text-xl font-bold text-green-600 text-center mb-2">
                  {message}
                </p>
                <p className="text-sm text-gray-500 text-center mt-3">
                  ✨ Đang chuyển hướng...
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="p-5 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-300 shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-red-900 text-lg">Có lỗi xảy ra</p>
                      <p className="text-sm text-red-700 mt-2">{errorMessage}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {!isAuthenticated && (
                    <button
                      onClick={() => router.push('/auth/login')}
                      className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      🔐 Đăng nhập
                    </button>
                  )}
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full py-3 px-4 rounded-xl font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                  >
                    ← Quay lại Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <span className="text-lg">🔒</span>
              <span>Liên kết hết hạn sau <strong>5 phút</strong> để đảm bảo an toàn</span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Cần trợ giúp? <a href="#" className="text-green-600 hover:text-green-700 font-semibold underline">Liên hệ hỗ trợ</a>
          </p>
        </div>
      </div>
    </div>
  );
}
