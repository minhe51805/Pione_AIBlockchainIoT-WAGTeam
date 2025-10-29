"""
Run migration 006: Simplify daily_insights schema
"""
import psycopg2
import sys

# Database connection
DB_CONFIG = {
    'host': '36.50.134.107',
    'port': 6000,
    'dbname': 'db_iot_sensor',
    'user': 'admin',
    'password': 'admin123'
}

def run_migration():
    """Run the migration"""
    print("=" * 80)
    print("🔧 RUNNING MIGRATION 006: Simplify daily_insights schema")
    print("=" * 80)
    
    try:
        # Connect to database
        print(f"\n📡 Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = False
        cur = conn.cursor()
        
        print("   ✅ Connected!")
        
        # Read migration SQL
        print(f"\n📄 Reading migration file...")
        with open('migrations/006_simplify_daily_insights.sql', 'r', encoding='utf-8') as f:
            migration_sql = f.read()
        
        # Execute migration
        print(f"\n⚙️  Executing migration...")
        cur.execute(migration_sql)
        
        # Commit
        conn.commit()
        
        print("   ✅ Migration executed successfully!")
        
        # Verify new schema
        print("\n📊 Verifying new schema:")
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'daily_insights'
            ORDER BY ordinal_position
        """)
        
        columns = cur.fetchall()
        print("-" * 80)
        for col_name, data_type in columns:
            print(f"   {col_name:35s} {data_type}")
        print("-" * 80)
        print(f"   Total columns: {len(columns)} (reduced from 43!)")
        print("-" * 80)
        
        # Close connection
        cur.close()
        conn.close()
        
        print("\n✅ MIGRATION 006 COMPLETED SUCCESSFULLY!")
        print("=" * 80)
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("\n⚠️  Migration failed!")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)

