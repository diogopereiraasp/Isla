let globalAudioInstance = null;

export const DEFAULT_ELEVENLABS_VOICES = [
  { id: 'random', name: '🎲 Aleatório (Sorteia uma voz por frase)' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice (Feminina, Clara & Natural)' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily (Feminina, Britânica Suave)' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George (Masculino, Caloroso)' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian (Masculino, Profundo & Claro)' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel (Masculino, Britânico)' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam (Masculino, Jovem)' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura (Feminina, Expressiva)' }
];

export const AVAILABLE_VOICE_IDS = DEFAULT_ELEVENLABS_VOICES
  .filter(v => v.id !== 'random')
  .map(v => v.id);

export function getRandomVoiceId() {
  const index = Math.floor(Math.random() * AVAILABLE_VOICE_IDS.length);
  return AVAILABLE_VOICE_IDS[index];
}

export const ELEVENLABS_KEY_STORAGE = 'isla_elevenlabs_key';

export function getStoredApiKey() {
  try {
    return localStorage.getItem(ELEVENLABS_KEY_STORAGE) || '';
  } catch (_) {
    return '';
  }
}

export function setStoredApiKey(key) {
  try {
    if (key) {
      localStorage.setItem(ELEVENLABS_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(ELEVENLABS_KEY_STORAGE);
    }
  } catch (_) {}
}

/**
 * Gera um Blob de áudio via API da ElevenLabs
 */
export async function generateElevenLabsAudioBlob(text, apiKey = '', voiceId = 'random') {
  if (!text || !text.trim()) throw new Error("Texto vazio para geração de áudio");
  
  const key = apiKey || getStoredApiKey();
  if (!key) {
    throw new Error("Chave de API ElevenLabs não informada.");
  }
  const cleanText = text.replace(/\[sound:[^\]]+\]/gi, '').replace(/\.{2,}/g, '').trim();

  const actualVoiceId = (voiceId === 'random' || !voiceId) ? getRandomVoiceId() : voiceId;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${actualVoiceId}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': key,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg'
    },
    body: JSON.stringify({
      text: cleanText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    let errMsg = `Erro ElevenLabs: ${response.status} ${response.statusText}`;
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson?.detail?.message || errMsg;
    } catch (_) {}
    throw new Error(errMsg);
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Blob([arrayBuffer], { type: 'audio/mpeg' });
}

/**
 * Reproduz exclusivamente o áudio gravado/gerado do card. Sem sintetizador de fala do sistema.
 * Compatível com iOS Safari / WebKit e PWA.
 */
export function playPhraseAudio(phrase) {
  if (!phrase || !phrase.audioBlob) {
    return Promise.resolve();
  }

  if (globalAudioInstance) {
    try {
      globalAudioInstance.pause();
      globalAudioInstance.removeAttribute('src');
      globalAudioInstance.load();
    } catch (_) {}
    globalAudioInstance = null;
  }

  return new Promise((resolve) => {
    try {
      let audioBlob = phrase.audioBlob;

      // Se for ArrayBuffer ou Uint8Array (possível após recuperação do IndexedDB)
      if (audioBlob instanceof ArrayBuffer || ArrayBuffer.isView(audioBlob)) {
        audioBlob = new Blob([audioBlob], { type: 'audio/mpeg' });
      }

      let audioUrl = '';
      let shouldRevoke = false;

      if (typeof audioBlob === 'string') {
        audioUrl = audioBlob;
      } else if (audioBlob instanceof Blob) {
        // Assegura tipo mime audio/mpeg ou audio/mp4 para Safari
        const mimeType = audioBlob.type || 'audio/mpeg';
        const properBlob = audioBlob.type ? audioBlob : new Blob([audioBlob], { type: mimeType });
        audioUrl = URL.createObjectURL(properBlob);
        shouldRevoke = true;
      } else {
        console.warn("Formato de áudio desconhecido:", audioBlob);
        return resolve();
      }

      const audio = new Audio();
      audio.preload = 'auto';
      audio.playsInline = true;
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      
      globalAudioInstance = audio;

      const cleanup = () => {
        if (shouldRevoke && audioUrl) {
          try {
            URL.revokeObjectURL(audioUrl);
          } catch (_) {}
        }
        resolve();
      };

      audio.onended = cleanup;
      audio.onerror = (err) => {
        console.warn("Erro ao reproduzir arquivo de áudio no Safari/iOS:", err, audio.error);
        cleanup();
      };

      audio.src = audioUrl;
      audio.load();

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((playErr) => {
          console.warn("Autoplay/Reprodução bloqueada pelo navegador:", playErr);
          cleanup();
        });
      }
    } catch (err) {
      console.warn("Exception ao tocar áudio:", err);
      resolve();
    }
  });
}
