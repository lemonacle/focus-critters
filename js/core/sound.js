// js/core/sound.js

let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

export async function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
}

function playTone({ frequency, duration, startTime, volume = 0.5, type = "sine" }) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export function playFocusAlarm() {
  const ctx = getAudioContext();
  const t = ctx.currentTime + 0.02;

  playTone({ frequency: 880, duration: 0.12, startTime: t });
  playTone({ frequency: 988, duration: 0.12, startTime: t + 0.18 });
  playTone({ frequency: 1174, duration: 0.18, startTime: t + 0.36 });
}

export function playRestAlarm() {
  const ctx = getAudioContext();
  const t = ctx.currentTime + 0.02;

  playTone({ frequency: 523, duration: 0.2, startTime: t, type: "triangle" });
  playTone({ frequency: 392, duration: 0.28, startTime: t + 0.3, type: "triangle" });
}