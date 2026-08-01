/**
 * 外部音源を使わず Web Audio API のオシレーターで効果音を作る。
 * 設定だけ settings.sound に保存する。
 */

const SoundEffects = {
  enabled: true,
  context: null,
  storage: null,
  bound: false,

  melodies: {
    record: [
      { frequency: 523.25, offset: 0, duration: 0.08 },
      { frequency: 659.25, offset: 0.09, duration: 0.11 }
    ],
    city: [
      { frequency: 523.25, offset: 0, duration: 0.12 },
      { frequency: 659.25, offset: 0.13, duration: 0.12 },
      { frequency: 783.99, offset: 0.26, duration: 0.22 }
    ],
    goal: [
      { frequency: 523.25, offset: 0, duration: 0.14 },
      { frequency: 659.25, offset: 0.15, duration: 0.14 },
      { frequency: 783.99, offset: 0.30, duration: 0.14 },
      { frequency: 1046.5, offset: 0.45, duration: 0.35 }
    ]
  },

  init(storage) {
    this.storage = storage;
    const settings = storage?.getSettings?.() || {};
    this.enabled = settings.sound !== false;
    const toggle = document.getElementById('sound-toggle');
    if (toggle) {
      toggle.checked = this.enabled;
      if (!this.bound) {
        toggle.addEventListener('change', event => {
          this.enabled = event.target.checked;
          this.storage?.saveSettings?.({ sound: this.enabled });
          if (this.enabled) this.playRecord();
        });
        this.bound = true;
      }
    }
  },

  getContext() {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!this.context) this.context = new AudioContextClass();
    return this.context;
  },

  playMelody(name) {
    if (!this.enabled) return false;
    const context = this.getContext();
    const notes = this.melodies[name];
    if (!context || !notes) return false;
    if (context.state === 'suspended') context.resume().catch(() => {});
    const start = context.currentTime + 0.01;

    notes.forEach(note => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(note.frequency, start + note.offset);
      gain.gain.setValueAtTime(0.0001, start + note.offset);
      gain.gain.exponentialRampToValueAtTime(0.12, start + note.offset + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + note.offset + note.duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start + note.offset);
      oscillator.stop(start + note.offset + note.duration + 0.02);
    });
    return true;
  },

  playRecord() {
    return this.playMelody('record');
  },

  playCity() {
    return this.playMelody('city');
  },

  playGoal() {
    return this.playMelody('goal');
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SoundEffects;
}
