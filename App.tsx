import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import ScoreSheet from './src/components/ScoreSheet';

export default function App() {
  useEffect(() => {
    const doc = globalThis.document;
    if (doc) {
      doc.title = 'Bowling Score Sheet';
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScoreSheet />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
});
