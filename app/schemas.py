from pydantic import BaseModel, Field

class CustomerInput(BaseModel):
    Gender: str
    Senior_Citizen: str
    Partner: str
    Dependents: str
    Tenure_Months: int = Field(ge=0, le=100)
    Phone_Service: str
    Multiple_Lines: str
    Internet_Service: str
    Online_Security: str
    Online_Backup: str
    Device_Protection: str
    Tech_Support: str
    Streaming_TV: str
    Streaming_Movies: str
    Contract: str
    Paperless_Billing: str
    Payment_Method: str
    Monthly_Charges: float = Field(ge=0)
    Total_Charges: float = Field(ge=0)

class PredictionOutput(BaseModel):
    churn_prediction: int
    churn_probability: float
    risk_level: str