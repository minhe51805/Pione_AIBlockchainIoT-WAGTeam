# 🤖 AI Expert System - Tính năng Chuyên gia AI

## 📋 Tổng quan

Hệ thống chuyên gia AI thông minh được tích hợp vào dashboard, sử dụng **Gemini 2.0 Flash** để phân tích dữ liệu IoT realtime và cung cấp lời khuyên nông nghiệp chuyên sâu.

---

## 🎯 Các tính năng đã triển khai

### 1. **📊 Phân tích Chỉ số Realtime (Metric Analysis)**

**Cách sử dụng:**
- Hover chuột vào các card chỉ số IoT (Temp, Moisture, pH, NPK, Air, Humid, Salt)
- Sẽ hiện tooltip "Nhấn để hỏi chuyên gia AI"
- Click vào card → Mở modal chat với AI
- AI sẽ tự động phân tích chỉ số đó và đưa ra:
  - Đánh giá chỉ số có phù hợp không
  - Giải thích tác động đến cây trồng
  - 2-3 hành động cụ thể nên làm
  - Cảnh báo rủi ro (nếu có)

**Ví dụ:**
```
User: Click vào "pH: 6.5"
AI: "Chỉ số pH 6.5 là lý tưởng cho hầu hết cây trồng! 
     - Giúp cây hấp thụ dinh dưỡng tốt nhất
     - Nên duy trì trong khoảng 6.0-7.0
     - Kiểm tra định kỳ 1 tuần/lần
     - Nếu pH giảm < 6.0: bón vôi bột
     - Nếu pH tăng > 7.0: bổ sung phân hữu cơ"
```

### 2. **🌾 Quản lý Cây trồng (Crop Management)**

**Vị trí:** Ngay đầu dashboard (sau header)

**Tính năng:**
- ➕ Thêm thông tin cây trồng mới
- 📝 Chỉnh sửa thông tin cây đang trồng
- 🗑️ Xóa thông tin cây
- 📊 Hiển thị:
  - Tên cây trồng
  - Số ngày đã trồng (tự động tính)
  - Ngày gieo trồng
  - Ngày thu hoạch dự kiến
  - Số ngày còn lại đến thu hoạch
  - Ghi chú

**Dữ liệu lưu trữ:** LocalStorage (key: `current_crop`)

**Ý nghĩa:**
- AI sẽ sử dụng thông tin này để:
  - Đưa lời khuyên phù hợp với giai đoạn sinh trưởng
  - Cảnh báo nếu chỉ số không phù hợp với tuổi cây
  - Nhắc nhở các công việc theo lịch (tưới, bón phân, thu hoạch)

### 3. **💬 Chat trực tiếp với Chuyên gia AI**

**Cách mở:**
- Click icon **💬 Messaging** (góc phải header)
- Hoặc click vào bất kỳ card chỉ số nào

**Tính năng:**
- Chat 2 chiều với AI
- AI có context đầy đủ về:
  - Tất cả chỉ số IoT hiện tại
  - Thông tin cây trồng
  - Lịch sử chat trước đó
- Hỏi bất kỳ câu hỏi nào về:
  - Cách chăm sóc cây trồng
  - Xử lý sâu bệnh
  - Lịch bón phân, tưới nước
  - Dự đoán năng suất

**Ví dụ câu hỏi:**
- "Cà phê của tôi đang bị vàng lá, phải làm sao?"
- "Khi nào nên bón phân Kali?"
- "Nhiệt độ 30°C có ảnh hưởng gì không?"

### 4. **🔔 Thông báo Thông minh (Smart Notifications)**

**Vị trí:** Icon 🔔 Notifications (góc phải header)

**Chức năng:**
- Hiển thị cảnh báo từ AI
- Badge đỏ hiển thị số thông báo chưa đọc
- Các loại thông báo:
  - ⚠️ **High severity:** Cảnh báo khẩn cấp (nhiệt độ quá cao, độ ẩm quá thấp)
  - ⚡ **Medium severity:** Cần chú ý (chỉ số bất thường)
  - ℹ️ **Low severity:** Thông tin thường (nhắc nhở công việc)

**Tự động hóa (Sắp triển khai):**
- AI tự động phân tích mỗi ngày
- Nếu phát hiện bất thường → Gửi thông báo
- Ví dụ:
  ```
  "⚠️ Nhiệt độ đất 35°C - Quá cao!
   Cà phê đang giai đoạn ra hoa (ngày 45) rất nhạy cảm.
   Hành động ngay:
   - Tưới nước sáng sớm & chiều mát
   - Che phủ rơm quanh gốc
   - Tránh tưới giữa trưa"
  ```

---

## ⚙️ Cấu hình

### 1. **Cài đặt Gemini API Key**

Tạo file `.env.local` trong `Dapp/frontend/`:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

**Lấy API Key:**
1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập Google
3. Click "Create API Key"
4. Copy key và dán vào `.env.local`

### 2. **Cấu hình Model**

File: `src/services/geminiService.ts`

```typescript
// Thay đổi model nếu cần
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp'  // Hoặc: 'gemini-pro', 'gemini-1.5-pro'
});
```

**Các model khả dụng:**
- `gemini-2.0-flash-exp`: Nhanh nhất, miễn phí (đang dùng) ⚡
- `gemini-1.5-flash`: Nhanh, ổn định
- `gemini-1.5-pro`: Chất lượng cao nhất, chậm hơn

---

## 🏗️ Kiến trúc Hệ thống

```
┌─────────────────────────────────────────┐
│         Dashboard Page                   │
│  ┌────────────────────────────────────┐ │
│  │   Crop Management Component        │ │
│  │   - Add/Edit/Delete Crop           │ │
│  │   - Auto calculate days planted    │ │
│  └────────────────────────────────────┘ │
│                                           │
│  ┌────────────────────────────────────┐ │
│  │   Metric Cards (IoT Sensors)       │ │
│  │   - Hover: Show tooltip            │ │
│  │   - Click: Open AI Chat Modal      │ │
│  └────────────────────────────────────┘ │
│                                           │
│  ┌────────────────────────────────────┐ │
│  │   Header Icons                     │ │
│  │   - 💬 Messaging                   │ │
│  │   - 🔔 Notifications (+ Badge)     │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    │
                    ├───────────────────────┐
                    │                        │
          ┌─────────▼────────┐     ┌────────▼────────┐
          │  AI Chat Modal   │     │  Gemini Service │
          │  - Message list  │────►│  - analyzeMetric│
          │  - Input field   │     │  - chatWithExpert│
          │  - Auto-scroll   │     │  - dailyMonitoring│
          └──────────────────┘     └──────────────────┘
                                            │
                                   ┌────────▼────────┐
                                   │  Gemini 2.0 API │
                                   │  (Google Cloud) │
                                   └─────────────────┘
```

---

## 📁 Các File đã tạo/chỉnh sửa

### ✅ **Files Mới:**
1. **`src/services/geminiService.ts`**
   - `analyzeMetric()`: Phân tích 1 chỉ số cụ thể
   - `chatWithExpert()`: Chat 2 chiều với AI
   - `analyzeDailyMonitoring()`: Giám sát tự động (dùng cho background job)

2. **`src/components/AIChatModal.tsx`**
   - Modal chat với AI
   - Hiển thị phân tích ban đầu
   - Chat lịch sử
   - Loading state

3. **`src/components/CropManagement.tsx`**
   - Form thêm/sửa cây trồng
   - Hiển thị thông tin cây đang trồng
   - Tính toán tự động số ngày
   - Local storage integration

4. **`AI_FEATURES_README.md`**
   - Tài liệu này

### ✏️ **Files Đã Chỉnh Sửa:**
1. **`src/app/dashboard/page.tsx`**
   - Import các components mới
   - Thêm state: `aiModalOpen`, `selectedMetric`, `notifications`, `cropData`
   - Thêm icons: Messaging & Notifications
   - Thêm CropManagement component
   - Thêm AI Chat Modal
   - Thêm Notification Panel
   - Thêm Messaging Panel

2. **`package.json`**
   - Thêm dependency: `@google/generative-ai`

---

## 🚀 Cách triển khai tiếp (Future)

### **Background Job - Daily Monitoring**

Để triển khai giám sát tự động mỗi ngày:

#### **Option 1: Next.js API Route + Cron Job**

1. Tạo API endpoint:
```typescript
// src/app/api/ai-monitoring/route.ts
import { NextResponse } from 'next/server';
import { analyzeDailyMonitoring } from '@/services/geminiService';

export async function POST() {
  // Get all users from database
  const users = await db.users.findMany({ where: { hasCrop: true } });
  
  for (const user of users) {
    const iotData = await getLatestIoTData(user.id);
    const cropInfo = await getCropInfo(user.id);
    
    const alert = await analyzeDailyMonitoring(iotData, cropInfo);
    
    if (alert.hasAlert) {
      await createNotification(user.id, alert.message, alert.severity);
    }
  }
  
  return NextResponse.json({ success: true });
}
```

2. Setup cron job (Vercel Cron / AWS EventBridge / GitHub Actions):
```yaml
# .github/workflows/daily-monitoring.yml
name: Daily AI Monitoring
on:
  schedule:
    - cron: '0 6 * * *'  # Chạy lúc 6AM mỗi ngày

jobs:
  monitoring:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger monitoring
        run: |
          curl -X POST https://your-domain.com/api/ai-monitoring \
            -H "Authorization: Bearer ${{ secrets.API_SECRET }}"
```

#### **Option 2: Client-side Polling**

```typescript
// In dashboard page
useEffect(() => {
  const checkMonitoring = async () => {
    const lastCheck = localStorage.getItem('last_ai_check');
    const now = new Date();
    
    // Chỉ check 1 lần/ngày
    if (!lastCheck || new Date(lastCheck).getDate() !== now.getDate()) {
      const alert = await analyzeDailyMonitoring(iotData, cropData);
      
      if (alert.hasAlert) {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          message: alert.message,
          time: now,
          read: false
        }]);
        setUnreadCount(prev => prev + 1);
      }
      
      localStorage.setItem('last_ai_check', now.toISOString());
    }
  };
  
  checkMonitoring();
  
  // Check mỗi 1 giờ
  const interval = setInterval(checkMonitoring, 60 * 60 * 1000);
  return () => clearInterval(interval);
}, [iotData, cropData]);
```

---

## 🎨 UI/UX Features

### **Hover Effects trên Metric Cards**

Cần thêm vào `RealtimeIoT.tsx` và `DashboardOverview.tsx`:

```tsx
// Example for Temperature card
<div 
  className="relative group cursor-pointer hover:scale-105 transition-transform"
  onClick={() => {
    setSelectedMetric({ name: 'Nhiệt độ đất', value: temperature });
    setAiModalOpen(true);
  }}
>
  {/* Tooltip */}
  <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 dark:bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-lg z-50">
    Nhấn để hỏi chuyên gia AI
    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-slate-800"></div>
  </div>
  
  {/* Card content */}
  <div className="p-6 bg-white/70 dark:bg-slate-800/80 rounded-2xl">
    {/* ... existing card content ... */}
  </div>
</div>
```

---

## 📊 Data Flow

```
User clicks on "pH: 6.5" card
          │
          ▼
Dashboard sets: selectedMetric = { name: "pH", value: 6.5 }
          │
          ▼
AIChatModal opens with initial analysis request
          │
          ▼
geminiService.analyzeMetric() called with:
  - metricName: "pH"
  - metricValue: 6.5
  - iotData: { all sensor data }
  - cropInfo: { cà phê, 45 days planted, ... }
          │
          ▼
Gemini API processes and returns analysis
          │
          ▼
AI response displayed in modal
          │
          ▼
User can continue chatting with AI
```

---

## ⚠️ Lưu ý Quan trọng

1. **API Key Security:**
   - ⚠️ KHÔNG commit file `.env.local` lên Git
   - ⚠️ KHÔNG hardcode API key trong code
   - ✅ Sử dụng environment variables

2. **Rate Limits:**
   - Gemini Free tier: 60 requests/minute
   - Nếu vượt → Implement queue system

3. **Error Handling:**
   - Đã có try-catch trong tất cả service functions
   - Hiển thị error message thân thiện cho user

4. **Performance:**
   - Modal lazy load khi cần
   - Chat history lưu trong state, không persist
   - Crop data lưu localStorage

---

## 🎯 Testing Checklist

- [ ] Click vào metric card → Modal mở
- [ ] AI phản hồi với phân tích chi tiết
- [ ] Chat tiếp với AI hoạt động
- [ ] Thêm cây trồng mới
- [ ] Chỉnh sửa cây trồng
- [ ] Xóa cây trồng
- [ ] Click icon Messaging → Panel hiện
- [ ] Click icon Notifications → Panel hiện
- [ ] Dark mode hoạt động đúng
- [ ] Responsive trên mobile
- [ ] Error handling khi API fail

---

## 📞 Support

Nếu gặp vấn đề:
1. Check console log (F12)
2. Verify Gemini API key
3. Check network tab (API calls)
4. Verify package installed: `npm list @google/generative-ai`

---

**🎉 Enjoy your AI-powered farming assistant!**

