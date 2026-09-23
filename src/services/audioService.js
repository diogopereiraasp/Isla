let globalAudioInstance = null;

export const DEFAULT_ELEVENLABS_VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Americana, Calma & Natural)' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (Americana, Expressiva)' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (Americano, Masculino Jovem)' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh (Americano, Profundo)' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel (Britânico, Noticiário)' }
];

/**
 * Gera um Blob de áudio via API da ElevenLabs
 */
export async function generateElevenLabsAudioBlob(text, apiKey = '', voiceId = '21m00Tcm4TlvDq8ikWAM') {
  if (!text || !text.trim()) throw new Error("Texto vazio para geração de áudio");
  
  const key = apiKey || localStorage.getItem('isla_elevenlabs_key') || 'sk_14b2355cb1e6595503cd0e2f2b9a2996f2e97148084497c1';
  const cleanText = text.replace(/\[sound:[^\]]+\]/gi, '').replace(/\.{2,}/g, '').trim();

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  
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
 */
export function playPhraseAudio(phrase) {
  if (!phrase || !phrase.audioBlob) {
    return Promise.resolve();
  }

  if (globalAudioInstance) {
    try {
      globalAudioInstance.pause();
      globalAudioInstance.currentTime = 0;
    } catch (_) {}
    globalAudioInstance = null;
  }

  return new Promise((resolve) => {
    try {
      const audioUrl = typeof phrase.audioBlob === 'string' 
        ? phrase.audioBlob 
        : URL.createObjectURL(phrase.audioBlob);

      const audio = new Audio();
      globalAudioInstance = audio;
      audio.src = audioUrl;

      audio.onended = () => resolve();
      audio.onerror = (err) => {
        console.warn("Erro ao reproduzir arquivo de áudio:", err);
        resolve();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((playErr) => {
          console.warn("Autoplay bloqueado:", playErr);
          resolve();
        });
      }
    } catch (err) {
      console.warn("Exception ao tocar áudio:", err);
      resolve();
    }
  });
}
