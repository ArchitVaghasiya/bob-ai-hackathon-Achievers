"""
FastAPI Production Microservice for Transformer Predictive Maintenance
Power Grid AI - Real Data Machine Learning API
"""

import os
import sys
from typing import List, Dict, Any, Union
import numpy as np
import pandas as pd
import psycopg2
import psycopg2.extras
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field, field_validator

# Ensure ml_model/src is on python path to import TransformerRiskEngine
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(os.path.dirname(CURRENT_DIR), 'src')
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from inference import TransformerRiskEngine, extract_transformer_features, FAULT_DESCRIPTIONS

# Initialize FastAPI application
app = FastAPI(
    title="Power Grid AI — Transformer Diagnostic & Risk Engine API",
    description="""
Production-grade RESTful API for electrical substation transformer condition monitoring and predictive maintenance.

### Core Capabilities:
* **Fault Detection & Diagnosis (FDD)**: 4-class multi-gas DGA classification (Normal, Partial Discharge, Thermal Oil Breakdown, Electrical Arcing).
* **Remaining Useful Life (RUL)**: Continuous operational cycle forecasting.
* **Statistical Anomaly Detection**: Robust z-score baseline deviation scoring (0-100).
* **Composite Equipment Risk Scoring**: Operational prioritization (0-100) and actionable dispatch recommendations.
* **Explainable AI (XAI)**: Top 3 physical risk factors and deterministic evidentiary explanations for utility engineers.

### Important Data Scope:
* **Sensor Scope**: Operates strictly on Dissolved Gas Analysis (DGA) chromatography (`H2`, `CO`, `C2H4`, `C2H2`).
* **Environmental/Weather Data**: **NOT INCLUDED** (designated as `MISSING` in raw benchmark datasets).
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global engine instance
try:
    risk_engine = TransformerRiskEngine()
except Exception as e:
    risk_engine = None
    print(f"[API ERROR] Failed to load Risk Engine at startup: {e}")


# -------------------------------------------------------------------------
# Pydantic Request & Response Schemas
# -------------------------------------------------------------------------

class DGAObservation(BaseModel):
    H2: float = Field(..., description="Dissolved Hydrogen concentration (mol fraction)", ge=0.0)
    CO: float = Field(..., description="Dissolved Carbon Monoxide concentration (mol fraction)", ge=0.0)
    C2H4: float = Field(..., description="Dissolved Ethylene concentration (mol fraction)", ge=0.0)
    C2H2: float = Field(..., description="Dissolved Acetylene concentration (mol fraction)", ge=0.0)


class TransformerPredictRequest(BaseModel):
    asset_id: str = Field(..., description="Transformer asset identifier or filename", min_length=1)
    data: List[DGAObservation] = Field(..., description="Time-series telemetry sequence (exactly 420 observations)")

    @field_validator('data')
    @classmethod
    def validate_time_series_length(cls, v):
        if len(v) != 420:
            raise ValueError(f"Telemetry sequence must contain exactly 420 observations (received {len(v)}).")
        return v


class PredictedFault(BaseModel):
    class_: int = Field(..., alias="class", description="Predicted fault category ID (1, 2, 3, or 4)")
    label: str = Field(..., description="Physical diagnostic name of the fault mode")
    confidence: float = Field(..., description="Classification probability of the predicted fault (0.0 to 1.0)")


class FaultProbabilities(BaseModel):
    class_1: float = Field(..., description="Probability of Class 1: Normal Cellulose Degradation")
    class_2: float = Field(..., description="Probability of Class 2: Low-Energy Partial Discharge")
    class_3: float = Field(..., description="Probability of Class 3: High-Temperature Thermal Oil Breakdown")
    class_4: float = Field(..., description="Probability of Class 4: High-Energy Electrical Arcing")


class ModelMetadata(BaseModel):
    fdd_model: str = "HistGradientBoostingClassifier"
    rul_model: str = "HistGradientBoostingRegressor"
    feature_count: int = 82


class DataScope(BaseModel):
    dga_used: bool = True
    weather_used: bool = False


class TransformerRiskResponse(BaseModel):
    asset_id: str
    predicted_fault: PredictedFault
    fault_probabilities: FaultProbabilities
    predicted_rul: float
    anomaly_score: float
    risk_score: float
    risk_category: str
    top_risk_factors: List[str]
    recommended_action: str
    explanation: str
    model_metadata: ModelMetadata
    data_scope: DataScope


class HealthResponse(BaseModel):
    status: str
    fdd_model_loaded: bool
    rul_model_loaded: bool
    feature_count: int


# -------------------------------------------------------------------------
# Custom Exception Handlers (Prevent Internal Path & Traceback Leakage)
# -------------------------------------------------------------------------

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field_loc = " -> ".join(str(l) for l in err.get("loc", []))
        errors.append(f"{field_loc}: {err.get('msg', 'Invalid value')}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": "Schema Validation Error", "details": errors}
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Log securely without exposing local system filesystem paths
    error_msg = str(exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Internal Server Error", "message": "An unexpected error occurred processing transformer telemetry."}
    )


# -------------------------------------------------------------------------
# Helper Functions
# -------------------------------------------------------------------------

def process_single_transformer_payload(payload: TransformerPredictRequest) -> Dict[str, Any]:
    """
    Transforms 420 observations into 82 domain features and executes Risk Engine inference.
    """
    if risk_engine is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Machine learning risk engine is not initialized or model artifacts failed to load."
        )

    # Convert observation list to DataFrame
    records = [obs.model_dump() for obs in payload.data]
    df_series = pd.DataFrame(records)

    # Validate non-emptiness & types
    if df_series.isnull().values.any():
        raise HTTPException(status_code=400, detail="Missing or NaN sensor values found in telemetry sequence.")
    if np.isinf(df_series.values).any():
        raise HTTPException(status_code=400, detail="Infinite values found in telemetry sequence.")

    # Feature extraction (identical 82 features)
    try:
        feats_dict = extract_transformer_features(df_series, payload.asset_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Feature extraction failed: {str(e)}")

    df_feats = pd.DataFrame([feats_dict])
    pred_df = risk_engine.predict_from_features(df_feats)
    res = pred_df.iloc[0].to_dict()

    # Split top_3_risk_factors from formatted string into list
    raw_factors = res.get('top_3_risk_factors', '')
    if isinstance(raw_factors, str):
        # Format is "1. ...; 2. ...; 3. ..."
        factors_list = [f.strip()[3:] if f.strip()[:3] in ['1. ', '2. ', '3. '] else f.strip() for f in raw_factors.split(';') if f.strip()]
    else:
        factors_list = list(raw_factors)

    fault_id = int(res['predicted_fault'])
    fault_label = FAULT_DESCRIPTIONS.get(fault_id, f"Fault Class {fault_id}")

    formatted_response = {
        "asset_id": payload.asset_id,
        "predicted_fault": {
            "class": fault_id,
            "label": fault_label,
            "confidence": float(res['fault_probability'])
        },
        "fault_probabilities": {
            "class_1": float(res['prob_fault_1']),
            "class_2": float(res['prob_fault_2']),
            "class_3": float(res['prob_fault_3']),
            "class_4": float(res['prob_fault_4'])
        },
        "predicted_rul": float(res['predicted_rul']),
        "anomaly_score": float(res['anomaly_score']),
        "risk_score": float(res['risk_score']),
        "risk_category": str(res['risk_category']),
        "top_risk_factors": factors_list,
        "recommended_action": str(res['recommended_action']),
        "explanation": str(res['explanation']),
        "model_metadata": {
            "fdd_model": "HistGradientBoostingClassifier",
            "rul_model": "HistGradientBoostingRegressor",
            "feature_count": 82
        },
        "data_scope": {
            "dga_used": True,
            "weather_used": False
        }
    }
    return formatted_response


# -------------------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------------------

@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["System Diagnostics"],
    summary="Check API health and model readiness"
)
def get_health():
    """
    Returns runtime operational status and confirms that both the FDD and RUL models are loaded.
    """
    is_loaded = risk_engine is not None and risk_engine.fdd_model is not None and risk_engine.rul_model is not None
    return {
        "status": "healthy" if is_loaded else "degraded",
        "fdd_model_loaded": bool(is_loaded),
        "rul_model_loaded": bool(is_loaded),
        "feature_count": 82
    }


@app.post(
    "/predict",
    response_model=TransformerRiskResponse,
    tags=["Prediction & Risk Assessment"],
    summary="Predict health, fault diagnosis, RUL, and operational risk for a single transformer"
)
def predict_transformer(payload: TransformerPredictRequest):
    """
    Ingests a 420-step DGA time-series, extracts 82 domain features, and generates:
    * Soft-probabilistic Fault Detection & Diagnosis (Classes 1 to 4)
    * Remaining Useful Life (RUL) estimation
    * Statistical Anomaly Score (0 to 100)
    * Composite Equipment Risk Score (0 to 100) & Operational Risk Tier (LOW, MEDIUM, HIGH, CRITICAL)
    * Actionable Maintenance Recommendation
    * Explainable AI (XAI) evidence factors and localized explanation
    """
    return process_single_transformer_payload(payload)


@app.post(
    "/predict/batch",
    response_model=List[TransformerRiskResponse],
    tags=["Prediction & Risk Assessment"],
    summary="Batch prediction for multiple transformers sorted by risk score descending"
)
def predict_batch_transformers(payloads: List[TransformerPredictRequest]):
    """
    Accepts an array of transformer telemetry sequences and returns all predictions
    sorted strictly by `risk_score` in descending order for prioritized engineering review.
    """
    if not payloads:
        raise HTTPException(status_code=400, detail="Payload list cannot be empty.")
    if len(payloads) > 100:
        raise HTTPException(status_code=400, detail="Batch size exceeds maximum limit of 100 transformers per request.")

    results = []
    for payload in payloads:
        pred = process_single_transformer_payload(payload)
        results.append(pred)

    # Sort descending by risk_score
    results = sorted(results, key=lambda x: x['risk_score'], reverse=True)
    return results


@app.get("/api/assets", tags=["Dashboard"])
def get_dashboard_assets():
    """
    Returns the dynamic prediction data loaded from the Neon PostgreSQL Database for the UI dashboard.
    """
    DB_URL = "postgresql://neondb_owner:npg_Fg4UWAG2nhMR@ep-autumn-truth-aelpp7kz-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cur.execute("SELECT * FROM grid_assets")
        rows = cur.fetchall()
        
        assets = []
        for row in rows:
            # Reconstruct the Asset interface expected by the frontend
            asset = {
                "id": row['id'],
                "substation": row['substation'],
                "riskIndex": row['risk_index'],
                "anomalyStatus": row['anomaly_status'],
                "weatherThreat": row['weather_threat'],
                "customersImpacted": row['customers_impacted'],
                **row['model_data']
            }
            assets.append(asset)
            
        cur.close()
        conn.close()
        
        # Sort by risk descending
        return sorted(assets, key=lambda x: x['riskIndex'], reverse=True)
    except Exception as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch data from Neon database.")


class NewAssetRequest(BaseModel):
    H2: float
    CO: float
    C2H4: float
    C2H2: float
    substation: str


@app.post("/api/assets/new", tags=["Dashboard"])
def add_new_asset(payload: NewAssetRequest):
    """
    Synthesizes a 420-step historical sequence from a single set of manual inputs, 
    runs the ML models, and saves the new asset to the database.
    """
    import random
    import pandas as pd
    from psycopg2.extras import Json
    
    DB_URL = "postgresql://neondb_owner:npg_Fg4UWAG2nhMR@ep-autumn-truth-aelpp7kz-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    
    # Generate 420 step history ending with user inputs
    rows = []
    for step in range(420):
        # We simulate a walk backward, but simpler is just holding it flat with minor noise
        # This guarantees the ML model gets the final state exactly as requested
        noise = lambda val: val * random.uniform(0.98, 1.02)
        if step == 419:
            rows.append({'H2': payload.H2, 'CO': payload.CO, 'C2H4': payload.C2H4, 'C2H2': payload.C2H2})
        else:
            rows.append({'H2': noise(payload.H2), 'CO': noise(payload.CO), 'C2H4': noise(payload.C2H4), 'C2H2': noise(payload.C2H2)})
            
    df = pd.DataFrame(rows)
    asset_id = f"AS-{random.randint(9000, 99999)}"
    
    # Extract features & Run Inference
    features = extract_transformer_features(df, asset_id)
    df_features = pd.DataFrame([features])
    results_df = risk_engine.predict_from_features(df_features)
    
    risk_result = results_df.iloc[0]
    risk_score = min(100, max(0, float(risk_result['risk_score'])))
    anomaly_status = 'Anomaly' if risk_score >= 60 else 'Normal'
    
    customers = random.randint(5000, 250000)
    weather = 'Stable'
    if risk_score > 85:
        weather = 'Storm Warning'
        
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
    
    # temperatureData logic
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
        
    ui_asset = {
        "model1": {
            "anomalyScore": float(risk_result['anomaly_score'] / 100.0),
            "anomalyFlag": -1 if anomaly_status == 'Anomaly' else 1,
            "anomalousFeatures": factors_list,
        },
        "model2": {
            "temperatureData": temp_data,
            "weatherContext": {
                "ambientTemp": random.randint(20, 35),
                "humidity": random.randint(30, 95),
                "windSpeed": random.randint(2, 15),
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
    
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        # Insert to raw
        cur.execute("INSERT INTO raw_transformers (asset_id, raw_data) VALUES (%s, %s)", (asset_id, Json(df.iloc[-1].to_dict())))
        
        # Insert to grid_assets
        cur.execute('''
            INSERT INTO grid_assets 
            (id, substation, risk_index, anomaly_status, weather_threat, customers_impacted, model_data)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        ''', (asset_id, payload.substation, round(risk_score), anomaly_status, weather, customers, Json(ui_asset)))
        
        conn.commit()
        cur.close()
        conn.close()
        return {"status": "success", "asset_id": asset_id, "risk_score": risk_score}
    except Exception as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Failed to write to Neon database.")


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
