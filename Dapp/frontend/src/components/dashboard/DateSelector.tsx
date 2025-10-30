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
    <div className="relative mb-6">
      {/* Toast Notification */}
      {error && (
        <div
          className={`fixed top-6 right-6 z-50 transition-all duration-300 ${
            showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <div
            className="px-6 py-4 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md flex items-start gap-3 border-2"
            style={{
              backgroundColor: error.startsWith('✅') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderColor: error.startsWith('✅') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
            }}
          >
            <div className="flex-shrink-0 text-2xl">
              {error.startsWith('✅') ? '✅' : '❌'}
            </div>
            <div className="flex-1">
              <h4 className="font-bold mb-1" style={{ color: error.startsWith('✅') ? '#10b981' : '#ef4444' }}>
                {error.startsWith('✅') ? 'Success' : 'Error'}
              </h4>
              <p className="text-sm" style={{ color: error.startsWith('✅') ? '#10b981' : '#ef4444' }}>
                {error}
              </p>
            </div>
            <button
              onClick={() => {
                setShowToast(false);
                setTimeout(() => setError(null), 300);
              }}
              className="flex-shrink-0 transition-colors"
              style={{ color: error.startsWith('✅') ? '#10b981' : '#ef4444' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="h-1 rounded-b-2xl overflow-hidden" style={{ backgroundColor: error.startsWith('✅') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)' }}>
            <div 
              className="h-full"
              style={{
                backgroundColor: error.startsWith('✅') ? '#10b981' : '#ef4444',
                animation: 'shrink 10s linear',
                transformOrigin: 'left'
              }}
            />
          </div>
        </div>
      )}

      <div className="absolute -inset-2 rounded-3xl blur-xl" style={{ background: 'linear-gradient(to right, rgba(184, 115, 51, 0.1), rgba(212, 165, 116, 0.1))' }}></div>
      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #b87333, #d4a574)' }}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#b87333' }}>AI Analysis</h2>
            <p className="text-sm" style={{ color: '#6b4423' }}>Analyze soil data by date</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="p-6 bg-white backdrop-blur-xl rounded-2xl border-2" style={{ borderColor: '#d4a574' }}>
          {/* Helper Text Above */}
          <p className="text-xs mb-4" style={{ color: '#6b4423' }}>
            Choose a date to analyze historical soil data
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Date Picker */}
            <div className="md:col-span-5">
              <label htmlFor="date" className="flex items-center gap-2 text-base font-semibold mb-3" style={{ color: '#b87333' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Select Date
            </label>
              <div className="relative group custom-datepicker">
                <div className="absolute -inset-0.5 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to right, rgba(184, 115, 51, 0.2), rgba(212, 165, 116, 0.2))' }}></div>
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
          </div>
          
          {/* Buttons */}
            <div className="md:col-span-7 flex flex-col">
              <label className="block text-base font-semibold mb-3 select-none" style={{ color: '#6b4423' }}>
                Actions
              </label>
              <div className="flex gap-3 h-14">
                <button
              onClick={handleAnalyze}
              disabled={loading}
                  className="flex-1 px-6 text-white text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                  style={{
                    background: loading 
                      ? 'linear-gradient(to right, #9ca3af, #6b7280)' 
                      : 'linear-gradient(to right, #3b82f6, #06b6d4)'
                  }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {loading ? 'Loading...' : 'Analyze'}
                </button>
                
                <button
              onClick={handleTriggerPipeline}
              disabled={loading}
                  className="flex-1 px-6 text-white text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                  style={{
                    background: loading
                      ? 'linear-gradient(to right, #9ca3af, #6b7280)'
                      : 'linear-gradient(to right, #10b981, #059669)'
                  }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {loading ? 'Processing...' : 'Pipeline'}
                </button>
          </div>
        </div>
          </div>

        {/* Result Display */}
        {result && (
            <div className="mt-6 p-5 border-2 rounded-2xl" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  {result.type === 'analyze' ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </div>
                <h4 className="font-semibold text-lg" style={{ color: '#10b981' }}>
                  {result.type === 'analyze' ? 'Analysis Result' : 'Pipeline Result'}
            </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: '#d4a574' }}>
                  <p className="text-xs mb-2" style={{ color: '#6b4423' }}>Recommended Crop</p>
                  <p className="text-xl font-bold capitalize" style={{ color: '#2d2d2d' }}>
                    {result.data.ai_analysis?.crop_recommendation?.best_crop || 
                     result.data.crop_recommendation?.best_crop || 'N/A'}
                  </p>
                </div>
                
                <div className="p-4 rounded-xl border-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: '#d4a574' }}>
                  <p className="text-xs mb-2" style={{ color: '#6b4423' }}>Soil Health Score</p>
                  <p className="text-xl font-bold" style={{ color: '#10b981' }}>
                    {Math.round(result.data.ai_analysis?.soil_health?.overall_score || 
                     result.data.soil_health?.score || 0)}/100
                  </p>
              </div>
                
                <div className="p-4 rounded-xl border-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: '#d4a574' }}>
                  <p className="text-xs mb-2" style={{ color: '#6b4423' }}>Anomaly Status</p>
                  <p className="text-xl font-bold">
                    {(result.data.ai_analysis?.anomaly_detection?.is_anomaly || 
                      result.data.is_anomaly_detected) ? (
                      <span style={{ color: '#ef4444' }}>Detected</span>
                    ) : (
                      <span style={{ color: '#10b981' }}>Clear</span>
                    )}
                  </p>
              </div>
            </div>
            
            {result.type === 'pipeline' && result.data.blockchain_tx && (
                <div className="mt-4 pt-4 border-t-2" style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p className="text-xs font-medium" style={{ color: '#10b981' }}>Blockchain Transaction</p>
                  </div>
                  <a 
                    href={`https://zeroscan.org/tx/${result.data.blockchain_tx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm underline decoration-dotted hover:opacity-80"
                    style={{ color: '#b87333' }}
                  >
                    {result.data.blockchain_tx.substring(0, 20)}...
                  </a>
                  <p className="text-xs mt-1" style={{ color: '#6b4423' }}>
                    Status: <span className="font-medium" style={{ color: '#10b981' }}>{result.data.blockchain_status}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
          <div className="mt-6 p-4 border-2 rounded-xl" style={{ backgroundColor: 'rgba(184, 115, 51, 0.1)', borderColor: 'rgba(184, 115, 51, 0.3)' }}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg, #b87333, #d4a574)' }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-2" style={{ color: '#b87333' }}>Button Functions</p>
                <ul className="space-y-1.5 text-xs" style={{ color: '#6b4423' }}>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span><strong style={{ color: '#3b82f6' }}>Analyze:</strong> Quick analysis (no save to DB/blockchain)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span><strong style={{ color: '#10b981' }}>Pipeline:</strong> Full flow (aggregate → AI → DB → blockchain)</span>
                  </li>
          </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
