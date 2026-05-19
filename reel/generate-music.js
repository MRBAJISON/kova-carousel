const fs = require("fs");
const path = require("path");

const SR = 44100;
const DUR = 26;
const TOTAL = SR * DUR;
const BPM = 105;
const BEAT = (60 / BPM) * SR;

// Musical notes (Hz)
const NOTE = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99,
};

// Chord progression: Am - F - C - G (classic emotional progression)
const CHORDS = [
  [NOTE.A3, NOTE.C4, NOTE.E4],       // Am
  [NOTE.F3, NOTE.A3, NOTE.C4],       // F
  [NOTE.C3, NOTE.E3, NOTE.G3],       // C
  [NOTE.G3, NOTE.B3, NOTE.D4],       // G
];

// Melody notes over each chord (2 bars = 8 beats per chord)
const MELODY = [
  // Am section
  { note: NOTE.E5, start: 0, dur: 1.5 },
  { note: NOTE.D5, start: 2, dur: 1 },
  { note: NOTE.C5, start: 3, dur: 1.5 },
  { note: NOTE.E5, start: 5, dur: 0.75 },
  { note: NOTE.D5, start: 6, dur: 1.5 },
  // F section
  { note: NOTE.C5, start: 8, dur: 1.5 },
  { note: NOTE.A4, start: 10, dur: 1 },
  { note: NOTE.C5, start: 11.5, dur: 1 },
  { note: NOTE.D5, start: 13, dur: 1.5 },
  // C section
  { note: NOTE.E5, start: 16, dur: 2 },
  { note: NOTE.G5, start: 18.5, dur: 1 },
  { note: NOTE.E5, start: 20, dur: 1.5 },
  { note: NOTE.D5, start: 22, dur: 1 },
  // G section
  { note: NOTE.D5, start: 24, dur: 1.5 },
  { note: NOTE.B4, start: 26, dur: 1 },
  { note: NOTE.D5, start: 27.5, dur: 1 },
  { note: NOTE.G5, start: 29, dur: 2 },
];

function softSine(phase) {
  return Math.sin(phase);
}

function richTone(phase, t, warmth) {
  return (
    softSine(phase) * 0.6 +
    softSine(phase * 2) * 0.2 * warmth +
    softSine(phase * 3) * 0.08 * warmth +
    softSine(phase * 0.5) * 0.12
  );
}

function envelope(t, attack, decay, sustain, release, duration) {
  if (t < 0) return 0;
  if (t < attack) return t / attack;
  if (t < attack + decay) return 1 - (1 - sustain) * ((t - attack) / decay);
  if (t < duration - release) return sustain;
  if (t < duration) return sustain * (1 - (t - (duration - release)) / release);
  return 0;
}

function lowpass(prev, curr, alpha) {
  return prev + alpha * (curr - prev);
}

function generateSample(idx) {
  const t = idx / SR;
  const beatPos = (idx % Math.round(BEAT)) / SR;
  const beatNum = Math.floor(idx / BEAT);
  const barNum = Math.floor(beatNum / 4);
  const totalBeats = t / (60 / BPM);

  let sample = 0;

  // --- PAD: Warm chord pad ---
  const chordIdx = Math.floor(barNum / 2) % 4;
  const chord = CHORDS[chordIdx];
  const padAttack = 0.8;
  const padRelease = 0.6;
  const barDuration = 4 * (60 / BPM) * 2;
  const barTime = t - barNum * (60 / BPM) * 4 / 4 * 4;

  for (const freq of chord) {
    const phase = 2 * Math.PI * freq * t;
    const padEnv = Math.min(1, t / 1.5) * 0.14;
    const vibrato = 1 + 0.002 * Math.sin(2 * Math.PI * 4.5 * t);
    sample += padEnv * richTone(phase * vibrato, t, 0.5);
  }

  // --- MELODY: Soft bell-like lead ---
  for (const m of MELODY) {
    const melStart = m.start * (60 / BPM);
    const melDur = m.dur * (60 / BPM);
    const mt = t - melStart;

    // Loop melody every 32 beats
    const loopLen = 32 * (60 / BPM);
    const loopT1 = t - melStart;
    const loopT2 = t - melStart - loopLen;

    for (const lt of [loopT1, loopT2]) {
      if (lt >= 0 && lt < melDur + 0.3) {
        const melEnv = envelope(lt, 0.01, 0.15, 0.4, 0.3, melDur);
        const phase = 2 * Math.PI * m.note * lt;
        const bellTone = Math.sin(phase) * 0.55 +
          Math.sin(phase * 2) * 0.2 * Math.exp(-lt * 6) +
          Math.sin(phase * 3) * 0.1 * Math.exp(-lt * 8) +
          Math.sin(phase * 4) * 0.05 * Math.exp(-lt * 12);
        sample += melEnv * bellTone * 0.22;
      }
    }
  }

  // --- BASS: Smooth sub bass ---
  const bassNotes = [NOTE.A3, NOTE.F3, NOTE.C3, NOTE.G3];
  const bassFreq = bassNotes[chordIdx] / 2;
  const bassBeatTime = beatPos;
  const bassEnv = envelope(bassBeatTime, 0.01, 0.1, 0.7, 0.08, 60 / BPM);
  sample += 0.18 * bassEnv * Math.sin(2 * Math.PI * bassFreq * t);

  // --- KICK: Soft, deep kick on beats 1 and 3 ---
  const beatInBar = beatNum % 4;
  if (beatInBar === 0 || beatInBar === 2) {
    const kt = beatPos;
    if (kt < 0.15) {
      const kickEnv = Math.exp(-kt / 0.04);
      const kickFreq = 50 + 60 * Math.exp(-kt / 0.015);
      sample += 0.35 * kickEnv * Math.sin(2 * Math.PI * kickFreq * kt);
    }
  }

  // --- SNARE/RIM: Light rim click on beats 2 and 4 ---
  if (beatInBar === 1 || beatInBar === 3) {
    const st = beatPos;
    if (st < 0.06) {
      const snareEnv = Math.exp(-st / 0.012);
      sample += 0.12 * snareEnv * (
        Math.sin(2 * Math.PI * 400 * st) * 0.5 +
        (Math.random() * 2 - 1) * 0.5
      );
    }
  }

  // --- HI-HAT: Gentle closed hat on 8ths ---
  const eighthBeat = BEAT / 2;
  const hhPos = (idx % Math.round(eighthBeat)) / SR;
  if (hhPos < 0.025) {
    const hhEnv = Math.exp(-hhPos / 0.006);
    sample += 0.06 * hhEnv * (Math.random() * 2 - 1);
  }

  // --- SHIMMER: High frequency sparkle at scene transitions ---
  const shimmerTimes = [0, 4.0, 7.7, 13.7, 17.7];
  for (const st of shimmerTimes) {
    const shimT = t - st;
    if (shimT >= 0 && shimT < 0.6) {
      const shimEnv = Math.exp(-shimT / 0.2) * 0.1;
      sample += shimEnv * (
        Math.sin(2 * Math.PI * 2000 * shimT) +
        Math.sin(2 * Math.PI * 3000 * shimT) * 0.5 +
        Math.sin(2 * Math.PI * 4500 * shimT) * 0.25
      );
    }
  }

  // --- RISERS: Upward sweep before scene changes ---
  const riserTimes = [3.2, 6.9, 12.9, 16.9];
  for (const rt of riserTimes) {
    const riseT = t - rt;
    if (riseT >= 0 && riseT < 0.8) {
      const riseEnv = riseT / 0.8 * 0.08;
      const riseFreq = 200 + 3000 * (riseT / 0.8) * (riseT / 0.8);
      sample += riseEnv * (Math.random() * 2 - 1) * Math.sin(2 * Math.PI * riseFreq * riseT * 0.5);
    }
  }

  // --- MASTER: Volume envelope (fade in/out) ---
  let masterVol = 1;
  if (t < 0.5) masterVol = t / 0.5;
  if (t > DUR - 1.5) masterVol = (DUR - t) / 1.5;
  masterVol = Math.max(0, Math.min(1, masterVol));

  return Math.max(-1, Math.min(1, sample * masterVol));
}

// Apply simple low-pass filter
const buffer = Buffer.alloc(44 + TOTAL * 2);

// WAV header
buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + TOTAL * 2, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(1, 22);
buffer.writeUInt32LE(SR, 24);
buffer.writeUInt32LE(SR * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(TOTAL * 2, 40);

let prev = 0;
const filterAlpha = 0.35;

for (let i = 0; i < TOTAL; i++) {
  let raw = generateSample(i);
  // Gentle low-pass to smooth harshness
  raw = prev + filterAlpha * (raw - prev);
  prev = raw;

  // Soft clipping
  if (raw > 0.8) raw = 0.8 + (raw - 0.8) * 0.3;
  if (raw < -0.8) raw = -0.8 + (raw + 0.8) * 0.3;

  const intSample = Math.max(-32768, Math.min(32767, Math.round(raw * 32767 * 0.75)));
  buffer.writeInt16LE(intSample, 44 + i * 2);
}

const outPath = path.join(__dirname, "public", "bgm.wav");
fs.writeFileSync(outPath, buffer);
console.log(`Generated ${outPath} (${(buffer.length / 1024 / 1024).toFixed(1)} MB, ${DUR}s, ${BPM}bpm)`);
