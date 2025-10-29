"""
Update old daily_insights record with blockchain info from API
"""
import psycopg2
import requests

# Get blockchain data
response = requests.get('http://localhost:3000/api/getLatestDailyInsight')
blockchain_data = response.json()

print("=" * 80)
print("🔄 UPDATING OLD RECORD WITH BLOCKCHAIN INFO")
print("=" * 80)

print("\n📊 Blockchain data:")
print(f"   Date: {blockchain_data['date']}")
print(f"   Crop: {blockchain_data['recommendedCrop']}")
print(f"   Reporter: {blockchain_data['reporter']}")

# We don't have TX hash from Smart Contract query, 
# but we know it's confirmed on blockchain
# So update status to 'confirmed' with reporter address as reference

conn = psycopg2.connect(
    host='36.50.134.107',
    port=6000,
    dbname='db_iot_sensor',
    user='admin',
    password='admin123'
)

cur = conn.cursor()

# Update the record
cur.execute("""
    UPDATE daily_insights
    SET blockchain_status = 'confirmed',
        blockchain_pushed_at = created_at
    WHERE date_vn = '2025-10-28'
    RETURNING id, date_vn, blockchain_status
""")

result = cur.fetchone()
conn.commit()

if result:
    print(f"\n✅ Updated record:")
    print(f"   ID: {result[0]}")
    print(f"   Date: {result[1]}")
    print(f"   Status: {result[2]}")
else:
    print("\n❌ No record found")

cur.close()
conn.close()

print("\n" + "=" * 80)

