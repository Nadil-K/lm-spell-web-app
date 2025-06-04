const BACKEND_URL = "https://cleanly-subtle-rabbit.ngrok-free.app/correct";

// --- Utility: Escape and sentence split ---

function escapeHTML(s) {
  return (s + "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function splitIntoSentences(text) {
  // Simple sentence split (improve as needed for more robust NLP)
  return text.match(/[^\.!\?]+[\.!\?]+|[^\.!\?]+$/g) || [];
}

// --- Correction API ---

function sendText(text) {
  return fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  }).then(res => res.json());
}

function highlightContent(text, errors) {
  if (!errors || errors.length === 0) return escapeHTML(text);
  let html = "";
  let last = 0;
  errors.forEach(err => {
    html += escapeHTML(text.slice(last, err.start));
    html += `<span class="lmspell-error" data-suggestion="${escapeHTML(err.suggestion)}" data-word="${escapeHTML(err.word)}">${escapeHTML(text.slice(err.start, err.end))}</span>`;
    last = err.end;
  });
  html += escapeHTML(text.slice(last));
  return html;
}

// --- Hide original textarea, keep it hidden even if the app re-shows it ---

function hideTextarea(textarea) {
  textarea.style.display = 'none';
}
function observeAndHide(textarea) {
  hideTextarea(textarea);
  if (textarea._hideObserver) return;
  const observer = new MutationObserver(() => {
    if (textarea.style.display !== 'none') {
      textarea.style.display = 'none';
    }
  });
  observer.observe(textarea, { attributes: true, attributeFilter: ['style', 'class'] });
  textarea._hideObserver = observer;
}

// --- Enhance existing div[contenteditable="true"] (for simple editors) ---

function createContentEditableEnhancer(editor) {
  if (editor.getAttribute('data-enhanced') === 'true') return;
  editor.setAttribute('data-enhanced', 'true');
  editor.classList.add('extension-spell-editor');
  editor.style.outline = 'none';

  // Track state for background correction
  editor._lmspell_lastSentText = editor.innerText;
  editor._lmspell_lastSentSentences = splitIntoSentences(editor.innerText);

  let lastPlain = "";

  function highlightAndSpellcheck() {
    const plain = editor.innerText;
    if (plain.trim() === lastPlain.trim()) return;
    lastPlain = plain;
    if (plain.trim().length === 0) return;
    sendText(plain).then(res => {
      let errors = [];
      if (res.errors) {
        errors = res.errors;
      } else if (res.corrected && res.corrected !== plain) {
        const orig = plain.split(" ");
        const cor = res.corrected.split(" ");
        let idx = 0;
        for (let i = 0; i < Math.min(orig.length, cor.length); i++) {
          if (orig[i] !== cor[i]) {
            let start = plain.indexOf(orig[i], idx);
            errors.push({
              start: start,
              end: start + orig[i].length,
              suggestion: cor[i],
              word: orig[i]
            });
            idx = start + orig[i].length;
          } else {
            idx += orig[i].length + 1;
          }
        }
      }
      const selection = window.getSelection();
      const range = selection.rangeCount ? selection.getRangeAt(0) : null;
      editor.innerHTML = highlightContent(plain, errors);
      if (editor.childNodes.length && range) {
        selection.selectAllChildren(editor);
        selection.collapseToEnd();
      }
      // Update tracking for 10s background logic
      editor._lmspell_lastSentText = editor.innerText;
      editor._lmspell_lastSentSentences = splitIntoSentences(editor.innerText);
    });
  }

  // INSTANT spellcheck on edit
  editor.addEventListener('input', highlightAndSpellcheck);

  // Correction popup logic
  editor.addEventListener('click', function(e) {
    if (e.target.classList.contains('lmspell-error')) {
      const suggestion = e.target.dataset.suggestion;
      const rect = e.target.getBoundingClientRect();
      showPopup(rect.left + window.scrollX, rect.bottom + window.scrollY, suggestion, () => {
        e.target.outerHTML = escapeHTML(suggestion);
      });
      e.stopPropagation();
    } else {
      removePopup();
    }
  });
  document.addEventListener('click', removePopup);
}

// --- Enhance textarea as contenteditable spell editor ---

function createContentEditableFromTextarea(textarea) {
  if (textarea.getAttribute("data-enhanced") === "true") return;
  textarea.setAttribute("data-enhanced", "true");

  // Style
  const style = window.getComputedStyle(textarea);
  const editor = document.createElement('div');
  editor.contentEditable = "true";
  editor.className = "extension-spell-editor";
  editor.style.minHeight = style.height;
  editor.style.width = style.width;
  editor.style.font = style.font;
  editor.style.fontSize = style.fontSize;
  editor.style.fontFamily = style.fontFamily;
  editor.style.lineHeight = style.lineHeight;
  editor.style.padding = style.padding || "8px";
  editor.style.margin = style.margin;
  editor.style.border = style.border || "None";
  editor.style.borderRadius = style.borderRadius || "8px";
  editor.style.boxSizing = style.boxSizing || "border-box";
  editor.style.background = style.backgroundColor || "#fff";
  editor.style.color = style.color || "#222";
  editor.style.outline = "none";
  editor.style.resize = style.resize;
  editor.style.overflowY = style.overflowY;
  editor.style.overflowX = style.overflowX;

  if (textarea.placeholder) {
    editor.dataset.placeholder = textarea.placeholder;
    editor.innerHTML = `<span style="color:#aaa;">${escapeHTML(textarea.placeholder)}</span>`;
  } else {
    editor.innerText = textarea.value || '';
  }

  textarea.parentNode.insertBefore(editor, textarea.nextSibling);
  observeAndHide(textarea);

  // Track state for background correction
  editor._lmspell_lastSentText = editor.innerText;
  editor._lmspell_lastSentSentences = splitIntoSentences(editor.innerText);

  function syncToTextarea() {
    if (textarea.value !== editor.innerText) {
      textarea.value = editor.innerText;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function checkPlaceholder() {
    if (!editor.innerText.trim() && editor.dataset.placeholder) {
      editor.innerHTML = `<span style="color:#aaa;">${escapeHTML(editor.dataset.placeholder)}</span>`;
    }
  }

  editor.addEventListener('focus', () => {
    if (editor.dataset.placeholder && editor.innerText.trim() === editor.dataset.placeholder) {
      editor.innerHTML = '';
    }
    editor.style.borderColor = "#4588c8";
  });

  editor.addEventListener('blur', () => {
    syncToTextarea();
    editor.style.borderColor = "#bbb";
  });

  let lastPlain = "";
  function highlightAndSpellcheck() {
    if (editor.dataset.placeholder && editor.innerText === editor.dataset.placeholder) {
      editor.innerHTML = '';
    }
    const plain = editor.innerText;
    syncToTextarea();
    if (plain.trim() === lastPlain.trim()) {
      return;
    }
    lastPlain = plain;
    if (plain.trim().length > 0) {
      sendText(plain)
        .then(res => {
          let errors = [];
          if (res.errors) {
            errors = res.errors;
          } else if (res.corrected && res.corrected !== plain) {
            const orig = plain.split(" ");
            const cor = res.corrected.split(" ");
            let idx = 0;
            for (let i = 0; i < Math.min(orig.length, cor.length); i++) {
              if (orig[i] !== cor[i]) {
                let start = plain.indexOf(orig[i], idx);
                errors.push({
                  start: start,
                  end: start + orig[i].length,
                  suggestion: cor[i],
                  word: orig[i]
                });
                idx = start + orig[i].length;
              } else {
                idx += orig[i].length + 1;
              }
            }
          }
          const selection = window.getSelection();
          const range = selection.rangeCount ? selection.getRangeAt(0) : null;
          editor.innerHTML = highlightContent(plain, errors);
          if (editor.childNodes.length && range) {
            selection.selectAllChildren(editor);
            selection.collapseToEnd();
          }
          checkPlaceholder();
          // Update tracking for 10s background logic
          editor._lmspell_lastSentText = editor.innerText;
          editor._lmspell_lastSentSentences = splitIntoSentences(editor.innerText);
        })
        .catch(err => {
          console.error("Spell correction error:", err);
        });
    } else {
      checkPlaceholder();
    }
  }

  // INSTANT SYNC: on all possible edit events
  function instantSync() { syncToTextarea(); }
  editor.addEventListener('input', e => { highlightAndSpellcheck(); instantSync(); });
  editor.addEventListener('keyup', instantSync);
  editor.addEventListener('paste', instantSync);
  editor.addEventListener('cut', instantSync);
  editor.addEventListener('compositionend', instantSync);

  editor.addEventListener('click', function(e) {
    if (e.target.classList.contains('lmspell-error')) {
      const suggestion = e.target.dataset.suggestion;
      const word = e.target.dataset.word;
      const rect = e.target.getBoundingClientRect();
      showPopup(rect.left + window.scrollX, rect.bottom + window.scrollY, suggestion, () => {
        e.target.outerHTML = escapeHTML(suggestion);
        syncToTextarea();
      });
      e.stopPropagation();
    } else {
      removePopup();
    }
  });

  document.addEventListener('click', removePopup);

  if (textarea.value && (!textarea.placeholder || textarea.value !== textarea.placeholder)) {
    editor.innerText = textarea.value;
  }
}

// --- Enhance all editors currently present (at DOM load) ---

function enhanceAllEditors() {
  document.querySelectorAll('textarea:not([readonly]):not([disabled]):not([data-enhanced])')
    .forEach(createContentEditableFromTextarea);

  document.querySelectorAll('div[contenteditable="true"]:not([data-enhanced])')
    .forEach(createContentEditableEnhancer);
}

// --- Robust: enhance at load, whether DOM is ready or not ---
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enhanceAllEditors);
} else {
  enhanceAllEditors();
}

// --- MutationObserver: Enhance new editors as they appear instantly ---
function enhanceIfNeeded(node) {
  if (node.nodeType !== 1) return;
  if (node.matches && node.matches('textarea:not([readonly]):not([disabled]):not([data-enhanced])'))
    createContentEditableFromTextarea(node);
  if (node.matches && node.matches('div[contenteditable="true"]:not([data-enhanced])'))
    createContentEditableEnhancer(node);
  if (node.querySelectorAll) {
    node.querySelectorAll('textarea:not([readonly]):not([disabled]):not([data-enhanced])')
      .forEach(createContentEditableFromTextarea);
    node.querySelectorAll('div[contenteditable="true"]:not([data-enhanced])')
      .forEach(createContentEditableEnhancer);
  }
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(enhanceIfNeeded);
  });
});

observer.observe(document.body, { childList: true, subtree: true });

// --- Popup helpers ---

function showPopup(x, y, suggestion, onReplace) {
  removePopup();
  const popup = document.createElement('div');
  popup.className = 'spell-popup';
  Object.assign(popup.style, {
    position: 'absolute',
    left: x + 'px',
    top: y + 'px',
    zIndex: 10000,
    padding: '6px 12px',
    cursor: 'pointer'
  });
  popup.textContent = `${suggestion}`;
  popup.onclick = () => {
    onReplace();
    removePopup();
  };
  document.body.appendChild(popup);
}

function removePopup() {
  document.querySelectorAll('.spell-popup').forEach(p => p.remove());
}

// --- 10-second background correction requests for only changed sentences ---

setInterval(() => {
  document.querySelectorAll('.extension-spell-editor[data-enhanced="true"]').forEach(editor => {
    const currentText = editor.innerText;
    if (editor._lmspell_lastSentText !== currentText) {
      const currentSentences = splitIntoSentences(currentText);
      const lastSent = editor._lmspell_lastSentSentences || [];

      // Find sentences that are new or changed, along with their index
      const changed = [];
      for (let i = 0; i < currentSentences.length; ++i) {
        if (currentSentences[i] !== lastSent[i]) {
          changed.push({ sentence: currentSentences[i], idx: i });
        }
      }

      if (changed.length > 0) {
        // Highlight each changed sentence in place
        changed.forEach(({ sentence, idx }) => {
          sendText(sentence).then(res => {
            let errors = [];
            // Detect errors in just this sentence
            if (res.errors) {
              errors = res.errors;
            } else if (res.corrected && res.corrected !== sentence) {
              const orig = sentence.split(" ");
              const cor = res.corrected.split(" ");
              let localIdx = 0;
              for (let i = 0; i < Math.min(orig.length, cor.length); i++) {
                if (orig[i] !== cor[i]) {
                  let start = sentence.indexOf(orig[i], localIdx);
                  errors.push({
                    start: start,
                    end: start + orig[i].length,
                    suggestion: cor[i],
                    word: orig[i]
                  });
                  localIdx = start + orig[i].length;
                } else {
                  localIdx += orig[i].length + 1;
                }
              }
            }
            // Now highlight just this sentence
            const highlightedSentence = highlightContent(sentence, errors);

            // Split editor content into sentences (with regex, as above)
            const rawSentences = splitIntoSentences(editor.innerText);
            let rebuiltHTML = '';
            for (let j = 0; j < rawSentences.length; ++j) {
              if (j > 0) rebuiltHTML += ' '; // preserve spacing between sentences
              if (j === idx) {
                rebuiltHTML += highlightedSentence;
              } else {
                // Keep existing sentence, escape HTML
                rebuiltHTML += escapeHTML(rawSentences[j] || '');
              }
            }

            editor.innerHTML = rebuiltHTML;
          });
        });
      }

      // Update tracking
      editor._lmspell_lastSentText = currentText;
      editor._lmspell_lastSentSentences = currentSentences;
    }
  });
}, 10000);
