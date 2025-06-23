if (!document.getElementById('custom-subtitles')) {
  const subtitleContainer = document.createElement('div');
  subtitleContainer.id = 'custom-subtitles';
  document.body.appendChild(subtitleContainer);

  chrome.storage.local.get(["subtitleFontSize", "subtitleColor"], ({ subtitleFontSize, subtitleColor }) => {
    const style = document.createElement('style');
    style.textContent = `
      #custom-subtitles {
        position: fixed;
        bottom: 5%;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.7);
        color: ${subtitleColor || 'white'};
        font-size: ${subtitleFontSize || 40}px;
        padding: 10px 20px;
        border-radius: 10px;
        z-index: 9999;
        max-width: 90%;
        text-align: center;
        font-family: Arial, sans-serif;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  });
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'showSubtitle') {
    const subtitleEl = document.getElementById('custom-subtitles');
    if (subtitleEl) {
      subtitleEl.textContent = request.text;
    }
  }

  if (request.type === 'clearSubtitle') {
    const subtitleEl = document.getElementById('custom-subtitles');
    if (subtitleEl) {
      subtitleEl.remove();
    }
  }

  if (request.type === 'showStartOverlay') {
    const existing = document.getElementById('start-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'start-overlay';
    overlay.textContent = 'Traducción iniciada';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '40%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#111927e6',
      color: '#ffffff',
      fontSize: '2.8em',
      padding: '30px 60px',
      borderRadius: '20px',
      zIndex: 10000,
      fontFamily: "'Segoe UI', sans-serif",
      textAlign: 'center',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      letterSpacing: '1px',
      fontWeight: '600',
    });

    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 2500);
  }
});
