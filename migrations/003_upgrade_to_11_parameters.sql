-- ========================================
-- MIGRATION: Upgrade to 11 Parameters
-- Date: 2025-10-27
-- Description: Thay đổi schema từ 8 thông số sang 11 thông số theo IoT device mới
-- ========================================

-- XÓA TOÀN BỘ DATA CŨ (theo yêu cầu)
TRUNCATE TABLE sensor_readings RESTART IDENTITY CASCADE;

-- XÓA CÁC CỘT CŨ KHÔNG DÙNG NỮA
ALTER TABLE sensor_readings 
  DROP COLUMN IF EXISTS temperature_c,
  DROP COLUMN IF EXISTS humidity_pct,
  DROP COLUMN IF EXISTS moisture_pct;

-- THÊM 11 CỘT MỚI
-- SOIL PARAMETERS (8 thông số)
ALTER TABLE sensor_readings
  ADD COLUMN IF NOT EXISTS soil_temperature_c REAL,
  ADD COLUMN IF NOT EXISTS soil_moisture_pct REAL,
  ADD COLUMN IF NOT EXISTS conductivity_us_cm INTEGER,
  ADD COLUMN IF NOT EXISTS ph_value REAL,
  ADD COLUMN IF NOT EXISTS nitrogen_mg_kg INTEGER,
  ADD COLUMN IF NOT EXISTS phosphorus_mg_kg INTEGER,
  ADD COLUMN IF NOT EXISTS potassium_mg_kg INTEGER,
  ADD COLUMN IF NOT EXISTS salt_mg_l INTEGER;

-- AIR/WEATHER PARAMETERS (3 thông số)
ALTER TABLE sensor_readings
  ADD COLUMN IF NOT EXISTS air_temperature_c REAL,
  ADD COLUMN IF NOT EXISTS air_humidity_pct REAL,
  ADD COLUMN IF NOT EXISTS is_raining BOOLEAN;

-- SET NOT NULL cho các cột mới (sau khi thêm)
ALTER TABLE sensor_readings
  ALTER COLUMN soil_temperature_c SET NOT NULL,
  ALTER COLUMN soil_moisture_pct SET NOT NULL,
  ALTER COLUMN conductivity_us_cm SET NOT NULL,
  ALTER COLUMN ph_value SET NOT NULL,
  ALTER COLUMN nitrogen_mg_kg SET NOT NULL,
  ALTER COLUMN phosphorus_mg_kg SET NOT NULL,
  ALTER COLUMN potassium_mg_kg SET NOT NULL,
  ALTER COLUMN salt_mg_l SET NOT NULL,
  ALTER COLUMN air_temperature_c SET NOT NULL,
  ALTER COLUMN air_humidity_pct SET NOT NULL,
  ALTER COLUMN is_raining SET NOT NULL;

-- THÊM CONSTRAINTS & VALIDATION
ALTER TABLE sensor_readings
  DROP CONSTRAINT IF EXISTS check_soil_moisture,
  DROP CONSTRAINT IF EXISTS check_air_humidity,
  DROP CONSTRAINT IF EXISTS check_ph,
  DROP CONSTRAINT IF EXISTS check_soil_temp,
  DROP CONSTRAINT IF EXISTS check_air_temp;

ALTER TABLE sensor_readings
  ADD CONSTRAINT check_soil_moisture CHECK (soil_moisture_pct BETWEEN 0 AND 100),
  ADD CONSTRAINT check_air_humidity CHECK (air_humidity_pct BETWEEN 0 AND 100),
  ADD CONSTRAINT check_ph CHECK (ph_value BETWEEN 0 AND 14),
  ADD CONSTRAINT check_soil_temp CHECK (soil_temperature_c BETWEEN -10 AND 60),
  ADD CONSTRAINT check_air_temp CHECK (air_temperature_c BETWEEN -10 AND 60);

-- TẠO INDEX MỚI ĐỂ TỐI ƯU QUERY
CREATE INDEX IF NOT EXISTS idx_sensor_readings_onchain_status 
  ON sensor_readings (onchain_status) 
  WHERE onchain_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_sensor_readings_measured_at_status 
  ON sensor_readings (measured_at_vn, onchain_status);

-- THÊM COMMENT ĐỂ TÀI LIỆU HÓA
COMMENT ON COLUMN sensor_readings.soil_temperature_c IS 'Soil Temperature in Celsius (from IoT field: temperature)';
COMMENT ON COLUMN sensor_readings.soil_moisture_pct IS 'Soil Moisture/Humidity in % (from IoT field: humidity)';
COMMENT ON COLUMN sensor_readings.conductivity_us_cm IS 'Electrical Conductivity in µS/cm';
COMMENT ON COLUMN sensor_readings.ph_value IS 'Soil pH value (0-14)';
COMMENT ON COLUMN sensor_readings.nitrogen_mg_kg IS 'Nitrogen content in mg/kg';
COMMENT ON COLUMN sensor_readings.phosphorus_mg_kg IS 'Phosphorus content in mg/kg';
COMMENT ON COLUMN sensor_readings.potassium_mg_kg IS 'Potassium content in mg/kg';
COMMENT ON COLUMN sensor_readings.salt_mg_l IS 'Salt/Salinity in mg/L';
COMMENT ON COLUMN sensor_readings.air_temperature_c IS 'Air Temperature in Celsius (from IoT field: air_temperature)';
COMMENT ON COLUMN sensor_readings.air_humidity_pct IS 'Air Humidity in % (from IoT field: air_humidity)';
COMMENT ON COLUMN sensor_readings.is_raining IS 'Rain status (from IoT field: is_raining)';

-- HIỂN THỊ SCHEMA MỚI
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'sensor_readings'
ORDER BY ordinal_position;

