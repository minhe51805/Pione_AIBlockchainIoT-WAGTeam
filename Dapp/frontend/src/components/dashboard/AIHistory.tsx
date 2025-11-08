'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';

interface DailyInsight {
  id: number;
  date: string;
  recommended_crop: string;
  confidence: number;
  soil_health_score: number;
  health_rating: string;
  is_anomaly_detected: boolean;
  blockchain_status: string;
  blockchain_tx_hash?: string;
  blockchain_pushed_at?: string;
  recommendations?: string;
  sample_count: number;
}

const API_URL = process.env.NEXT_PUBLIC_FLASK_API || '';

export default function AIHistory() {
  const [insights, setInsights] = useState<DailyInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'anomaly'>('all');

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard/ai-history?days=30`);
      const data = await res.json();
      
      if (data.success) {
        setInsights(data.insights || []);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch AI history');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="relative">
        <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg border border-gray-200 dark:border-violet-800 animate-pulse">
          <div className="h-48 rounded-lg bg-gray-200 dark:bg-violet-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 border border-red-300 dark:border-red-700 backdrop-blur-xl rounded-lg bg-red-50/80 dark:bg-red-950/80">
        <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  const filteredInsights = filter === 'anomaly' 
    ? insights.filter(i => i.is_anomaly_detected)
    : insights;

  const chartData = {
    labels: insights.slice().reverse().map(i => i.date),
    datasets: [{
      label: 'Soil Health',
      data: insights.slice().reverse().map(i => i.soil_health_score),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 4,
    }]
  };

  const chartOptions: any = {
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
        min: 0,
        max: 100,
        grid: { color: 'rgba(139, 92, 246, 0.1)' },
        ticks: { color: '#64748b', font: { size: 9 } }
      },
      x: {
        grid: { color: 'rgba(139, 92, 246, 0.05)' },
        ticks: { color: '#64748b', font: { size: 9 }, maxRotation: 45 }
      }
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 75) return { text: '#10b981', bg: 'linear-gradient(135deg, #10b981, #059669)' };
    if (score >= 60) return { text: '#eab308', bg: 'linear-gradient(135deg, #eab308, #f97316)' };
    return { text: '#ef4444', bg: 'linear-gradient(135deg, #ef4444, #f97316)' };
  };

  const getRatingStyle = (rating: string) => {
    const styles: Record<string, { bg: string, text: string }> = {
      'EXCELLENT': { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' },
      'GOOD': { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
      'FAIR': { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308' },
      'POOR': { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
    };
    return styles[rating] || { bg: 'rgba(156, 163, 175, 0.1)', text: '#9ca3af' };
  };

  return (
    <div className="relative space-y-4">
      {/* Header - Compact */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#a855f7]">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
          <h2 className="text-xl font-black text-[#a855f7] dark:text-[#c084fc]">AI History</h2>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">30 days</p>
          </div>
        </div>

      {/* Chart - Simple */}
        {insights.length > 0 && (
        <div className="p-4 bg-white/70 dark:bg-[#0f0e17]/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-[#2d2640] shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
            <h3 className="text-base font-bold text-[#a855f7] dark:text-[#c084fc]">Health Trend</h3>
                </div>
          <div style={{ height: '200px' }}>
                <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        )}

      {/* History Cards - Simple */}
      <div className="p-4 bg-white/70 dark:bg-[#0f0e17]/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-[#2d2640] shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-[#a855f7] dark:text-[#c084fc]">Insights</h3>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filter === 'all'
                  ? 'text-white bg-[#a855f7]'
                  : 'bg-purple-100 dark:bg-purple-950/50 text-[#a855f7]'
                }`}
              >
              All {insights.length}
              </button>
              <button
                onClick={() => setFilter('anomaly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filter === 'anomaly'
                  ? 'text-white bg-red-600'
                  : 'bg-red-100 dark:bg-red-950/50 text-red-600'
                }`}
              >
              ⚠ {insights.filter(i => i.is_anomaly_detected).length}
              </button>
            </div>
          </div>

          {filteredInsights.length === 0 ? (
            <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            <p className="text-xs text-slate-500 dark:text-slate-500">No data</p>
            </div>
          ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredInsights.map((insight) => {
                const healthStyle = getHealthColor(insight.soil_health_score);
                const ratingStyle = getRatingStyle(insight.health_rating);
                
                return (
                <div key={insight.id} className="p-3 rounded-xl border border-gray-200 dark:border-[#2d2640] bg-white/80 dark:bg-[#1a1625]/80 hover:shadow-md transition-all">
                  <div className="grid grid-cols-5 gap-3 text-xs">
                        {/* Date */}
                        <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 mb-1">Date</p>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">📅</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{insight.date.substring(5)}</p>
                          </div>
                        </div>

                        {/* Crop */}
                        <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 mb-1">Crop</p>
                      <p className="font-bold capitalize text-emerald-600 dark:text-emerald-400">{insight.recommended_crop}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500">{(insight.confidence * 100).toFixed(0)}%</p>
                        </div>

                    {/* Health */}
                        <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 mb-1">Health</p>
                      <p className="text-xl font-black" style={{ color: healthStyle.text }}>
                            {insight.soil_health_score.toFixed(0)}
                          </p>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ backgroundColor: ratingStyle.bg, color: ratingStyle.text }}>
                            {insight.health_rating}
                          </span>
                        </div>

                        {/* Anomaly */}
                        <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 mb-1">Anomaly</p>
                      <div className="flex items-center gap-1">
                            {insight.is_anomaly_detected ? (
                              <>
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            <span className="font-bold text-red-600 dark:text-red-400">Yes</span>
                              </>
                            ) : (
                              <>
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">No</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Blockchain */}
                        <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 mb-1">Chain</p>
                      <div className="flex items-center gap-1">
                            {insight.blockchain_status === 'confirmed' ? (
                              <>
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">OK</span>
                              </>
                            ) : (
                              <>
                            <svg className="w-4 h-4 text-amber-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            <span className="font-bold text-amber-600 dark:text-amber-400">...</span>
                              </>
                            )}
                          </div>
                          {insight.blockchain_tx_hash && (
                            <a 
                              href={`https://zeroscan.org/tx/${insight.blockchain_tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                          className="text-[10px] underline text-violet-600 dark:text-violet-400 hover:opacity-80"
                            >
                          View
                            </a>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}
