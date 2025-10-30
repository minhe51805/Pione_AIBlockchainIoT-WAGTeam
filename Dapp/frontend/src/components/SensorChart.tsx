'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SensorChartProps {
  data: {
    soil_temp_avg?: number;
    soil_moisture_avg?: number;
    ec_avg?: number;
    ph_avg?: number;
    n_avg?: number;
    p_avg?: number;
    k_avg?: number;
    salt_avg?: number;
    air_temp_avg?: number;
    air_humidity_avg?: number;
  };
}

export default function SensorChart({ data }: SensorChartProps) {
  if (!data) return null;

  const chartData = {
    labels: ['Soil Temp (°C)', 'Soil Moisture (%)', 'pH', 'N (mg/kg)', 'P (mg/kg)', 'K (mg/kg)'],
    datasets: [
      {
        label: 'Sensor Values',
        data: [
          data.soil_temp_avg || 0,
          data.soil_moisture_avg || 0,
          data.ph_avg || 0,
          data.n_avg || 0,
          data.p_avg || 0,
          data.k_avg || 0,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Sensor Data Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Bar data={chartData} options={options} />
        </div>

        {/* Additional metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-xs text-gray-500">EC</p>
            <p className="text-lg font-semibold">{data.ec_avg?.toFixed(2) || 'N/A'} <span className="text-xs text-gray-500">mS/cm</span></p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Salt</p>
            <p className="text-lg font-semibold">{data.salt_avg?.toFixed(0) || 'N/A'} <span className="text-xs text-gray-500">mg/L</span></p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Air Temp</p>
            <p className="text-lg font-semibold">{data.air_temp_avg?.toFixed(1) || 'N/A'} <span className="text-xs text-gray-500">°C</span></p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Air Humidity</p>
            <p className="text-lg font-semibold">{data.air_humidity_avg?.toFixed(1) || 'N/A'} <span className="text-xs text-gray-500">%</span></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

