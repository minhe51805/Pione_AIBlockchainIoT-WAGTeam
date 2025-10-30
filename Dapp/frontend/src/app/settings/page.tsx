'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage, StorageKeys } from '@/lib/utils';
import { passkeyService } from '@/services/passkeyService';
import { User } from '@/services/authService';

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#faf0e6' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'rgba(184, 115, 51, 0.2)', borderTopColor: '#b87333' }}></div>
          <p style={{ color: '#6b4423' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#faf0e6' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top, rgba(184, 115, 51, 0.08), #faf0e6, #faf0e6)' }}></div>
        <div className="absolute top-0 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" style={{ backgroundColor: 'rgba(184, 115, 51, 0.15)' }}></div>
        <div className="absolute -bottom-8 right-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000" style={{ backgroundColor: 'rgba(212, 165, 116, 0.15)' }}></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b backdrop-blur-xl" style={{ borderColor: 'rgba(184, 115, 51, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="p-3 rounded-xl border transition-all group"
                  style={{ 
                    backgroundColor: 'rgba(250, 240, 230, 0.5)', 
                    borderColor: '#d4a574'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(184, 115, 51, 0.1)';
                    e.currentTarget.style.borderColor = '#b87333';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(250, 240, 230, 0.5)';
                    e.currentTarget.style.borderColor = '#d4a574';
                  }}
                >
                  <svg className="w-5 h-5 transition-colors" style={{ color: '#b87333' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl font-bold" style={{ 
                    background: 'linear-gradient(to right, #b87333, #d4a574)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    Settings
                  </h1>
                  <p className="text-xs" style={{ color: '#6b4423' }}>Configure your account</p>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Toast Messages */}
        {(error || success) && (
          <div className="fixed top-6 right-6 z-50 animate-slide-in">
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
                    className="w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-medium flex items-center gap-3 border"
                    style={activeTab === tab.id ? {
                      background: 'linear-gradient(to right, rgba(184, 115, 51, 0.15), rgba(212, 165, 116, 0.15))',
                      color: '#2d2d2d',
                      borderColor: 'rgba(184, 115, 51, 0.4)',
                      boxShadow: '0 10px 15px -3px rgba(184, 115, 51, 0.1)'
                    } : {
                      color: '#6b4423',
                      backgroundColor: 'transparent',
                      borderColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.backgroundColor = 'rgba(250, 240, 230, 0.5)';
                        e.currentTarget.style.color = '#2d2d2d';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#6b4423';
                      }
                    }}
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
                  <div className="absolute -inset-2 rounded-3xl blur-xl" style={{ background: 'linear-gradient(to right, rgba(184, 115, 51, 0.15), rgba(212, 165, 116, 0.15))' }}></div>
                  <div className="relative p-8 backdrop-blur-xl rounded-3xl border-2" style={{ backgroundColor: '#ffffff', borderColor: '#d4a574' }}>
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold mb-2" style={{ color: '#2d2d2d' }}>Profile Information</h3>
                      <p style={{ color: '#6b4423' }}>Manage your farm details</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#b87333' }}>
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
                          className="w-full px-4 py-3 border-2 rounded-xl placeholder-gray-400 transition-all copper-input"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#b87333' }}>
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
                          className="w-full px-4 py-3 border-2 rounded-xl placeholder-gray-400 transition-all copper-input"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#b87333' }}>
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
                          className="w-full px-4 py-3 border-2 rounded-xl placeholder-gray-400 transition-all copper-input"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#b87333' }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Farm Name
                        </label>
                        <input
                          name="farm_name"
                          value={formData.farm_name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 rounded-xl placeholder-gray-400 transition-all copper-input"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#b87333' }}>
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
                          className="w-full px-4 py-3 border-2 rounded-xl placeholder-gray-400 transition-all copper-input"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#b87333' }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                          Current Crop
                        </label>
                        <select
                          name="current_crop"
                          value={formData.current_crop}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
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
                      className="w-full py-4 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{
                        background: loading ? '#9ca3af' : 'linear-gradient(to right, #b87333, #d4a574)',
                        boxShadow: '0 10px 15px -3px rgba(184, 115, 51, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) e.currentTarget.style.background = 'linear-gradient(to right, #9b5c1f, #b87333)';
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) e.currentTarget.style.background = 'linear-gradient(to right, #b87333, #d4a574)';
                      }}
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
                    <div className="absolute -inset-2 rounded-3xl blur-xl" style={{ background: 'linear-gradient(to right, rgba(184, 115, 51, 0.1), rgba(212, 165, 116, 0.1))' }}></div>
                    <div className="relative p-6 backdrop-blur-xl rounded-3xl border-2" style={{ backgroundColor: '#ffffff', borderColor: '#d4a574' }}>
                      <div className="flex items-center gap-2 mb-6">
                        <svg className="w-6 h-6" style={{ color: '#b87333' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <h3 className="text-xl font-bold" style={{ color: '#2d2d2d' }}>Authentication</h3>
                      </div>
                      
                      <div className="p-5 border-2 rounded-2xl mb-6" style={{ background: 'linear-gradient(135deg, rgba(184, 115, 51, 0.08), rgba(212, 165, 116, 0.08))', borderColor: 'rgba(184, 115, 51, 0.3)' }}>
                        <p className="text-sm mb-3" style={{ color: '#6b4423' }}>Current method:</p>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #b87333, #d4a574)' }}>
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
                            <p className="font-semibold" style={{ color: '#2d2d2d' }}>
                              {authMethod === 'passkey' && 'Passkey (Biometric)'}
                              {authMethod === 'pin' && 'PIN Authentication'}
                              {authMethod === 'both' && 'Passkey + PIN'}
                            </p>
                            <p className="text-xs" style={{ color: '#b87333' }}>Secured</p>
                          </div>
                        </div>
                      </div>

                      {authMethod === 'pin' && (
                        <div className="p-5 border-2 rounded-2xl" style={{ background: 'rgba(184, 115, 51, 0.08)', borderColor: 'rgba(184, 115, 51, 0.3)' }}>
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5" style={{ color: '#b87333' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <h4 className="font-semibold" style={{ color: '#b87333' }}>Upgrade Security</h4>
                          </div>
                          <p className="text-sm mb-4" style={{ color: '#6b4423' }}>
                            Add biometric authentication for faster access
                          </p>
                          <button
                            onClick={handleAddPasskey}
                            disabled={loading}
                            className="px-6 py-3 text-white font-medium rounded-xl transition-all flex items-center gap-2"
                            style={{ background: loading ? '#9ca3af' : 'linear-gradient(135deg, #b87333, #d4a574)' }}
                            onMouseEnter={(e) => {
                              if (!loading) e.currentTarget.style.background = 'linear-gradient(135deg, #9b5c1f, #b87333)';
                            }}
                            onMouseLeave={(e) => {
                              if (!loading) e.currentTarget.style.background = 'linear-gradient(135deg, #b87333, #d4a574)';
                            }}
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
                    <div className="absolute -inset-2 rounded-3xl blur-xl" style={{ background: 'linear-gradient(to right, rgba(184, 115, 51, 0.1), rgba(212, 165, 116, 0.1))' }}></div>
                    <div className="relative p-6 backdrop-blur-xl rounded-3xl border-2" style={{ backgroundColor: '#ffffff', borderColor: '#d4a574' }}>
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-6 h-6" style={{ color: '#b87333' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        <h3 className="text-xl font-bold" style={{ color: '#2d2d2d' }}>Blockchain Wallet</h3>
                      </div>
                      <div className="p-5 border-2 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(184, 115, 51, 0.08), rgba(212, 165, 116, 0.08))', borderColor: 'rgba(184, 115, 51, 0.3)' }}>
                        <p className="text-xs mb-2" style={{ color: '#b87333' }}>Zero Network Address</p>
                        <p className="font-mono text-sm break-all" style={{ color: '#2d2d2d' }}>{user.wallet_address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -inset-2 rounded-3xl blur-xl" style={{ background: 'linear-gradient(to right, rgba(239, 68, 68, 0.1), rgba(251, 146, 60, 0.1))' }}></div>
                    <div className="relative p-6 backdrop-blur-xl rounded-3xl border-2" style={{ backgroundColor: '#ffffff', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
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
                        className="px-6 py-3 border-2 text-red-400 font-medium rounded-xl transition-all flex items-center gap-2"
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                        }}
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
                  <div className="absolute -inset-2 rounded-3xl blur-xl" style={{ background: 'linear-gradient(to right, rgba(184, 115, 51, 0.15), rgba(212, 165, 116, 0.15))' }}></div>
                  <div className="relative p-8 backdrop-blur-xl rounded-3xl border-2" style={{ backgroundColor: '#ffffff', borderColor: '#d4a574' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-6 h-6" style={{ color: '#b87333' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <h3 className="text-2xl font-bold" style={{ color: '#2d2d2d' }}>Get Help</h3>
                    </div>
                    <p className="mb-8" style={{ color: '#6b4423' }}>We're here to help you</p>

                    <div className="space-y-4">
                      <a
                        href="https://m.me/YOUR_ID"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <div className="relative p-6 border-2 rounded-2xl transition-all" style={{ backgroundColor: 'rgba(184, 115, 51, 0.08)', borderColor: 'rgba(184, 115, 51, 0.3)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(184, 115, 51, 0.15)';
                            e.currentTarget.style.borderColor = 'rgba(184, 115, 51, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(184, 115, 51, 0.08)';
                            e.currentTarget.style.borderColor = 'rgba(184, 115, 51, 0.3)';
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #b87333, #d4a574)' }}>
                              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.912 1.456 5.51 3.732 7.197V22l3.562-1.955c.95.263 1.958.405 3.006.405 5.523 0 10-4.145 10-9.243S17.523 2 12 2zm.993 12.416l-2.558-2.732-4.996 2.732 5.493-5.832 2.623 2.732 4.932-2.732-5.494 5.832z"/>
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-lg" style={{ color: '#2d2d2d' }}>Chat via Messenger</p>
                              <p className="text-sm" style={{ color: '#6b4423' }}>Quick response guaranteed</p>
                            </div>
                            <svg className="w-6 h-6 transition-colors" style={{ color: '#6b4423' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        </div>
                      </a>

                      <a
                        href="https://zalo.me/YOUR_ID"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <div className="relative p-6 border-2 rounded-2xl transition-all" style={{ backgroundColor: 'rgba(184, 115, 51, 0.08)', borderColor: 'rgba(184, 115, 51, 0.3)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(184, 115, 51, 0.15)';
                            e.currentTarget.style.borderColor = 'rgba(184, 115, 51, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(184, 115, 51, 0.08)';
                            e.currentTarget.style.borderColor = 'rgba(184, 115, 51, 0.3)';
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #b87333, #d4a574)' }}>
                              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.912 1.456 5.51 3.732 7.197V22l3.562-1.955c.95.263 1.958.405 3.006.405 5.523 0 10-4.145 10-9.243S17.523 2 12 2z"/>
                                <path d="M10.5 14h3v1h-3v-1zm0-3h3v1h-3v-1zm0-3h3v1h-3V8z" fill="white"/>
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-lg" style={{ color: '#2d2d2d' }}>Chat via Zalo</p>
                              <p className="text-sm" style={{ color: '#6b4423' }}>Quick response guaranteed</p>
                            </div>
                            <svg className="w-6 h-6 transition-colors" style={{ color: '#6b4423' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        </div>
                      </a>

                      <div className="p-6 border-2 rounded-2xl" style={{ backgroundColor: 'rgba(250, 240, 230, 0.5)', borderColor: '#d4a574' }}>
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" style={{ color: '#b87333' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm" style={{ color: '#6b4423' }}>
                            Available: <span className="font-semibold" style={{ color: '#b87333' }}>8:00 - 22:00</span>
                          </p>
                        </div>
                        <p className="text-xs mt-2 text-center" style={{ color: '#9ca3af' }}>Monday - Sunday</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
