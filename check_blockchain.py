import requests
import json

print("=" * 80)
print("🔗 CHECKING BLOCKCHAIN DATA")
print("=" * 80)

# Check latest daily insight on blockchain
print("\n📊 Querying blockchain API...")
print("-" * 80)

try:
    response = requests.get('http://localhost:3000/api/getLatestDailyInsight')
    
    if response.status_code == 200:
        data = response.json()
        print("✅ SUCCESS! Data found on blockchain:")
        print("-" * 80)
        print(f"Date:              {data.get('date')}")
        print(f"Sample Count:      {data.get('sampleCount')}")
        print(f"Recommended Crop:  {data.get('recommendedCrop')}")
        print(f"Confidence:        {data.get('confidence'):.2%}")
        print(f"Soil Health:       {data.get('soilHealthScore'):.1f}/100")
        print(f"Health Rating:     {data.get('healthRating')}")
        print(f"Anomaly Detected:  {data.get('isAnomalyDetected')}")
        print(f"Reporter Address:  {data.get('reporter')}")
        print("\n📝 Recommendations:")
        for rec in data.get('recommendations', []):
            print(f"  • [{rec['priority']}] {rec['message']}")
        print("-" * 80)
    else:
        print(f"❌ ERROR: Status {response.status_code}")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"❌ ERROR: {e}")

# Check all daily insights
print("\n📋 Querying all daily insights...")
print("-" * 80)

try:
    response = requests.get('http://localhost:3000/api/getDailyInsights')
    
    if response.status_code == 200:
        insights = response.json()
        print(f"✅ Found {len(insights)} daily insights on blockchain:")
        print("-" * 80)
        for i, insight in enumerate(insights, 1):
            print(f"{i}. Date: {insight.get('date')} | Crop: {insight.get('recommendedCrop')} | "
                  f"Health: {insight.get('soilHealthScore'):.1f} ({insight.get('healthRating')})")
        print("-" * 80)
    else:
        print(f"❌ ERROR: Status {response.status_code}")
        
except Exception as e:
    print(f"❌ ERROR: {e}")

print("\n" + "=" * 80)

