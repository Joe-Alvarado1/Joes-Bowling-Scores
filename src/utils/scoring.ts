import { FrameInput, FrameScore } from '../types';

const parseRawRoll = (value: string): number | 'X' | '/' | null => {
  const normalized = value.trim().toUpperCase();
  if (!normalized) {
    return null;
  }
  if (normalized === 'X') {
    return 'X';
  }
  if (normalized === '/') {
    return '/';
  }
  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) {
    return null;
  }
  if (parsed < 0 || parsed > 10) {
    return null;
  }
  return parsed;
};

const parseRollValue = (rolls: string[], index: number): number | null => {
  if (index < 0) {
    return null;
  }
  const raw = parseRawRoll(rolls[index] ?? '');
  if (raw === null) {
    return null;
  }

  if (raw === 'X') {
    return 10;
  }

  if (raw === '/') {
    const previous = parseRollValue(rolls, index - 1);
    if (previous === null || previous >= 10) {
      return null;
    }
    return 10 - previous;
  }

  return raw;
};

export const framesToRolls = (frames: FrameInput[]) => {
  const rolls: number[] = [];

  frames.forEach((frame, frameIndex) => {
    if (frameIndex < 9) {
      const isStrike = frame.rolls[1]?.toUpperCase() === 'X' && !frame.rolls[0]?.trim();
      if (isStrike) {
        rolls.push(10);
        return;
      }

      const first = parseRollValue(frame.rolls, 0);
      if (first === null) {
        return;
      }

      const second = parseRollValue(frame.rolls, 1);
      if (second === null) {
        rolls.push(first);
        return;
      }

      rolls.push(first, second);
      return;
    }

    const first = parseRollValue(frame.rolls, 0);
    const second = parseRollValue(frame.rolls, 1);
    const third = parseRollValue(frame.rolls, 2);

    if (first !== null) {
      rolls.push(first);
    }
    if (second !== null) {
      rolls.push(second);
    }
    if (third !== null) {
      rolls.push(third);
    }
  });

  return rolls;
};

export const calculateBowlingScore = (frames: FrameInput[]) => {
  const frameScores: FrameScore[] = [];
  const rolls = framesToRolls(frames);
  let rollIndex = 0;
  let total = 0;

  for (let frameIndex = 0; frameIndex < 10; frameIndex += 1) {
    if (frameIndex === 9) {
      const first = rolls[rollIndex];
      const second = rolls[rollIndex + 1];
      const third = rolls[rollIndex + 2];

      if (first === undefined || second === undefined) {
        break;
      }

      if (first === 10 && third === undefined) {
        break;
      }

      if (first !== 10 && first + second === 10 && third === undefined) {
        break;
      }

      const frameRolls = [first, second].concat(third !== undefined ? [third] : []);
      const frameTotal = frameRolls.reduce((sum, roll) => sum + roll, 0);
      total += frameTotal;
      frameScores.push({ score: frameTotal, cumulative: total });
      break;
    }

    const first = rolls[rollIndex];
    const second = rolls[rollIndex + 1];

    if (first === undefined) {
      break;
    }

    if (first === 10) {
      if (rolls[rollIndex + 1] === undefined || rolls[rollIndex + 2] === undefined) {
        break;
      }
      const bonusOne = rolls[rollIndex + 1];
      const bonusTwo = rolls[rollIndex + 2];
      const frameScore = 10 + bonusOne + bonusTwo;
      total += frameScore;
      frameScores.push({ score: frameScore, cumulative: total });
      rollIndex += 1;
      continue;
    }

    if (second === undefined) {
      break;
    }

    const frameSum = first + second;
    if (frameSum === 10) {
      if (rolls[rollIndex + 2] === undefined) {
        break;
      }
      const bonus = rolls[rollIndex + 2];
      const frameScore = 10 + bonus;
      total += frameScore;
      frameScores.push({ score: frameScore, cumulative: total });
    } else {
      const frameScore = frameSum;
      total += frameScore;
      frameScores.push({ score: frameScore, cumulative: total });
    }
    rollIndex += 2;
  }

  return { total, frameScores };
};

const frameHasAnyRolls = (frame: FrameInput) => frame.rolls.some((roll) => roll.trim() !== '');

export const validateFrames = (frames: FrameInput[]) => {
  for (let frameIndex = 0; frameIndex < 9; frameIndex += 1) {
    const frame = frames[frameIndex];
    if (!frameHasAnyRolls(frame)) {
      continue;
    }

    const isStrike = frame.rolls[1]?.toUpperCase() === 'X' && !frame.rolls[0]?.trim();
    if (isStrike) {
      continue;
    }

    const firstRaw = parseRawRoll(frame.rolls[0] ?? '');
    const first = parseRollValue(frame.rolls, 0);

    if (first === null) {
      return `Frame ${frameIndex + 1} first roll must be 0-10 or X.`;
    }

    if (!frame.rolls[1]?.trim()) {
      continue;
    }

    const secondRaw = parseRawRoll(frame.rolls[1] ?? '');
    const second = parseRollValue(frame.rolls, 1);
    if (second === null) {
      return `Frame ${frameIndex + 1} second roll must be 0-10 or /.`;
    }
    if (first + second > 10) {
      return `Frame ${frameIndex + 1} total cannot exceed 10.`;
    }
    if (secondRaw === '/' && first >= 10) {
      return `Frame ${frameIndex + 1} spare is invalid after a strike.`;
    }
  }

  const tenthFrame = frames[9];
  if (!frameHasAnyRolls(tenthFrame)) {
    return null;
  }

  const first = parseRollValue(tenthFrame.rolls, 0);
  if (first === null) {
    return 'Frame 10 first roll must be 0-10 or X.';
  }

  if (!tenthFrame.rolls[1]?.trim()) {
    return null;
  }

  const second = parseRollValue(tenthFrame.rolls, 1);
  if (second === null) {
    return 'Frame 10 second roll must be 0-10 or /.';
  }

  const firstRaw = parseRawRoll(tenthFrame.rolls[0] ?? '');
  const secondRaw = parseRawRoll(tenthFrame.rolls[1] ?? '');
  const third = parseRollValue(tenthFrame.rolls, 2);
  const thirdRaw = parseRawRoll(tenthFrame.rolls[2] ?? '');

  if (first === 10) {
    if (!tenthFrame.rolls[2]?.trim()) {
      return null;
    }
    if (third === null) {
      return 'Frame 10 third roll must be 0-10, /, or X after a strike.';
    }
    if (thirdRaw === '/' && second === 10) {
      return 'Frame 10 third roll cannot be / after two strikes.';
    }
    return null;
  }

  if (first + second === 10) {
    if (!tenthFrame.rolls[2]?.trim()) {
      return null;
    }
    if (third === null) {
      return 'Frame 10 third roll must be 0-10 or X after a spare.';
    }
    if (thirdRaw === '/' && second === 10) {
      return 'Frame 10 third roll cannot be / after a strike on the second roll.';
    }
    return null;
  }

  if (first + second > 10) {
    return 'Frame 10 first and second roll cannot exceed 10 unless the first roll is a strike.';
  }

  if (tenthFrame.rolls[2]?.trim()) {
    return 'Frame 10 third roll is only allowed after a strike or spare.';
  }

  return null;
};
