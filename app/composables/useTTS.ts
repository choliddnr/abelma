import { ref, onMounted, onUnmounted, getCurrentInstance } from "vue";
import { letters, idLetterMap } from "~/constants/alphabet";

// Global state so multiple components share the same speaking status
export const isSpeaking = ref(false);
export const isSupported = ref(
  typeof window !== "undefined" && "speechSynthesis" in window,
);

// State for Alphabet Audio
const preloadedAudio = new Map<string, HTMLAudioElement>();
let currentAudio: HTMLAudioElement | null = null;

export const cancelTTS = () => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  isSpeaking.value = false;
};

export const speakTTS = (
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    lang?: string;
    onEnd?: () => void;
  },
) => {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    if (options?.onEnd) options.onEnd();
    return;
  }

  // Always cancel ongoing speech before starting a new one
  cancelTTS();

  const utterance = new SpeechSynthesisUtterance(text);

  // Default configurations
  utterance.lang = options?.lang || "id-ID";
  utterance.rate = options?.rate || 0.9;
  utterance.pitch = options?.pitch || 1.0;

  utterance.onstart = () => {
    isSpeaking.value = true;
  };

  utterance.onend = () => {
    isSpeaking.value = false;
    if (options?.onEnd) options.onEnd();
  };

  utterance.onerror = (e) => {
    isSpeaking.value = false;
    console.error("TTS Error:", e);
    // Resolve anyway to prevent app from getting stuck
    if (options?.onEnd) options.onEnd();
  };

  window.speechSynthesis.speak(utterance);
};

// --- Word / General Audio Utilities ---

export const playWordAudio = (text: string, path?: string) => {
  return new Promise<void>((resolve) => {
    cancelTTS();

    const onEnd = () => {
      resolve();
    };

    if (path) {
      const audio = new Audio(path);
      let fallbackTriggered = false;

      const triggerFallback = () => {
        if (fallbackTriggered) return;
        fallbackTriggered = true;
        console.warn(`Local audio not found at ${path}, falling back to TTS.`);
        speakTTS(text, { rate: 0.9, onEnd });
      };

      audio.onended = onEnd;
      audio.onerror = triggerFallback;
      audio.play().catch(triggerFallback);
      return;
    }

    speakTTS(text, { rate: 0.9, onEnd });
  });
};

export const playSyllableAudio = (syllable: string, path?: string) => {
  return new Promise<void>((resolve) => {
    cancelTTS();

    const onEnd = () => {
      resolve();
    };

    if (path) {
      const audio = new Audio(path);
      let fallbackTriggered = false;

      const triggerFallback = () => {
        if (fallbackTriggered) return;
        fallbackTriggered = true;
        speakTTS(syllable, { rate: 0.8, onEnd });
      };

      audio.onended = onEnd;
      audio.onerror = triggerFallback;
      audio.play().catch(triggerFallback);
      return;
    }

    speakTTS(syllable, { rate: 0.8, onEnd });
  });
};

export const playEffectAudio = (type: "correct" | "wrong" | "sticker") => {
  const texts = {
    correct: "Pintar!",
    wrong: "Tetot, coba lagi",
    sticker: "Wah! Kamu dapat stiker baru!",
  };
  speakTTS(texts[type]);
};

// --- Alphabet Specific Audio Utilities ---

export const preloadSounds = () => {
  if (preloadedAudio.size > 0) return;
  letters.forEach((letter) => {
    const audioPath = `/Letter-${letter.toUpperCase()}.webm`;
    const audio = new Audio(audioPath);
    audio.load();
    preloadedAudio.set(letter.toUpperCase(), audio);
  });
};

export const playLetterSound = (letter: string, isLearningMode: boolean = false) => {
  cancelTTS();
  isSpeaking.value = true;

  const upperLetter = letter.toUpperCase();
  const audio = preloadedAudio.get(upperLetter);

  const fallbackToSpeech = (text: string) => {
    speakTTS(text, {
      onEnd: () => {
        isSpeaking.value = false;
      }
    });
  };

  if (audio) {
    currentAudio = audio;
    audio.pause();
    audio.currentTime = 0;

    audio.onended = () => {
      if (isLearningMode && idLetterMap[upperLetter]) {
        fallbackToSpeech(idLetterMap[upperLetter].word);
      } else {
        isSpeaking.value = false;
        if (currentAudio === audio) currentAudio = null;
      }
    };

    audio.play().catch((err) => {
      console.warn(`Failed to play preloaded audio for ${letter}:`, err);
      if (isLearningMode && idLetterMap[upperLetter]) {
        fallbackToSpeech(`Ini huruf ${letter.toLowerCase()}.`);
      } else {
        fallbackToSpeech(letter);
      }
    });
  } else {
    if (isLearningMode && idLetterMap[upperLetter]) {
      fallbackToSpeech(`Ini huruf ${letter.toLowerCase()}.`);
    } else {
      fallbackToSpeech(letter);
    }
  }
};

export const useTTS = () => {
  if (getCurrentInstance()) {
    onMounted(() => {
      isSupported.value =
        typeof window !== "undefined" && "speechSynthesis" in window;
    });

    onUnmounted(() => {
      cancelTTS();
    });
  }

  return {
    isSpeaking,
    isSupported,
    speak: speakTTS,
    cancel: cancelTTS,
    playWordAudio,
    playSyllableAudio,
    playEffectAudio,
    preloadSounds,
    playLetterSound
  };
};
