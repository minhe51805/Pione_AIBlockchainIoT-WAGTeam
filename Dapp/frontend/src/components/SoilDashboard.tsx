'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/DatePicker';
import AIResults from '@/components/AIResults';
import SensorChart from '@/components/SensorChart';
import Recommendations from '@/components/Recommendations';
import { formatAddress } from '@/services/walletFromPasskey';

interface UserInfo {
  id: number;
  full_name: string;
  wallet_address: string;
  phone?: string;
  farm_name?: string;
  current_crop?: string;
}

export default function SoilDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('2025-10-28');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle "Analyze" button - Get data for selected date
  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (err: any) {
      console.error('Analyze error:', err);
      setError(err.message || 'Failed to analyze data');
    } finally {
      setLoading(false);
    }
  };

  // Handle "Trigger Daily Pipeline" button - Full flow
  const handleTriggerPipeline = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/analyze-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate })
      });

      if (!response.ok) {
        throw new Error(`Pipeline error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform response to match display format
      const transformedData = {
        aggregated_data: data.aggregated_data,
        ai_analysis: {
          crop_recommendation: data.crop_recommendation,
          soil_health: data.soil_health,
          anomaly_detection: data.anomaly_detection,
          recommendations: data.recommendations
        }
      };
      
      setAnalysisData(transformedData);
      alert(`✅ Pipeline complete! TX: ${data.blockchain_tx?.substring(0, 10)}...`);
    } catch (err: any) {
      console.error('Pipeline error:', err);
      setError(err.message || 'Failed to run pipeline');
    } finally {
      setLoading(false);
    }
  };

  // Check auth on mount
  useEffect(() => {
    const userStr = localStorage.getItem('aquamind_user');
    if (!userStr) {
      router.push('/auth/login');
      return;
    }
    
    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      console.log('✅ User loaded:', userData);
    } catch (err) {
      console.error('❌ Invalid user data:', err);
      router.push('/auth/login');
    }
  }, [router]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('aquamind_user');
    router.push('/auth/login');
  };

  // Show loading while checking auth
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header with User Info */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🌾 Pione Soil Analysis Dashboard
            </h1>
            <div className="text-gray-600 space-y-1">
              <p>
                👨‍🌾 <span className="font-semibold">{user.full_name}</span>
                {user.farm_name && <span className="ml-2 text-sm">({user.farm_name})</span>}
              </p>
              <p>
                💰 Ví: <span className="font-mono text-sm">{formatAddress(user.wallet_address)}</span>
              </p>
              {user.current_crop && (
                <p className="text-sm">🌱 Cây trồng: <span className="capitalize">{user.current_crop}</span></p>
              )}
            </div>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
          >
            🚪 Đăng xuất
          </Button>
        </div>
      </div>

      {/* Date Picker & Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
          <CardDescription>
            Choose a date to analyze soil data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <DatePicker value={selectedDate} onChange={setSelectedDate} />
            
            <div className="flex gap-2">
              <Button
                onClick={handleAnalyze}
                disabled={loading}
                variant="default"
              >
                {loading ? '⏳ Loading...' : '🔍 Analyze'}
              </Button>
              
              <Button
                onClick={handleTriggerPipeline}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? '⏳ Processing...' : '🚀 Analyze Daily'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">❌ {error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {analysisData && (
        <div className="space-y-6">
          {/* AI Analysis Results */}
          <AIResults data={analysisData.ai_analysis} />
          
          {/* Sensor Chart */}
          <SensorChart data={analysisData.aggregated_data} />
          
          {/* Recommendations */}
          {analysisData.ai_analysis?.recommendations && (
            <Recommendations recommendations={analysisData.ai_analysis.recommendations} />
          )}
        </div>
      )}

      {/* Empty State */}
      {!analysisData && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 text-lg">
              📅 Select a date and click "Analyze" to view soil data
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

