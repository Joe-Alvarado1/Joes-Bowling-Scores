import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import styles from './ScoreSheet.module.css';
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

  const classNameProp = <P extends object>(className: string): P => ({ className } as unknown as P);

  return (
    <ScrollView {...classNameProp(styles.page)}>
      <View {...classNameProp(styles.pageContent)}>
        <Text {...classNameProp(styles.title)}>Bowling Score Sheet</Text>
        <Text {...classNameProp(styles.subtitle)}>Use X for strikes and / for spares, or enter pin counts.</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} {...classNameProp(styles.sheetRow)}>
          {frames.map((frame, frameIndex) => {
            const isTenth = frameIndex === 9;
            return (
              <View key={frameIndex} {...classNameProp(`${styles.frameBox} ${isTenth ? styles.tenthFrameBox : ''}`)}>
                <Text {...classNameProp(styles.frameNumber)}>{frameLabel(frameIndex)}</Text>
                <View {...classNameProp(styles.frameTopRow)}>
                  <View {...classNameProp(styles.topRollsRow)}>
                    <View {...classNameProp(styles.smallRollBox)}>
                      <TextInput
                        {...classNameProp(styles.rollInput)}
                        keyboardType="default"
                        autoCapitalize="characters"
                        value={getDisplayRoll(frame, frameIndex, 0)}
                        onChangeText={(text: string) => updateRoll(frameIndex, 0, text)}
                        placeholder=""
                        maxLength={1}
                      />
                    </View>
                    <View {...classNameProp(`${styles.smallRollBox} ${styles.smallRollBoxRight}`)}>
                      <TextInput
                        {...classNameProp(styles.rollInput)}
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
                    <View {...classNameProp(styles.thirdRollBox)}>
                      <TextInput
                        {...classNameProp(styles.rollInput)}
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
                <View {...classNameProp(styles.frameScoreBox)}>
                  <Text {...classNameProp(styles.frameScoreText)}>{frameScores[frameIndex]?.cumulative ?? ''}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View {...classNameProp(styles.summaryCard)}>
          <Text {...classNameProp(styles.summaryLabel)}>Total Score</Text>
          <Text {...classNameProp(styles.summaryValue)}>{validationMessage ? '--' : total}</Text>
          {validationMessage ? <Text {...classNameProp(styles.validation)}>{validationMessage}</Text> : null}
        </View>

        <TouchableOpacity onPress={reset} activeOpacity={0.8} {...classNameProp(styles.button)}>
          <Text {...classNameProp(styles.buttonText)}>Reset Sheet</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ScoreSheet;
