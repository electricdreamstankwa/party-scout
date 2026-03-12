import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// Note: For full map functionality install: npx expo install react-native-maps
// Then replace this placeholder with the full MapView implementation

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🗺️</Text>
      <Text style={styles.title}>Map View</Text>
      <Text style={styles.subtitle}>
        Run:{'\n'}
        <Text style={styles.code}>npx expo install react-native-maps</Text>
        {'\n'}to enable the interactive map with party pins.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  subtitle: { color: '#6B7280', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  code: { color: '#8B5CF6', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
});
