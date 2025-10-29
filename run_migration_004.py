"""
Run Migration 004 - Add AI Tables
==================================
Tạo tables mới cho AI Module & Knowledge Graph
"""

import os
import psycopg2
from psycopg2 import Error
from dotenv import load_dotenv

load_dotenv()

def get_db_conn():
    return psycopg2.connect(
        host=os.getenv("PGHOST", "localhost"),
        port=int(os.getenv("PGPORT", "5432")),
        dbname=os.getenv("PGDATABASE", "db_iot_sensor"),
        user=os.getenv("PGUSER", "admin"),
        password=os.getenv("PGPASSWORD", "admin123"),
    )

def run_migration():
    print("=" * 80)
    print("  🚀 MIGRATION 004 - ADD AI TABLES")
    print("=" * 80)
    
    migration_file = "migrations/004_add_ai_tables.sql"
    
    if not os.path.exists(migration_file):
        print(f"❌ Error: Migration file not found: {migration_file}")
        return False
    
    print(f"\n📂 Migration file: {migration_file}")
    
    # Confirm before running
    print("\n⚠️  CẢNH BÁO:")
    print("   - Migration này sẽ DROP table `daily_insights` nếu tồn tại")
    print("   - Tạo 4 tables mới: ai_analysis, daily_insights, ai_recommendations, blockchain_logs")
    print("   - Tạo 3 views và 1 function")
    
    confirm = input("\n❓ Bạn có chắc chắn muốn tiếp tục? (yes/no): ")
    if confirm.lower() != 'yes':
        print("\n❌ Migration đã bị hủy bởi người dùng.")
        return False
    
    conn = None
    try:
        print("\n🔄 Đang kết nối đến database...")
        conn = get_db_conn()
        print("✅ Kết nối thành công!")
        
        print("\n🔄 Đang đọc migration script...")
        with open(migration_file, 'r', encoding='utf-8') as f:
            sql_script = f.read()
        
        print("✅ Đọc script thành công!")
        
        print("\n🚀 Đang thực thi migration...")
        print("   (Có thể mất 30-60 giây...)")
        
        cursor = conn.cursor()
        cursor.execute(sql_script)
        conn.commit()
        
        print("\n✅ Migration thực thi thành công!")
        
        # Verify tables created
        print("\n🔍 Đang xác minh tables đã tạo...")
        cursor.execute("""
            SELECT table_name, 
                   (SELECT COUNT(*) 
                    FROM information_schema.columns 
                    WHERE table_name = t.table_name) as column_count
            FROM information_schema.tables t
            WHERE table_schema = 'public' 
              AND table_type = 'BASE TABLE'
              AND table_name IN ('sensor_readings', 'ai_analysis', 'daily_insights', 
                                 'ai_recommendations', 'blockchain_logs')
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        
        print("\n📊 Tables created:")
        for table_name, col_count in tables:
            print(f"   ✅ {table_name.ljust(25)} ({col_count} columns)")
        
        # Verify views
        print("\n🔍 Đang xác minh views...")
        cursor.execute("""
            SELECT table_name
            FROM information_schema.views
            WHERE table_schema = 'public'
              AND table_name LIKE 'v_%'
            ORDER BY table_name;
        """)
        
        views = cursor.fetchall()
        print("\n👁️  Views created:")
        for (view_name,) in views:
            print(f"   ✅ {view_name}")
        
        # Verify functions
        print("\n🔍 Đang xác minh functions...")
        cursor.execute("""
            SELECT routine_name
            FROM information_schema.routines
            WHERE routine_schema = 'public'
              AND routine_type = 'FUNCTION'
              AND routine_name IN ('get_daily_stats', 'update_updated_at_column')
            ORDER BY routine_name;
        """)
        
        functions = cursor.fetchall()
        print("\n⚙️  Functions created:")
        for (func_name,) in functions:
            print(f"   ✅ {func_name}()")
        
        cursor.close()
        
        print("\n" + "=" * 80)
        print("✅ MIGRATION 004 HOÀN TẤT THÀNH CÔNG!")
        print("=" * 80)
        
        print("\n📋 Tóm tắt:")
        print(f"   • Tables:    {len(tables)} tables")
        print(f"   • Views:     {len(views)} views")
        print(f"   • Functions: {len(functions)} functions")
        
        print("\n🎯 Next Steps:")
        print("   1. ✅ Database schema ready")
        print("   2. ⏳ Update Smart Contract (add storeDailyInsight function)")
        print("   3. ⏳ Train AI models")
        print("   4. ⏳ Implement daily cron job (23:59)")
        print("   5. ⏳ Test end-to-end flow")
        
        return True
        
    except Error as e:
        print(f"\n❌ Database error: {e}")
        if conn:
            conn.rollback()
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False
    finally:
        if conn:
            conn.close()
            print("\n🔌 Database connection closed.")

if __name__ == "__main__":
    success = run_migration()
    
    if success:
        print("\n" + "=" * 80)
        print("🎉 READY FOR AI MODULE DEVELOPMENT!")
        print("=" * 80)
    else:
        print("\n" + "=" * 80)
        print("❌ MIGRATION FAILED - Please check errors above")
        print("=" * 80)

