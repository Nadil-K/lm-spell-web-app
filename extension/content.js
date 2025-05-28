function sendTextForCorrection(text, callback) {
    fetch("https://cleanly-subtle-rabbit.ngrok-free.app/correct", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
    })
    .then(res => res.json())
    .then(data => callback(null, data))
    .catch(err => callback(err, null));
}

function highlightErrors(original, corrected, textarea) {
    if (original === corrected) return;

    const originalWords = original.split(/\s+/);
    const correctedWords = corrected.split(/\s+/);

    const diffWords = originalWords.filter((word, i) => word !== correctedWords[i]);
    if (!diffWords.length) return;

    textarea.style.outline = "2px dashed red";
    textarea.title = `Possible issues: ${diffWords.join(", ")}`;
}

function analyzeTextareas() {
    const textareas = document.querySelectorAll("textarea, [contenteditable='true']");

    textareas.forEach(textarea => {
        textarea.addEventListener("blur", () => {
            const text = textarea.value || textarea.innerText;
            sendTextForCorrection(text, (err, result) => {
                if (err || !result?.corrected) return;
                highlightErrors(text, result.corrected, textarea);
            });
        });
    });
}

window.addEventListener("load", analyzeTextareas);
