const BACKEND_URL = "https://cleanly-subtle-rabbit.ngrok-free.app/correct";

function sendText(text) {
  return fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  }).then(res => res.json());
}

function createOverlay(textarea) {
  const overlay = document.createElement("div");
  overlay.className = "overlay-highlight";

  const style = window.getComputedStyle(textarea);
  ["top", "left", "width", "height"].forEach(prop => {
    overlay.style[prop] = style[prop];
  });

  overlay.style.font = style.font;
  overlay.style.padding = style.padding;
  overlay.style.border = style.border;
  overlay.style.overflow = "auto";
  overlay.style.backgroundColor = "transparent";

  const rect = textarea.getBoundingClientRect();
  overlay.style.position = "absolute";
  overlay.style.left = `${rect.left + window.scrollX}px`;
  overlay.style.top = `${rect.top + window.scrollY}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;

  document.body.appendChild(overlay);
  return overlay;
}

function diffAndHighlight(original, corrected) {
  const originalWords = original.split(/\s+/);
  const correctedWords = corrected.split(/\s+/);

  return originalWords.map((word, i) => {
    if (word !== correctedWords[i]) {
      return `<span class="error">${word}</span>`;
    }
    return word;
  }).join(" ");
}

function setupOverlaySpellcheck(textarea) {
  const overlay = createOverlay(textarea);

  function updateOverlay() {
    const text = textarea.value;
    sendText(text)
      .then(res => {
        if (!res?.corrected) return;
        overlay.innerHTML = diffAndHighlight(text, res.corrected);
        syncOverlayScroll();
      })
      .catch(err => console.error("Spellcheck error:", err));
  }

  function syncOverlayPosition() {
    const rect = textarea.getBoundingClientRect();
    overlay.style.left = `${rect.left + window.scrollX}px`;
    overlay.style.top = `${rect.top + window.scrollY}px`;
  }

  function syncOverlayScroll() {
    overlay.scrollTop = textarea.scrollTop;
    overlay.scrollLeft = textarea.scrollLeft;
  }

  textarea.addEventListener("input", updateOverlay);
  textarea.addEventListener("scroll", syncOverlayScroll);
  window.addEventListener("scroll", syncOverlayPosition);
  window.addEventListener("resize", syncOverlayPosition);

  updateOverlay();
}

function init() {
  const textareas = document.querySelectorAll("textarea");
  textareas.forEach(setupOverlaySpellcheck);
}

window.addEventListener("load", init);
