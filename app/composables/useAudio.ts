import { ref, onMounted, onUnmounted, getCurrentInstance } from "vue";
import type { AudioSequence } from "~/types";
import { letters, idLetterMap } from "~/constants/alphabet";
import { AUDIO_FILES } from "~/constants/audio";

// Global state so multiple components share the same speaking status
export const isSpeaking = ref(false);
export const isSupported = ref(
  typeof window !== "undefined" && "speechSynthesis" in window,
);

// State for Audio Elements
const preloadedAudio = new Map<string, HTMLAudioElement>();
let currentAudio: HTMLAudioElement | null = null;

/**
 * Stops both TTS and current audio element
 */
export const stopAllAudio = (keepSpeakingState = false) => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if (!keepSpeakingState) {
    isSpeaking.value = false;
  }
};

/**
 * Basic TTS functionality
 */
export const speakTTS = (
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    lang?: string;
    onEnd?: () => void;
  },
): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      if (options?.onEnd) options.onEnd();
      resolve();
      return;
    }

    // Always cancel ongoing speech before starting a new one
    stopAllAudio(true);
    isSpeaking.value = true;

    if (!text) {
      isSpeaking.value = false;
      if (options?.onEnd) options.onEnd();
      resolve();
      return;
    }

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
      resolve();
    };

    utterance.onerror = (e) => {
      isSpeaking.value = false;
      console.error("TTS Error:", e);
      if (options?.onEnd) options.onEnd();
      resolve(); // Resolve anyway to prevent app from getting stuck
    };

    window.speechSynthesis.speak(utterance);
  });
};

/**
 * Plays a single audio file based on a key from AUDIO_FILES or a path.
 */
export const playAudio = (keyOrPath: string, options?: { fallbackText?: string }): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    stopAllAudio(true);
    isSpeaking.value = true;

    const audioConfig = AUDIO_FILES.find((item) => item.key === keyOrPath);
    const fallbackText = options?.fallbackText || audioConfig?.fallback || keyOrPath;

    // Determine path: check config, then if it starts with / assume it's a path, else assume it's a key
    let audioPath = audioConfig?.path;
    if (!audioPath) {
      audioPath = keyOrPath.startsWith("/") ? keyOrPath : `/audio/${keyOrPath.toLowerCase().replace(/ /g, "-")}.webm`;
    }

    const audio = new Audio();
    audio.src = audioPath;
    audio.preload = "auto";
    currentAudio = audio;

    let hasFinished = false;

    const onFinished = () => {
      if (hasFinished) return;
      hasFinished = true;
      if (currentAudio === audio) currentAudio = null;
      isSpeaking.value = false;
      resolve();
    };

    const handleFallback = async (reason?: string) => {
      if (hasFinished) return;
      hasFinished = true;
      if (currentAudio === audio) currentAudio = null;

      console.warn(`Audio ${audioPath} issue (${reason || 'unknown'}), falling back to TTS: ${fallbackText}`);
      await speakTTS(fallbackText);
      resolve();
    };

    audio.onended = onFinished;
    audio.onerror = () => handleFallback("loading error");

    const attemptPlay = () => {
      audio.play().catch((err) => {
        if (err.name === 'NotAllowedError') {
          console.warn("Autoplay blocked. Audio will play on next user interaction.");

          const resumeAudio = () => {
            audio.play().catch(() => { });
            window.removeEventListener('click', resumeAudio);
            window.removeEventListener('touchstart', resumeAudio);
            window.removeEventListener('keydown', resumeAudio);
          };

          window.addEventListener('click', resumeAudio, { once: true });
          window.addEventListener('touchstart', resumeAudio, { once: true });
          window.addEventListener('keydown', resumeAudio, { once: true });

          resolve();
        } else {
          console.error("Audio play error:", err);
          handleFallback("playback error");
        }
      });
    };

    if (audio.readyState >= 3) {
      attemptPlay();
    } else {
      audio.oncanplay = () => {
        attemptPlay();
        audio.oncanplay = null;
      };
    }
  });
};

/**
 * Plays a sequence of audio files.
 */
export const playSequence = async (sequence: AudioSequence[]) => {
  stopAllAudio();
  isSpeaking.value = true;

  try {
    for (const item of sequence) {

      // if (!isSpeaking.value) break;
      if (item.delay) {
        await new Promise((resolve) => setTimeout(resolve, item.delay));
      }
      await playAudio(item.key);
    }
  } catch (error) {
    console.error("Sequence playback error:", error);
  } finally {
    isSpeaking.value = false;
  }
};

/**
 * Specialized audio functions
 */
export const playWordAudio = (text: string, path?: string) => {
  return playAudio(path || text, { fallbackText: text });
};

export const playSyllableAudio = (syllable: string, path?: string) => {
  return playAudio(path || syllable, { fallbackText: syllable });
};

export const playEffectAudio = (type: "correct" | "wrong" | "sticker") => {
  const texts = {
    correct: "Pintar!",
    wrong: "Tetot, coba lagi",
    sticker: "Wah! Kamu dapat hadiah baru!",
  };
  speakTTS(texts[type]);
};

// export const preloadAlphabetSounds = () => {
//   if (preloadedAudio.size > 0) return;
//   letters.forEach((letter) => {
//     const audioPath = `/Letter-${letter.toUpperCase()}.webm`;
//     const audio = new Audio(audioPath);
//     audio.load();
//     preloadedAudio.set(letter.toUpperCase(), audio);
//   });
// };

export const playLetterSound = (letter: string, isLearningMode: boolean = false) => {
  stopAllAudio(true);
  isSpeaking.value = true;

  const upperLetter = letter.toUpperCase();
  const audio = preloadedAudio.get(upperLetter);

  const fallbackToSpeech = (text: string) => {
    speakTTS(text);
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

export const useAudio = () => {
  if (getCurrentInstance()) {
    onMounted(() => {
      isSupported.value = typeof window !== "undefined" && "speechSynthesis" in window;
    });

    onUnmounted(() => {
      stopAllAudio();
    });
  }

  return {
    isSpeaking,
    isSupported,
    speak: speakTTS,
    play: playAudio,
    playAudio, // backward compat
    playSequence,
    playWordAudio,
    playSyllableAudio,
    playEffectAudio,
    // preloadAlphabetSounds,
    // preloadSounds: preloadAlphabetSounds, // backward compat
    playLetterSound,
    stopAll: stopAllAudio,
    stopAllAudio, // backward compat
  };
};
