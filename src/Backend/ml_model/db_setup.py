import json
import os
import psycopg2
from psycopg2.extras import Json

# Neon DB Connection string
DB_URL = "postgresql://neondb_owner:npg_Fg4UWAG2nhMR@ep-autumn-truth-aelpp7kz-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# The data currently driving the UI
mock_assets = [
  {
    "id": "AS-8492",
    "substation": "Northside Alpha",
    "riskIndex": 94,
    "anomalyStatus": "Anomaly",
    "weatherThreat": "Extreme Heat",
    "customersImpacted": 45000,
    "model1": {
      "anomalyScore": 0.88,
      "anomalyFlag": -1,
      "anomalousFeatures": ["Vibration: +2.3σ", "Insulation Resistance: Critical Drop", "Oil Dissolved Gas: High H2"],
    },
    "model2": {
      "temperatureData": [
        { "time": "00:00", "predicted": 65, "actual": 66 },
        { "time": "04:00", "predicted": 64, "actual": 65 },
        { "time": "08:00", "predicted": 68, "actual": 70 },
        { "time": "12:00", "predicted": 75, "actual": 82 },
        { "time": "16:00", "predicted": 78, "actual": 95 },
        { "time": "20:00", "predicted": 72, "actual": 91 },
      ],
      "weatherContext": {
        "ambientTemp": 41,
        "humidity": 85,
        "windSpeed": 3,
      }
    },
    "model3": {
      "failureProbabilityScore": 92,
      "severityScore": 97,
      "impactVariables": {
        "hospitalConnected": True,
        "criticalWaterPlant": False,
        "homesPowered": 45000,
      }
    }
  },
  {
    "id": "AS-3105",
    "substation": "West End Sub",
    "riskIndex": 87,
    "anomalyStatus": "Anomaly",
    "weatherThreat": "High Wind",
    "customersImpacted": 32000,
    "model1": {
      "anomalyScore": 0.76,
      "anomalyFlag": -1,
      "anomalousFeatures": ["Bushings Stress: Elevated", "Load Variance: Erratic"],
    },
    "model2": {
      "temperatureData": [
        { "time": "00:00", "predicted": 62, "actual": 63 },
        { "time": "04:00", "predicted": 61, "actual": 62 },
        { "time": "08:00", "predicted": 65, "actual": 67 },
        { "time": "12:00", "predicted": 70, "actual": 78 },
        { "time": "16:00", "predicted": 71, "actual": 85 },
        { "time": "20:00", "predicted": 68, "actual": 80 },
      ],
      "weatherContext": {
        "ambientTemp": 28,
        "humidity": 60,
        "windSpeed": 24,
      }
    },
    "model3": {
      "failureProbabilityScore": 84,
      "severityScore": 91,
      "impactVariables": {
        "hospitalConnected": False,
        "criticalWaterPlant": True,
        "homesPowered": 32000,
      }
    }
  },
  {
    "id": "AS-5521",
    "substation": "Central Hub",
    "riskIndex": 45,
    "anomalyStatus": "Normal",
    "weatherThreat": "Stable",
    "customersImpacted": 120000,
    "model1": {
      "anomalyScore": 0.12,
      "anomalyFlag": 1,
      "anomalousFeatures": ["None detected"],
    },
    "model2": {
      "temperatureData": [
        { "time": "00:00", "predicted": 60, "actual": 60 },
        { "time": "04:00", "predicted": 59, "actual": 59 },
        { "time": "08:00", "predicted": 64, "actual": 65 },
        { "time": "12:00", "predicted": 71, "actual": 72 },
        { "time": "16:00", "predicted": 75, "actual": 76 },
        { "time": "20:00", "predicted": 69, "actual": 70 },
      ],
      "weatherContext": {
        "ambientTemp": 22,
        "humidity": 45,
        "windSpeed": 5,
      }
    },
    "model3": {
      "failureProbabilityScore": 25,
      "severityScore": 75,
      "impactVariables": {
        "hospitalConnected": True,
        "criticalWaterPlant": True,
        "homesPowered": 120000,
      }
    }
  },
  {
    "id": "AS-9923",
    "substation": "East Ridge",
    "riskIndex": 22,
    "anomalyStatus": "Normal",
    "weatherThreat": "Stable",
    "customersImpacted": 18500,
    "model1": {
      "anomalyScore": 0.04,
      "anomalyFlag": 1,
      "anomalousFeatures": ["None detected"],
    },
    "model2": {
      "temperatureData": [
        { "time": "00:00", "predicted": 55, "actual": 56 },
        { "time": "04:00", "predicted": 54, "actual": 54 },
        { "time": "08:00", "predicted": 60, "actual": 61 },
        { "time": "12:00", "predicted": 68, "actual": 67 },
        { "time": "16:00", "predicted": 72, "actual": 71 },
        { "time": "20:00", "predicted": 65, "actual": 66 },
      ],
      "weatherContext": {
        "ambientTemp": 20,
        "humidity": 50,
        "windSpeed": 4,
      }
    },
    "model3": {
      "failureProbabilityScore": 18,
      "severityScore": 28,
      "impactVariables": {
        "hospitalConnected": False,
        "criticalWaterPlant": False,
        "homesPowered": 18500,
      }
    }
  }
]

def setup_db():
    try:
        print("Connecting to Neon database...")
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        print("Creating grid_assets table...")
        # Create table with JSONB to store the nested models
        cur.execute('''
            DROP TABLE IF EXISTS grid_assets;
            CREATE TABLE grid_assets (
                id VARCHAR(50) PRIMARY KEY,
                substation VARCHAR(100),
                risk_index INTEGER,
                anomaly_status VARCHAR(50),
                weather_threat VARCHAR(50),
                customers_impacted INTEGER,
                model_data JSONB
            );
        ''')
        
        print("Inserting data...")
        for asset in mock_assets:
            # Separate top level properties from the nested models
            asset_id = asset['id']
            substation = asset['substation']
            risk_index = asset['riskIndex']
            anomaly_status = asset['anomalyStatus']
            weather_threat = asset['weatherThreat']
            customers_impacted = asset['customersImpacted']
            
            # The rest of the object
            model_data = {
                'model1': asset['model1'],
                'model2': asset['model2'],
                'model3': asset['model3']
            }
            
            cur.execute('''
                INSERT INTO grid_assets 
                (id, substation, risk_index, anomaly_status, weather_threat, customers_impacted, model_data)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            ''', (asset_id, substation, risk_index, anomaly_status, weather_threat, customers_impacted, Json(model_data)))
            
        conn.commit()
        print(f"Successfully inserted {len(mock_assets)} assets into the database!")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    setup_db()
