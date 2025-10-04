CREATE TABLE sensor_readings (
  id    BIGSERIAL PRIMARY KEY,
  -- Thời điểm đo theo giờ Việt Nam 
  measured_at_vn    TIMESTAMP NOT NULL,

  -- 4 trường đúng đẩy on-chain
  temperature_c     REAL      NOT NULL,
  humidity_pct      SMALLINT  NOT NULL CHECK (humidity_pct BETWEEN 0 AND 100),
  moisture_pct      SMALLINT  NOT NULL CHECK (moisture_pct BETWEEN 0 AND 100),

  -- Trạng thái đẩy on-chain
  onchain_status    TEXT      NOT NULL DEFAULT 'pending'
                              CHECK (onchain_status IN ('pending','sent','confirmed','failed')),
  onchain_tx_hash   TEXT,     -- tx hash để đối chiếu explorer

  -- Thời điểm server ghi vào DB, theo giờ Việt Nam
  created_at_vn     TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh'),

  -- Không cho trùng dữ liệu theo mốc thời gian
  UNIQUE (measured_at_vn)
);

-- Truy vấn theo thời gian gần nhất
CREATE INDEX idx_sensor_readings_measured_at_vn_desc ON sensor_readings (measured_at_vn DESC);



CREATE TABLE daily_insights (
  id    BIGSERIAL PRIMARY KEY,

  -- Lưu ngày và giờ
  date_vn           DATE      NOT NULL,

  -- Mô hình đã dùng và kết quả gợi ý trong ngày
  model_id          TEXT      NOT NULL,        -- tên model
  verdict           TEXT      NOT NULL,        -- ví dụ: 'dat_kho' | 'tuoi_nuoc' (nhớ để đơn giản để lưu onchain)

  -- Thời điểm hệ thống ra quyết định theo giờ Việt Nam
  decided_at_vn     TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh'),

  -- Trạng thái đẩy on-chain cho bản ghi này
  onchain_status    TEXT      NOT NULL DEFAULT 'pending'
                              CHECK (onchain_status IN ('pending','sent','confirmed','failed')),
  onchain_tx_hash   TEXT,

  -- 1 ngày chỉ có 1 đánh giá
  UNIQUE (date_vn)
);

CREATE INDEX idx_daily_insights_date_desc ON daily_insights (date_vn DESC);