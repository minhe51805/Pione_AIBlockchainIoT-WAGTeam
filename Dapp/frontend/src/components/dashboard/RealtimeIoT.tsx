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

interface RealtimeIoTProps {
  onMetricClick?: (name: string, value: number | string) => void;
}

export default function RealtimeIoT({ onMetricClick }: RealtimeIoTProps = {}) {
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
      <div className="relative">
        <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg border border-gray-200 dark:border-violet-800 animate-pulse">
          <div className="h-32 rounded-lg bg-gray-200 dark:bg-violet-900"></div>
        </div>
      </div>
    );
  }

  if (error || !latest) {
    return (
      <div className="p-3 border border-amber-300 dark:border-amber-700 backdrop-blur-xl rounded-lg bg-amber-50/80 dark:bg-amber-950/80">
        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error || 'No IoT data available'}</span>
        </div>
      </div>
    );
  }

  const getStatusColor = (value: number, min: number, max: number) => {
    if (value < min || value > max) return { text: '#ef4444', gradient: 'from-red-500 to-orange-600' };
    return { text: '#10b981', gradient: 'from-emerald-500 to-green-600' };
  };

  const soilTempStatus = getStatusColor(latest.soil_temperature_c, 20, 30);
  const soilMoistStatus = getStatusColor(latest.soil_moisture_pct, 40, 60);
  const phStatus = getStatusColor(latest.ph_value, 6.0, 7.5);

  // Chart configuration - Modern Purple theme
  const chartData = {
    labels: trend.map(t => new Date(t.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })),
    datasets: [
      {
        label: 'Temp (°C)',
        data: trend.map(t => t.temp),
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
      {
        label: 'Moisture (%)',
        data: trend.map(t => t.moisture),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
      {
        label: 'pH',
        data: trend.map(t => t.ph),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 4,
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
          color: '#64748b',
          font: { size: 10, weight: '600' },
          padding: 10,
          usePointStyle: true,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(139, 92, 246, 0.1)' },
        ticks: { color: '#64748b', font: { size: 9 } }
      },
      x: {
        grid: { color: 'rgba(139, 92, 246, 0.05)' },
        ticks: { color: '#64748b', font: { size: 9 }, maxRotation: 45 }
      }
    }
  };

  return (
    <div className="relative">
      {/* Balanced Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-violet-600 dark:text-violet-400">IoT Sensors</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-500">Live • 24h</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg border border-gray-200 dark:border-violet-800">
          <div className="w-2 h-2 rounded-full animate-pulse bg-violet-500"></div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">30s</span>
        </div>
      </div>

      {/* Balanced Main Sensors Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Soil Temperature */}
        <div className="group relative cursor-pointer" onClick={() => onMetricClick?.('Nhiệt độ đất', latest.soil_temperature_c.toFixed(1))}>
          <div className={`absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-30 blur transition-opacity bg-gradient-to-r ${soilTempStatus.gradient}`}></div>
          {/* Tooltip */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 dark:bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 delay-[2000ms] whitespace-nowrap shadow-lg z-50">
            Nhấn để hỏi chuyên gia AI
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-slate-800"></div>
          </div>
          <div className="relative p-4 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-violet-800 hover:shadow-lg hover:shadow-violet-500/20 transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Temp</span>
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-3xl font-black mb-2" style={{ color: soilTempStatus.text }}>
              {latest.soil_temperature_c.toFixed(1)}°
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500">20-30°C</div>
          </div>
        </div>

        {/* Soil Moisture */}
        <div className="group relative cursor-pointer" onClick={() => onMetricClick?.('Độ ẩm đất', latest.soil_moisture_pct.toFixed(1))}>
          <div className={`absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-30 blur transition-opacity bg-gradient-to-r ${soilMoistStatus.gradient}`}></div>
          {/* Tooltip */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 dark:bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 delay-[2000ms] whitespace-nowrap shadow-lg z-50">
            Nhấn để hỏi chuyên gia AI
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-slate-800"></div>
          </div>
          <div className="relative p-4 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-violet-800 hover:shadow-lg hover:shadow-violet-500/20 transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Moisture</span>
              <svg className="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <div className="text-3xl font-black mb-2" style={{ color: soilMoistStatus.text }}>
              {latest.soil_moisture_pct.toFixed(1)}%
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 mb-2">
              <div 
                className={`h-full transition-all duration-500 bg-gradient-to-r from-sky-500 to-blue-600`}
                style={{ width: `${Math.min(latest.soil_moisture_pct, 100)}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500">40-60%</div>
          </div>
        </div>

        {/* pH Value */}
        <div className="group relative cursor-pointer" onClick={() => onMetricClick?.('pH', latest.ph_value.toFixed(1))}>
          <div className={`absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-30 blur transition-opacity bg-gradient-to-r ${phStatus.gradient}`}></div>
          {/* Tooltip */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 dark:bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 delay-[2000ms] whitespace-nowrap shadow-lg z-50">
            Nhấn để hỏi chuyên gia AI
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-slate-800"></div>
          </div>
          <div className="relative p-4 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-violet-800 hover:shadow-lg hover:shadow-violet-500/20 transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">pH</span>
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="text-3xl font-black mb-2" style={{ color: phStatus.text }}>
              {latest.ph_value.toFixed(1)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500">6.0-7.5</div>
          </div>
        </div>
      </div>

      {/* Balanced NPK + Additional Info Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4 items-stretch">
        {/* NPK Balanced */}
        <div className="group relative cursor-pointer" onClick={() => onMetricClick?.('NPK (Dinh dưỡng)', `N:${latest.nitrogen_mg_kg.toFixed(0)} P:${latest.phosphorus_mg_kg.toFixed(0)} K:${latest.potassium_mg_kg.toFixed(0)}`)}>
          {/* Tooltip */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 dark:bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 delay-[2000ms] whitespace-nowrap shadow-lg z-50">
            Nhấn để hỏi chuyên gia AI
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-slate-800"></div>
          </div>
          <div className="relative p-3 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg border border-gray-200 dark:border-violet-800 hover:shadow-lg hover:shadow-violet-500/20 transition-all hover:scale-105 flex flex-col min-h-[110px]">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">NPK</span>
            </div>
            <div className="space-y-1.5 text-xs font-semibold mt-auto">
              <div className="flex justify-between text-purple-600 dark:text-purple-400">
                <span>N:</span>
                <span>{latest.nitrogen_mg_kg.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-pink-600 dark:text-pink-400">
                <span>P:</span>
                <span>{latest.phosphorus_mg_kg.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-violet-600 dark:text-violet-400">
                <span>K:</span>
                <span>{latest.potassium_mg_kg.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Air Temp */}
        <div className="group relative cursor-pointer" onClick={() => onMetricClick?.('Nhiệt độ không khí', latest.air_temperature_c.toFixed(1))}>
          {/* Tooltip */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 dark:bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 delay-[2000ms] whitespace-nowrap shadow-lg z-50">
            Nhấn để hỏi chuyên gia AI
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-slate-800"></div>
          </div>
          <div className="relative p-3 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg border border-gray-200 dark:border-violet-800 hover:shadow-lg hover:shadow-violet-500/20 transition-all hover:scale-105 flex flex-col min-h-[110px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Air</span>
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-auto">
              {latest.air_temperature_c.toFixed(1)}°
            </div>
          </div>
        </div>

        {/* Air Humidity */}
        <div className="group relative cursor-pointer" onClick={() => onMetricClick?.('Độ ẩm không khí', latest.air_humidity_pct.toFixed(1))}>
          {/* Tooltip */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 dark:bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 delay-[2000ms] whitespace-nowrap shadow-lg z-50">
            Nhấn để hỏi chuyên gia AI
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-slate-800"></div>
          </div>
          <div className="relative p-3 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg border border-gray-200 dark:border-violet-800 hover:shadow-lg hover:shadow-violet-500/20 transition-all hover:scale-105 flex flex-col min-h-[110px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Humid</span>
              <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
              </svg>
            </div>
            <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-auto">
              {latest.air_humidity_pct.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Salt */}
        <div className="group relative cursor-pointer" onClick={() => onMetricClick?.('Độ mặn', latest.salt_mg_l.toFixed(0))}>
          {/* Tooltip */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 dark:bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 delay-[2000ms] whitespace-nowrap shadow-lg z-50">
            Nhấn để hỏi chuyên gia AI
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-slate-800"></div>
          </div>
          <div className="relative p-3 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg border border-gray-200 dark:border-violet-800 hover:shadow-lg hover:shadow-violet-500/20 transition-all hover:scale-105 flex flex-col min-h-[110px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Salt</span>
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div className="flex-1 flex flex-col justify-end">
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {latest.salt_mg_l.toFixed(0)}
              </div>
              <div className="text-[10px] text-slate-500">mg/L</div>
            </div>
          </div>
        </div>

        {/* On-chain Status */}
        <div className="relative p-3 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg border border-gray-200 dark:border-violet-800 flex flex-col min-h-[110px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Chain</span>
            <span className="text-xl">{latest.onchain_status === 'confirmed' ? '✅' : '⏳'}</span>
          </div>
          <div className={`text-base font-black mt-auto ${latest.onchain_status === 'confirmed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {latest.onchain_status === 'confirmed' ? 'OK' : 'Pending'}
          </div>
        </div>
      </div>

      {/* Balanced 24h Trend Chart */}
      {trend.length > 0 && (
        <div className="relative p-4 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-violet-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📈</span>
              <h3 className="text-base font-bold text-violet-600 dark:text-violet-400">24h Trend</h3>
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-500">
              {new Date(latest.measured_at).toLocaleTimeString('vi-VN')}
            </span>
          </div>
          <div style={{ height: '220px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
}
