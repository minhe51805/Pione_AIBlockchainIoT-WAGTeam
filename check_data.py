import psycopg2

conn = psycopg2.connect(
    host='36.50.134.107',
    port=6000,
    dbname='db_iot_sensor',
    user='admin',
    password='admin123'
)

cur = conn.cursor()

# Check dates with data
cur.execute("""
    SELECT 
        DATE(measured_at_vn) as date, 
        COUNT(*) as count,
        MIN(measured_at_vn) as first_reading,
        MAX(measured_at_vn) as last_reading
    FROM sensor_readings 
    GROUP BY DATE(measured_at_vn) 
    ORDER BY date DESC 
    LIMIT 10
""")

print("=" * 80)
print("📅 DATES WITH SENSOR DATA:")
print("=" * 80)

rows = cur.fetchall()
if rows:
    for row in rows:
        date, count, first, last = row
        print(f"  {date}: {count:3d} readings  ({first} → {last})")
else:
    print("  ⚠️  No data found!")

print("\n" + "=" * 80)

# Check specifically 2025-10-28
cur.execute("""
    SELECT COUNT(*) 
    FROM sensor_readings 
    WHERE DATE(measured_at_vn) = '2025-10-28'
""")

count_28 = cur.fetchone()[0]
print(f"📊 Data for 2025-10-28: {count_28} readings")

# Check 2025-10-29
cur.execute("""
    SELECT COUNT(*) 
    FROM sensor_readings 
    WHERE DATE(measured_at_vn) = '2025-10-29'
""")

count_29 = cur.fetchone()[0]
print(f"📊 Data for 2025-10-29: {count_29} readings")

print("=" * 80)

cur.close()
conn.close()

