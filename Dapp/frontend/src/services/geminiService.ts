// Backend API endpoint (no longer using Gemini directly to avoid rate limits)
const API_BASE_URL = '/api/ai';

interface IoTData {
  temperature?: number;
  moisture?: number;
  pH?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  humidity?: number;
  salt?: number;
  airTemp?: number;
}

interface CropInfo {
  cropName: string;
  plantedDate: string;
  harvestDate?: string;
  daysPlanted?: number;
}

/**
 * Analyze specific metric and provide recommendations
 * Now using backend API instead of Gemini to avoid rate limits
 */
export async function analyzeMetric(
  metricName: string,
  metricValue: number | string,
  iotData: IoTData,
  cropInfo?: CropInfo
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Phân tích ${metricName} = ${metricValue}`,
        iotData: iotData,
        cropInfo: cropInfo
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response || 'Không có phân tích.';
  } catch (error) {
    console.error('Backend API Error:', error);
    throw new Error('Không thể kết nối với chuyên gia AI. Vui lòng thử lại sau.');
  }
}

/**
 * Daily monitoring and automatic alerts
 * Simplified version using rule-based logic
 */
export async function analyzeDailyMonitoring(
  iotData: IoTData,
  cropInfo: CropInfo
): Promise<{ hasAlert: boolean; message: string; severity: 'low' | 'medium' | 'high' }> {
  try {
    const alerts = [];
    let maxSeverity: 'low' | 'medium' | 'high' = 'low';

    // Check temperature
    if (iotData.temperature && (iotData.temperature < 15 || iotData.temperature > 40)) {
      alerts.push(`Nhiệt độ đất ${iotData.temperature}°C bất thường`);
      maxSeverity = 'high';
    }

    // Check moisture
    if (iotData.moisture && (iotData.moisture < 20 || iotData.moisture > 90)) {
      alerts.push(`Độ ẩm ${iotData.moisture}% cần điều chỉnh`);
      maxSeverity = maxSeverity === 'high' ? 'high' : 'medium';
    }

    // Check pH
    if (iotData.pH && (iotData.pH < 5.5 || iotData.pH > 8.0)) {
      alerts.push(`pH ${iotData.pH} ngoài giới hạn tối ưu`);
      maxSeverity = maxSeverity === 'high' ? 'high' : 'medium';
    }

    // Check NPK
    if (iotData.nitrogen && iotData.nitrogen < 30) {
      alerts.push('Thiếu Nitrogen');
      maxSeverity = maxSeverity === 'high' ? 'high' : 'medium';
    }

    if (alerts.length === 0) {
    return {
      hasAlert: false,
        message: 'Mọi chỉ số đang ổn định. Cây trồng phát triển tốt.',
      severity: 'low'
      };
    }

    return {
      hasAlert: true,
      message: `⚠️ Cần chú ý: ${alerts.join(', ')}. Bác nên kiểm tra và điều chỉnh nhé!`,
      severity: maxSeverity
    };
  } catch (error) {
    console.error('Daily monitoring error:', error);
    return {
      hasAlert: false,
      message: 'Không thể phân tích dữ liệu hôm nay.',
      severity: 'low'
    };
  }
}

/**
 * Chat with AI expert
 * Now using backend API instead of Gemini to avoid rate limits
 */
export async function chatWithExpert(
  message: string,
  iotData: IoTData,
  cropInfo?: CropInfo,
  chatHistory?: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        iotData: iotData,
        cropInfo: cropInfo
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response || 'Không có câu trả lời.';
  } catch (error) {
    console.error('Chat error:', error);
    throw new Error('Không thể kết nối với chuyên gia. Vui lòng thử lại.');
  }
}

