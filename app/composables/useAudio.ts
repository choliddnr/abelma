import type { AudioSequence } from "~/types";
import { isSpeaking, cancelTTS, speakTTS } from "./useTTS";

let currentAudio: HTMLAudioElement | null = null;

export const useAudio = () => {
  /**
   * Plays a single audio file based on a key.
   * If the file is not found, it can optionally fall back to TTS.
   */
  const play = (key: string, options?: { fallbackText?: string }): Promise<void> => {
    return new Promise((resolve) => {
      // Use provided fallback text or default to the key itself
      const fallbackText = options?.fallbackText || key;

      // Format key to match file naming: "Ini huruf" -> "ini-huruf"
      const formattedKey = key.toLowerCase().replace(/ /g, "-");
      const audioPath = `/audio/${formattedKey}.webm`;

      const audio = new Audio(audioPath);
      currentAudio = audio;

      let hasFinished = false;

      const onFinished = () => {
        if (hasFinished) return;
        hasFinished = true;
        if (currentAudio === audio) currentAudio = null;
        resolve();
      };

      const handleFallback = async () => {
        if (hasFinished) return;
        hasFinished = true;
        if (currentAudio === audio) currentAudio = null;

        console.warn(`Audio ${audioPath} not found, falling back to TTS: ${fallbackText}`);
        await speakTTS(fallbackText);
        resolve();
      };

      audio.onended = onFinished;
      audio.onerror = handleFallback;

      audio.play().catch((err) => {
        console.error("Audio play error:", err);
        handleFallback();
      });
    });
  };


  /**
   * Plays a sequence of audio files one after another.
   */
  const playSequence = async (sequence: AudioSequence[]) => {
    // Stop any ongoing speech or audio
    stopAll();

    isSpeaking.value = true;
    // let fallbackText = "";
    try {
      for (const item of sequence) {
        // If the sequence is interrupted, stop playing
        if (!isSpeaking.value) break;

        if (item.delay) {
          await new Promise((resolve) => setTimeout(resolve, item.delay));
        }

        // We play each segment. If one fails, we could potentially stop the whole sequence
        // or just skip it. Here we play it.


        await play(item.key);
      }
    } catch (error) {
      console.error("Sequence playback error:", error);

      // await speakTTS(item.key);
    } finally {
      isSpeaking.value = false;
    }

  };
  /**
   * Stops both TTS and current audio element
   */
  const stopAll = () => {
    cancelTTS(); // This handles SpeechSynthesis
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    isSpeaking.value = false;
  };

  return {
    isSpeaking,
    play,
    playSequence,
    stopAll,
  };
};
