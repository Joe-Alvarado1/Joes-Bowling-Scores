import { FrameInput } from '../types';

export const normalizeRollEntry = (
  value: string,
  frameIndex: number,
  rollIndex: number,
  frame: FrameInput
) => {
  const raw = value.toUpperCase().trim();
  if (!raw) {
    return '';
  }
  if (raw === 'X') {
    return 'X';
  }
  if (raw === '/') {
    return '/';
  }

  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) {
    return '';
  }

  const numberValue = Number(digits);
  if (Number.isNaN(numberValue)) {
    return '';
  }

  if (numberValue === 10) {
    return 'X';
  }

  return String(numberValue);
};

export const applyRollEntry = (
  frames: FrameInput[],
  frameIndex: number,
  rollIndex: number,
  value: string
) => {
  const nextFrames = frames.map((frame) => ({ rolls: [...frame.rolls] }));
  const normalized = normalizeRollEntry(value, frameIndex, rollIndex, nextFrames[frameIndex]);

  if (frameIndex < 9 && normalized === 'X') {
    nextFrames[frameIndex].rolls[0] = '';
    nextFrames[frameIndex].rolls[1] = 'X';
  } else {
    nextFrames[frameIndex].rolls[rollIndex] = normalized;
  }

  if (frameIndex < 9 && rollIndex === 0 && normalized === '') {
    nextFrames[frameIndex].rolls[1] = '';
  }

  return nextFrames;
};
