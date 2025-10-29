import psycopg2

conn = psycopg2.connect(
    host='36.50.134.107',
    port=6000,
    dbname='db_iot_sensor',
    user='admin',
    password='admin123'
)

cur = conn.cursor()

# Check daily_insights columns
cur.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'daily_insights'
    ORDER BY ordinal_position
""")

print("=" * 80)
print("📊 DAILY_INSIGHTS TABLE SCHEMA:")
print("=" * 80)

rows = cur.fetchall()
for col_name, data_type in rows:
    print(f"  {col_name:40s} {data_type}")

print("=" * 80)
print(f"Total columns: {len(rows)}")
print("=" * 80)

cur.close()
conn.close()

