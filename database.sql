-- Tạo database cho IoT Gateway
CREATE DATABASE IF NOT EXISTS iot_gateway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE iot_gateway;

-- Bảng duy nhất chứa tất cả dữ liệu sensor
CREATE TABLE IF NOT EXISTS sensor_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    temperature FLOAT NOT NULL COMMENT 'Nhiệt độ (°C)',
    humidity FLOAT NOT NULL COMMENT 'Độ ẩm không khí (%)',
    soil INT NOT NULL COMMENT 'Độ ẩm đất (%)',
    timestamp VARCHAR(50) NOT NULL COMMENT 'Thời gian từ ESP',
    status VARCHAR(20) DEFAULT 'OK' COMMENT 'Trạng thái',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian lưu vào DB',
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

