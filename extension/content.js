const BACKEND_URL = "https://cleanly-subtle-rabbit.ngrok-free.app/correct";

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

function escapeHTML(s) {
  return (s + "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

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

// Enhance an existing div[contenteditable="true"]
function createContentEditableEnhancer(editor) {
  if (editor.getAttribute('data-enhanced') === 'true') return;
  editor.setAttribute('data-enhanced', 'true');
  editor.classList.add('extension-spell-editor');
  editor.style.outline = 'none';

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
    });
  }

  // Trigger spellcheck/highlight on all edit events
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

// Enhance a textarea into a contenteditable spell editor
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
  editor.style.border = style.border || "1px solid #bbb";
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
        })
        .catch(err => {
          console.error("Spell correction error:", err);
        });
    } else {
      checkPlaceholder();
    }
  }

  // --- INSTANT SYNC: on all possible edit events ---
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

// Enhance all editors currently present (at DOM load)
function enhanceAllEditors() {
  document.querySelectorAll('textarea:not([readonly]):not([disabled]):not([data-enhanced])')
    .forEach(createContentEditableFromTextarea);

  document.querySelectorAll('div[contenteditable="true"]:not([data-enhanced])')
    .forEach(createContentEditableEnhancer);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enhanceAllEditors);
} else {
  enhanceAllEditors();
}

// --- MutationObserver: Enhance as soon as any new editor appears ---
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
