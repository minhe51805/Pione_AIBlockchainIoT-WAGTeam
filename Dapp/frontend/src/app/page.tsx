'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

/**
 * Root page - Redirect to login
 * This replaces the old PIN-based authentication page
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const userStr = localStorage.getItem('aquamind_user');
    
    if (userStr) {
      // User exists, go to dashboard
      router.push('/dashboard');
    } else {
      // No user, go to login
      router.push('/auth/login');
    }
  }, [router]);

  // Loading state while redirecting - Modern with Canvas
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Canvas Background */}
      <div className="fixed inset-0" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 bg-[#f8fafc] dark:bg-gradient-to-br dark:from-[#0f0e17] dark:via-[#1a1625] dark:to-[#0f0e17]"></div>
        <AnimatedBackground />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 px-6">
        <div className="text-center animate-fade-in">
          {/* Logo Container with Glassmorphism */}
          <div className="relative inline-block mb-8">
            <div className="absolute -inset-6 bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative p-8 bg-white/70 dark:bg-[#0f0e17]/80 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-[#2d2640] shadow-2xl">
              <div className="w-24 h-24 flex items-center justify-center bg-gradient-to-br from-[#a855f7] to-[#7c3aed] rounded-2xl shadow-xl">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl font-black mb-4 text-gray-800 dark:text-white">
            Initializing AgroTwin...
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-8">
            Đang tải dữ liệu của bạn
          </p>

          {/* Loading Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="h-2 bg-gray-200 dark:bg-[#1a1625] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full animate-pulse" 
                   style={{ width: '70%', transition: 'width 2s ease-in-out' }}>
              </div>
            </div>
            
            {/* Loading Dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-fuchsia-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>

          {/* Features List */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <div className="px-4 py-2 bg-white/70 dark:bg-[#0f0e17]/80 backdrop-blur-xl rounded-lg border border-gray-200 dark:border-[#2d2640] flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">AI-Powered</span>
            </div>
            <div className="px-4 py-2 bg-white/70 dark:bg-[#0f0e17]/80 backdrop-blur-xl rounded-lg border border-gray-200 dark:border-[#2d2640] flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Blockchain</span>
            </div>
            <div className="px-4 py-2 bg-white/70 dark:bg-[#0f0e17]/80 backdrop-blur-xl rounded-lg border border-gray-200 dark:border-[#2d2640] flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">IoT Sensors</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
