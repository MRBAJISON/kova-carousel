const fs = require("fs");
const path = require("path");

const SAMPLE_RATE = 44100;
const DURATION = 26;
const TOTAL_SAMPLES = SAMPLE_RATE * DURATION;
const BPM = 120;
const BEAT_INTERVAL = (60 / BPM) * SAMPLE_RATE;

function generateSample(t, sampleRate) {
  let sample = 0;
  const beatPos = t % BEAT_INTERVAL;
  const beatNum = Math.floor(t / BEAT_INTERVAL);

  // Kick drum - punchy low sine with fast decay
  if (beatPos < sampleRate * 0.12) {
    const env = Math.exp(-beatPos / (sampleRate * 0.04));
    const freq = 60 + 80 * Math.exp(-beatPos / (sampleRate * 0.02));
    sample += 0.5 * env * Math.sin(2 * Math.PI * freq * beatPos / sampleRate);
  }

  // Hi-hat on off-beats
  const halfBeat = BEAT_INTERVAL / 2;
  const offBeatPos = (t + halfBeat / 2) % halfBeat;
  if (offBeatPos < sampleRate * 0.03) {
    const env = Math.exp(-offBeatPos / (sampleRate * 0.008));
    sample += 0.12 * env * (Math.random() * 2 - 1);
  }

  // Subtle bass line - follows a pattern
  const barPos = t % (BEAT_INTERVAL * 4);
  const noteInBar = Math.floor(barPos / BEAT_INTERVAL);
  const bassFreqs = [55, 55, 65.41, 49.0];
  const bassFreq = bassFreqs[noteInBar];
  const bassEnv = Math.exp(-(beatPos) / (sampleRate * 0.3));
  sample += 0.15 * bassEnv * Math.sin(2 * Math.PI * bassFreq * t / sampleRate);

  // Notification "ding" sounds at specific moments (scene transitions)
  const timeInSeconds = t / sampleRate;
  const dingTimes = [0.5, 1.3, 2.1, 2.6, 4.0, 7.7, 13.7, 17.7];
  for (const dt of dingTimes) {
    const dingOffset = (timeInSeconds - dt) * sampleRate;
    if (dingOffset >= 0 && dingOffset < sampleRate * 0.3) {
      const dingEnv = Math.exp(-dingOffset / (sampleRate * 0.08));
      sample += 0.15 * dingEnv * Math.sin(2 * Math.PI * 880 * dingOffset / sampleRate);
      sample += 0.08 * dingEnv * Math.sin(2 * Math.PI * 1320 * dingOffset / sampleRate);
    }
  }

  // Subtle pad/atmosphere
  const padFreq = 220;
  const pad = 0.03 * Math.sin(2 * Math.PI * padFreq * t / sampleRate)
    + 0.02 * Math.sin(2 * Math.PI * padFreq * 1.5 * t / sampleRate)
    + 0.015 * Math.sin(2 * Math.PI * padFreq * 2 * t / sampleRate);
  const padSwell = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.25 * t / sampleRate);
  sample += pad * padSwell;

  // Swoosh at scene transitions
  const swooshTimes = [4.0, 7.7, 13.7, 17.7];
  for (const st of swooshTimes) {
    const swooshOffset = (timeInSeconds - st) * sampleRate;
    if (swooshOffset >= 0 && swooshOffset < sampleRate * 0.4) {
      const swooshEnv = Math.exp(-swooshOffset / (sampleRate * 0.15));
      const swooshFreq = 200 + 2000 * Math.exp(-swooshOffset / (sampleRate * 0.1));
      sample += 0.08 * swooshEnv * (Math.random() * 2 - 1) * Math.sin(2 * Math.PI * swooshFreq * swooshOffset / sampleRate);
    }
  }

  return Math.max(-1, Math.min(1, sample));
}

const buffer = Buffer.alloc(44 + TOTAL_SAMPLES * 2);

// WAV header
buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + TOTAL_SAMPLES * 2, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20); // PCM
buffer.writeUInt16LE(1, 22); // Mono
buffer.writeUInt32LE(SAMPLE_RATE, 24);
buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(TOTAL_SAMPLES * 2, 40);

for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const sample = generateSample(i, SAMPLE_RATE);
  const intSample = Math.max(-32768, Math.min(32767, Math.round(sample * 32767 * 0.7)));
  buffer.writeInt16LE(intSample, 44 + i * 2);
}

const outPath = path.join(__dirname, "public", "bgm.wav");
fs.writeFileSync(outPath, buffer);
console.log(`Generated ${outPath} (${(buffer.length / 1024 / 1024).toFixed(1)} MB, ${DURATION}s)`);
