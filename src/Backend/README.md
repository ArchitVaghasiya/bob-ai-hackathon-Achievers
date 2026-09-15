# GridPulse AI - Backend & Machine Learning

This directory contains the entire Python backend for GridPulse AI, which acts as the bridge between raw transformer sensor data, complex Scikit-Learn machine learning algorithms, and the React Frontend.

## 📁 Directory Architecture

```
Backend/
└── ml_model/
    ├── api/            # FastAPI Application (Microservice Endpoints)
    ├── data/           # Raw and processed Kaggle transformer datasets
    ├── models/         # Pickled (.pkl) Scikit-Learn models (FDD & RUL)
    ├── notebooks/      # Jupyter Notebooks used for model training/experimentation
    ├── scripts/        # Utility scripts
    ├── src/            # Core ML source code (Feature Extraction, Engine classes)
    ├── db_setup.py     # Neon PostgreSQL Database schema initialization
    ├── etl_pipeline.py # Data processing pipeline
    └── seed_end_to_end.py # Live data synthesizer & database seeder
```

## 🧠 The Machine Learning Pipeline
GridPulse AI does not use mock static predictions. It leverages a genuine **Closed-Loop ML Architecture**.
1. **Feature Extraction (`src/inference.py`)**: Converts a 420-step historical sequence of raw Dissolved Gas Analysis (DGA) telemetry into a strict 82-feature temporal footprint.
2. **HistGradientBoosting (`models/`)**: Predicts the precise probability of specific transformer faults (Thermal, Arcing, Partial Discharge) and Remaining Useful Life (RUL).
3. **Risk Scoring Engine**: Fuses the AI probabilities with environmental factors (like ambient temperature) and community impact (like hospitals connected) to produce a deterministic 0-100 Risk Index.

## 💾 The Database (Neon PostgreSQL)
We use a serverless **Neon PostgreSQL** database to maintain state. 
- `raw_transformers`: Stores the raw JSON DGA telemetry.
- `grid_assets`: Stores the final ML risk predictions, which the FastAPI application queries to serve the React dashboard.

*To seed the database with 100 AI-analyzed transformers, run `python ml_model/seed_end_to_end.py`.*
