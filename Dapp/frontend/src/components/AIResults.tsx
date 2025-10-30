'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface AIResultsProps {
  data: {
    crop_recommendation?: {
      best_crop: string;
      confidence: number;
      top_3?: Array<{ crop: string; confidence: number }>;
    };
    soil_health?: {
      overall_score: number;
      rating: string;
      component_scores?: any;
    };
    anomaly_detection?: {
      is_anomaly: boolean;
      anomaly_score: number;
      severity?: string;
    };
  };
}

export default function AIResults({ data }: AIResultsProps) {
  if (!data) return null;

  const { crop_recommendation, soil_health, anomaly_detection } = data;

  // Health rating color
  const getHealthColor = (rating: string) => {
    switch (rating?.toUpperCase()) {
      case 'EXCELLENT': return 'text-green-600 bg-green-50';
      case 'GOOD': return 'text-blue-600 bg-blue-50';
      case 'FAIR': return 'text-yellow-600 bg-yellow-50';
      case 'POOR': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Anomaly color
  const anomalyColor = anomaly_detection?.is_anomaly
    ? 'text-red-600 bg-red-50 border-red-200'
    : 'text-green-600 bg-green-50 border-green-200';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Crop Recommendation */}
      {crop_recommendation && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              🌾 Crop Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-gray-900 capitalize">
                  {crop_recommendation.best_crop}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Confidence: {(crop_recommendation.confidence * 100).toFixed(1)}%
                </p>
              </div>

              {crop_recommendation.top_3 && crop_recommendation.top_3.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-xs font-medium text-gray-600 mb-2">Top 3 Alternatives:</p>
                  <div className="space-y-1">
                    {crop_recommendation.top_3.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="capitalize text-gray-700">{item.crop}</span>
                        <span className="text-gray-500">{(item.confidence * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Soil Health */}
      {soil_health && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              📈 Soil Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {soil_health.overall_score.toFixed(1)}
                  <span className="text-lg text-gray-500">/100</span>
                </p>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getHealthColor(soil_health.rating)}`}>
                  {soil_health.rating?.toUpperCase()}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${soil_health.overall_score}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Anomaly Detection */}
      {anomaly_detection && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              🚨 Anomaly Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className={`px-4 py-3 rounded-lg border ${anomalyColor}`}>
                <p className="text-lg font-bold">
                  {anomaly_detection.is_anomaly ? '⚠️ Anomaly Detected' : '✅ Normal'}
                </p>
                <p className="text-sm mt-1">
                  Score: {anomaly_detection.anomaly_score.toFixed(3)}
                </p>
              </div>

              {anomaly_detection.is_anomaly && (
                <p className="text-xs text-gray-600">
                  ⚠️ Unusual sensor readings detected. Please verify sensor calibration.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

