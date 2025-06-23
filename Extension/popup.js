document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const fromLangSelect = document.getElementById("fromLang");
  const toLangSelect = document.getElementById("toLang");

  const fontSizeSlider = document.getElementById("fontSizeSlider");
  const fontSizeValue = document.getElementById("fontSizeValue");
  const colorOptions = document.querySelectorAll(".color-option");
  const colorSelect = document.getElementById("colorSelect");

  const settingsIcon = document.getElementById("settingsIcon");
  const settingsModal = document.getElementById("settingsModal");
  const closeModalBtn = document.getElementById("closeModalBtn");

  chrome.storage.local.get(["fromLang", "toLang", "subtitleFontSize", "subtitleColor"], (result) => {
    if (result.fromLang) fromLangSelect.value = result.fromLang;
    if (result.toLang) toLangSelect.value = result.toLang;
    if (result.subtitleFontSize) {
      fontSizeSlider.value = result.subtitleFontSize;
      fontSizeValue.textContent = result.subtitleFontSize;
    }
    if (result.subtitleColor) {
      colorSelect.value = result.subtitleColor;
      setSelectedColor(result.subtitleColor);
    }
    applySubtitleStyle(fontSizeSlider.value, colorSelect.value);
  });

  // Actualiza texto y aplica tamaño de fuente al mover el slider
  fontSizeSlider.addEventListener("input", () => {
    const size = fontSizeSlider.value;
    fontSizeValue.textContent = size;
    chrome.storage.local.set({ subtitleFontSize: size });
    applySubtitleStyle(size, colorSelect.value);
  });

  // Selección de color automática
  colorOptions.forEach(option => {
    option.addEventListener("click", () => {
      const selectedColor = option.dataset.color;
      colorSelect.value = selectedColor;
      setSelectedColor(selectedColor);
      chrome.storage.local.set({ subtitleColor: selectedColor });
      applySubtitleStyle(fontSizeSlider.value, selectedColor);
    });
  });

  function setSelectedColor(color) {
    colorOptions.forEach(opt => {
      opt.classList.toggle("selected", opt.dataset.color === color);
    });
  }

  // Abrir y cerrar modal
  settingsIcon.addEventListener("click", () => {
    settingsModal.style.display = "flex";
  });
  closeModalBtn.addEventListener("click", () => {
    settingsModal.style.display = "none";
  });

  // Botón de grabar / detener
  chrome.runtime.sendMessage({ type: "get-recording-status" }, (response) => {
    updateButton(response?.isRecording);
  });

  startBtn.addEventListener("click", () => {
    const fromLang = fromLangSelect.value;
    const toLang = toLangSelect.value;
    chrome.storage.local.set({ fromLang, toLang });
    chrome.runtime.sendMessage({ type: "toggle-recording" }, (response) => {
      updateButton(response?.isRecording);
    });
  });

  function updateButton(isRecording) {
    if (isRecording) {
      startBtn.textContent = "Detener";
      startBtn.style.backgroundColor = "#c0392b";
    } else {
      startBtn.textContent = "Comenzar";
      startBtn.style.backgroundColor = "#5e667f";
    }
  }

  // Aplica el estilo en la pestaña activa
  function applySubtitleStyle(fontSize, color) {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (fontSize, color) => {
            const el = document.getElementById("custom-subtitles");
            if (el) {
              el.style.fontSize = `${fontSize}px`;
              el.style.color = color;
            }
          },
          args: [fontSize, color],
        });
      }
    });
  }
});
