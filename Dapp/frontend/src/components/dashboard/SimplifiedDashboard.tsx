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

const API_URL = process.env.NEXT_PUBLIC_FLASK_API || 'http://localhost:5000';

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
    <div className="max-w-6xl mx-auto px-6 py-8 senior-spacing">
      <div className="senior-card bg-white border-3 mb-8" style={{ borderColor: '#b87333' }}>
        <div className="flex items-center gap-6">
          <div className="text-6xl">👨‍🌾</div>
          <div>
            <h1 style={{ color: '#b87333', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              Xin chào, {user.full_name}!
            </h1>
            {user.farm_name && (
              <p style={{ color: '#6b4423', fontSize: '1.3rem' }}>
                🌾 {user.farm_name}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="senior-card bg-white border-3 mb-8" style={{ borderColor: status?.color || '#d4a574' }}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 style={{ color: '#2d2d2d', fontSize: '2rem' }}>
            📊 Tình Trạng Đất
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchSensorData}
              disabled={loading}
              className="px-6 py-3 rounded-xl border-3 transition-all flex items-center gap-3 disabled:opacity-50"
              style={{ 
                backgroundColor: loading ? 'rgba(156, 163, 175, 0.1)' : 'rgba(184, 115, 51, 0.1)',
                borderColor: loading ? '#9ca3af' : '#b87333',
                color: loading ? '#9ca3af' : '#b87333',
                fontSize: '1.2rem',
                fontWeight: '600'
              }}
            >
              <span className="text-2xl">{loading ? '⏳' : '🔄'}</span>
              <span>{loading ? 'Đang tải...' : 'Làm mới'}</span>
            </button>
            {sensorData && (
              <div 
                className="px-8 py-4 rounded-2xl border-3 flex items-center gap-4"
                style={{ 
                  backgroundColor: status?.bg,
                  borderColor: status?.color,
                }}
              >
                <span style={{ fontSize: '2.5rem' }}>{status?.icon}</span>
                <span style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700',
                  color: status?.color
                }}>
                  {status?.text}
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-6 border-3 rounded-2xl flex items-center gap-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' }}>
            <span className="text-4xl">⚠️</span>
            <div>
              <p className="text-xl font-bold" style={{ color: '#ef4444' }}>Lỗi kết nối</p>
              <p className="text-lg" style={{ color: '#6b4423' }}>{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 border-6 rounded-full animate-spin mx-auto" style={{ borderColor: '#b87333', borderTopColor: 'transparent' }}></div>
            <p className="mt-6 text-2xl" style={{ color: '#6b4423' }}>Đang tải dữ liệu...</p>
          </div>
        ) : sensorData ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="senior-card border-3" style={{ backgroundColor: 'rgba(184, 115, 51, 0.05)', borderColor: '#d4a574' }}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">🌡️</span>
                  <h3 style={{ color: '#b87333', fontSize: '1.5rem' }}>Nhiệt Độ</h3>
                </div>
                <div style={{ color: '#2d2d2d', fontSize: '3.5rem', fontWeight: '700' }}>
                  {sensorData.temperature.toFixed(1)}°C
                </div>
                <p style={{ color: '#6b4423', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                  Tối ưu: 20-30°C
                </p>
              </div>

              <div className="senior-card border-3" style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', borderColor: '#60a5fa' }}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">💧</span>
                  <h3 style={{ color: '#3b82f6', fontSize: '1.5rem' }}>Độ Ẩm</h3>
                </div>
                <div style={{ color: '#2d2d2d', fontSize: '3.5rem', fontWeight: '700' }}>
                  {sensorData.moisture.toFixed(1)}%
                </div>
                <p style={{ color: '#6b4423', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                  Tối ưu: 40-60%
                </p>
              </div>

              <div className="senior-card border-3" style={{ backgroundColor: 'rgba(168, 85, 247, 0.05)', borderColor: '#c084fc' }}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">⚗️</span>
                  <h3 style={{ color: '#9333ea', fontSize: '1.5rem' }}>Độ pH</h3>
                </div>
                <div style={{ color: '#2d2d2d', fontSize: '3.5rem', fontWeight: '700' }}>
                  {sensorData.ph.toFixed(1)}
                </div>
                <p style={{ color: '#6b4423', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                  Tối ưu: 6.0-7.5
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3" style={{ color: '#2d2d2d' }}>
                <span className="text-4xl">🌿</span>
                Chất Dinh Dưỡng Đất
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="senior-card border-3" style={{ backgroundColor: 'rgba(34, 197, 94, 0.05)', borderColor: '#22c55e' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">N</span>
                    <h4 style={{ color: '#22c55e', fontSize: '1.3rem' }}>Nitơ (N)</h4>
                  </div>
                  <div style={{ color: '#2d2d2d', fontSize: '2.5rem', fontWeight: '700' }}>
                    {sensorData.nitrogen.toFixed(0)} <span style={{ fontSize: '1.2rem', color: '#6b4423' }}>mg/kg</span>
                  </div>
                  <p style={{ color: '#6b4423', fontSize: '1rem', marginTop: '0.5rem' }}>
                    Cho lá xanh tươi
                  </p>
                </div>

                <div className="senior-card border-3" style={{ backgroundColor: 'rgba(249, 115, 22, 0.05)', borderColor: '#f97316' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">P</span>
                    <h4 style={{ color: '#f97316', fontSize: '1.3rem' }}>Phốt pho (P)</h4>
                  </div>
                  <div style={{ color: '#2d2d2d', fontSize: '2.5rem', fontWeight: '700' }}>
                    {sensorData.phosphorus.toFixed(0)} <span style={{ fontSize: '1.2rem', color: '#6b4423' }}>mg/kg</span>
                  </div>
                  <p style={{ color: '#6b4423', fontSize: '1rem', marginTop: '0.5rem' }}>
                    Cho rễ phát triển
                  </p>
                </div>

                <div className="senior-card border-3" style={{ backgroundColor: 'rgba(236, 72, 153, 0.05)', borderColor: '#ec4899' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">K</span>
                    <h4 style={{ color: '#ec4899', fontSize: '1.3rem' }}>Kali (K)</h4>
                  </div>
                  <div style={{ color: '#2d2d2d', fontSize: '2.5rem', fontWeight: '700' }}>
                    {sensorData.potassium.toFixed(0)} <span style={{ fontSize: '1.2rem', color: '#6b4423' }}>mg/kg</span>
                  </div>
                  <p style={{ color: '#6b4423', fontSize: '1rem', marginTop: '0.5rem' }}>
                    Cho cây khỏe mạnh
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📡</span>
            <p className="text-2xl" style={{ color: '#6b4423' }}>Chưa có dữ liệu cảm biến</p>
          </div>
        )}

        {sensorData && (
          <div className="mt-8 pt-6 border-t-3" style={{ borderColor: '#d4a574' }}>
            <p style={{ color: '#6b4423', fontSize: '1.2rem' }}>
              📅 Cập nhật lần cuối: <span style={{ fontWeight: '600', color: '#2d2d2d' }}>
                {new Date(sensorData.timestamp).toLocaleString('vi-VN')}
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={onSwitchToAdvanced}
          className="senior-card bg-white border-3 text-left transition-all hover:shadow-2xl animate-pulse-gentle"
          style={{ 
            borderColor: '#b87333',
            minHeight: '160px',
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            padding: '2rem 3rem'
          }}
        >
          <span className="text-7xl">📈</span>
          <div>
            <h3 style={{ color: '#b87333', fontSize: '2rem', marginBottom: '0.5rem' }}>
              Xem Chi Tiết
            </h3>
            <p style={{ color: '#6b4423', fontSize: '1.2rem' }}>
              Chuyển sang chế độ chi tiết
            </p>
          </div>
        </button>

        <button
          onClick={() => router.push('/settings')}
          className="senior-card bg-white border-3 text-left transition-all hover:shadow-2xl"
          style={{ 
            borderColor: '#b87333',
            minHeight: '160px',
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            padding: '2rem 3rem'
          }}
        >
          <span className="text-7xl">⚙️</span>
          <div>
            <h3 style={{ color: '#b87333', fontSize: '2rem', marginBottom: '0.5rem' }}>
              Cài Đặt
            </h3>
            <p style={{ color: '#6b4423', fontSize: '1.2rem' }}>
              Quản lý tài khoản
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

