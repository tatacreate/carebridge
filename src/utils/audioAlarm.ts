// Web Audio API & Speech Synthesis Utility for Medication Alarms and Voiceover

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isRinging: boolean = false;
  private alarmInterval: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a single high-priority medical chime sequence
  public playChime(urgent: boolean = false) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = urgent ? 'sawtooth' : 'sine';

      // Frequencies for urgent or gentle chime
      if (urgent) {
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.setValueAtTime(1046.5, now + 0.15); // C6
        osc.frequency.setValueAtTime(1318.5, now + 0.3); // E6
      } else {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.2); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.4); // G5
      }

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (urgent ? 0.6 : 0.8));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + (urgent ? 0.6 : 0.8));
    } catch (e) {
      console.warn('Audio playback not permitted yet:', e);
    }
  }

  // Start continuous repeating alarm for the Persistent Overlay Modal
  public startRepeatingAlarm() {
    if (this.isRinging) return;
    this.isRinging = true;
    this.playChime(true);

    this.alarmInterval = window.setInterval(() => {
      if (this.isRinging) {
        this.playChime(true);
      } else {
        this.stopRepeatingAlarm();
      }
    }, 1200);
  }

  // Stop repeating alarm sound
  public stopRepeatingAlarm() {
    this.isRinging = false;
    if (this.alarmInterval !== null) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();

// Text-to-speech Voiceover Reader for accessibility
export function speakText(text: string, langCode: string = 'en') {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported on this browser.');
    return;
  }

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Map language codes to BCP 47 tags
  const langMap: Record<string, string> = {
    ar: 'ar-SA',
    en: 'en-US',
    ur: 'ur-PK',
    tl: 'fil-PH',
  };

  utterance.lang = langMap[langCode] || 'en-US';
  utterance.rate = 0.9; // Slightly slower for clear post-op instruction comprehension
  utterance.pitch = 1.0;

  // Try to find a matching voice if available
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang.startsWith(langCode) || v.lang.startsWith(utterance.lang));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
