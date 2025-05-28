const BACKEND_URL = "https://cleanly-subtle-rabbit.ngrok-free.app/correct";

function sendText(text) {
  return fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  }).then(res => res.json());
}

function createOverlay(textarea, wrapper) {
  const overlay = document.createElement("div");
  overlay.className = "overlay-highlight";

  // Set overlay styles to match textarea
  const style = window.getComputedStyle(textarea);
  overlay.style.position = "absolute";
  overlay.style.left = "0";
  overlay.style.top = "0";
  overlay.style.width = `${textarea.offsetWidth}px`;
  overlay.style.height = `${textarea.offsetHeight}px`;
  overlay.style.font = style.font;
  overlay.style.padding = style.padding;
  overlay.style.border = style.border;
  overlay.style.lineHeight = style.lineHeight;
  overlay.style.whiteSpace = "pre-wrap";
  overlay.style.backgroundColor = "transparent";
  overlay.style.color = "transparent";
  overlay.style.pointerEvents = "none";
  overlay.style.zIndex = 2;
  overlay.style.overflow = "hidden";

  // Add overlay to wrapper
  wrapper.appendChild(overlay);
  return overlay;
}

function wrapTextarea(textarea) {
  // Create a wrapper div with relative positioning
  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.display = "inline-block";
  wrapper.style.width = `${textarea.offsetWidth}px`;
  wrapper.style.height = `${textarea.offsetHeight}px`;

  // Insert wrapper before textarea and move textarea inside
  textarea.parentNode.insertBefore(wrapper, textarea);
  wrapper.appendChild(textarea);

  // Set textarea styles for overlay stacking
  textarea.style.position = "relative";
  textarea.style.zIndex = 3;
  textarea.style.background = "transparent";

  return wrapper;
}

function diffAndHighlight(original, corrected) {
  const originalWords = original.split(/\s+/);
  const correctedWords = corrected.split(/\s+/);

  return originalWords.map((word, i) => {
    if (word !== correctedWords[i]) {
      const escapedOriginal = word.replace(/"/g, '&quot;');
      const escapedCorrected = correctedWords[i]?.replace(/"/g, '&quot;') || '';
      return `<span class="error" data-original="${escapedOriginal}" data-corrected="${escapedCorrected}">${escapedOriginal}</span>`;
    }
    return word;
  }).join(" ");
}

function setupOverlaySpellcheck(textarea) {
  const wrapper = wrapTextarea(textarea);
  const overlay = createOverlay(textarea, wrapper);

  // Allow click-through inside the overlay
  overlay.style.pointerEvents = "auto";

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

  function syncOverlayScroll() {
    overlay.scrollTop = textarea.scrollTop;
    overlay.scrollLeft = textarea.scrollLeft;
  }

  function syncOverlaySize() {
    overlay.style.width = `${textarea.offsetWidth}px`;
    overlay.style.height = `${textarea.offsetHeight}px`;
    wrapper.style.width = `${textarea.offsetWidth}px`;
    wrapper.style.height = `${textarea.offsetHeight}px`;
  }

  textarea.addEventListener("input", updateOverlay);
  textarea.addEventListener("scroll", syncOverlayScroll);
  window.addEventListener("resize", syncOverlaySize);

  // Initial sync
  syncOverlaySize();
  updateOverlay();
}

function showCorrectionPopup(target, correctedWord) {
  document.querySelectorAll(".correction-popup").forEach(el => el.remove());

  const rect = target.getBoundingClientRect();

  const popup = document.createElement("div");
  popup.className = "correction-popup";
  popup.textContent = `Suggestion: ${correctedWord}`;

  popup.style.position = "absolute";
  popup.style.background = "#fff";
  popup.style.border = "1px solid #aaa";
  popup.style.padding = "5px 8px";
  popup.style.borderRadius = "4px";
  popup.style.fontSize = "12px";
  popup.style.zIndex = "10000";
  popup.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  popup.style.top = `${rect.bottom + window.scrollY + 5}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;

  document.body.appendChild(popup);

  setTimeout(() => popup.remove(), 3000);
  document.addEventListener("click", () => popup.remove(), { once: true });
}

function init() {
  const textareas = document.querySelectorAll("textarea");
  textareas.forEach(setupOverlaySpellcheck);
}

window.addEventListener("load", init);