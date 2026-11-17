/**
 * Audio Engine with Suno Jazz Loop Background Music & Procedural SFX
 * Features:
 * - Plays and loops the Suno BGM: /assets/aistudio/Caf__Jazz_Loop_9b6eaedb.mp3
 * - Procedural sound effects for clicks, coins, item placement, success, and level up
 * - Native SpeechSynthesis for English directions and vocabulary
 */

class SoundEngine {
  private bgmAudio: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private isBgmPlaying = false;
  private masterMuted = false;
  private bgmVolume = 0.45;

  constructor() {
    // Suno BGM audio element
    if (typeof window !== 'undefined') {
      this.bgmAudio = new Audio('/assets/aistudio/Caf__Jazz_Loop_9b6eaedb.mp3');
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = this.bgmVolume;
      this.bgmAudio.preload = 'auto';
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startBgm() {
    if (!this.bgmAudio) return;
    this.initContext();
    this.bgmAudio.muted = this.masterMuted;
    this.bgmAudio.volume = this.bgmVolume;
    this.bgmAudio
      .play()
      .then(() => {
        this.isBgmPlaying = true;
      })
      .catch(() => {
        // Autoplay may be restricted until first user interaction
        this.isBgmPlaying = false;
      });
  }

  public stopBgm() {
    if (!this.bgmAudio) return;
    this.bgmAudio.pause();
    this.isBgmPlaying = false;
  }

  public toggleBgm(): boolean {
    if (this.isBgmPlaying) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  public getBgmStatus(): boolean {
    return this.isBgmPlaying;
  }

  public setBgmVolume(val: number) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmVolume;
    }
  }

  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  public setMasterMute(muted: boolean) {
    this.masterMuted = muted;
    if (this.bgmAudio) {
      this.bgmAudio.muted = muted;
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(muted ? 0 : 0.3, this.ctx.currentTime);
    }
  }

  public isMuted(): boolean {
    return this.masterMuted;
  }

  // SFX: Soft tap
  public playClick() {
    if (this.masterMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // SFX: Gold coins received
  public playCoin() {
    if (this.masterMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    [987.77, 1318.51].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.12, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.22);
    });
  }

  // SFX: Success
  public playSuccess() {
    if (this.masterMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.001, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.35);
    });
  }

  // SFX: Error
  public playError() {
    if (this.masterMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.18);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // SFX: Building placed in Kingdom
  public playPlaceItem() {
    if (this.masterMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.14);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // SFX: Level Up / Milestone
  public playLevelUp() {
    if (this.masterMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const arpeggio = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    arpeggio.forEach((f, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.07);

      gain.gain.setValueAtTime(0.001, now + i * 0.07);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.45);
    });
  }

  // Natural American English Voice Engine (Gemini TTS + en-US Neural SpeechSynthesis fallback)
  private availableVoices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private voicePreference: 'female' | 'male' | 'natural' = 'natural';
  private activeTtsAudio: HTMLAudioElement | null = null;
  private ttsCache = new Map<string, string>();
  private serverTtsAvailable: boolean | null = null;
  private speechNonce = 0;

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      this.availableVoices = window.speechSynthesis.getVoices();
      this.selectedVoice = this.pickBestVoice('US');
    };

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }

  // Rank and select the most natural fluent American (or requested) English voice
  public pickBestVoice(accent: 'UK' | 'US' = 'US', genderPref?: 'female' | 'male'): SpeechSynthesisVoice | null {
    if (this.availableVoices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.availableVoices = window.speechSynthesis.getVoices();
    }
    if (this.availableVoices.length === 0) return null;

    const targetLang = accent === 'US' ? 'en-us' : 'en-gb';

    const premiumUSKeywords = [
      'ava',
      'andrew',
      'aria',
      'jenny',
      'guy',
      'davis',
      'emma',
      'brian',
      'google us english',
      'samantha (enhanced)',
      'allison (enhanced)',
      'samantha',
      'allison',
      'alex',
      'nicky',
      'aaron',
      'natural',
      'neural',
      'online (natural)',
      'enhanced',
      'premium',
      'zira',
      'david',
      'mark',
    ];

    const premiumUKKeywords = [
      'libby',
      'sonia',
      'ryan',
      'george',
      'hazel',
      'google uk english',
      'daniel (enhanced)',
      'serena (enhanced)',
      'natural',
      'neural',
      'online (natural)',
      'enhanced',
      'premium',
      'daniel',
      'serena',
    ];

    const keywords = accent === 'US' ? premiumUSKeywords : premiumUKKeywords;

    const scoreVoice = (v: SpeechSynthesisVoice): number => {
      let score = 0;
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase().replace('_', '-');

      // 1. Strict regional accent match
      if (lang === targetLang) score += 160;
      else if (lang.startsWith('en-')) score += 10;
      else score -= 120;

      // 2. High-quality Natural/Neural keywords
      if (name.includes('natural') || name.includes('neural') || name.includes('online (natural)')) score += 130;
      if (name.includes('google us english') && accent === 'US') score += 110;
      if (name.includes('enhanced') || name.includes('premium')) score += 90;

      // 3. Known natural persona names
      for (const kw of keywords) {
        if (name.includes(kw)) {
          score += 55;
          break;
        }
      }

      // 4. Gender preference weighting
      if (genderPref === 'female' || this.voicePreference === 'female') {
        if (
          name.includes('female') ||
          name.includes('aria') ||
          name.includes('jenny') ||
          name.includes('ava') ||
          name.includes('samantha') ||
          name.includes('allison') ||
          name.includes('zira')
        ) {
          score += 35;
        }
      } else if (genderPref === 'male' || this.voicePreference === 'male') {
        if (
          name.includes('male') ||
          name.includes('guy') ||
          name.includes('andrew') ||
          name.includes('davis') ||
          name.includes('alex') ||
          name.includes('david')
        ) {
          score += 35;
        }
      }

      // 5. Penalize robotic / legacy synthesis engines
      if (name.includes('espeak') || name.includes('compact') || name.includes('klatt') || name.includes('eloquence')) {
        score -= 200;
      }

      return score;
    };

    const sorted = [...this.availableVoices].sort((a, b) => scoreVoice(b) - scoreVoice(a));
    return sorted[0] || null;
  }

  // Clean text & add natural human breathing pauses without distorting punctuation
  private formatProsody(text: string): string {
    return text
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
      .replace(/["“”]/g, '')
      .trim()
      .replace(/^(Excuse me|Pardon me|Hello|Hi|Good morning|Sure|Well|Actually)([,.]?)\s+/i, '$1, ')
      .replace(/\s+(and then|then)\s+/gi, ', $1 ')
      .replace(/\s+for\s+(one|two|three|four|five|\d+)\s+(blocks?|minutes?)/gi, ' for $1 $2, ')
      .replace(/,\s*,+/g, ',')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  public stopSpeech() {
    this.speechNonce++;
    if (this.activeTtsAudio) {
      this.activeTtsAudio.pause();
      this.activeTtsAudio.currentTime = 0;
      this.activeTtsAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  private speakViaBrowserSynthesis(
    text: string,
    accent: 'UK' | 'US',
    genderPref: 'female' | 'male' | undefined,
    rate: number,
    nonce: number
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (nonce !== this.speechNonce || this.masterMuted) return;

    const naturalText = this.formatProsody(text);
    const utterance = new SpeechSynthesisUtterance(naturalText);

    // Always bind regional BCP-47 tag (General American default)
    utterance.lang = accent === 'US' ? 'en-US' : 'en-GB';
    // Unhurried, clear, fluent conversational pace (0.86 normal, ~0.62 slow)
    utterance.rate = Math.max(0.5, Math.min(1.15, rate));
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const bestVoice = this.pickBestVoice(accent, genderPref);
    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang || utterance.lang;
    }

    // Small delay after cancel() avoids Chrome SpeechSynthesis drop bugs
    window.setTimeout(() => {
      if (nonce !== this.speechNonce) return;
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.speak(utterance);
    }, 35);
  }

  private playCachedDataUrl(dataUrl: string, rate: number, nonce: number) {
    if (nonce !== this.speechNonce || this.masterMuted) return;
    const audio = new Audio(dataUrl);
    audio.playbackRate = rate < 0.78 ? 0.85 : 0.94;
    this.activeTtsAudio = audio;
    audio.onended = () => {
      if (this.activeTtsAudio === audio) {
        this.activeTtsAudio = null;
      }
    };
    audio.play().catch(() => {
      // Autoplay restriction fallback handled silently
    });
  }

  // High-fidelity fluent American English speech (Gemini Neural TTS -> en-US SpeechSynthesis fallback)
  public speakEnglish(
    text: string,
    accent: 'UK' | 'US' = 'US',
    genderPref?: 'female' | 'male',
    rate: number = 0.86
  ) {
    if (typeof window === 'undefined' || this.masterMuted) return;
    const cleanText = text.trim();
    if (!cleanText) return;

    this.stopSpeech();
    const currentNonce = this.speechNonce;
    const isSlow = rate < 0.76;

    // If explicitly asking for US (standard for all game characters) and server TTS isn't known disabled
    if (accent === 'US' && this.serverTtsAvailable !== false) {
      const cacheKey = `${genderPref || 'female'}:${isSlow ? 'slow' : 'normal'}:${cleanText}`;
      const cachedUrl = this.ttsCache.get(cacheKey);
      if (cachedUrl) {
        this.playCachedDataUrl(cachedUrl, rate, currentNonce);
        return;
      }

      fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          gender: genderPref || 'female',
          slow: isSlow,
        }),
      })
        .then(res => (res.ok ? res.json() : { fallback: true }))
        .then((data: { audioBase64?: string; mimeType?: string; fallback?: boolean }) => {
          if (currentNonce !== this.speechNonce) return;
          if (data.audioBase64) {
            this.serverTtsAvailable = true;
            const dataUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
            this.ttsCache.set(cacheKey, dataUrl);
            this.playCachedDataUrl(dataUrl, rate, currentNonce);
          } else {
            this.serverTtsAvailable = false;
            this.speakViaBrowserSynthesis(cleanText, 'US', genderPref, rate, currentNonce);
          }
        })
        .catch(() => {
          this.serverTtsAvailable = false;
          this.speakViaBrowserSynthesis(cleanText, 'US', genderPref, rate, currentNonce);
        });
      return;
    }

    this.speakViaBrowserSynthesis(cleanText, accent, genderPref, rate, currentNonce);
  }

  public getVoiceInfo(): { voiceName: string; isNatural: boolean } {
    const voice = this.pickBestVoice('US');
    if (!voice) return { voiceName: 'System Default (en-US)', isNatural: false };
    const isNatural =
      voice.name.toLowerCase().includes('natural') ||
      voice.name.toLowerCase().includes('neural') ||
      voice.name.toLowerCase().includes('google') ||
      voice.name.toLowerCase().includes('enhanced');
    return { voiceName: voice.name, isNatural };
  }
}

export const soundEngine = new SoundEngine();
// Eagerly initialize voice engine
if (typeof window !== 'undefined') {
  (soundEngine as unknown as { initVoices?: () => void }).initVoices?.();
}

