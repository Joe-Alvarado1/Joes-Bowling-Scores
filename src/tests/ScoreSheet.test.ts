import { applyRollEntry } from '../components/ScoreSheet.helpers';
import { FrameInput } from '../types';

describe('ScoreSheet helpers', () => {
  const createEmptyFrames = (): FrameInput[] =>
    Array.from({ length: 10 }, () => ({ rolls: ['', ''] }));

  it('moves a strike entered in the first roll to the second roll for frames 1-9', () => {
    const frames = createEmptyFrames();
    const nextFrames = applyRollEntry(frames, 0, 0, 'X');

    expect(nextFrames[0].rolls[0]).toBe('');
    expect(nextFrames[0].rolls[1]).toBe('X');
  });

  it('keeps numeric entries in the first roll for the first nine frames', () => {
    const frames = createEmptyFrames();
    const nextFrames = applyRollEntry(frames, 0, 0, '9');

    expect(nextFrames[0].rolls[0]).toBe('9');
    expect(nextFrames[0].rolls[1]).toBe('');
  });

  it('a strike rolled on the first roll of the 10th frame should stay in the first roll', () => {
    const frames = createEmptyFrames();
    const nextFrames = applyRollEntry(frames, 9, 0, 'X');

    expect(nextFrames[9].rolls[0]).toBe('X');
    expect(nextFrames[9].rolls[1]).toBe('');
  });

  it('allows numeric entries in the first roll for the 10th frame', () => {
    const frames = createEmptyFrames();
    const nextFrames = applyRollEntry(frames, 9, 0, '8');

    expect(nextFrames[9].rolls[0]).toBe('8');
    expect(nextFrames[9].rolls[1]).toBe('');
  });
});
