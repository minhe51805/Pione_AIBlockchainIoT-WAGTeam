"""
Run migration 007: Add blockchain tracking to daily_insights
"""
import psycopg2
import sys

DB_CONFIG = {
    'host': '36.50.134.107',
    'port': 6000,
    'dbname': 'db_iot_sensor',
    'user': 'admin',
    'password': 'admin123'
}

def run_migration():
    print("=" * 80)
    print("🔧 MIGRATION 007: Add blockchain tracking to daily_insights")
    print("=" * 80)
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = False
        cur = conn.cursor()
        
        print("\n📡 Connected to database")
        
        # Read and execute migration
        with open('migrations/007_add_onchain_tracking.sql', 'r', encoding='utf-8') as f:
            migration_sql = f.read()
        
        print("⚙️  Executing migration...")
        cur.execute(migration_sql)
        conn.commit()
        
        print("✅ Migration executed!")
        
        # Verify
        print("\n📊 Verifying new columns:")
        cur.execute("""
            SELECT column_name, data_type, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'daily_insights' 
            AND column_name IN ('blockchain_status', 'blockchain_tx_hash', 'blockchain_pushed_at')
            ORDER BY ordinal_position
        """)
        
        print("-" * 80)
        for row in cur.fetchall():
            print(f"   {row[0]:30s} {row[1]:20s} {row[2]}")
        print("-" * 80)
        
        cur.close()
        conn.close()
        
        print("\n✅ MIGRATION 007 COMPLETED!")
        print("=" * 80)
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)

