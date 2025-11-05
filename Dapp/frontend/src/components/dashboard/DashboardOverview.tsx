'use client';

import { useState, useEffect } from 'react';

interface OverviewStats {
  avg_soil_health: number;
  total_iot_records: number;
  verified_daily_insights: number;
  total_daily_insights: number;
  anomalies_detected: number;
  last_updated?: string;
}

const API_URL = process.env.NEXT_PUBLIC_FLASK_API || 'http://localhost:5000';

export default function DashboardOverview() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard/overview`);
      const data = await res.json();
      
      if (data.success) {
        setStats(data.stats);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch stats');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="relative group">
              <div className="absolute -inset-1 rounded-2xl blur-xl opacity-30 bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse"></div>
              <div className="relative p-5 bg-white/70 dark:bg-[#0f0e17]/80 backdrop-blur-xl rounded-2xl border-2 border-gray-200 dark:border-[#2d2640] animate-pulse">
                <div className="h-4 rounded-lg w-2/3 mb-3 bg-gray-300 dark:bg-[#1a1625]"></div>
                <div className="h-8 rounded-lg w-1/2 bg-gray-300 dark:bg-[#1a1625]"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 p-3 border border-red-300 dark:border-red-700 backdrop-blur-xl rounded-lg bg-red-50/80 dark:bg-red-950/80">
        <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const verificationRate = stats.total_daily_insights > 0 
    ? Math.round((stats.verified_daily_insights / stats.total_daily_insights) * 100) 
    : 0;

  const cards = [
    {
      title: 'Soil Health',
      value: stats.avg_soil_health.toFixed(1),
      subtitle: '/100',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: stats.avg_soil_health >= 75 ? '#10b981' : stats.avg_soil_health >= 60 ? '#f59e0b' : '#ef4444',
      progress: stats.avg_soil_health,
      gradient: stats.avg_soil_health >= 75 ? 'from-emerald-500 to-green-600' : stats.avg_soil_health >= 60 ? 'from-amber-500 to-orange-600' : 'from-red-500 to-rose-600'
    },
    {
      title: 'IoT Records',
      value: stats.total_iot_records > 999 ? `${(stats.total_iot_records/1000).toFixed(1)}k` : stats.total_iot_records,
      subtitle: 'readings',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      ),
      color: '#8b5cf6',
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      title: 'Blockchain',
      value: `${stats.verified_daily_insights}/${stats.total_daily_insights}`,
      subtitle: `${verificationRate}%`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      color: '#a855f7',
      progress: verificationRate,
      gradient: 'from-purple-500 to-fuchsia-600'
    },
    {
      title: 'Anomalies',
      value: stats.anomalies_detected,
      subtitle: stats.anomalies_detected === 0 ? 'clear' : 'detected',
      icon: stats.anomalies_detected === 0 ? (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: stats.anomalies_detected > 0 ? '#ef4444' : '#10b981',
      gradient: stats.anomalies_detected > 0 ? 'from-red-500 to-orange-600' : 'from-emerald-500 to-green-600'
    }
  ];

    return (
      <div className="relative">
        {/* Stats Grid - Clean & Professional */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <div key={index} className="group relative">
              {/* Subtle Glow on Hover - NO PULSE */}
              <div className={`absolute -inset-0.5 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-r ${card.gradient}`}></div>
              
              {/* Main Card - Clean Style - Equal Height */}
              <div className="relative p-5 bg-white/70 dark:bg-[#0f0e17]/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-[#2d2640] shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col min-h-[160px]">
                {/* Icon & Title */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{card.title}</span>
                  <div style={{ color: card.color }}>
                    {card.icon}
                  </div>
                </div>
                
                {/* Value - Fixed Height */}
                <div className="flex items-baseline gap-2 mb-3 h-[48px]">
                  <span className="text-4xl font-black leading-none" style={{ color: card.color }}>
                    {card.value}
                  </span>
                  <span className="text-sm font-semibold text-gray-400 whitespace-nowrap">{card.subtitle}</span>
                </div>

                {/* Progress Bar - Always Show Space */}
                <div className="h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-[#1a1625] mt-auto">
                  {card.progress !== undefined && (
                    <div 
                      className={`h-full transition-all duration-500 bg-gradient-to-r ${card.gradient}`}
                      style={{ width: `${Math.min(card.progress, 100)}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Update Time - Simple */}
        {stats.last_updated && (
          <div className="mt-4 flex justify-end">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-[#0f0e17]/80 backdrop-blur-xl rounded-lg border border-gray-200 dark:border-[#2d2640]">
              <div className="w-2 h-2 rounded-full bg-[#a855f7]"></div>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Updated • {new Date(stats.last_updated).toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
