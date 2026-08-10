/* ═══════════════════════════════════════════════════════════
   FORUM TIMER, web app
   A faithful port of the Forum Timer iOS app (v1.1) to the
   browser: quick timer, agenda-based timer, synthesized
   overtime melodies, escalation curves, bars + clock face.

   VERSION 1.0.0 · 2026-08-10
   Changelog lives on the page (timer.html #changelog) and in
   the repo CHANGELOG.md.
   ═══════════════════════════════════════════════════════════ */
'use strict';

/* ── Thresholds (shared by bars + dial, same story everywhere) ── */
const YELLOW_T = 0.40;   /* green above 40% remaining */
const RED_T    = 0.15;   /* brick below 15% */

const ZONE_COLORS = {
  green: '#3A8A5A',   /* proposed FP Green, structural sibling of Teal */
  gold:  '#D4A832',   /* FP Gold */
  brick: '#B83A14',   /* FP Brick */
};

function zoneColor(frac) {
  if (frac <= RED_T) return ZONE_COLORS.brick;
  if (frac <= YELLOW_T) return ZONE_COLORS.gold;
  return ZONE_COLORS.green;
}
function zoneIndexFor(frac) {
  if (frac <= RED_T) return 2;
  if (frac <= YELLOW_T) return 1;
  return 0;
}

/* ── Time formatting (Clock in Support.swift) ── */
const Clock = {
  mmss(interval) {
    const negative = interval < -0.5;
    const total = Math.floor(Math.abs(interval));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${negative ? '-' : ''}${m}:${String(s).padStart(2, '0')}`;
  },
  durationLabel(seconds) {
    const m = Math.floor(seconds / 60);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem === 0 ? `${h}h` : `${h}h ${String(rem).padStart(2, '0')}m`;
  },
  lengthLabel(seconds) {
    const m = Math.floor(Math.max(0, seconds) / 60);
    const h = Math.floor(m / 60);
    const rem = m % 60;
    if (h === 0) return `${rem}m`;
    return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
  },
  timeOfDay(date) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  },
};

/* ── Enums (Models.swift) ── */
const NOTIFY_POINTS = [
  { id: 'off',     label: 'Off',       seconds: () => null },
  { id: 's30',     label: '0:30 left', seconds: () => 30 },
  { id: 'm1',      label: '1:00 left', seconds: () => 60 },
  { id: 'm2',      label: '2:00 left', seconds: () => 120 },
  { id: 'm5',      label: '5:00 left', seconds: () => 300 },
  { id: 'halfway', label: 'Halfway',   seconds: (total) => Math.max(1, Math.floor(total / 2)) },
];
const notifyPoint = (id) => NOTIFY_POINTS.find(p => p.id === id) || NOTIFY_POINTS[2];

const TIMES_UP_STYLES = {
  gentle: {
    label: 'Gentle', overtimeLabel: 'Wrapping up…',
    entranceVolume: 0.35, dipVolume: 0.25, dipStart: 4, rampStart: 10, rampDuration: 35, maxVolume: 0.7,
    flashBases: [0.35, 0.45, 0.55, 0.62], flashSteps: [15, 30, 45], breatheAmp: 0.05, breatheHz: 0.25,
  },
  assertive: {
    label: 'Assertive', overtimeLabel: 'Time, tap Reset when done',
    entranceVolume: 0.55, dipVolume: 0.32, dipStart: 4, rampStart: 9, rampDuration: 18, maxVolume: 1.0,
    flashBases: [0.45, 0.62, 0.78, 0.92], flashSteps: [10, 20, 30], breatheAmp: 0.08, breatheHz: 0.35,
  },
  aggressive: {
    label: 'Aggressive', overtimeLabel: "TIME'S UP!",
    entranceVolume: 0.75, dipVolume: 0.55, dipStart: 2, rampStart: 5, rampDuration: 7, maxVolume: 1.0,
    flashBases: [0.60, 0.78, 0.90, 1.00], flashSteps: [5, 10, 20], breatheAmp: 0.10, breatheHz: 0.50,
  },
};

const SOUNDS = [
  { id: 'forumPattern',   label: 'Forum Chimes' },
  { id: 'williamTell',    label: 'William Tell, Rossini' },
  { id: 'ballinTheJack',  label: "Ballin' the Jack, 1913" },
  { id: 'buffaloGals',    label: 'Buffalo Gals, Traditional' },
  { id: 'afterYouveGone', label: "After You've Gone, 1918" },
  { id: 'stLouisBlues',   label: 'St. Louis Blues, W.C. Handy' },
  { id: 'risingSun',      label: 'House of the Rising Sun, Traditional' },
];

const VOICES = [
  { id: 'piano',  label: 'Piano' },
  { id: 'guitar', label: 'Guitar' },
  { id: 'chime',  label: 'Chime' },
];

const ALERT_STYLES = [
  { id: 'audio',   label: 'Sound + vibration', audio: true,  vibrate: true },
  { id: 'vibrate', label: 'Vibration only',    audio: false, vibrate: true },
  { id: 'silent',  label: 'Silent',            audio: false, vibrate: false },
];
const alertStyle = (id) => ALERT_STYLES.find(s => s.id === id) || ALERT_STYLES[0];

/* ── Built-in templates (ForumDefaults, Colton's real structure) ── */
const BUILTIN_STANDARD_ID = 'builtin-standard-forum';
const BUILTIN_EXPRESS_ID  = 'builtin-express';

function builtinTemplates() {
  return [
    {
      id: BUILTIN_STANDARD_ID, name: 'Standard Forum', isBuiltIn: true,
      segments: [
        { kind: 'single', title: 'One-word Check-in', seconds: 5 * 60 },
        { kind: 'single', title: 'Goal Setting', seconds: 20 * 60 },
        { kind: 'roundRobin', title: 'Member Updates', perPersonSeconds: 5 * 60 },
        { kind: 'single', title: 'Accountability', seconds: 20 * 60 },
        { kind: 'single', title: 'Break', seconds: 10 * 60 },
        { kind: 'protocolBlock', title: 'Deep Dive', phases: [
          { title: 'Frame the issue', seconds: 10 * 60 },
          { title: 'Experience sharing', seconds: 35 * 60 },
          { title: 'Takeaways / commitments', seconds: 10 * 60 },
        ]},
        { kind: 'single', title: 'Break', seconds: 10 * 60 },
        { kind: 'protocolBlock', title: 'Deep Dive 2', phases: [
          { title: 'Frame the issue', seconds: 10 * 60 },
          { title: 'Experience sharing', seconds: 35 * 60 },
          { title: 'Takeaways / commitments', seconds: 10 * 60 },
        ]},
        { kind: 'single', title: 'Housekeeping & Scheduling', seconds: 20 * 60 },
        { kind: 'single', title: 'One-word Close', seconds: 5 * 60 },
      ],
    },
    {
      id: BUILTIN_EXPRESS_ID, name: 'Express', isBuiltIn: true,
      segments: [
        { kind: 'single', title: 'One-word Check-in', seconds: 5 * 60 },
        { kind: 'roundRobin', title: 'Member Updates', perPersonSeconds: 3 * 60 },
        { kind: 'protocolBlock', title: 'Deep Dive', phases: [
          { title: 'Frame the issue', seconds: 5 * 60 },
          { title: 'Experience sharing', seconds: 15 * 60 },
          { title: 'Takeaways', seconds: 5 * 60 },
        ]},
        { kind: 'single', title: 'Housekeeping & Scheduling', seconds: 5 * 60 },
        { kind: 'single', title: 'One-word Close', seconds: 5 * 60 },
      ],
    },
  ];
}

function segmentPlannedSeconds(segment, rosterCount) {
  if (segment.kind === 'single') return segment.seconds || 0;
  if (segment.kind === 'roundRobin') return (segment.perPersonSeconds || 0) * Math.max(rosterCount, 0);
  return (segment.phases || []).reduce((sum, p) => sum + p.seconds, 0);
}
function templatePlannedSeconds(template, rosterCount) {
  return template.segments.reduce((sum, s) => sum + segmentPlannedSeconds(s, rosterCount), 0);
}

/* ── Store (Store.swift → localStorage) ── */
const STORE_KEY = 'fp.forumtimer.v1';

const S = {
  alertStyle: 'audio',
  warningSeconds: 60,       /* agenda timer pre-ending alert */
  notifyPoint: 'm1',        /* quick timer pre-ending alert */
  overtimeSound: 'buffaloGals',
  timesUpStyle: 'assertive',
  soundVoice: 'guitar',
  duetLayer: false,
  displayMode: 'bars',      /* bars | dial */
  timerTheme: 'system',     /* system | light | dark */
  sequences: [],            /* saved cadences [{id,name,durations}] */
  userTemplates: [],
  roster: ['Member 1', 'Member 2', 'Member 3', 'Member 4',
           'Member 5', 'Member 6', 'Member 7', 'Member 8'],
};

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    for (const key of Object.keys(S)) {
      if (data[key] !== undefined) S[key] = data[key];
    }
    if (!Array.isArray(S.roster) || S.roster.length === 0) S.roster = ['Member 1'];
  } catch (e) { /* first visit or corrupt storage; defaults stand */ }
}
function saveStore() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* private mode */ }
}
function allTemplates() {
  /* Built-ins always come fresh from code (stable ids); user copies kept. */
  return builtinTemplates().concat(S.userTemplates);
}
const uid = () => 'id-' + Math.random().toString(36).slice(2, 10);

/* ═══════════════════════════════════════════════════════════
   AUDIO (AlertManager.swift → Web Audio)
   All melodies are public-domain compositions synthesized from
   note data. Three instrument voices: chime (pure tone), piano
   (FM electric piano), guitar (Karplus-Strong plucked string).
   ═══════════════════════════════════════════════════════════ */
const AudioKit = {
  ctx: null,
  bufferCache: new Map(),
  overtimeState: null,      /* {source, gain, startedAt, interval} */
  previewNode: null,

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  hz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); },

  /* One note as raw samples in the given voice. Every voice ends in a
     release fade to exactly zero, so nothing clicks. */
  renderNote(freq, frames, sr, amplitude, voice) {
    if (frames <= 1) return new Float64Array(0);
    const out = new Float64Array(frames);
    const twoPiF = 2 * Math.PI * freq;

    if (voice === 'chime') {
      const attackFrames = 0.004 * sr;
      for (let i = 0; i < frames; i++) {
        const t = i / sr;
        const env = Math.min(1, i / attackFrames) * Math.exp(-t * 5.5);
        const tone = Math.sin(twoPiF * t) + 0.08 * Math.sin(2 * twoPiF * t) * Math.exp(-t * 9.0);
        out[i] = tone * env * amplitude;
      }
    } else if (voice === 'piano') {
      /* 1:1 FM synthesis, the classic electric-piano technique. */
      const attackFrames = 0.002 * sr;
      for (let i = 0; i < frames; i++) {
        const t = i / sr;
        const index = 2.2 * Math.exp(-t * 7.0);
        const env = Math.min(1, i / attackFrames) * Math.exp(-t * 4.5);
        out[i] = Math.sin(twoPiF * t + index * Math.sin(twoPiF * t)) * env * amplitude;
      }
    } else {
      /* Karplus-Strong: noise circulating through a tuned, averaged
         delay line IS a plucked string. */
      const n = Math.max(2, Math.floor(sr / freq));
      const delay = new Float64Array(n);
      for (let i = 0; i < n; i++) delay[i] = Math.random() * 2 - 1;
      let idx = 0;
      for (let i = 0; i < frames; i++) {
        const sample = delay[idx];
        delay[idx] = 0.5 * (delay[idx] + delay[(idx + 1) % n]) * 0.995;
        idx = (idx + 1) % n;
        out[i] = sample * amplitude * 0.9;
      }
    }

    const releaseFrames = Math.max(1, Math.min(Math.floor(frames / 2), Math.floor(0.03 * sr)));
    for (let i = 0; i < releaseFrames; i++) {
      out[frames - 1 - i] *= i / releaseFrames;
    }
    return out;
  },

  /* Sum timed note layers into one looping AudioBuffer: de-clicked seam,
     0.82 peak normalization (a duet can never clip harder than a solo). */
  renderLayers(layers, loopLength) {
    const ctx = this.ensure();
    if (!ctx) return null;
    const sr = ctx.sampleRate;
    const totalFrames = Math.max(1, Math.floor(sr * loopLength));
    const mix = new Float64Array(totalFrames);

    for (const layer of layers) {
      for (const [start, freq] of layer.events) {
        const startFrame = Math.floor(start * sr);
        const noteFrames = Math.floor(layer.noteDecay * sr);
        const note = this.renderNote(freq, noteFrames, sr, layer.amplitude, layer.voice);
        for (let i = 0; i < note.length; i++) {
          const idx = startFrame + i;
          if (idx >= totalFrames) break;
          mix[idx] += note[i];
        }
      }
    }

    const seamFrames = Math.min(totalFrames, Math.floor(0.03 * sr));
    for (let i = 0; i < seamFrames; i++) {
      mix[totalFrames - 1 - i] *= i / seamFrames;
    }

    let peak = 0;
    for (let i = 0; i < totalFrames; i++) peak = Math.max(peak, Math.abs(mix[i]));
    const scale = peak > 0.82 ? 0.82 / peak : 1.0;

    const buffer = ctx.createBuffer(1, totalFrames, sr);
    const ch = buffer.getChannelData(0);
    for (let i = 0; i < totalFrames; i++) {
      ch[i] = Math.max(-1, Math.min(1, mix[i] * scale));
    }
    return buffer;
  },

  duetVoice(melodyVoice) { return melodyVoice === 'guitar' ? 'piano' : 'guitar'; },

  /* Build a loop from (time, MIDI) pairs, optionally with the low
     harmony line in a complementary voice (130-260 Hz register). */
  chimeSequence(notes, opts) {
    const { decay, loop, amplitude = 0.45, voice, duet = false, bass = [], bassDecay = 1.1 } = opts;
    const layers = [{
      events: notes.map(([t, midi]) => [t, this.hz(midi)]),
      noteDecay: decay, amplitude, voice,
    }];
    if (duet && bass.length) {
      layers.push({
        events: bass.map(([t, midi]) => [t, this.hz(midi)]),
        noteDecay: bassDecay, amplitude: 0.32, voice: this.duetVoice(voice),
      });
    }
    return this.renderLayers(layers, loop);
  },

  /* The melody library, note-for-note from the iOS app. */
  buildMelody(soundId, voice, duet) {
    switch (soundId) {
      case 'ballinTheJack':
        /* Smith/Burris 1913, syncopated ragtime strut. */
        return this.chimeSequence([
          [0.00, 64], [0.25, 67], [0.55, 67], [0.85, 67],
          [1.15, 69], [1.45, 67], [1.85, 64],
          [2.80, 64], [3.05, 67], [3.35, 67], [3.65, 69],
          [3.95, 72], [4.25, 69], [4.65, 67],
        ], { decay: 0.5, loop: 5.6, voice, duet, bass: [
          [0.00, 48], [0.70, 55], [1.40, 48], [2.10, 55],
          [2.80, 48], [3.50, 55], [4.20, 50], [4.90, 55],
        ]});
      case 'buffaloGals':
        /* Traditional 1844, the fiddle-tune chorus. */
        return this.chimeSequence([
          [0.00, 72], [0.28, 72], [0.56, 74], [0.84, 72],
          [1.12, 69], [1.40, 67], [1.68, 69], [1.96, 72],
          [2.52, 69], [2.80, 67], [3.08, 69], [3.36, 72],
          [3.92, 69], [4.20, 67], [4.48, 69], [4.76, 72],
          [5.32, 67], [5.60, 69], [5.88, 72], [6.16, 72],
          [6.44, 74], [6.72, 76], [7.00, 74], [7.28, 72],
        ], { decay: 0.45, loop: 8.0, voice, duet, bass: [
          [0.00, 48], [0.56, 55], [1.12, 48], [1.68, 55],
          [2.52, 55], [3.08, 50], [3.92, 55], [4.48, 50],
          [5.32, 48], [5.88, 55], [6.44, 48], [7.00, 55],
        ]});
      case 'afterYouveGone':
        /* Creamer & Layton 1918, the wistful hook. */
        return this.chimeSequence([
          [0.00, 76], [0.40, 76], [0.80, 72], [1.20, 72],
          [2.20, 74], [2.60, 74], [3.00, 71], [3.40, 72],
          [4.40, 76], [4.80, 74], [5.20, 72], [5.60, 69], [6.00, 67],
        ], { decay: 0.8, loop: 7.0, voice, duet, bass: [
          [0.00, 48], [1.20, 52], [2.20, 55], [3.40, 55],
          [4.40, 48], [5.20, 57], [6.00, 55],
        ], bassDecay: 1.3 });
      case 'stLouisBlues':
        /* W.C. Handy 1914, the evening-sun strain, blue thirds and all. */
        return this.chimeSequence([
          [0.00, 74], [0.45, 74], [0.90, 74], [1.35, 70], [1.80, 67],
          [3.00, 67], [3.35, 70], [3.70, 71], [4.05, 69], [4.40, 67],
          [5.60, 72], [5.95, 74], [6.30, 70], [6.65, 69], [7.00, 67],
        ], { decay: 0.7, loop: 8.2, voice, duet, bass: [
          [0.00, 55], [0.90, 50], [1.80, 55], [3.00, 48],
          [3.70, 48], [4.40, 55], [5.60, 50], [6.30, 50], [7.00, 55],
        ], bassDecay: 1.2 });
      case 'risingSun':
        /* Traditional, minor-key climb. Melody only, no arrangement imitated. */
        return this.chimeSequence([
          [0.00, 69], [0.35, 72], [0.70, 74], [1.05, 76],
          [2.00, 76], [2.35, 79], [2.70, 81],
          [3.70, 81], [4.05, 79], [4.40, 76],
          [5.30, 72], [5.65, 74], [6.00, 76], [6.35, 74],
          [6.70, 72], [7.05, 69],
        ], { decay: 0.9, loop: 8.0, voice, duet, bass: [
          [0.00, 57], [1.05, 60], [2.00, 62], [3.00, 53],
          [3.70, 57], [4.40, 52], [5.30, 57], [6.70, 52], [7.05, 57],
        ], bassDecay: 1.3 });
      case 'williamTell':
        /* Rossini, the gallop. */
        return this.chimeSequence([
          [0.00, 67], [0.15, 67], [0.30, 72],
          [0.75, 67], [0.90, 67], [1.05, 76],
          [1.50, 67], [1.65, 67], [1.80, 72], [1.95, 76], [2.10, 79],
          [2.85, 76], [3.00, 72],
          [3.60, 67], [3.75, 67], [3.90, 72],
          [4.35, 67], [4.50, 67], [4.65, 76],
          [5.10, 67], [5.25, 67], [5.40, 76], [5.55, 74], [5.70, 72],
        ], { decay: 0.45, loop: 6.3, voice, duet, bass: [
          [0.00, 48], [0.75, 48], [1.50, 48], [2.25, 55],
          [2.85, 48], [3.60, 48], [4.35, 48], [5.10, 55], [5.70, 48],
        ], bassDecay: 0.8 });
      default: {
        /* Forum Chimes: descending low/mid/high stacks on C major, walks
           down, breathes, walks down again, resolves low for the loop. */
        const scale = {
          1: 261.63, 2: 293.66, 3: 329.63, 4: 349.23, 5: 392.00,
          6: 440.00, 7: 493.88, 8: 523.25, 9: 587.33, 10: 659.25,
        };
        const groups = [
          [3, 7, 10], [2, 6, 9], [1, 5, 8], [2, 6, 8],
          [3, 7, 10], [2, 6, 9], [1, 5, 8], [1, 4, 8],
        ];
        const groupSpacing = 0.80;
        const rollOffset = 0.09;
        const events = [];
        groups.forEach((group, g) => {
          group.forEach((degree, i) => {
            if (scale[degree]) events.push([g * groupSpacing + i * rollOffset, scale[degree]]);
          });
        });
        const layers = [{ events, noteDecay: 0.7, amplitude: 0.45, voice }];
        if (duet) {
          const roots = [48, 55, 48, 55, 48, 55, 48, 48];
          layers.push({
            events: roots.map((midi, i) => [i * groupSpacing, this.hz(midi)]),
            noteDecay: 1.1, amplitude: 0.32, voice: this.duetVoice(voice),
          });
        }
        return this.renderLayers(layers, groups.length * groupSpacing);
      }
    }
  },

  melodyBuffer(soundId, voice, duet) {
    const key = `${soundId}|${voice}|${duet ? 1 : 0}`;
    if (!this.bufferCache.has(key)) {
      const buf = this.buildMelody(soundId, voice, duet);
      if (!buf) return null;
      this.bufferCache.set(key, buf);
    }
    return this.bufferCache.get(key);
  },

  /* Beeps: soft sine envelope, never clicks. Warning = one 660 Hz beep,
     final = a firmer 880 Hz double beep. */
  beepBuffer(frequency, duration, beeps, gap, amplitude) {
    const ctx = this.ensure();
    if (!ctx) return null;
    const key = `beep|${frequency}|${duration}|${beeps}|${gap}`;
    if (this.bufferCache.has(key)) return this.bufferCache.get(key);
    const sr = ctx.sampleRate;
    const beepFrames = Math.max(1, Math.floor(sr * duration));
    const gapFrames = Math.floor(sr * gap);
    const totalFrames = beeps * beepFrames + Math.max(0, beeps - 1) * gapFrames;
    const buffer = ctx.createBuffer(1, totalFrames, sr);
    const ch = buffer.getChannelData(0);
    const cycle = beepFrames + gapFrames;
    const twoPiF = 2 * Math.PI * frequency;
    for (let frame = 0; frame < totalFrames; frame++) {
      const pos = cycle > 0 ? frame % cycle : frame;
      if (pos >= beepFrames) continue;
      const t = pos / sr;
      const envelope = Math.sin(Math.PI * pos / beepFrames);
      ch[frame] = Math.max(-1, Math.min(1, Math.sin(twoPiF * t) * envelope * amplitude));
    }
    this.bufferCache.set(key, buffer);
    return buffer;
  },

  playOnce(buffer, volume = 1.0) {
    const ctx = this.ensure();
    if (!ctx || !buffer) return null;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(ctx.destination);
    source.start();
    return { source, gain };
  },

  fireWarning(style) {
    if (style.audio) this.playOnce(this.beepBuffer(660, 0.35, 1, 0, 0.6));
    if (style.vibrate && navigator.vibrate) navigator.vibrate([250]);
  },
  fireFinal(style) {
    if (style.audio) this.playOnce(this.beepBuffer(880, 0.30, 2, 0.12, 0.6));
    if (style.vibrate && navigator.vibrate) navigator.vibrate([150, 90, 150]);
  },
  zoneTap(style) {
    if (style.vibrate && navigator.vibrate) navigator.vibrate([80]);
  },

  /* The looping playoff riff: enters clearly, pulls back so the speaker
     can wrap up, then builds to max. Curve shaped by the Time's Up style. */
  startOvertime(style) {
    if (!style.audio || this.overtimeState) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const buffer = this.melodyBuffer(S.overtimeSound, S.soundVoice, S.duetLayer);
    if (!buffer) return;
    this.stopPreview();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = ctx.createGain();
    const curve = TIMES_UP_STYLES[S.timesUpStyle] || TIMES_UP_STYLES.assertive;
    gain.gain.value = curve.entranceVolume;
    source.connect(gain).connect(ctx.destination);
    source.start();
    const startedAt = Date.now();
    const interval = setInterval(() => {
      const state = this.overtimeState;
      if (!state) return;
      const t = (Date.now() - state.startedAt) / 1000;
      const s = TIMES_UP_STYLES[S.timesUpStyle] || TIMES_UP_STYLES.assertive;
      let target;
      if (t < s.dipStart) target = s.entranceVolume;
      else if (t < s.rampStart) target = s.dipVolume;
      else {
        const fraction = Math.min(1, (t - s.rampStart) / s.rampDuration);
        target = s.dipVolume + fraction * (s.maxVolume - s.dipVolume);
      }
      state.gain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.2);
    }, 500);
    this.overtimeState = { source, gain, startedAt, interval };
  },

  stopOvertime() {
    const state = this.overtimeState;
    if (!state) return;
    clearInterval(state.interval);
    try { state.source.stop(); } catch (e) { /* already stopped */ }
    this.overtimeState = null;
  },

  /* Swap the melody mid-overtime at the loudness the curve says it should
     have by now (never blast at max after a swap). */
  rebuildOvertimeIfPlaying() {
    const state = this.overtimeState;
    if (!state) return;
    const startedAt = state.startedAt;
    this.stopOvertime();
    const ctx = this.ensure();
    const buffer = this.melodyBuffer(S.overtimeSound, S.soundVoice, S.duetLayer);
    if (!ctx || !buffer) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = ctx.createGain();
    const s = TIMES_UP_STYLES[S.timesUpStyle] || TIMES_UP_STYLES.assertive;
    const t = (Date.now() - startedAt) / 1000;
    let level;
    if (t < s.dipStart) level = s.entranceVolume;
    else if (t < s.rampStart) level = s.dipVolume;
    else level = s.dipVolume + Math.min(1, (t - s.rampStart) / s.rampDuration) * (s.maxVolume - s.dipVolume);
    gain.gain.value = level;
    source.connect(gain).connect(ctx.destination);
    source.start();
    const interval = setInterval(() => {
      const st = this.overtimeState;
      if (!st) return;
      const tt = (Date.now() - st.startedAt) / 1000;
      const ss = TIMES_UP_STYLES[S.timesUpStyle] || TIMES_UP_STYLES.assertive;
      let target;
      if (tt < ss.dipStart) target = ss.entranceVolume;
      else if (tt < ss.rampStart) target = ss.dipVolume;
      else target = ss.dipVolume + Math.min(1, (tt - ss.rampStart) / ss.rampDuration) * (ss.maxVolume - ss.dipVolume);
      st.gain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.2);
    }, 500);
    this.overtimeState = { source, gain, startedAt, interval };
  },

  /* Audition a melody once at a fixed volume (no loop, no escalation).
     Never disturbs a live overtime loop; a new tap cuts off the last. */
  previewMelody(soundId) {
    if (this.overtimeState) return;
    this.stopPreview();
    const buffer = this.melodyBuffer(soundId, S.soundVoice, S.duetLayer);
    this.previewNode = this.playOnce(buffer, 0.7);
  },
  previewAlert() {
    this.fireFinal(alertStyle(S.alertStyle));
  },
  stopPreview() {
    if (this.previewNode) {
      try { this.previewNode.source.stop(); } catch (e) { /* fine */ }
      this.previewNode = null;
    }
  },
};

/* ═══════════════════════════════════════════════════════════
   QUICK TIMER ENGINE (QuickTimerEngine.swift)
   Drift-free: remaining is always derived from a wall-clock end
   date, so a throttled background tab never loses time.
   ═══════════════════════════════════════════════════════════ */
class QuickEngine {
  constructor(onChange) {
    this.onChange = onChange;
    this.remaining = 0;       /* seconds, negative in overtime */
    this.totalSeconds = 0;
    this.isRunning = false;
    this.queue = [];
    this.notify = S.notifyPoint;
    this.endAt = null;        /* ms epoch */
    this.warned = false;
    this.finaled = false;
    this.interval = null;
  }

  get hasTime() { return this.totalSeconds > 0; }
  get isOvertime() { return this.hasTime && this.remaining <= 0; }
  get fractionRemaining() {
    if (this.totalSeconds <= 0) return 0;
    return Math.max(0, Math.min(1, this.remaining / this.totalSeconds));
  }
  projectedEnd() {
    const queued = this.queue.reduce((a, b) => a + b, 0);
    return new Date(Date.now() + (Math.max(this.remaining, 0) + queued) * 1000);
  }

  setNotify(id) { this.notify = id; this.armWarning(); this.emit(); }

  addSeconds(n) {
    if (n <= 0) return;
    AudioKit.ensure();   /* user gesture: unlock audio for the session */
    if (!this.hasTime) {
      this.totalSeconds = n;
      this.remaining = n;
      this.finaled = false;
      this.armWarning();
      this.resume();
    } else {
      if (this.isRunning) this.remaining = this.currentRemaining();
      this.totalSeconds += n;
      this.remaining += n;
      if (this.isRunning) this.endAt = Date.now() + this.remaining * 1000;
      if (this.remaining > 0) {
        this.finaled = false;
        AudioKit.stopOvertime();
      }
      this.armWarning();
    }
    this.emit();
  }

  queueSeconds(n) {
    if (n <= 0) return;
    this.queue.push(n);
    if (this.isOvertime && this.isRunning) this.loadNextQueued();
    this.emit();
  }
  removeQueued(index) {
    if (index < 0 || index >= this.queue.length) return;
    this.queue.splice(index, 1);
    this.emit();
  }
  advanceNow() {
    if (!this.queue.length) return;
    this.loadNextQueued();
    this.emit();
  }

  pauseResume() { this.isRunning ? this.pause() : this.resume(); this.emit(); }

  reset() {
    clearInterval(this.interval);
    this.interval = null;
    this.endAt = null;
    this.isRunning = false;
    this.remaining = 0;
    this.totalSeconds = 0;
    this.queue = [];
    this.warned = false;
    this.finaled = false;
    AudioKit.stopOvertime();
    this.emit();
  }

  runSequence(seq) {
    const first = seq.durations[0];
    if (!first || first <= 0) return;
    AudioKit.ensure();
    clearInterval(this.interval);
    this.interval = null;
    AudioKit.stopOvertime();
    this.totalSeconds = first;
    this.remaining = first;
    this.queue = seq.durations.slice(1);
    this.finaled = false;
    this.armWarning();
    this.resume();
    this.emit();
  }

  pause() {
    if (!this.isRunning) return;
    this.remaining = this.currentRemaining();
    this.isRunning = false;
    this.endAt = null;
    clearInterval(this.interval);
    this.interval = null;
    AudioKit.stopOvertime();
  }

  resume() {
    if (!this.hasTime) return;
    this.isRunning = true;
    this.endAt = Date.now() + this.remaining * 1000;
    this.startTicking();
    if (this.isOvertime) {
      if (this.queue.length) this.loadNextQueued();
      else AudioKit.startOvertime(alertStyle(S.alertStyle));
    }
  }

  /* Re-arm against current remaining so the beep only fires on a genuine
     downward crossing (never retroactively after +time or a mid-run change). */
  armWarning() {
    const threshold = notifyPoint(this.notify).seconds(this.totalSeconds);
    this.warned = threshold == null ? true : this.remaining <= threshold;
  }

  loadNextQueued() {
    if (!this.queue.length) return;
    AudioKit.stopOvertime();
    const n = this.queue.shift();
    this.totalSeconds = n;
    this.remaining = n;
    this.finaled = false;
    this.armWarning();
    if (this.isRunning) this.endAt = Date.now() + this.remaining * 1000;
  }

  currentRemaining() {
    if (!this.isRunning || this.endAt == null) return this.remaining;
    return (this.endAt - Date.now()) / 1000;
  }

  startTicking() {
    clearInterval(this.interval);
    this.interval = setInterval(() => this.tick(), 100);
  }

  tick() {
    if (!this.isRunning || this.endAt == null) return;
    this.remaining = (this.endAt - Date.now()) / 1000;

    const threshold = notifyPoint(this.notify).seconds(this.totalSeconds);
    if (!this.warned && threshold != null && this.remaining <= threshold && this.remaining > 0) {
      this.warned = true;
      AudioKit.fireWarning(alertStyle(S.alertStyle));
      App.warningFlashPulse();
    }

    if (!this.finaled && this.remaining <= 0) {
      this.finaled = true;
      AudioKit.fireFinal(alertStyle(S.alertStyle));
      if (this.queue.length) this.loadNextQueued();
      else AudioKit.startOvertime(alertStyle(S.alertStyle));
    }
    this.emit();
  }

  emit() { if (this.onChange) this.onChange(); }
}

/* ═══════════════════════════════════════════════════════════
   SESSION ENGINE (SessionEngine.swift)
   Expands a template + roster into run steps, holds at zero
   (never auto-advances), captures actual vs planned.
   ═══════════════════════════════════════════════════════════ */
function expandTemplate(template, roster) {
  const result = [];
  for (const segment of template.segments) {
    if (segment.kind === 'single') {
      result.push({ segmentTitle: segment.title, detail: null,
        plannedSeconds: segment.seconds, kind: 'single', memberIndex: null, memberCount: null });
    } else if (segment.kind === 'roundRobin') {
      const members = roster.length ? roster : ['Member 1'];
      members.forEach((name, i) => {
        result.push({ segmentTitle: segment.title, detail: name,
          plannedSeconds: segment.perPersonSeconds, kind: 'roundRobinMember',
          memberIndex: i, memberCount: members.length });
      });
    } else {
      for (const phase of segment.phases) {
        result.push({ segmentTitle: segment.title, detail: phase.title,
          plannedSeconds: phase.seconds, kind: 'protocolPhase', memberIndex: null, memberCount: null });
      }
    }
  }
  return result;
}

class SessionEngine {
  constructor(template, roster, warningSeconds, onChange) {
    this.onChange = onChange;
    this.templateName = template.name;
    this.warningSeconds = warningSeconds;
    this.steps = expandTemplate(template, roster);
    this.actualSeconds = new Array(this.steps.length).fill(0);
    this.index = 0;
    this.remaining = 0;
    this.isRunning = false;
    this.isFinished = false;
    this.endAt = null;
    this.warnedThisStep = false;
    this.finaledThisStep = false;
    this.interval = null;
    this.loadStep(0, false);
  }

  get currentStep() { return this.steps[this.index] || null; }
  get nextStep() { return this.steps[this.index + 1] || null; }
  get isOvertime() { return this.remaining <= 0; }
  get totalPlannedSeconds() { return this.steps.reduce((a, s) => a + s.plannedSeconds, 0); }

  projectedEnd() {
    const futurePlanned = this.steps.slice(this.index + 1).reduce((a, s) => a + s.plannedSeconds, 0);
    return new Date(Date.now() + (Math.max(this.remaining, 0) + futurePlanned) * 1000);
  }

  start() {
    AudioKit.ensure();
    if (!this.isRunning && !this.isFinished) this.resume();
    this.emit();
  }
  pauseResume() { this.isRunning ? this.pause() : this.resume(); this.emit(); }

  pause() {
    if (!this.isRunning) return;
    this.remaining = this.currentRemaining();
    this.isRunning = false;
    this.endAt = null;
    clearInterval(this.interval);
    this.interval = null;
    AudioKit.stopOvertime();
  }

  resume() {
    if (this.isFinished || !this.currentStep) return;
    this.isRunning = true;
    this.endAt = Date.now() + this.remaining * 1000;
    this.startTicking();
    if (this.isOvertime) AudioKit.startOvertime(alertStyle(S.alertStyle));
  }

  addMinute() {
    this.remaining += 60;
    if (this.isRunning) this.endAt = Date.now() + this.remaining * 1000;
    if (this.remaining > 0) {
      this.finaledThisStep = false;
      AudioKit.stopOvertime();
    }
    if (this.remaining > this.warningSeconds) this.warnedThisStep = false;
    this.emit();
  }

  next() {
    if (!this.currentStep) return;
    this.recordActual();
    this.goto(this.index + 1);
    this.emit();
  }
  previous() {
    if (this.index === 0) { this.loadStep(0, this.isRunning); this.emit(); return; }
    this.recordActual();
    this.goto(this.index - 1);
    this.emit();
  }
  end() {
    this.recordActual();
    this.finish();
    this.emit();
  }

  goto(newIndex) {
    if (newIndex >= this.steps.length) this.finish();
    else this.loadStep(newIndex, this.isRunning);
  }

  loadStep(i, autoStart) {
    clearInterval(this.interval);
    this.interval = null;
    AudioKit.stopOvertime();
    this.index = i;
    const planned = this.steps[i] ? this.steps[i].plannedSeconds : 0;
    this.remaining = planned;
    /* Blocks shorter than the threshold skip the warning entirely. */
    this.warnedThisStep = planned <= this.warningSeconds;
    this.finaledThisStep = false;
    if (autoStart) {
      this.isRunning = true;
      this.endAt = Date.now() + this.remaining * 1000;
      this.startTicking();
    } else {
      this.isRunning = false;
      this.endAt = null;
    }
  }

  recordActual() {
    if (!this.steps[this.index]) return;
    const planned = this.steps[this.index].plannedSeconds;
    this.actualSeconds[this.index] = Math.max(0, planned - this.currentRemaining());
  }

  finish() {
    this.isRunning = false;
    this.isFinished = true;
    clearInterval(this.interval);
    this.interval = null;
    this.endAt = null;
    AudioKit.stopOvertime();
  }

  currentRemaining() {
    if (!this.isRunning || this.endAt == null) return this.remaining;
    return (this.endAt - Date.now()) / 1000;
  }

  startTicking() {
    clearInterval(this.interval);
    this.interval = setInterval(() => this.tick(), 100);
  }

  tick() {
    if (!this.isRunning || this.endAt == null) return;
    this.remaining = (this.endAt - Date.now()) / 1000;
    if (!this.warnedThisStep && this.remaining <= this.warningSeconds && this.remaining > 0) {
      this.warnedThisStep = true;
      AudioKit.fireWarning(alertStyle(S.alertStyle));
    }
    if (!this.finaledThisStep && this.remaining <= 0) {
      this.finaledThisStep = true;
      AudioKit.fireFinal(alertStyle(S.alertStyle));
      AudioKit.startOvertime(alertStyle(S.alertStyle));
    }
    /* At/after zero we hold on this step until the moderator taps Next. */
    this.emit();
  }

  emit() { if (this.onChange) this.onChange(); }
}

/* ═══════════════════════════════════════════════════════════
   APP: the UI layer
   ═══════════════════════════════════════════════════════════ */
const $ = (id) => document.getElementById(id);

const App = {
  engine: null,
  session: null,          /* live SessionEngine or null */
  zoneIdx: 0,
  dockKey: '',
  meetingKey: '',
  keypadDigits: [],
  wakeLock: null,
  overtimeRaf: null,
  flashTimeouts: [],
  systemDarkMq: null,
  editingTemplate: null,  /* working copy in the setup panel */
  panelStack: [],

  /* ── boot ── */
  init() {
    loadStore();
    this.engine = new QuickEngine(() => this.render());
    this.systemDarkMq = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemDarkMq.addEventListener('change', () => {
      if (S.timerTheme === 'system') this.applyTheme();
    });
    this.applyTheme();
    this.bindChrome();
    this.renderDock(true);
    this.render();
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        if (this.engine.isRunning) this.engine.tick();
        if (this.session && this.session.isRunning) this.session.tick();
        this.acquireWakeLockIfNeeded();
      }
    });
    window.addEventListener('resize', () => this.fitDigits());
    document.addEventListener('keydown', (e) => this.onKey(e));
  },

  isDark() {
    if (S.timerTheme === 'light') return false;
    if (S.timerTheme === 'dark') return true;
    return this.systemDarkMq ? this.systemDarkMq.matches : false;
  },

  applyTheme() {
    document.body.dataset.timerTheme = this.isDark() ? 'dark' : 'light';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = this.isDark() ? '#0E0E0C' : '#F0EBE0';
    this.renderDial();
  },

  toggleTheme() {
    S.timerTheme = this.isDark() ? 'light' : 'dark';
    saveStore();
    this.applyTheme();
    this.syncOptionPickers();
  },

  toggleDisplayMode() {
    /* Both modes look identical in overtime, and tapping the flashing
       screen is a panic gesture; never let it silently flip the mode. */
    if (this.engine.isOvertime) return;
    S.displayMode = S.displayMode === 'bars' ? 'dial' : 'bars';
    saveStore();
    this.syncOptionPickers();
    this.render(true);
  },

  /* ── chrome bindings ── */
  bindChrome() {
    $('display').addEventListener('click', (e) => {
      if (e.target.closest('.ft-chip')) return;
      this.toggleDisplayMode();
    });
    $('modeChip').addEventListener('click', () => this.toggleDisplayMode());
    $('themeChip').addEventListener('click', () => this.toggleTheme());
    $('gearChip').addEventListener('click', () => this.openPanel('panel-options'));
    $('setChip').addEventListener('click', () => this.openKeypad());
    const fsChip = $('fsChip');
    if (document.documentElement.requestFullscreen) {
      fsChip.addEventListener('click', () => {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen().catch(() => {});
      });
    } else {
      fsChip.hidden = true;
    }
    document.querySelectorAll('[data-close-panel]').forEach(btn => {
      btn.addEventListener('click', () => this.closePanel());
    });
    document.querySelectorAll('[data-open-panel]').forEach(btn => {
      btn.addEventListener('click', () => this.openPanel(btn.dataset.openPanel));
    });
    $('keypadScrim').addEventListener('click', () => this.closeKeypad());
    this.buildKeypad();
    this.buildOptionsPanel();
  },

  onKey(e) {
    if (e.key === 'Escape') {
      if (!$('keypad').hidden) { this.closeKeypad(); return; }
      if (this.panelStack.length) { this.closePanel(); return; }
    }
    if (e.key === ' ' && !e.target.closest('input, textarea, button')) {
      if (this.session && !this.session.isFinished) { e.preventDefault(); this.session.pauseResume(); return; }
      if (this.engine.hasTime) { e.preventDefault(); this.engine.pauseResume(); }
    }
  },

  /* ── wake lock: the screen stays awake while a timer runs ── */
  async acquireWakeLockIfNeeded() {
    const wanted = (this.engine.isRunning) || (this.session && this.session.isRunning);
    if (wanted && !this.wakeLock && 'wakeLock' in navigator && !document.hidden) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        this.wakeLock.addEventListener('release', () => { this.wakeLock = null; });
      } catch (e) { /* browser said no; the timer still runs */ }
    } else if (!wanted && this.wakeLock) {
      try { await this.wakeLock.release(); } catch (e) { /* fine */ }
      this.wakeLock = null;
    }
  },

  /* ── main render ── */
  render(force) {
    const e = this.engine;
    document.body.classList.toggle('timing', e.hasTime);
    document.body.classList.toggle('overtime', e.isOvertime);

    /* zone flip pulse: one soft pulse the moment the fill flips color */
    const z = e.hasTime ? zoneIndexFor(e.fractionRemaining) : 0;
    if (z !== this.zoneIdx) {
      const worsened = z > this.zoneIdx;
      this.zoneIdx = z;
      if (worsened && e.isRunning && e.remaining > 0) {
        this.flashPulse(0.35, 200, 450);
        AudioKit.zoneTap(alertStyle(S.alertStyle));
      }
    }

    /* digits */
    this.setDigits(Clock.mmss(e.remaining));

    /* set chip */
    $('setChipLabel').textContent = `SET ${Clock.mmss(e.totalSeconds)}`;

    /* status line */
    const status = $('status');
    if (e.isOvertime) {
      status.textContent = (TIMES_UP_STYLES[S.timesUpStyle] || TIMES_UP_STYLES.assertive).overtimeLabel;
      status.className = 'ft-status over';
    } else if (e.hasTime && !e.isRunning) {
      status.textContent = 'PAUSED';
      status.className = 'ft-status paused';
    } else if (!e.hasTime) {
      status.textContent = 'TAP A TIME TO START';
      status.className = 'ft-status idle';
    } else {
      status.textContent = '';
      status.className = 'ft-status';
    }

    /* queued chain */
    const then = $('then');
    if (e.queue.length) {
      then.textContent = 'THEN ' + e.queue.map(n => Clock.mmss(n)).join(' · ');
      then.hidden = false;
    } else {
      then.hidden = true;
    }

    /* fill / dial / overtime layers */
    const dialMode = S.displayMode === 'dial' && !e.isOvertime;
    $('dialWrap').hidden = !dialMode;
    $('display').classList.toggle('dial-mode', dialMode);
    if (dialMode) this.renderDial();
    const fill = $('fill');
    if (e.isOvertime) {
      fill.style.height = '100%';
      fill.style.background = ZONE_COLORS.brick;
      this.startOvertimeBreath();
    } else {
      this.stopOvertimeBreath();
      if (S.displayMode === 'bars' && e.hasTime) {
        fill.style.height = (e.fractionRemaining * 100) + '%';
        fill.style.background = zoneColor(e.fractionRemaining);
      } else {
        fill.style.height = '0%';
      }
    }

    /* tab title carries the countdown */
    document.title = e.hasTime
      ? `${Clock.mmss(e.remaining)} · Forum Timer`
      : 'Forum Timer, the meeting timer from Forum Playbook';

    this.renderDock(force);
    this.acquireWakeLockIfNeeded();
    this.fitDigits();
    if (this.session) this.renderMeeting();
  },

  /* ── giant digits: per-character cells so nothing jitters ── */
  setDigits(str) {
    const el = $('digits');
    if (el.dataset.value === str) return;
    el.dataset.value = str;
    el.innerHTML = '';
    for (const ch of str) {
      const span = document.createElement('span');
      span.textContent = ch;
      span.className = ch === ':' ? 'colon' : (ch === '-' ? 'minus' : 'digit');
      el.appendChild(span);
    }
    this.fitDigits();
  },

  fitDigits() {
    const el = $('digits');
    const zone = $('digitZone');
    if (!el || !zone) return;
    const str = el.dataset.value || '0:00';
    let em = 0;
    for (const ch of str) em += ch === ':' ? 0.34 : (ch === '-' ? 0.5 : 0.58);
    const w = zone.clientWidth * 0.94;
    const h = zone.clientHeight * 0.98;
    const size = Math.max(24, Math.min(h, w / em));
    el.style.fontSize = size + 'px';
  },

  /* ── dial (DialFace) ── */
  renderDial() {
    const svg = $('dial');
    if (!svg || $('dialWrap').hidden) return;
    const e = this.engine;
    const dark = this.isDark();
    const ink = dark ? '#F0EBE0' : '#0E0E0C';
    const dust = dark ? '#292929' : '#E4DDCB';
    const cx = 100, cy = 100, r = 84;
    const frac = Math.max(0, Math.min(1, e.fractionRemaining));
    const elapsed = e.hasTime ? 1 - frac : 0;

    const pt = (t, radius) => {
      const a = (t * 360 - 90) * Math.PI / 180;
      return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
    };
    const sectorPath = (from, to, radius) => {
      if (to - from <= 0) return '';
      if (to - from >= 0.9999) {
        return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} Z`;
      }
      const [x1, y1] = pt(from, radius);
      const [x2, y2] = pt(to, radius);
      const large = (to - from) > 0.5 ? 1 : 0;
      return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
    };

    let parts = '';
    /* ring + hour ticks */
    parts += `<circle cx="${cx}" cy="${cy}" r="${r + 8}" fill="none" stroke="${ink}" stroke-opacity="0.55" stroke-width="2.5"/>`;
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 - 90) * Math.PI / 180;
      const c = Math.cos(a), s = Math.sin(a);
      parts += `<line x1="${cx + (r + 3) * c}" y1="${cy + (r + 3) * s}" x2="${cx + (r + 7) * c}" y2="${cy + (r + 7) * s}" stroke="${ink}" stroke-opacity="0.4" stroke-width="1.5"/>`;
    }
    /* sectors: elapsed = dust, remaining = one solid zone-color wedge */
    const wedge = e.hasTime ? zoneColor(frac) : dust;
    parts += `<path d="${sectorPath(0, Math.max(elapsed, 0.0001), r)}" fill="${dust}"/>`;
    if (elapsed < 1) parts += `<path d="${sectorPath(elapsed, 1, r)}" fill="${wedge}"/>`;
    /* rim notches at the two flip points */
    for (const t of [1 - YELLOW_T, 1 - RED_T]) {
      const a = (t * 360 - 90) * Math.PI / 180;
      const c = Math.cos(a), s = Math.sin(a);
      parts += `<line x1="${cx + (r - 9) * c}" y1="${cy + (r - 9) * s}" x2="${cx + (r + 1) * c}" y2="${cy + (r + 1) * s}" stroke="${ink}" stroke-opacity="0.5" stroke-width="2"/>`;
    }
    /* sweep line */
    if (e.hasTime && elapsed < 1) {
      const [x, y] = pt(elapsed, r);
      parts += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>`;
    }
    svg.innerHTML = parts;
  },

  /* ── overtime breathing (flashOpacity) ── */
  startOvertimeBreath() {
    if (this.overtimeRaf) return;
    const overlay = $('overShade');
    const step = () => {
      const e = this.engine;
      if (!e.isOvertime) { this.overtimeRaf = null; overlay.style.opacity = 0; return; }
      const s = TIMES_UP_STYLES[S.timesUpStyle] || TIMES_UP_STYLES.assertive;
      const t = Math.max(0, -e.remaining);
      const steps = s.flashSteps, bases = s.flashBases;
      let base;
      if (t < steps[0]) base = bases[0];
      else if (t < steps[1]) base = bases[1];
      else if (t < steps[2]) base = bases[2];
      else base = bases[3];
      const phase = performance.now() / 1000;
      const breathe = s.breatheAmp * Math.sin(2 * Math.PI * s.breatheHz * phase);
      const flash = Math.min(1, Math.max(0.3, base + breathe));
      overlay.style.opacity = ((1 - flash) * 0.35).toFixed(3);
      this.overtimeRaf = requestAnimationFrame(step);
    };
    this.overtimeRaf = requestAnimationFrame(step);
  },
  stopOvertimeBreath() {
    if (this.overtimeRaf) { cancelAnimationFrame(this.overtimeRaf); this.overtimeRaf = null; }
    $('overShade').style.opacity = 0;
  },

  /* ── warning flash: three gentle pulses in the state color ── */
  warningFlashPulse() {
    this.clearFlashes();
    for (let i = 0; i < 3; i++) {
      this.flashTimeouts.push(setTimeout(() => this.flashPulse(0.5, 180, 300), i * 600));
    }
  },
  flashPulse(opacity, inMs, outMs) {
    const flash = $('flash');
    flash.style.background = this.engine.isOvertime ? ZONE_COLORS.brick : zoneColor(this.engine.fractionRemaining);
    flash.style.transition = `opacity ${inMs}ms ease-in`;
    flash.style.opacity = opacity;
    this.flashTimeouts.push(setTimeout(() => {
      flash.style.transition = `opacity ${outMs}ms ease-out`;
      flash.style.opacity = 0;
    }, inMs + 60));
  },
  clearFlashes() {
    this.flashTimeouts.forEach(clearTimeout);
    this.flashTimeouts = [];
  },

  /* ── dock ── */
  renderDock(force) {
    const e = this.engine;
    const key = [e.hasTime, e.isRunning, e.queue.length > 0, S.sequences.length > 0].join('|');
    if (!force && key === this.dockKey) {
      const pauseBtn = $('pauseBtn');
      if (pauseBtn) {
        pauseBtn.querySelector('span').textContent = e.isRunning ? 'PAUSE' : 'RESUME';
        pauseBtn.querySelector('.pp-ico').textContent = e.isRunning ? '⏸' : '▶';
      }
      return;
    }
    this.dockKey = key;
    const dock = $('dock');
    dock.innerHTML = '';

    const ghost = (label, fn) => {
      const b = document.createElement('button');
      b.className = 'ft-ghost';
      b.textContent = label;
      b.addEventListener('click', fn);
      return b;
    };
    const circle = (icon, label, fn) => {
      const b = document.createElement('button');
      b.className = 'ft-circle';
      b.title = label;
      b.setAttribute('aria-label', label);
      b.textContent = icon;
      b.addEventListener('click', fn);
      return b;
    };
    const row = (cls) => {
      const d = document.createElement('div');
      d.className = 'ft-dock-row' + (cls ? ' ' + cls : '');
      dock.appendChild(d);
      return d;
    };

    if (!e.hasTime) {
      const r1 = row();
      [[30, '+0:30'], [60, '+1:00'], [120, '+2:00']].forEach(([s, l]) => r1.appendChild(ghost(l, () => e.addSeconds(s))));
      const r2 = row();
      [[180, '+3:00'], [240, '+4:00'], [300, '+5:00']].forEach(([s, l]) => r2.appendChild(ghost(l, () => e.addSeconds(s))));
      if (S.sequences.length) {
        const bm = circle('☰', 'Saved cadences', (ev) => this.openCadenceMenu(ev.currentTarget));
        bm.classList.add('ft-bookmark');
        r2.appendChild(bm);
      }
    } else {
      const r1 = row();
      [[30, '+0:30'], [60, '+1:00'], [120, '+2:00']].forEach(([s, l]) => r1.appendChild(ghost(l, () => e.addSeconds(s))));
      const r2 = row('controls');
      r2.appendChild(circle('■', 'Reset', () => e.reset()));
      const pause = document.createElement('button');
      pause.id = 'pauseBtn';
      pause.className = 'ft-pause';
      pause.innerHTML = `<em class="pp-ico">${e.isRunning ? '⏸' : '▶'}</em><span>${e.isRunning ? 'PAUSE' : 'RESUME'}</span>`;
      pause.addEventListener('click', () => e.pauseResume());
      r2.appendChild(pause);
      if (e.queue.length) r2.appendChild(circle('⏭', 'Next timer', () => e.advanceNow()));
      r2.appendChild(circle('⋯', 'More timer options', (ev) => this.openMoreMenu(ev.currentTarget)));
    }
  },

  /* ── popover menus ── */
  closeMenus() {
    document.querySelectorAll('.ft-menu').forEach(m => m.remove());
  },
  menuShell(anchor) {
    this.closeMenus();
    const menu = document.createElement('div');
    menu.className = 'ft-menu';
    document.body.appendChild(menu);
    const place = () => {
      const r = anchor.getBoundingClientRect();
      menu.style.left = Math.max(8, Math.min(window.innerWidth - menu.offsetWidth - 8, r.right - menu.offsetWidth)) + 'px';
      menu.style.top = Math.max(8, r.top - menu.offsetHeight - 8) + 'px';
    };
    requestAnimationFrame(place);
    setTimeout(() => {
      const onDoc = (ev) => {
        if (!menu.contains(ev.target)) { menu.remove(); document.removeEventListener('click', onDoc); }
      };
      document.addEventListener('click', onDoc);
    }, 0);
    return menu;
  },
  menuItem(menu, label, fn, opts = {}) {
    const b = document.createElement('button');
    b.className = 'ft-menu-item' + (opts.destructive ? ' destructive' : '') + (opts.checked ? ' checked' : '');
    b.innerHTML = `<span>${label}</span>${opts.checked ? '<em>✓</em>' : ''}`;
    b.addEventListener('click', () => { menu.remove(); fn(); });
    menu.appendChild(b);
    return b;
  },
  menuHeader(menu, text) {
    const h = document.createElement('div');
    h.className = 'ft-menu-head';
    h.textContent = text;
    menu.appendChild(h);
  },

  openMoreMenu(anchor) {
    const e = this.engine;
    const menu = this.menuShell(anchor);
    this.menuHeader(menu, `Pre-ending alert: ${notifyPoint(e.notify).label}`);
    NOTIFY_POINTS.forEach(p => {
      this.menuItem(menu, p.label, () => {
        e.setNotify(p.id);
        S.notifyPoint = p.id;
        saveStore();
        this.syncOptionPickers();
      }, { checked: p.id === e.notify });
    });
    this.menuHeader(menu, 'Add a timer after this one');
    [30, 60, 120, 180, 300, 600].forEach(n => {
      this.menuItem(menu, `Then ${Clock.mmss(n)}`, () => e.queueSeconds(n));
    });
    if (e.queue.length) {
      this.menuHeader(menu, 'Up next, tap to remove');
      e.queue.forEach((n, i) => {
        this.menuItem(menu, `✕ ${Clock.mmss(n)}`, () => e.removeQueued(i), { destructive: true });
      });
      this.menuItem(menu, 'Save as cadence', () => this.promptSaveCadence());
    }
  },

  openCadenceMenu(anchor) {
    const menu = this.menuShell(anchor);
    this.menuHeader(menu, 'Saved cadences');
    S.sequences.forEach(seq => {
      const label = `${seq.name}, ${seq.durations.map(n => Clock.mmss(n)).join(' · ')}`;
      this.menuItem(menu, label, () => this.engine.runSequence(seq));
    });
    this.menuHeader(menu, 'Delete a cadence');
    S.sequences.forEach(seq => {
      this.menuItem(menu, `✕ ${seq.name}`, () => {
        S.sequences = S.sequences.filter(s2 => s2.id !== seq.id);
        saveStore();
        this.render(true);
      }, { destructive: true });
    });
  },

  promptSaveCadence() {
    const e = this.engine;
    const durations = [e.totalSeconds].concat(e.queue);
    if (!durations.length || e.totalSeconds <= 0) return;
    const dialog = $('cadenceDialog');
    dialog.hidden = false;
    const input = $('cadenceName');
    input.value = '';
    input.focus();
    $('cadenceSave').onclick = () => {
      const name = input.value.trim() || `Cadence ${S.sequences.length + 1}`;
      S.sequences.push({ id: uid(), name, durations });
      saveStore();
      dialog.hidden = true;
      this.render(true);
    };
    $('cadenceCancel').onclick = () => { dialog.hidden = true; };
  },

  /* ── keypad (microwave style, digits fill from the right) ── */
  buildKeypad() {
    const grid = $('keypadGrid');
    grid.innerHTML = '';
    const key = (label, cls, fn) => {
      const b = document.createElement('button');
      b.className = 'kp-key' + (cls ? ' ' + cls : '');
      b.textContent = label;
      b.addEventListener('click', fn);
      grid.appendChild(b);
      return b;
    };
    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(d => key(String(d), '', () => this.keypadPress(d)));
    key('⌫', 'kp-del', () => { this.keypadDigits.pop(); this.updateKeypad(); });
    key('0', '', () => this.keypadPress(0));
    key('✓', 'kp-go', () => {
      const secs = this.keypadSeconds();
      if (secs > 0) {
        this.closeKeypad();
        this.engine.reset();
        this.engine.addSeconds(secs);
      }
    });
  },
  keypadPress(d) {
    if (this.keypadDigits.length >= 4) return;
    if (this.keypadDigits.length === 0 && d === 0) return;
    this.keypadDigits.push(d);
    this.updateKeypad();
  },
  keypadSeconds() {
    const p = Array(4 - this.keypadDigits.length).fill(0).concat(this.keypadDigits);
    return (p[0] * 10 + p[1]) * 60 + p[2] * 10 + p[3];
  },
  updateKeypad() {
    const p = Array(4 - this.keypadDigits.length).fill(0).concat(this.keypadDigits);
    const disp = $('keypadDisplay');
    disp.textContent = `${p[0]}${p[1]}:${p[2]}${p[3]}`;
    disp.classList.toggle('empty', this.keypadDigits.length === 0);
    $('keypadGrid').querySelector('.kp-go').disabled = this.keypadSeconds() === 0;
  },
  openKeypad() {
    this.keypadDigits = [];
    this.updateKeypad();
    $('keypad').hidden = false;
  },
  closeKeypad() { $('keypad').hidden = true; },

  /* ── panels ── */
  openPanel(id) {
    this.closeMenus();
    const panel = $(id);
    if (!panel) return;
    panel.hidden = false;
    this.panelStack.push(id);
    if (id === 'panel-options') this.syncOptionPickers();
    if (id === 'panel-sound') this.renderSoundPanel();
    if (id === 'panel-agenda') this.renderAgendaList();
  },
  closePanel() {
    const id = this.panelStack.pop();
    if (id) $(id).hidden = true;
    AudioKit.stopPreview();
  },
  closeAllPanels() {
    while (this.panelStack.length) this.closePanel();
  },

  /* ── options panel ── */
  buildOptionsPanel() {
    /* display mode + theme segmented controls */
    const seg = (containerId, options, get, set) => {
      const el = $(containerId);
      el.innerHTML = '';
      options.forEach(([value, label]) => {
        const b = document.createElement('button');
        b.className = 'ft-seg-btn';
        b.dataset.value = value;
        b.textContent = label;
        b.addEventListener('click', () => { set(value); this.syncOptionPickers(); });
        el.appendChild(b);
      });
    };
    seg('segDisplay', [['bars', 'Bars'], ['dial', 'Clock Face']],
      () => S.displayMode, (v) => { S.displayMode = v; saveStore(); this.render(true); });
    seg('segTheme', [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']],
      () => S.timerTheme, (v) => { S.timerTheme = v; saveStore(); this.applyTheme(); });
    seg('segVoice', VOICES.map(v => [v.id, v.label]),
      () => S.soundVoice, (v) => {
        S.soundVoice = v; saveStore();
        AudioKit.stopPreview();
        AudioKit.rebuildOvertimeIfPlaying();
        this.renderSoundPanel();
      });
    seg('segIntensity', Object.entries(TIMES_UP_STYLES).map(([id, s]) => [id, s.label]),
      () => S.timesUpStyle, (v) => { S.timesUpStyle = v; saveStore(); });
    seg('segAlertStyle', ALERT_STYLES.map(s => [s.id, s.label]),
      () => S.alertStyle, (v) => { S.alertStyle = v; saveStore(); });

    $('duetToggle').addEventListener('change', (ev) => {
      S.duetLayer = ev.target.checked;
      saveStore();
      AudioKit.stopPreview();
      AudioKit.rebuildOvertimeIfPlaying();
    });
    $('previewAlertBtn').addEventListener('click', () => AudioKit.previewAlert());

    const notifySel = $('notifySelect');
    NOTIFY_POINTS.forEach(p => {
      const o = document.createElement('option');
      o.value = p.id; o.textContent = p.label;
      notifySel.appendChild(o);
    });
    notifySel.addEventListener('change', () => {
      S.notifyPoint = notifySel.value;
      saveStore();
      this.engine.setNotify(notifySel.value);
    });

    $('warnMinus').addEventListener('click', () => this.stepWarning(-15));
    $('warnPlus').addEventListener('click', () => this.stepWarning(15));

    $('bioToggle').addEventListener('click', () => {
      $('bioBody').hidden = !$('bioBody').hidden;
    });
    $('versionRow').addEventListener('click', () => {
      this.closeAllPanels();
      const log = $('changelog');
      if (log) { log.open = true; log.scrollIntoView({ behavior: 'smooth' }); }
    });
  },

  stepWarning(delta) {
    S.warningSeconds = Math.max(15, Math.min(300, S.warningSeconds + delta));
    saveStore();
    this.syncOptionPickers();
  },

  syncOptionPickers() {
    const setSeg = (id, value) => {
      const el = $(id);
      if (!el) return;
      el.querySelectorAll('.ft-seg-btn').forEach(b => b.classList.toggle('on', b.dataset.value === value));
    };
    setSeg('segDisplay', S.displayMode);
    setSeg('segTheme', S.timerTheme);
    setSeg('segVoice', S.soundVoice);
    setSeg('segIntensity', S.timesUpStyle);
    setSeg('segAlertStyle', S.alertStyle);
    $('duetToggle').checked = S.duetLayer;
    $('notifySelect').value = S.notifyPoint;
    const s = S.warningSeconds;
    $('warnValue').textContent = s < 60 ? `${s} sec left`
      : (s % 60 === 0 ? `${s / 60} min left` : `${Math.floor(s / 60)} min ${s % 60} sec left`);
  },

  /* ── sounds panel ── */
  renderSoundPanel() {
    const list = $('soundList');
    list.innerHTML = '';
    SOUNDS.forEach(sound => {
      const row = document.createElement('div');
      row.className = 'ft-row sound-row' + (S.overtimeSound === sound.id ? ' selected' : '');
      const play = document.createElement('button');
      play.className = 'sound-play';
      play.textContent = '▶';
      play.setAttribute('aria-label', `Play ${sound.label}`);
      play.addEventListener('click', (ev) => {
        ev.stopPropagation();
        AudioKit.previewMelody(sound.id);
      });
      const label = document.createElement('span');
      label.className = 'sound-label';
      label.textContent = sound.label;
      const check = document.createElement('em');
      check.className = 'sound-check';
      check.textContent = S.overtimeSound === sound.id ? '✓' : '';
      row.append(play, label, check);
      row.addEventListener('click', () => {
        S.overtimeSound = sound.id;
        saveStore();
        AudioKit.rebuildOvertimeIfPlaying();
        this.renderSoundPanel();
      });
      list.appendChild(row);
    });
  },

  /* ── agenda: template list ── */
  renderAgendaList() {
    const list = $('templateList');
    list.innerHTML = '';
    allTemplates().forEach(t => {
      const row = document.createElement('div');
      row.className = 'ft-row template-row';
      const info = document.createElement('div');
      info.className = 'template-info';
      const planned = Clock.lengthLabel(templatePlannedSeconds(t, S.roster.length));
      info.innerHTML = `<strong>${escapeHTML(t.name)}</strong>` +
        `<span>${planned} · ${t.segments.length} segments${t.isBuiltIn ? ' · Built-in' : ''}</span>`;
      row.appendChild(info);
      if (!t.isBuiltIn) {
        const del = document.createElement('button');
        del.className = 'template-del';
        del.textContent = '✕';
        del.setAttribute('aria-label', `Delete ${t.name}`);
        del.addEventListener('click', (ev) => {
          ev.stopPropagation();
          S.userTemplates = S.userTemplates.filter(u => u.id !== t.id);
          saveStore();
          this.renderAgendaList();
        });
        row.appendChild(del);
      }
      const chevron = document.createElement('em');
      chevron.className = 'template-go';
      chevron.textContent = '›';
      row.appendChild(chevron);
      row.addEventListener('click', () => this.openSetup(t));
      list.appendChild(row);
    });
  },

  /* ── agenda: setup ── */
  openSetup(template) {
    this.editingTemplate = JSON.parse(JSON.stringify(template));
    this.renderSetup();
    this.openPanel('panel-setup');
  },

  renderSetup() {
    const t = this.editingTemplate;
    $('setupName').value = t.name;
    $('setupName').oninput = (ev) => { t.name = ev.target.value; };

    const wrap = $('setupSegments');
    wrap.innerHTML = '';
    const stepperRow = (title, getSecs, setSecs, minMin, maxMin, indented, subline) => {
      const row = document.createElement('div');
      row.className = 'ft-row stepper-row' + (indented ? ' indented' : '');
      const label = document.createElement('div');
      label.className = 'stepper-label';
      label.innerHTML = `<span>${escapeHTML(title)}</span>` + (subline ? `<small>${escapeHTML(subline())}</small>` : '');
      const controls = document.createElement('div');
      controls.className = 'stepper-controls';
      const minus = document.createElement('button');
      minus.textContent = '−';
      const value = document.createElement('strong');
      value.textContent = Clock.durationLabel(getSecs());
      const plus = document.createElement('button');
      plus.textContent = '+';
      const refresh = () => {
        value.textContent = Clock.durationLabel(getSecs());
        if (subline) label.querySelector('small').textContent = subline();
        $('setupTotal').textContent =
          `Total planned: ${Clock.lengthLabel(templatePlannedSeconds(t, S.roster.length))}`;
      };
      minus.addEventListener('click', () => {
        setSecs(Math.max(minMin * 60, getSecs() - 60)); refresh();
      });
      plus.addEventListener('click', () => {
        setSecs(Math.min(maxMin * 60, getSecs() + 60)); refresh();
      });
      controls.append(minus, value, plus);
      row.append(label, controls);
      wrap.appendChild(row);
    };

    t.segments.forEach(segment => {
      if (segment.kind === 'single') {
        stepperRow(segment.title, () => segment.seconds, (v) => { segment.seconds = v; }, 1, 240);
      } else if (segment.kind === 'roundRobin') {
        stepperRow(`${segment.title} (per person)`,
          () => segment.perPersonSeconds, (v) => { segment.perPersonSeconds = v; }, 1, 60, false,
          () => `× ${S.roster.length} members = ${Clock.lengthLabel(segment.perPersonSeconds * S.roster.length)}`);
      } else {
        const head = document.createElement('div');
        head.className = 'setup-proto-head';
        head.textContent = segment.title;
        wrap.appendChild(head);
        segment.phases.forEach(phase => {
          stepperRow(phase.title, () => phase.seconds, (v) => { phase.seconds = v; }, 1, 120, true);
        });
      }
    });

    $('setupTotal').textContent =
      `Total planned: ${Clock.lengthLabel(templatePlannedSeconds(t, S.roster.length))}`;

    /* roster editor, only when a round-robin segment exists */
    const rosterWrap = $('setupRoster');
    const hasRR = t.segments.some(s2 => s2.kind === 'roundRobin');
    rosterWrap.hidden = !hasRR;
    if (hasRR) {
      const list = $('rosterList');
      list.innerHTML = '';
      $('rosterCount').textContent = `Roster (${S.roster.length})`;
      S.roster.forEach((name, i) => {
        const row = document.createElement('div');
        row.className = 'roster-row';
        const input = document.createElement('input');
        input.type = 'text';
        input.value = name;
        input.placeholder = `Member ${i + 1}`;
        input.addEventListener('input', () => {
          S.roster[i] = input.value;
          saveStore();
        });
        input.addEventListener('blur', () => this.renderSetupTotals());
        const del = document.createElement('button');
        del.textContent = '✕';
        del.setAttribute('aria-label', `Remove ${name || 'member'}`);
        del.addEventListener('click', () => {
          S.roster.splice(i, 1);
          if (!S.roster.length) S.roster = ['Member 1'];
          saveStore();
          this.renderSetup();
        });
        row.append(input, del);
        list.appendChild(row);
      });
      $('rosterAdd').onclick = () => {
        S.roster.push(`Member ${S.roster.length + 1}`);
        saveStore();
        this.renderSetup();
      };
    }

    $('setupSave').onclick = () => this.saveWorkingTemplate();
    $('setupStart').onclick = () => this.startMeeting();
  },
  renderSetupTotals() {
    const t = this.editingTemplate;
    if (t) $('setupTotal').textContent =
      `Total planned: ${Clock.lengthLabel(templatePlannedSeconds(t, S.roster.length))}`;
  },

  saveWorkingTemplate() {
    const t = this.editingTemplate;
    /* Editing a built-in saves a new custom copy; shipped defaults stay. */
    const original = allTemplates().find(x => x.id === t.id);
    if (original && original.isBuiltIn) {
      t.id = uid();
      t.isBuiltIn = false;
    }
    const idx = S.userTemplates.findIndex(x => x.id === t.id);
    if (idx >= 0) S.userTemplates[idx] = JSON.parse(JSON.stringify(t));
    else S.userTemplates.push(JSON.parse(JSON.stringify(t)));
    saveStore();
    const btn = $('setupSave');
    btn.textContent = 'Saved';
    setTimeout(() => { btn.textContent = 'Save template'; }, 1500);
  },

  /* ── agenda: live meeting ── */
  startMeeting() {
    this.session = new SessionEngine(
      this.editingTemplate, S.roster.slice(), S.warningSeconds, () => this.renderMeeting());
    $('meeting').hidden = false;
    $('meetingSummary').hidden = true;
    $('meetingLive').hidden = false;
    $('endConfirm').hidden = true;
    this.meetingKey = '';
    this.session.start();
    this.renderMeeting(true);
    this.acquireWakeLockIfNeeded();
  },

  renderMeeting(force) {
    const s = this.session;
    if (!s) return;

    if (s.isFinished) {
      this.renderSummary();
      return;
    }

    const step = s.currentStep;
    if (!step) return;

    $('mTemplate').textContent = s.templateName;
    $('mStepCount').textContent = `Step ${s.index + 1} of ${s.steps.length}`;
    $('mPlanned').textContent = `Planned ${Clock.lengthLabel(s.totalPlannedSeconds)}`;

    const state = s.remaining <= 0 ? 'brick' : (s.remaining <= s.warningSeconds ? 'gold' : 'green');
    const color = ZONE_COLORS[state];

    $('mSegment').textContent = step.segmentTitle.toUpperCase();
    const clock = $('mClock');
    clock.textContent = Clock.mmss(s.remaining);
    clock.style.color = color;

    const detail = $('mDetail');
    detail.textContent = step.detail || '';
    detail.hidden = !step.detail;
    const member = $('mMember');
    if (step.memberIndex != null && step.memberCount != null) {
      member.textContent = `${step.memberIndex + 1} of ${step.memberCount}`;
      member.hidden = false;
    } else {
      member.hidden = true;
    }

    const flag = $('mFlag');
    if (s.isOvertime) {
      flag.textContent = s.isRunning ? 'OVER, tap Next when ready' : 'PAUSED';
      flag.className = 'm-flag over';
      flag.hidden = false;
    } else if (!s.isRunning) {
      flag.textContent = 'PAUSED';
      flag.className = 'm-flag';
      flag.hidden = false;
    } else {
      flag.hidden = true;
    }

    /* progress ring */
    const frac = step.plannedSeconds > 0
      ? Math.min(1, Math.max(0, s.remaining / step.plannedSeconds)) : 0;
    const ring = $('mRingFg');
    const C = 2 * Math.PI * 88;
    ring.style.strokeDasharray = `${C}`;
    ring.style.strokeDashoffset = `${C * (1 - frac)}`;
    ring.style.stroke = color;

    const next = s.nextStep;
    $('mNext').textContent = next
      ? `Next: ${next.detail || next.segmentTitle} · ${Clock.durationLabel(next.plannedSeconds)}`
      : 'Last step';
    $('mEnds').textContent = `Ends ~${Clock.timeOfDay(s.projectedEnd())}`;

    const mKey = s.isRunning ? 'run' : 'pause';
    if (force || mKey !== this.meetingKey) {
      this.meetingKey = mKey;
      $('mPause').innerHTML = `<em>${s.isRunning ? '⏸' : '▶'}</em><span>${s.isRunning ? 'Pause' : 'Resume'}</span>`;
    }
    document.title = `${Clock.mmss(s.remaining)} · ${step.segmentTitle} · Forum Timer`;
  },

  renderSummary() {
    $('meetingLive').hidden = true;
    document.title = 'Meeting Complete · Forum Timer';
    const box = $('meetingSummary');
    box.hidden = false;
    const s = this.session;
    const rows = $('summaryRows');
    rows.innerHTML = '';
    s.steps.forEach((step, i) => {
      const actual = Math.round(s.actualSeconds[i]);
      const row = document.createElement('div');
      row.className = 'summary-row';
      row.innerHTML =
        `<div class="sum-name"><strong>${escapeHTML(step.detail || step.segmentTitle)}</strong>` +
        (step.detail ? `<span>${escapeHTML(step.segmentTitle)}</span>` : '') + '</div>' +
        `<div class="sum-time${actual > step.plannedSeconds ? ' over' : ''}">` +
        `${Clock.mmss(actual)} / ${Clock.mmss(step.plannedSeconds)}</div>`;
      rows.appendChild(row);
    });
    const totalPlanned = s.totalPlannedSeconds;
    const totalActual = Math.round(s.actualSeconds.reduce((a, b) => a + b, 0));
    const overrun = totalActual - totalPlanned;
    $('summaryFoot').textContent = overrun >= 0
      ? `Total ${Clock.lengthLabel(totalActual)}, ran ${Clock.lengthLabel(Math.abs(overrun))} over plan.`
      : `Total ${Clock.lengthLabel(totalActual)}, finished ${Clock.lengthLabel(Math.abs(overrun))} under plan.`;
    $('summaryDone').onclick = () => this.closeMeeting();
  },

  closeMeeting() {
    if (this.session) {
      this.session.finish();
      this.session = null;
    }
    $('meeting').hidden = true;
    this.acquireWakeLockIfNeeded();
    this.render(true);
  },

  bindMeetingControls() {
    $('mPrev').addEventListener('click', () => this.session && this.session.previous());
    $('mPause').addEventListener('click', () => this.session && this.session.pauseResume());
    $('mPlusMin').addEventListener('click', () => this.session && this.session.addMinute());
    $('mNextBtn').addEventListener('click', () => this.session && this.session.next());
    $('mEnd').addEventListener('click', () => { $('endConfirm').hidden = false; });
    $('endYes').addEventListener('click', () => {
      $('endConfirm').hidden = true;
      if (this.session) this.session.end();
    });
    $('endNo').addEventListener('click', () => { $('endConfirm').hidden = true; });
  },
};

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

document.addEventListener('DOMContentLoaded', () => {
  App.init();
  App.bindMeetingControls();
});
