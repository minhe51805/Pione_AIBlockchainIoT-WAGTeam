'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface LatestReading {
  measured_at: string;
  soil_temperature_c: number;
  soil_moisture_pct: number;
  ph_value: number;
  nitrogen_mg_kg: number;
  phosphorus_mg_kg: number;
  potassium_mg_kg: number;
  salt_mg_l: number;
  air_temperature_c: number;
  air_humidity_pct: number;
  is_raining: boolean;
  onchain_status: string;
  conductivity_us_cm: number;
}

interface TrendPoint {
  time: string;
  temp: number;
  moisture: number;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

const API_URL = process.env.NEXT_PUBLIC_FLASK_API || 'http://localhost:5000';

export default function RealtimeIoT() {
  const [latest, setLatest] = useState<LatestReading | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard/realtime-iot?hours=24`);
      const data = await res.json();
      
      if (data.success) {
        setLatest(data.latest);
        setTrend(data.trend_24h || []);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch IoT data');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="relative mb-6">
        <div className="absolute -inset-2 rounded-3xl blur-xl" style={{ background: 'linear-gradient(to right, rgba(184, 115, 51, 0.1), rgba(212, 165, 116, 0.1))' }}></div>
        <div className="relative p-6 bg-white backdrop-blur-xl rounded-2xl border-2 animate-pulse" style={{ borderColor: '#d4a574' }}>
          <div className="h-48 rounded-xl" style={{ backgroundColor: '#f5e6d3' }}></div>
        </div>
      </div>
    );
  }

  if (error || !latest) {
    return (
      <div className="mb-6">
        <div className="p-6 border-2 backdrop-blur-xl rounded-2xl" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', borderColor: 'rgba(234, 179, 8, 0.3)' }}>
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" style={{ color: '#ca8a04' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p style={{ color: '#ca8a04' }}>{error || 'No IoT data available'}</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (value: number, min: number, max: number) => {
    if (value < min || value > max) return { text: '#ef4444', bg: 'linear-gradient(135deg, #ef4444, #f97316)' };
    return { text: '#10b981', bg: 'linear-gradient(135deg, #10b981, #059669)' };
  };

  const soilTempStatus = getStatusColor(latest.soil_temperature_c, 20, 30);
  const soilMoistStatus = getStatusColor(latest.soil_moisture_pct, 40, 60);
  const phStatus = getStatusColor(latest.ph_value, 6.0, 7.5);

  // Chart configuration with Copper theme
  const chartData = {
    labels: trend.map(t => new Date(t.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })),
    datasets: [
      {
        label: 'Soil Temp (°C)',
        data: trend.map(t => t.temp),
        borderColor: '#b87333',
        backgroundColor: 'rgba(184, 115, 51, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Moisture (%)',
        data: trend.map(t => t.moisture),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'pH',
        data: trend.map(t => t.ph),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#6b4423',
          font: { size: 12, weight: '600' }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f5e6d3' },
        ticks: { color: '#6b4423' }
      },
      x: {
        grid: { color: '#f5e6d3' },
        ticks: { color: '#6b4423' }
      }
    }
  };

  return (
    <div className="relative mb-6">
      <div className="absolute -inset-2 rounded-3xl blur-xl" style={{ background: 'linear-gradient(to right, rgba(184, 115, 51, 0.1), rgba(212, 165, 116, 0.1))' }}></div>
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #b87333, #d4a574)' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#b87333' }}>Realtime IoT Data</h2>
              <p className="text-sm" style={{ color: '#6b4423' }}>Live sensor readings (24h)</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white backdrop-blur-xl rounded-xl border-2" style={{ borderColor: '#d4a574' }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#b87333' }}></div>
            <span className="text-xs" style={{ color: '#6b4423' }}>Auto-refresh: 30s</span>
          </div>
        </div>

        {/* Main Sensors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Soil Temperature */}
          <div className="group relative">
            <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity" style={{ background: soilTempStatus.bg }}></div>
            <div className="relative p-6 bg-white backdrop-blur-xl rounded-2xl border-2 hover:shadow-lg transition-all" style={{ borderColor: '#d4a574' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="text-sm font-medium" style={{ color: '#6b4423' }}>Soil Temperature</div>
                <div className="p-2 rounded-xl" style={{ background: soilTempStatus.bg }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold mb-2" style={{ color: soilTempStatus.text }}>
                {latest.soil_temperature_c.toFixed(1)}°C
              </div>
              <div className="text-xs" style={{ color: '#9b7653' }}>Optimal: 20-30°C</div>
            </div>
          </div>

          {/* Soil Moisture */}
          <div className="group relative">
            <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity" style={{ background: soilMoistStatus.bg }}></div>
            <div className="relative p-6 bg-white backdrop-blur-xl rounded-2xl border-2 hover:shadow-lg transition-all" style={{ borderColor: '#d4a574' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="text-sm font-medium" style={{ color: '#6b4423' }}>Soil Moisture</div>
                <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold mb-2" style={{ color: soilMoistStatus.text }}>
                {latest.soil_moisture_pct.toFixed(1)}%
              </div>
              <div className="text-xs mb-3" style={{ color: '#9b7653' }}>Optimal: 40-60%</div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#f5e6d3' }}>
                <div 
                  className="h-full transition-all duration-500"
                  style={{ background: 'linear-gradient(to right, #3b82f6, #06b6d4)', width: `${Math.min(latest.soil_moisture_pct, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* pH Value */}
          <div className="group relative">
            <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity" style={{ background: phStatus.bg }}></div>
            <div className="relative p-6 bg-white backdrop-blur-xl rounded-2xl border-2 hover:shadow-lg transition-all" style={{ borderColor: '#d4a574' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="text-sm font-medium" style={{ color: '#6b4423' }}>pH Value</div>
                <div className="p-2 rounded-xl" style={{ background: phStatus.bg }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold mb-2" style={{ color: phStatus.text }}>
                {latest.ph_value.toFixed(1)}
              </div>
              <div className="text-xs" style={{ color: '#9b7653' }}>Optimal: 6.0-7.5</div>
            </div>
          </div>
        </div>

        {/* NPK + Additional Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* NPK */}
          <div className="relative p-5 bg-white backdrop-blur-xl rounded-2xl border-2" style={{ borderColor: '#d4a574' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div className="text-xs font-medium" style={{ color: '#6b4423' }}>NPK (mg/kg)</div>
            </div>
            <div className="space-y-1.5 text-sm font-semibold" style={{ color: '#2d2d2d' }}>
              <div className="flex justify-between">
                <span style={{ color: '#a855f7' }}>N:</span>
                <span>{latest.nitrogen_mg_kg.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#ec4899' }}>P:</span>
                <span>{latest.phosphorus_mg_kg.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#a855f7' }}>K:</span>
                <span>{latest.potassium_mg_kg.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Air Temp */}
          <div className="relative p-5 bg-white backdrop-blur-xl rounded-2xl border-2" style={{ borderColor: '#d4a574' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <div className="text-xs font-medium" style={{ color: '#6b4423' }}>Air Temp</div>
            </div>
            <div className="text-2xl font-bold" style={{ color: '#f97316' }}>
              {latest.air_temperature_c.toFixed(1)}°C
            </div>
          </div>

          {/* Air Humidity */}
          <div className="relative p-5 bg-white backdrop-blur-xl rounded-2xl border-2" style={{ borderColor: '#d4a574' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <div className="text-xs font-medium" style={{ color: '#6b4423' }}>Humidity</div>
            </div>
            <div className="text-2xl font-bold" style={{ color: '#06b6d4' }}>
              {latest.air_humidity_pct.toFixed(1)}%
            </div>
          </div>

          {/* On-chain Status */}
          <div className="relative p-5 bg-white backdrop-blur-xl rounded-2xl border-2" style={{ borderColor: '#d4a574' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg" style={{ background: latest.onchain_status === 'confirmed' 
                  ? 'linear-gradient(135deg, #10b981, #059669)' 
                  : 'linear-gradient(135deg, #eab308, #f97316)'
              }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-xs font-medium" style={{ color: '#6b4423' }}>Blockchain</div>
            </div>
            <div className="text-sm font-bold" style={{ color: latest.onchain_status === 'confirmed' ? '#10b981' : '#eab308' }}>
              {latest.onchain_status === 'confirmed' ? 'Verified' : 'Pending'}
            </div>
          </div>
        </div>

        {/* 24h Trend Chart */}
        {trend.length > 0 && (
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl blur" style={{ background: 'linear-gradient(to right, rgba(184, 115, 51, 0.1), rgba(212, 165, 116, 0.1))' }}></div>
            <div className="relative p-6 bg-white backdrop-blur-xl rounded-2xl border-2" style={{ borderColor: '#d4a574' }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #b87333, #d4a574)' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold" style={{ color: '#b87333' }}>24-Hour Trend</h3>
              </div>
              <div style={{ height: '300px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
              <div className="mt-4 flex justify-between items-center text-xs" style={{ color: '#9b7653' }}>
                <span>Last reading: {new Date(latest.measured_at).toLocaleString('vi-VN')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
