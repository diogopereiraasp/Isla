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
  const cleanText = text.replace(/\.{2,}/g, '').trim();

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
    const errJson = await response.json().catch(() => null);
    throw new Error(errJson?.detail?.message || `Erro ElevenLabs: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();
  return new Blob([blob], { type: 'audio/mpeg' });
}

/**
 * Fallback de geração pública TTS caso a chave falhe ou acabe a cota
 */
export async function generateTTSAudioBlob(text, lang = 'en') {
  if (!text || !text.trim()) throw new Error("Texto vazio");

  const cleanText = encodeURIComponent(text.trim());
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${cleanText}&tl=${lang}&client=tw-ob`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Falha ao buscar áudio TTS");
    const blob = await res.blob();
    return new Blob([blob], { type: 'audio/mp3' });
  } catch (err) {
    console.warn("Erro ao gerar áudio via API pública:", err);
    throw err;
  }
}

/**
 * Reproduz o áudio do card (Blob local persistido no IndexedDB ou Web Speech fallback)
 */
export function playPhraseAudio(phrase, options = { rate: 0.95, lang: 'en-US' }) {
  if (!phrase) return Promise.reject(new Error("Nenhuma frase fornecida"));

  if (globalAudioInstance) {
    globalAudioInstance.pause();
    globalAudioInstance = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  // 1. If custom uploaded, recorded or ElevenLabs generated audio blob exists
  if (phrase.audioBlob) {
    return new Promise((resolve, reject) => {
      try {
        const audioUrl = typeof phrase.audioBlob === 'string' 
          ? phrase.audioBlob 
          : URL.createObjectURL(phrase.audioBlob);

        const audio = new Audio(audioUrl);
        globalAudioInstance = audio;

        audio.onended = () => resolve();
        audio.onerror = (err) => {
          console.warn("Erro no blob de áudio local, usando sintetizador:", err);
          speakText(phrase.target, options).then(resolve).catch(reject);
        };

        audio.play().catch((playErr) => {
          console.warn("Play bloqueado pelo navegador:", playErr);
          speakText(phrase.target, options).then(resolve).catch(reject);
        });
      } catch (err) {
        speakText(phrase.target, options).then(resolve).catch(reject);
      }
    });
  }

  // 2. Fallback: Web Speech Synthesis API
  return speakText(phrase.target, options);
}

export function speakText(text, options = { rate: 0.95, lang: 'en-US' }) {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang || 'en-US';
    utterance.rate = options.rate || 0.95;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}
