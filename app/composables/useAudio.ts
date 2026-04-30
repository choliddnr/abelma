import type { AudioSequence } from "~/types";
import { isSpeaking, cancelTTS, speakTTS } from "./useTTS";
import { AUDIO_FILES } from "~/constants/audio";

let currentAudio: HTMLAudioElement | null = null;

export const useAudio = () => {
  /**
   * Plays a single audio file based on a key.
   * If the file is not found, it can optionally fall back to TTS.
   */
  const play = (key: string, options?: { fallbackText?: string }): Promise<void> => {
    return new Promise((resolve) => {
      // Use provided fallback text or default to the key itself
      const audioConfig = AUDIO_FILES.find((item) => item.key === key);
      const fallbackText = options?.fallbackText || audioConfig?.fallback || key;
      const audioPath = audioConfig?.path || `/audio/${key.toLowerCase().replace(/ /g, "-")}.webm`;

      const audio = new Audio();
      audio.src = audioPath;
      audio.preload = "auto";
      currentAudio = audio;

      let hasFinished = false;

      const onFinished = () => {
        if (hasFinished) return;
        hasFinished = true;
        if (currentAudio === audio) currentAudio = null;
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
              audio.play().catch(() => {});
              window.removeEventListener('click', resumeAudio);
              window.removeEventListener('touchstart', resumeAudio);
              window.removeEventListener('keydown', resumeAudio);
            };
            
            window.addEventListener('click', resumeAudio, { once: true });
            window.addEventListener('touchstart', resumeAudio, { once: true });
            window.addEventListener('keydown', resumeAudio, { once: true });
            
            // Resolve the promise so the app doesn't hang, 
            // even if the audio hasn't actually played yet.
            resolve();
          } else {
            console.error("Audio play error:", err);
            handleFallback("playback error");
          }
        });
      };

      // Wait for audio to be playable
      if (audio.readyState >= 3) { // HAVE_FUTURE_DATA or higher
        attemptPlay();
      } else {
        audio.oncanplay = () => {
          attemptPlay();
          audio.oncanplay = null; // Prevent multiple calls
        };
      }
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
