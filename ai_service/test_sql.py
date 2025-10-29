import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os

load_dotenv('config.env')

conn = psycopg2.connect(
    host=os.getenv("PGHOST"),
    port=int(os.getenv("PGPORT")),
    dbname=os.getenv("PGDATABASE"),
    user=os.getenv("PGUSER"),
    password=os.getenv("PGPASSWORD"),
)

cur = conn.cursor(cursor_factory=RealDictCursor)

# Test simple query first
date = '2025-10-28'
query = "SELECT COUNT(*) as cnt FROM sensor_readings WHERE DATE(measured_at_vn) = %s"

print(f"Testing query: {query}")
print(f"Parameter: {date}")
print(f"Parameter tuple: {(date,)}")
print("-" * 40)

try:
    cur.execute(query, (date,))
    result = cur.fetchone()
    print(f"✅ SUCCESS! Count = {result['cnt']}")
except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback
    traceback.print_exc()

cur.close()
conn.close()

