# 🚀 MIGRATION ROADMAP: Bootstrap → Next.js DApp

## Overview
Chuyển từ frontend hiện tại (HTML/Bootstrap) sang Dapp/frontend (Next.js + TypeScript + Web3)

---

## 📋 CHECKLIST TỔNG THỂ

### Phase 1: Cleanup & Preparation (30 mins)
- [ ] Delete DEX contracts (DemoSwap.sol, ERC20Mock.sol)
- [ ] Delete DEX frontend components (SwapSection.tsx)
- [ ] Backup current working system
- [ ] Install dependencies for Dapp/frontend

### Phase 2: Smart Contract Migration (1 hour)
- [ ] Update AquaMindData.sol struct
- [ ] Match DailyInsight with SoilDataStore
- [ ] Add missing fields (confidence, recommendations, etc.)
- [ ] Compile contract
- [ ] Deploy to pioneZero testnet
- [ ] Save new contract address
- [ ] Verify on Zeroscan

### Phase 3: Backend Integration (30 mins)
- [ ] Update server.js with new ABI
- [ ] Update CONTRACT_ADDRESS in .env
- [ ] Update pushDailyInsight endpoint
- [ ] Update getDailyInsights endpoint
- [ ] Update daily_aggregator.py payload
- [ ] Test Node.js bridge

### Phase 4: Frontend Development (2 hours)
- [ ] Install Chart.js: `npm install chart.js react-chartjs-2`
- [ ] Create SoilDashboard.tsx
- [ ] Create DatePicker.tsx
- [ ] Create AIResults.tsx
- [ ] Create SensorChart.tsx
- [ ] Create Recommendations.tsx
- [ ] Update abiAquaMind.ts with new ABI
- [ ] Create apiService.ts (Flask/AI calls)
- [ ] Update blockchainService.ts
- [ ] Configure .env.local

### Phase 5: Testing & Verification (1 hour)
- [ ] Test wallet connection (MetaMask)
- [ ] Test date picker
- [ ] Test "Analyze" button (Flask API)
- [ ] Test "Trigger Pipeline" button (AI Service)
- [ ] Test chart rendering
- [ ] Test recommendations display
- [ ] Test blockchain read (getDailyInsights)
- [ ] Test blockchain write (pushDailyInsight)
- [ ] End-to-end pipeline test

---

## 🛠️ DETAILED STEPS

### Step 1: Backup Current System
```bash
# Create backup branch
git checkout -b backup-bootstrap-frontend
git add .
git commit -m "Backup before Next.js migration"
git checkout soildata-api
```

### Step 2: Cleanup Dapp Folder
```bash
# Delete DEX files
cd Dapp/smartContract/contracts
rm DemoSwap.sol ERC20Mock.sol

# Delete DEX frontend
cd ../../frontend/components
rm SwapSection.tsx
cd ../app
rm -rf swap/
```

### Step 3: Update Smart Contract
```bash
cd Dapp/smartContract

# Edit contracts/AquaMindData.sol
# (Apply changes from CONTRACT_MIGRATION_PLAN.md)

# Compile
npx hardhat compile

# Deploy
npx hardhat run scripts/deploy.js --network pioneZero

# Copy contract address from output
# Example: 0x1234...abcd
```

### Step 4: Update Environment Variables
```bash
# Update server.js .env
CONTRACT_ADDRESS=0x1234...abcd

# Update Dapp/frontend/.env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234...abcd
NEXT_PUBLIC_FLASK_API=http://localhost:5000
NEXT_PUBLIC_AI_API=http://localhost:8000
NEXT_PUBLIC_PROJECT_ID=<your_reown_projectId>
```

### Step 5: Update Backend
```bash
# Update server.js
# (Apply changes from BACKEND_INTEGRATION_PLAN.md)

# Update ai_service/daily_aggregator.py
# (Apply changes from BACKEND_INTEGRATION_PLAN.md)

# Restart services
node server.js &
cd ai_service && python -m uvicorn main:app --reload &
cd .. && python app_ingest.py &
```

### Step 6: Build Frontend Components
```bash
cd Dapp/frontend

# Install dependencies
npm install chart.js react-chartjs-2

# Create components (6 files)
# (Follow FRONTEND_MIGRATION_PLAN.md)

# Run dev server
npm run dev
```

### Step 7: Test Everything
```bash
# 1. Open browser: http://localhost:3000
# 2. Connect MetaMask wallet
# 3. Select date
# 4. Click "Analyze" → Should show results
# 5. Click "Trigger Pipeline" → Should push to blockchain
# 6. Check database: `python check_data.py`
# 7. Check blockchain: `GET http://localhost:3000/api/getLatestDailyInsight`
```

---

## ⚠️ BREAKING CHANGES

### What STOPS Working:
- ❌ Old frontend (frontend/index.html)
- ❌ Old contract address (SoilDataStore)
- ❌ Old DApp URL (if different)

### What KEEPS Working:
- ✅ Database (no changes)
- ✅ Flask API (app_ingest.py)
- ✅ AI Service (FastAPI)
- ✅ Node.js Bridge (server.js - just address change)
- ✅ IoT data ingestion

### Data Migration:
- **OLD blockchain data:** Stays on old contract (read-only)
- **NEW data:** Goes to new contract
- **Database:** Unchanged (all history preserved)

---

## 🎯 SUCCESS CRITERIA

### Must Work:
1. ✅ Wallet login (MetaMask)
2. ✅ Display wallet address
3. ✅ Date picker selection
4. ✅ "Analyze" button → Show AI results
5. ✅ "Trigger Pipeline" → Full flow (AI + DB + Blockchain)
6. ✅ Chart visualization (Chart.js)
7. ✅ Recommendations display
8. ✅ Blockchain read (getDailyInsights)
9. ✅ Blockchain write (pushDailyInsight)
10. ✅ Responsive UI (mobile/desktop)

### Nice to Have:
- ⭐ Dark mode toggle
- ⭐ Loading states
- ⭐ Error handling UI
- ⭐ Transaction history
- ⭐ Export data (CSV)

---

## 📅 TIMELINE ESTIMATE

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Cleanup & Prep | 30m | ⬜ |
| 2 | Contract Update | 1h | ⬜ |
| 3 | Backend Integration | 30m | ⬜ |
| 4 | Frontend Development | 2h | ⬜ |
| 5 | Testing & Debug | 1h | ⬜ |
| **TOTAL** | | **5h** | |

---

## 🚨 RISKS & MITIGATION

### Risk 1: Contract Deployment Fails
- **Mitigation:** Test on local Hardhat network first
- **Fallback:** Keep old contract running

### Risk 2: Frontend Dependencies Issues
- **Mitigation:** Use exact versions in package.json
- **Fallback:** Documented working versions

### Risk 3: Integration Bugs
- **Mitigation:** Test each component individually
- **Fallback:** Git backup branch

### Risk 4: Gas Fees Too High
- **Mitigation:** Optimize contract (remove unused fields)
- **Fallback:** Batch transactions

---

## 📝 NOTES

### Advantages of Next.js DApp:
1. ✅ Professional wallet integration
2. ✅ TypeScript type safety
3. ✅ Component reusability
4. ✅ Better state management
5. ✅ SEO-friendly (SSR)
6. ✅ Easier to scale

### Disadvantages:
1. ⚠️ More complex setup
2. ⚠️ Longer build time
3. ⚠️ Larger bundle size
4. ⚠️ Need Node.js knowledge

### Decision: Worth It?
**YES** - Vì bạn muốn mở rộng lâu dài. Next.js DApp là foundation tốt hơn.

---

## 🎬 READY TO START?

Bạn muốn tôi bắt đầu từ Phase nào?

1. **Phase 1+2:** Update contract first (1.5h)
2. **Phase 3+4:** Backend + Frontend (2.5h)
3. **All at once:** Full migration (5h)

Hoặc làm từng bước, confirm từng phase?

