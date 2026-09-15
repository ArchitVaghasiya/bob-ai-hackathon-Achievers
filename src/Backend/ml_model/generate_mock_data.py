import json
import random
import psycopg2
from psycopg2.extras import Json

# Neon DB Connection string
DB_URL = "postgresql://neondb_owner:npg_Fg4UWAG2nhMR@ep-autumn-truth-aelpp7kz-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Base templates to pull realistic phrasing from
SUBSTATION_NAMES = ['Northside', 'West End', 'Central', 'East Ridge', 'South Park', 'Valley', 'Highland', 'Lakeview', 'Riverside', 'Oakwood', 'Pine Hill', 'Maple', 'Cedar', 'Elm', 'Birch']
SUBSTATION_SUFFIX = ['Alpha', 'Sub', 'Hub', 'Station', 'Complex', 'Node', 'Grid', 'Relay']

ANOMALY_FEATURES = [
    'Vibration: +2.3σ', 'Insulation Resistance: Critical Drop', 'Oil Dissolved Gas: High H2',
    'Bushings Stress: Elevated', 'Load Variance: Erratic', 'Thermal Overload Detected',
    'Partial Discharge: Active', 'Moisture in Oil: High', 'Cooling System: Degraded'
]

WEATHER_THREATS = ['Extreme Heat', 'High Wind', 'Stable', 'Storm Warning', 'Heavy Rain', 'Snow/Ice']

def generate_temperature_data(risk_score):
    base_temp = 55 + (risk_score * 0.2)
    spike = 15 if risk_score > 85 else (8 if risk_score > 60 else 2)
    
    times = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
    temp_data = []
    
    current_temp = base_temp - 5
    for t in times:
        predicted = current_temp + random.uniform(-2, 2)
        if t in ['12:00', '16:00']:
            actual = predicted + spike + random.uniform(-1, 3)
        else:
            actual = predicted + random.uniform(-2, 2)
            
        temp_data.append({
            "time": t,
            "predicted": round(predicted),
            "actual": round(actual)
        })
        current_temp += 3 
        
    return temp_data

def generate_assets(count=16):
    assets = []
    for i in range(count):
        # Determine base risk
        if i < 3:
            risk_index = random.randint(85, 99) # Critical
        elif i < 7:
            risk_index = random.randint(60, 84) # High
        elif i < 11:
            risk_index = random.randint(35, 59) # Medium
        else:
            risk_index = random.randint(10, 34) # Low
            
        is_anomaly = risk_index > 75
        anomaly_status = 'Anomaly' if is_anomaly else 'Normal'
        weather = random.choice(WEATHER_THREATS)
        if risk_index > 85:
            weather = random.choice(['Extreme Heat', 'Storm Warning', 'High Wind'])
        elif risk_index < 30:
            weather = 'Stable'
            
        asset_id = f"AS-{random.randint(1000, 9999)}"
        name = f"{random.choice(SUBSTATION_NAMES)} {random.choice(SUBSTATION_SUFFIX)}"
        customers = random.randint(5000, 250000)
        
        # Select 1 to 3 random anomaly features if it's an anomaly
        features = random.sample(ANOMALY_FEATURES, k=random.randint(1, 3)) if is_anomaly else ['None detected']
        
        asset = {
            "id": asset_id,
            "substation": name,
            "riskIndex": risk_index,
            "anomalyStatus": anomaly_status,
            "weatherThreat": weather,
            "customersImpacted": customers,
            "model1": {
                "anomalyScore": round(risk_index / 100.0 * random.uniform(0.9, 1.1), 2),
                "anomalyFlag": -1 if is_anomaly else 1,
                "anomalousFeatures": features,
            },
            "model2": {
                "temperatureData": generate_temperature_data(risk_index),
                "weatherContext": {
                    "ambientTemp": random.randint(20, 45) if weather == 'Extreme Heat' else random.randint(10, 35),
                    "humidity": random.randint(30, 95),
                    "windSpeed": random.randint(2, 40) if weather == 'High Wind' else random.randint(2, 15),
                }
            },
            "model3": {
                "failureProbabilityScore": min(99, risk_index + random.randint(-5, 10)),
                "severityScore": min(99, risk_index + random.randint(0, 15)),
                "impactVariables": {
                    "hospitalConnected": random.choice([True, False]),
                    "criticalWaterPlant": random.choice([True, False]),
                    "homesPowered": customers,
                }
            }
        }
        assets.append(asset)
    return assets

def run():
    # Keep the original 4 we hardcoded, and append 16 generated ones to get 20 total.
    
    original_4 = [
      {
        "id": "AS-8492", "substation": "Northside Alpha", "riskIndex": 94, "anomalyStatus": "Anomaly", "weatherThreat": "Extreme Heat", "customersImpacted": 45000,
        "model1": { "anomalyScore": 0.88, "anomalyFlag": -1, "anomalousFeatures": ["Vibration: +2.3σ", "Insulation Resistance: Critical Drop", "Oil Dissolved Gas: High H2"] },
        "model2": { "temperatureData": [ { "time": "00:00", "predicted": 65, "actual": 66 }, { "time": "04:00", "predicted": 64, "actual": 65 }, { "time": "08:00", "predicted": 68, "actual": 70 }, { "time": "12:00", "predicted": 75, "actual": 82 }, { "time": "16:00", "predicted": 78, "actual": 95 }, { "time": "20:00", "predicted": 72, "actual": 91 } ], "weatherContext": { "ambientTemp": 41, "humidity": 85, "windSpeed": 3 } },
        "model3": { "failureProbabilityScore": 92, "severityScore": 97, "impactVariables": { "hospitalConnected": True, "criticalWaterPlant": False, "homesPowered": 45000 } }
      },
      {
        "id": "AS-3105", "substation": "West End Sub", "riskIndex": 87, "anomalyStatus": "Anomaly", "weatherThreat": "High Wind", "customersImpacted": 32000,
        "model1": { "anomalyScore": 0.76, "anomalyFlag": -1, "anomalousFeatures": ["Bushings Stress: Elevated", "Load Variance: Erratic"] },
        "model2": { "temperatureData": [ { "time": "00:00", "predicted": 62, "actual": 63 }, { "time": "04:00", "predicted": 61, "actual": 62 }, { "time": "08:00", "predicted": 65, "actual": 67 }, { "time": "12:00", "predicted": 70, "actual": 78 }, { "time": "16:00", "predicted": 71, "actual": 85 }, { "time": "20:00", "predicted": 68, "actual": 80 } ], "weatherContext": { "ambientTemp": 28, "humidity": 60, "windSpeed": 24 } },
        "model3": { "failureProbabilityScore": 84, "severityScore": 91, "impactVariables": { "hospitalConnected": False, "criticalWaterPlant": True, "homesPowered": 32000 } }
      },
      {
        "id": "AS-5521", "substation": "Central Hub", "riskIndex": 45, "anomalyStatus": "Normal", "weatherThreat": "Stable", "customersImpacted": 120000,
        "model1": { "anomalyScore": 0.12, "anomalyFlag": 1, "anomalousFeatures": ["None detected"] },
        "model2": { "temperatureData": [ { "time": "00:00", "predicted": 60, "actual": 60 }, { "time": "04:00", "predicted": 59, "actual": 59 }, { "time": "08:00", "predicted": 64, "actual": 65 }, { "time": "12:00", "predicted": 71, "actual": 72 }, { "time": "16:00", "predicted": 75, "actual": 76 }, { "time": "20:00", "predicted": 69, "actual": 70 } ], "weatherContext": { "ambientTemp": 22, "humidity": 45, "windSpeed": 5 } },
        "model3": { "failureProbabilityScore": 25, "severityScore": 75, "impactVariables": { "hospitalConnected": True, "criticalWaterPlant": True, "homesPowered": 120000 } }
      },
      {
        "id": "AS-9923", "substation": "East Ridge", "riskIndex": 22, "anomalyStatus": "Normal", "weatherThreat": "Stable", "customersImpacted": 18500,
        "model1": { "anomalyScore": 0.04, "anomalyFlag": 1, "anomalousFeatures": ["None detected"] },
        "model2": { "temperatureData": [ { "time": "00:00", "predicted": 55, "actual": 56 }, { "time": "04:00", "predicted": 54, "actual": 54 }, { "time": "08:00", "predicted": 60, "actual": 61 }, { "time": "12:00", "predicted": 68, "actual": 67 }, { "time": "16:00", "predicted": 72, "actual": 71 }, { "time": "20:00", "predicted": 65, "actual": 66 } ], "weatherContext": { "ambientTemp": 20, "humidity": 50, "windSpeed": 4 } },
        "model3": { "failureProbabilityScore": 18, "severityScore": 28, "impactVariables": { "hospitalConnected": False, "criticalWaterPlant": False, "homesPowered": 18500 } }
      }
    ]
    
    generated = generate_assets(10)
    all_assets = original_4 + generated
    
    try:
        print("Connecting to Neon database...")
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        print("Re-creating grid_assets table...")
        cur.execute('''
            DROP TABLE IF EXISTS grid_assets;
            CREATE TABLE grid_assets (
                id VARCHAR(100) PRIMARY KEY,
                substation VARCHAR(150),
                risk_index INTEGER,
                anomaly_status VARCHAR(50),
                weather_threat VARCHAR(50),
                customers_impacted INTEGER,
                model_data JSONB
            );
        ''')
        
        print("Inserting new data...")
        for asset in all_assets:
            model_data = {
                'model1': asset['model1'],
                'model2': asset['model2'],
                'model3': asset['model3']
            }
            
            cur.execute('''
                INSERT INTO grid_assets 
                (id, substation, risk_index, anomaly_status, weather_threat, customers_impacted, model_data)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            ''', (
                asset['id'], 
                asset['substation'], 
                asset['riskIndex'], 
                asset['anomalyStatus'], 
                asset['weatherThreat'], 
                asset['customersImpacted'], 
                Json(model_data)
            ))
            
        conn.commit()
        print(f"Successfully inserted {len(all_assets)} dynamic assets into the database!")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    run()
