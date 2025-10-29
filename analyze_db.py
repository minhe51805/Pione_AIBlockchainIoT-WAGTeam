import psycopg2

conn = psycopg2.connect(
    host='36.50.134.107',
    port=6000,
    dbname='db_iot_sensor',
    user='admin',
    password='admin123'
)

cur = conn.cursor()

print("=" * 80)
print("📊 DATABASE ANALYSIS")
print("=" * 80)

# List all tables
cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public' AND table_type='BASE TABLE'
    ORDER BY table_name
""")

tables = [r[0] for r in cur.fetchall()]

print("\n🗂️  ALL TABLES:")
print("-" * 80)
for t in tables:
    cur.execute(f"SELECT COUNT(*) FROM {t}")
    count = cur.fetchone()[0]
    print(f"  • {t:30s} ({count:5d} rows)")

print("\n" + "=" * 80)
print("🔍 DETAILED ANALYSIS:")
print("=" * 80)

# Check each table
for table in ['ai_analysis', 'ai_recommendations', 'blockchain_logs']:
    if table in tables:
        print(f"\n📋 {table.upper()}:")
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        count = cur.fetchone()[0]
        
        if count > 0:
            cur.execute(f"SELECT * FROM {table} LIMIT 1")
            sample = cur.fetchone()
            cur.execute(f"""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = '{table}'
                ORDER BY ordinal_position
            """)
            columns = [r[0] for r in cur.fetchall()]
            print(f"   Rows: {count}")
            print(f"   Columns: {', '.join(columns[:5])}...")
            print(f"   Sample data exists: YES")
        else:
            print(f"   ❌ EMPTY TABLE (0 rows)")
            cur.execute(f"""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = '{table}'
                ORDER BY ordinal_position
            """)
            columns = [r[0] for r in cur.fetchall()]
            print(f"   Columns defined: {len(columns)}")
            print(f"   Usage: NEVER USED")

print("\n" + "=" * 80)

cur.close()
conn.close()

