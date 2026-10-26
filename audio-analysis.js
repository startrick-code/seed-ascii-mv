(function (R) {
  class AudioAnalysis {
    constructor(audio) {
      this.audio = audio;
      this.context = null;
      this.source = null;
      this.analyser = null;
      this.enabled = true;
      this.failed = false;
      this.value = { bass: 0, rms: 0 };
    }
    async unlock() {
      if (this.failed) return;
      try {
        if (!this.context) {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) {
            this.failed = true;
            return;
          }
          this.context = new AC();
        }
        if (this.context.state === "suspended") await this.context.resume();
        if (this.context.state !== "running") return;
        if (!this.source) {
          this.source = this.context.createMediaElementSource(this.audio);
          this.source.connect(this.context.destination);
          try {
            this.analyser = this.context.createAnalyser();
            this.analyser.fftSize = 1024;
            this.analyser.smoothingTimeConstant = 0.4;
            this.source.connect(this.analyser);
            this.freq = new Uint8Array(this.analyser.frequencyBinCount);
            this.wave = new Uint8Array(this.analyser.fftSize);
          } catch (e) {
            this.analyser = null;
          }
        }
      } catch (e) {
        this.failed = true;
      }
    }

    sample() {
      if (!this.enabled || !this.analyser || this.failed)
        return { bass: 0, rms: 0 };
      if (this.audio.paused || this.audio.seeking || this.audio.readyState < 3)
        return this.value;
      this.analyser.getByteFrequencyData(this.freq);
      this.analyser.getByteTimeDomainData(this.wave);
      let sum = 0;
      for (const x of this.wave) sum += ((x - 128) / 128) ** 2;
      let bass = 0;
      const n = Math.max(1, Math.floor(220 / (this.context.sampleRate / 1024)));
      for (let i = 1; i <= n; i++) bass += this.freq[i] / 255;
      this.value = { bass: bass / n, rms: Math.sqrt(sum / this.wave.length) };
      return this.value;
    }
    reset() {
      this.value = { bass: 0, rms: 0 };
    }
  }
  R.AudioAnalysis = AudioAnalysis;
})(globalThis);
