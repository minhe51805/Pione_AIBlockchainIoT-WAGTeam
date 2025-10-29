-- Insert sample IoT data for testing daily aggregation
-- Date: 2025-10-27

INSERT INTO sensor_readings (
    soil_temperature, soil_moisture, ph, conductivity,
    nitrogen, phosphorus, potassium, salt,
    air_temperature, air_humidity, is_raining,
    timestamp, onchain_status
) VALUES
-- Morning readings
(24.5, 67.2, 6.1, 1.7, 42, 30, 205, 0.7, 26.5, 72, false, '2025-10-27 06:00:00', 'pending'),
(25.1, 68.3, 6.2, 1.8, 44, 31, 208, 0.75, 27.2, 73, false, '2025-10-27 06:30:00', 'pending'),
(25.8, 69.1, 6.2, 1.8, 45, 32, 210, 0.8, 28.1, 74, false, '2025-10-27 07:00:00', 'pending'),

-- Noon readings
(27.2, 70.5, 6.3, 1.9, 46, 33, 212, 0.82, 30.5, 76, false, '2025-10-27 12:00:00', 'pending'),
(28.1, 71.8, 6.3, 1.95, 47, 34, 215, 0.85, 31.8, 77, false, '2025-10-27 12:30:00', 'pending'),
(28.7, 72.3, 6.4, 2.0, 48, 35, 218, 0.88, 32.5, 78, false, '2025-10-27 13:00:00', 'pending'),

-- Afternoon readings
(27.5, 70.2, 6.3, 1.88, 46, 33, 213, 0.83, 30.2, 76, false, '2025-10-27 15:00:00', 'pending'),
(26.3, 68.9, 6.2, 1.82, 44, 32, 210, 0.79, 28.8, 74, false, '2025-10-27 15:30:00', 'pending'),
(25.6, 67.8, 6.2, 1.78, 43, 31, 208, 0.76, 27.5, 73, false, '2025-10-27 16:00:00', 'pending'),

-- Evening readings
(24.2, 66.5, 6.1, 1.72, 41, 30, 205, 0.72, 26.2, 71, false, '2025-10-27 18:00:00', 'pending'),
(23.5, 65.8, 6.0, 1.68, 40, 29, 202, 0.7, 25.5, 70, false, '2025-10-27 18:30:00', 'pending'),
(22.8, 65.2, 6.0, 1.65, 39, 28, 200, 0.68, 24.8, 69, false, '2025-10-27 19:00:00', 'pending'),

-- Night readings
(22.1, 64.8, 5.9, 1.62, 38, 28, 198, 0.66, 24.0, 68, false, '2025-10-27 21:00:00', 'pending'),
(21.8, 64.5, 5.9, 1.6, 38, 27, 197, 0.65, 23.5, 67, false, '2025-10-27 21:30:00', 'pending'),
(21.5, 64.2, 5.9, 1.58, 37, 27, 196, 0.64, 23.2, 66, false, '2025-10-27 22:00:00', 'pending');

-- Verify
SELECT 
    COUNT(*) as total_readings,
    MIN(timestamp) as first_reading,
    MAX(timestamp) as last_reading,
    AVG(soil_temperature) as avg_soil_temp,
    AVG(soil_moisture) as avg_moisture,
    AVG(ph) as avg_ph
FROM sensor_readings
WHERE DATE(timestamp) = '2025-10-27';

