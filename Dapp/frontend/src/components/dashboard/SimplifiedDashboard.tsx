'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserInfo {
  full_name: string;
  farm_name?: string;
}

interface SensorData {
  temperature: number;
  moisture: number;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  timestamp: string;
}

interface SimplifiedDashboardProps {
  user: UserInfo;
  onSwitchToAdvanced?: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_FLASK_API || '';

export default function SimplifiedDashboard({ user, onSwitchToAdvanced }: SimplifiedDashboardProps) {
  const router = useRouter();
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSensorData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard/realtime-iot?hours=24`);
      const data = await res.json();
      
      if (data.success && data.latest) {
        setSensorData({
          temperature: data.latest.air_temperature_c || data.latest.soil_temperature_c || 0,
          moisture: data.latest.soil_moisture_pct || 0,
          ph: data.latest.ph_value || 0,
          nitrogen: data.latest.nitrogen_mg_kg || 0,
          phosphorus: data.latest.phosphorus_mg_kg || 0,
          potassium: data.latest.potassium_mg_kg || 0,
          timestamp: data.latest.measured_at || new Date().toISOString()
        });
        setError(null);
      } else {
        setError('Không có dữ liệu từ cảm biến');
      }
    } catch (err: any) {
      console.error('Error fetching sensor data:', err);
      setError('Không kết nối được với hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const getSoilHealthStatus = (moisture: number, ph: number) => {
    if (moisture >= 40 && moisture <= 60 && ph >= 6.0 && ph <= 7.5) {
      return { text: 'TỐT', color: '#10b981', icon: '✅', bg: 'rgba(16, 185, 129, 0.1)' };
    } else if (moisture >= 30 && moisture <= 70 && ph >= 5.5 && ph <= 8.0) {
      return { text: 'TRUNG BÌNH', color: '#f59e0b', icon: '⚠️', bg: 'rgba(245, 158, 11, 0.1)' };
    } else {
      return { text: 'CẦN CHÚ Ý', color: '#ef4444', icon: '❌', bg: 'rgba(239, 68, 68, 0.1)' };
    }
  };

  const status = sensorData ? getSoilHealthStatus(sensorData.moisture, sensorData.ph) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Welcome Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-violet-200 dark:border-violet-700 shadow-lg mb-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 flex-shrink-0">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1">
              Xin chào, {user.full_name}!
            </h1>
            {user.farm_name && (
              <p className="flex items-center gap-2 text-base sm:text-lg font-semibold text-violet-600 dark:text-violet-400">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {user.farm_name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-gray-200 dark:border-slate-700 shadow-lg">
        {/* Header with Refresh Button */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Tình Trạng Đất
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={fetchSensorData}
              disabled={loading}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-800/50 border-2 border-violet-300 dark:border-violet-700 transition-all flex items-center gap-2 disabled:opacity-50 hover:shadow-lg text-violet-700 dark:text-violet-300 font-bold text-sm sm:text-base"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">{loading ? 'Đang tải...' : 'Làm mới'}</span>
            </button>
            {sensorData && status && (
              <div 
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl border-2 flex items-center gap-2 sm:gap-3 shadow-md"
                style={{ 
                  backgroundColor: status.bg,
                  borderColor: status.color,
                }}
              >
                <span className="text-xl sm:text-2xl">{status.icon}</span>
                <span className="text-sm sm:text-lg font-black" style={{ color: status.color }}>
                  {status.text}
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 sm:p-5 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-bold text-red-800 dark:text-red-300 text-base sm:text-lg">Lỗi kết nối</p>
              <p className="text-sm sm:text-base text-red-700 dark:text-red-400 mt-1">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 sm:mt-6 text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300">Đang tải dữ liệu...</p>
          </div>
        ) : sensorData ? (
          <>
            {/* Main Sensor Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
              {/* Temperature Card */}
              <div className="p-5 sm:p-6 rounded-xl bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-300 dark:border-orange-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-orange-700 dark:text-orange-300">Nhiệt Độ</h3>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2">
                  {sensorData.temperature.toFixed(1)}°C
                </div>
                <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400">
                  Tối ưu: 20-30°C
                </p>
              </div>

              {/* Moisture Card */}
              <div className="p-5 sm:p-6 rounded-xl bg-sky-50 dark:bg-sky-900/10 border-2 border-sky-300 dark:border-sky-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-sky-700 dark:text-sky-300">Độ Ẩm</h3>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2">
                  {sensorData.moisture.toFixed(1)}%
                </div>
                <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400">
                  Tối ưu: 40-60%
                </p>
              </div>

              {/* pH Card */}
              <div className="p-5 sm:p-6 rounded-xl bg-violet-50 dark:bg-violet-900/10 border-2 border-violet-300 dark:border-violet-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-violet-700 dark:text-violet-300">Độ pH</h3>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2">
                  {sensorData.ph.toFixed(1)}
                </div>
                <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400">
                  Tối ưu: 6.0-7.5
                </p>
              </div>
            </div>

            {/* Nutrients Section */}
            <div className="pt-6 border-t-2 border-gray-200 dark:border-slate-700">
              <h3 className="flex items-center gap-3 text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Chất Dinh Dưỡng Đất
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Nitrogen */}
                <div className="p-4 sm:p-5 rounded-xl bg-green-50 dark:bg-green-900/10 border-2 border-green-300 dark:border-green-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-black text-lg shadow-sm">N</div>
                    <h4 className="text-sm sm:text-base font-bold text-green-700 dark:text-green-300">Nitơ (N)</h4>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1">
                    {sensorData.nitrogen.toFixed(0)} <span className="text-base sm:text-lg font-semibold text-gray-600 dark:text-gray-400">mg/kg</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Cho lá xanh tươi</p>
                </div>

                {/* Phosphorus */}
                <div className="p-4 sm:p-5 rounded-xl bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-300 dark:border-orange-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-black text-lg shadow-sm">P</div>
                    <h4 className="text-sm sm:text-base font-bold text-orange-700 dark:text-orange-300">Phốt pho (P)</h4>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1">
                    {sensorData.phosphorus.toFixed(0)} <span className="text-base sm:text-lg font-semibold text-gray-600 dark:text-gray-400">mg/kg</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Cho rễ phát triển</p>
                </div>

                {/* Potassium */}
                <div className="p-4 sm:p-5 rounded-xl bg-pink-50 dark:bg-pink-900/10 border-2 border-pink-300 dark:border-pink-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white font-black text-lg shadow-sm">K</div>
                    <h4 className="text-sm sm:text-base font-bold text-pink-700 dark:text-pink-300">Kali (K)</h4>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1">
                    {sensorData.potassium.toFixed(0)} <span className="text-base sm:text-lg font-semibold text-gray-600 dark:text-gray-400">mg/kg</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Cho cây khỏe mạnh</p>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="pt-6 mt-6 border-t-2 border-gray-200 dark:border-slate-700">
              <p className="flex items-center gap-2 text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5 text-violet-600 dark:text-violet-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Cập nhật lần cuối: 
                <span className="font-bold text-violet-600 dark:text-violet-400">
                  {new Date(sensorData.timestamp).toLocaleString('vi-VN')}
                </span>
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-lg sm:text-xl font-bold text-gray-600 dark:text-gray-400">Chưa có dữ liệu cảm biến</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-6">
        <button
          onClick={onSwitchToAdvanced}
          className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-left transition-all hover:shadow-xl hover:shadow-violet-500/50 hover:scale-105 active:scale-100 text-white"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-black mb-1">Xem Chi Tiết</h3>
              <p className="text-sm sm:text-base font-medium opacity-90">Chuyển sang chế độ chi tiết</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/settings')}
          className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 text-left transition-all hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 active:scale-100 text-white"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-black mb-1">Cài Đặt</h3>
              <p className="text-sm sm:text-base font-medium opacity-90">Quản lý tài khoản</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}


