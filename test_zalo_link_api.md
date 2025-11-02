# Test Zalo Link Account API

## Bước 1: Chuẩn bị Database

### 1.1. Tạo bảng zalo_link_sessions (nếu chưa có)

```sql
-- Chạy trong PostgreSQL
CREATE TABLE IF NOT EXISTS zalo_link_sessions (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    zalo_chat_id VARCHAR(100) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_zalo_sessions_token ON zalo_link_sessions(token);
CREATE INDEX idx_zalo_sessions_zalo_id ON zalo_link_sessions(zalo_chat_id);
```

### 1.2. Thêm cột zalo_chat_id vào users (nếu chưa có)

```sql
-- Chạy trong PostgreSQL
ALTER TABLE users ADD COLUMN IF NOT EXISTS zalo_chat_id VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_users_zalo_id ON users(zalo_chat_id);
```

### 1.3. Tạo session token test

```sql
-- Tạo token giả lập (expires sau 5 phút)
INSERT INTO zalo_link_sessions (token, zalo_chat_id, expires_at)
VALUES (
    'test_token_abc123xyz',
    '123456789',
    NOW() + INTERVAL '5 minutes'
);
```

### 1.4. Kiểm tra user_id có sẵn

```sql
-- Lấy user_id của user đầu tiên để test
SELECT id, full_name, phone FROM users LIMIT 1;
```

---

## Bước 2: Test với cURL

### 2.1. Test thành công (Happy path)

```bash
curl -X POST http://localhost:5000/api/auth/zalo/link-account \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"test_token_abc123xyz\",
    \"zalo_chat_id\": \"123456789\",
    \"user_id\": 1
  }"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Tài khoản Zalo đã được liên kết thành công!",
  "zalo_chat_id": "123456789",
  "user_id": 1,
  "full_name": "Nguyen Van A"
}
```

---

### 2.2. Test với PowerShell (Windows)

```powershell
$body = @{
    token = "test_token_abc123xyz"
    zalo_chat_id = "123456789"
    user_id = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/zalo/link-account" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

---

### 2.3. Test trường hợp lỗi

#### Token không tồn tại:

```bash
curl -X POST http://localhost:5000/api/auth/zalo/link-account \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"invalid_token\",
    \"zalo_chat_id\": \"123456789\",
    \"user_id\": 1
  }"
```

**Expected Response:**

```json
{
  "success": false,
  "error": "Token không hợp lệ hoặc không tồn tại"
}
```

#### Token đã được sử dụng:

```bash
# Gọi API 2 lần với cùng token
curl -X POST http://localhost:5000/api/auth/zalo/link-account \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"test_token_abc123xyz\",
    \"zalo_chat_id\": \"123456789\",
    \"user_id\": 1
  }"

# Gọi lần 2 - sẽ lỗi
curl -X POST http://localhost:5000/api/auth/zalo/link-account \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"test_token_abc123xyz\",
    \"zalo_chat_id\": \"123456789\",
    \"user_id\": 1
  }"
```

**Expected Response (lần 2):**

```json
{
  "success": false,
  "error": "Token đã được sử dụng rồi"
}
```

#### Token hết hạn:

```sql
-- Tạo token đã hết hạn
INSERT INTO zalo_link_sessions (token, zalo_chat_id, expires_at)
VALUES (
    'expired_token_xyz',
    '987654321',
    NOW() - INTERVAL '10 minutes'  -- Đã hết hạn 10 phút trước
);
```

```bash
curl -X POST http://localhost:5000/api/auth/zalo/link-account \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"expired_token_xyz\",
    \"zalo_chat_id\": \"987654321\",
    \"user_id\": 1
  }"
```

**Expected Response:**

```json
{
  "success": false,
  "error": "Token đã hết hạn (5 phút). Vui lòng yêu cầu liên kết lại."
}
```

---

## Bước 3: Verify kết quả

### 3.1. Kiểm tra zalo_chat_id đã được link

```sql
SELECT id, full_name, phone, zalo_chat_id, updated_at_vn
FROM users
WHERE id = 1;
```

### 3.2. Kiểm tra token đã được đánh dấu used

```sql
SELECT token, zalo_chat_id, is_used, expires_at
FROM zalo_link_sessions
WHERE token = 'test_token_abc123xyz';
```

---

## Bước 4: Clean up (Reset test data)

```sql
-- Xóa zalo_chat_id khỏi user
UPDATE users SET zalo_chat_id = NULL WHERE id = 1;

-- Xóa session tokens
DELETE FROM zalo_link_sessions WHERE token LIKE 'test_%';
```

---

## Script tự động test (PowerShell)

```powershell
# test_zalo_link.ps1

Write-Host "=== Testing Zalo Link Account API ===" -ForegroundColor Green

# 1. Test successful link
Write-Host "`n[TEST 1] Valid token - Should succeed" -ForegroundColor Cyan
$body1 = @{
    token = "test_token_abc123xyz"
    zalo_chat_id = "123456789"
    user_id = 1
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/zalo/link-account" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body1

    Write-Host "✅ SUCCESS:" -ForegroundColor Green
    $response1 | ConvertTo-Json
} catch {
    Write-Host "❌ FAILED:" -ForegroundColor Red
    $_.Exception.Message
}

# 2. Test duplicate token
Write-Host "`n[TEST 2] Used token - Should fail" -ForegroundColor Cyan
try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/zalo/link-account" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body1

    Write-Host "❌ UNEXPECTED SUCCESS" -ForegroundColor Red
} catch {
    Write-Host "✅ Expected error:" -ForegroundColor Green
    $_.Exception.Message
}

Write-Host "`n=== Test completed ===" -ForegroundColor Green
```

Chạy script:

```powershell
.\test_zalo_link.ps1
```
