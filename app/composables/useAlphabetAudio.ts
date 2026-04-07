import { letters, idLetterMap } from "~/constants/alphabet";

// Shared state across all instances of the composable
// ref is auto-imported by Nuxt 4
const preloadedAudio = new Map<string, HTMLAudioElement>();
let currentAudio: HTMLAudioElement | null = null;
const speaking = ref(false);

export function useAlphabetAudio() {
  const preloadSounds = () => {
    // Only preload once
    if (preloadedAudio.size > 0) return;

    letters.forEach((letter) => {
      const audioPath = `/Letter-${letter.toUpperCase()}.webm`;
      const audio = new Audio(audioPath);
      audio.load();
      preloadedAudio.set(letter.toUpperCase(), audio);
    });
  };

  const fallbackToSpeech = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text.toLowerCase());
    utterance.lang = "id-ID";
    utterance.onend = () => {
      speaking.value = false;
    };
    window.speechSynthesis.speak(utterance);
  };

  const playLetterSound = (letter: string, isLearningMode: boolean = false) => {
    // Cancel previous speech to prioritize letter sound
    window.speechSynthesis.cancel();

    // Stop currently playing letter sound if any
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    speaking.value = true;

    const upperLetter = letter.toUpperCase();
    const audio = preloadedAudio.get(upperLetter);

    if (audio) {
      currentAudio = audio;
      // Reset if already playing (sanity check)
      audio.pause();
      audio.currentTime = 0;

      audio.onended = () => {
        if (isLearningMode && idLetterMap[upperLetter]) {
          fallbackToSpeech(idLetterMap[upperLetter].word);
        } else {
          speaking.value = false;
          if (currentAudio === audio) currentAudio = null;
        }
      };

      audio.play().catch((err) => {
        console.warn(`Failed to play preloaded audio for ${letter}:`, err);
        if (isLearningMode && idLetterMap[upperLetter]) {
          fallbackToSpeech(
            `${letter.toLowerCase()} untuk ${idLetterMap[upperLetter].word}`,
          );
        } else {
          fallbackToSpeech(letter);
        }
      });
    } else {
      if (isLearningMode && idLetterMap[upperLetter]) {
        fallbackToSpeech(
          `${letter.toLowerCase()} untuk ${idLetterMap[upperLetter].word}`,
        );
      } else {
        fallbackToSpeech(letter);
      }
    }
  };

  const speak = (text: string) => {
    // Cancel any ongoing speech to avoid state confusion
    window.speechSynthesis.cancel();

    speaking.value = true;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID"; // Bahasa Indonesia
    utterance.onend = () => {
      speaking.value = false;
    };
    utterance.onerror = () => {
      speaking.value = false;
    };
    window.speechSynthesis.speak(utterance);
  };

  return {
    speaking,
    preloadSounds,
    playLetterSound,
    speak,
    fallbackToSpeech,
  };
}
