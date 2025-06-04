const APP_URL = "https://cleanly-subtle-rabbit.ngrok-free.app";

async function init(language, model) {
    const url = `${APP_URL}/init`;
    const payload = { language, model };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Failed to initialize: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Model initialized:", data);
    } catch (err) {
        console.error("Error initializing model:", err.message);
    }
}

chrome.runtime.onStartup.addListener(() => {
    console.log("Browser started. Initializing model...");
    init("sinhala", "mt5");
});

// Also init when extension is installed or reloaded
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed. Initializing model...");
    init("sinhala", "mt5");
});
