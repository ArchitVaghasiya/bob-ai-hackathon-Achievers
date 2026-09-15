# GridPulse AI - FastAPI Microservice

This directory contains `main.py`, the core routing layer connecting the React Frontend to the Machine Learning models and the Neon PostgreSQL database.

## 🚀 Tech Stack
- **Framework**: FastAPI (Python)
- **Database Driver**: Psycopg2
- **Data Validation**: Pydantic

## 🔌 API Endpoints

### `GET /api/assets`
- **Purpose**: Fetches all analyzed grid assets from the Neon PostgreSQL `grid_assets` table.
- **Behavior**: Used by the React frontend to populate the main dashboard, sorting assets descending by their `risk_index` so the most dangerous transformers appear first.

### `POST /api/assets/new`
- **Purpose**: Triggers a live Machine Learning inference cycle.
- **Payload**: Requires raw DGA telemetry values (Hydrogen `H2`, Carbon Monoxide `CO`, Ethylene `C2H4`, Acetylene `C2H2`).
- **Behavior**:
  1. Synthesizes a realistic 420-step historical sequence ending in the provided values.
  2. Passes the sequence to the `TransformerRiskEngine` (Scikit-Learn).
  3. Writes the raw history to `raw_transformers` in Neon.
  4. Writes the AI predictions and Risk Index to `grid_assets` in Neon.
  5. Instantly available on the React frontend upon refresh.

## 🛠️ How to Run
```bash
# Navigate here
cd src/Backend/ml_model/api

# Run Uvicorn server with hot-reloading
python main.py
```
*The API runs at `http://127.0.0.1:8000`.*
