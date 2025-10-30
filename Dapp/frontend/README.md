# 🌱 AquaMind DApp - Frontend

Next.js + TypeScript DApp for Soil Data Dashboard with Passkey Authentication.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
# Copy example to .env.local
cp env.local.example .env.local

# Edit .env.local with your values
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx       # Passkey login
│   │   └── register/page.tsx    # Passkey registration
│   ├── dashboard/page.tsx       # Main dashboard
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home (redirects to login)
├── components/
│   ├── dashboard/
│   │   ├── DashboardHeader.tsx  # User info + logout
│   │   ├── DashboardOverview.tsx # Statistics cards
│   │   ├── RealtimeIoT.tsx      # Latest sensor data
│   │   ├── AIHistory.tsx        # Daily insights table
│   │   └── DateSelector.tsx     # Analyze + Trigger buttons
│   ├── ui/                      # shadcn/ui components
│   └── ...                      # Other components
├── services/
│   ├── authService.ts           # Passkey auth API
│   └── walletFromPasskey.ts     # Wallet generation
└── lib/
    └── utils.ts                 # Utility functions
```

---

## 🔑 Features

### ✅ Authentication
- **Passkey Login/Register** (WebAuthn)
- **Auto-create Wallet** from Passkey
- **No MetaMask required** for farmers

### ✅ Dashboard
- **Overview Statistics** (Health, Records, Insights)
- **Realtime IoT Data** (Latest readings + 24h trend)
- **AI Analysis History** (Daily insights from blockchain)
- **Date Selector** (Analyze + Trigger Pipeline)

### ✅ Tech Stack
- **Framework:** Next.js 15 + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Charts:** Chart.js + react-chartjs-2
- **Auth:** @simplewebauthn/browser
- **Blockchain:** ethers.js

---

## 🧪 Testing Flow

1. **Start Backend Services:**
   ```bash
   # Terminal 1: Flask API
   python app_ingest.py

   # Terminal 2: AI Service
   cd ai_service
   python -m uvicorn main:app --reload --port 8000

   # Terminal 3: Node.js Bridge
   node server.js
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Test:**
   - Open http://localhost:3000
   - Click "Đăng ký ngay"
   - Fill form + register with fingerprint
   - Auto-login to dashboard
   - See realtime data + AI history

---

## 📦 Dependencies

### Production:
- `next` - React framework
- `react`, `react-dom` - UI library
- `chart.js`, `react-chartjs-2` - Data visualization
- `ethers` - Blockchain interaction
- `@simplewebauthn/browser` - Passkey authentication
- `@radix-ui/*` - UI primitives (shadcn/ui)
- `tailwindcss` - CSS framework

### Development:
- `typescript` - Type safety
- `eslint` - Code linting
- `@types/*` - TypeScript definitions

---

## 🔧 Environment Variables

See `env.local.example` for all required variables:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=...    # Smart contract address
NEXT_PUBLIC_RPC_URL=...             # Blockchain RPC
NEXT_PUBLIC_FLASK_API=...           # Flask backend
NEXT_PUBLIC_AI_API=...              # AI service
NEXT_PUBLIC_RP_ID=localhost         # WebAuthn RP ID
```

---

## 🚢 Deployment

### Build for Production:
```bash
npm run build
npm run start
```

### Deploy to Vercel:
```bash
vercel deploy
```

---

## 📝 Notes

- **Passkey requires HTTPS** in production (use localhost for dev)
- **Chart.js** requires client-side rendering (`'use client'`)
- **WebAuthn** only works on supported browsers (Chrome, Edge, Safari)

---

**Developed by WAG Team 🌱**

