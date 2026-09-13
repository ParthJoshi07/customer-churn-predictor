from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import CustomerInput, PredictionOutput
from app.predict import predict_churn

app = FastAPI(title = "Customer Churn Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "running"}

@app.post("/predict", response_model=PredictionOutput)
def predict(customer: CustomerInput):
    result = predict_churn(customer.dict())
    return result
