const API_URL = "/predict";

const form = document.getElementById("churnForm");
const submitBtn = document.getElementById("submitBtn");
const buttonText = document.getElementById("buttonText");
const resetBtn = document.getElementById("resetBtn");

const probValue = document.getElementById("probValue");
const meterFill = document.getElementById("meterFill");

const riskTag = document.getElementById("riskTag");
const resultStatus = document.getElementById("resultStatus");

const predictionLabel = document.getElementById("predictionLabel");

const factorList = document.getElementById("factorList");
const signalCount = document.getElementById("signalCount");

const summaryContract = document.getElementById("summaryContract");
const summaryTenure = document.getElementById("summaryTenure");
const summaryMonthly = document.getElementById("summaryMonthly");
const summaryInternet = document.getElementById("summaryInternet");


/* -------------------------
   FORM SUBMISSION
------------------------- */

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const data = collectFormData();

    setLoadingState(true);

    try {
        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const result = await response.json();

        renderResult(result, data);

    } catch (error) {

        console.error("Prediction error:", error);

        renderApiError();

    } finally {

        setLoadingState(false);

    }
});


/* -------------------------
   COLLECT INPUT
------------------------- */

function collectFormData() {

    return {

        Gender: form.Gender.value,

        Senior_Citizen:
            form.Senior_Citizen.value,

        Partner:
            form.Partner.value,

        Dependents:
            form.Dependents.value,

        Tenure_Months:
            parseInt(form.Tenure_Months.value, 10),

        Phone_Service:
            form.Phone_Service.value,

        Multiple_Lines:
            form.Multiple_Lines.value,

        Internet_Service:
            form.Internet_Service.value,

        Online_Security:
            form.Online_Security.value,

        Online_Backup:
            form.Online_Backup.value,

        Device_Protection:
            form.Device_Protection.value,

        Tech_Support:
            form.Tech_Support.value,

        Streaming_TV:
            form.Streaming_TV.value,

        Streaming_Movies:
            form.Streaming_Movies.value,

        Contract:
            form.Contract.value,

        Paperless_Billing:
            form.Paperless_Billing.value,

        Payment_Method:
            form.Payment_Method.value,

        Monthly_Charges:
            parseFloat(form.Monthly_Charges.value),

        Total_Charges:
            parseFloat(form.Total_Charges.value)
    };
}


/* -------------------------
   LOADING
------------------------- */

function setLoadingState(isLoading) {

    submitBtn.disabled = isLoading;

    if (isLoading) {

        buttonText.textContent = "Running assessment";

        resultStatus.textContent = "Processing";
        resultStatus.className = "result-status idle";

    } else {

        buttonText.textContent = "Run assessment";

    }
}


/* -------------------------
   RENDER RESULT
------------------------- */

function renderResult(result, inputs) {

    const probability =
        Number(result.churn_probability);

    const riskLevel =
        result.risk_level || getRiskLevel(probability);

    const percentage =
        Math.max(0, Math.min(100, probability * 100));


    /* SCORE */

    probValue.textContent =
        `${percentage.toFixed(1)}%`;

    meterFill.style.width =
        `${percentage}%`;

    meterFill.style.background =
        getRiskColor(riskLevel);


    /* RISK STATUS */

    const normalizedRisk =
        riskLevel.toLowerCase();

    riskTag.textContent =
        `${riskLevel} churn risk`;

    riskTag.className =
        `risk-tag ${normalizedRisk}`;

    resultStatus.textContent =
        riskLevel;

    resultStatus.className =
        `result-status ${normalizedRisk}`;


    /* MODEL PREDICTION */

    predictionLabel.textContent =
        result.churn_prediction === 1
            ? "CHURN"
            : "RETAIN";


    /* CUSTOMER SUMMARY */

    summaryContract.textContent =
        inputs.Contract;

    summaryTenure.textContent =
        `${inputs.Tenure_Months} months`;

    summaryMonthly.textContent =
        formatCurrency(inputs.Monthly_Charges);

    summaryInternet.textContent =
        inputs.Internet_Service;


    /* SIGNALS */

    renderSignals(inputs);

}


/* -------------------------
   RISK LEVEL
------------------------- */

function getRiskLevel(probability) {

    if (probability < 0.35) {
        return "Low";
    }

    if (probability < 0.65) {
        return "Medium";
    }

    return "High";
}


/* -------------------------
   RISK COLORS
------------------------- */

function getRiskColor(level) {

    const colors = {
        Low: "#16845b",
        Medium: "#b56a00",
        High: "#c63d3d"
    };

    return colors[level] || "#b56a00";
}


/* -------------------------
   SIGNAL ENGINE
------------------------- */

function renderSignals(inputs) {

    const signals = [];


    /* Contract */

    if (inputs.Contract === "Month-to-month") {

        signals.push({
            label: "Month-to-month contract",
            direction: "raises"
        });

    } else {

        signals.push({
            label: `${inputs.Contract} contract`,
            direction: "lowers"
        });

    }


    /* Tenure */

    if (inputs.Tenure_Months <= 6) {

        signals.push({
            label: `Short tenure (${inputs.Tenure_Months} months)`,
            direction: "raises"
        });

    } else if (inputs.Tenure_Months >= 24) {

        signals.push({
            label: `Long tenure (${inputs.Tenure_Months} months)`,
            direction: "lowers"
        });

    }


    /* Monthly charges */

    if (inputs.Monthly_Charges >= 75) {

        signals.push({
            label: "Higher monthly charges",
            direction: "raises"
        });

    } else if (inputs.Monthly_Charges <= 40) {

        signals.push({
            label: "Lower monthly charges",
            direction: "lowers"
        });

    }


    /* Tech support */

    if (
        inputs.Tech_Support === "No" &&
        inputs.Internet_Service !== "No"
    ) {

        signals.push({
            label: "No technical support add-on",
            direction: "raises"
        });

    }


    /* Online security */

    if (inputs.Online_Security === "Yes") {

        signals.push({
            label: "Online security enabled",
            direction: "lowers"
        });

    }


    /* Internet */

    if (inputs.Internet_Service === "Fiber optic") {

        signals.push({
            label: "Fiber optic service",
            direction: "raises"
        });

    }


    /* Payment method */

    if (inputs.Payment_Method === "Electronic check") {

        signals.push({
            label: "Electronic check payment",
            direction: "raises"
        });

    }


    /* Paperless */

    if (inputs.Paperless_Billing === "Yes") {

        signals.push({
            label: "Paperless billing enabled",
            direction: "raises"
        });

    }


    /* Render */

    const visibleSignals =
        signals.slice(0, 5);

    signalCount.textContent =
        `${visibleSignals.length} signal${visibleSignals.length === 1 ? "" : "s"}`;


    factorList.innerHTML = "";


    if (!visibleSignals.length) {

        factorList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">—</div>

                <div>
                    <strong>No significant signals</strong>
                    <p>
                        No major rule-based signals were identified
                        from the submitted profile.
                    </p>
                </div>
            </div>
        `;

        return;
    }


    visibleSignals.forEach(signal => {

        const element =
            document.createElement("div");

        element.className = "signal";

        const directionText =
            signal.direction === "raises"
                ? "↑ RISK"
                : "↓ RISK";

        element.innerHTML = `
            <span class="signal-name">
                ${escapeHTML(signal.label)}
            </span>

            <span class="signal-tag ${signal.direction}">
                ${directionText}
            </span>
        `;

        factorList.appendChild(element);

    });
}


/* -------------------------
   API ERROR
------------------------- */

function renderApiError() {

    probValue.textContent = "—";

    meterFill.style.width = "0%";

    resultStatus.textContent =
        "API ERROR";

    resultStatus.className =
        "result-status high";

    riskTag.textContent =
        "Could not reach prediction API";

    riskTag.className =
        "risk-tag high";

    predictionLabel.textContent =
        "ERROR";

    signalCount.textContent =
        "0 signals";

    factorList.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">!</div>

            <div>
                <strong>Prediction unavailable</strong>

                <p>
                    Make sure the FastAPI server is running
                    at ${API_URL}.
                </p>
            </div>
        </div>
    `;
}


/* -------------------------
   RESET
------------------------- */

resetBtn.addEventListener("click", () => {

    form.reset();

    /*
       Restore your original defaults
       after reset().
    */

    form.Tenure_Months.value = 5;

    form.Monthly_Charges.value = 85.5;

    form.Total_Charges.value = 425;


    /* Reset result */

    probValue.textContent = "—";

    meterFill.style.width = "0%";

    riskTag.textContent =
        "Awaiting assessment";

    riskTag.className =
        "risk-tag idle";

    resultStatus.textContent =
        "Waiting";

    resultStatus.className =
        "result-status idle";

    predictionLabel.textContent =
        "—";

    summaryContract.textContent =
        "—";

    summaryTenure.textContent =
        "—";

    summaryMonthly.textContent =
        "—";

    summaryInternet.textContent =
        "—";

    signalCount.textContent =
        "0 signals";

    factorList.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">—</div>

            <div>
                <strong>No assessment yet</strong>

                <p>
                    Run the assessment to see the
                    factors associated with the prediction.
                </p>
            </div>
        </div>
    `;

});


/* -------------------------
   HELPERS
------------------------- */

function formatCurrency(value) {

    if (!Number.isFinite(value)) {
        return "—";
    }

    return `$${value.toFixed(2)}`;
}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}