'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const API_URL = '';
const AI_API_URL = '';

// Custom header for DatePicker with Copper theme
const CustomHeader = ({
  date,
  changeYear,
  changeMonth,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}: any) => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 50 + i);

  return (
    <div className="px-6 py-4">
      {/* Title Row */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-6 py-3 bg-white/95 rounded-2xl shadow-lg border-2" style={{ borderColor: '#b87333' }}>
          <svg className="w-6 h-6" style={{ color: '#b87333' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-2xl font-bold" style={{ color: '#2d2d2d' }}>
            Tháng {date.getMonth() + 1}, {date.getFullYear()}
          </span>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between gap-3">
        {/* Previous Button */}
        <button
          type="button"
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
          className="w-12 h-12 flex items-center justify-center disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 text-white text-2xl font-bold"
          style={{
            background: prevMonthButtonDisabled 
              ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
              : 'linear-gradient(135deg, #b87333, #d4a574)',
          }}
        >
          ‹
        </button>

        {/* Month + Year Dropdowns */}
        <div className="flex items-center gap-2">
          <select
            value={date.getMonth() + 1}
            onChange={({ target: { value } }) => changeMonth(parseInt(value) - 1)}
            className="px-5 py-3 bg-white font-bold text-lg rounded-xl border-2 cursor-pointer transition-all shadow-md focus:ring-4 focus:outline-none hover:bg-[#faf0e6]"
            style={{
              color: '#2d2d2d',
              borderColor: '#b87333'
            }}
          >
            {months.map((month) => (
              <option key={month} value={month} className="font-semibold">
                Tháng {month}
              </option>
            ))}
          </select>

          <select
            value={date.getFullYear()}
            onChange={({ target: { value } }) => changeYear(parseInt(value))}
            className="px-5 py-3 bg-white font-bold text-lg rounded-xl border-2 cursor-pointer transition-all shadow-md focus:ring-4 focus:outline-none"
            style={{
              color: '#2d2d2d',
              borderColor: '#b87333'
            }}
          >
            {years.map((year) => (
              <option key={year} value={year} className="font-semibold">
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
          className="w-12 h-12 flex items-center justify-center disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 text-white text-2xl font-bold"
          style={{
            background: nextMonthButtonDisabled
              ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
              : 'linear-gradient(135deg, #b87333, #d4a574)',
          }}
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default function DateSelector() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2025-10-28'));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Format date to YYYY-MM-DD for API
  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (error) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
        setTimeout(() => setError(null), 300);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch(`${API_URL}/api/analyze-date`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formatDateForAPI(selectedDate) })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || data.error || response.statusText;
        throw new Error(errorMsg);
      }

      setResult({ type: 'analyze', data });
    } catch (err: any) {
      setError(err.message || 'Failed to analyze data');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerPipeline = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch(`${AI_API_URL}/api/ai/analyze-daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formatDateForAPI(selectedDate) })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.detail || data.message || data.error || response.statusText;
        throw new Error(errorMsg);
      }

      setResult({ type: 'pipeline', data });
      
      if (data.blockchain_tx) {
        setTimeout(() => {
          setError(`✅ Pipeline complete! TX: ${data.blockchain_tx.substring(0, 20)}... Status: ${data.blockchain_status}`);
        }, 100);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to run pipeline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Balanced Toast Notification */}
      {error && (
        <div
          className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
            showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <div className="px-4 py-3 backdrop-blur-xl rounded-lg shadow-xl max-w-md flex items-center gap-3 border border-violet-300 dark:border-violet-700 bg-white/90 dark:bg-slate-900/90">
            <span className="text-xl">{error.startsWith('✅') ? '✅' : '❌'}</span>
            <p className="text-xs font-medium flex-1" style={{ color: error.startsWith('✅') ? '#10b981' : '#ef4444' }}>
                {error}
              </p>
            <button
              onClick={() => {
                setShowToast(false);
                setTimeout(() => setError(null), 300);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header - Simple */}
      <div className="flex items-center gap-3 mb-4 p-4 bg-white/70 dark:bg-[#0f0e17]/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-[#2d2640] shadow-lg">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#a855f7]">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
          <h2 className="text-lg font-black text-[#a855f7] dark:text-[#c084fc]">AI Analysis</h2>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Select date & analyze</p>
          </div>
        </div>

      {/* Main Card - Simple */}
      <div className="p-4 bg-white/70 dark:bg-[#0f0e17]/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-[#2d2640] shadow-lg">
        {/* Date Picker - Full Width */}
        <div className="mb-4">
          <label className="flex items-center gap-2 text-xs font-semibold mb-2 text-[#a855f7]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            Date
            </label>
                <div className="date-picker-wrapper">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => date && setSelectedDate(date)}
                    dateFormat="dd/MM/yyyy"
                    disabled={loading}
                    maxDate={new Date()}
                    filterDate={(date) => date <= new Date()}
                    className="copper-datepicker"
                    calendarClassName="senior-friendly-calendar"
                    todayButton="📅 Hôm nay"
                    withPortal
                    portalId="root-portal"
                    renderCustomHeader={CustomHeader}
                  />
              </div>
          </div>
          
        {/* Buttons - Full Width Stack */}
        <div className="flex flex-col gap-2">
                <button
              onClick={handleAnalyze}
              disabled={loading}
            className="w-full px-4 py-3 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
            <span>{loading ? 'Analyzing...' : 'Analyze'}</span>
                </button>
                
                <button
              onClick={handleTriggerPipeline}
              disabled={loading}
            className="w-full px-4 py-3 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
            <span>{loading ? 'Processing...' : 'Analyze Daily'}</span>
                </button>
          </div>

        {/* Result Display - Simple */}
        {result && (
          <div className="mt-4 p-4 border border-emerald-300 dark:border-emerald-700 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/90">
            <div className="flex items-center gap-2 mb-3">
                  {result.type === 'analyze' ? (
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ) : (
                <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
              <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                  {result.type === 'analyze' ? 'Analysis Result' : 'Daily Analysis Result'}
            </h4>
              </div>
              
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-gray-200 dark:border-violet-800 bg-white/80 dark:bg-slate-900/80">
                <p className="text-[10px] mb-1 text-slate-600 dark:text-slate-400">Crop</p>
                <p className="text-base font-black capitalize text-emerald-600 dark:text-emerald-400">
                    {result.data.ai_analysis?.crop_recommendation?.best_crop || 
                     result.data.crop_recommendation?.best_crop || 'N/A'}
                  </p>
                </div>
                
              <div className="p-3 rounded-lg border border-gray-200 dark:border-violet-800 bg-white/80 dark:bg-slate-900/80">
                <p className="text-[10px] mb-1 text-slate-600 dark:text-slate-400">Health</p>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {Math.round(result.data.ai_analysis?.soil_health?.overall_score || 
                     result.data.soil_health?.score || 0)}/100
                  </p>
              </div>
                
              <div className="p-3 rounded-lg border border-gray-200 dark:border-violet-800 bg-white/80 dark:bg-slate-900/80">
                <p className="text-[10px] mb-1 text-slate-600 dark:text-slate-400">Anomaly</p>
                <p className="text-base font-black">
                    {(result.data.ai_analysis?.anomaly_detection?.is_anomaly || 
                      result.data.is_anomaly_detected) ? (
                    <span className="text-red-600 dark:text-red-400">Yes</span>
                    ) : (
                    <span className="text-emerald-600 dark:text-emerald-400">No</span>
                    )}
                  </p>
              </div>
            </div>
            
            {result.type === 'pipeline' && result.data.blockchain_tx && (
              <div className="mt-3 pt-3 border-t border-emerald-300 dark:border-emerald-700">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔗</span>
                  <a 
                    href={`https://zeroscan.org/tx/${result.data.blockchain_tx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] underline text-violet-600 dark:text-violet-400 hover:opacity-80"
                  >
                    {result.data.blockchain_tx.substring(0, 20)}...
                  </a>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{result.data.blockchain_status}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Box - Simple */}
        <div className="mt-4 p-3 border border-[#a855f7]/30 dark:border-[#a855f7]/50 rounded-xl bg-purple-50/80 dark:bg-purple-950/80">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              <div className="flex-1">
              <p className="text-xs font-bold mb-2 text-[#a855f7]">Quick Actions</p>
              <ul className="space-y-1.5 text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  <span><strong className="text-blue-600 dark:text-blue-400">Analyze:</strong> Quick view</span>
                  </li>
                <li className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  <span><strong className="text-emerald-600 dark:text-emerald-400">Analyze Daily:</strong> Full AI + Blockchain</span>
                  </li>
          </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
