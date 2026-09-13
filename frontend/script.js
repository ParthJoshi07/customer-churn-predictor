const GAUGE_CIRCUMFERENCE = 251.2;

document.getElementById("churnForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const btn = document.getElementById("submitBtn");
    const data = {
        Gender: form.Gender.value,
        Senior_Citizen: form.Senior_Citizen.value,
        Partner: form.Partner.value,
        Dependents: form.Dependents.value,
        Tenure_Months: parseInt(form.Tenure_Months.value),
        Phone_Service: form.Phone_Service.value,
        Multiple_Lines: form.Multiple_Lines.value,
        Internet_Service: form.Internet_Service.value,
        Online_Security: form.Online_Security.value,
        Online_Backup: form.Online_Backup.value,
        Device_Protection: form.Device_Protection.value,
        Tech_Support: form.Tech_Support.value,
        Streaming_TV: form.Streaming_TV.value,
        Streaming_Movies: form.Streaming_Movies.value,
        Contract: form.Contract.value,
        Paperless_Billing: form.Paperless_Billing.value,
        Payment_Method: form.Payment_Method.value,
        Monthly_Charges: parseFloat(form.Monthly_Charges.value),
        Total_Charges: parseFloat(form.Total_Charges.value),
    };

    btn.textContent = "Running…";
    btn.disabled = true;

    try {
        const response = await fetch("http://127.0.0.1:8000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("API error");
        const result = await response.json();
        renderResult(result, data);
    } catch (err) {
        document.getElementById("probValue").textContent = "—";
        const tag = document.getElementById("riskTag");
        tag.textContent = "Could not reach the API";
        tag.className = "risk-tag high";
    } finally {
        btn.textContent = "Run assessment";
        btn.disabled = false;
    }
});

function renderResult(result, inputs) {
    const prob = result.churn_probability;
    const level = result.risk_level;

    // Gauge
    const gaugeFill = document.getElementById("gaugeFill");
    const offset = GAUGE_CIRCUMFERENCE * (1 - prob);
    gaugeFill.style.strokeDashoffset = offset;

    const colorMap = { Low: "#3FB88B", Medium: "#F2A93B", High: "#E25C5C" };
    gaugeFill.style.stroke = colorMap[level] || "#F2A93B";

    document.getElementById("probValue").textContent = (prob * 100).toFixed(1) + "%";

    // Risk tag
    const tag = document.getElementById("riskTag");
    tag.textContent = level + " risk";
    tag.className = "risk-tag " + level.toLowerCase();

    // Signal read — plain-language factors drawn from known churn drivers
    const factors = [];

    if (inputs.Contract === "Month-to-month") {
        factors.push({ label: "Month-to-month contract", dir: "raises" });
    } else {
        factors.push({ label: inputs.Contract + " contract", dir: "lowers" });
    }

    if (inputs.Tenure_Months <= 6) {
        factors.push({ label: `Short tenure (${inputs.Tenure_Months} mo.)`, dir: "raises" });
    } else if (inputs.Tenure_Months >= 24) {
        factors.push({ label: `Long tenure (${inputs.Tenure_Months} mo.)`, dir: "lowers" });
    }

    if (inputs.Monthly_Charges >= 75) {
        factors.push({ label: `High monthly bill ($${inputs.Monthly_Charges})`, dir: "raises" });
    } else if (inputs.Monthly_Charges <= 40) {
        factors.push({ label: `Low monthly bill ($${inputs.Monthly_Charges})`, dir: "lowers" });
    }

    if (inputs.Tech_Support === "No" && inputs.Internet_Service !== "No") {
        factors.push({ label: "No tech support add-on", dir: "raises" });
    }

    if (inputs.Online_Security === "Yes") {
        factors.push({ label: "Has online security add-on", dir: "lowers" });
    }

    const list = document.getElementById("factorList");
    list.innerHTML = "";
    factors.slice(0, 5).forEach(f => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${f.label}</span><span class="tag ${f.dir}">${f.dir === "raises" ? "↑ risk" : "↓ risk"}</span>`;
        list.appendChild(li);
    });
}