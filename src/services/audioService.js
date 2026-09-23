let globalAudioInstance = null;

export function playPhraseAudio(phrase, options = { rate: 0.95, lang: 'en-US' }) {
  if (!phrase) return Promise.reject(new Error("Nenhuma frase fornecida"));

  // Stop previous audio if playing
  if (globalAudioInstance) {
    globalAudioInstance.pause();
    globalAudioInstance = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  // 1. If custom uploaded or recorded audio blob exists
  if (phrase.audioBlob) {
    return new Promise((resolve, reject) => {
      try {
        const audioUrl = typeof phrase.audioBlob === 'string' 
          ? phrase.audioBlob 
          : URL.createObjectURL(phrase.audioBlob);

        const audio = new Audio(audioUrl);
        globalAudioInstance = audio;

        audio.onended = () => {
          resolve();
        };

        audio.onerror = (err) => {
          console.warn("Erro ao tocar áudio customizado, usando sintetizador nativo:", err);
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
      console.warn("Navegador não suporta Web Speech Synthesis");
      resolve();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang || 'en-US';
    utterance.rate = options.rate || 0.95;

    // Pick best English voice if available
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
