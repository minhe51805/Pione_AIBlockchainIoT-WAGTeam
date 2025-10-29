"""
Verify Migration 004 - Check database schema
"""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def verify_schema():
    conn = psycopg2.connect(
        host=os.getenv("PGHOST"),
        port=int(os.getenv("PGPORT")),
        dbname=os.getenv("PGDATABASE"),
        user=os.getenv("PGUSER"),
        password=os.getenv("PGPASSWORD"),
    )
    
    cursor = conn.cursor()
    
    print("=" * 80)
    print("📊 DATABASE SCHEMA VERIFICATION")
    print("=" * 80)
    
    # Check daily_insights structure
    print("\n🔍 Table: daily_insights")
    cursor.execute("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'daily_insights'
        ORDER BY ordinal_position
        LIMIT 20;
    """)
    
    print("\nFirst 20 columns:")
    for col_name, data_type, nullable in cursor.fetchall():
        null_str = "NULL" if nullable == "YES" else "NOT NULL"
        print(f"  • {col_name.ljust(30)} {data_type.ljust(20)} {null_str}")
    
    # Count total columns
    cursor.execute("""
        SELECT COUNT(*)
        FROM information_schema.columns
        WHERE table_name = 'daily_insights';
    """)
    total_cols = cursor.fetchone()[0]
    print(f"\n  Total columns: {total_cols}")
    
    # Test insert
    print("\n🧪 Testing INSERT into daily_insights...")
    try:
        cursor.execute("""
            INSERT INTO daily_insights (
                date_vn,
                user_crop,
                total_readings,
                soil_temperature_avg,
                soil_moisture_avg,
                conductivity_avg,
                ph_avg,
                nitrogen_avg,
                phosphorus_avg,
                potassium_avg,
                salt_avg,
                air_temperature_avg,
                air_humidity_avg,
                soil_health_score,
                soil_health_rating,
                summary_status,
                summary_text
            ) VALUES (
                CURRENT_DATE,
                'coffee',
                96,
                22.3, 45.2, 898, 6.8, 45, 30, 180, 574,
                25.6, 71.5,
                78.5, 'GOOD', 'GOOD',
                'Test migration - Đất tốt'
            )
            ON CONFLICT (date_vn) DO NOTHING
            RETURNING id;
        """)
        
        result = cursor.fetchone()
        if result:
            print(f"  ✅ Test insert successful! ID: {result[0]}")
        else:
            print("  ℹ️  Record already exists (conflict)")
        
        conn.rollback()  # Rollback test insert
        print("  ℹ️  Rolled back test insert")
        
    except Exception as e:
        print(f"  ❌ Test insert failed: {e}")
        conn.rollback()
    
    cursor.close()
    conn.close()
    
    print("\n" + "=" * 80)
    print("✅ VERIFICATION COMPLETE!")
    print("=" * 80)

if __name__ == "__main__":
    verify_schema()

