class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    // Resume context if suspended (browser policy)
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    this.playTone(600, 'sine', 0.1, 0.1);
  }

  playTurn() {
    this.playTone(523.25, 'sine', 0.1, 0.3); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.3), 100); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.2, 0.3), 200); // G5
  }
  
  playSubmit() {
    this.playTone(400, 'square', 0.1, 0.05);
    setTimeout(() => this.playTone(600, 'square', 0.2, 0.05), 100);
  }

  playEnd() {
    this.playTone(800, 'sine', 0.1, 0.2);
    setTimeout(() => this.playTone(1200, 'sine', 0.4, 0.3), 150);
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol: number) {
    if (!this.ctx || !this.enabled) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio errors
    }
  }
}

export const sounds = new SoundManager();
