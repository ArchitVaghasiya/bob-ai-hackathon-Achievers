# GridPulse AI - Frontend Application

This directory contains the React user interface for the GridPulse AI Predictive Maintenance System. It is built for speed, responsiveness, and a premium "dark-mode" aesthetic tailored for high-stakes grid operators.

## 🚀 Tech Stack
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS (with custom tokens in `tailwind.config.js`)
- **Icons**: Lucide-React
- **State Management**: React Hooks (State lifted to `App.tsx` for global dispatching)

## 📁 Key Features & Components
1. **Live Dashboard (`AssetTable.tsx` & `AssetInsights.tsx`)**
   - Fetches live prediction data from the FastAPI backend.
   - Converts raw ML output (Anomaly Flags, Severe Temperatures) into immediate color-coded alerts (Red/Orange/Green).
   - "Pre-position Crew" button mathematically filters and assigns maintenance teams to assets with the highest Risk Index.

2. **Crew Management (`CrewManagement.tsx`)**
   - Tracks active crews dispatched to failing transformers.
   - Operators can "Free Crew" once maintenance is complete, adding the crew back to the available pool.

3. **Immutable History (`CompletedWork.tsx`)**
   - A secure ledger of all completed dispatches, including timestamps and duration.

4. **Live Inference Execution (`AddAssetModal.tsx`)**
   - Operators can manually input Dissolved Gas Analysis (DGA) telemetry.
   - Sends a payload to the backend `POST /api/assets/new` to run live Scikit-Learn inference and instantly render the result.

## 🛠️ Getting Started
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```
The dashboard runs at `http://localhost:5173`.

## 🎨 Design Philosophy
The UI was meticulously crafted to avoid "data fatigue". Grid operators are overwhelmed with raw charts. GridPulse AI abstracts the complexity of `fdd_model.pkl` and `rul_model.pkl` into a clean, actionable **Risk Index (0-100)**, only displaying technical explanations (XAI) when an asset is actively selected.
