import { FrameInput } from '../types';

export const normalizeRollValue = (value: string) => (value || '').trim().toUpperCase();

const isStrike = (v: string) => normalizeRollValue(v) === 'X';
const isSpare = (v: string) => normalizeRollValue(v) === '/';
const isMiss = (v: string) => normalizeRollValue(v) === '-';
const isDigit = (v: string) => /^[0-9]$/.test(normalizeRollValue(v));

const toPins = (v: string): number => {
  const n = normalizeRollValue(v);
  if (n === '' || n === '-') return 0;
  if (n === 'X') return 10;
  if (/^[0-9]$/.test(n)) return Number(n);
  return 0;
};

const cloneFrames = (frames: FrameInput[]): FrameInput[] =>
  frames.map((frame) => ({
    ...frame,
    rolls: [...frame.rolls],
  }));

export const isStrikeFrame = (frame: FrameInput, frameIndex: number) => {
  if (frameIndex >= 9) return false;
  return normalizeRollValue(frame.rolls[0] ?? '') === '' && normalizeRollValue(frame.rolls[1] ?? '') === 'X';
};

export const isFrameComplete = (frame: FrameInput, frameIndex: number): boolean => {
  const r0 = normalizeRollValue(frame.rolls[0] ?? '');
  const r1 = normalizeRollValue(frame.rolls[1] ?? '');
  const r2 = normalizeRollValue(frame.rolls[2] ?? '');

  if (frameIndex < 9) {
    if (r0 === '' && r1 === 'X') return true; // strike
    if (r0 !== '' && r1 !== '') return true;  // open or spare
    return false;
  }

  // 10th frame
  if (r0 === '') return false;
  if (r1 === '') return false;

  // strike on first OR spare on second => requires third
  if (r0 === 'X' || r1 === '/') {
    return r2 !== '';
  }

  return true;
};

export const applyRollEntry = (
  currentFrames: FrameInput[],
  frameIndex: number,
  rollIndex: number,
  rawValue: string
): FrameInput[] => {
  const frames = cloneFrames(currentFrames);
  const frame = frames[frameIndex];
  const value = normalizeRollValue(rawValue);

  if (!frame) return currentFrames;

  // clear behavior
  if (value === '') {
    frame.rolls[rollIndex] = '';

    if (frameIndex < 9) {
      if (rollIndex === 0) {
        frame.rolls[1] = '';
      }
    } else {
      if (rollIndex === 0) {
        frame.rolls[1] = '';
        frame.rolls[2] = '';
      } else if (rollIndex === 1) {
        frame.rolls[2] = '';
      }
    }

    return frames;
  }

  const validChar = isStrike(value) || isSpare(value) || isMiss(value) || isDigit(value);
  if (!validChar) return currentFrames;

  // ----------------------------
  // Frames 1-9
  // ----------------------------
  if (frameIndex < 9) {
    if (rollIndex === 0) {
      // First roll cannot be spare
      if (isSpare(value)) return currentFrames;

      // Entering X in first box stores canonical strike ['', 'X']
      if (isStrike(value)) {
        frame.rolls[0] = '';
        frame.rolls[1] = 'X';
        return frames;
      }

      // 0 auto-converts to -
      frame.rolls[0] = value === '0' ? '-' : value;
      frame.rolls[1] = '';
      return frames;
    }

    if (rollIndex === 1) {
      const first = normalizeRollValue(frame.rolls[0] ?? '');

      // Allow entering X directly in second box if first is empty
      if (isStrike(value) && first === '') {
        frame.rolls[0] = '';
        frame.rolls[1] = 'X';
        return frames;
      }

      // Spare requires first roll present and not strike
      if (isSpare(value)) {
        if (first === '' || isStrike(first)) return currentFrames;
        frame.rolls[1] = '/';
        return frames;
      }

      // Digit/miss cannot exceed 10 with first roll
      if (isDigit(value) || isMiss(value)) {
        if (first === '' || isStrike(first)) return currentFrames;

        const firstPins = toPins(first);
        const secondPins = toPins(value === '0' ? '-' : value);

        if (firstPins + secondPins > 10) return currentFrames;

        frame.rolls[1] = value === '0' ? '-' : value;
        return frames;
      }
    }

    return currentFrames;
  }

  // ----------------------------
  // 10th Frame
  // ----------------------------
  const r0 = normalizeRollValue(frame.rolls[0] ?? '');
  const r1 = normalizeRollValue(frame.rolls[1] ?? '');

  if (rollIndex === 0) {
    if (isSpare(value)) return currentFrames;

    frame.rolls[0] = value === '0' ? '-' : value;
    frame.rolls[1] = '';
    frame.rolls[2] = '';
    return frames;
  }

  if (rollIndex === 1) {
    if (r0 === '') return currentFrames;

    // If first roll is strike, second can be X, digit, or miss, but not spare
    if (isStrike(r0)) {
      if (isSpare(value)) return currentFrames;

      frame.rolls[1] = value === '0' ? '-' : value;
      frame.rolls[2] = '';
      return frames;
    }

    // Non-strike first roll: spare is allowed
    if (isSpare(value)) {
      frame.rolls[1] = '/';
      frame.rolls[2] = '';
      return frames;
    }

    if (isDigit(value) || isMiss(value)) {
      const firstPins = toPins(r0);
      const secondPins = toPins(value === '0' ? '-' : value);

      if (firstPins + secondPins > 10) return currentFrames;

      frame.rolls[1] = value === '0' ? '-' : value;
      frame.rolls[2] = '';
      return frames;
    }

    return currentFrames;
  }

  if (rollIndex === 2) {
    const first = normalizeRollValue(frame.rolls[0] ?? '');
    const second = normalizeRollValue(frame.rolls[1] ?? '');

    const bonusAllowed = isStrike(first) || isSpare(second);
    if (!bonusAllowed) return currentFrames;

    // X X ?
    if (isStrike(first) && isStrike(second)) {
      if (isSpare(value)) return currentFrames;
      frame.rolls[2] = value === '0' ? '-' : value;
      return frames;
    }

    // X 7 ?  => can be /, X, digit, or -
    if (isStrike(first) && !isStrike(second)) {
      if (isSpare(value)) {
        if (second === '') return currentFrames;
        frame.rolls[2] = '/';
        return frames;
      }

      frame.rolls[2] = value === '0' ? '-' : value;
      return frames;
    }

    // 7 / ? => can be X, digit, -, but not spare
    if (isSpare(second)) {
      if (isSpare(value)) return currentFrames;
      frame.rolls[2] = value === '0' ? '-' : value;
      return frames;
    }
  }

  return currentFrames;
};