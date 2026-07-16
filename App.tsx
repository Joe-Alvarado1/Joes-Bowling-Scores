import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import ScoreSheet from './src/components/ScoreSheet';

export default function App() {
  useEffect(() => {
    const doc = globalThis.document;
    if (doc) {
      doc.title = 'Bowling Scores';

      const themeMeta = doc.querySelector('meta[name="theme-color"]');
      if (themeMeta) {
        themeMeta.setAttribute('content', '#f5f7fb');
      }

      const appleMeta = doc.querySelector('meta[name="apple-mobile-web-app-capable"]');
      if (!appleMeta) {
        const meta = doc.createElement('meta');
        meta.setAttribute('name', 'apple-mobile-web-app-capable');
        meta.setAttribute('content', 'yes');
        doc.head.appendChild(meta);
      }

      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => undefined);
      }
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
