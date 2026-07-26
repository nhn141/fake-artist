class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  
  // Audio nodes for loopers
  private bgmInterval: ReturnType<typeof setInterval> | null = null;
  
  private scratchNoise: AudioBufferSourceNode | null = null;
  private scratchGain: GainNode | null = null;

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- SHORT SFX ---
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

  playTick() {
    this.playTone(800, 'square', 0.05, 0.05);
  }

  playEnd() {
    this.playTone(800, 'sine', 0.1, 0.2);
    setTimeout(() => this.playTone(1200, 'sine', 0.4, 0.3), 150);
  }

  // --- RESULT SFX ---
  playArtistWin() {
    // Tadaa! (C major arpeggio up)
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', i === notes.length - 1 ? 0.6 : 0.15, 0.3), i * 150);
    });
    // Fake applause (filtered noise burst)
    setTimeout(() => this.playNoiseBurst(1.5, 0.1), 500);
  }

  playFakeArtistWin() {
    // Sneaky/Evil laugh (Descending diminished/chromatic)
    const notes = [600, 550, 500, 450, 400, 350, 300];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.15, 0.2), i * 120);
    });
  }

  // --- SCRATCHING SFX ---
  startScratch() {
    if (!this.ctx || !this.enabled || this.scratchNoise) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2; 
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1; // White noise
      }

      this.scratchNoise = this.ctx.createBufferSource();
      this.scratchNoise.buffer = buffer;
      this.scratchNoise.loop = true;

      // Low pass filter to make it sound like paper scratching
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      this.scratchGain = this.ctx.createGain();
      this.scratchGain.gain.value = 0.05; // very quiet

      this.scratchNoise.connect(filter);
      filter.connect(this.scratchGain);
      this.scratchGain.connect(this.ctx.destination);
      
      this.scratchNoise.start();
    } catch (e) {}
  }

  stopScratch() {
    if (this.scratchNoise) {
      try {
        this.scratchNoise.stop();
        this.scratchNoise.disconnect();
      } catch (e) {}
      this.scratchNoise = null;
    }
  }

  // --- BGM (Background Music) ---
  startBGM(type: 'lobby' | 'suspense') {
    if (!this.ctx || !this.enabled) return;
    this.stopBGM(); // ensure previous is stopped
    
    // Procedural arpeggiator
    let noteIndex = 0;
    const lobbyNotes = [261.63, 329.63, 392.00, 493.88]; // Cmaj7 (C4, E4, G4, B4)
    const suspenseNotes = [220.00, 233.08, 220.00, 207.65]; // A3, Bb3, A3, Ab3 (creepy)

    const notes = type === 'lobby' ? lobbyNotes : suspenseNotes;
    const speed = type === 'lobby' ? 400 : 800; // ms per note
    const volume = type === 'lobby' ? 0.05 : 0.08;
    const oscType = type === 'lobby' ? 'sine' : 'triangle';

    this.bgmInterval = setInterval(() => {
      this.playTone(notes[noteIndex % notes.length], oscType, speed / 1000, volume);
      noteIndex++;
    }, speed);
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  // --- UTILS ---
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
    } catch (e) {}
  }

  private playNoiseBurst(duration: number, vol: number) {
    if (!this.ctx || !this.enabled) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration; 
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1; // White noise
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      noise.start();
    } catch (e) {}
  }
}

export const sounds = new SoundManager();
