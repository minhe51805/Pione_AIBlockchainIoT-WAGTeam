'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import RealtimeIoT from '@/components/dashboard/RealtimeIoT';
import DateSelector from '@/components/dashboard/DateSelector';
import AIHistory from '@/components/dashboard/AIHistory';
import SimplifiedDashboard from '@/components/dashboard/SimplifiedDashboard';
import { ThemeToggle } from '@/components/ThemeToggle';
import AnimatedBackground from '@/components/AnimatedBackground';
import AIChatModal from '@/components/AIChatModal';
import CropManagement from '@/components/CropManagement';
import Toast from '@/components/Toast';

interface UserInfo {
  id: number;
  full_name: string;
  wallet_address: string;
  phone?: string;
  email?: string;
  farm_name?: string;
  current_crop?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [simpleMode, setSimpleMode] = useState(() => {
    // Load user preference from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dashboard_simple_mode') === 'true';
    }
    return true; // Default to simple mode for seniors
  });

  // AI Chat Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<{ name: string; value: number | string } | null>(null);
  
  // Notifications & Messaging State
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; time: Date; read: boolean }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // General Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  
  // Latest IoT Data State (for AI analysis)
  const [latestIoTData, setLatestIoTData] = useState({
    temperature: 0,
    moisture: 0,
    pH: 0,
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0,
    humidity: 0,
    airTemp: 0,
    salt: 0
  });
  
  // Crop Management State
  const [cropData, setCropData] = useState<{ cropName: string; plantedDate: string; harvestDate?: string; daysPlanted?: number } | null>(null);

  const toggleMode = () => {
    const newMode = !simpleMode;
    setSimpleMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard_simple_mode', newMode.toString());
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('aquamind_user');
    if (!userStr) {
      router.push('/auth/login');
      return;
    }
    
    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setLoading(false);
    } catch (err) {
      router.push('/auth/login');
    }
  }, [router]);

  // Fetch latest IoT data for AI analysis
  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const response = await fetch('/api/latest');
        if (response.ok) {
          const data = await response.json();
          // Backend returns data directly, not wrapped in data.data
          if (data && data.soil_temperature !== undefined) {
            setLatestIoTData({
              temperature: data.soil_temperature || 0,
              moisture: data.soil_moisture || 0,
              pH: data.ph || 0,
              nitrogen: data.nitrogen || 0,
              phosphorus: data.phosphorus || 0,
              potassium: data.potassium || 0,
              humidity: data.air_humidity || 0,
              airTemp: data.air_temperature || 0,
              salt: data.salt || 0
            });
            console.log('✅ Updated IoT data:', data);
          }
        }
      } catch (error) {
        console.error('Error fetching latest IoT data:', error);
      }
    };

    fetchLatestData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLatestData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('aquamind_user');
    localStorage.removeItem('aquamind_auth_method');
    router.push('/auth/login');
  };

  const handleGeneralChat = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = {
      role: 'user' as const,
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const { chatWithExpert } = await import('@/services/geminiService');
      
      // Use real-time IoT data from database
      const iotData = latestIoTData;

      // Build chat history
      const history = chatMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.content }]
      }));

      const response = await chatWithExpert(chatInput, iotData, cropData || undefined, history);
      
      const assistantMessage = {
        role: 'assistant' as const,
        content: response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Xin lỗi, tôi gặp vấn đề khi trả lời. Vui lòng thử lại.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600">
        <div className="text-center">
          <div className="relative w-28 h-28 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full opacity-30 animate-ping bg-gradient-to-r from-purple-400 to-fuchsia-400"></div>
            <div className="relative w-28 h-28 border-4 border-t-violet-300 border-r-purple-300 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center shadow-xl shadow-purple-500/50">
              <svg className="w-14 h-14 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            Initializing AgroTwin...
          </div>
          <div className="mt-2 text-sm text-purple-100 font-medium">Đang tải dữ liệu của bạn</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Canvas Background with Blur */}
      <div className="fixed inset-0" style={{ zIndex: 0 }}>
        {/* Light Mode: Clean white/gray background - Dark Mode: Dark purple-slate */}
        <div className="absolute inset-0 bg-[#f8fafc] dark:from-[#0f0e17] dark:via-[#1a1625] dark:to-[#0f0e17] dark:bg-gradient-to-br"></div>
        <AnimatedBackground />
      </div>

      {/* Main Content */}
      <div className="relative" style={{ zIndex: 10 }}>
        {/* Clean Minimal Header - Inspired by Reference Images */}
        <header className="border-b border-gray-200 dark:border-[#2d2640]/50 backdrop-blur-xl bg-white/80 dark:bg-[#0f0e17]/70">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="text-3xl">🌾</div>
                <div>
                  <h1 className="text-lg font-black text-[#7c3aed] dark:text-[#e879f9]">
                    GAIA.VN
                  </h1>
                  <p className="text-[10px] font-semibold text-[#a855f7] dark:text-[#9ca3af]">Smart Platform</p>
                  </div>
                </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Icon Buttons */}
                <button
                  onClick={() => router.push('/settings')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-[#1a1625]/50 rounded-lg transition-colors" 
                  title="Settings"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                {/* Messaging Icon */}
                <button
                  onClick={() => setShowMessaging(!showMessaging)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-[#1a1625]/50 rounded-lg transition-colors relative"
                  title="Chat với chuyên gia AI"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full animate-pulse"></span>
                </button>

                {/* Notifications Icon */}
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-[#1a1625]/50 rounded-lg transition-colors relative"
                  title="Thông báo từ chuyên gia AI"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border border-white dark:border-[#0f0e17]">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* User Avatar - Farm Name */}
                <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#1a1625]/50 rounded-lg transition-colors">
                  <span className="hidden md:block text-sm font-semibold text-gray-700 dark:text-[#e5e7eb]">
                    {user.farm_name || user.full_name.split(' ')[0]}
                  </span>
                </button>

                {/* Theme Toggle - Moved to Far Right */}
                <ThemeToggle />
              </div>
          </div>
        </div>
        </header>

        {/* Main Content Area */}
        {/* CONDITIONAL RENDERING: Simple Mode vs Advanced Mode */}
        {simpleMode ? (
          // SIMPLE MODE - CHO NGƯỜI TRUNG NIÊN
          <SimplifiedDashboard user={user} onSwitchToAdvanced={toggleMode} />
        ) : (
          // ADVANCED MODE - CLEAN & PROFESSIONAL DASHBOARD
          <div className="w-full min-h-screen px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto snap-y snap-mandatory scroll-smooth">
            {/* Header Bar - Clean & Simple */}
            <div className="max-w-[1600px] mx-auto mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 bg-white/70 dark:bg-[#0f0e17]/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-[#2d2640] shadow-lg">
            <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white">
                    Hello, {user.full_name}! 
                  </h1>
                  <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
                    GAIA.VN
                  </p>
                  {/* Wallet Address - Full Display */}
                  <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200 dark:border-purple-800/50 w-fit">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300 break-all">
                      {user.wallet_address}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(user.wallet_address);
                        alert('Đã sao chép địa chỉ ví!');
                      }}
                      className="ml-1 p-1 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded transition-colors"
                      title="Copy address"
                    >
                      <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    </div>
          </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  {/* Simple Mode Icon with Tooltip */}
                  <div className="relative group flex-1 sm:flex-none">
                    <button
                      onClick={toggleMode}
                      className="flex items-center justify-center w-full sm:w-auto px-5 py-2.5 bg-[#a855f7] hover:bg-[#9333ea] rounded-xl text-white transition-all duration-200 shadow-lg hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                    </button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-lg z-50">
                      Chuyển đổi sang chế độ đơn giản
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-slate-800"></div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-gray-100 dark:bg-[#1a1625] hover:bg-gray-200 dark:hover:bg-[#2d2640] rounded-xl text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* BENTO GRID LAYOUT - Clean & Tight with Snap Scrolling */}
            <div className="max-w-[1600px] mx-auto space-y-6">
              {/* Row 0: Crop Management */}
              <div className="snap-start snap-always">
                <CropManagement onCropUpdate={(crop) => {
                  if (crop) {
                    const daysPlanted = Math.floor((new Date().getTime() - new Date(crop.plantedDate).getTime()) / (1000 * 60 * 60 * 24));
                    setCropData({ ...crop, daysPlanted });
                  } else {
                    setCropData(null);
                  }
                }} />
              </div>

              {/* Row 1: Stats Overview - 4 Cards */}
              <div className="snap-start snap-always">
                <DashboardOverview />
              </div>

              {/* Row 2: IoT Sensors + Date Selector */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 snap-start snap-always">
                {/* Left: IoT Sensors - Takes 2 columns */}
                <div className="lg:col-span-2">
                  <RealtimeIoT 
                    onMetricClick={(name, value) => {
                      setSelectedMetric({ name, value });
                      setAiModalOpen(true);
                    }}
                  />
                </div>

                {/* Right: Date Selector - Takes 1 column */}
                <div className="lg:col-span-1">
                  <DateSelector 
                    onAnalysisComplete={(analysisData) => {
                      // Open chatbot with analysis summary
                      setSelectedMetric({
                        name: `Daily Analysis: ${analysisData.crop}`,
                        value: `Health: ${analysisData.health}/100, Anomaly: ${analysisData.anomaly ? 'Yes' : 'No'}`
                      });
                      setAiModalOpen(true);
                    }}
                  />
                </div>
              </div>

              {/* Row 3: AI History - Full Width */}
              <div className="snap-start snap-always">
                <AIHistory />
              </div>

              {/* Footer - Minimal */}
              <footer className="mt-6 py-4 text-center">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-600">
                  Powered by <span className="text-violet-600 dark:text-white font-bold">GAIA.VN</span>
              </p>
      </footer>
        </div>
          </div>
        )}

        {/* AI Chat Modal */}
        {aiModalOpen && selectedMetric && (
          <AIChatModal
            isOpen={aiModalOpen}
            onClose={() => {
              setAiModalOpen(false);
              setSelectedMetric(null);
            }}
            metricName={selectedMetric.name}
            metricValue={selectedMetric.value}
            iotData={latestIoTData}
            cropInfo={cropData || undefined}
          />
        )}

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="fixed top-20 right-4 w-80 max-h-96 bg-white dark:bg-[#0f0e17] border-2 border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-slate-800 dark:to-slate-900">
              <h3 className="font-bold text-gray-900 dark:text-white">Thông báo</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Cảnh báo từ chuyên gia AI</p>
            </div>
            <div className="max-h-80 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có thông báo nào</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className={`p-3 rounded-lg border ${notif.read ? 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700' : 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700'}`}>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mb-1">{notif.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{notif.time.toLocaleTimeString('vi-VN')}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Messaging Panel */}
        {showMessaging && (
          <div className="fixed top-20 right-4 w-96 h-[600px] bg-white dark:bg-[#0f0e17] border-2 border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Chat với chuyên gia AI</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Hỏi bất cứ điều gì về nông nghiệp</p>
              </div>
              <button
                onClick={() => setShowMessaging(false)}
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center border border-gray-300 dark:border-slate-600"
              >
                <span className="text-xl text-gray-700 dark:text-gray-300">×</span>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-[#1a1625]">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-violet-600 dark:text-violet-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold mb-2">Chào bạn! 👋</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed px-6">
                    Tôi là chuyên gia AI nông nghiệp. Hãy hỏi tôi bất cứ điều gì về cây trồng, đất đai, hay chăm sóc nông trại!
                  </p>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                        : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-violet-200' : 'text-gray-400'}`}>
                        {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-[#0f0e17]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGeneralChat()}
                  placeholder="Hỏi chuyên gia AI..."
                  disabled={chatLoading}
                  className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all disabled:opacity-50"
                />
                <button
                  onClick={handleGeneralChat}
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          duration={5000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
