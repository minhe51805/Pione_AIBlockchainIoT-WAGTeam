"""
Direct test of daily_aggregator without uvicorn cache
"""
import sys
sys.path.insert(0, 'ai_service')

from daily_aggregator import aggregate_daily_data

print("=" * 80)
print("🧪 TESTING DAILY AGGREGATOR DIRECTLY")
print("=" * 80)

try:
    result = aggregate_daily_data('2025-10-28')
    
    if result:
        print("\n✅ SUCCESS!")
        print(f"   Date: {result['date']}")
        print(f"   Sample count: {result['sample_count']}")
        print(f"   Soil temp: {result['features']['soil_temperature']:.2f}°C")
        print(f"   Soil moisture: {result['features']['soil_moisture']:.2f}%")
        print(f"   pH: {result['features']['ph']:.2f}")
        print(f"   Conductivity: {result['features']['conductivity']:.2f}")
        print("\n" + "=" * 80)
    else:
        print("\n❌ No data returned")
        
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    print("=" * 80)

