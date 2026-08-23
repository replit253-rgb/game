// Audio manager for Funiko Game

class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;
  private masterVolume: number = 0.8;
  private speechEnabled: boolean = true;
  private speechRate: number = 0.9;

  constructor() {
    // Load stored settings if available
    if (typeof window !== 'undefined') {
      try {
        const savedVolume = localStorage.getItem('funiko_master_volume');
        if (savedVolume !== null) this.masterVolume = parseFloat(savedVolume);

        const savedSpeech = localStorage.getItem('funiko_speech_enabled');
        if (savedSpeech !== null) this.speechEnabled = savedSpeech === 'true';

        const savedRate = localStorage.getItem('funiko_speech_rate');
        if (savedRate !== null) this.speechRate = parseFloat(savedRate);

        const savedMute = localStorage.getItem('funiko_muted');
        if (savedMute !== null) this.isMuted = savedMute === 'true';
      } catch {
        // ignore storage errors
      }

      // Sound mapping
      const soundUrls: Record<string, string> = {
        click: '/assets/_Sound/button.ogg',
        correct: '/assets/_Sound/correct.wav',
        guess_correct: '/assets/_Sound/guess_bener.ogg',
        wrong: '/assets/_Sound/wrong.mp3',
        wrong_guess: '/assets/_Sound/wrong_guess.ogg',
        win: '/assets/_Sound/cheer_kids_2.ogg',
        win_coin: '/assets/_Sound/win game coin.ogg',
        lose: '/assets/_Sound/music_lose.ogg',
        notify: '/assets/_Sound/notification%20sound%2012.ogg',
        success_music: '/assets/_Sound/music_succ.ogg',
      };

      for (const [key, url] of Object.entries(soundUrls)) {
        try {
          const audio = new Audio(url);
          audio.preload = 'auto';
          this.sounds.set(key, audio);
        } catch {
          // ignore preload errors
        }
      }
    }
  }

  public play(key: string, customVol?: number) {
    if (this.isMuted) return;
    try {
      const sound = this.sounds.get(key);
      if (sound) {
        sound.currentTime = 0;
        sound.volume = (customVol !== undefined ? customVol : 1) * this.masterVolume;
        sound.play().catch(() => {
          // Auto-play policy restrictions or user has not interacted yet
        });
      }
    } catch {
      // ignore
    }
  }

  public speakText(text: string) {
    if (this.isMuted || !this.speechEnabled) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // cancel prior speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = this.speechRate;
        utterance.pitch = 1.1;
        utterance.volume = this.masterVolume;
        window.speechSynthesis.speak(utterance);
      } catch {
        // speech synthesis not supported or failed
      }
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.saveSettings();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.saveSettings();
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    this.saveSettings();
  }

  public isSpeechEnabled(): boolean {
    return this.speechEnabled;
  }

  public setSpeechEnabled(enabled: boolean) {
    this.speechEnabled = enabled;
    this.saveSettings();
  }

  public getSpeechRate(): number {
    return this.speechRate;
  }

  public setSpeechRate(rate: number) {
    this.speechRate = rate;
    this.saveSettings();
  }

  private saveSettings() {
    try {
      localStorage.setItem('funiko_master_volume', this.masterVolume.toString());
      localStorage.setItem('funiko_speech_enabled', this.speechEnabled.toString());
      localStorage.setItem('funiko_speech_rate', this.speechRate.toString());
      localStorage.setItem('funiko_muted', this.isMuted.toString());
    } catch {
      // ignore
    }
  }
}

export const soundFx = new AudioManager();
