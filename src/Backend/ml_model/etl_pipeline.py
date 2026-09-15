import json
import os
import random
import pandas as pd
import psycopg2
from psycopg2.extras import Json

# Neon DB Connection string
DB_URL = "postgresql://neondb_owner:npg_Fg4UWAG2nhMR@ep-autumn-truth-aelpp7kz-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

def generate_temperature_data(risk_score):
    """Generate a realistic 24-hour temperature curve based on the risk score."""
    base_temp = 60 + (risk_score * 0.2)
    spike = 10 if risk_score > 80 else (5 if risk_score > 50 else 2)
    
    times = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
    temp_data = []
    
    current_temp = base_temp - 5
    for t in times:
        predicted = current_temp + random.uniform(-2, 2)
        # Add a spike in the afternoon if high risk
        if t in ['12:00', '16:00']:
            actual = predicted + spike + random.uniform(0, 3)
        else:
            actual = predicted + random.uniform(-1, 1)
            
        temp_data.append({
            "time": t,
            "predicted": round(predicted),
            "actual": round(actual)
        })
        current_temp += 2 # warm up throughout the day
        
    return temp_data

def run_pipeline():
    print("Loading data from ML outputs...")
    
    # Load demo transformers which has rich features and explanations
    try:
        df = pd.read_csv("outputs/demo_transformers.csv")
    except FileNotFoundError:
        print("Could not find demo_transformers.csv, attempting risk_results.csv...")
        df = pd.read_csv("outputs/risk_results.csv")
    
    # Sort by risk score to get the most interesting ones
    df = df.sort_values(by='risk_score', ascending=False)
    
    # Take top 50 (or less if fewer exist)
    assets_to_process = df.head(50)
    
    mock_assets = []
    for idx, row in assets_to_process.iterrows():
        asset_id = str(row['asset_id']).replace('.csv', '')
        risk_score = float(row.get('risk_score', 0))
        
        # Determine Anomaly Status
        anomaly_status = 'Anomaly' if risk_score > 65 else 'Normal'
        
        # Determine Weather Threat
        weather_options = ['Extreme Heat', 'High Wind', 'Stable', 'Storm Warning']
        weather_threat = weather_options[0] if risk_score > 80 else (weather_options[2] if risk_score < 40 else random.choice(weather_options))
        
        # Determine Anomaly Flag for Model 1 (-1 for anomaly, 1 for normal)
        anomaly_flag = -1 if anomaly_status == 'Anomaly' else 1
        
        # Extract risk factors safely
        top_factors_raw = str(row.get('top_3_risk_factors', ''))
        factors = [f.strip() for f in top_factors_raw.split(';') if f.strip()]
        if not factors:
            factors = ["None detected"]
            
        # Extract fault probability or default
        fault_prob = float(row.get('fault_probability', risk_score / 100.0)) * 100
        
        # Synthesize Community Impact
        customers = random.randint(1000, 150000)
        is_hospital = random.choice([True, False])
        is_water = random.choice([True, False])
        
        asset = {
            "id": asset_id,
            "substation": f"Substation {asset_id.split('_')[-1]}" if '_' in asset_id else f"Station {asset_id}",
            "riskIndex": round(risk_score),
            "anomalyStatus": anomaly_status,
            "weatherThreat": weather_threat,
            "customersImpacted": customers,
            "model1": {
                "anomalyScore": float(row.get('anomaly_score', risk_score/100.0)),
                "anomalyFlag": anomaly_flag,
                "anomalousFeatures": factors,
            },
            "model2": {
                "temperatureData": generate_temperature_data(risk_score),
                "weatherContext": {
                    "ambientTemp": round(random.uniform(20, 45)),
                    "humidity": round(random.uniform(30, 90)),
                    "windSpeed": round(random.uniform(2, 30)),
                }
            },
            "model3": {
                "failureProbabilityScore": round(fault_prob),
                "severityScore": round(min(100, fault_prob + random.uniform(-10, 20))),
                "impactVariables": {
                    "hospitalConnected": is_hospital,
                    "criticalWaterPlant": is_water,
                    "homesPowered": customers,
                }
            }
        }
        mock_assets.append(asset)
        
    print(f"Generated {len(mock_assets)} complex asset structures.")
    
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
        for asset in mock_assets:
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
        print(f"Successfully inserted {len(mock_assets)} dynamic assets into the database!")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    run_pipeline()
