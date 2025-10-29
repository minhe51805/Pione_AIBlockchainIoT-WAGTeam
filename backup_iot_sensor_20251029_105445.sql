-- Database Backup: db_iot_sensor
-- Created: 2025-10-29 10:54:45
-- Host: 36.50.134.107:6000

-- ============================================================
-- SCHEMA BACKUP
-- ============================================================


-- Table: ai_analysis
DROP TABLE IF EXISTS ai_analysis CASCADE;
CREATE TABLE ai_analysis (
    id integer DEFAULT nextval('ai_analysis_id_seq'::regclass) NOT NULL,
    sensor_reading_id integer,
    analysis_type character varying(50) NOT NULL,
    analysis_mode character varying(50) NOT NULL,
    analyzed_at_vn timestamp with time zone DEFAULT now() NOT NULL,
    user_crop character varying(50),
    crop_recommendation jsonb,
    crop_validation jsonb,
    soil_health jsonb,
    anomaly_detection jsonb,
    model_version character varying(20) DEFAULT '1.0'::character varying,
    confidence_avg real,
    processing_time_ms integer,
    onchain_status character varying(20) DEFAULT 'pending'::character varying,
    onchain_tx_hash character varying(66),
    created_at_vn timestamp with time zone DEFAULT now(),
    updated_at_vn timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);


-- Table: ai_recommendations
DROP TABLE IF EXISTS ai_recommendations CASCADE;
CREATE TABLE ai_recommendations (
    id integer DEFAULT nextval('ai_recommendations_id_seq'::regclass) NOT NULL,
    daily_insight_id integer,
    ai_analysis_id integer,
    recommendation_type character varying(50) NOT NULL,
    priority character varying(20) NOT NULL,
    action text NOT NULL,
    details text,
    reasoning text,
    current_value real,
    target_value real,
    deficit real,
    unit character varying(20),
    deadline_days integer,
    created_at_vn timestamp with time zone DEFAULT now(),
    status character varying(20) DEFAULT 'pending'::character varying,
    completed_at_vn timestamp with time zone,
    user_feedback jsonb,
    PRIMARY KEY (id)
);


-- Table: blockchain_logs
DROP TABLE IF EXISTS blockchain_logs CASCADE;
CREATE TABLE blockchain_logs (
    id integer DEFAULT nextval('blockchain_logs_id_seq'::regclass) NOT NULL,
    data_type character varying(50) NOT NULL,
    data_id integer NOT NULL,
    data_date date,
    tx_hash character varying(66) NOT NULL,
    block_number bigint,
    contract_address character varying(42) DEFAULT '0x55313657185bd745917a7eD22fe9B827fC1AAC48'::character varying,
    contract_function character varying(50),
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    gas_used bigint,
    gas_price bigint,
    transaction_fee numeric,
    data_hash character varying(66),
    sent_at_vn timestamp with time zone DEFAULT now() NOT NULL,
    confirmed_at_vn timestamp with time zone,
    error_message text,
    retry_count integer DEFAULT 0,
    last_retry_at_vn timestamp with time zone,
    created_at_vn timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);


-- Table: daily_insights
DROP TABLE IF EXISTS daily_insights CASCADE;
CREATE TABLE daily_insights (
    id integer DEFAULT nextval('daily_insights_id_seq'::regclass) NOT NULL,
    date_vn date NOT NULL,
    user_crop character varying(50),
    location_lat real,
    location_lon real,
    total_readings integer DEFAULT 0 NOT NULL,
    soil_temperature_avg real NOT NULL,
    soil_moisture_avg real NOT NULL,
    conductivity_avg real NOT NULL,
    ph_avg real NOT NULL,
    nitrogen_avg real NOT NULL,
    phosphorus_avg real NOT NULL,
    potassium_avg real NOT NULL,
    salt_avg real NOT NULL,
    air_temperature_avg real NOT NULL,
    air_humidity_avg real NOT NULL,
    rain_hours integer DEFAULT 0,
    rain_percentage real,
    crop_suitability_score real,
    crop_suitability_rating character varying(20),
    soil_health_score real NOT NULL,
    soil_health_rating character varying(20) NOT NULL,
    npk_balance_score real,
    npk_status character varying(20),
    has_anomaly boolean DEFAULT false,
    anomaly_type character varying(50),
    summary_status character varying(20) NOT NULL,
    summary_text text NOT NULL,
    key_insights jsonb,
    priority_actions jsonb,
    season character varying(20),
    month_of_year integer,
    day_of_week integer,
    data_quality_score real,
    confidence_score real,
    record_hash character varying(66),
    onchain_status character varying(20) DEFAULT 'pending'::character varying,
    onchain_tx_hash character varying(66),
    onchain_block_number bigint,
    confirmed_at_vn timestamp with time zone,
    created_at_vn timestamp with time zone DEFAULT now(),
    updated_at_vn timestamp with time zone DEFAULT now(),
    recommendations text,
    PRIMARY KEY (id)
);


-- Table: sensor_readings
DROP TABLE IF EXISTS sensor_readings CASCADE;
CREATE TABLE sensor_readings (
    id bigint DEFAULT nextval('sensor_readings_id_seq'::regclass) NOT NULL,
    measured_at_vn timestamp without time zone NOT NULL,
    onchain_status text DEFAULT 'pending'::text NOT NULL,
    onchain_tx_hash text,
    created_at_vn timestamp without time zone DEFAULT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh'::text) NOT NULL,
    locked_by text,
    locked_at timestamp without time zone,
    retry_count integer DEFAULT 0,
    last_error text,
    confirmed_at_vn timestamp without time zone DEFAULT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh'::text),
    conductivity_us_cm integer NOT NULL,
    ph_value numeric NOT NULL,
    nitrogen_mg_kg integer NOT NULL,
    phosphorus_mg_kg integer NOT NULL,
    potassium_mg_kg integer NOT NULL,
    salt_mg_l integer NOT NULL,
    soil_temperature_c real NOT NULL,
    soil_moisture_pct real NOT NULL,
    air_temperature_c real NOT NULL,
    air_humidity_pct real NOT NULL,
    is_raining boolean NOT NULL,
    PRIMARY KEY (id)
);

-- Data for sensor_readings (64 rows)
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (1, '2025-10-27T16:07:51', 'failed', NULL, '2025-10-27T23:10:51.061821', 'node-01', '2025-10-27T16:10:51.769674', 1, 'missing revert data (action="estimateGas", data=null, reason=null, transaction={ "data": "0xdb9e45ef0000000000000000000000000000000000000000000000000000000068ff3667000000000000000000000000000000000000', '2025-10-27T23:10:51.061821', 1250, '6.8', 45, 30, 180, 850, 24.5, 45.2, 27.1, 65.0, True);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (30, '2025-10-28T15:43:53', 'confirmed', '0xf0c9c48edabd633d5b7b68c48eb4856c9552a690ce4d5a6f64ca123a78005815', '2025-10-28T22:43:56.830591', 'node-01', '2025-10-28T15:43:57.269555', 0, NULL, '2025-10-28T15:44:05.773588', 0, '0.0', 0, 0, 0, 700, 0.0, 31.0, 32.3, 68.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (3, '2025-10-27T16:07:59', 'confirmed', '0x534dcfda205b096ed1304bc231a8bfd34436e3be2348ff9f930f312fbab933d5', '2025-10-27T23:15:17.881509', 'node-01', '2025-10-27T16:15:18.331587', 0, NULL, '2025-10-27T16:15:28.248147', 1250, '6.8', 45, 30, 180, 850, 24.5, 45.2, 27.1, 65.0, True);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (31, '2025-10-28T15:44:35', 'confirmed', '0x643246a3c131b63be40a49beddba05a107cc251a603e2d8e23e9b2d76879a6d5', '2025-10-28T22:44:39.452751', 'node-01', '2025-10-28T15:44:39.910570', 0, NULL, '2025-10-28T15:44:48.469801', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (5, '2025-10-27T16:48:26', 'confirmed', '0x07c5842e3f8274468c8c802f5884e23d9665a48e5437c69e95d151671e624ee4', '2025-10-27T23:48:29.990763', 'node-01', '2025-10-27T16:48:30.403879', 0, NULL, '2025-10-27T16:48:39.362095', 0, '0.0', 0, 0, 0, 700, 0.0, 30.4, 32.3, 61.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (6, '2025-10-27T16:49:52', 'confirmed', '0xc7d0cdc351b91b96da04e745a72bf041c01e3a3896b18eaf79ace9de52cef8c0', '2025-10-27T23:49:56.507207', 'node-01', '2025-10-27T16:49:56.886169', 0, NULL, '2025-10-27T16:50:05.956338', 0, '0.0', 0, 0, 0, 700, 0.0, 30.4, 32.3, 62.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (32, '2025-10-28T15:45:20', 'confirmed', '0x7334ff76807a2b2774ca8694bbe63bc21e7e4c28ab4f5785e26ba89214499425', '2025-10-28T22:45:24.191129', 'node-01', '2025-10-28T15:45:24.541326', 0, NULL, '2025-10-28T15:45:32.991603', 0, '0.0', 2, 0, 0, 3, 0.0, 0.0, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (7, '2025-10-27T16:50:35', 'confirmed', '0x025c10c062e5e3877ae2107a46f1a01738ac7cc78816c190f3adb05fb8c83aeb', '2025-10-27T23:50:39.312999', 'node-01', '2025-10-27T16:50:39.585984', 0, NULL, '2025-10-27T16:50:49.141668', 0, '0.0', 0, 0, 0, 700, 0.0, 30.4, 32.3, 61.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (33, '2025-10-28T15:46:03', 'confirmed', '0x408b81baacd38a13bcec0715dca7212b798d4792044a30890bca915a1a4f8422', '2025-10-28T22:46:07.513418', 'node-01', '2025-10-28T15:46:07.991438', 0, NULL, '2025-10-28T15:46:16.634290', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (8, '2025-10-27T16:51:19', 'confirmed', '0x1e9487e683cfd07b7c76928640bb9305e3d1e7a57a74f0f33a28f20737c00eaa', '2025-10-27T23:51:22.648136', 'node-01', '2025-10-27T16:51:23.102843', 0, NULL, '2025-10-27T16:51:31.484131', 0, '0.0', 0, 0, 0, 700, 0.0, 30.5, 32.3, 61.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (9, '2025-10-27T16:52:01', 'confirmed', '0x1a4630490b0a74429f13540a00f4a5ced528109eb242c18d054fb0ac1782bb66', '2025-10-27T23:52:05.122473', 'node-01', '2025-10-27T16:52:05.568285', 0, NULL, '2025-10-27T16:52:14.149201', 0, '0.0', 0, 0, 0, 700, 0.0, 30.4, 32.3, 61.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (34, '2025-10-28T15:46:46', 'confirmed', '0x42bde8522a63c4dc2dabf1591fe4281293bde93ec28daabeed0c54edf2465c58', '2025-10-28T22:46:50.120880', 'node-01', '2025-10-28T15:46:50.491572', 0, NULL, '2025-10-28T15:46:59.178205', 0, '0.0', 0, 0, 0, 700, 0.0, 31.0, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (10, '2025-10-27T16:52:44', 'confirmed', '0xce52b0d7b017cfc0551f831716c4ae2341781852b9b3f78b069f8bd8a53f3c3f', '2025-10-27T23:52:47.446092', 'node-01', '2025-10-27T16:52:47.648230', 0, NULL, '2025-10-27T16:52:57.403931', 0, '0.0', 0, 0, 0, 700, 0.0, 30.5, 32.3, 61.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (35, '2025-10-28T15:47:29', 'confirmed', '0x85d3f29d3caf575f3623d8208067695285b67039df113f8f264fe583731eb22b', '2025-10-28T22:47:32.871437', 'node-01', '2025-10-28T15:47:33.245322', 0, NULL, '2025-10-28T15:47:42.063664', 0, '0.0', 0, 0, 0, 700, 0.0, 31.0, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (11, '2025-10-27T16:53:28', 'confirmed', '0x0445bfa88805cba23f481de9fc61e832e0357257a5da1c193ab7817d4dd77b19', '2025-10-27T23:53:31.903145', 'node-01', '2025-10-27T16:53:32.201532', 0, NULL, '2025-10-27T16:53:40.783417', 0, '0.0', 0, 0, 0, 700, 0.0, 30.5, 32.3, 61.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (12, '2025-10-27T16:54:12', 'confirmed', '0xc8db33c2b4f83415990062e2eb3f67d1f5edafaad2d552241a6870f22e6c6bc0', '2025-10-27T23:54:15.158059', 'node-01', '2025-10-27T16:54:15.673889', 0, NULL, '2025-10-27T16:54:24.395573', 0, '0.0', 0, 0, 0, 700, 0.0, 30.5, 32.3, 61.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (36, '2025-10-28T15:48:12', 'confirmed', '0x755e9b65591a517fcc2a8e30b12a01bff88d9c8e3fa037af5d4c8fa112b584e2', '2025-10-28T22:48:15.996792', 'node-01', '2025-10-28T15:48:16.379249', 0, NULL, '2025-10-28T15:48:25.015264', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (13, '2025-10-27T16:54:54', 'confirmed', '0x0b452ce29ba19574d9f65052ed5df76a5c0c10352ac9beb7d95dd79e98ed61e6', '2025-10-27T23:54:58.093753', 'node-01', '2025-10-27T16:54:58.485254', 0, NULL, '2025-10-27T16:55:07.411122', 0, '0.0', 0, 0, 0, 700, 0.0, 30.5, 32.3, 60.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (37, '2025-10-28T15:48:55', 'confirmed', '0xaa4ddf455aaa00790f9f4652330424e5a49064241b9e99e2f35f618f7e93bed1', '2025-10-28T22:48:59.983617', 'node-01', '2025-10-28T15:49:00.518040', 0, NULL, '2025-10-28T15:49:09.263114', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 68.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (14, '2025-10-27T16:55:37', 'confirmed', '0x7d1d8b9b847542d32d4e0c5bcf1c9357c895c76b7e489f43bba9d6444c2c0caa', '2025-10-27T23:55:40.757069', 'node-01', '2025-10-27T16:55:40.956070', 0, NULL, '2025-10-27T16:55:49.539996', 0, '0.0', 0, 0, 0, 700, 0.0, 30.5, 32.3, 60.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (15, '2025-10-27T16:59:01', 'confirmed', '0xccc7c76b2faf3494220084973ac823a3854361b1309c95c765f829fcd6cc8ffd', '2025-10-27T23:59:04.373882', 'node-01', '2025-10-27T16:59:04.847938', 0, NULL, '2025-10-27T16:59:13.843150', 0, '0.0', 0, 0, 0, 700, 0.0, 30.5, 32.3, 61.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (16, '2025-10-27T16:59:44', 'confirmed', '0xbbf16048d7cb1262c6561047db4c40255ce9bf4a3f160e3a6398b8cc0ce8d0ff', '2025-10-27T23:59:47.132365', 'node-01', '2025-10-27T16:59:47.349773', 0, NULL, '2025-10-27T16:59:55.779090', 0, '0.0', 0, 0, 0, 700, 0.0, 30.5, 32.3, 61.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (17, '2025-10-28T14:03:31', 'confirmed', '0x51f23952bfd841af2377b3307513d8eae4a96f8dc600c32cbe4ea69aa1528c47', '2025-10-28T21:03:34.244482', 'node-01', '2025-10-28T14:03:34.764195', 0, NULL, '2025-10-28T14:03:43.546994', 0, '0.0', 0, 0, 0, 700, 0.0, 28.9, 30.2, 79.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (18, '2025-10-28T14:04:14', 'confirmed', '0x7d76add4c41506ff4521ae964b71ae40bdc22e2d7db400b55f4d17e0a15bd579', '2025-10-28T21:04:18.156646', 'node-01', '2025-10-28T14:04:18.560023', 0, NULL, '2025-10-28T14:04:27.083764', 0, '0.0', 0, 0, 0, 700, 0.0, 29.0, 30.2, 83.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (19, '2025-10-28T14:04:57', 'confirmed', '0x4236ef9304ff418deaa35df2946d0a2a297e6a51296b3ffda87cb72a98142d0b', '2025-10-28T21:05:00.898134', 'node-01', '2025-10-28T14:05:01.104228', 0, NULL, '2025-10-28T14:05:09.596501', 0, '0.0', 0, 0, 0, 700, 0.0, 29.0, 30.2, 81.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (20, '2025-10-28T14:05:39', 'confirmed', '0x57b316d79a28547d49e0ea9b9a023be141da001c8e08c26859fdb9de698f18f8', '2025-10-28T21:05:55.514470', 'node-01', '2025-10-28T14:05:55.714039', 0, NULL, '2025-10-28T14:06:04.716340', 0, '0.0', 0, 0, 0, 700, 0.0, 29.0, 30.2, 80.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (21, '2025-10-28T15:37:25', 'confirmed', '0x5df8c8ea404bf16ea9483033494e6ff4cd301b2565e5fd0486ceb049fb862e1d', '2025-10-28T22:37:29.884328', 'node-01', '2025-10-28T15:37:30.364368', 0, NULL, '2025-10-28T15:37:39.366660', 0, '0.0', 0, 0, 0, 700, 0.0, 31.0, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (22, '2025-10-28T15:38:09', 'confirmed', '0xbd91e5e1139f09ca56db507a8f3c2958b18ca6e03dd0653996ef41cf6563e9c1', '2025-10-28T22:38:13.394700', 'node-01', '2025-10-28T15:38:14.156468', 0, NULL, '2025-10-28T15:38:22.999278', 0, '0.0', 0, 0, 0, 700, 0.0, 31.0, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (23, '2025-10-28T15:38:53', 'confirmed', '0x3f342d204aa5ad25be7a2b7667cc9436d42572d3bf56ff49cb75583aa2d7529b', '2025-10-28T22:38:57.343585', 'node-01', '2025-10-28T15:38:57.690944', 0, NULL, '2025-10-28T15:39:06.101638', 0, '0.0', 0, 0, 0, 700, 0.0, 31.0, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (24, '2025-10-28T15:39:36', 'confirmed', '0xf14363ef3d136f36983f3f17fe6b7643214d78f9a1f6c6c15084f3788b4e0bee', '2025-10-28T22:39:39.547606', 'node-01', '2025-10-28T15:39:40.002403', 0, NULL, '2025-10-28T15:39:48.581017', 0, '0.0', 0, 0, 0, 700, 0.0, 31.0, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (25, '2025-10-28T15:40:19', 'confirmed', '0xd25fc97c33c88f1593169eea0618bcd22803d59bb387dfec045961ddbf6b8a57', '2025-10-28T22:40:22.641405', 'node-01', '2025-10-28T15:40:23.018372', 0, NULL, '2025-10-28T15:40:31.664372', 0, '0.0', 0, 0, 0, 700, 0.0, 31.0, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (26, '2025-10-28T15:41:01', 'confirmed', '0xa9a840e2fa4c4e333f0ad2df3090e2408a4d946c34f14df9edd381699b0a28b0', '2025-10-28T22:41:05.696458', 'node-01', '2025-10-28T15:41:06.210397', 0, NULL, '2025-10-28T15:41:14.833957', 0, '0.0', 0, 0, 0, 700, 0.0, 31.0, 32.3, 68.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (27, '2025-10-28T15:41:45', 'confirmed', '0x39fe080ea5b5ff29edba93d5b91ae97b54075eb6fa619730a0722d6bc09225ab', '2025-10-28T22:41:48.705819', 'node-01', '2025-10-28T15:41:49.158695', 0, NULL, '2025-10-28T15:41:58.170466', 0, '0.0', 0, 0, 0, 700, 0.0, 31.0, 32.3, 68.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (28, '2025-10-28T15:42:28', 'confirmed', '0x9a83fc926f831b5fed79d489fb0dfcdbe1d2ed0d1d0b002e5787b809924ea777', '2025-10-28T22:42:32.077000', 'node-01', '2025-10-28T15:42:32.279239', 0, NULL, '2025-10-28T15:42:40.376454', 0, '0.0', 0, 0, 0, 700, 0.0, 31.0, 32.3, 68.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (29, '2025-10-28T15:43:10', 'confirmed', '0xa41c87e1b0a437d0c7bb6fb55ccd4eb678d244686d47dfa7e0d47e60d0644f19', '2025-10-28T22:43:14.167659', 'node-01', '2025-10-28T15:43:14.550742', 0, NULL, '2025-10-28T15:43:23.015377', 0, '0.0', 0, 0, 0, 700, 0.0, 31.0, 32.3, 68.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (61, '2025-10-28T16:05:43', 'confirmed', '0x2bdb91f04307214c939c49bfad79e9d373204ca0c1775edab375e99bdf4a494b', '2025-10-28T23:05:46.796932', 'node-01', '2025-10-28T16:05:47.021875', 0, NULL, '2025-10-28T16:05:55.365531', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 68.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (38, '2025-10-28T15:49:39', 'confirmed', '0x3e81634f232bdd2156c3f090956fe7995d19c618149ce5682a5917efb5f79ad9', '2025-10-28T22:49:43.173583', 'node-01', '2025-10-28T15:49:43.652643', 0, NULL, '2025-10-28T15:49:52.974295', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (62, '2025-10-28T16:06:26', 'failed', NULL, '2025-10-28T23:06:29.020097', 'node-01', '2025-10-28T16:06:29.456296', 1, 'insufficient funds for intrinsic transaction cost (transaction="0x02f901f58213d8820280843b9aca00843b9aca0e8302d0e394b84ae3e89e26d043ff497e4188becef3ea0e744a80b90184db9e45ef0000000000000000000000000000', '2025-10-28T23:06:29.020097', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 68.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (39, '2025-10-28T15:50:19', 'confirmed', '0x478cc1dbb308e01fdb928227db744a0b167c06f6168c4047846c6ecd086fca99', '2025-10-28T22:50:23.318619', 'node-01', '2025-10-28T15:50:23.767467', 0, NULL, '2025-10-28T15:50:32.418106', 0, '0.0', 2, 0, 0, 3, 0.0, 0.0, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (63, '2025-10-28T16:07:02', 'failed', NULL, '2025-10-28T23:07:06.324647', 'node-01', '2025-10-28T16:07:06.655425', 1, 'insufficient funds for intrinsic transaction cost (transaction="0x02f901f58213d8820280843b9aca00843b9aca0e8302d0e394b84ae3e89e26d043ff497e4188becef3ea0e744a80b90184db9e45ef0000000000000000000000000000', '2025-10-28T23:07:06.324647', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (40, '2025-10-28T15:51:02', 'confirmed', '0x50a62a4b727915201407d2b47bd3c0f8b668dff4a175d753a9c236de9eb44bb9', '2025-10-28T22:51:06.543382', 'node-01', '2025-10-28T15:51:06.996868', 0, NULL, '2025-10-28T15:51:15.660415', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (64, '2025-10-28T16:07:40', 'failed', NULL, '2025-10-28T23:07:44.247351', 'node-01', '2025-10-28T16:07:44.451794', 1, 'insufficient funds for intrinsic transaction cost (transaction="0x02f901f58213d8820280843b9aca00843b9aca0e8302d0e394b84ae3e89e26d043ff497e4188becef3ea0e744a80b90184db9e45ef0000000000000000000000000000', '2025-10-28T23:07:44.247351', 0, '0.0', 0, 0, 0, 700, 0.0, 30.8, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (41, '2025-10-28T15:51:45', 'failed', NULL, '2025-10-28T22:51:49.455120', 'node-01', '2025-10-28T15:51:49.912640', 1, 'replacement fee too low (transaction="0x02f901f58213d882026b843b9aca00843b9aca0e8302d0e394b84ae3e89e26d043ff497e4188becef3ea0e744a80b90184db9e45ef000000000000000000000000000000000000000000000000000000', '2025-10-28T22:51:49.455120', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (65, '2025-10-28T16:08:17', 'failed', NULL, '2025-10-28T23:08:20.273370', 'node-01', '2025-10-28T16:08:20.476601', 1, 'insufficient funds for intrinsic transaction cost (transaction="0x02f901f58213d8820280843b9aca00843b9aca0e8302d0e394b84ae3e89e26d043ff497e4188becef3ea0e744a80b90184db9e45ef0000000000000000000000000000', '2025-10-28T23:08:20.273370', 0, '0.0', 0, 0, 0, 700, 0.0, 30.8, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (42, '2025-10-28T15:52:23', 'confirmed', '0x03d2efa58b4255179b56d38172d87804eb197828fab5bfc1769c9e69806f37fc', '2025-10-28T22:52:26.773991', 'node-01', '2025-10-28T15:52:27.123248', 0, NULL, '2025-10-28T15:52:35.522819', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (66, '2025-10-28T16:08:54', 'failed', NULL, '2025-10-28T23:08:56.569847', 'node-01', '2025-10-28T16:08:56.769448', 1, 'insufficient funds for intrinsic transaction cost (transaction="0x02f901f58213d8820280843b9aca00843b9aca0e8302d0e394b84ae3e89e26d043ff497e4188becef3ea0e744a80b90184db9e45ef0000000000000000000000000000', '2025-10-28T23:08:56.569847', 0, '0.0', 0, 0, 0, 700, 0.0, 30.8, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (43, '2025-10-28T15:53:02', 'confirmed', '0xb270e070298cf81f3887ff329d8aa4cad60d9fdd1eafc4681e2c0de2d52088b0', '2025-10-28T22:53:06.895483', 'node-01', '2025-10-28T15:53:07.221704', 0, NULL, '2025-10-28T15:53:15.644888', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (44, '2025-10-28T15:53:38', 'confirmed', '0x89a8c6a7388ae01e0c27dc173e49bb3c6a5f8c91f040edba82e62c42f01c17a5', '2025-10-28T22:53:41.299648', 'node-01', '2025-10-28T15:53:41.783242', 0, NULL, '2025-10-28T15:53:50.439411', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (45, '2025-10-28T15:54:21', 'confirmed', '0x97fc9bf6f85a8324cdd2461136d1825accc43851f03de3e0b93f8b8195b07a16', '2025-10-28T22:54:24.185331', 'node-01', '2025-10-28T15:54:24.619795', 0, NULL, '2025-10-28T15:54:32.941475', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (46, '2025-10-28T15:55:03', 'confirmed', '0x18aa819019718eeef9c4d06ac01899e5059b7728c6a3e070392cb81949370404', '2025-10-28T22:55:06.543440', 'node-01', '2025-10-28T15:55:06.751072', 0, NULL, '2025-10-28T15:55:14.772613', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (47, '2025-10-28T15:55:45', 'confirmed', '0xea8d16224fc89cd5a1d0837550342029f8cb80cf5ad60721a26844987a6f40ee', '2025-10-28T22:55:49.490762', 'node-01', '2025-10-28T15:55:49.851250', 0, NULL, '2025-10-28T15:55:58.309146', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (48, '2025-10-28T15:56:28', 'confirmed', '0xd955dba202c515d1c7886cf78dcadad12a8cb493f796e01c38390efcc082ebd3', '2025-10-28T22:56:31.946723', 'node-01', '2025-10-28T15:56:32.261655', 0, NULL, '2025-10-28T15:56:40.462380', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (49, '2025-10-28T15:57:10', 'confirmed', '0xd4486c0fcaf8c02551724f0e4a2b995160a10cff299908c28e078c3119eb96b6', '2025-10-28T22:57:14.066650', 'node-01', '2025-10-28T15:57:14.590898', 0, NULL, '2025-10-28T15:57:23.214898', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (50, '2025-10-28T15:57:53', 'confirmed', '0x38e44cf5694a61d4338f8630cbf70c9a696fce8ea0ae0cb300a431cdab9de992', '2025-10-28T22:57:56.966618', 'node-01', '2025-10-28T15:57:57.183354', 0, NULL, '2025-10-28T15:58:05.888039', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (51, '2025-10-28T15:58:35', 'confirmed', '0xb77515c1c5cf646981c3015711717f3091f3b17e43c27c14372ea9cfa6573ad6', '2025-10-28T22:58:39.819305', 'node-01', '2025-10-28T15:58:40.226558', 0, NULL, '2025-10-28T15:58:48.892737', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (52, '2025-10-28T15:59:19', 'confirmed', '0x38cf71378b7467860d89082260edeb3565e6ddbb398848153b57a109824a82e6', '2025-10-28T22:59:22.938242', 'node-01', '2025-10-28T15:59:23.344709', 0, NULL, '2025-10-28T15:59:32.138821', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (53, '2025-10-28T16:00:02', 'confirmed', '0x8d040383c01cc2e04868a8f95ae54afa1418e09745d7269b5d8069095f1d6f92', '2025-10-28T23:00:06.050777', 'node-01', '2025-10-28T16:00:06.248695', 0, NULL, '2025-10-28T16:00:15.771593', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (54, '2025-10-28T16:00:46', 'confirmed', '0x69517687076c8d660dec9836ed1882c89abdcee41c518538f2150fda564f0fa0', '2025-10-28T23:00:49.502204', 'node-01', '2025-10-28T16:00:49.912218', 0, NULL, '2025-10-28T16:00:58.573089', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (55, '2025-10-28T16:01:29', 'confirmed', '0xf918061edf55b34dcd0d80332b2054c8ab722cea5ed99c2272fab7237c779180', '2025-10-28T23:01:32.253006', 'node-01', '2025-10-28T16:01:32.474476', 0, NULL, '2025-10-28T16:01:40.493740', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (56, '2025-10-28T16:02:10', 'confirmed', '0x6724170da838c8c6256e7a6ff90e115efac5674225faa25318aef2d260099d6d', '2025-10-28T23:02:14.106585', 'node-01', '2025-10-28T16:02:14.573370', 0, NULL, '2025-10-28T16:02:23.332442', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (57, '2025-10-28T16:02:53', 'confirmed', '0x89d3bab1d3bbe0bd729bfdb5b7d91dc434c542751abcf56363991e4b0766b719', '2025-10-28T23:02:56.668025', 'node-01', '2025-10-28T16:02:57.066107', 0, NULL, '2025-10-28T16:03:05.308820', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 67.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (58, '2025-10-28T16:03:35', 'confirmed', '0x3f7d910ec9b7c5f1c129d50b5e025e456beda8fbf18ed83e739329ae7931f1ea', '2025-10-28T23:03:39.132511', 'node-01', '2025-10-28T16:03:39.332283', 0, NULL, '2025-10-28T16:03:47.441188', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.0, 68.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (59, '2025-10-28T16:04:17', 'confirmed', '0x58f16f39060add61045ee2b71fc17de55bbd1bf9855bee6f06657524bb7c92de', '2025-10-28T23:04:21.198780', 'node-01', '2025-10-28T16:04:21.418324', 0, NULL, '2025-10-28T16:04:29.445994', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.0, 68.0, False);
INSERT INTO sensor_readings (id, measured_at_vn, onchain_status, onchain_tx_hash, created_at_vn, locked_by, locked_at, retry_count, last_error, confirmed_at_vn, conductivity_us_cm, ph_value, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, salt_mg_l, soil_temperature_c, soil_moisture_pct, air_temperature_c, air_humidity_pct, is_raining) VALUES (60, '2025-10-28T16:04:59', 'confirmed', '0x1bb90cd86549a44c7f91797b3b7dc0593a759827dda21b68b1372a122f052cb3', '2025-10-28T23:05:03.734497', 'node-01', '2025-10-28T16:05:04.183103', 0, NULL, '2025-10-28T16:05:12.716530', 0, '0.0', 0, 0, 0, 700, 0.0, 30.9, 32.3, 68.0, False);


-- ============================================================
-- VIEWS
-- ============================================================

-- View: v_daily_summary
DROP VIEW IF EXISTS v_daily_summary;
CREATE VIEW v_daily_summary AS
 SELECT date_vn,
    user_crop,
    summary_status,
    summary_text,
    soil_health_score,
    crop_suitability_score,
    has_anomaly,
    onchain_status,
    onchain_tx_hash
   FROM daily_insights
  ORDER BY date_vn DESC;;

-- View: v_latest_ai_analysis
DROP VIEW IF EXISTS v_latest_ai_analysis;
CREATE VIEW v_latest_ai_analysis AS
 SELECT DISTINCT ON (sensor_reading_id) sensor_reading_id,
    analysis_type,
    analysis_mode,
    user_crop,
    crop_recommendation,
    crop_validation,
    soil_health,
    anomaly_detection,
    analyzed_at_vn
   FROM ai_analysis
  ORDER BY sensor_reading_id, analyzed_at_vn DESC;;

-- View: v_pending_blockchain
DROP VIEW IF EXISTS v_pending_blockchain;
CREATE VIEW v_pending_blockchain AS
 SELECT data_type,
    data_id,
    tx_hash,
    sent_at_vn,
    retry_count,
    error_message
   FROM blockchain_logs
  WHERE ((status)::text = 'pending'::text)
  ORDER BY sent_at_vn;;

