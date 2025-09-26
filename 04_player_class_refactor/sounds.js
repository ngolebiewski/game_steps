// sounds.js
let audioCtx;

// Lazily create context (must be triggered by user interaction on some browsers)
function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}


// --- Helpers ---
function playTone(freq, duration = 200, type = "square", volume = 0.2) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  gain.gain.value = volume;
  osc.connect(gain).connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration / 1000);
}

// --- Sound Effects ---
export function playBonk() {
  playTone(120, 100, "square", 0.1);
  setTimeout(() => playTone(80, 80, "square", 0.3), 100);
}

export function playWin() {
  const notes = [440, 440, 523, 659]; // A A C E
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 200, "square", 0.25), i * 220);
  });
}

export function playCross() {
  let startFreq = 400;
  const steps = 12;
  for (let i = 0; i < steps; i++) {
    setTimeout(
      () => playTone(startFreq + i * 40, 40, "triangle", 0.2),
      i * 40
    );
  }
}

export function playStart() {
  const pentatonicC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
  const duration = 200;
  pentatonicC.forEach((freq, i) => {
    const dur = i === pentatonicC.length - 1 ? duration * 2 : duration;
    setTimeout(() => playTone(freq, dur, "square", 0.1), i * duration);
  });
}

export function playDeath() {
  const ctx = getCtx();
  const notes = [
    { freq: 523, dur: 200 },
    { freq: 523, dur: 200 },
    { freq: 392, dur: 150 },
    { freq: 330, dur: 400 }
  ];

  let time = ctx.currentTime;
  for (const note of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(note.freq, time);
    gain.gain.setValueAtTime(0.25, time);

    osc.connect(gain).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + note.dur / 1000);

    time += note.dur / 1000;
  }
}


// --- Simple Chiptune Soundtrack (Sequencer) ---
let schedulerId;
let nextNoteTime = 0;
let current16th = 0;

// Settings
const bpm = 120;
const beatDur = 60 / bpm;       // quarter note
const sixteenth = beatDur / 4;  // 16th note
const barLength = 16;           // 16 steps = 1 bar

// Arpeggios
const arpC = [261.63, 311.13, 392.0];   // C harmonic minor
const arpA = [220.0, 261.63, 329.63];   // A minor
const arpGmaj = [196.0, 246.94, 392.0]; // G major
const arpGmin = [196.0, 233.08, 392.0]; // G minor

// Bass drones (root + fifth)
const bass = {
  C: [130.81, 196.0],
  A: [110.0, 164.81],
  G: [98.0, 147.0]
};

function playDrum(isSnare, time) {
  const ctx = getCtx();
  if (isSnare) {
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.25;
    noise.connect(gain).connect(ctx.destination);
    noise.start(time);
    noise.stop(time + 0.1);
  } else {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(60, time);
    gain.gain.setValueAtTime(0.02, time);
    osc.connect(gain).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.15);
  }
}

function playBassDrone(root, fifth, time, dur) {
  const ctx = getCtx();
  [root, fifth].forEach(freq => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.04, time);
    osc.connect(gain).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + dur);
  });
}

function scheduleNote(beatNumber, time) {
  const bar = Math.floor(beatNumber / barLength) % 7;
  let arp, bassNotes;

  if (bar <= 3) {
    arp = arpC;
    bassNotes = bass.C;
  } else if (bar === 4) {
    arp = arpA;
    bassNotes = bass.A;
  } else if (bar === 5) {
    arp = arpGmaj;
    bassNotes = bass.G;
  } else if (bar === 6) {
    arp = arpGmin;
    bassNotes = bass.G;
  }

  const stepInBar = beatNumber % barLength;

  // Drums
  if (stepInBar === 0 || stepInBar === 8) playDrum(false, time); // kick
  if (stepInBar === 4 || stepInBar === 12) playDrum(true, time); // snare

  // Arpeggio
  const note = arp[stepInBar % arp.length];
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(note, time);
  gain.gain.setValueAtTime(0.05, time);
  osc.connect(gain).connect(ctx.destination);
  osc.start(time);
  osc.stop(time + sixteenth * 0.95);

  // Bass drone
  if (stepInBar === 0) {
    playBassDrone(bassNotes[0], bassNotes[1], time, beatDur * 4);
  }
}

function scheduler() {
  const ctx = getCtx();
  while (nextNoteTime < ctx.currentTime + 0.1) {
    scheduleNote(current16th, nextNoteTime);
    nextNoteTime += sixteenth;
    current16th++;
  }
  schedulerId = setTimeout(scheduler, 25);
}

export function startSong() {
  const ctx = getCtx();
  stopSong();
  current16th = 0;
  nextNoteTime = ctx.currentTime + 0.05;
  scheduler();
}

export function stopSong() {
  if (schedulerId) {
    clearTimeout(schedulerId);
    schedulerId = null;
  }
}
