'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Recommendation {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
}

interface RecommendationsProps {
  recommendations: Recommendation[];
}

export default function Recommendations({ recommendations }: RecommendationsProps) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '🔴';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🔵';
      default: return '⚪';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💡 Actionable Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{getPriorityIcon(rec.priority)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700">
                    {rec.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            ✅ No recommendations at this time. Soil conditions are optimal!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

