import sys
import os
import random
import psycopg2
from psycopg2.extras import Json
import pandas as pd
import numpy as np

# Ensure src is in path to import the real ML models
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if os.path.join(CURRENT_DIR, 'src') not in sys.path:
    sys.path.insert(0, os.path.join(CURRENT_DIR, 'src'))

from inference import TransformerRiskEngine, extract_transformer_features

DB_URL = "postgresql://neondb_owner:npg_Fg4UWAG2nhMR@ep-autumn-truth-aelpp7kz-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

SUBSTATION_NAMES = ['Northside', 'West End', 'Central', 'East Ridge', 'South Park', 'Valley', 'Highland', 'Lakeview', 'Riverside', 'Oakwood']
SUBSTATION_SUFFIX = ['Alpha', 'Sub', 'Hub', 'Station', 'Node', 'Grid']
WEATHER_THREATS = ['Extreme Heat', 'High Wind', 'Stable', 'Storm Warning', 'Heavy Rain', 'Snow/Ice']

def generate_temperature_data(risk_score):
    base_temp = 55 + (risk_score * 0.2)
    spike = 15 if risk_score > 85 else (8 if risk_score > 60 else 2)
    times = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
    temp_data = []
    current_temp = base_temp - 5
    for t in times:
        predicted = current_temp + random.uniform(-2, 2)
        actual = predicted + spike + random.uniform(-1, 3) if t in ['12:00', '16:00'] else predicted + random.uniform(-2, 2)
        temp_data.append({"time": t, "predicted": round(predicted), "actual": round(actual)})
        current_temp += 3 
    return temp_data

def synthesize_dga_timeseries(is_critical=False):
    """
    Generates a 420-step historical sequence for H2, CO, C2H4, C2H2.
    If is_critical is True, injects steep degradation slopes (simulating thermal/arcing).
    """
    # Base values
    h2 = 0.0005
    co = 0.0050
    c2h4 = 0.0010
    c2h2 = 0.0001
    
    rows = []
    for step in range(420):
        # Add small random walk
        h2 += np.random.normal(0, 0.00001)
        co += np.random.normal(0, 0.00005)
        c2h4 += np.random.normal(0, 0.00002)
        c2h2 += np.random.normal(0, 0.000002)
        
        # If critical, add aggressive upward slope near the end
        if is_critical and step > 300:
            h2 += 0.0002 * (step - 300) / 120
            c2h4 += 0.0001 * (step - 300) / 120
            c2h2 += 0.00005 * (step - 300) / 120
            
        rows.append({
            'H2': max(0, h2),
            'CO': max(0, co),
            'C2H4': max(0, c2h4),
            'C2H2': max(0, c2h2)
        })
        
    return pd.DataFrame(rows)

def run():
    print("Loading AI Model Engine...")
    engine = TransformerRiskEngine()
    print("Engine loaded successfully.")
    
    print("Connecting to Neon database...")
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    print("Re-creating tables...")
    cur.execute('''
        DROP TABLE IF EXISTS grid_assets;
        DROP TABLE IF EXISTS raw_transformers;
        
        CREATE TABLE raw_transformers (
            asset_id VARCHAR(100) PRIMARY KEY,
            raw_data JSONB
        );
        
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
    
    # Generate 100 transformers (20% critical)
    total_assets = 100
    print(f"Synthesizing telemetry & running ML inference for {total_assets} assets...")
    
    for i in range(total_assets):
        asset_id = f"AS-{1000 + i}"
        is_critical = random.random() < 0.20
        df = synthesize_dga_timeseries(is_critical)
        
        # 1. Save raw data to raw_transformers table
        # We only save the last step to save DB space for this demo, or we could save the whole thing.
        raw_json = df.iloc[-1].to_dict() 
        cur.execute("INSERT INTO raw_transformers (asset_id, raw_data) VALUES (%s, %s)", (asset_id, Json(raw_json)))
        
        # 2. Run live ML Model Inference
        features = extract_transformer_features(df, asset_id)
        df_features = pd.DataFrame([features])
        results_df = engine.predict_from_features(df_features)
        
        # 3. Map ML output to UI schema
        risk_result = results_df.iloc[0]
        risk_score = min(100, max(0, float(risk_result['risk_score'])))
        anomaly_status = 'Anomaly' if risk_score >= 60 else 'Normal'
        
        weather = random.choice(WEATHER_THREATS)
        if risk_score > 85:
            weather = random.choice(['Extreme Heat', 'Storm Warning', 'High Wind'])
            
        customers = random.randint(5000, 250000)
        
        # Map features from engine response
        factors = str(risk_result['top_3_risk_factors'])
        factors_list = [f.strip() for f in factors.split(';') if f.strip()]
        if not factors_list:
            factors_list = ["None detected"]
            
        highest_prob = max([
            float(risk_result['prob_fault_1']),
            float(risk_result['prob_fault_2']),
            float(risk_result['prob_fault_3']),
            float(risk_result['prob_fault_4'])
        ]) * 100
        
        ui_asset = {
            "model1": {
                "anomalyScore": float(risk_result['anomaly_score'] / 100.0),
                "anomalyFlag": -1 if anomaly_status == 'Anomaly' else 1,
                "anomalousFeatures": factors_list,
            },
            "model2": {
                "temperatureData": generate_temperature_data(risk_score),
                "weatherContext": {
                    "ambientTemp": random.randint(20, 45) if weather == 'Extreme Heat' else random.randint(10, 35),
                    "humidity": random.randint(30, 95),
                    "windSpeed": random.randint(2, 40) if weather == 'High Wind' else random.randint(2, 15),
                }
            },
            "model3": {
                "failureProbabilityScore": round(highest_prob),
                "severityScore": round(min(100, risk_score + random.randint(0, 15))),
                "impactVariables": {
                    "hospitalConnected": random.choice([True, False]),
                    "criticalWaterPlant": random.choice([True, False]),
                    "homesPowered": customers,
                }
            }
        }
        
        substation_name = f"{random.choice(SUBSTATION_NAMES)} {random.choice(SUBSTATION_SUFFIX)}"
        
        cur.execute('''
            INSERT INTO grid_assets 
            (id, substation, risk_index, anomaly_status, weather_threat, customers_impacted, model_data)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        ''', (
            asset_id, 
            substation_name, 
            round(risk_score), 
            anomaly_status, 
            weather, 
            customers, 
            Json(ui_asset)
        ))
        
        if (i+1) % 10 == 0:
            print(f"Processed {i+1}/{total_assets}...")
            
    conn.commit()
    cur.close()
    conn.close()
    print("SUCCESS: 100 AI-analyzed assets written to Neon DB!")

if __name__ == "__main__":
    run()
