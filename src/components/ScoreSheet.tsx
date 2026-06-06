import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { calculateBowlingScore, validateFrames } from '../utils/scoring';
import { FrameInput } from '../types';
import { applyRollEntry } from './ScoreSheet.helpers';

const initialFrames: FrameInput[] = Array.from({ length: 10 }, (_, index) => ({
  rolls: index === 9 ? ['', '', ''] : ['', ''],
}));

const frameLabel = (index: number) => `${index + 1}`;

const isStrikeFrame = (frame: FrameInput, frameIndex: number) => {
  return frameIndex < 9 && frame.rolls[1]?.toUpperCase() === 'X' && !frame.rolls[0]?.trim();
};

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
  const validationMessage = useMemo(() => validateFrames(frames), [frames]);
  const { total, frameScores } = useMemo(() => calculateBowlingScore(frames), [frames]);

  const updateRoll = (frameIndex: number, rollIndex: number, value: string) => {
    setFrames((currentFrames) => applyRollEntry(currentFrames, frameIndex, rollIndex, value));
  };

  const reset = () => {
    setFrames(initialFrames);
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <Text style={styles.title}>Bowling Score Sheet</Text>
      <Text style={styles.subtitle}>Use X for strikes and / for spares, or enter pin counts.</Text>

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
                      style={styles.rollInput}
                      keyboardType="default"
                      autoCapitalize="characters"
                      value={getDisplayRoll(frame, frameIndex, 0)}
                      onChangeText={(text: string) => updateRoll(frameIndex, 0, text)}
                      placeholder=""
                      maxLength={1}
                    />
                  </View>
                  <View style={[styles.smallRollBox, styles.smallRollBoxRight]}>
                    <TextInput
                      style={styles.rollInput}
                      keyboardType="default"
                      autoCapitalize="characters"
                      value={getDisplayRoll(frame, frameIndex, 1)}
                      onChangeText={(text: string) => updateRoll(frameIndex, 1, text)}
                      placeholder=""
                      maxLength={1}
                    />
                  </View>
                </View>
                {isTenth ? (
                  <View style={styles.thirdRollBox}>
                    <TextInput
                      style={styles.rollInput}
                      keyboardType="default"
                      autoCapitalize="characters"
                      value={getDisplayRoll(frame, frameIndex, 2)}
                      onChangeText={(text: string) => updateRoll(frameIndex, 2, text)}
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
  /* frameDivider removed; vertical lines come from inner roll box borders */
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
