'use client';

import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress > 0 ? newProgress : 0;
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-400';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-rose-600 border-red-400';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-600 border-yellow-400';
      default:
        return 'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-400';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="fixed top-6 right-6 z-[9999] animate-slideInRight">
      <div
        className={`${getTypeStyles()} text-white px-6 py-4 rounded-xl shadow-2xl border-2 min-w-[300px] max-w-[500px] backdrop-blur-sm`}
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl">{getIcon()}</div>
          <div className="flex-1">
            <p className="text-sm font-medium leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors ml-2 text-xl leading-none"
          >
            ×
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
