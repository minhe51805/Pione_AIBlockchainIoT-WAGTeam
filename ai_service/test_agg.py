from daily_aggregator import aggregate_daily_data

result = aggregate_daily_data('2025-10-28')
if result:
    print(f"✅ SUCCESS! Sample count: {result['sample_count']}")
    print(f"   Soil temp: {result['features']['soil_temperature']:.2f}°C")
else:
    print("❌ No result")

