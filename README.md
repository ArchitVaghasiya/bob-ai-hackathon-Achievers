# 🚀 GridPulse AI

---

## 👥 Team
| Field | Value |
|---|---|
| **Team Name** | Achievers |
| **Track** | AI |
| **Team Lead** | Diksh Dharmendrabhai Trambadia — 24ce129@charusat.edu.in |
| **Members** | Henisha Jiteshkumar Vyas, Archit Nileshbhai Vaghasiya, Akash Vanmalibhai Unagar |

---

## 🎯 Problem Statement
Utility companies frequently face sudden, critical transformer failures that can lead to massive power grid outages. Identifying these failures before they occur is extremely difficult due to the complex interplay of internal sensor data (e.g., Dissolved Gas Analysis, load variance), external weather conditions, and component aging. Without early warning systems, maintenance is entirely reactive, leading to longer downtimes and higher repair costs.

---

## 💡 Solution
GridPulse AI is an AI-powered predictive maintenance and risk scoring platform. It synthesizes an Isolation Forest anomaly detector (for real-time sensor faults), an XGBoost Regressor (for thermal stress and weather impact), and a weighted Risk Scaling Algorithm. By converting complex machine learning outputs into a clean, prioritized risk index, grid operators can preemptively deploy maintenance crews to vulnerable substations before failure occurs.

---

## ✨ Key Features
- **Real-time Anomaly Detection:** Uses an Isolation Forest model to detect multi-variate sensor anomalies (e.g., Vibration, Insulation Resistance, Dissolved Gas).
- **Thermal Stress Prediction:** An XGBoost Regressor predicts the baseline transformer temperature given ambient weather context (temperature, humidity, wind) to highlight dangerous thermal deltas.
- **Weighted Risk Index Algorithm:** Synthesizes ML failure probabilities (60% weight) with community impact severity (40% weight - e.g., hospitals connected) to generate a prioritized 0-100 risk index.
- **Explainable AI Insights:** Unveils the top physical risk factors and deterministic explanations to empower maintenance crews with actionable context.
- **Pre-positioning Dispatch:** A beautiful, responsive dashboard allowing operators to preemptively dispatch crews to high-risk substations before peak weather stress windows hit.

---

## 🛠️ Tech Stack
| Category | Technologies |
|---|---|
| **Languages** | Python, TypeScript |
| **Frameworks** | FastAPI, React (Vite) |
| **IBM Technologies** | IBM Bob |
| **Databases** | None (CSV / In-memory JSON) |
| **Other** | Tailwind CSS, scikit-learn, XGBoost, Pandas |

---

## 📁 Repository Structure
```
├── src/
│   ├── Backend/          # Python FastAPI backend & ML models
│   │   ├── ml_model/     # Jupyter Notebooks and trained .pkl files
│   │   └── api/          # FastAPI routes
│   └── Frontend/         # React + Vite application
│       ├── src/          # UI Components, Styles, and Mock Data
│       └── public/       # Static Assets
├── README.md             # This submission file
```

---

## ⚡ How to Run

### Backend (Python/FastAPI)
```bash
# 1. Navigate to the backend directory
cd src/Backend/ml_model

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the API server
python -m uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend (React/Vite)
```bash
# 1. Navigate to the frontend directory
cd src/Frontend

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev
```
*The dashboard will be available at `http://localhost:5173`.*

---

## 🖥️ Demo
| Artifact | Link |
|---|---|
| 📹 Demo Video | *([Add link if you have one](https://youtu.be/qCwuUPR9nJk))* |
| 🌐 Live Demo | *([Add link if you have one](https://youtu.be/qCwuUPR9nJk))* |
| 🖼️ Screenshots | *([Add link if you have one](https://drive.google.com/drive/folders/1WeXUh6wNGgtj2LLVwk5qfeUk2uwjPR4W?usp=sharing))* |

---

## ⚠️ Known Limitations
- **Mocked Live Data:** The frontend currently renders the exact 3-model visual architecture requested using a hardcoded `mockData.ts` file for demonstration purposes. The live FastAPI backend is present but disconnected to preserve the specific UI layout.
- **Synthetic Training Data:** The ML models in the backend were trained on synthetic/mocked transformer datasets.
- **UI Simulation:** The "Pre-position Crew" dispatch action is a simulated UI toast alert and does not currently connect to a real dispatcher system.

---

## 🏅 What We're Most Proud Of
We are most proud of the seamless integration of three distinct machine learning approaches (unsupervised anomaly detection, supervised thermal regression, and a deterministic weighted impact algorithm) into a singular, highly polished, responsive UI. Instead of presenting raw confusing data, the dashboard converts complex ML outputs into immediate, actionable insight wrapped in a premium, warm-toned aesthetic.
