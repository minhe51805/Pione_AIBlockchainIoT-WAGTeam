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
        <div className="absolute -inset-2 rounded-3xl blur-xl" style={{ background: 'linear-gradient(to right, rgba(184, 115, 51, 0.1), rgba(212, 165, 116, 0.1))' }}></div>
        <div className="relative mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #b87333, #d4a574)' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#b87333' }}>Overview Statistics</h2>
              <p className="text-sm" style={{ color: '#6b4423' }}>Last 30 days performance</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-6 bg-white backdrop-blur-xl rounded-2xl border-2 animate-pulse" style={{ borderColor: '#d4a574' }}>
                <div className="h-4 rounded w-3/4 mb-4" style={{ backgroundColor: '#f5e6d3' }}></div>
                <div className="h-8 rounded w-1/2" style={{ backgroundColor: '#f5e6d3' }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6">
        <div className="p-6 border-2 backdrop-blur-xl rounded-2xl" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" style={{ color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p style={{ color: '#dc2626' }}>Error: {error}</p>
          </div>
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
      title: 'Avg Soil Health',
      value: stats.avg_soil_health.toFixed(1),
      subtitle: 'out of 100',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: stats.avg_soil_health >= 75 ? '#10b981' : stats.avg_soil_health >= 60 ? '#d97706' : '#dc2626',
      progress: stats.avg_soil_health,
      gradient: stats.avg_soil_health >= 75 ? 'linear-gradient(135deg, #10b981, #059669)' : stats.avg_soil_health >= 60 ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'linear-gradient(135deg, #dc2626, #ef4444)'
    },
    {
      title: 'Total IoT Records',
      value: stats.total_iot_records.toLocaleString(),
      subtitle: 'sensor readings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: '#b87333',
      gradient: 'linear-gradient(135deg, #b87333, #d4a574)'
    },
    {
      title: 'Blockchain Verified',
      value: `${stats.verified_daily_insights}/${stats.total_daily_insights}`,
      subtitle: `${verificationRate}% verified`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: '#9b5c1f',
      progress: verificationRate,
      gradient: 'linear-gradient(135deg, #9b5c1f, #b87333)'
    },
    {
      title: 'Anomalies Detected',
      value: `${stats.anomalies_detected}/${stats.total_daily_insights}`,
      subtitle: stats.anomalies_detected === 0 ? 'All clear!' : 'Need attention',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: stats.anomalies_detected > 0 ? '#dc2626' : '#10b981',
      gradient: stats.anomalies_detected > 0 ? 'linear-gradient(135deg, #dc2626, #f97316)' : 'linear-gradient(135deg, #10b981, #059669)'
    }
  ];

  return (
    <div className="relative mb-6">
      <div className="absolute -inset-2 rounded-3xl blur-xl" style={{ background: 'linear-gradient(to right, rgba(184, 115, 51, 0.1), rgba(212, 165, 116, 0.1))' }}></div>
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #b87333, #d4a574)' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#b87333' }}>Overview Statistics</h2>
              <p className="text-sm" style={{ color: '#6b4423' }}>Last 30 days performance</p>
            </div>
          </div>
          {stats.last_updated && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white backdrop-blur-xl rounded-xl border-2" style={{ borderColor: '#d4a574' }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#b87333' }}></div>
              <span className="text-xs" style={{ color: '#6b4423' }}>
                Updated {new Date(stats.last_updated).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <div key={index} className="group relative">
              <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" style={{ background: card.gradient }}></div>
              <div className="relative p-6 bg-white backdrop-blur-xl rounded-2xl border-2 hover:shadow-lg transition-all" style={{ borderColor: '#d4a574' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="text-sm font-medium" style={{ color: '#6b4423' }}>{card.title}</div>
                  <div className="p-2 rounded-xl" style={{ background: card.gradient }}>
                    <div className="text-white">{card.icon}</div>
                  </div>
                </div>
                
                <div className="text-3xl font-bold mb-2" style={{ color: card.color }}>
                  {card.value}
                </div>
                
                <div className="text-xs mb-3" style={{ color: '#9b7653' }}>{card.subtitle}</div>

                {card.progress !== undefined && (
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#f5e6d3' }}>
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ background: card.gradient, width: `${Math.min(card.progress, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
