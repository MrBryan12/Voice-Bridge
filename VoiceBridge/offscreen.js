let audioContext;
let processor;
let source;
let stream;
let isRecording = false;

let accumulated = [];
let accumulatedSamples = 0;
const targetChunkSamples = 48000 * 3; // 1 segundo de audio a 48kHz

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.target !== 'offscreen') return;

  if (msg.type === 'start-recording') {
    if (isRecording) return;
    isRecording = true;

    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: msg.streamId
        }
      },
      video: false
    });

    audioContext = new AudioContext();
    source = audioContext.createMediaStreamSource(stream);
    source.connect(audioContext.destination);
    processor = audioContext.createScriptProcessor(4096, 1, 1); // ~90ms

    processor.onaudioprocess = (event) => {
      const pcm = event.inputBuffer.getChannelData(0);
      accumulated.push(Float32Array.from(pcm));
      accumulatedSamples += pcm.length;

      if (accumulatedSamples >= targetChunkSamples) {
        const merged = new Float32Array(accumulatedSamples);
        let offset = 0;
        for (const chunk of accumulated) {
          merged.set(chunk, offset);
          offset += chunk.length;
        }

        const wav = encodeWAV(merged, audioContext.sampleRate);
        sendToApi(wav);

        accumulated = [];
        accumulatedSamples = 0;
      }
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
    window.location.hash = 'recording';
  }

  if (msg.type === 'stop-recording') {
    isRecording = false;

    processor?.disconnect();
    source?.disconnect();
    stream?.getTracks().forEach(t => t.stop());
    audioContext?.close();

    accumulated = [];
    accumulatedSamples = 0;

    window.location.hash = '';
    chrome.runtime.sendMessage({
      type: 'clear-subtitle'
    });
  }
});

function sendToApi(wavBuffer) {
  chrome.runtime.sendMessage({ type: 'get-languages' }, ({ fromLang, toLang }) => {
    fetch('http://127.0.0.1:5000/translate', {
      method: 'POST',
      body: wavBuffer,
      headers: {
        'Content-Type': 'audio/wav',
        'from': fromLang || 'en',
        'to': toLang || 'es'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.translated) {
          chrome.runtime.sendMessage({
            type: 'subtitle',
            text: data.translated
          });
        }
      })
      .catch(err => console.error('Error al enviar:', err));
  });
}


// Codifica Float32Array a WAV (PCM 16-bit mono)
function encodeWAV(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true);  // AudioFormat (PCM)
  view.setUint16(22, 1, true);  // NumChannels (mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true);  // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s * 0x7FFF, true);
  }

  return buffer;
}
