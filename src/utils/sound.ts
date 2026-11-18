export type SoundEffect =
  | 'feed'
  | 'water'
  | 'brush'
  | 'milk'
  | 'heal'
  | 'coin'
  | 'day'
  | 'harvest'
  | 'click'
  | 'bell'
  | 'chore'
  | 'bonus';

class FarmAudioEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  public setMuted(mute: boolean) {
    this.muted = mute;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public play(effect: SoundEffect) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const playTone = (
      freq: number,
      endFreq: number,
      duration: number,
      type: OscillatorType = 'sine',
      gainLevel = 0.08,
      delay = 0
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + delay);
      if (endFreq !== freq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + delay + duration);
      }
      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(gainLevel, now + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + duration + 0.02);
    };

    switch (effect) {
      case 'click':
        playTone(360, 420, 0.06, 'triangle', 0.05);
        break;
      case 'feed':
        playTone(280, 390, 0.12, 'triangle', 0.08, 0);
        playTone(350, 480, 0.14, 'sine', 0.06, 0.07);
        break;
      case 'water':
        playTone(420, 680, 0.14, 'sine', 0.07, 0);
        playTone(580, 820, 0.14, 'sine', 0.05, 0.06);
        break;
      case 'brush':
        playTone(320, 360, 0.12, 'sine', 0.05, 0);
        playTone(440, 520, 0.15, 'sine', 0.05, 0.08);
        break;
      case 'milk':
        playTone(523.25, 587.33, 0.11, 'sine', 0.07, 0);
        playTone(659.25, 783.99, 0.16, 'sine', 0.07, 0.09);
        break;
      case 'heal':
        playTone(440, 554.37, 0.14, 'sine', 0.07, 0);
        playTone(554.37, 659.25, 0.18, 'sine', 0.07, 0.1);
        playTone(659.25, 880, 0.22, 'sine', 0.06, 0.2);
        break;
      case 'coin':
        playTone(784, 988, 0.09, 'triangle', 0.07, 0);
        playTone(1046.5, 1318.5, 0.18, 'triangle', 0.07, 0.07);
        break;
      case 'harvest':
        playTone(330, 440, 0.12, 'triangle', 0.07, 0);
        playTone(440, 554.37, 0.14, 'triangle', 0.07, 0.08);
        playTone(554.37, 659.25, 0.18, 'sine', 0.07, 0.16);
        break;
      case 'day':
        playTone(392, 392, 0.14, 'sine', 0.06, 0);
        playTone(493.88, 493.88, 0.16, 'sine', 0.06, 0.11);
        playTone(587.33, 659.25, 0.26, 'sine', 0.07, 0.22);
        break;
      case 'bell':
        playTone(587.33, 580, 0.22, 'triangle', 0.09, 0);
        playTone(880, 870, 0.26, 'sine', 0.05, 0.04);
        playTone(587.33, 580, 0.24, 'triangle', 0.07, 0.18);
        break;
      case 'chore':
        playTone(260, 340, 0.09, 'triangle', 0.08, 0);
        playTone(390, 510, 0.12, 'triangle', 0.07, 0.07);
        break;
      case 'bonus':
        playTone(523.25, 523.25, 0.1, 'triangle', 0.07, 0);
        playTone(659.25, 659.25, 0.1, 'triangle', 0.07, 0.08);
        playTone(783.99, 783.99, 0.12, 'triangle', 0.07, 0.16);
        playTone(1046.5, 1046.5, 0.24, 'sine', 0.08, 0.24);
        break;
    }
  }
}

export const soundEngine = new FarmAudioEngine();
