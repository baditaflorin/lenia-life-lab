import type { LeniaMetrics } from "../lenia/metrics";
import type { Species } from "../lenia/species";

export class CreatureAudio {
  private context?: AudioContext;
  private mainOscillator?: OscillatorNode;
  private pulseOscillator?: OscillatorNode;
  private filter?: BiquadFilterNode;
  private gain?: GainNode;
  private enabled = false;

  get isEnabled(): boolean {
    return this.enabled;
  }

  async setEnabled(nextEnabled: boolean): Promise<void> {
    if (nextEnabled) {
      await this.ensureGraph();
      await this.context?.resume();
      this.enabled = true;
      this.setGain(0.08);
      return;
    }

    this.enabled = false;
    this.setGain(0);
  }

  update(metrics: LeniaMetrics, species: Species): void {
    if (!this.enabled || !this.context || !this.mainOscillator || !this.pulseOscillator || !this.filter) {
      return;
    }

    const now = this.context.currentTime;
    const base = 90 + species.mu * 520 + metrics.centroidX * 120;
    const shimmer = 0.5 + metrics.movement * 120;
    const pulse = 35 + metrics.population * 260 + metrics.centroidY * 80;
    const cutoff = 240 + metrics.energy * 5200 + metrics.spread * 900;

    this.mainOscillator.frequency.setTargetAtTime(base + shimmer, now, 0.06);
    this.pulseOscillator.frequency.setTargetAtTime(pulse, now, 0.08);
    this.filter.frequency.setTargetAtTime(cutoff, now, 0.08);
    this.filter.Q.setTargetAtTime(4 + metrics.movement * 60, now, 0.1);
    this.setGain(Math.min(0.16, 0.025 + metrics.movement * 6 + metrics.population * 0.35));
  }

  dispose(): void {
    this.enabled = false;
    this.mainOscillator?.stop();
    this.pulseOscillator?.stop();
    void this.context?.close();
  }

  private async ensureGraph(): Promise<void> {
    if (this.context) {
      return;
    }

    const context = new AudioContext();
    const mainOscillator = context.createOscillator();
    const pulseOscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    mainOscillator.type = "sine";
    pulseOscillator.type = "triangle";
    filter.type = "bandpass";
    gain.gain.value = 0;

    mainOscillator.connect(filter);
    pulseOscillator.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    mainOscillator.start();
    pulseOscillator.start();

    this.context = context;
    this.mainOscillator = mainOscillator;
    this.pulseOscillator = pulseOscillator;
    this.filter = filter;
    this.gain = gain;
  }

  private setGain(value: number): void {
    if (!this.context || !this.gain) {
      return;
    }

    this.gain.gain.setTargetAtTime(value, this.context.currentTime, 0.08);
  }
}
