#!/usr/bin/env python3
"""
AI Auto Analyzer - Tự động phân tích dữ liệu IoT mỗi 5 phút
"""

import os
import sys
import time
import logging
import schedule
import requests
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')
load_dotenv()  # Fallback to .env

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/ai_auto_analyzer.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Database config (same as unified_backend.py)
DB_CONFIG = {
    'host': os.getenv('PGHOST', '36.50.134.107'),
    'port': int(os.getenv('PGPORT', '6000')),
    'dbname': os.getenv('PGDATABASE', 'db_iot_sensor'),
    'user': os.getenv('PGUSER', 'admin'),
    'password': os.getenv('PGPASSWORD', 'admin123'),
}

# API endpoint
AI_ANALYZE_URL = "http://localhost:8080/api/ai/analyze-daily"


def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(**DB_CONFIG)


def check_new_data_today():
    """
    Kiểm tra xem có dữ liệu IoT mới hôm nay chưa được phân tích chưa
    Returns: (has_new_data, date_str, sample_count)
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Lấy ngày hôm nay (VN timezone)
                today = datetime.now().strftime('%Y-%m-%d')
                
                # Check số lượng sensor readings hôm nay
                cur.execute("""
                    SELECT COUNT(*) as count
                    FROM sensor_readings
                    WHERE DATE(measured_at_vn) = %s
                """, (today,))
                reading_count = cur.fetchone()['count']
                
                if reading_count == 0:
                    logger.info(f"📊 No sensor data found for today ({today})")
                    return False, today, 0
                
                # Check xem đã có daily insight chưa
                cur.execute("""
                    SELECT id, created_at, total_readings
                    FROM daily_insights
                    WHERE date_vn = %s
                    ORDER BY created_at DESC
                    LIMIT 1
                """, (today,))
                insight = cur.fetchone()
                
                if not insight:
                    logger.info(f"📊 {reading_count} new readings found, no insight yet for {today}")
                    return True, today, reading_count
                
                # Nếu đã có insight nhưng có thêm dữ liệu mới
                if reading_count > insight['total_readings']:
                    logger.info(f"📊 New data detected: {reading_count} readings (was {insight['total_readings']})")
                    return True, today, reading_count
                
                logger.debug(f"📊 No new data since last analysis ({insight['created_at']})")
                return False, today, reading_count
                
    except Exception as e:
        logger.error(f"❌ Error checking new data: {e}")
        return False, None, 0


def run_ai_analysis(date_str):
    """
    Gọi AI analysis endpoint
    """
    try:
        logger.info(f"\n🤖 Running AI analysis for {date_str}...")
        
        response = requests.post(
            AI_ANALYZE_URL,
            json={"date": date_str},
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            
            # Extract key info
            crop = result.get('ai_analysis', {}).get('recommended_crop', 'Unknown')
            confidence = result.get('ai_analysis', {}).get('crop_confidence', 0)
            soil_score = result.get('ai_analysis', {}).get('soil_health', {}).get('score', 0)
            soil_rating = result.get('ai_analysis', {}).get('soil_health', {}).get('rating', 'Unknown')
            sample_count = result.get('aggregated_data', {}).get('sample_count', 0)
            
            logger.info(f"✅ AI Analysis completed successfully!")
            logger.info(f"   📊 Samples analyzed: {sample_count}")
            logger.info(f"   🌾 Recommended crop: {crop} ({confidence}% confidence)")
            logger.info(f"   🌱 Soil health: {soil_rating} (score: {soil_score}/100)")
            
            return True, result
        else:
            logger.error(f"❌ AI Analysis failed: {response.status_code}")
            logger.error(f"   Response: {response.text[:200]}")
            return False, None
            
    except requests.exceptions.Timeout:
        logger.error("❌ AI Analysis timeout (>60s)")
        return False, None
    except Exception as e:
        logger.error(f"❌ Error running AI analysis: {e}")
        return False, None


def auto_analyze_job():
    """
    Main job - chạy mỗi 5 phút
    """
    try:
        logger.info("=" * 60)
        logger.info("🔄 Starting auto analysis check...")
        
        # Check if there's new data
        has_new, date_str, sample_count = check_new_data_today()
        
        if not has_new:
            logger.info("⏭️  Skipping analysis - no new data")
            return
        
        # Run AI analysis
        success, result = run_ai_analysis(date_str)
        
        if success:
            logger.info("🎉 Auto analysis completed successfully!")
        else:
            logger.warning("⚠️  Auto analysis failed")
            
    except Exception as e:
        logger.error(f"❌ Error in auto_analyze_job: {e}", exc_info=True)


def run_scheduler():
    """
    Run the scheduler
    """
    logger.info("\n" + "=" * 60)
    logger.info("🤖 AI Auto Analyzer Started")
    logger.info("=" * 60)
    logger.info(f"📅 Schedule: Every day at 23:59 (Vietnam Time)")
    logger.info(f"🔗 AI Endpoint: {AI_ANALYZE_URL}")
    logger.info(f"📦 Database: {DB_CONFIG['host']}:{DB_CONFIG['port']}")
    logger.info("=" * 60 + "\n")
    
    # Schedule job every day at 23:59 (Vietnam Time)
    schedule.every().day.at("23:59").do(auto_analyze_job)
    
    # Run once immediately on startup
    logger.info("🚀 Running initial analysis...")
    auto_analyze_job()
    
    # Keep running
    logger.info("\n✅ Scheduler is running. Press Ctrl+C to stop.\n")
    
    while True:
        try:
            schedule.run_pending()
            time.sleep(60)  # Check every 60 seconds
        except KeyboardInterrupt:
            logger.info("\n👋 Stopping scheduler...")
            break
        except Exception as e:
            logger.error(f"❌ Error in scheduler loop: {e}")
            time.sleep(60)  # Wait 1 minute before retrying


if __name__ == "__main__":
    # Check if schedule library is installed
    try:
        import schedule
    except ImportError:
        print("❌ Error: 'schedule' library not installed")
        print("   Run: pip3 install schedule")
        sys.exit(1)
    
    # Create logs directory if not exists
    os.makedirs('logs', exist_ok=True)
    
    # Run
    run_scheduler()

