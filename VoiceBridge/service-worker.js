let isRecording = false;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    if (msg.type === 'get-languages') {
      const result = await chrome.storage.local.get(['fromLang', 'toLang']);
      sendResponse({
        fromLang: result.fromLang || 'en',
        toLang: result.toLang || 'es'
      });
      return;
    }

    if (msg.type === 'subtitle') {
      const { isRecording } = await chrome.storage.local.get('isRecording');
      if (!isRecording) return;

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      chrome.tabs.sendMessage(tab.id, {
        type: 'showSubtitle',
        text: msg.text
      });
      return;
    }

    if (msg.type === 'clear-subtitle') {
      chrome.tabs.sendMessage(tab.id, {
        type: 'clearSubtitle'
      });
      return;
    }

    if (msg.type === 'get-recording-status') {
      const result = await chrome.storage.local.get('isRecording');
      sendResponse({ isRecording: result.isRecording === true });
      return;
    }

    if (msg.type === 'toggle-recording') {
      const contexts = await chrome.runtime.getContexts({});
      const offscreenDoc = contexts.find(c => c.contextType === 'OFFSCREEN_DOCUMENT');

      if (!offscreenDoc) {
        await chrome.offscreen.createDocument({
          url: 'offscreen.html',
          reasons: ['USER_MEDIA'],
          justification: 'Captura de audio para traducir'
        });
      }

      if (!isRecording) {
        const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });

        chrome.runtime.sendMessage({
          type: 'start-recording',
          target: 'offscreen',
          streamId
        });

        // Mostrar mensaje de inicio
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });

        chrome.tabs.sendMessage(tab.id, {
          type: 'showStartOverlay'
        });

        chrome.action.setIcon({ path: 'icons/recording.png' });
        isRecording = true;
        await chrome.storage.local.set({ isRecording: true });
        sendResponse({ isRecording: true });

      } else {
        chrome.runtime.sendMessage({
          type: 'stop-recording',
          target: 'offscreen'
        });

        chrome.action.setIcon({ path: 'icons/not-recording.png' });
        isRecording = false;
        await chrome.storage.local.set({ isRecording: false });
        sendResponse({ isRecording: false });
      }
    }
  })();

  return true;
});
