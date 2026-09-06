/**
 * Measures pauses and filled pauses ("um", "uh") from the microphone signal.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS
 *
 * Two of the four delivery components were measuring nothing on the microphone
 * path, for two different reasons:
 *
 *   Fillers — Chrome's speech recogniser removes "um" and "uh" before you ever
 *   see the transcript. Its language model treats them as noise, because for
 *   dictation they are. Counting them in the text therefore counted almost
 *   none of them.
 *
 *   Pauses — the Web Speech API exposes no word timings at all, so pause
 *   placement had nothing to work from and was suppressed entirely.
 *
 * Neither is recoverable from text. Both are trivially present in the audio,
 * which the browser will hand over separately. So this reads the waveform.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** 50 Hz. Fine enough to place a pause boundary within a syllable. */
const FRAME_INTERVAL_MS = 20;

/** Silence shorter than this is the gap between words, not a pause. */
const MINIMUM_PAUSE_MS = 350;

/** A filled pause is a held vowel; shorter than this is a normal one. */
const MINIMUM_FILLED_PAUSE_MS = 180;
const MAXIMUM_FILLED_PAUSE_MS = 1600;

/** Frames of quiet used to learn the room before anything is measured. */
const CALIBRATION_FRAMES = 40;

/** Speech is this much louder than the measured noise floor. */
const SPEECH_ENERGY_MARGIN = 2.6;

/**
 * Spectral flux below this means the sound is not changing — a held vowel
 * rather than articulated speech. This is what separates "ummm" from "under".
 */
const STEADY_SOUND_FLUX_LIMIT = 0.055;

export interface DetectedPause {
  start_ms: number;
  duration_ms: number;
}

export interface DetectedFilledPause {
  start_ms: number;
  duration_ms: number;
}

export interface SpeechAudioSnapshot {
  pauses: DetectedPause[];
  filled_pauses: DetectedFilledPause[];
  /** Milliseconds of actual speech, excluding silence. */
  speaking_ms: number;
  elapsed_ms: number;
  /** False until the noise floor has been learned. */
  is_calibrated: boolean;
}

type AnalyserState = "SILENCE" | "SPEECH";

export class SpeechAudioAnalyser {
  private audio_context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private frame_timer: ReturnType<typeof setInterval> | null = null;

  private time_domain = new Float32Array(0);
  private frequency_domain = new Float32Array(0);
  private previous_spectrum: Float32Array | null = null;

  private started_at_ms = 0;
  private state: AnalyserState = "SILENCE";
  private state_started_at_ms = 0;

  /** Learned from the opening frames rather than assumed. */
  private noise_floor = 0;
  private calibration_samples: number[] = [];

  private steady_run_started_at_ms: number | null = null;

  private pauses: DetectedPause[] = [];
  private filled_pauses: DetectedFilledPause[] = [];
  private speaking_ms = 0;

  async start(stream: MediaStream): Promise<void> {
    const audio_context = new AudioContext();
    // Autoplay policy can leave a fresh context suspended.
    if (audio_context.state === "suspended") await audio_context.resume();

    const analyser = audio_context.createAnalyser();
    // 1024 gives ~21ms of audio at 48kHz — about one frame, which is the
    // resolution a filled pause needs without smearing across syllables.
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.2;

    const source = audio_context.createMediaStreamSource(stream);
    source.connect(analyser);
    // Deliberately not connected to the destination: routing the microphone to
    // the speakers would feed back.

    this.audio_context = audio_context;
    this.analyser = analyser;
    this.source = source;
    this.time_domain = new Float32Array(analyser.fftSize);
    this.frequency_domain = new Float32Array(analyser.frequencyBinCount);

    this.reset();
    this.frame_timer = setInterval(() => this.readFrame(), FRAME_INTERVAL_MS);
  }

  stop(): void {
    if (this.frame_timer !== null) {
      clearInterval(this.frame_timer);
      this.frame_timer = null;
    }

    this.source?.disconnect();
    this.analyser?.disconnect();
    void this.audio_context?.close();

    this.source = null;
    this.analyser = null;
    this.audio_context = null;
  }

  reset(): void {
    this.started_at_ms = performance.now();
    this.state = "SILENCE";
    this.state_started_at_ms = this.started_at_ms;
    this.noise_floor = 0;
    this.calibration_samples = [];
    this.steady_run_started_at_ms = null;
    this.previous_spectrum = null;
    this.pauses = [];
    this.filled_pauses = [];
    this.speaking_ms = 0;
  }

  getSnapshot(): SpeechAudioSnapshot {
    return {
      pauses: [...this.pauses],
      filled_pauses: [...this.filled_pauses],
      speaking_ms: Math.round(this.speaking_ms),
      elapsed_ms: Math.round(performance.now() - this.started_at_ms),
      is_calibrated: this.calibration_samples.length >= CALIBRATION_FRAMES,
    };
  }

  private readFrame(): void {
    const analyser = this.analyser;
    if (!analyser) return;

    analyser.getFloatTimeDomainData(this.time_domain);
    analyser.getFloatFrequencyData(this.frequency_domain);

    const now_ms = performance.now();
    const energy = computeRootMeanSquare(this.time_domain);

    // The first frames measure the room, not the speaker.
    if (this.calibration_samples.length < CALIBRATION_FRAMES) {
      this.calibration_samples.push(energy);

      if (this.calibration_samples.length === CALIBRATION_FRAMES) {
        this.noise_floor = median(this.calibration_samples);
      }

      this.previous_spectrum = Float32Array.from(this.frequency_domain);
      return;
    }

    const flux = computeSpectralFlux(
      this.frequency_domain,
      this.previous_spectrum,
    );
    this.previous_spectrum = Float32Array.from(this.frequency_domain);

    const is_speech = energy > Math.max(this.noise_floor * SPEECH_ENERGY_MARGIN, 0.004);

    this.updateSpeechState(is_speech, now_ms);
    if (is_speech) {
      this.speaking_ms += FRAME_INTERVAL_MS;
      this.updateFilledPause(flux, now_ms);
    } else {
      this.steady_run_started_at_ms = null;
    }
  }

  /** Silence/speech transitions, recording anything long enough to be a pause. */
  private updateSpeechState(is_speech: boolean, now_ms: number): void {
    const next_state: AnalyserState = is_speech ? "SPEECH" : "SILENCE";
    if (next_state === this.state) return;

    const duration_ms = now_ms - this.state_started_at_ms;

    if (this.state === "SILENCE" && duration_ms >= MINIMUM_PAUSE_MS) {
      this.pauses.push({
        start_ms: Math.round(this.state_started_at_ms - this.started_at_ms),
        duration_ms: Math.round(duration_ms),
      });
    }

    this.state = next_state;
    this.state_started_at_ms = now_ms;
  }

  /**
   * A filled pause is voiced sound that stops changing.
   *
   * Articulated speech moves constantly through the spectrum as the mouth
   * changes shape. "Ummm" does not — the tongue parks and the spectrum goes
   * flat. A sustained run of low spectral flux while energy stays up is
   * therefore a held vowel, which is what a filled pause is.
   */
  private updateFilledPause(flux: number, now_ms: number): void {
    const is_steady = flux < STEADY_SOUND_FLUX_LIMIT;

    if (is_steady) {
      this.steady_run_started_at_ms ??= now_ms;
      return;
    }

    if (this.steady_run_started_at_ms === null) return;

    const duration_ms = now_ms - this.steady_run_started_at_ms;

    if (
      duration_ms >= MINIMUM_FILLED_PAUSE_MS &&
      duration_ms <= MAXIMUM_FILLED_PAUSE_MS
    ) {
      this.filled_pauses.push({
        start_ms: Math.round(this.steady_run_started_at_ms - this.started_at_ms),
        duration_ms: Math.round(duration_ms),
      });
    }

    this.steady_run_started_at_ms = null;
  }
}

function computeRootMeanSquare(samples: Float32Array): number {
  let sum_of_squares = 0;
  for (let index = 0; index < samples.length; index += 1) {
    sum_of_squares += samples[index] * samples[index];
  }
  return Math.sqrt(sum_of_squares / samples.length);
}

/**
 * How much the spectrum changed since the previous frame, normalised to 0-1.
 *
 * Values arrive in dBFS (roughly -100 to 0), so they are shifted into a
 * positive range before differencing.
 */
function computeSpectralFlux(
  spectrum: Float32Array,
  previous_spectrum: Float32Array | null,
): number {
  if (!previous_spectrum) return 1;

  const DECIBEL_FLOOR = 100;
  let total_change = 0;

  for (let index = 0; index < spectrum.length; index += 1) {
    const current = Math.max(spectrum[index] + DECIBEL_FLOOR, 0) / DECIBEL_FLOOR;
    const previous =
      Math.max(previous_spectrum[index] + DECIBEL_FLOOR, 0) / DECIBEL_FLOOR;

    total_change += Math.abs(current - previous);
  }

  return total_change / spectrum.length;
}

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}
