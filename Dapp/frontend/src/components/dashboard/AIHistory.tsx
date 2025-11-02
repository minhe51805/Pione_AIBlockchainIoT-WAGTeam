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

const API_URL = process.env.NEXT_PUBLIC_FLASK_API || 'http://localhost:5000';

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
      <div className="relative mb-6">
        <div className="absolute -inset-2 rounded-3xl blur-xl" style={{ background: 'linear-gradient(to right, rgba(184, 115, 51, 0.1), rgba(212, 165, 116, 0.1))' }}></div>
        <div className="relative p-6 bg-white backdrop-blur-xl rounded-2xl border-2 animate-pulse" style={{ borderColor: '#d4a574' }}>
          <div className="h-64 rounded-xl" style={{ backgroundColor: '#f5e6d3' }}></div>
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

  const filteredInsights = filter === 'anomaly' 
    ? insights.filter(i => i.is_anomaly_detected)
    : insights;

  const chartData = {
    labels: insights.slice().reverse().map(i => i.date),
    datasets: [{
      label: 'Soil Health Score',
      data: insights.slice().reverse().map(i => i.soil_health_score),
      borderColor: '#b87333',
      backgroundColor: 'rgba(184, 115, 51, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  const chartOptions: any = {
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
        min: 0,
        max: 100,
        grid: { color: '#f5e6d3' },
        ticks: { color: '#6b4423' }
      },
      x: {
        grid: { color: '#f5e6d3' },
        ticks: { color: '#6b4423' }
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
    <div className="relative mb-6">
      <div className="absolute -inset-2 rounded-3xl blur-xl" style={{ background: 'linear-gradient(to right, rgba(184, 115, 51, 0.1), rgba(212, 165, 116, 0.1))' }}></div>
      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #b87333, #d4a574)' }}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#b87333' }}>AI Analysis History</h2>
            <p className="text-sm" style={{ color: '#6b4423' }}>Last 30 days insights</p>
          </div>
        </div>

        {/* Soil Health Trend Chart */}
        {insights.length > 0 && (
          <div className="relative mb-6">
            <div className="absolute -inset-1 rounded-2xl blur" style={{ background: 'linear-gradient(to right, rgba(184, 115, 51, 0.1), rgba(212, 165, 116, 0.1))' }}></div>
            <div className="relative p-6 bg-white backdrop-blur-xl rounded-2xl border-2" style={{ borderColor: '#d4a574' }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #b87333, #d4a574)' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold" style={{ color: '#b87333' }}>Soil Health Trend</h3>
              </div>
              <div style={{ height: '250px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {/* History Table */}
        <div className="p-6 bg-white backdrop-blur-xl rounded-2xl border-2" style={{ borderColor: '#d4a574' }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-semibold" style={{ color: '#b87333' }}>Daily Insights</h3>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === 'all'
                    ? 'text-white shadow-lg'
                    : 'hover:shadow-md'
                }`}
                style={filter === 'all' 
                  ? { background: 'linear-gradient(to right, #b87333, #d4a574)' }
                  : { backgroundColor: 'rgba(184, 115, 51, 0.1)', color: '#6b4423' }
                }
              >
                All ({insights.length})
              </button>
              <button
                onClick={() => setFilter('anomaly')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === 'anomaly'
                    ? 'text-white shadow-lg'
                    : 'hover:shadow-md'
                }`}
                style={filter === 'anomaly'
                  ? { background: 'linear-gradient(to right, #ef4444, #f97316)' }
                  : { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }
                }
              >
                Anomalies ({insights.filter(i => i.is_anomaly_detected).length})
              </button>
            </div>
          </div>

          {filteredInsights.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f5e6d3' }}>
                <svg className="w-8 h-8" style={{ color: '#9b7653' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p style={{ color: '#6b4423' }}>No insights found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInsights.map((insight) => {
                const healthStyle = getHealthColor(insight.soil_health_score);
                const ratingStyle = getRatingStyle(insight.health_rating);
                
                return (
                  <div key={insight.id} className="group relative">
                    <div className="absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity" style={{ background: healthStyle.bg }}></div>
                    <div className="relative p-5 backdrop-blur-sm rounded-xl border-2 hover:shadow-lg transition-all" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: '#d4a574' }}>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Date */}
                        <div>
                          <p className="text-xs mb-1" style={{ color: '#9b7653' }}>Date</p>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" style={{ color: '#b87333' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="font-medium" style={{ color: '#2d2d2d' }}>{insight.date}</p>
                          </div>
                        </div>

                        {/* Crop */}
                        <div>
                          <p className="text-xs mb-1" style={{ color: '#9b7653' }}>Recommended Crop</p>
                          <p className="font-semibold capitalize" style={{ color: '#10b981' }}>{insight.recommended_crop}</p>
                          <p className="text-xs" style={{ color: '#6b4423' }}>{(insight.confidence * 100).toFixed(0)}% confidence</p>
                        </div>

                        {/* Health Score */}
                        <div>
                          <p className="text-xs mb-1" style={{ color: '#9b7653' }}>Soil Health</p>
                          <p className="text-2xl font-bold" style={{ color: healthStyle.text }}>
                            {insight.soil_health_score.toFixed(0)}
                          </p>
                          <span className="inline-block px-2 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: ratingStyle.bg, color: ratingStyle.text }}>
                            {insight.health_rating}
                          </span>
                        </div>

                        {/* Anomaly */}
                        <div>
                          <p className="text-xs mb-1" style={{ color: '#9b7653' }}>Anomaly</p>
                          <div className="flex items-center gap-2">
                            {insight.is_anomaly_detected ? (
                              <>
                                <svg className="w-5 h-5" style={{ color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="font-medium" style={{ color: '#ef4444' }}>Detected</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium" style={{ color: '#10b981' }}>Clear</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Blockchain */}
                        <div>
                          <p className="text-xs mb-1" style={{ color: '#9b7653' }}>Blockchain</p>
                          <div className="flex items-center gap-2">
                            {insight.blockchain_status === 'confirmed' ? (
                              <>
                                <svg className="w-5 h-5" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span className="font-medium" style={{ color: '#10b981' }}>Verified</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5 animate-spin" style={{ color: '#eab308' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span className="font-medium" style={{ color: '#eab308' }}>Pending</span>
                              </>
                            )}
                          </div>
                          {insight.blockchain_tx_hash && (
                            <a 
                              href={`https://zeroscan.org/tx/${insight.blockchain_tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs underline decoration-dotted block mt-1 hover:opacity-80"
                              style={{ color: '#b87333' }}
                            >
                              View TX
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
