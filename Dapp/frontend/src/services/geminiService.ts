import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const getGeminiClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(apiKey);
};

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
 */
export async function analyzeMetric(
  metricName: string,
  metricValue: number | string,
  iotData: IoTData,
  cropInfo?: CropInfo
): Promise<string> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Bạn là chuyên gia nông nghiệp thông minh. Hãy phân tích chỉ số sau và đưa ra lời khuyên cụ thể:

**Chỉ số đang xem:** ${metricName} = ${metricValue}

**Dữ liệu IoT hiện tại:**
- Nhiệt độ đất: ${iotData.temperature || 'N/A'}°C
- Độ ẩm đất: ${iotData.moisture || 'N/A'}%
- pH: ${iotData.pH || 'N/A'}
- NPK: N=${iotData.nitrogen || 0}, P=${iotData.phosphorus || 0}, K=${iotData.potassium || 0}
- Độ ẩm không khí: ${iotData.humidity || 'N/A'}%
- Nhiệt độ không khí: ${iotData.airTemp || 'N/A'}°C
- Độ mặn: ${iotData.salt || 'N/A'} mg/L

${cropInfo ? `**Thông tin cây trồng:**
- Tên cây: ${cropInfo.cropName}
- Ngày gieo trồng: ${cropInfo.plantedDate}
- Số ngày đã trồng: ${cropInfo.daysPlanted || 'N/A'} ngày
${cropInfo.harvestDate ? `- Dự kiến thu hoạch: ${cropInfo.harvestDate}` : ''}
` : ''}

Hãy trả lời như đang TƯ VẤN TRỰC TIẾP cho nông dân, giọng điệu thân thiện, dễ hiểu:

- Nói thẳng chỉ số này ổn hay có vấn đề gì
- Giải thích sao nó ảnh hưởng đến cây trồng
- Tư vấn cụ thể nên làm gì
- Cảnh báo nếu cần

QUAN TRỌNG:
- Viết như đang CHAT, KHÔNG dùng số thứ tự (1. 2. 3.)
- KHÔNG dùng bullet points (-, •)
- KHÔNG dùng headers (**Đánh giá**, **Tác động**)
- Viết thành CÁC ĐOẠN VĂN ngắn, mỗi đoạn 2-3 câu
- Dùng **bold** cho số liệu và điểm quan trọng
- Giọng văn thân thiện như đang nói chuyện

Độ dài: 120-150 từ.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Không thể kết nối với chuyên gia AI. Vui lòng thử lại sau.');
  }
}

/**
 * Daily monitoring and automatic alerts
 */
export async function analyzeDailyMonitoring(
  iotData: IoTData,
  cropInfo: CropInfo
): Promise<{ hasAlert: boolean; message: string; severity: 'low' | 'medium' | 'high' }> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Bạn là hệ thống giám sát nông nghiệp thông minh. Phân tích tình trạng cây trồng và cảnh báo nếu cần:

**Thông tin cây trồng:**
- Tên cây: ${cropInfo.cropName}
- Ngày gieo trồng: ${cropInfo.plantedDate}
- Số ngày đã trồng: ${cropInfo.daysPlanted || 0} ngày
${cropInfo.harvestDate ? `- Dự kiến thu hoạch: ${cropInfo.harvestDate}` : ''}

**Dữ liệu IoT hôm nay:**
- Nhiệt độ đất: ${iotData.temperature || 'N/A'}°C
- Độ ẩm đất: ${iotData.moisture || 'N/A'}%
- pH: ${iotData.pH || 'N/A'}
- NPK: N=${iotData.nitrogen || 0}, P=${iotData.phosphorus || 0}, K=${iotData.potassium || 0}
- Độ ẩm không khí: ${iotData.humidity || 'N/A'}%
- Nhiệt độ không khí: ${iotData.airTemp || 'N/A'}°C
- Độ mặn: ${iotData.salt || 'N/A'} mg/L

Trả về JSON với format:
{
  "hasAlert": true/false,
  "severity": "low"/"medium"/"high",
  "message": "Tin nhắn cảnh báo ngắn gọn (50-80 từ) hoặc 'OK' nếu mọi thứ bình thường"
}

Chỉ cảnh báo nếu:
- Có chỉ số bất thường so với giai đoạn sinh trưởng
- Có nguy cơ ảnh hưởng đến năng suất
- Cần hành động khẩn cấp`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Try to parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
    
    // Fallback
    return {
      hasAlert: false,
      message: 'Mọi thứ đang ổn định.',
      severity: 'low'
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
 */
export async function chatWithExpert(
  message: string,
  iotData: IoTData,
  cropInfo?: CropInfo,
  chatHistory?: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>
): Promise<string> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const contextPrompt = `Bạn là chuyên gia nông nghiệp, đang TƯ VẤN TRỰC TIẾP cho nông dân qua chat.

Ngữ cảnh:
${cropInfo ? `- Đang trồng: ${cropInfo.cropName}, đã ${cropInfo.daysPlanted || 0} ngày` : '- Chưa có thông tin cây trồng'}

Dữ liệu IoT hiện tại:
- Nhiệt độ đất: ${iotData.temperature || 'N/A'}°C, Độ ẩm đất: ${iotData.moisture || 'N/A'}%
- pH: ${iotData.pH || 'N/A'}, NPK: N=${iotData.nitrogen || 0} P=${iotData.phosphorus || 0} K=${iotData.potassium || 0}
- Không khí: ${iotData.airTemp || 'N/A'}°C, ${iotData.humidity || 'N/A'}% độ ẩm
- Độ mặn: ${iotData.salt || 'N/A'} mg/L

Câu hỏi: ${message}

Trả lời:
- Như đang CHAT, giọng thân thiện, dễ hiểu
- Viết thành ĐỌA VĂN ngắn, KHÔNG dùng số (1. 2.), KHÔNG bullet points (-)
- Dùng **bold** cho thông tin quan trọng
- Ngắn gọn, súc tích, thực tế`;

    const chat = model.startChat({
      history: chatHistory || [],
    });

    const result = await chat.sendMessage(contextPrompt);
    return result.response.text();
  } catch (error) {
    console.error('Chat error:', error);
    throw new Error('Không thể kết nối với chuyên gia. Vui lòng thử lại.');
  }
}

