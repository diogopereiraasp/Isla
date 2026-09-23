let globalAudioInstance = null;

/**
 * Gera um Blob de áudio em MP3 gratuito a partir do texto em inglês usando endpoint TTS público de alta qualidade
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
    console.warn("Erro ao gerar áudio via API pública, usando fallback local:", err);
    throw err;
  }
}

/**
 * Reproduz o áudio do card (Blob persistido ou Web Speech API fallback)
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

  // 1. If custom uploaded, recorded or generated audio blob exists
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
          console.warn("Erro no blob de áudio, usando fallback:", err);
          speakText(phrase.target, options).then(resolve).catch(reject);
        };

        audio.play().catch((playErr) => {
          console.warn("Play bloqueado:", playErr);
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
      console.warn("Navegador não suporta Web Speech Synthesis");
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
