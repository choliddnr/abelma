/**
 * Utility to play audio with local file fallback.
 * It looks for files in /public/audio/... and falls back to window.speechSynthesis
 */

export const playWordAudio = (text: string, path?: string) => {
  return new Promise<void>((resolve) => {
    window.speechSynthesis.cancel();

    const onEnd = () => {
      resolve();
    };

    // 1. Try playing local file if path is provided
    if (path) {
      const audio = new Audio(path);
      let fallbackTriggered = false;
      
      const triggerFallback = () => {
        if (fallbackTriggered) return;
        fallbackTriggered = true;
        console.warn(`Local audio not found at ${path}, falling back to TTS.`);
        playTTS(text, 0.9, onEnd);
      };

      audio.onended = onEnd;
      audio.onerror = triggerFallback;
      audio.play().catch(triggerFallback);
      return;
    }

    playTTS(text, 0.9, onEnd);
  });
};

export const playSyllableAudio = (syllable: string, path?: string) => {
  return new Promise<void>((resolve) => {
    window.speechSynthesis.cancel();

    const onEnd = () => {
      resolve();
    };

    if (path) {
      const audio = new Audio(path);
      let fallbackTriggered = false;

      const triggerFallback = () => {
        if (fallbackTriggered) return;
        fallbackTriggered = true;
        playTTS(syllable, 0.8, onEnd);
      };

      audio.onended = onEnd;
      audio.onerror = triggerFallback;
      audio.play().catch(triggerFallback);
      return;
    }

    playTTS(syllable, 0.8, onEnd);
  });
};

const playTTS = (text: string, rate: number, onEnd: () => void) => {
  const utterance = new SpeechSynthesisUtterance(text.toLowerCase());
  utterance.lang = "id-ID";
  utterance.rate = rate;
  utterance.onend = onEnd;
  utterance.onerror = onEnd; // resolve even on error
  window.speechSynthesis.speak(utterance);
};



export const playEffectAudio = (type: "correct" | "wrong" | "sticker") => {
  // These could be actual .mp3 files later
  const texts = {
    correct: "Pintar!",
    wrong: "Tetot, coba lagi",
    sticker: "Wah! Kamu dapat stiker baru!",
  };

  const utterance = new SpeechSynthesisUtterance(texts[type]);
  utterance.lang = "id-ID";
  window.speechSynthesis.speak(utterance);
};
