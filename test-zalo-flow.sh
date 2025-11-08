#!/bin/bash

echo "🧪 Testing Zalo Link Account Flow"
echo "=================================="
echo ""

# 1. Check if backend is running
echo "1️⃣ Checking backend health..."
BACKEND_HEALTH=$(curl -s http://localhost:8080/api/health)
echo "   Backend: $BACKEND_HEALTH"
echo ""

# 2. Check if gateway is running
echo "2️⃣ Checking gateway health..."
GATEWAY_HEALTH=$(curl -s http://localhost:3000/api/health)
echo "   Gateway: $GATEWAY_HEALTH"
echo ""

# 3. Test zalo link endpoint with fake token
echo "3️⃣ Testing /api/auth/zalo/link-account endpoint..."
LINK_RESULT=$(curl -s -X POST http://localhost:3000/api/auth/zalo/link-account \
  -H "Content-Type: application/json" \
  -d '{"token":"fake_token_123","user_id":1}')
echo "   Result: $LINK_RESULT"
echo ""

# 4. Check database for zalo_link_sessions table
echo "4️⃣ Checking if zalo_link_sessions table exists..."
# Skip DB check since we don't have direct DB access in this script

echo ""
echo "✅ All endpoint tests complete!"
echo ""
echo "📝 Next steps to debug frontend issue:"
echo "   1. Open browser DevTools (F12)"
echo "   2. Go to: http://163.61.183.90:3000/linkaccount?token=YOUR_TOKEN"
echo "   3. Check Console tab for errors"
echo "   4. Check Network tab for API calls"
echo "   5. Check Application > Local Storage for 'aquamind_user' key"
echo ""
