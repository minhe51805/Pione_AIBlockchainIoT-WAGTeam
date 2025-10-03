"""
Cấu hình kết nối MySQL Database
Sửa thông tin kết nối phù hợp với MySQL server của bạn
"""

DB_CONFIG = {
    'host': 'localhost',      # Địa chỉ MySQL server
    'port': 3306,             # Port MySQL (mặc định 3306)
    'user': 'root',           # Username MySQL
    'password': 'root',           # Password MySQL (để trống nếu không có)
    'database': 'iot_gateway', # Tên database
    'charset': 'utf8mb4',
    'autocommit': True
}

# Connection pool settings
POOL_CONFIG = {
    'pool_name': 'iot_pool',
    'pool_size': 5,           # Số lượng connection trong pool
    'pool_reset_session': True
}

