'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

  // Loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center">
        <div className="text-6xl mb-4">🌾</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">AgroTwin</h1>
        <p className="text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
