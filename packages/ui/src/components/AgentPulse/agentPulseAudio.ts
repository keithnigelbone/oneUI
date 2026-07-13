/**
 * agentPulseAudio.ts
 *
 * Singleton audio drivers for the listening and speaking states. The
 * AgentPulse component subscribes here whenever its phase matches.
 *
 * Lifecycle:
 *  1. Page renders. Nothing is running.
 *  2. User clicks "Enable audio demos" → unlockAudio() runs once:
 *     - Requests mic permission and starts the shared mic analyser.
 *     - Primes the speaking-audio <audio> element with a silent play/pause
 *       so future play() calls work without another user gesture.
 *  3. After unlock, mic keeps running so listening pills react instantly.
 *  4. Speaking audio plays ONLY while at least one <AgentPulse state="speaking">
 *     is mounted (i.e., at least one subscribeSpeaking subscriber exists).
 *     When the last speaking instance unmounts or changes state, the file
 *     pauses automatically. Re-entering speaking resumes from the pause
 *     position (loops, so the listener doesn't notice).
 *
 * Singleton model: N AgentPulse instances on the same page share one mic
 * stream and one playback element — they all pulse in sync from a single
 * source.
 */

const PILL_MIN_H = 120;
const PILL_MAX_H = 510;
const AUDIO_GAIN_REF = 180;
const SPEAKING_SCALE_MIN = 1;
const SPEAKING_SCALE_MAX = 1.4;

export const DEFAULT_SPEAKING_SRC = '/speaking-demo.mp3';

type ListeningCallback = (heights: [number, number, number, number]) => void;
type SpeakingCallback = (scale: number) => void;
type StateListener = () => void;

function averageBand(buf: Uint8Array, from: number, to: number) {
  let sum = 0;
  for (let i = from; i <= to; i++) sum += buf[i];
  return sum / (to - from + 1);
}

const stateListeners = new Set<StateListener>();

function notifyState() {
  stateListeners.forEach((cb) => cb());
}

export function onAudioStateChange(cb: StateListener): () => void {
  stateListeners.add(cb);
  return () => {
    stateListeners.delete(cb);
  };
}

// ----------------------------------------------------------------------------
// Mic singleton — runs continuously from unlockAudio() until stopAll().
// ----------------------------------------------------------------------------

let micCtx: AudioContext | null = null;
let micStream: MediaStream | null = null;
let micAnalyser: AnalyserNode | null = null;
let micBuffer: Uint8Array<ArrayBuffer> | null = null;
let micRaf: number | null = null;
let micActive = false;
let micError: string | null = null;
const micSubs = new Set<ListeningCallback>();

function tickMic() {
  if (!micAnalyser || !micBuffer) return;
  micAnalyser.getByteFrequencyData(micBuffer);
  const norm0 = Math.min(1, averageBand(micBuffer, 2, 7) / AUDIO_GAIN_REF);
  const norm1 = Math.min(1, averageBand(micBuffer, 8, 19) / AUDIO_GAIN_REF);
  const norm2 = Math.min(1, averageBand(micBuffer, 20, 45) / AUDIO_GAIN_REF);
  const norm3 = Math.min(1, averageBand(micBuffer, 46, 110) / AUDIO_GAIN_REF);
  const heights: [number, number, number, number] = [
    PILL_MIN_H + norm0 * (PILL_MAX_H - PILL_MIN_H),
    PILL_MIN_H + norm1 * (PILL_MAX_H - PILL_MIN_H),
    PILL_MIN_H + norm2 * (PILL_MAX_H - PILL_MIN_H),
    PILL_MIN_H + norm3 * (PILL_MAX_H - PILL_MIN_H),
  ];
  micSubs.forEach((cb) => cb(heights));
  micRaf = requestAnimationFrame(tickMic);
}

async function startMic(): Promise<void> {
  if (micActive) return;
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    micError = 'Microphone API unavailable in this browser.';
    notifyState();
    return;
  }
  try {
    micError = null;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micStream = stream;
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    micCtx = new Ctx();
    const source = micCtx.createMediaStreamSource(stream);
    micAnalyser = micCtx.createAnalyser();
    micAnalyser.fftSize = 256;
    micAnalyser.smoothingTimeConstant = 0.78;
    source.connect(micAnalyser);
    micBuffer = new Uint8Array<ArrayBuffer>(new ArrayBuffer(micAnalyser.frequencyBinCount));
    micActive = true;
    notifyState();
    tickMic();
  } catch (err) {
    micError = err instanceof Error ? err.message : 'Microphone access denied';
    stopMic();
  }
}

function stopMic(): void {
  if (micRaf != null) cancelAnimationFrame(micRaf);
  micStream?.getTracks().forEach((t) => t.stop());
  micCtx?.close().catch(() => {});
  micRaf = null;
  micStream = null;
  micCtx = null;
  micAnalyser = null;
  micBuffer = null;
  micActive = false;
  notifyState();
}

export function subscribeListening(cb: ListeningCallback): () => void {
  micSubs.add(cb);
  return () => {
    micSubs.delete(cb);
  };
}

export function isMicActive(): boolean {
  return micActive;
}

export function getMicError(): string | null {
  return micError;
}

// ----------------------------------------------------------------------------
// Speaking singleton — gated by `speakingSubs.size`. Plays only while at
// least one <AgentPulse state="speaking"> is mounted.
// ----------------------------------------------------------------------------

let speakingAudio: HTMLAudioElement | null = null;
let speakingCtx: AudioContext | null = null;
let speakingAnalyser: AnalyserNode | null = null;
let speakingSource: MediaElementAudioSourceNode | null = null;
let speakingBuffer: Uint8Array<ArrayBuffer> | null = null;
let speakingRaf: number | null = null;
let speakingActive = false;
let speakingError: string | null = null;
const speakingSubs = new Set<SpeakingCallback>();

function tickSpeaking() {
  if (!speakingAnalyser || !speakingBuffer) return;
  speakingAnalyser.getByteFrequencyData(speakingBuffer);
  let sum = 0;
  for (let i = 2; i <= 110; i++) sum += speakingBuffer[i];
  const overall = sum / (110 - 2 + 1);
  const norm = Math.min(1, overall / AUDIO_GAIN_REF);
  const scale = SPEAKING_SCALE_MIN + norm * (SPEAKING_SCALE_MAX - SPEAKING_SCALE_MIN);
  speakingSubs.forEach((cb) => cb(scale));
  speakingRaf = requestAnimationFrame(tickSpeaking);
}

function emitSpeakingRest() {
  speakingSubs.forEach((cb) => cb(SPEAKING_SCALE_MIN));
}

function ensureSpeakingPipeline(src: string) {
  if (!speakingAudio || speakingAudio.src.indexOf(src) === -1) {
    speakingAudio = new Audio(src);
    speakingAudio.preload = 'auto';
    speakingAudio.loop = true;
    speakingSource = null;
    speakingAnalyser = null;
    speakingBuffer = null;
  }
  if (!speakingCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    speakingCtx = new Ctx();
  }
  if (!speakingSource) {
    speakingSource = speakingCtx.createMediaElementSource(speakingAudio);
    speakingAnalyser = speakingCtx.createAnalyser();
    speakingAnalyser.fftSize = 256;
    speakingAnalyser.smoothingTimeConstant = 0.78;
    speakingSource.connect(speakingAnalyser);
    speakingAnalyser.connect(speakingCtx.destination);
    speakingBuffer = new Uint8Array<ArrayBuffer>(new ArrayBuffer(speakingAnalyser.frequencyBinCount));
  }
}

async function resumeSpeaking(): Promise<void> {
  if (!audioUnlocked || speakingActive || !speakingAudio) return;
  try {
    speakingError = null;
    await speakingAudio.play();
    speakingActive = true;
    notifyState();
    tickSpeaking();
  } catch (err) {
    speakingError = err instanceof Error ? err.message : 'Could not play audio file';
    notifyState();
  }
}

function pauseSpeaking(): void {
  if (speakingRaf != null) cancelAnimationFrame(speakingRaf);
  speakingRaf = null;
  if (speakingAudio) speakingAudio.pause();
  speakingActive = false;
  emitSpeakingRest();
  notifyState();
}

export function subscribeSpeaking(cb: SpeakingCallback): () => void {
  speakingSubs.add(cb);
  if (speakingSubs.size === 1) void resumeSpeaking();
  return () => {
    speakingSubs.delete(cb);
    if (speakingSubs.size === 0) pauseSpeaking();
  };
}

export function isSpeakingActive(): boolean {
  return speakingActive;
}

export function getSpeakingError(): string | null {
  return speakingError;
}

// ----------------------------------------------------------------------------
// Unlock — one user gesture grants mic permission, starts the mic loop,
// and primes the speaking-audio element. After unlock, speaking audio
// plays automatically only while a speaking instance is mounted.
// ----------------------------------------------------------------------------

let audioUnlocked = false;

export function isAudioUnlocked(): boolean {
  return audioUnlocked;
}

export async function unlockAudio(src: string = DEFAULT_SPEAKING_SRC): Promise<void> {
  if (audioUnlocked) return;

  await startMic();

  try {
    ensureSpeakingPipeline(src);
    if (speakingCtx && speakingCtx.state === 'suspended') {
      await speakingCtx.resume();
    }
    if (speakingAudio) {
      // Silent prime — satisfies autoplay rules without an audible blip.
      speakingAudio.muted = true;
      await speakingAudio.play();
      speakingAudio.pause();
      speakingAudio.currentTime = 0;
      speakingAudio.muted = false;
    }
    audioUnlocked = true;
    notifyState();

    // If a speaking instance is already on screen, start playback now.
    if (speakingSubs.size > 0) void resumeSpeaking();
  } catch (err) {
    speakingError = err instanceof Error ? err.message : 'Could not unlock audio';
    notifyState();
  }
}

export function stopAll(): void {
  pauseSpeaking();
  stopMic();
  audioUnlocked = false;
  notifyState();
}
