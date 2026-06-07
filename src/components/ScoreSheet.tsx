import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { calculateBowlingScore, validateFrames } from '../utils/scoring';
import { FrameInput } from '../types';
import {
  applyRollEntry,
  isStrikeFrame,
  isFrameComplete,
  normalizeRollValue,
} from './ScoreSheet.helpers';

const initialFrames: FrameInput[] = Array.from({ length: 10 }, (_, index) => ({
  rolls: index === 9 ? ['', '', ''] : ['', ''],
}));

const frameLabel = (index: number) => `${index + 1}`;

const getDisplayRoll = (frame: FrameInput, frameIndex: number, rollIndex: number): string => {
  if (frameIndex < 9) {
    const strike = isStrikeFrame(frame, frameIndex);
    if (rollIndex === 0) {
      return strike ? '' : frame.rolls[0] ?? '';
    }
    if (rollIndex === 1) {
      return strike ? 'X' : frame.rolls[1] ?? '';
    }
  }
  return frame.rolls[rollIndex] ?? '';
};

const ScoreSheet = () => {
  const [frames, setFrames] = useState<FrameInput[]>(initialFrames);

  const inputRefs = useRef<Array<Array<TextInput | null>>>(
    Array.from({ length: 10 }, () => Array.from({ length: 3 }, () => null))
  );

  const pendingFocusRef = useRef<{ frameIndex: number; rollIndex: number } | null>(null);

  const validationMessage = useMemo(() => validateFrames(frames), [frames]);
  const { total, frameScores } = useMemo(() => calculateBowlingScore(frames), [frames]);

  const queueFocus = (fIndex: number, rIndex: number) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const ref = inputRefs.current?.[fIndex]?.[rIndex];
        try {
          ref?.focus?.();
        } catch {
          // ignore
        }
      });
    });
  };

  const focusInput = (fIndex: number, rIndex: number) => {
    const ref = inputRefs.current?.[fIndex]?.[rIndex];
    try {
      ref?.focus?.();
    } catch {
      // ignore
    }
  };

  const getPrevPosition = (frameIndex: number, rollIndex: number) => {
    if (rollIndex > 0) {
      return { frameIndex, rollIndex: rollIndex - 1 };
    }

    if (frameIndex > 0) {
      const prevFrameIndex = frameIndex - 1;
      const prevRollIndex = prevFrameIndex === 9 ? 2 : 1;
      return { frameIndex: prevFrameIndex, rollIndex: prevRollIndex };
    }

    return null;
  };

  const handleRollEntry = (frameIndex: number, rollIndex: number, rawValue: string) => {
    setFrames((currentFrames) => {
      const nextFrames = applyRollEntry(currentFrames, frameIndex, rollIndex, rawValue);
      const nextFrame = nextFrames[frameIndex];

      let nextFocus: { frameIndex: number; rollIndex: number } | null = null;

      if (frameIndex < 9) {
        const strike = isStrikeFrame(nextFrame, frameIndex);
        const complete = isFrameComplete(nextFrame, frameIndex);
        const first = normalizeRollValue(nextFrame.rolls[0] ?? '');

        if (strike || complete) {
          if (frameIndex < 9) {
            nextFocus = { frameIndex: frameIndex + 1, rollIndex: 0 };
          }
        } else if (rollIndex === 0 && first !== '') {
          nextFocus = { frameIndex, rollIndex: 1 };
        }
      } else {
        const complete = isFrameComplete(nextFrame, frameIndex);

        if (!complete) {
          if (rollIndex === 0) {
            nextFocus = { frameIndex, rollIndex: 1 };
          } else if (rollIndex === 1) {
            nextFocus = { frameIndex, rollIndex: 2 };
          }
        }
      }

      pendingFocusRef.current = nextFocus;
      return nextFrames;
    });
  };

  const handleBackspace = (frameIndex: number, rollIndex: number) => {
    const currentDisplayValue = getDisplayRoll(frames[frameIndex], frameIndex, rollIndex);

    // If current box is already empty, jump to previous box
    if ((currentDisplayValue ?? '') === '') {
      const prev = getPrevPosition(frameIndex, rollIndex);
      if (prev) {
        queueFocus(prev.frameIndex, prev.rollIndex);
      }
      return;
    }

    // If current box has content, clearing is handled by TextInput itself.
    // A second backspace on the now-empty box will move focus to previous.
  };

  const handleKeyPress = (key: string, frameIndex: number, rollIndex: number) => {
    const leftKeys = ['ArrowLeft', 'Left'];
    const rightKeys = ['ArrowRight', 'Right'];

    if (key === 'Backspace') {
      handleBackspace(frameIndex, rollIndex);
      return;
    }

    if (rightKeys.includes(key)) {
      const maxRoll = frameIndex === 9 ? 2 : 1;
      if (rollIndex < maxRoll) {
        queueFocus(frameIndex, rollIndex + 1);
      } else if (frameIndex < 9) {
        queueFocus(frameIndex + 1, 0);
      }
    }

    if (leftKeys.includes(key)) {
      if (rollIndex > 0) {
        queueFocus(frameIndex, rollIndex - 1);
      } else if (frameIndex > 0) {
        const prevMaxRoll = frameIndex - 1 === 9 ? 2 : 1;
        queueFocus(frameIndex - 1, prevMaxRoll);
      }
    }
  };

  const reset = () => {
    pendingFocusRef.current = null;
    setFrames(initialFrames);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        focusInput(0, 0);
      });
    });
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        focusInput(0, 0);
      });
    });
  }, []);

  useEffect(() => {
    if (pendingFocusRef.current) {
      const { frameIndex, rollIndex } = pendingFocusRef.current;
      pendingFocusRef.current = null;
      queueFocus(frameIndex, rollIndex);
    }
  }, [frames]);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <Text style={styles.title}>Bowling Score Sheet</Text>
      <Text style={styles.subtitle}>Use X for strikes, / for spares, and 0 will display as -.</Text>

      <ScrollView horizontal contentContainerStyle={styles.sheetRow} showsHorizontalScrollIndicator={false}>
        {frames.map((frame, frameIndex) => {
          const isTenth = frameIndex === 9;

          return (
            <View
              key={frameIndex}
              style={[styles.frameBox, isTenth && styles.tenthFrameBox, frameIndex !== 0 && styles.frameDivider]}
            >
              <Text style={styles.frameNumber}>{frameLabel(frameIndex)}</Text>

              <View style={styles.frameTopRow}>
                <View style={styles.topRollsRow}>
                  <View style={styles.smallRollBox}>
                    <TextInput
                      ref={(el) => {
                        inputRefs.current[frameIndex][0] = el;
                      }}
                      style={styles.rollInput}
                      keyboardType="default"
                      autoCapitalize="characters"
                      value={getDisplayRoll(frame, frameIndex, 0)}
                      onChangeText={(text: string) => handleRollEntry(frameIndex, 0, text)}
                      onKeyPress={(e: any) => handleKeyPress(e.nativeEvent?.key, frameIndex, 0)}
                      placeholder=""
                      maxLength={1}
                    />
                  </View>

                  <View style={[styles.smallRollBox, styles.smallRollBoxRight]}>
                    <TextInput
                      ref={(el) => {
                        inputRefs.current[frameIndex][1] = el;
                      }}
                      style={styles.rollInput}
                      keyboardType="default"
                      autoCapitalize="characters"
                      value={getDisplayRoll(frame, frameIndex, 1)}
                      onChangeText={(text: string) => handleRollEntry(frameIndex, 1, text)}
                      onKeyPress={(e: any) => handleKeyPress(e.nativeEvent?.key, frameIndex, 1)}
                      placeholder=""
                      maxLength={1}
                    />
                  </View>
                </View>

                {isTenth ? (
                  <View style={styles.thirdRollBox}>
                    <TextInput
                      ref={(el) => {
                        inputRefs.current[frameIndex][2] = el;
                      }}
                      style={styles.rollInput}
                      keyboardType="default"
                      autoCapitalize="characters"
                      value={getDisplayRoll(frame, frameIndex, 2)}
                      onChangeText={(text: string) => handleRollEntry(frameIndex, 2, text)}
                      onKeyPress={(e: any) => handleKeyPress(e.nativeEvent?.key, frameIndex, 2)}
                      placeholder=""
                      maxLength={1}
                    />
                  </View>
                ) : null}
              </View>

              <View style={styles.frameScoreBox}>
                <Text style={styles.frameScoreText}>{frameScores[frameIndex]?.cumulative ?? ''}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Score</Text>
        <Text style={styles.summaryValue}>{validationMessage ? '--' : total}</Text>
        {validationMessage ? <Text style={styles.validation}>{validationMessage}</Text> : null}
      </View>

      <TouchableOpacity onPress={reset} style={styles.button} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Reset Sheet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  pageContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 16,
    color: '#475569',
  },
  sheetRow: {
    paddingVertical: 0,
    alignItems: 'flex-start',
    gap: 0,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 6,
    overflow: 'hidden',
  },
  frameBox: {
    width: 80,
    backgroundColor: '#ffffff',
    paddingHorizontal: 0,
    paddingTop: 6,
    paddingBottom: 8,
  },
  tenthFrameBox: {
    width: 108,
  },
  frameNumber: {
    width: '100%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 0,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  frameTopRow: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    paddingTop: 4,
    paddingBottom: 4,
  },
  topRollsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
    gap: 0,
  },
  smallRollBoxRight: {
    marginLeft: 0,
    borderLeftWidth: 1,
    borderLeftColor: '#1f2937',
    borderRightWidth: 1,
    borderRightColor: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  smallRollBox: {
    width: 28,
    height: 36,
    borderTopWidth: 0,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameDivider: {
    borderLeftWidth: 1,
    borderLeftColor: '#1f2937',
  },
  thirdRollBox: {
    width: 28,
    height: 36,
    borderTopWidth: 0,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 0,
  },
  rollInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  frameScoreBox: {
    marginTop: 0,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    marginHorizontal: 0,
    width: '100%',
  },
  frameScoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  summaryCard: {
    marginTop: 20,
    padding: 18,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  validation: {
    marginTop: 10,
    color: '#b91c1c',
    fontWeight: '600',
  },
  button: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});

export default ScoreSheet;