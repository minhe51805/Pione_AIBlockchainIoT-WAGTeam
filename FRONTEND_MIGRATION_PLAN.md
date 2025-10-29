# FRONTEND MIGRATION PLAN
## Chuyển từ frontend/ (Bootstrap) → Dapp/frontend/ (Next.js)

### What to Keep:

#### ✅ From Next.js Dapp:
1. **Wallet Integration**
   - `context/appkit.tsx` - WalletConnect setup
   - `components/WalletInfo.tsx` - Display wallet
   - `services/walletService.ts` - Wallet logic

2. **UI Components**
   - `components/ui/*` - shadcn components
   - Modern, responsive design
   - Dark mode support

3. **Web3 Services**
   - `services/blockchainService.ts` - Contract interaction
   - Ethers.js integration

#### ✅ From Current Frontend:
1. **Dashboard Features**
   - Date picker
   - Analyze button
   - Trigger Pipeline button
   - Chart.js visualization
   - AI results display
   - Recommendations section

### What to DELETE:

#### ❌ Remove DEX Features:
```typescript
// DELETE these files:
- components/SwapSection.tsx
- app/components/SwapSection.tsx
- abi/abiTokenContract.ts
- lib/token.tsx (DEX tokens)
```

### New Structure:

```
Dapp/frontend/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── page.tsx        ← Main dashboard (rewrite)
│   │   ├── layout.tsx          ← Keep (wallet wrapper)
│   │   └── page.tsx            ← Landing page
│   ├── components/
│   │   ├── SoilDashboard.tsx   ← NEW: Main dashboard component
│   │   ├── DatePicker.tsx      ← NEW: Date selection
│   │   ├── AIResults.tsx       ← NEW: Display AI analysis
│   │   ├── SensorChart.tsx     ← NEW: Chart.js integration
│   │   ├── Recommendations.tsx ← NEW: Action items
│   │   └── WalletInfo.tsx      ← KEEP: Wallet display
│   ├── services/
│   │   ├── apiService.ts       ← NEW: Call Flask/AI Service
│   │   └── blockchainService.ts ← UPDATE: Use new ABI
│   └── abi/
│       └── abiAquaMind.ts      ← UPDATE: New contract ABI
```

### Key Components to Build:

#### 1. SoilDashboard.tsx (Main)
```typescript
'use client';

import { useState } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import DatePicker from '@/components/DatePicker';
import AIResults from '@/components/AIResults';
import SensorChart from '@/components/SensorChart';

export default function SoilDashboard() {
  const { address, isConnected } = useAppKitAccount();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [analysisData, setAnalysisData] = useState(null);

  const handleAnalyze = async () => {
    // Call Flask API
    const response = await fetch('http://localhost:5000/api/analyze-date', {
      method: 'POST',
      body: JSON.stringify({ date: selectedDate })
    });
    const data = await response.json();
    setAnalysisData(data);
  };

  const handleTriggerPipeline = async () => {
    // Call AI Service
    const response = await fetch('http://localhost:8000/api/ai/analyze-daily', {
      method: 'POST',
      body: JSON.stringify({ date: selectedDate })
    });
    // ...
  };

  if (!isConnected) {
    return <div>Please connect wallet</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1>Pione Soil Analysis Dashboard</h1>
      <p>Connected: {address}</p>
      
      <DatePicker value={selectedDate} onChange={setSelectedDate} />
      
      <div className="flex gap-4 mt-4">
        <button onClick={handleAnalyze}>Analyze</button>
        <button onClick={handleTriggerPipeline}>Trigger Pipeline</button>
      </div>
      
      {analysisData && (
        <>
          <AIResults data={analysisData} />
          <SensorChart data={analysisData} />
        </>
      )}
    </div>
  );
}
```

#### 2. Integration Steps
```bash
# 1. Install Chart.js
cd Dapp/frontend
npm install chart.js react-chartjs-2

# 2. Create components (6 new files)

# 3. Update environment
# .env.local
NEXT_PUBLIC_FLASK_API=http://localhost:5000
NEXT_PUBLIC_AI_API=http://localhost:8000
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...new address...

# 4. Run dev server
npm run dev
```

### Migration Checklist:

- [ ] Delete DEX components
- [ ] Update AquaMindData.sol
- [ ] Deploy new contract
- [ ] Create 6 new components
- [ ] Install Chart.js
- [ ] Update .env.local
- [ ] Test wallet connection
- [ ] Test analyze functionality
- [ ] Test trigger pipeline
- [ ] Test blockchain interaction

