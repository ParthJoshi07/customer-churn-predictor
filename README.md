# Customer Churn Prediction & Retention Intelligence API

An end-to-end machine learning system that predicts whether a telecom customer is likely to churn, and serves that prediction through a REST API with a live web dashboard.

> Not just a notebook — a full pipeline from raw data to a working, testable product: **EDA → Feature Engineering → Model Training → FastAPI backend → Web Dashboard**.

---

## 🎯 Problem Statement

Customer churn (customers leaving a service) is one of the most expensive problems for subscription-based businesses — acquiring a new customer costs far more than retaining an existing one. This project builds a system that:

1. Predicts the probability a customer will churn
2. Classifies them into a **risk tier** (Low / Medium / High)
3. Exposes this as an API any business system (CRM, dashboard, alert system) could call in real time

---

## 🏗️ Architecture

```
Raw Data (CSV)
      │
      ▼
EDA + Data Cleaning  ──► Feature Engineering (encoding + scaling)
      │
      ▼
Model Training (XGBoost)
      │
      ▼
Serialized Model (.pkl)
      │
      ▼
   FastAPI  ──►  /predict endpoint  ──►  Web Dashboard (HTML/CSS/JS)
```

---

## 📊 Dataset

- **Source:** IBM Telco Customer Churn dataset (extended version)
- **Size:** ~7,000 customer records
- **Target:** `Churn Label` (Yes/No) → converted to binary
- **Dropped columns:** `CustomerID`, `Count`, geographic fields (`Country`, `State`, `City`, `Zip Code`, `Lat Long`), and `Churn Value` / `Churn Reason` (direct target leakage)

---

## 🔍 Key Insights from EDA

| Finding | Detail |
|---|---|
| **Contract type** | Month-to-month customers churn far more than 1-year/2-year contract holders — the single strongest predictor |
| **Tenure** | New customers (0–5 months) have the highest churn risk; churn drops steadily as tenure increases |
| **Monthly charges** | Customers who churn have a noticeably higher median monthly bill (~₹80 vs ~₹64) |
| **Class balance** | ~27% of customers churn — a moderately imbalanced classification problem |

---

## 🤖 Model

- **Algorithm:** XGBoost Classifier
- **Preprocessing:** Label encoding for categorical features, standard scaling for numeric features
- **Train/test split:** 80/20, stratified on target to preserve class balance

### Performance

| Metric | Score |
|---|---|
| Accuracy | 78% |
| ROC-AUC | 0.82 |
| Precision (Churn class) | 0.58 |
| Recall (Churn class) | 0.55 |

> Recall on the churn class is an area for future improvement (e.g. via `scale_pos_weight` or SMOTE) — for a business use case, catching more true churners matters more than raw accuracy.

---

## 🛠️ Tech Stack

- **Data & ML:** Python, pandas, scikit-learn, XGBoost, joblib
- **Backend API:** FastAPI, Pydantic, Uvicorn
- **Frontend:** HTML, CSS, vanilla JavaScript (fetch API)
- **Notebook:** Jupyter

---

## 📁 Project Structure

```
churn-prediction-api/
├── data/
│   ├── raw/                  # original dataset
│   └── processed/            # cleaned dataset
├── notebooks/
│   └── 01_eda_and_model.ipynb
├── models/
│   ├── churn_model.pkl
│   ├── scaler.pkl
│   └── encoder.pkl
├── app/
│   ├── main.py                # FastAPI app + /predict endpoint
│   ├── schemas.py              # request/response models
│   └── predict.py             # preprocessing + inference logic
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── requirements.txt
```

---

## 🚀 Running Locally

**1. Install dependencies**
```bash
pip install fastapi uvicorn scikit-learn xgboost pandas joblib
```

**2. Start the API**
```bash
uvicorn app.main:app --reload
```
API will be live at `http://127.0.0.1:8000` — interactive docs at `http://127.0.0.1:8000/docs`.

**3. Open the dashboard**

Open `frontend/index.html` in a browser (with the API running). Fill in the customer details and click **Predict Churn** to see the live risk assessment.

---

## 📡 API Example

**Request** — `POST /predict`
```json
{
  "Gender": "Male",
  "Senior_Citizen": "No",
  "Partner": "Yes",
  "Dependents": "No",
  "Tenure_Months": 5,
  "Phone_Service": "Yes",
  "Multiple_Lines": "No",
  "Internet_Service": "Fiber optic",
  "Online_Security": "No",
  "Online_Backup": "No",
  "Device_Protection": "No",
  "Tech_Support": "No",
  "Streaming_TV": "Yes",
  "Streaming_Movies": "Yes",
  "Contract": "Month-to-month",
  "Paperless_Billing": "Yes",
  "Payment_Method": "Electronic check",
  "Monthly_Charges": 85.5,
  "Total_Charges": 425.0
}
```

**Response**
```json
{
  "churn_prediction": 1,
  "churn_probability": 0.821,
  "risk_level": "High"
}
```

---

## 🔮 Future Improvements

- Handle class imbalance more explicitly (SMOTE, `scale_pos_weight`) to improve churn-class recall
- Containerize with Docker for portable deployment
- Deploy backend (Render/Railway) and frontend (Vercel/Netlify) for a live public demo
- Add model explainability (SHAP values) to show *why* a customer is flagged high-risk
- Add a batch-prediction endpoint for scoring an entire customer list (CSV upload)

---

## 👤 Author

Built as an end-to-end ML portfolio project covering data science, ML engineering, backend API development, and frontend integration.
