import type { CharacterId } from '@/lib/scenes';

type Effect = 'charge' | 'beam' | 'web' | 'claw' | 'landing' | 'spell' | 'kick';
export type SceneSoundMarker = Readonly<{ id: string; progress: number; effect: Effect }>;

/** These positions are shared with the visual attack contracts. All sounds are original synthesis. */
export const sceneSoundMarkers: Readonly<Record<CharacterId, readonly SceneSoundMarker[]>> = {
  goku: [{ id: 'energy-charge', progress: .26, effect: 'charge' }, { id: 'hand-beam', progress: .48, effect: 'beam' }],
  'spider-man': [{ id: 'wrist-web', progress: .44, effect: 'web' }],
  wolverine: [{ id: 'claw-strike', progress: 1.65 / 4.8, effect: 'claw' }, { id: 'grounded-landing', progress: 2.35 / 4.8, effect: 'landing' }],
  'harry-potter': [{ id: 'wand-spell', progress: .50, effect: 'spell' }],
  ronaldo: [{ id: 'boot-ball-contact', progress: .52, effect: 'kick' }],
};
export const SCENE_SOUND_EVENT = 'game-frost:scene-sound';
export type SceneSoundEvent = Readonly<{ scene: CharacterId; marker: string; progress: number; audioTime: number }>;
export type SceneSound = {
  enable: () => Promise<void>;
  setScene: (id: CharacterId) => void;
  prime: (progress: number) => void;
  seek: (progress: number) => void;
  stop: () => void;
  dispose: () => void;
  enabled: () => boolean;
  diagnostics: () => { scene: CharacterId; enabled: boolean; activeVoices: number; events: readonly SceneSoundEvent[] };
};

type Voice = {
  output: GainNode;
  nodes: Set<AudioNode>;
  sources: Set<AudioScheduledSourceNode>;
  cancelled: boolean;
};

/** Safe to construct during render/SSR: audio and listeners exist only after enable(), a user gesture. */
export function createSceneSound(): SceneSound {
  let context: AudioContext | null = null;
  let master: GainNode | null = null;
  let limiter: DynamicsCompressorNode | null = null;
  let noise: AudioBuffer | null = null;
  let scene: CharacterId = 'goku';
  let previous = 0;
  let optedIn = false;
  let disposed = false;
  let lastSoundAt = -Infinity;
  let enablePending: Promise<void> | null = null;
  const voices = new Set<Voice>();
  const events: SceneSoundEvent[] = [];

  function disconnect(voice: Voice) {
    voices.delete(voice);
    for (const node of voice.nodes) node.disconnect();
    voice.nodes.clear();
    voice.sources.clear();
  }

  function stop() {
    if (!context) return;
    const now = context.currentTime;
    for (const voice of voices) {
      voice.cancelled = true;
      // A very short release avoids a click without allowing old-scene audio to continue.
      voice.output.gain.cancelAndHoldAtTime(now);
      voice.output.gain.linearRampToValueAtTime(0, now + .008);
      for (const source of voice.sources) {
        try { source.stop(now + .011); } catch { /* An already-ended source is harmless. */ }
      }
      voices.delete(voice);
      if (!voice.sources.size) disconnect(voice);
    }
  }

  function onVisibility() {
    if (document.hidden) stop();
  }

  async function enable() {
    if (disposed) throw new Error('This sound player has been disposed.');
    if (enablePending) return enablePending;
    enablePending = (async () => {
      if (!context) {
        const AudioConstructor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioConstructor) throw new Error('Sound effects are unavailable in this browser.');
        context = new AudioConstructor({ latencyHint: 'interactive' });
        master = context.createGain();
        master.gain.value = .32;
        limiter = context.createDynamicsCompressor();
        limiter.threshold.value = -12;
        limiter.knee.value = 8;
        limiter.ratio.value = 10;
        limiter.attack.value = .003;
        limiter.release.value = .10;
        master.connect(limiter);
        limiter.connect(context.destination);
        noise = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
        const samples = noise.getChannelData(0);
        let seed = 0x6f726f73;
        for (let i = 0; i < samples.length; i++) {
          seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
          samples[i] = ((seed >>> 0) / 0xffffffff) * 2 - 1;
        }
        document.addEventListener('visibilitychange', onVisibility);
      }
      await context.resume();
      if (disposed) return;
      optedIn = context.state === 'running';
      if (!optedIn) throw new Error('Enable sound with a click or tap.');
    })();
    try { await enablePending; } finally { enablePending = null; }
  }

  function play(marker: SceneSoundMarker, progress: number) {
    if (!context || !master || !noise || !optedIn || context.state !== 'running') return;
    // Fast back-and-forth scrubbing must not create a stack of overlapping attacks.
    if (context.currentTime - lastSoundAt < .075) return;
    stop();
    lastSoundAt = context.currentTime;
    const ctx = context;
    const start = ctx.currentTime + .006;
    const output = ctx.createGain();
    output.gain.value = 1;
    output.connect(master);
    const voice: Voice = { output, nodes: new Set([output]), sources: new Set(), cancelled: false };
    voices.add(voice);

    function addSource(source: AudioScheduledSourceNode) {
      voice.sources.add(source);
      voice.nodes.add(source);
      source.onended = () => {
        voice.sources.delete(source);
        source.disconnect();
        voice.nodes.delete(source);
        if (!voice.sources.size) disconnect(voice);
      };
    }

    function envelope(node: AudioNode, duration: number, volume: number, attack = .006) {
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + Math.min(attack, duration * .2));
      gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
      gain.gain.linearRampToValueAtTime(0, start + duration + .01);
      node.connect(gain);
      gain.connect(output);
      voice.nodes.add(gain);
    }

    function tone(type: OscillatorType, from: number, to: number, duration: number, volume: number, attack = .006) {
      const oscillator = ctx.createOscillator();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(from, start);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, to), start + duration);
      envelope(oscillator, duration, volume, attack);
      addSource(oscillator);
      oscillator.start(start);
      oscillator.stop(start + duration + .015);
    }

    function hiss(type: BiquadFilterType, from: number, to: number, duration: number, volume: number, resonance = .7, attack = .006) {
      const source = ctx.createBufferSource();
      source.buffer = noise;
      const filter = ctx.createBiquadFilter();
      filter.type = type;
      filter.frequency.setValueAtTime(from, start);
      filter.frequency.exponentialRampToValueAtTime(to, start + duration);
      filter.Q.value = resonance;
      source.connect(filter);
      voice.nodes.add(filter);
      envelope(filter, duration, volume, attack);
      addSource(source);
      source.start(start, .31);
      source.stop(start + duration + .015);
    }

    switch (marker.effect) {
      case 'charge':
        tone('sine', 140, 520, .8, .20, .12);
        tone('triangle', 280, 1040, .75, .08, .14);
        hiss('bandpass', 430, 3800, .8, .48, 1.2, .14);
        break;
      case 'beam':
        hiss('lowpass', 6200, 650, .57, .85, .6, .01);
        hiss('bandpass', 2500, 480, .46, .46, 1.5);
        tone('sine', 170, 48, .4, .24);
        break;
      case 'web':
        hiss('bandpass', 5200, 1100, .19, .9, 1.9);
        tone('triangle', 860, 95, .13, .16);
        break;
      case 'claw':
        hiss('highpass', 600, 3800, .23, .68);
        tone('sine', 1350, 990, .20, .10);
        tone('sine', 2340, 1810, .18, .07);
        tone('sine', 3460, 2770, .12, .04);
        break;
      case 'landing':
        tone('sine', 76, 34, .17, .20);
        hiss('lowpass', 570, 90, .18, .25);
        break;
      case 'spell':
        hiss('bandpass', 4300, 720, .39, .8, 1.9);
        tone('triangle', 1220, 190, .28, .10);
        tone('sine', 460, 76, .34, .13);
        break;
      case 'kick':
        tone('sine', 104, 37, .19, .55);
        hiss('lowpass', 2000, 250, .09, .60);
        hiss('bandpass', 630, 210, .16, .26);
        break;
    }
    const event = { scene, marker: marker.id, progress, audioTime: start };
    events.push(event);
    if (events.length > 32) events.shift();
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent<SceneSoundEvent>(SCENE_SOUND_EVENT, { detail: event }));
  }

  function seek(value: number) {
    if (disposed || !Number.isFinite(value)) return;
    const progress = Math.max(0, Math.min(1, value));
    const delta = progress - previous;
    const from = previous;
    previous = progress;
    if (delta < -.00001) { stop(); return; }
    if (delta <= 0 || (typeof document !== 'undefined' && document.hidden)) return;
    const crossed = sceneSoundMarkers[scene].filter(marker => marker.progress > from && marker.progress <= progress);
    // A jump to a late pose plays that pose's nearest contact, rather than stale earlier cues.
    // Each ordinary frame crosses at most one marker; only one voice may be active at a time.
    const marker = crossed[crossed.length - 1];
    if (marker) play(marker, progress);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    optedIn = false;
    stop();
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility);
    master?.disconnect();
    limiter?.disconnect();
    if (context && context.state !== 'closed') void context.close().catch(() => undefined);
    noise = null;
  }

  return {
    enable,
    setScene(id) { stop(); scene = id; previous = 0; },
    prime(progress) {
      if (disposed || !Number.isFinite(progress)) return;
      stop();
      previous = Math.max(0, Math.min(1, progress));
    },
    seek,
    stop,
    dispose,
    enabled: () => optedIn && !disposed && context?.state === 'running',
    diagnostics: () => ({ scene, enabled: optedIn && !disposed && context?.state === 'running', activeVoices: voices.size, events: events.slice() }),
  };
}
