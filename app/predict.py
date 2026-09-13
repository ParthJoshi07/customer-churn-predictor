import joblib
import pandas as pd 

model = joblib.load("models/churn_model.pkl")
scaler = joblib.load("models/scaler.pkl")
encoders = joblib.load("models/encoder.pkl")

# underscore names (pydantic) -> original column names (training data)
COLUMN_MAP = {
    "Senior_Citizen": "Senior Citizen",
    "Tenure_Months": "Tenure Months",
    "Phone_Service": "Phone Service",
    "Multiple_Lines": "Multiple Lines",
    "Internet_Service": "Internet Service",
    "Online_Security": "Online Security",
    "Online_Backup": "Online Backup",
    "Device_Protection": "Device Protection",
    "Tech_Support": "Tech Support",
    "Streaming_TV": "Streaming TV",
    "Streaming_Movies": "Streaming Movies",
    "Paperless_Billing": "Paperless Billing",
    "Payment_Method": "Payment Method",
    "Monthly_Charges": "Monthly Charges",
    "Total_Charges": "Total Charges",
}

def preprocess(input_dict):
    renamed = {COLUMN_MAP.get(k, k): v for k, v in input_dict.items()}
    df = pd.DataFrame([renamed])

    for col, le in encoders.items():
        if col in df.columns:
            df[col] = le.transform(df[col])
    
    num_cols = ["Tenure Months","Monthly Charges", "Total Charges"]
    df[num_cols] = scaler.transform(df[num_cols])

    return df
def predict_churn(input_dict):
    df = preprocess(input_dict)
    prob = model.predict_proba(df)[0][1] # probablity of class 1
    pred = int(prob >= 0.5)
    risk = "High" if prob >= 0.7 else "Medium" if prob >= 0.4 else "Low"
    return {
        "churn_prediction": pred,
        "churn_probability": round(float(prob), 3),
        "risk_level": risk
    }