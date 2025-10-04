"""
Cấu hình kết nối PostgreSQL Database
Sửa thông tin kết nối phù hợp với PostgreSQL server của bạn
"""

DB_CONFIG = {
    'host': 'localhost',      # Địa chỉ PostgreSQL server
    'port': 5437,             # Port PostgreSQL (mặc định 5432)
    'user': 'HiepData',       # Username PostgreSQL
    'password': '123456',     # Password PostgreSQL
    'database': 'db_iot_sensor', # Tên database
}

# Connection pool settings
POOL_CONFIG = {
    'pool_name': 'iot_pool',
    'pool_size': 5,           # Số lượng connection trong pool
    'pool_reset_session': True
}

