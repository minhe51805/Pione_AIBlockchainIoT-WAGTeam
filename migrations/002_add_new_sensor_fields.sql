-- Migration: Thêm 6 trường cảm biến mới và xóa trường cũ
-- Date: 2025-10-25
-- Description: Nâng cấp từ 3 trường (temperature, humidity, soil) lên 8 trường

-- Bước 1: Xóa cột cũ (moisture_pct)
ALTER TABLE sensor_readings 
  DROP COLUMN IF EXISTS moisture_pct;

-- Bước 2: Thêm 6 cột mới
ALTER TABLE sensor_readings 
  ADD COLUMN IF NOT EXISTS conductivity_us_cm INTEGER,      -- Độ dẫn điện µS/cm (0-2000+)
  ADD COLUMN IF NOT EXISTS ph_value NUMERIC(3,1),           -- pH (0.0-14.0)
  ADD COLUMN IF NOT EXISTS nitrogen_mg_kg INTEGER,          -- Nitơ mg/kg (0-1999)
  ADD COLUMN IF NOT EXISTS phosphorus_mg_kg INTEGER,        -- Photpho mg/kg (0-1999)
  ADD COLUMN IF NOT EXISTS potassium_mg_kg INTEGER,         -- Kali mg/kg (0-1999)
  ADD COLUMN IF NOT EXISTS salt_mg_l INTEGER;               -- Muối mg/L (0-5000+)

-- Bước 3: Thêm comment cho các cột mới
COMMENT ON COLUMN sensor_readings.conductivity_us_cm IS 'Độ dẫn điện (µS/cm)';
COMMENT ON COLUMN sensor_readings.ph_value IS 'Độ pH (0.0-14.0)';
COMMENT ON COLUMN sensor_readings.nitrogen_mg_kg IS 'Hàm lượng Nitơ (mg/kg)';
COMMENT ON COLUMN sensor_readings.phosphorus_mg_kg IS 'Hàm lượng Photpho (mg/kg)';
COMMENT ON COLUMN sensor_readings.potassium_mg_kg IS 'Hàm lượng Kali (mg/kg)';
COMMENT ON COLUMN sensor_readings.salt_mg_l IS 'Hàm lượng muối (mg/L)';

-- Bước 4: Thêm constraints (optional)
ALTER TABLE sensor_readings 
  ADD CONSTRAINT check_conductivity CHECK (conductivity_us_cm >= 0 AND conductivity_us_cm <= 10000),
  ADD CONSTRAINT check_ph CHECK (ph_value >= 0 AND ph_value <= 14),
  ADD CONSTRAINT check_nitrogen CHECK (nitrogen_mg_kg >= 0 AND nitrogen_mg_kg <= 5000),
  ADD CONSTRAINT check_phosphorus CHECK (phosphorus_mg_kg >= 0 AND phosphorus_mg_kg <= 5000),
  ADD CONSTRAINT check_potassium CHECK (potassium_mg_kg >= 0 AND potassium_mg_kg <= 5000),
  ADD CONSTRAINT check_salt CHECK (salt_mg_l >= 0 AND salt_mg_l <= 10000);

-- Kết quả: Bảng sensor_readings giờ có 8 trường sensor + metadata
-- temperature_c, humidity_pct, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l

