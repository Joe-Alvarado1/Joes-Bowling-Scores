import { applyRollEntry } from '../components/ScoreSheet.helpers';
import { FrameInput } from '../types';
import { getEntryValidationMessage } from '../utils/scoring';

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

  it('reports invalid first-roll values before the frame is committed', () => {
    const frames = createEmptyFrames();

    expect(getEntryValidationMessage(frames, 0, 0, '/')).toBe('Frame 1 first roll must be 0-9 or X.');
  });

  it('reports invalid second-roll totals before the frame is committed', () => {
    const frames = createEmptyFrames();
    const firstRollFrames = applyRollEntry(frames, 0, 0, '8');

    expect(getEntryValidationMessage(firstRollFrames, 0, 1, '9')).toBe('Frame 1 total cannot exceed 10.');
  });

  it('converts a second roll that makes 10 into a spare slash', () => {
    const frames = createEmptyFrames();
    const firstRollFrames = applyRollEntry(frames, 0, 0, '8');
    const nextFrames = applyRollEntry(firstRollFrames, 0, 1, '2');

    expect(nextFrames[0].rolls[1]).toBe('/');
    expect(getEntryValidationMessage(firstRollFrames, 0, 1, '2')).toBeNull();
  });
});
