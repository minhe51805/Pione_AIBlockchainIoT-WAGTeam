'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import RealtimeIoT from '@/components/dashboard/RealtimeIoT';
import DateSelector from '@/components/dashboard/DateSelector';
import AIHistory from '@/components/dashboard/AIHistory';
import SimplifiedDashboard from '@/components/dashboard/SimplifiedDashboard';

interface UserInfo {
  id: number;
  full_name: string;
  wallet_address: string;
  phone?: string;
  email?: string;
  farm_name?: string;
  current_crop?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [simpleMode, setSimpleMode] = useState(() => {
    // Load user preference from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dashboard_simple_mode') === 'true';
    }
    return true; // Default to simple mode for seniors
  });

  const toggleMode = () => {
    const newMode = !simpleMode;
    setSimpleMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard_simple_mode', newMode.toString());
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('aquamind_user');
    if (!userStr) {
      router.push('/auth/login');
      return;
    }
    
    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setLoading(false);
    } catch (err) {
      router.push('/auth/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('aquamind_user');
    localStorage.removeItem('aquamind_auth_method');
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#faf0e6' }}>
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full opacity-20 animate-ping" style={{ background: 'linear-gradient(to right, #b87333, #d4a574)' }}></div>
            <div className="relative w-24 h-24 border-4 rounded-full animate-spin" style={{ borderColor: '#b87333' }}></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <span className="text-4xl">🌱</span>
            </div>
          </div>
          <div className="text-xl font-semibold" style={{ color: '#b87333' }}>
            Initializing AgroTwin...
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#faf0e6' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top, rgba(184, 115, 51, 0.05), #faf0e6)' }}></div>
        <div className="absolute top-0 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ backgroundColor: 'rgba(184, 115, 51, 0.15)' }}></div>
        <div className="absolute top-0 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" style={{ backgroundColor: 'rgba(212, 165, 116, 0.15)' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" style={{ backgroundColor: 'rgba(184, 115, 51, 0.1)' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Unique Navigation */}
        <nav className="border-b-2 backdrop-blur-xl" style={{ borderColor: '#b87333', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo with Farm Theme */}
          <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000" style={{ background: 'linear-gradient(to right, #b87333, #d4a574)' }}></div>
                  <div className="relative px-4 py-3 bg-white rounded-2xl flex items-center gap-3 border-2" style={{ borderColor: '#d4a574' }}>
                    <div className="text-2xl animate-bounce-slow">🌾</div>
            <div>
                      <h1 className="text-xl font-bold animate-gradient" style={{ color: '#b87333' }}>
                        AgroTwin
                      </h1>
                      <p className="text-xs" style={{ color: '#9b7653' }}>Smart Farming</p>
                    </div>
                  </div>
            </div>
          </div>

              {/* User Card */}
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-white backdrop-blur-sm rounded-2xl border-2 transition-all group" style={{ borderColor: '#d4a574' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white" style={{ background: 'linear-gradient(135deg, #b87333, #d4a574)' }}>
                    {user.full_name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold transition-colors" style={{ color: '#2d2d2d' }}>
                      {user.full_name}
                    </p>
                    <p className="text-xs" style={{ color: '#9b7653' }}>{user.farm_name || '🌱 Farmer'}</p>
                  </div>
                </div>

                {/* TOGGLE SIMPLE/ADVANCED MODE */}
                <button
                  onClick={toggleMode}
                  className="relative group px-4 py-2.5 bg-white rounded-xl border-2 transition-all flex items-center gap-2"
                  style={{ borderColor: simpleMode ? '#10b981' : '#b87333' }}
                  title={simpleMode ? 'Chuyển sang chế độ chi tiết' : 'Chuyển sang chế độ đơn giản'}
                >
                  <span className="text-xl">{simpleMode ? '👴' : '🔬'}</span>
                  <span className="text-sm font-semibold hidden lg:block" style={{ color: simpleMode ? '#10b981' : '#b87333' }}>
                    {simpleMode ? 'Đơn giản' : 'Chi tiết'}
                  </span>
                </button>

                <button
                  onClick={() => router.push('/settings')}
                  className="relative group p-3 bg-white rounded-xl border-2 transition-all" style={{ borderColor: '#d4a574' }}
                >
                  <svg className="w-5 h-5 transition-colors" style={{ color: '#b87333' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl border-2 transition-all hover:opacity-80"
                  style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', borderColor: 'rgba(220, 38, 38, 0.3)' }}
                >
                  Exit
                </button>
              </div>
          </div>
        </div>
        </nav>

        {/* CONDITIONAL RENDERING: Simple Mode vs Advanced Mode */}
        {simpleMode ? (
          /* SIMPLE MODE - CHO NGƯỜI TRUNG NIÊN */
          <SimplifiedDashboard user={user} onSwitchToAdvanced={toggleMode} />
        ) : (
          /* ADVANCED MODE - CHI TIẾT */
          <>
        {/* Unique Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl blur-2xl" style={{ background: 'linear-gradient(to right, rgba(184, 115, 51, 0.15), rgba(212, 165, 116, 0.15))' }}></div>
            <div className="relative px-8 py-10 bg-white backdrop-blur-xl rounded-3xl border-2 overflow-hidden" style={{ borderColor: '#d4a574' }}>
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl" style={{ background: 'linear-gradient(135deg, rgba(184, 115, 51, 0.08), transparent)' }}></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{ background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.08), transparent)' }}></div>
              
              <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 border-2 rounded-full mb-6" style={{ backgroundColor: 'rgba(184, 115, 51, 0.1)', borderColor: '#d4a574' }}>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#b87333' }}></div>
                    <span className="text-sm font-medium" style={{ color: '#b87333' }}>System Active</span>
                  </div>
                  <h2 className="text-5xl font-bold mb-4" style={{ color: '#b87333' }}>
                    Hey {user.full_name.split(' ')[0]},
              </h2>
                  <p className="text-xl mb-6" style={{ color: '#6b4423' }}>
                    {user.current_crop 
                      ? `Your ${user.current_crop} farm is being monitored 🌱` 
                      : 'Welcome to your smart farming dashboard'}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="px-4 py-2 border-2 rounded-xl" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
                      <p className="text-xs mb-1" style={{ color: '#a855f7' }}>AI Status</p>
                      <p className="text-sm font-semibold" style={{ color: '#2d2d2d' }}>⚡ Ready</p>
            </div>
                    <div className="px-4 py-2 border-2 rounded-xl" style={{ backgroundColor: 'rgba(184, 115, 51, 0.1)', borderColor: '#d4a574' }}>
                      <p className="text-xs mb-1" style={{ color: '#b87333' }}>IoT Sensors</p>
                      <p className="text-sm font-semibold" style={{ color: '#2d2d2d' }}>📡 Online</p>
          </div>
                    <div className="px-4 py-2 border-2 rounded-xl" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                      <p className="text-xs mb-1" style={{ color: '#10b981' }}>Blockchain</p>
                      <p className="text-sm font-semibold" style={{ color: '#2d2d2d' }}>🔗 Synced</p>
          </div>
            </div>
          </div>

                <div className="relative">
                  <div className="absolute -inset-2 rounded-2xl opacity-20 blur-xl" style={{ background: 'linear-gradient(to right, #b87333, #d4a574)' }}></div>
                  <div className="relative p-6 backdrop-blur-sm rounded-2xl border-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: '#d4a574' }}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm" style={{ color: '#6b4423' }}>Your Wallet</span>
                      <span className="px-2 py-1 border rounded-lg text-xs" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981' }}>Verified</span>
                    </div>
                    <div className="font-mono text-sm px-4 py-3 rounded-xl border-2 break-all" style={{ color: '#b87333', backgroundColor: 'rgba(184, 115, 51, 0.05)', borderColor: '#d4a574' }}>
                      {user.wallet_address}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: '#9b7653' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Secured by Zero Network
                    </div>
          </div>
        </div>
                </div>
              </div>
            </div>

          {/* Dashboard Content */}
          <div className="mt-8 grid grid-cols-1 gap-6">
            <DashboardOverview />
            <RealtimeIoT />
            <DateSelector />
            <AIHistory />
        </div>

          {/* Unique Footer */}
          <footer className="mt-16 pt-8 border-t-2" style={{ borderColor: '#d4a574' }}>
            <div className="text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white backdrop-blur-sm rounded-2xl border-2 mb-4" style={{ borderColor: '#d4a574' }}>
                <span className="text-2xl animate-pulse">🌾</span>
                <div className="text-left">
                  <p className="text-sm font-semibold" style={{ color: '#b87333' }}>Pione AgroTwin</p>
                  <p className="text-xs" style={{ color: '#9b7653' }}>AI + Blockchain + IoT for Smart Farming</p>
                </div>
              </div>
              <p className="text-xs" style={{ color: '#6b4423' }}>
                Powered by{' '}
                <a 
                  href="https://zeroscan.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-colors underline decoration-dotted hover:opacity-80"
                  style={{ color: '#b87333' }}
                >
                  Zero Network
                </a>
                {' '}• Designed for Vietnamese Farmers 🇻🇳
              </p>
        </div>
      </footer>
        </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
