'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage, StorageKeys } from '@/lib/utils';
import { passkeyService } from '@/services/passkeyService';
import { User } from '@/services/authService';
import AnimatedBackground from '@/components/AnimatedBackground';

const CROPS = ['coffee', 'rice', 'maize', 'banana', 'mango', 'coconut', 'orange', 'apple', 'grapes', 'cotton', 'jute'];

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authMethod, setAuthMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'support'>('profile');
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', farm_name: '', farm_area_hectares: '', current_crop: 'coffee',
  });

  useEffect(() => {
    const savedUser = storage.get<User>(StorageKeys.USER);
    const savedAuthMethod = storage.get<string>(StorageKeys.AUTH_METHOD) || 'unknown';
    
    if (!savedUser) {
      router.push('/auth/login');
      return;
    }

    setUser(savedUser);
    setAuthMethod(savedAuthMethod);
    setFormData({
      full_name: savedUser.full_name || '',
      email: savedUser.email || '',
      phone: savedUser.phone || '',
      farm_name: savedUser.farm_name || '',
      farm_area_hectares: savedUser.farm_area_hectares?.toString() || '',
      current_crop: savedUser.current_crop || 'coffee',
    });
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user) throw new Error('User not found');

      const response = await fetch(`/api/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          farm_name: formData.farm_name || undefined,
          farm_area_hectares: formData.farm_area_hectares ? parseFloat(formData.farm_area_hectares) : undefined,
          current_crop: formData.current_crop,
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Update failed');

      const updatedUser: User = { 
        ...user, 
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        farm_name: formData.farm_name,
        farm_area_hectares: formData.farm_area_hectares ? parseFloat(formData.farm_area_hectares) : user.farm_area_hectares,
        current_crop: formData.current_crop
      };
      
      storage.set(StorageKeys.USER, updatedUser);
      setUser(updatedUser);
      setSuccess('✓ Saved successfully!');
      setTimeout(() => setSuccess(null), 3000);

    } catch (err: any) {
      setError(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPasskey = async () => {
    setLoading(true);
    try {
      if (!user) return;
      const isSupported = await passkeyService.isPlatformAuthenticatorAvailable();
      if (!isSupported) {
        alert('❌ Device not supported\n\nBiometric authentication not available on this device.');
        setLoading(false);
        return;
      }

      const passkeyResult = await passkeyService.register(user.full_name);
      if (!passkeyResult.success) throw new Error('Failed');

      const response = await fetch(`/api/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passkey_credential_id: passkeyResult.credentialId,
          passkey_public_key: passkeyResult.publicKey,
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      storage.set(StorageKeys.PASSKEY_CREDENTIAL, { id: passkeyResult.credentialId, publicKey: passkeyResult.publicKey });
      setSuccess('✓ Passkey added!');
      setAuthMethod('both');
    } catch (err: any) {
      alert('❌ ' + (err.message || 'Failed'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#1a1625] relative overflow-hidden">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-t-violet-600 dark:border-t-fuchsia-400 border-gray-200 dark:border-slate-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-violet-600 dark:text-fuchsia-400 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#f8fafc] dark:bg-[#1a1625]">
      <AnimatedBackground />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-gray-200 dark:border-slate-800 backdrop-blur-xl bg-white/70 dark:bg-[#0f0e17]/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="p-3 rounded-xl border-2 border-violet-200 dark:border-violet-800 bg-white/50 dark:bg-slate-800/50 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all group"
                >
                  <svg className="w-5 h-5 text-violet-600 dark:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 dark:from-fuchsia-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Settings
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Configure your account</p>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Toast Messages */}
        {(error || success) && (
          <div className="fixed top-6 right-6 z-50 animate-scale-in">
            {error && (
              <div className="px-6 py-4 bg-red-500/10 border border-red-500/30 backdrop-blur-xl rounded-2xl shadow-2xl">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-red-400">Error</p>
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}
            {success && (
              <div className="px-6 py-4 bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xl rounded-2xl shadow-2xl">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-emerald-400">Success</p>
                    <p className="text-sm text-emerald-300">{success}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-2 lg:sticky lg:top-24">
                {[
                  { 
                    id: 'profile', 
                    label: 'Profile',
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  },
                  { 
                    id: 'security', 
                    label: 'Security',
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  },
                  { 
                    id: 'support', 
                    label: 'Support',
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-medium flex items-center gap-3 border ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-700 shadow-lg shadow-violet-500/20'
                        : 'text-gray-600 dark:text-gray-400 bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-4">
              {activeTab === 'profile' && (
                <div className="relative">
                  <div className="absolute -inset-2 rounded-3xl blur-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 dark:from-fuchsia-500/20 dark:to-purple-500/20"></div>
                  <div className="relative p-8 backdrop-blur-xl rounded-3xl border-2 border-violet-200 dark:border-violet-800 bg-white/70 dark:bg-[#0f0e17]/80">
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Profile Information</h3>
                      <p className="text-gray-600 dark:text-gray-400">Manage your farm details</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-violet-600 dark:text-violet-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Full Name
                        </label>
                        <input
                          name="full_name"
                          type="text"
                          value={formData.full_name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-violet-600 dark:text-violet-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email
                        </label>
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-violet-600 dark:text-violet-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Phone
                        </label>
                        <input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-violet-600 dark:text-violet-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Farm Name
                        </label>
                        <input
                          name="farm_name"
                          value={formData.farm_name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-violet-600 dark:text-violet-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          Area (hectares)
                        </label>
                        <input
                          name="farm_area_hectares"
                          type="number"
                          step="0.1"
                          value={formData.farm_area_hectares}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-violet-600 dark:text-violet-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                          Current Crop
                        </label>
                        <select
                          name="current_crop"
                          value={formData.current_crop}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                          disabled={loading}
                        >
                          {CROPS.map(crop => (
                            <option key={crop} value={crop}>{crop.charAt(0).toUpperCase() + crop.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="w-full py-4 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                    >
                      {loading ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute -inset-2 rounded-3xl blur-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 dark:from-fuchsia-500/20 dark:to-purple-500/20"></div>
                    <div className="relative p-6 backdrop-blur-xl rounded-3xl border-2 border-violet-200 dark:border-violet-800 bg-white/70 dark:bg-[#0f0e17]/80">
                      <div className="flex items-center gap-2 mb-6">
                        <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Authentication</h3>
                      </div>
                      
                      <div className="p-5 border-2 rounded-2xl mb-6 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 border-violet-300 dark:border-violet-700">
                        <p className="text-sm mb-3 text-gray-600 dark:text-gray-400">Current method:</p>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-600 to-purple-600">
                            {authMethod === 'passkey' || authMethod === 'both' ? (
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {authMethod === 'passkey' && 'Passkey (Biometric)'}
                              {authMethod === 'pin' && 'PIN Authentication'}
                              {authMethod === 'both' && 'Passkey + PIN'}
                            </p>
                            <p className="text-xs text-violet-600 dark:text-violet-400">Secured</p>
                          </div>
                        </div>
                      </div>

                      {authMethod === 'pin' && (
                        <div className="p-5 border-2 rounded-2xl bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-700">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <h4 className="font-semibold text-violet-600 dark:text-violet-400">Upgrade Security</h4>
                          </div>
                          <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">
                            Add biometric authentication for faster access
                          </p>
                          <button
                            onClick={handleAddPasskey}
                            disabled={loading}
                            className="px-6 py-3 text-white font-medium rounded-xl transition-all flex items-center gap-2 bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {loading ? 'Adding...' : 'Add Passkey'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -inset-2 rounded-3xl blur-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 dark:from-fuchsia-500/20 dark:to-purple-500/20"></div>
                    <div className="relative p-6 backdrop-blur-xl rounded-3xl border-2 border-violet-200 dark:border-violet-800 bg-white/70 dark:bg-[#0f0e17]/80">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Blockchain Wallet</h3>
                      </div>
                      <div className="p-5 border-2 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 border-violet-300 dark:border-violet-700">
                        <p className="text-xs mb-2 text-violet-600 dark:text-violet-400">Zero Network Address</p>
                        <p className="font-mono text-sm break-all text-gray-900 dark:text-white">{user.wallet_address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -inset-2 rounded-3xl blur-xl bg-gradient-to-r from-red-500/20 to-orange-500/20"></div>
                    <div className="relative p-6 backdrop-blur-xl rounded-3xl border-2 border-red-300 dark:border-red-700 bg-white/70 dark:bg-[#0f0e17]/80">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="text-xl font-bold text-red-400">Danger Zone</h3>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Sign out?')) {
                            storage.remove(StorageKeys.USER);
                            storage.remove(StorageKeys.AUTH_METHOD);
                            router.push('/auth/login');
                          }
                        }}
                        className="px-6 py-3 border-2 text-red-400 font-medium rounded-xl transition-all flex items-center gap-2 bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'support' && (
                <div className="relative">
                  <div className="absolute -inset-2 rounded-3xl blur-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 dark:from-fuchsia-500/20 dark:to-purple-500/20"></div>
                  <div className="relative p-8 backdrop-blur-xl rounded-3xl border-2 border-violet-200 dark:border-violet-800 bg-white/70 dark:bg-[#0f0e17]/80">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Get Help</h3>
                    </div>
                    <p className="mb-8 text-gray-600 dark:text-gray-400">We're here to help you</p>

                    <div className="space-y-4">
                      <a
                        href="https://m.me/YOUR_ID"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <div className="relative p-6 border-2 rounded-2xl transition-all bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:border-violet-400 dark:hover:border-violet-600">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform bg-gradient-to-br from-violet-600 to-purple-600">
                              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.912 1.456 5.51 3.732 7.197V22l3.562-1.955c.95.263 1.958.405 3.006.405 5.523 0 10-4.145 10-9.243S17.523 2 12 2zm.993 12.416l-2.558-2.732-4.996 2.732 5.493-5.832 2.623 2.732 4.932-2.732-5.494 5.832z"/>
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-lg text-gray-900 dark:text-white">Chat via Messenger</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Quick response guaranteed</p>
                            </div>
                            <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        </div>
                      </a>

                      <a
                        href="https://zalo.me/1259373795369698660"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <div className="relative p-6 border-2 rounded-2xl transition-all bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:border-violet-400 dark:hover:border-violet-600">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform bg-gradient-to-br from-violet-600 to-purple-600">
                              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.912 1.456 5.51 3.732 7.197V22l3.562-1.955c.95.263 1.958.405 3.006.405 5.523 0 10-4.145 10-9.243S17.523 2 12 2z"/>
                                <path d="M10.5 14h3v1h-3v-1zm0-3h3v1h-3v-1zm0-3h3v1h-3V8z" fill="white"/>
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-lg text-gray-900 dark:text-white">Chat via Zalo</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Quick response guaranteed</p>
                            </div>
                            <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        </div>
                      </a>

                      <div className="p-6 border-2 rounded-2xl bg-white/50 dark:bg-slate-800/50 border-violet-200 dark:border-violet-800">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Available: <span className="font-semibold text-violet-600 dark:text-violet-400">8:00 - 22:00</span>
                          </p>
                        </div>
                        <p className="text-xs mt-2 text-center text-gray-500 dark:text-gray-500">Monday - Sunday</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
