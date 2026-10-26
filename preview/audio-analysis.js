(function (R) {
  class AudioAnalysis {
    constructor(audio) {
      this.audio = audio;
      this.context = null;
      this.source = null;
      this.analyser = null;
      this.enabled = true;
      this.failed = false;
      this.value = { bass: 0, mid: 0, high: 0, rms: 0 };
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
            this.analyser.fftSize = 2048;
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
        return { bass: 0, mid: 0, high: 0, rms: 0 };
      if (this.audio.paused || this.audio.seeking || this.audio.readyState < 3)
        return this.value;
      this.analyser.getByteFrequencyData(this.freq);
      this.analyser.getByteTimeDomainData(this.wave);
      let sum = 0;
      for (const x of this.wave) sum += ((x - 128) / 128) ** 2;
      const binHz=this.context.sampleRate/this.analyser.fftSize;
      const band=(lo,hi)=>{let sum=0,n=0;for(let i=Math.ceil(lo/binHz);i<Math.min(this.freq.length,hi/binHz);i++){sum+=(this.freq[i]/255)**2;n++;}return Math.min(1,Math.sqrt(sum/Math.max(1,n)));};
      this.value = {bass:band(35,220),mid:band(220,2200),high:band(2200,9000),rms:Math.min(1,Math.sqrt(sum/this.wave.length)*2.3)};
      return this.value;
    }
    reset() {
      this.value = { bass: 0, mid: 0, high: 0, rms: 0 };
    }
  }
  R.AudioAnalysis = AudioAnalysis;
})(globalThis);
